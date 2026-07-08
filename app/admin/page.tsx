"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { adminSignOutAction } from "@/lib/actions/auth";
import type { AdminStatsDTO } from "@/lib/services/admin.service";
import type { CustomerSummaryDTO } from "@/lib/types/customer";
import type { AdminOrderSummaryDTO } from "@/lib/types/order";

// ── Dynamic admin section imports ─────────────────────────────────

function SectionSkeleton() {
  return (
    <div className="space-y-3 pt-2">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className={`animate-pulse bg-slate-200 rounded-xl ${i === 0 ? "h-8 w-52 mb-2" : "h-11"}`} />
      ))}
    </div>
  );
}

const ProductsSection   = dynamic(() => import("@/components/admin/ProductsSection"),   { ssr: false, loading: () => <SectionSkeleton /> });
const OrdersSection     = dynamic(() => import("@/components/admin/OrdersSection"),     { ssr: false, loading: () => <SectionSkeleton /> });
const CategoriesSection = dynamic(() => import("@/components/admin/CategoriesSection"), { ssr: false, loading: () => <SectionSkeleton /> });
const CustomersSection  = dynamic(() => import("@/components/admin/CustomersSection"),  { ssr: false, loading: () => <SectionSkeleton /> });
const AnalyticsSection  = dynamic(() => import("@/components/admin/AnalyticsSection"), { ssr: false, loading: () => <SectionSkeleton /> });
const SettingsSection   = dynamic(() => import("@/components/admin/SettingsSection"),  { ssr: false, loading: () => <SectionSkeleton /> });
const ReviewsSection    = dynamic(() => import("@/components/admin/ReviewsSection"),   { ssr: false, loading: () => <SectionSkeleton /> });

// ── Types ─────────────────────────────────────────────────────────

type AdminTab = "dashboard" | "products" | "categories" | "orders" | "customers" | "reviews" | "coupons" | "analytics" | "settings";

// ── Utilities ─────────────────────────────────────────────────────

function fp(n: number) { return `Rs. ${Math.round(n).toLocaleString("en-PK")}`; }
function inits(s: string) { return s.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2); }
function fdate(iso: string) { return new Date(iso).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" }); }

type OrderStatus = "Pending" | "Processing" | "Confirmed" | "Shipped" | "Delivered" | "Cancelled";
const STATUS_STYLE: Record<string, string> = {
  Pending:    "bg-slate-50  text-slate-600  ring-1 ring-slate-200",
  Processing: "bg-amber-50  text-amber-600  ring-1 ring-amber-200",
  Confirmed:  "bg-blue-50   text-blue-600   ring-1 ring-blue-200",
  Shipped:    "bg-violet-50 text-violet-600 ring-1 ring-violet-200",
  Delivered:  "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200",
  Cancelled:  "bg-red-50    text-red-500    ring-1 ring-red-200",
};

// ── Skeleton ──────────────────────────────────────────────────────

function Sk({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-slate-200 rounded-md ${className}`} />;
}

function SkeletonDashboard() {
  return (
    <div className="space-y-6">
      <div><Sk className="h-7 w-48 mb-2" /><Sk className="h-4 w-72" /></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
            <div className="flex justify-between"><Sk className="w-10 h-10 rounded-lg" /><Sk className="h-5 w-16" /></div>
            <Sk className="h-8 w-28" /><Sk className="h-3 w-20" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 space-y-3">
          <Sk className="h-5 w-36 mb-4" />
          {Array.from({ length: 6 }).map((_, i) => <Sk key={i} className="h-10 w-full" />)}
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
          <Sk className="h-5 w-32 mb-2" />
          {Array.from({ length: 6 }).map((_, i) => <Sk key={i} className="h-8 w-full" />)}
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {[0, 1].map((i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
            <Sk className="h-5 w-36 mb-2" />
            {Array.from({ length: 4 }).map((_, j) => <Sk key={j} className="h-12 w-full" />)}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Stat Card ─────────────────────────────────────────────────────

function StatCard({ label, value, sub, icon, iconBg, iconColor }: {
  label: string; value: string; sub?: string;
  icon: React.ReactNode; iconBg: string; iconColor: string;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconBg}`}>
          <div className={iconColor}>{icon}</div>
        </div>
        {sub && <span className="text-[11px] text-slate-500">{sub}</span>}
      </div>
      <p className="text-2xl font-semibold text-slate-800 tracking-tight mb-1">{value}</p>
      <p className="text-[12px] text-slate-600">{label}</p>
    </div>
  );
}

// ── Card wrapper ──────────────────────────────────────────────────

function Card({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <h3 className="text-[13px] font-semibold text-slate-800">{title}</h3>
        {action}
      </div>
      {children}
    </div>
  );
}

// ── Recent Orders ─────────────────────────────────────────────────

