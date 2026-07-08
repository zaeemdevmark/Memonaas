import prisma from "@/lib/prisma";
import type { CustomerSummaryDTO, CustomerDetailDTO } from "@/lib/types/customer";

export class CustomerError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = "CustomerError";
  }
}

// ── getOrCreateCustomer ──────────────────────────────────────────────────────
// Called on every checkout — finds the customer record for this email or creates
// one if none exists. The same record is reused for all future orders.

export async function getOrCreateCustomer(
  email:  string,
  name:   string,
  phone?: string,
): Promise<{ id: string }> {
  const normalised = email.trim().toLowerCase();

  const existing = await prisma.customer.findUnique({
    where:  { email: normalised },
    select: { id: true },
  });

  if (existing) {
    await prisma.customer.update({
      where: { email: normalised },
      data: {
        name: name.trim(),
        ...(phone ? { phone: phone.trim() } : {}),
      },
    });
    return existing;
  }

  return prisma.customer.create({
    data: {
      email: normalised,
      name:  name.trim(),
      ...(phone ? { phone: phone.trim() } : {}),
    },
    select: { id: true },
  });
}

// ── searchCustomers (admin) ───────────────────────────────────────────────────

export interface SearchCustomersResult {
  customers: CustomerSummaryDTO[];
  total:     number;
}

export async function searchCustomers(
  search: string,
  page:   number,
  limit:  number,
): Promise<SearchCustomersResult> {
  const trimmed = search.trim();
  const where = trimmed
    ? {
        OR: [
          { email: { contains: trimmed, mode: "insensitive" as const } },
          { name:  { contains: trimmed, mode: "insensitive" as const } },
          { phone: { contains: trimmed, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [rows, total] = await Promise.all([
    prisma.customer.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip:    (page - 1) * limit,
      take:    limit,
      select: {
        id:        true,
        email:     true,
        name:      true,
        phone:     true,
        userId:    true,
        createdAt: true,
        orders: {
          select:  { total: true, createdAt: true },
          orderBy: { createdAt: "desc" },
        },
      },
    }),
    prisma.customer.count({ where }),
  ]);

  return {
    customers: rows.map((c) => {
      const totalSpent  = c.orders.reduce((s, o) => s + o.total.toNumber(), 0);
      const lastOrderAt = c.orders[0]?.createdAt.toISOString() ?? null;
      return {
        id:           c.id,
        email:        c.email,
        name:         c.name,
        phone:        c.phone,
        totalOrders:  c.orders.length,
        totalSpent,
        lastOrderAt,
        isRegistered: c.userId !== null,
        createdAt:    c.createdAt.toISOString(),
      };
    }),
    total,
  };
}

// ── getCustomerDetail (admin) ─────────────────────────────────────────────────

export async function getCustomerDetail(id: string): Promise<CustomerDetailDTO | null> {
  const c = await prisma.customer.findUnique({
    where: { id },
    select: {
      id:        true,
      email:     true,
      name:      true,
      phone:     true,
      userId:    true,
      createdAt: true,
      orders: {
        select: {
          id:          true,
          orderNumber: true,
          status:      true,
          total:       true,
          items:       { select: { quantity: true } },
          createdAt:   true,
        },
        orderBy: { createdAt: "desc" },
        take:    50,
      },
      addresses: {
        select: {
          id: true, label: true, fullName: true, phone: true,
          street: true, city: true, province: true,
          postalCode: true, country: true, isDefault: true,
        },
        orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
      },
    },
  });

  if (!c) return null;

  const totalSpent    = c.orders.reduce((s, o) => s + o.total.toNumber(), 0);
  const totalOrders   = c.orders.length;
  const avgOrderValue = totalOrders > 0 ? totalSpent / totalOrders : null;
  const lastOrderAt   = c.orders[0]?.createdAt.toISOString() ?? null;

  return {
    id:           c.id,
    email:        c.email,
    name:         c.name,
    phone:        c.phone,
    isRegistered: c.userId !== null,
    totalOrders,
    totalSpent,
    avgOrderValue,
    lastOrderAt,
    createdAt:    c.createdAt.toISOString(),
    orders: c.orders.map((o) => ({
      id:          o.id,
      orderNumber: o.orderNumber,
      status:      o.status,
      total:       o.total.toNumber(),
      totalItems:  o.items.reduce((s, i) => s + i.quantity, 0),
      createdAt:   o.createdAt.toISOString(),
    })),
    addresses: c.addresses.map((a) => ({
      id:         a.id,
      label:      a.label,
      fullName:   a.fullName,
      phone:      a.phone,
      street:     a.street,
      city:       a.city,
      province:   a.province,
      postalCode: a.postalCode,
      country:    a.country,
      isDefault:  a.isDefault,
    })),
  };
}

// ── getRecentCustomers (admin dashboard) ─────────────────────────────────────

export async function getRecentCustomers(limit = 5): Promise<CustomerSummaryDTO[]> {
  const rows = await prisma.customer.findMany({
    orderBy: { createdAt: "desc" },
    take:    limit,
    select: {
      id:        true,
      email:     true,
      name:      true,
      phone:     true,
      userId:    true,
      createdAt: true,
      orders:    { select: { total: true, createdAt: true }, orderBy: { createdAt: "desc" } },
    },
  });

  return rows.map((c) => ({
    id:           c.id,
    email:        c.email,
    name:         c.name,
    phone:        c.phone,
    totalOrders:  c.orders.length,
    totalSpent:   c.orders.reduce((s, o) => s + o.total.toNumber(), 0),
    lastOrderAt:  c.orders[0]?.createdAt.toISOString() ?? null,
    isRegistered: c.userId !== null,
    createdAt:    c.createdAt.toISOString(),
  }));
}
