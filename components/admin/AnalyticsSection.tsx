"use client";

import { useState, useEffect, useCallback } from "react";
import type { AnalyticsDTO } from "@/lib/services/analytics.service";

// ── Types ──────────────────────────────────────────────────────────

type Period = "today" | "7days" | "30days" | "12months";

const PERIOD_LABELS: Record<Period, string> = {
  today:      "Today",
  "7days":    "Last 7 Days",
  "30days":   "Last 30 Days",
  "12months": "Last 12 Months",
};

// ── Utilities ──────────────────────────────────────────────────────

function fp(n: number)  { return `Rs. ${Math.round(n).toLocaleString("en-PK")}`; }
function fpK(n: number) {
  if (n >= 100000) return `Rs. ${(n / 100000).toFixed(n >= 1000000 ? 2 : 1)}L`;
  if (n >= 1000)   return `Rs. ${(n / 1000).toFixed(0)}K`;
  return `Rs. ${Math.round(n)}`;
}
function fmtY(n: number) {
  if (n >= 100000) return `${(n / 100000).toFixed(1)}L`;
  if (n >= 1000)   return `${Math.round(n / 1000)}K`;
  return `${Math.round(n)}`;
}
function inits(s: string) {
  return s.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
}
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-PK", { month: "short", day: "numeric", year: "numeric" });
}
function fmtStatus(s: string) {
  const map: Record<string, { label: string; cls: string }> = {
    Pending:    { label: "Pending",    cls: "bg-amber-50 text-amber-600"  },
    Processing: { label: "Processing", cls: "bg-blue-50 text-blue-600"    },
    Shipped:    { label: "Shipped",    cls: "bg-violet-50 text-violet-600" },
    Delivered:  { label: "Delivered",  cls: "bg-emerald-50 text-emerald-600" },
    Cancelled:  { label: "Cancelled",  cls: "bg-red-50 text-red-500"      },
  };
  return map[s] ?? { label: s, cls: "bg-slate-100 text-slate-600" };
}

const AVATAR_COLORS = [
  "bg-rose-400","bg-violet-500","bg-blue-500","bg-emerald-500",
  "bg-amber-500","bg-pink-500","bg-indigo-500","bg-teal-500",
];
function avatarBg(name: string) {
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) & 0xffff;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

const CAT_COLORS = [
  "bg-rose-500","bg-violet-500","bg-blue-500","bg-emerald-500",
  "bg-amber-500","bg-pink-500","bg-indigo-400","bg-teal-500",
];

// ── SVG Charts ─────────────────────────────────────────────────────

const VW = 580, VH = 185;
const PL = 42, PB = 26, PT = 10, PR = 8;
const CW = VW - PL - PR;
const CH = VH - PB - PT;

function crPath(pts: [number, number][]): string {
  if (pts.length < 2) return "";
  let d = `M ${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    const cp1x = p1[0] + (p2[0] - p0[0]) / 6;
    const cp1y = p1[1] + (p2[1] - p0[1]) / 6;
    const cp2x = p2[0] - (p3[0] - p1[0]) / 6;
    const cp2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)},${cp2x.toFixed(1)} ${cp2y.toFixed(1)},${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  return d;
}

function LineChart({ data, labels, uid }: { data: number[]; labels: string[]; uid: string }) {
  const max  = Math.max(...data, 1);
  const pts: [number, number][] = data.map((v, i) => [
    PL + (i / Math.max(data.length - 1, 1)) * CW,
    PT + (1 - v / max) * CH,
  ]);
  const line  = crPath(pts);
  const last  = pts[pts.length - 1];
  const first = pts[0];
  const area  = `${line} L ${last[0].toFixed(1)} ${(PT + CH).toFixed(1)} L ${first[0].toFixed(1)} ${(PT + CH).toFixed(1)} Z`;
  const ticks = [0, 0.25, 0.5, 0.75, 1];

  return (
    <svg viewBox={`0 0 ${VW} ${VH}`} className="w-full" style={{ height: VH }}>
      <defs>
        <linearGradient id={`lg-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#6366f1" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {ticks.map((t, i) => {
        const y = PT + t * CH;
        return (
          <g key={i}>
            <line x1={PL} y1={y} x2={VW - PR} y2={y} stroke="#e2e8f0" strokeWidth="1" />
            <text x={PL - 5} y={y + 3.5} textAnchor="end" fontSize="8.5" fill="#94a3b8" fontFamily="system-ui,sans-serif">
              {fmtY(max * (1 - t))}
            </text>
          </g>
        );
      })}
      <path d={area} fill={`url(#lg-${uid})`} />
      <path d={line} fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="3.5" fill="white" stroke="#6366f1" strokeWidth="2" />
      ))}
      {pts.map(([x], i) => (
        <text key={i} x={x} y={VH - 5} textAnchor="middle" fontSize="8.5" fill="#94a3b8" fontFamily="system-ui,sans-serif">
          {labels[i]}
        </text>
      ))}
    </svg>
  );
}

