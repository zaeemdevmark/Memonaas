import prisma from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

// ── Period helpers ─────────────────────────────────────────────────

export type AnalyticsPeriod = "today" | "7days" | "30days" | "12months";

interface PeriodBounds {
  start:     Date;
  end:       Date;
  prevStart: Date;
  prevEnd:   Date;
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function subDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() - n);
  return r;
}

function subMonths(d: Date, n: number): Date {
  const r = new Date(d);
  r.setMonth(r.getMonth() - n);
  return r;
}

function getPeriodBounds(period: AnalyticsPeriod, now: Date): PeriodBounds {
  const today = startOfDay(now);
  const end   = now;

  switch (period) {
    case "today": {
      const start     = today;
      const prevStart = subDays(today, 1);
      const prevEnd   = today;
      return { start, end, prevStart, prevEnd };
    }
    case "7days": {
      const start     = subDays(today, 7);
      const prevStart = subDays(today, 14);
      const prevEnd   = start;
      return { start, end, prevStart, prevEnd };
    }
    case "30days": {
      const start     = subDays(today, 30);
      const prevStart = subDays(today, 60);
      const prevEnd   = start;
      return { start, end, prevStart, prevEnd };
    }
    case "12months": {
      const start     = subMonths(today, 12);
      const prevStart = subMonths(today, 24);
      const prevEnd   = start;
      return { start, end, prevStart, prevEnd };
    }
  }
}

// ── Chart bucket builders ──────────────────────────────────────────

const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const DAY_NAMES   = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

interface ChartData {
  chartLabels:  string[];
  revenueChart: number[];
  ordersChart:  number[];
}

type LeanOrder = {
  createdAt: Date;
  status:    string;
  total:     Prisma.Decimal;
};

function buildChartData(
  period:   AnalyticsPeriod,
  orders:   LeanOrder[],
  now:      Date,
  today:    Date,
): ChartData {
  const nonCancelled = orders.filter(o => o.status !== "Cancelled");

  switch (period) {

    // 8 three-hour buckets: 12AM → 9PM
    case "today": {
      const labels  = ["12AM","3AM","6AM","9AM","12PM","3PM","6PM","9PM"];
      const revenue = new Array<number>(8).fill(0);
      const count   = new Array<number>(8).fill(0);
      for (const o of nonCancelled) {
        const h  = new Date(o.createdAt).getHours();
        const bi = Math.min(Math.floor(h / 3), 7);
        revenue[bi] += o.total.toNumber();
        count[bi]++;
      }
      return { chartLabels: labels, revenueChart: revenue, ordersChart: count };
    }

    // 7 daily buckets
    case "7days": {
      const labels: string[] = [];
      const revenue = new Array<number>(7).fill(0);
      const count   = new Array<number>(7).fill(0);
      for (let i = 6; i >= 0; i--) {
        const d = subDays(today, i);
        labels.push(DAY_NAMES[d.getDay()]);
      }
      for (const o of nonCancelled) {
        const d = startOfDay(new Date(o.createdAt));
        const diffMs   = today.getTime() - d.getTime();
        const diffDays = Math.round(diffMs / 86400000);
        const bi       = 6 - diffDays;
        if (bi >= 0 && bi < 7) {
          revenue[bi] += o.total.toNumber();
          count[bi]++;
        }
      }
      return { chartLabels: labels, revenueChart: revenue, ordersChart: count };
    }

    // 6 five-day buckets (≈ weekly, fits 30 days in 6 columns)
    case "30days": {
      const BUCKETS = 6;
      const labels: string[] = [];
      const revenue = new Array<number>(BUCKETS).fill(0);
      const count   = new Array<number>(BUCKETS).fill(0);
      const BUCKET_DAYS = 5;

      for (let i = BUCKETS - 1; i >= 0; i--) {
        const start = subDays(today, (i + 1) * BUCKET_DAYS);
        labels.push(
          `${MONTH_NAMES[start.getMonth()]} ${start.getDate()}`
        );
      }

      for (const o of nonCancelled) {
        const d = startOfDay(new Date(o.createdAt));
        const diffDays = Math.round((today.getTime() - d.getTime()) / 86400000);
        if (diffDays > 30) continue;
        const bi = BUCKETS - 1 - Math.floor(diffDays / BUCKET_DAYS);
        if (bi >= 0 && bi < BUCKETS) {
          revenue[bi] += o.total.toNumber();
          count[bi]++;
        }
      }
      return { chartLabels: labels, revenueChart: revenue, ordersChart: count };
    }

    // 12 monthly buckets
    case "12months": {
      const labels: string[] = [];
      const revenue = new Array<number>(12).fill(0);
      const count   = new Array<number>(12).fill(0);

      for (let i = 11; i >= 0; i--) {
        const d = subMonths(today, i);
        labels.push(MONTH_NAMES[d.getMonth()]);
      }

      for (const o of nonCancelled) {
        const d        = new Date(o.createdAt);
        const diffMs   = today.getTime() - new Date(d.getFullYear(), d.getMonth(), 1).getTime();
        const diffMths = Math.round(diffMs / (30.44 * 86400000));
        const bi       = 11 - diffMths;
        if (bi >= 0 && bi < 12) {
          revenue[bi] += o.total.toNumber();
          count[bi]++;
        }
      }
      return { chartLabels: labels, revenueChart: revenue, ordersChart: count };
    }
  }
}