function RecentOrders({ orders, loading }: { orders: AdminOrderSummaryDTO[]; loading: boolean }) {
  return (
    <Card title="Recent Orders">
      {loading ? (
        <div className="p-5 space-y-3">{Array.from({ length: 5 }).map((_, i) => <Sk key={i} className="h-10 w-full" />)}</div>
      ) : orders.length === 0 ? (
        <div className="py-12 text-center text-[13px] text-slate-500">No orders yet</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {["Order", "Customer", "Status", "Amount", "Date"].map((h) => (
                  <th key={h} className="text-left text-[10px] tracking-[0.1em] uppercase text-slate-500 font-medium px-5 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map((o, i) => (
                <tr key={o.id} className={`border-b border-slate-50 hover:bg-slate-50 transition-colors ${i === orders.length - 1 ? "border-0" : ""}`}>
                  <td className="px-5 py-3.5 text-[12px] font-medium text-blue-600 whitespace-nowrap">#{o.orderNumber}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                        <span className="text-[10px] font-medium text-slate-600">{inits(o.shipName || o.customerEmail || "?")}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-[12px] text-slate-700 whitespace-nowrap truncate max-w-[140px]">{o.shipName || o.customerEmail || "Guest"}</p>
                        {o.customerEmail && o.shipName && (
                          <p className="text-[10px] text-slate-500 truncate max-w-[140px]">{o.customerEmail}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`text-[10px] tracking-[0.08em] uppercase px-2 py-1 rounded-full ${STATUS_STYLE[o.status] ?? "bg-slate-100 text-slate-600"}`}>{o.status}</span>
                  </td>
                  <td className="px-5 py-3.5 text-[12px] font-medium text-slate-700 whitespace-nowrap">{fp(o.total)}</td>
                  <td className="px-5 py-3.5 text-[12px] text-slate-500 whitespace-nowrap">{fdate(o.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

// ── Order Status Breakdown ────────────────────────────────────────

function OrderStatusBreakdown({ stats, loading }: { stats: AdminStatsDTO | null; loading: boolean }) {
  const rows = stats ? [
    { label: "Pending",    count: stats.pendingOrders,    color: "bg-slate-400" },
    { label: "Processing", count: stats.processingOrders, color: "bg-amber-400" },
    { label: "Shipped",    count: stats.shippedOrders,    color: "bg-violet-500" },
    { label: "Delivered",  count: stats.deliveredOrders,  color: "bg-emerald-500" },
    { label: "Cancelled",  count: stats.cancelledOrders,  color: "bg-red-400" },
  ] : [];

  return (
    <Card title="Orders by Status">
      {loading ? (
        <div className="p-5 space-y-3">{Array.from({ length: 5 }).map((_, i) => <Sk key={i} className="h-8 w-full" />)}</div>
      ) : (
        <div className="divide-y divide-slate-50">
          {rows.map((r) => (
            <div key={r.label} className="flex items-center gap-3 px-5 py-3.5">
              <div className={`w-2.5 h-2.5 rounded-full ${r.color} shrink-0`} />
              <span className="flex-1 text-[12px] text-slate-600">{r.label}</span>
              <span className="text-[12px] font-semibold text-slate-800 tabular-nums">{r.count}</span>
            </div>
          ))}
          <div className="flex items-center gap-3 px-5 py-3.5 bg-slate-50">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-200 shrink-0" />
            <span className="flex-1 text-[12px] font-medium text-slate-600">Total</span>
            <span className="text-[12px] font-bold text-slate-800 tabular-nums">{stats?.totalOrders ?? 0}</span>
          </div>
        </div>
      )}
    </Card>
  );
}

// ── Latest Customers ──────────────────────────────────────────────

function LatestCustomers({ customers, loading }: { customers: CustomerSummaryDTO[]; loading: boolean }) {
  return (
    <Card title="Recent Customers">
      {loading ? (
        <div className="p-5 space-y-3">{Array.from({ length: 5 }).map((_, i) => <Sk key={i} className="h-12 w-full" />)}</div>
      ) : customers.length === 0 ? (
        <div className="py-12 text-center text-[13px] text-slate-500">No customers yet</div>
      ) : (
        <div className="divide-y divide-slate-50">
          {customers.map((c) => (
            <div key={c.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50 transition-colors">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center shrink-0">
                <span className="text-[11px] font-semibold text-slate-600">{inits(c.name)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-medium text-slate-800 truncate">{c.name}</p>
                <p className="text-[11px] text-slate-500 truncate">{c.email}</p>
              </div>
              <div className="text-right shrink-0">
                <span className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                  {c.totalOrders} order{c.totalOrders !== 1 ? "s" : ""}
                </span>
                <p className="text-[10px] text-slate-500 mt-1">{fdate(c.createdAt)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

// ── Low Stock Products ────────────────────────────────────────────

function LowStockProducts({ stats, loading }: { stats: AdminStatsDTO | null; loading: boolean }) {
  const items = stats?.lowStockItems ?? [];
  return (
    <Card title="Low Stock Alert" action={
      !loading && items.length > 0 ? (
        <span className="flex items-center gap-1 text-[10px] font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          {items.length} item{items.length !== 1 ? "s" : ""}
        </span>
      ) : undefined
    }>
      {loading ? (
        <div className="p-5 space-y-3">{Array.from({ length: 4 }).map((_, i) => <Sk key={i} className="h-12 w-full" />)}</div>
      ) : items.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-[13px] text-slate-500">All products are well-stocked</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-50">
          {items.map((item, i) => (
            <div key={i} className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50 transition-colors">
              <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-slate-500">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6Z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-medium text-slate-800 truncate">{item.productName}</p>
                <p className="text-[11px] text-slate-500 truncate">{item.category} · {item.sku}</p>
              </div>
              <div className="text-right shrink-0 space-y-1">
                <p className={`text-[12px] font-semibold ${item.level === "Critical" ? "text-red-500" : "text-amber-500"}`}>
                  {item.available} left
                </p>
                <span className={`text-[9px] tracking-[0.1em] uppercase px-1.5 py-0.5 rounded ${
                  item.level === "Critical" ? "bg-red-50 text-red-500 ring-1 ring-red-200" : "bg-amber-50 text-amber-600 ring-1 ring-amber-200"
                }`}>{item.level}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

// ── Dashboard Home ────────────────────────────────────────────────

function DashboardHome() {
  const [stats,     setStats]     = useState<AdminStatsDTO | null>(null);
  const [orders,    setOrders]    = useState<AdminOrderSummaryDTO[]>([]);
  const [customers, setCustomers] = useState<CustomerSummaryDTO[]>([]);
  const [loading,   setLoading]   = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, customersRes, ordersRes] = await Promise.all([
        fetch("/api/admin/stats"),
        fetch("/api/admin/customers?page=1&limit=5"),
        fetch("/api/orders?page=1&limit=7"),
      ]);
      const [sd, cd, od] = await Promise.all([statsRes.json(), customersRes.json(), ordersRes.json()]);
      if (sd.success) setStats(sd.data);
      if (cd.success) setCustomers(cd.data);
      if (od.success) setOrders(od.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const statCards = stats ? [
    {
      label: "Total Revenue", value: fp(stats.totalRevenue), sub: "all time",
      iconBg: "bg-emerald-50", iconColor: "text-emerald-600",
      icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" /></svg>,
    },
    {
      label: "Monthly Revenue", value: fp(stats.monthlyRevenue), sub: "this month",
      iconBg: "bg-blue-50", iconColor: "text-blue-600",
      icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" /></svg>,
    },
    {
      label: "Total Customers", value: stats.totalCustomers.toLocaleString(), sub: undefined,
      iconBg: "bg-violet-50", iconColor: "text-violet-600",
      icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" /></svg>,
    },
    {
      label: "Active Products", value: stats.totalProducts.toLocaleString(), sub: `${stats.lowStockCount} low stock`,
      iconBg: "bg-amber-50", iconColor: "text-amber-600",
      icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" /></svg>,
    },
  ] : [];

  if (loading) return <SkeletonDashboard />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-800">Dashboard</h1>
        <p className="text-[13px] text-slate-600 mt-0.5">Welcome back! Here&apos;s what&apos;s happening with your store.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((s) => <StatCard key={s.label} {...s} />)}
      </div>

      {/* Orders + Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2"><RecentOrders orders={orders} loading={false} /></div>
        <OrderStatusBreakdown stats={stats} loading={false} />
      </div>

      {/* Customers + Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <LatestCustomers customers={customers} loading={false} />
        <LowStockProducts stats={stats} loading={false} />
      </div>
    </div>
  );
}

// ── Coming Soon ───────────────────────────────────────────────────

function ComingSoon({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-5 px-4">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7 text-slate-500">
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l5.654-4.654m5.171-5.171 4.5-4.5a2.25 2.25 0 0 1 3.182 3.182l-4.5 4.5" />
        </svg>
      </div>
      <div>
        <p className="text-[10px] tracking-[0.2em] uppercase text-slate-500 mb-2">Coming Soon</p>
        <h2 className="text-xl font-semibold text-slate-800 mb-2">{label}</h2>
        <p className="text-[13px] text-slate-600 max-w-xs">This section is currently under development and will be available in a future update.</p>
      </div>
      <span className="text-[11px] font-medium bg-blue-50 text-blue-600 ring-1 ring-blue-200 px-3 py-1 rounded-full">In Development</span>
    </div>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────

interface NavItem { id: AdminTab; label: string; icon: React.ReactNode; }

const NAV: NavItem[] = [
  { id: "dashboard",  label: "Dashboard",  icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" /></svg> },
  { id: "products",   label: "Products",   icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" /></svg> },
  { id: "categories", label: "Categories", icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" /></svg> },
  { id: "orders",     label: "Orders",     icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007Z" /></svg> },
  { id: "customers",  label: "Customers",  icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" /></svg> },
  { id: "reviews",    label: "Reviews",    icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" /></svg> },
  { id: "coupons",    label: "Coupons",    icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M9 14.25l6-6m4.5-3.493V21.75l-3.75-1.5-3.75 1.5-3.75-1.5-3.75 1.5V4.757c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0c1.1.128 1.907 1.077 1.907 2.185ZM9.75 9h.008v.008H9.75V9Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm4.125 4.5h.008v.008h-.008V13.5Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" /></svg> },
  { id: "analytics",  label: "Analytics",  icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" /></svg> },
  { id: "settings",   label: "Settings",   icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg> },
];

function AdminSidebar({ active, onNav, onClose }: { active: AdminTab; onNav: (t: AdminTab) => void; onClose?: () => void }) {
  return (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
            <span className="text-white text-[11px] font-bold tracking-wider">NP</span>
          </div>
          <div>
            <p className="text-white text-[13px] font-semibold tracking-wide">NAYAB POSH</p>
            <p className="text-white/40 text-[10px] tracking-[0.15em] uppercase">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <div className="px-3 space-y-0.5">
          {NAV.map((item) => {
            const isActive = active === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { onNav(item.id); onClose?.(); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-150 ${
                  isActive ? "bg-white/15 text-white" : "text-white/50 hover:text-white/80 hover:bg-white/5"
                }`}
              >
                {item.icon}
                <span className="text-[13px] font-medium">{item.label}</span>
                {isActive && <div className="ml-auto w-1 h-1 rounded-full bg-white/60" />}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Bottom — logout */}
      <div className="border-t border-white/10 p-4">
        <button
          onClick={() => adminSignOutAction()}
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-white/50 hover:text-white/80 hover:bg-white/5 transition-all duration-150 w-full"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3H15" />
          </svg>
          <span className="text-[13px] font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
}

// ── Main Admin Page ───────────────────────────────────────────────

export default function AdminPage() {
  const [tab,         setTab]         = useState<AdminTab>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const currentLabel = NAV.find((n) => n.id === tab)?.label ?? "Dashboard";

  return (
    <div className="flex min-h-screen bg-slate-50">

      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-black/50 z-[54] lg:hidden" />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-[55]
        w-60 bg-[#0f172a] flex flex-col
        transition-transform duration-300 ease-in-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>
        <AdminSidebar active={tab} onNav={setTab} onClose={() => setSidebarOpen(false)} />
      </aside>

      {/* Main content */}
      <div className="lg:ml-60 flex-1 flex flex-col min-w-0">

        {/* Top bar */}
        <header className="sticky top-0 z-10 bg-white border-b border-slate-200 px-5 py-3.5 flex items-center gap-4">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-slate-600 hover:text-slate-800 transition-colors" aria-label="Open menu">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>

          <div className="flex items-center gap-2 text-[12px] text-slate-500">
            <span className="hover:text-slate-700 cursor-default transition-colors">Admin</span>
            <span>/</span>
            <span className="text-slate-700 font-medium">{currentLabel}</span>
          </div>

          <div className="ml-auto flex items-center gap-3">
            <Link href="/" target="_blank"
              className="hidden sm:flex items-center gap-1.5 text-[11px] text-slate-600 hover:text-slate-800 transition-colors border border-slate-200 hover:border-slate-400 px-3 py-1.5 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
              </svg>
              View Store
            </Link>
            <div className="w-8 h-8 rounded-full bg-[#0f172a] flex items-center justify-center">
              <span className="text-white text-[10px] font-medium">AD</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-5 sm:p-7 overflow-auto">
          {tab === "dashboard"  && <DashboardHome />}
          {tab === "products"   && <ProductsSection />}
          {tab === "orders"     && <OrdersSection />}
          {tab === "categories" && <CategoriesSection />}
          {tab === "customers"  && <CustomersSection />}
          {tab === "reviews"    && <ReviewsSection />}
          {tab === "analytics"  && <AnalyticsSection />}
          {tab === "settings"   && <SettingsSection />}
          {tab !== "dashboard" && tab !== "products" && tab !== "orders" && tab !== "categories" && tab !== "customers" && tab !== "reviews" && tab !== "analytics" && tab !== "settings" && (
            <ComingSoon label={currentLabel} />
          )}
        </main>
      </div>
    </div>
  );
}
