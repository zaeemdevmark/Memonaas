import type { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { ok, err } from "@/lib/api/response";

export interface TrackOrderDTO {
  orderNumber:    string;
  status:         string;
  createdAt:      string;
  shipName:       string;
  shipStreet:     string;
  shipCity:       string;
  shipProvince:   string;
  shipPostalCode: string;
  shipCountry:    string;
  total:          number;
  totalItems:     number;
  paymentMethod:  string | null;
  paymentStatus:  string | null;
  statusHistory:  { status: string; createdAt: string; note: string | null }[];
}

export async function POST(req: NextRequest): Promise<Response> {
  let body: { orderNumber?: string; email?: string };
  try { body = await req.json(); }
  catch { return err("Invalid request body", 400); }

  const rawOrderNumber = body.orderNumber?.trim() ?? "";
  const rawEmail       = body.email?.trim() ?? "";

  if (!rawOrderNumber) return err("Order number is required", 400);
  if (!rawEmail)       return err("Email address is required", 400);

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!EMAIL_RE.test(rawEmail)) return err("Please enter a valid email address", 400);

  try {
    const order = await prisma.order.findFirst({
      where: {
        orderNumber: { equals: rawOrderNumber, mode: "insensitive" },
        shipEmail:   { equals: rawEmail,       mode: "insensitive" },
      },
      select: {
        orderNumber:    true,
        status:         true,
        createdAt:      true,
        shipName:       true,
        shipStreet:     true,
        shipCity:       true,
        shipProvince:   true,
        shipPostalCode: true,
        shipCountry:    true,
        total:          true,
        payment:        { select: { method: true, status: true } },
        items:          { select: { quantity: true } },
        statusHistory:  { select: { status: true, createdAt: true, note: true }, orderBy: { createdAt: "asc" } },
      },
    });

    if (!order) {
      return err("No order found matching the provided order number and email address.", 404);
    }

    const result: TrackOrderDTO = {
      orderNumber:    order.orderNumber,
      status:         order.status,
      createdAt:      order.createdAt.toISOString(),
      shipName:       order.shipName,
      shipStreet:     order.shipStreet,
      shipCity:       order.shipCity,
      shipProvince:   order.shipProvince,
      shipPostalCode: order.shipPostalCode,
      shipCountry:    order.shipCountry,
      total:          order.total.toNumber(),
      totalItems:     order.items.reduce((s, i) => s + i.quantity, 0),
      paymentMethod:  order.payment?.method ?? null,
      paymentStatus:  order.payment?.status ?? null,
      statusHistory:  order.statusHistory.map((h) => ({
        status:    h.status,
        createdAt: h.createdAt.toISOString(),
        note:      h.note,
      })),
    };

    return ok(result);
  } catch (error) {
    console.error("[track-order] query failed:", error);
    return err("Unable to retrieve order at this time. Please try again later.", 500);
  }
}