// ── Trend helper ───────────────────────────────────────────────────

function trendPct(curr: number, prev: number): number {
  if (prev === 0) return curr > 0 ? 100 : 0;
  return Math.round(((curr - prev) / prev) * 1000) / 10;
}

// ── DTO ────────────────────────────────────────────────────────────

export interface TopProductDTO {
  name:     string;
  category: string;
  units:    number;
  revenue:  number;
}

export interface RecentOrderDTO {
  orderNumber: string;
  shipName:    string;
  shipEmail:   string;
  status:      string;
  total:       number;
  createdAt:   string;
}

export interface CategoryStatDTO {
  name:    string;
  revenue: number;
  share:   number;
}

export interface MostWishlistedDTO {
  name:     string;
  category: string;
  count:    number;
}

export interface AnalyticsDTO {
  period: string;

  // Revenue
  revenue:      number;
  revenueTrend: number;

  // Orders
  orders:       number;
  ordersTrend:  number;
  ordersByStatus: {
    Pending:    number;
    Processing: number;
    Shipped:    number;
    Delivered:  number;
    Cancelled:  number;
  };

  // Customers
  newCustomers:        number;
  newCustomersTrend:   number;
  totalCustomers:      number;
  registeredCustomers: number;
  guestCustomers:      number;

  // AOV
  aov:      number;
  aovTrend: number;

  // Products
  totalActiveProducts: number;
  outOfStockProducts:  number;
  lowStockProducts:    number;

  // Charts
  chartLabels:  string[];
  revenueChart: number[];
  ordersChart:  number[];

  // Tables
  topProducts:     TopProductDTO[];
  recentOrders:    RecentOrderDTO[];
  salesByCategory: CategoryStatDTO[];
  mostWishlisted:  MostWishlistedDTO[];
}

// ── Main service function ──────────────────────────────────────────