function BarChart({ data, labels, uid }: { data: number[]; labels: string[]; uid: string }) {
  const max  = Math.max(...data, 1);
  const slot = CW / data.length;
  const bw   = slot * 0.55;
  const ticks = [0, 0.25, 0.5, 0.75, 1];

  return (
    <svg viewBox={`0 0 ${VW} ${VH}`} className="w-full" style={{ height: VH }}>
      <defs>
        <linearGradient id={`bg-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#f43f5e" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.45" />
        </linearGradient>
      </defs>
      {ticks.map((t, i) => {
        const y = PT + t * CH;
        return (
          <g key={i}>
            <line x1={PL} y1={y} x2={VW - PR} y2={y} stroke="#e2e8f0" strokeWidth="1" />
            <text x={PL - 5} y={y + 3.5} textAnchor="end" fontSize="8.5" fill="#94a3b8" fontFamily="system-ui,sans-serif">
              {Math.round(max * (1 - t))}
            </text>
          </g>
        );
      })}
      {data.map((v, i) => {
        const cx = PL + slot * i + slot / 2;
        const bh = (v / max) * CH;
        const bx = cx - bw / 2;
        const by = PT + CH - bh;
        return (
          <g key={i}>
            <rect x={bx} y={by} width={bw} height={bh}
              fill={`url(#bg-${uid})`} rx="3" ry="3" opacity="0.85" />
            <text x={cx} y={VH - 5} textAnchor="middle" fontSize="8.5" fill="#94a3b8" fontFamily="system-ui,sans-serif">
              {labels[i]}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ── Skeleton ───────────────────────────────────────────────────────

function Sk({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-slate-200 rounded-md ${className}`} />;
}

function SkeletonAnalytics() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <Sk className="w-9 h-9 rounded-lg" /><Sk className="h-4 w-12" />
            </div>
            <Sk className="h-7 w-20" /><Sk className="h-3 w-16" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {[0, 1].map(i => (
          <div key={i} className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
            <Sk className="h-5 w-36" /><Sk className="h-[185px] w-full rounded-lg" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {[0, 1].map(i => (
          <div key={i} className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
            <Sk className="h-5 w-36 mb-2" />
            {Array.from({ length: 5 }).map((_, j) => <Sk key={j} className="h-12 w-full" />)}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Period Filter ──────────────────────────────────────────────────

function PeriodFilter({ active, onChange }: { active: Period; onChange: (p: Period) => void }) {
  const opts: Period[] = ["today", "7days", "30days", "12months"];
  return (
    <div className="flex items-center bg-slate-100 rounded-xl p-1 gap-0.5">
      {opts.map(p => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={`px-3 py-1.5 text-[11px] font-medium rounded-lg transition-all whitespace-nowrap ${
            active === p
              ? "bg-white text-slate-800 shadow-sm"
              : "text-slate-600 hover:text-slate-700"
          }`}
        >
          {PERIOD_LABELS[p]}
        </button>
      ))}
    </div>
  );
}

// ── Overview Card ──────────────────────────────────────────────────

interface OverviewCardProps {
  label:      string;
  value:      string;
  trend:      number;
  icon:       React.ReactNode;
  iconBg:     string;
  iconColor:  string;
}

function OverviewCard({ label, value, trend, icon, iconBg, iconColor }: OverviewCardProps) {
  const up = trend >= 0;
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow duration-200 space-y-3">
      <div className="flex items-start justify-between">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${iconBg}`}>
          <div className={iconColor}>{icon}</div>
        </div>
        <span className={`flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
          up ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"
        }`}>
          {up ? "↑" : "↓"} {Math.abs(trend).toFixed(1)}%
        </span>
      </div>
      <div>
        <p className="text-[22px] font-semibold text-slate-800 tracking-tight leading-none">{value}</p>
        <p className="text-[11px] text-slate-600 mt-1.5">{label}</p>
      </div>
    </div>
  );
}

// ── Chart Card ─────────────────────────────────────────────────────

function ChartCard({ title, sub, children }: { title: string; sub: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100">
        <h3 className="text-[13px] font-semibold text-slate-800">{title}</h3>
        <p className="text-[11px] text-slate-500 mt-0.5">{sub}</p>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

// ── Order Status Strip ─────────────────────────────────────────────

function OrderStatusStrip({ counts }: { counts: AnalyticsDTO["ordersByStatus"] }) {
  const items = [
    { label: "Pending",    value: counts.Pending,    cls: "text-amber-600"   },
    { label: "Processing", value: counts.Processing, cls: "text-blue-600"    },
    { label: "Shipped",    value: counts.Shipped,    cls: "text-violet-600"  },
    { label: "Delivered",  value: counts.Delivered,  cls: "text-emerald-600" },
    { label: "Cancelled",  value: counts.Cancelled,  cls: "text-red-500"     },
  ];
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5">
      <p className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-4">Orders by Status</p>
      <div className="grid grid-cols-5 gap-3 text-center">
        {items.map(it => (
          <div key={it.label}>
            <p className={`text-[22px] font-semibold tracking-tight leading-none ${it.cls}`}>{it.value}</p>
            <p className="text-[10px] text-slate-500 mt-1">{it.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Top Products ───────────────────────────────────────────────────

function TopProductsCard({ products }: { products: AnalyticsDTO["topProducts"] }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100">
        <h3 className="text-[13px] font-semibold text-slate-800">Top Selling Products</h3>
      </div>
      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-slate-500">
              <path strokeLinecap="round" strokeLinejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
            </svg>
          </div>
          <p className="text-[12px] text-slate-600">No sales in this period</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-50">
          {products.map((p, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 transition-colors">
              <span className="text-[11px] font-semibold text-slate-500 w-4 shrink-0 text-center">{i + 1}</span>
              <div className="w-10 h-10 rounded-lg bg-[#EDE8E1] flex items-center justify-center shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-[#9C8B79]">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-medium text-slate-800 truncate">{p.name}</p>
                <p className="text-[11px] text-slate-500 truncate">{p.category}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[12px] font-semibold text-slate-800">{fpK(p.revenue)}</p>
                <p className="text-[11px] text-slate-500">{p.units} unit{p.units !== 1 ? "s" : ""}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Most Wishlisted ──────────────────────────────────────────────────

function MostWishlistedCard({ products }: { products: AnalyticsDTO["mostWishlisted"] }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100">
        <h3 className="text-[13px] font-semibold text-slate-800">Most Wishlisted Products</h3>
      </div>
      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-slate-500">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
            </svg>
          </div>
          <p className="text-[12px] text-slate-600">No wishlist activity yet</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-50">
          {products.map((p, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 transition-colors">
              <span className="text-[11px] font-semibold text-slate-500 w-4 shrink-0 text-center">{i + 1}</span>
              <div className="w-10 h-10 rounded-lg bg-[#EDE8E1] flex items-center justify-center shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-[#9C8B79]">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-medium text-slate-800 truncate">{p.name}</p>
                <p className="text-[11px] text-slate-500 truncate">{p.category}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[12px] font-semibold text-slate-800">{p.count}</p>
                <p className="text-[11px] text-slate-500">wishlist{p.count !== 1 ? "s" : ""}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Recent Sales ───────────────────────────────────────────────────

function RecentSalesCard({ orders }: { orders: AnalyticsDTO["recentOrders"] }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100">
        <h3 className="text-[13px] font-semibold text-slate-800">Recent Orders</h3>
      </div>
      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-[12px] text-slate-600">No orders yet</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-50">
          {orders.map((o, i) => {
            const { label: statusLabel, cls: statusCls } = fmtStatus(o.status);
            return (
              <div key={i} className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50 transition-colors">
                <div className={`w-8 h-8 rounded-full ${avatarBg(o.shipName)} flex items-center justify-center shrink-0`}>
                  <span className="text-[10px] font-semibold text-white">{inits(o.shipName)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-medium text-slate-800 truncate">{o.shipName}</p>
                  <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
                    <span className="text-[10px] font-medium text-blue-600">#{o.orderNumber}</span>
                    <span>·</span>
                    <span>{fmtDate(o.createdAt)}</span>
                  </p>
                </div>
                <div className="text-right shrink-0 space-y-1">
                  <p className="text-[12px] font-semibold text-slate-800">{fp(o.total)}</p>
                  <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${statusCls}`}>
                    {statusLabel}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Categories ─────────────────────────────────────────────────────

function CategoriesGrid({ categories }: { categories: AnalyticsDTO["salesByCategory"] }) {
  const maxRevenue = Math.max(...categories.map(c => c.revenue), 1);
  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100">
        <h3 className="text-[13px] font-semibold text-slate-800">Sales by Category</h3>
      </div>
      {categories.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-[12px] text-slate-600">No category data for this period</p>
        </div>
      ) : (
        <div className="p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {categories.map((cat, i) => {
              const color = CAT_COLORS[i % CAT_COLORS.length];
              return (
                <div
                  key={i}
                  className="border border-slate-200 rounded-xl p-4 hover:border-slate-300 hover:shadow-sm transition-all duration-200 space-y-3"
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${color}`} />
                    <p className="text-[11px] font-semibold text-slate-700 leading-tight">{cat.name}</p>
                  </div>
                  <div>
                    <p className="text-[18px] font-semibold text-slate-800 tracking-tight leading-none">
                      {cat.revenue > 0 ? fpK(cat.revenue) : "—"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${color}`}
                        style={{ width: `${(cat.revenue / maxRevenue) * 100}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-slate-500">{cat.share.toFixed(1)}% of revenue</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Customer Info Strip ────────────────────────────────────────────

function CustomerStrip({ data }: { data: AnalyticsDTO }) {
  const items = [
    { label: "Total Customers",     value: data.totalCustomers      },
    { label: "New This Period",     value: data.newCustomers        },
    { label: "Registered",          value: data.registeredCustomers },
    { label: "Guest Checkouts",     value: data.guestCustomers      },
  ];
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5">
      <p className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-4">Customer Breakdown</p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
        {items.map(it => (
          <div key={it.label}>
            <p className="text-[22px] font-semibold text-slate-800 tracking-tight leading-none">{it.value}</p>
            <p className="text-[10px] text-slate-500 mt-1">{it.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Summary Row (5 overview cards) ────────────────────────────────

function SummaryRow({ data, period }: { data: AnalyticsDTO; period: Period }) {
  const cards: OverviewCardProps[] = [
    {
      label:    "Total Revenue",
      value:    fpK(data.revenue),
      trend:    data.revenueTrend,
      iconBg:   "bg-emerald-50",
      iconColor:"text-emerald-600",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" />
        </svg>
      ),
    },
    {
      label:    "Total Orders",
      value:    String(data.orders),
      trend:    data.ordersTrend,
      iconBg:   "bg-blue-50",
      iconColor:"text-blue-600",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007Z" />
        </svg>
      ),
    },
    {
      label:    "New Customers",
      value:    String(data.newCustomers),
      trend:    data.newCustomersTrend,
      iconBg:   "bg-violet-50",
      iconColor:"text-violet-600",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
        </svg>
      ),
    },
    {
      label:    "Avg. Order Value",
      value:    fpK(data.aov),
      trend:    data.aovTrend,
      iconBg:   "bg-amber-50",
      iconColor:"text-amber-600",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
        </svg>
      ),
    },
    {
      label:    "Active Products",
      value:    String(data.totalActiveProducts),
      trend:    0,
      iconBg:   "bg-rose-50",
      iconColor:"text-rose-600",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      {cards.map(c => <OverviewCard key={c.label} {...c} />)}
    </div>
  );
}

// ── Error State ────────────────────────────────────────────────────

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-12 flex flex-col items-center text-center">
      <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center mb-3">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-red-500">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
        </svg>
      </div>
      <p className="text-[13px] font-medium text-slate-700 mb-1">Failed to load analytics</p>
      <p className="text-[11px] text-slate-500 mb-4">Check your connection and try again.</p>
      <button
        onClick={onRetry}
        className="text-[11px] font-medium text-blue-600 hover:text-blue-700 underline underline-offset-2"
      >
        Retry
      </button>
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────

export default function AnalyticsSection() {
  const [period,    setPeriod]    = useState<Period>("12months");
  const [data,      setData]      = useState<AnalyticsDTO | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [switching, setSwitching] = useState(false);
  const [error,     setError]     = useState(false);

  const fetchData = useCallback(async (p: Period) => {
    setError(false);
    try {
      const res = await fetch(`/api/admin/analytics?period=${p}`);
      if (!res.ok) throw new Error("API error");
      const json = await res.json();
      setData(json.data);
    } catch {
      setError(true);
    }
  }, []);

  // Initial load
  useEffect(() => {
    setLoading(true);
    fetchData(period).finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function changePeriod(p: Period) {
    if (p === period) return;
    setSwitching(true);
    setPeriod(p);
    await fetchData(p);
    setSwitching(false);
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Analytics</h1>
          <p className="text-[12px] text-slate-600 mt-0.5">Track your store&apos;s performance and trends.</p>
        </div>
        <PeriodFilter active={period} onChange={changePeriod} />
      </div>

      {/* Content */}
      {loading ? (
        <SkeletonAnalytics />
      ) : error || !data ? (
        <ErrorState onRetry={() => {
          setLoading(true);
          fetchData(period).finally(() => setLoading(false));
        }} />
      ) : (
        <div
          className="space-y-5 transition-opacity duration-200"
          style={{ opacity: switching ? 0.4 : 1 }}
        >
          {/* 5 overview cards */}
          <SummaryRow data={data} period={period} />

          {/* Order status + customer breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <OrderStatusStrip counts={data.ordersByStatus} />
            <CustomerStrip data={data} />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <ChartCard
              title="Revenue"
              sub={`${PERIOD_LABELS[period]} · ${fpK(data.revenue)} total`}
            >
              <LineChart data={data.revenueChart} labels={data.chartLabels} uid="rev" />
            </ChartCard>
            <ChartCard
              title="Orders"
              sub={`${PERIOD_LABELS[period]} · ${data.orders} order${data.orders !== 1 ? "s" : ""} placed`}
            >
              <BarChart data={data.ordersChart} labels={data.chartLabels} uid="ord" />
            </ChartCard>
          </div>

          {/* Top products + Recent orders */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <TopProductsCard products={data.topProducts} />
            <RecentSalesCard orders={data.recentOrders} />
          </div>

          {/* Most wishlisted */}
          <MostWishlistedCard products={data.mostWishlisted} />

          {/* Sales by category */}
          <CategoriesGrid categories={data.salesByCategory} />

          {/* Inventory alerts */}
          {(data.outOfStockProducts > 0 || data.lowStockProducts > 0) && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 flex flex-wrap items-center gap-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-amber-600 shrink-0">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
              </svg>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-semibold text-amber-800">Inventory Alerts</p>
                <p className="text-[11px] text-amber-700">
                  {data.outOfStockProducts > 0 && `${data.outOfStockProducts} variant${data.outOfStockProducts !== 1 ? "s" : ""} out of stock`}
                  {data.outOfStockProducts > 0 && data.lowStockProducts > 0 && " · "}
                  {data.lowStockProducts > 0 && `${data.lowStockProducts} variant${data.lowStockProducts !== 1 ? "s" : ""} running low`}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
