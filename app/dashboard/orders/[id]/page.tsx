import Link   from "next/link";
import Image  from "next/image";
import { notFound }       from "next/navigation";
import { requireCustomer }  from "@/lib/auth/helpers";
import { getUserOrderById } from "@/lib/services/order.service";
import { fp, formatDate, StatusBadge } from "@/components/dashboard/ui";
import type { CustomerOrderDTO } from "@/lib/types/order";

interface Props {
  params: Promise<{ id: string }>;
}

const TIMELINE_STEPS = ["Pending", "Processing", "Shipped", "Delivered"] as const;

function OrderTimeline({ order }: { order: CustomerOrderDTO }) {
  const historyMap = new Map(order.statusHistory.map((h) => [h.status, h.createdAt]));
  const cancelled  = order.status === "Cancelled";
  const cancelledAt = historyMap.get("Cancelled");

  const currentIdx = cancelled
    ? -1
    : TIMELINE_STEPS.indexOf(order.status as typeof TIMELINE_STEPS[number]);

  return (
    <div className="pl-1">
      {TIMELINE_STEPS.map((step, i) => {
        const filled = !cancelled && i <= currentIdx;
        const date   = historyMap.get(step);
        return (
          <div key={step} className="flex items-start gap-4 relative">
            {i < TIMELINE_STEPS.length - 1 && (
              <div className={`absolute left-[9px] top-5 w-px h-9 transition-colors ${filled ? "bg-[var(--black)]" : "bg-[#E8E8E8]"}`} />
            )}
            <div className={`w-[18px] h-[18px] rounded-full shrink-0 mt-0.5 flex items-center justify-center border-2 transition-colors ${
              cancelled ? "border-[#E8E8E8] bg-white"
              : filled  ? "border-[var(--black)] bg-[var(--black)]"
              :            "border-[#E0E0E0] bg-white"
            }`}>
              {filled && (
                <svg fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={3} className="w-2.5 h-2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
              )}
            </div>
            <div className="pb-8">
              <p className={`text-[12px] font-medium transition-colors ${filled && !cancelled ? "text-[var(--black)]" : "text-[#C0C0C0]"}`}>
                {step === "Pending" ? "Order Placed" : step}
              </p>
              {filled && date && (
                <p className="text-[10px] text-[var(--muted)] mt-0.5">{formatDate(date)}</p>
              )}
            </div>
          </div>
        );
      })}

      {cancelled && (
        <div className="flex items-start gap-4">
          <div className="w-[18px] h-[18px] rounded-full bg-red-100 border-2 border-red-300 flex items-center justify-center shrink-0 mt-0.5">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-2.5 h-2.5 text-red-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </div>
          <div className="pb-8">
            <p className="text-[12px] font-medium text-red-500">Order Cancelled</p>
            {cancelledAt && <p className="text-[10px] text-[var(--muted)] mt-0.5">{formatDate(cancelledAt)}</p>}
          </div>
        </div>
      )}
    </div>
  );
}

