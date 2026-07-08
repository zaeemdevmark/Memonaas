import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";

export interface LowStockVariantDTO {
  productName: string;
  category:    string;
  sku:         string;
  available:   number;
  level:       "Critical" | "Low";
}

export interface AdminStatsDTO {
  totalRevenue:     number;
  todayRevenue:     number;
  monthlyRevenue:   number;
  totalOrders:      number;
  pendingOrders:    number;
  processingOrders: number;
  shippedOrders:    number;
  deliveredOrders:  number;
  cancelledOrders:  number;
  totalCustomers:   number;
  totalProducts:    number;
  lowStockCount:    number;
  lowStockItems:    LowStockVariantDTO[];
}

export async function getAdminStats(): Promise<AdminStatsDTO> {
  const now        = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    totalRevenueAgg,
    todayRevenueAgg,
    monthlyRevenueAgg,
    statusCounts,
    totalCustomers,
    totalProducts,
    lowStockVariants,
  ] = await Promise.all([
    prisma.order.aggregate({
      where: { status: "Delivered" },
      _sum:  { total: true },
    }),
    prisma.order.aggregate({
      where: { createdAt: { gte: todayStart }, status: { not: "Cancelled" } },
      _sum:  { total: true },
    }),
    prisma.order.aggregate({
      where: { createdAt: { gte: monthStart }, status: { not: "Cancelled" } },
      _sum:  { total: true },
    }),
    prisma.order.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.customer.count(),
    prisma.product.count({ where: { status: "Active" } }),
    prisma.productVariant.findMany({
      where: {
        stock: { gt: 0 },
      },
      select: {
        sku:              true,
        stock:            true,
        reservedStock:    true,
        lowStockThreshold: true,
        product: {
          select: {
            name:     true,
            category: { select: { name: true } },
          },
        },
      },
      orderBy: { stock: "asc" },
      take:    100,
    }),
  ]);

  // Filter client-side since Prisma can't do `stock - reservedStock <= threshold` in where
  const lowItems = lowStockVariants
    .filter((v) => (v.stock - v.reservedStock) <= v.lowStockThreshold)
    .slice(0, 10)
    .map((v) => {
      const available = v.stock - v.reservedStock;
      return {
        productName: v.product.name,
        category:    v.product.category.name,
        sku:         v.sku,
        available,
        level:       (available === 0 ? "Critical" : "Low") as "Critical" | "Low",
      };
    });

  const statusMap = Object.fromEntries(
    statusCounts.map((s) => [s.status, s._count._all]),
  );

  return {
    totalRevenue:     totalRevenueAgg._sum.total?.toNumber()   ?? 0,
    todayRevenue:     todayRevenueAgg._sum.total?.toNumber()   ?? 0,
    monthlyRevenue:   monthlyRevenueAgg._sum.total?.toNumber() ?? 0,
    totalOrders:      statusCounts.reduce((s, r) => s + r._count._all, 0),
    pendingOrders:    statusMap["Pending"]    ?? 0,
    processingOrders: statusMap["Processing"] ?? 0,
    shippedOrders:    statusMap["Shipped"]    ?? 0,
    deliveredOrders:  statusMap["Delivered"]  ?? 0,
    cancelledOrders:  statusMap["Cancelled"]  ?? 0,
    totalCustomers,
    totalProducts,
    lowStockCount:    lowItems.length,
    lowStockItems:    lowItems,
  };
}