export async function getAnalytics(period: AnalyticsPeriod): Promise<AnalyticsDTO> {
  const now   = new Date();
  const today = startOfDay(now);
  const b     = getPeriodBounds(period, now);

  // ── Parallel queries ────────────────────────────────────────────
  const [
    currentOrders,
    prevOrdersRaw,
    totalCustomers,
    newCustomers,
    prevNewCustomers,
    registeredCustomers,
    guestCustomers,
    totalActiveProducts,
    variantStats,
    recentOrdersRaw,
    mostWishlistedRaw,
  ] = await Promise.all([

    // Full order details for current period (charts, products, categories)
    prisma.order.findMany({
      where: { createdAt: { gte: b.start } },
      select: {
        id:          true,
        orderNumber: true,
        status:      true,
        total:       true,
        createdAt:   true,
        shipName:    true,
        shipEmail:   true,
        items: {
          select: {
            productId:   true,
            productName: true,
            quantity:    true,
            lineTotal:   true,
            product: {
              select: {
                category: { select: { name: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),

    // Previous period (lean — for trend only)
    prisma.order.findMany({
      where: { createdAt: { gte: b.prevStart, lt: b.start } },
      select: { status: true, total: true },
    }),

    // Customer counts
    prisma.customer.count(),
    prisma.customer.count({ where: { createdAt: { gte: b.start } } }),
    prisma.customer.count({ where: { createdAt: { gte: b.prevStart, lt: b.start } } }),
    prisma.customer.count({ where: { userId: { not: null } } }),
    prisma.customer.count({ where: { userId: null } }),

    // Product counts
    prisma.product.count({ where: { status: "Active" } }),

    // Variant stock for out-of-stock / low-stock calculation
    prisma.productVariant.findMany({
      where:  { product: { status: "Active" } },
      select: { stock: true, reservedStock: true, lowStockThreshold: true },
    }),

    // Most recent 8 orders (all time — not period-constrained)
    prisma.order.findMany({
      select: {
        orderNumber: true,
        status:      true,
        total:       true,
        createdAt:   true,
        shipName:    true,
        shipEmail:   true,
      },
      orderBy: { createdAt: "desc" },
      take:    8,
    }),

    // Most-wishlisted products (all time — not period-constrained)
    prisma.product.findMany({
      where:   { wishlistItems: { some: {} } },
      select: {
        name:     true,
        category: { select: { name: true } },
        _count:   { select: { wishlistItems: true } },
      },
      orderBy: { wishlistItems: { _count: "desc" } },
      take:    5,
    }),
  ]);

  // ── Revenue & order metrics ─────────────────────────────────────

  const nonCancelled     = currentOrders.filter(o => o.status !== "Cancelled");
  const prevNonCancelled = prevOrdersRaw.filter(o => o.status !== "Cancelled");

  const revenue     = nonCancelled.reduce((s, o) => s + o.total.toNumber(), 0);
  const prevRevenue = prevNonCancelled.reduce((s, o) => s + o.total.toNumber(), 0);

  const orders      = currentOrders.length;
  const prevOrders  = prevOrdersRaw.length;

  const aov     = nonCancelled.length > 0 ? revenue / nonCancelled.length : 0;
  const prevAov = prevNonCancelled.length > 0
    ? prevRevenue / prevNonCancelled.length
    : 0;

  // ── Order status breakdown ──────────────────────────────────────

  const statusCounts = {
    Pending:    0,
    Processing: 0,
    Shipped:    0,
    Delivered:  0,
    Cancelled:  0,
  };
  for (const o of currentOrders) {
    if (o.status in statusCounts) {
      (statusCounts as Record<string, number>)[o.status]++;
    }
  }

  // ── Product inventory stats ─────────────────────────────────────

  let outOfStockProducts = 0;
  let lowStockProducts   = 0;
  for (const v of variantStats) {
    const available = v.stock - v.reservedStock;
    if (available <= 0)                                      outOfStockProducts++;
    else if (available > 0 && available <= v.lowStockThreshold) lowStockProducts++;
  }

  // ── Top products ────────────────────────────────────────────────

  const productAgg = new Map<string, TopProductDTO>();
  for (const o of nonCancelled) {
    for (const item of o.items) {
      const key     = item.productId;
      const current = productAgg.get(key) ?? {
        name:     item.productName,
        category: item.product.category.name,
        units:    0,
        revenue:  0,
      };
      current.units   += item.quantity;
      current.revenue += item.lineTotal.toNumber();
      productAgg.set(key, current);
    }
  }
  const topProducts = [...productAgg.values()]
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // ── Sales by category ───────────────────────────────────────────

  const catAgg = new Map<string, number>();
  for (const o of nonCancelled) {
    for (const item of o.items) {
      const cat = item.product.category.name;
      catAgg.set(cat, (catAgg.get(cat) ?? 0) + item.lineTotal.toNumber());
    }
  }
  const totalCatRevenue = [...catAgg.values()].reduce((s, v) => s + v, 0);
  const salesByCategory: CategoryStatDTO[] = [...catAgg.entries()]
    .map(([name, rev]) => ({
      name,
      revenue: rev,
      share:   totalCatRevenue > 0 ? Math.round((rev / totalCatRevenue) * 1000) / 10 : 0,
    }))
    .sort((a, b) => b.revenue - a.revenue);

  // ── Most-wishlisted products ────────────────────────────────────

  const mostWishlisted: MostWishlistedDTO[] = mostWishlistedRaw.map(p => ({
    name:     p.name,
    category: p.category.name,
    count:    p._count.wishlistItems,
  }));

  // ── Chart data ──────────────────────────────────────────────────

  const { chartLabels, revenueChart, ordersChart } = buildChartData(
    period,
    currentOrders,
    now,
    today,
  );

  // ── Recent orders ───────────────────────────────────────────────

  const recentOrders: RecentOrderDTO[] = recentOrdersRaw.map(o => ({
    orderNumber: o.orderNumber,
    shipName:    o.shipName,
    shipEmail:   o.shipEmail,
    status:      o.status,
    total:       o.total.toNumber(),
    createdAt:   o.createdAt.toISOString(),
  }));

  // ── Assemble DTO ────────────────────────────────────────────────

  return {
    period,
    revenue,
    revenueTrend:        trendPct(revenue, prevRevenue),
    orders,
    ordersTrend:         trendPct(orders, prevOrders),
    ordersByStatus:      statusCounts,
    newCustomers,
    newCustomersTrend:   trendPct(newCustomers, prevNewCustomers),
    totalCustomers,
    registeredCustomers,
    guestCustomers,
    aov,
    aovTrend:            trendPct(aov, prevAov),
    totalActiveProducts,
    outOfStockProducts,
    lowStockProducts,
    chartLabels,
    revenueChart,
    ordersChart,
    topProducts,
    recentOrders,
    salesByCategory,
    mostWishlisted,
  };
}
