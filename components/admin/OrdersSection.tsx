"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import type { AdminOrderSummaryDTO, OrderDTO, OrderStatusHistoryDTO } from "@/lib/types/order";

// ── Types ──────────────────────────────────────────────────────────

type OrderStatus = "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled";
type PaymentStatus = "Pending" | "Completed" | "Failed" | "Refunded";
type OrdersView = "list" | "detail";

// ── Constants ──────────────────────────────────────────────────────

const STATUS_STYLE: Record<OrderStatus, string> = {
  Pending:    "bg-amber-50   text-amber-600   ring-1 ring-amber-200",
  Processing: "bg-blue-50    text-blue-600    ring-1 ring-blue-200",
  Shipped:    "bg-violet-50  text-violet-600  ring-1 ring-violet-200",
  Delivered:  "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200",
  Cancelled:  "bg-red-50     text-red-500     ring-1 ring-red-200",
};

const PAYMENT_STATUS_STYLE: Record<PaymentStatus, string> = {
  Pending:   "bg-amber-50  text-amber-600  ring-1 ring-amber-200",
  Completed: "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200",
  Failed:    "bg-red-50    text-red-500    ring-1 ring-red-200",
  Refunded:  "bg-slate-50  text-slate-600  ring-1 ring-slate-200",
};

const STATUS_ORDER: OrderStatus[] = ["Pending", "Processing", "Shipped", "Delivered"];
const ALL_STATUSES: OrderStatus[] = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];

function fp(n: number) { return `Rs. ${n.toLocaleString("en-PK")}`; }
function inits(s: string) { return s.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2); }

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric", month: "short", day: "numeric",
  });
}

function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

// ── Micro components ───────────────────────────────────────────────

function Spinner({ sm }: { sm?: boolean }) {
  return (
    <svg className={`animate-spin shrink-0 ${sm ? "w-3.5 h-3.5" : "w-5 h-5"}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

function Sk({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-slate-200 rounded-md ${className}`} />;
}

function StatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLE[status as OrderStatus] ?? "bg-slate-50 text-slate-600 ring-1 ring-slate-200";
  return (
    <span className={`inline-block text-[10px] tracking-[0.08em] uppercase font-medium px-2 py-0.5 rounded-full ${style}`}>
      {status}
    </span>
  );
}

function PaymentBadge({ status }: { status: string }) {
  const style = PAYMENT_STATUS_STYLE[status as PaymentStatus] ?? "bg-slate-50 text-slate-600 ring-1 ring-slate-200";
  return (
    <span className={`inline-block text-[10px] tracking-[0.08em] uppercase font-medium px-2 py-0.5 rounded-full ${style}`}>
      {status}
    </span>
  );
}

