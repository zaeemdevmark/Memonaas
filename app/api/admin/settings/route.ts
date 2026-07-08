import type { NextRequest } from "next/server";
import { auth }             from "@/auth";
import { ok, err }          from "@/lib/api/response";
import prisma               from "@/lib/prisma";
import { handlePrismaError, DatabaseError } from "@/lib/db/errors";

async function getAdminId(): Promise<string | null> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "Admin") return null;
  return session.user.id;
}

export async function GET(): Promise<Response> {
  if (!await getAdminId()) return err("Unauthorized", 401);

  try {
    const settings = await prisma.siteSettings.upsert({
      where:  { id: "default" },
      create: { id: "default" },
      update: {},
    });
    return ok(settings);
  } catch (error) {
    try { handlePrismaError(error); } catch (mapped: unknown) {
      if (mapped instanceof DatabaseError) return err(mapped.message, 503);
    }
    return err("Failed to load settings", 500);
  }
}

export async function PUT(request: NextRequest): Promise<Response> {
  if (!await getAdminId()) return err("Unauthorized", 401);

  let body: Record<string, unknown>;
  try { body = await request.json(); }
  catch { return err("Invalid JSON", 400); }

  const data: {
    storeName?:  string; storeEmail?: string; storePhone?: string;
    storeAddress?: string; currency?: string; timezone?: string;
    freeThreshold?: number; standardCost?: number; expressCost?: number;
    taxEnabled?: boolean; taxPercentage?: number;
    notifNewOrder?: boolean; notifOrderShipped?: boolean; notifOrderDelivered?: boolean;
  } = {};

  if (typeof body.storeName    === "string") data.storeName    = body.storeName.trim();
  if (typeof body.storeEmail   === "string") data.storeEmail   = body.storeEmail.trim();
  if (typeof body.storePhone   === "string") data.storePhone   = body.storePhone.trim();
  if (typeof body.storeAddress === "string") data.storeAddress = body.storeAddress.trim();
  if (typeof body.currency     === "string") data.currency     = body.currency.trim();
  if (typeof body.timezone     === "string") data.timezone     = body.timezone.trim();

  if (typeof body.freeThreshold === "number") data.freeThreshold = Math.max(0, Math.round(body.freeThreshold));
  if (typeof body.standardCost  === "number") data.standardCost  = Math.max(0, Math.round(body.standardCost));
  if (typeof body.expressCost   === "number") data.expressCost   = Math.max(0, Math.round(body.expressCost));

  if (typeof body.taxEnabled    === "boolean") data.taxEnabled    = body.taxEnabled;
  if (typeof body.taxPercentage === "number")  data.taxPercentage = Math.max(0, body.taxPercentage);

  if (typeof body.notifNewOrder       === "boolean") data.notifNewOrder       = body.notifNewOrder;
  if (typeof body.notifOrderShipped   === "boolean") data.notifOrderShipped   = body.notifOrderShipped;
  if (typeof body.notifOrderDelivered === "boolean") data.notifOrderDelivered = body.notifOrderDelivered;

  try {
    const settings = await prisma.siteSettings.upsert({
      where:  { id: "default" },
      create: { id: "default", ...data },
      update: data,
    });
    return ok(settings);
  } catch (error) {
    try { handlePrismaError(error); } catch (mapped: unknown) {
      if (mapped instanceof DatabaseError) return err(mapped.message, 503);
    }
    return err("Failed to save settings", 500);
  }
}