export default async function OrderDetailPage({ params }: Props) {
  const { customerId } = await requireCustomer();
  const { id }    = await params;
  const order     = await getUserOrderById(customerId, id);

  if (!order) notFound();

  return (
    <div>
      <Link
        href="/dashboard/orders"
        className="flex items-center gap-2 text-[11px] tracking-[0.15em] uppercase text-[var(--muted)] hover:text-[var(--black)] transition-colors mb-8 w-fit"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
        </svg>
        Back to Orders
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-8 pb-7 border-b border-[#E8E8E8]">
        <div>
          <p className="text-[10px] tracking-[0.3em] uppercase text-[var(--muted)] mb-1">Order</p>
          <h2 className="text-2xl font-light text-[var(--black)]">
            #{order.orderNumber}
          </h2>
          <p className="text-[11px] text-[var(--muted)] mt-1">{formatDate(order.createdAt)}</p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-10">
        {/* Left */}
        <div className="space-y-8">
          {/* Items */}
          <div>
            <p className="text-[10px] tracking-[0.25em] uppercase text-[var(--muted)] mb-5">Items Ordered</p>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-start gap-4 border border-[#E8E8E8] p-4">
                  <div className="w-16 h-20 rounded-[6px] bg-[#EDE8E1] shrink-0 overflow-hidden relative">
                    {item.productImage ? (
                      <Image
                        src={item.productImage}
                        alt={item.productName}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    ) : (
                      <span className="absolute inset-0 flex items-end justify-center pb-1 text-[6px] text-black/10 tracking-widest uppercase select-none">
                        img
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-[var(--black)]">{item.productName}</p>
                    <p className="text-[11px] text-[var(--muted)] mt-1">
                      Size: {item.size} · Color: {item.color} · Qty: {item.quantity}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[12px] text-[var(--black)]">{fp(item.effectivePrice)}</span>
                      {item.salePrice !== null && item.salePrice < item.unitPrice && (
                        <span className="text-[11px] text-[var(--muted)] line-through">{fp(item.unitPrice)}</span>
                      )}
                    </div>
                  </div>
                  <span className="text-[12px] font-medium text-[var(--black)] shrink-0">{fp(item.lineTotal)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="border border-[#E8E8E8] p-5 space-y-3">
            <p className="text-[10px] tracking-[0.25em] uppercase text-[var(--muted)] mb-4">Order Summary</p>
            {[
              ["Subtotal",          fp(order.subtotal)],
              ...(order.discountAmount > 0 ? [["Discount", `−${fp(order.discountAmount)}`]] : []),
              ["Shipping",          order.shippingCost === 0 ? "Free" : fp(order.shippingCost)],
              ...(order.taxAmount > 0 ? [["Tax", fp(order.taxAmount)]] : []),
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between text-[12px]">
                <span className="text-[var(--muted)]">{label}</span>
                <span className="text-[var(--black)]">{value}</span>
              </div>
            ))}
            <div className="border-t border-[#E8E8E8] pt-3 flex justify-between">
              <span className="text-[13px] font-medium text-[var(--black)]">Total</span>
              <span className="text-[15px] font-light text-[var(--black)]">
                {fp(order.total)}
              </span>
            </div>
          </div>

          {/* Shipping Address */}
          <div>
            <p className="text-[10px] tracking-[0.25em] uppercase text-[var(--muted)] mb-3">Shipping Address</p>
            <div className="border border-[#E8E8E8] px-5 py-4 text-[12px] text-[var(--muted)] leading-relaxed">
              <p className="text-[var(--black)] font-medium mb-1">{order.shipping.name}</p>
              <p>{order.shipping.street}</p>
              <p>{order.shipping.city}{order.shipping.province ? `, ${order.shipping.province}` : ""}, {order.shipping.country}</p>
              {order.shipping.postalCode && <p>{order.shipping.postalCode}</p>}
              <p className="mt-1">{order.shipping.phone}</p>
            </div>
          </div>

          {/* Payment */}
          {order.payment && (
            <div>
              <p className="text-[10px] tracking-[0.25em] uppercase text-[var(--muted)] mb-3">Payment</p>
              <div className="border border-[#E8E8E8] px-5 py-4 text-[12px] text-[var(--muted)] flex items-center justify-between">
                <span>{order.payment.method === "COD" ? "Cash on Delivery" : "Card"}</span>
                <span className={order.payment.status === "Completed" ? "text-green-600" : "text-amber-600"}>
                  {order.payment.status}
                </span>
              </div>
            </div>
          )}

          {order.notes && (
            <div>
              <p className="text-[10px] tracking-[0.25em] uppercase text-[var(--muted)] mb-3">Notes</p>
              <div className="border border-[#E8E8E8] px-5 py-4 text-[12px] text-[var(--muted)] leading-relaxed">
                {order.notes}
              </div>
            </div>
          )}
        </div>

        {/* Right — timeline */}
        <div>
          <p className="text-[10px] tracking-[0.25em] uppercase text-[var(--muted)] mb-5">Order Timeline</p>
          <OrderTimeline order={order} />
        </div>
      </div>
    </div>
  );
}