function Card({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <h3 className="text-[13px] font-semibold text-slate-800">{title}</h3>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function ProductThumb() {
  return (
    <div className="w-10 h-10 rounded-lg bg-[#EDE8E1] flex items-center justify-center shrink-0">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-[#B8A99A]">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6Z" />
      </svg>
    </div>
  );
}

// ── Toast ──────────────────────────────────────────────────────────

interface Toast { id: number; message: string; type: "success" | "error" }

function ToastList({ toasts, dismiss }: { toasts: Toast[]; dismiss: (id: number) => void }) {
  return (
    <div className="fixed bottom-5 right-5 flex flex-col gap-2 z-50 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          onClick={() => dismiss(t.id)}
          className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-[13px] font-medium cursor-pointer ${
            t.type === "success"
              ? "bg-emerald-600 text-white"
              : "bg-red-600 text-white"
          }`}
        >
          {t.type === "success" ? (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 shrink-0">
              <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 shrink-0">
              <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" clipRule="evenodd" />
            </svg>
          )}
          {t.message}
        </div>
      ))}
    </div>
  );
}

function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = () => Date.now();

  function push(message: string, type: "success" | "error" = "success") {
    const id = nextId();
    setToasts((p) => [...p, { id, message, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 4000);
  }

  function dismiss(id: number) {
    setToasts((p) => p.filter((t) => t.id !== id));
  }

  return { toasts, push, dismiss };
}

// ── Order Timeline ─────────────────────────────────────────────────

function OrderTimeline({ history }: { history: OrderStatusHistoryDTO[] }) {
  if (history.length === 0) {
    return <p className="text-[12px] text-slate-500 italic">No history recorded.</p>;
  }

  return (
    <div className="space-y-0">
      {history.map((entry, i) => {
        const isCancelled = entry.status === "Cancelled";
        const isLast = i === history.length - 1;

        return (
          <div key={entry.id} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                isCancelled
                  ? "bg-red-100"
                  : isLast
                  ? "bg-emerald-500 ring-4 ring-emerald-100"
                  : "bg-emerald-500"
              }`}>
                {isCancelled ? (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-red-500">
                    <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                  </svg>
                ) : isLast ? (
                  <div className="w-2.5 h-2.5 rounded-full bg-white" />
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-white">
                    <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 0 1 .208 1.04l-9 13.5a.75.75 0 0 1-1.154.114l-6-6a.75.75 0 0 1 1.06-1.06l5.353 5.353 8.493-12.74a.75.75 0 0 1 1.04-.207Z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              {!isLast && (
                <div className="w-0.5 flex-1 my-1 min-h-[28px] bg-emerald-300" />
              )}
            </div>
            <div className={`${isLast ? "pb-0" : "pb-5"} flex-1 min-w-0`}>
              <div className="flex items-center gap-2 flex-wrap">
                <p className={`text-[12px] font-semibold ${isCancelled ? "text-red-500" : "text-slate-800"}`}>
                  {entry.status === "Pending" ? "Order Placed" : entry.status}
                </p>
                {isLast && !isCancelled && (
                  <span className="text-[10px] font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">Current</span>
                )}
              </div>
              {entry.note && (
                <p className="text-[11px] text-slate-600 mt-0.5">{entry.note}</p>
              )}
              <p className="text-[11px] text-slate-500 mt-0.5">{fmtDateTime(entry.createdAt)}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Status Update Dropdown ─────────────────────────────────────────

function StatusDropdown({
  current,
  orderId,
  onUpdated,
  onError,
}: {
  current: string;
  orderId: string;
  onUpdated: (order: OrderDTO) => void;
  onError: (msg: string) => void;
}) {
  const [open,    setOpen]    = useState(false);
  const [loading, setLoading] = useState(false);

  async function select(status: OrderStatus) {
    if (status === current) { setOpen(false); return; }
    setOpen(false);
    setLoading(true);
    try {
      const res  = await fetch(`/api/orders/${orderId}/status`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ status }),
      });
      const json = await res.json();
      if (!res.ok) { onError(json.error ?? "Failed to update status"); return; }
      onUpdated(json.data as OrderDTO);
    } catch {
      onError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const style = STATUS_STYLE[current as OrderStatus] ?? "bg-slate-50 text-slate-600 ring-1 ring-slate-200";

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        disabled={loading}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[12px] font-medium transition-all ${style} hover:opacity-80 disabled:opacity-60`}
      >
        {loading ? <Spinner sm /> : null}
        {current}
        {!loading && (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3 opacity-60">
            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
          </svg>
        )}
      </button>

      {open && (
        <>
          <div onClick={() => setOpen(false)} className="fixed inset-0 z-10" />
          <div className="absolute left-0 top-full mt-1.5 w-44 bg-white border border-slate-200 rounded-xl shadow-xl z-20 overflow-hidden py-1">
            {ALL_STATUSES.map(s => (
              <button
                key={s}
                onClick={() => select(s)}
                className={`w-full text-left px-3 py-2 text-[12px] transition-colors flex items-center gap-2 ${
                  s === current ? "bg-slate-50 font-medium text-slate-800" : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${
                  s === "Pending"    ? "bg-amber-400"   :
                  s === "Processing" ? "bg-blue-400"    :
                  s === "Shipped"    ? "bg-violet-400"  :
                  s === "Delivered"  ? "bg-emerald-400" : "bg-red-400"
                }`} />
                {s}
                {s === current && (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-slate-500 ml-auto">
                    <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 0 1 .208 1.04l-9 13.5a.75.75 0 0 1-1.154.114l-6-6a.75.75 0 0 1 1.06-1.06l5.353 5.353 8.493-12.74a.75.75 0 0 1 1.04-.207Z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── Payment Actions ────────────────────────────────────────────────

function PaymentActions({
  orderId,
  paymentStatus,
  paymentMethod,
  onUpdated,
  onError,
}: {
  orderId:       string;
  paymentStatus: string;
  paymentMethod: string;
  onUpdated:     (order: OrderDTO) => void;
  onError:       (msg: string) => void;
}) {
  const [loading, setLoading] = useState<"paid" | "failed" | null>(null);

  if (paymentMethod !== "COD" || paymentStatus === "Refunded") return null;
  if (paymentStatus === "Completed") {
    return (
      <div className="flex items-center gap-2 text-[12px] text-emerald-600 font-medium">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
          <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" />
        </svg>
        Payment Collected
      </div>
    );
  }
  if (paymentStatus === "Failed") {
    return (
      <div className="flex items-center gap-2 text-[12px] text-red-500 font-medium">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
          <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-1.72 6.97a.75.75 0 1 0-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 1 0 1.06 1.06L12 13.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L13.06 12l1.72-1.72a.75.75 0 1 0-1.06-1.06L12 10.94l-1.72-1.72Z" clipRule="evenodd" />
        </svg>
        Payment Failed
      </div>
    );
  }

  async function update(status: "Paid" | "Failed") {
    const key = status === "Paid" ? "paid" : "failed";
    setLoading(key);
    try {
      const res  = await fetch(`/api/orders/${orderId}/payment-status`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ status }),
      });
      const json = await res.json();
      if (!res.ok) { onError(json.error ?? "Failed to update payment status"); return; }
      onUpdated(json.data as OrderDTO);
    } catch {
      onError("Network error. Please try again.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-[12px] text-slate-600 mr-1">Mark payment:</span>
      <button
        onClick={() => update("Paid")}
        disabled={loading !== null}
        className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
      >
        {loading === "paid" ? <Spinner sm /> : null}
        Paid
      </button>
      <button
        onClick={() => update("Failed")}
        disabled={loading !== null}
        className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
      >
        {loading === "failed" ? <Spinner sm /> : null}
        Failed
      </button>
    </div>
  );
}

// ── Order Detail ───────────────────────────────────────────────────

function OrderDetail({
  orderId,
  onBack,
  onSuccess,
  onError,
}: {
  orderId:   string;
  onBack:    () => void;
  onSuccess: (msg: string) => void;
  onError:   (msg: string) => void;
}) {
  const [order,   setOrder]   = useState<OrderDTO | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch(`/api/orders/${orderId}`);
      const json = await res.json();
      if (json.success) setOrder(json.data as OrderDTO);
    } catch {}
    setLoading(false);
  }, [orderId]);

  useEffect(() => { load(); }, [load]);

  function handleStatusUpdate(updated: OrderDTO) {
    setOrder(updated);
    onSuccess(`Order status updated to "${updated.status}".`);
  }

  function handlePaymentUpdate(updated: OrderDTO) {
    setOrder(updated);
    onSuccess(`Payment marked as ${updated.payment?.status ?? "updated"}.`);
  }

  if (loading || !order) {
    return (
      <div className="space-y-6">
        <Sk className="h-8 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-5">
            <Sk className="h-48 w-full" />
          </div>
          <div className="space-y-5">
            <Sk className="h-32 w-full" />
            <Sk className="h-48 w-full" />
          </div>
        </div>
      </div>
    );
  }

  const itemsTotal = order.items.reduce((s, i) => s + i.lineTotal, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-[12px] text-slate-600 hover:text-slate-800 transition-colors mb-3"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
            </svg>
            Orders
          </button>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-xl font-semibold text-slate-800">{order.orderNumber}</h1>
            <StatusBadge status={order.status} />
            {order.payment && <PaymentBadge status={order.payment.status} />}
          </div>
          <p className="text-[12px] text-slate-500 mt-1">{fmtDate(order.createdAt)}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {order.payment && (
            <PaymentActions
              orderId={order.id}
              paymentStatus={order.payment.status}
              paymentMethod={order.payment.method}
              onUpdated={handlePaymentUpdate}
              onError={onError}
            />
          )}
          <div className="flex items-center gap-2">
            <span className="text-[12px] text-slate-600">Status:</span>
            <StatusDropdown
              current={order.status}
              orderId={order.id}
              onUpdated={handleStatusUpdate}
              onError={onError}
            />
          </div>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">

        {/* ── Left column (2/3) ── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Products */}
          <Card title={`Products (${order.items.length})`}>
            <div className="overflow-x-auto -m-5">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    {["Product", "Size", "Color", "Qty", "Unit Price", "Total"].map(h => (
                      <th key={h} className="text-left text-[10px] tracking-[0.1em] uppercase text-slate-500 font-medium px-5 py-3 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item, i) => (
                    <tr key={item.id} className={`border-b border-slate-50 hover:bg-slate-50 transition-colors ${i === order.items.length - 1 ? "border-0" : ""}`}>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3 min-w-[160px]">
                          <ProductThumb />
                          <p className="text-[12px] font-medium text-slate-800">{item.productName}</p>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-[12px] text-slate-600">{item.size}</td>
                      <td className="px-5 py-4 text-[12px] text-slate-600">{item.color}</td>
                      <td className="px-5 py-4 text-[12px] text-slate-600">{item.quantity}</td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        {item.salePrice != null ? (
                          <div>
                            <p className="text-[12px] font-medium text-slate-800">{fp(item.salePrice)}</p>
                            <p className="text-[11px] text-slate-500 line-through">{fp(item.unitPrice)}</p>
                          </div>
                        ) : (
                          <span className="text-[12px] text-slate-800">{fp(item.unitPrice)}</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-[12px] font-medium text-slate-800 whitespace-nowrap">
                        {fp(item.lineTotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Payment details */}
          {order.payment && (
            <Card title="Payment">
              <div className="space-y-2.5">
                <div className="flex justify-between text-[12px]">
                  <span className="text-slate-600">Method</span>
                  <span className="text-slate-700 font-medium">
                    {order.payment.method === "COD" ? "Cash on Delivery" : "Card"}
                  </span>
                </div>
                <div className="flex justify-between text-[12px]">
                  <span className="text-slate-600">Status</span>
                  <PaymentBadge status={order.payment.status} />
                </div>
                <div className="flex justify-between text-[12px]">
                  <span className="text-slate-600">Amount</span>
                  <span className="text-slate-700 font-medium">{fp(order.payment.amount)}</span>
                </div>
                {order.payment.paidAt && (
                  <div className="flex justify-between text-[12px]">
                    <span className="text-slate-600">Paid at</span>
                    <span className="text-slate-700">{fmtDateTime(order.payment.paidAt)}</span>
                  </div>
                )}
                {order.payment.failureReason && (
                  <div className="flex justify-between text-[12px]">
                    <span className="text-slate-600">Failure reason</span>
                    <span className="text-red-500 text-right max-w-[60%]">{order.payment.failureReason}</span>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>

        {/* ── Right column (1/3) ── */}
        <div className="space-y-5">

          {/* Shipping address */}
          <Card title="Shipping Address">
            <div className="space-y-1 text-[12px] text-slate-600 leading-relaxed">
              <p className="font-medium text-slate-800">{order.shipping.name}</p>
              <p className="text-slate-500 text-[11px]">{order.shipping.phone}</p>
              <p className="mt-2">{order.shipping.street}</p>
              <p>{order.shipping.city}, {order.shipping.province} {order.shipping.postalCode}</p>
              <p>{order.shipping.country}</p>
            </div>
          </Card>

          {/* Order summary */}
          <Card title="Order Summary">
            <div className="space-y-2.5">
              <div className="flex justify-between text-[12px]">
                <span className="text-slate-600">Subtotal ({order.items.reduce((s, i) => s + i.quantity, 0)} items)</span>
                <span className="text-slate-700">{fp(itemsTotal)}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-[12px]">
                  <span className="text-slate-600">Discount</span>
                  <span className="text-emerald-600">-{fp(order.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-[12px]">
                <span className="text-slate-600">Shipping</span>
                <span className={order.shippingCost === 0 ? "text-emerald-600 font-medium" : "text-slate-700"}>
                  {order.shippingCost === 0 ? "Free" : fp(order.shippingCost)}
                </span>
              </div>
              {order.notes && (
                <div className="pt-2 border-t border-slate-100">
                  <p className="text-[11px] text-slate-500 mb-1">Customer note</p>
                  <p className="text-[12px] text-slate-600 italic">{order.notes}</p>
                </div>
              )}
              <div className="pt-2 border-t border-slate-100 flex justify-between">
                <span className="text-[13px] font-semibold text-slate-800">Total</span>
                <span className="text-[13px] font-semibold text-slate-800">{fp(order.total)}</span>
              </div>
            </div>
          </Card>

          {/* Timeline */}
          <Card title="Order Timeline">
            <OrderTimeline history={order.statusHistory} />
          </Card>
        </div>
      </div>
    </div>
  );
}

// ── Orders List ────────────────────────────────────────────────────

const ITEMS_PER_PAGE = 10;

function OrdersList({
  onView,
  onSuccess,
  onError,
}: {
  onView:    (id: string) => void;
  onSuccess: (msg: string) => void;
  onError:   (msg: string) => void;
}) {
  const [orders,       setOrders]       = useState<AdminOrderSummaryDTO[]>([]);
  const [total,        setTotal]        = useState(0);
  const [page,         setPage]         = useState(1);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState("");
  const [debouncedQ,   setDebouncedQ]   = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => { setPage(1); }, [debouncedQ, filterStatus]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const sp = new URLSearchParams({ page: String(page), limit: String(ITEMS_PER_PAGE) });
      if (filterStatus !== "all") sp.set("status", filterStatus);
      if (debouncedQ)             sp.set("search", debouncedQ);

      const res  = await fetch(`/api/orders?${sp}`);
      const json = await res.json();
      if (json.success) {
        setOrders(json.data as AdminOrderSummaryDTO[]);
        setTotal(json.pagination?.total ?? 0);
      }
    } catch {}
    setLoading(false);
  }, [page, filterStatus, debouncedQ]);

  useEffect(() => { load(); }, [load]);

  const totalPages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));
  const startIdx   = total === 0 ? 0 : (page - 1) * ITEMS_PER_PAGE + 1;
  const endIdx     = Math.min(page * ITEMS_PER_PAGE, total);

  const statusCounts = useMemo(() => {
    const c: Record<string, number> = {};
    orders.forEach(o => { c[o.status] = (c[o.status] ?? 0) + 1; });
    return c;
  }, [orders]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-slate-800">Orders</h1>
        <p className="text-[12px] text-slate-600 mt-0.5">{total} total order{total !== 1 ? "s" : ""}</p>
      </div>

      {/* Status quick-filters */}
      <div className="flex flex-wrap gap-2">
        {(["all", ...ALL_STATUSES] as string[]).map(s => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`flex items-center gap-1.5 text-[11px] font-medium px-3 py-1.5 rounded-lg border transition-all ${
              filterStatus === s
                ? "bg-slate-800 text-white border-slate-800"
                : "border-slate-200 text-slate-600 hover:border-slate-400 hover:text-slate-700"
            }`}
          >
            {s === "all" ? "All" : s}
            {s !== "all" && (
              <span className={`text-[10px] px-1 py-0.5 rounded ${filterStatus === s ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"}`}>
                {statusCounts[s] ?? 0}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
        </svg>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by order ID or customer name…"
          className="w-full pl-9 pr-4 py-2 text-[13px] border border-slate-200 rounded-lg outline-none focus:border-slate-400 bg-white transition-colors placeholder-slate-400"
        />
        {search && (
          <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-600">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
              <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-5 space-y-2">
            {Array.from({ length: 8 }).map((_, i) => <Sk key={i} className="h-12 w-full" />)}
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-slate-500">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007Z" />
              </svg>
            </div>
            <p className="text-[13px] font-medium text-slate-700 mb-1">No orders found</p>
            <p className="text-[12px] text-slate-500">
              {search ? `No results for "${search}".` : "No orders match the selected filter."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  {["Order #", "Customer", "Items", "Total", "Payment", "Order Status", "Date", ""].map((h, i) => (
                    <th key={i} className="text-left text-[10px] tracking-[0.1em] uppercase text-slate-500 font-medium px-4 py-3 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map((order, i) => (
                  <tr
                    key={order.id}
                    className={`border-b border-slate-50 hover:bg-slate-50 transition-colors ${i === orders.length - 1 ? "border-0" : ""}`}
                  >
                    <td className="px-4 py-3.5">
                      <span className="text-[12px] font-medium text-blue-600 whitespace-nowrap font-mono">{order.orderNumber}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5 min-w-[140px]">
                        <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                          <span className="text-[10px] font-medium text-slate-600">{inits(order.shipName)}</span>
                        </div>
                        <span className="text-[12px] text-slate-700 whitespace-nowrap">{order.shipName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-[12px] text-slate-600 whitespace-nowrap">
                      {order.totalItems} item{order.totalItems !== 1 ? "s" : ""}
                    </td>
                    <td className="px-4 py-3.5 text-[12px] font-medium text-slate-800 whitespace-nowrap">{fp(order.total)}</td>
                    <td className="px-4 py-3.5">
                      {order.payment ? (
                        <div className="flex flex-col gap-1">
                          <span className="text-[11px] text-slate-600">{order.payment.method === "COD" ? "COD" : "Card"}</span>
                          <PaymentBadge status={order.payment.status} />
                        </div>
                      ) : (
                        <span className="text-[12px] text-slate-500">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5"><StatusBadge status={order.status} /></td>
                    <td className="px-4 py-3.5 text-[12px] text-slate-500 whitespace-nowrap">{fmtDate(order.createdAt)}</td>
                    <td className="px-4 py-3.5">
                      <button
                        onClick={() => onView(order.id)}
                        className="flex items-center gap-1 text-[12px] font-medium text-slate-600 hover:text-slate-900 transition-colors whitespace-nowrap group"
                      >
                        View
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && total > 0 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100">
            <span className="text-[12px] text-slate-600">
              Showing {startIdx}–{endIdx} of {total} orders
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-2.5 py-1.5 text-[12px] border border-slate-200 rounded-lg text-slate-600 hover:border-slate-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >‹</button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const p = totalPages <= 5 ? i + 1 : Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-8 h-8 text-[12px] rounded-lg transition-all ${
                      p === page ? "bg-slate-800 text-white font-medium" : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-2.5 py-1.5 text-[12px] border border-slate-200 rounded-lg text-slate-600 hover:border-slate-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >›</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Orders Section (main) ──────────────────────────────────────────

export default function OrdersSection() {
  const [view,    setView]    = useState<OrdersView>("list");
  const [orderId, setOrderId] = useState<string | null>(null);
  const { toasts, push, dismiss } = useToast();

  function handleView(id: string) {
    setOrderId(id);
    setView("detail");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleBack() {
    setView("list");
    setOrderId(null);
  }

  return (
    <div>
      {view === "list" && (
        <OrdersList
          onView={handleView}
          onSuccess={(msg) => push(msg, "success")}
          onError={(msg)   => push(msg, "error")}
        />
      )}

      {view === "detail" && orderId && (
        <OrderDetail
          orderId={orderId}
          onBack={handleBack}
          onSuccess={(msg) => push(msg, "success")}
          onError={(msg)   => push(msg, "error")}
        />
      )}

      <ToastList toasts={toasts} dismiss={dismiss} />
    </div>
  );
}
