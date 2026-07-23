import PolicyLayout, {
  PolicyP,
  PolicyList,
  PolicyCallout,
  PolicyContactBox,
} from "@/components/policy/PolicyLayout";
import { buildMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = buildMetadata({
  title:       "Shipping Policy",
  description: "Learn about Memonaas shipping rates, delivery timelines, and our free shipping threshold for orders across Pakistan.",
  path:        "/shipping-policy",
});

function ShippingTimeline() {
  const stages = [
    { label: "Order Placed",  detail: "Confirmed immediately",          icon: "01" },
    { label: "Processing",    detail: "1–2 business days",              icon: "02" },
    { label: "Dispatched",    detail: "Handed to courier",              icon: "03" },
    { label: "In Transit",    detail: "3–5 business days (nationwide)", icon: "04" },
    { label: "Delivered",     detail: "At your doorstep",               icon: "05" },
  ];

  return (
    <div className="my-4 space-y-0">
      {stages.map((s, i) => (
        <div key={s.label} className="flex items-start gap-4 group">
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 rounded-full border border-[var(--black)] flex items-center justify-center text-[10px] font-medium text-[var(--black)] shrink-0">
              {s.icon}
            </div>
            {i < stages.length - 1 && <div className="w-px h-8 bg-[var(--border)] mt-0.5" />}
          </div>
          <div className="pt-1.5 pb-4">
            <p className="text-[13px] font-medium text-[var(--black)]">{s.label}</p>
            <p className="text-[12px] text-[var(--muted)]">{s.detail}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ShippingPolicyPage() {
  return (
    <PolicyLayout
      badge="Shipping & Delivery"
      title="Shipping Policy"
      description="We ship across Pakistan with care and speed. Here's everything you need to know about our delivery timelines, rates, and process."
      lastUpdated="June 2026"
      sections={[
        {
          id:    "delivery-areas",
          title: "Where We Ship",
          content: (
            <>
              <PolicyP>
                We currently ship to all cities and towns across Pakistan through our trusted courier partners — TCS, Leopards Courier, and BlueEx.
              </PolicyP>
              <PolicyCallout>
                We do not currently offer international shipping. All orders are dispatched from our facility in Lahore.
              </PolicyCallout>
              <PolicyP>
                If you are located in a remote area that may not be covered by standard courier routes, please contact us before placing your order so we can confirm delivery feasibility.
              </PolicyP>
            </>
          ),
        },
        {
          id:    "rates",
          title: "Shipping Rates",
          content: (
            <>
              <div className="border border-[var(--border)] divide-y divide-[var(--border)] my-2">
                <div className="flex items-center justify-between px-4 py-3.5 bg-[var(--bg)]">
                  <span className="text-[10px] tracking-[0.15em] uppercase text-[var(--muted)]">Order Value</span>
                  <span className="text-[10px] tracking-[0.15em] uppercase text-[var(--muted)]">Shipping Fee</span>
                </div>
                <div className="flex items-center justify-between px-4 py-4">
                  <span className="text-[13px] text-[var(--black)]">Orders above Rs. 5,000</span>
                  <span className="text-[13px] font-medium text-[var(--black)]">Free</span>
                </div>
                <div className="flex items-center justify-between px-4 py-4">
                  <span className="text-[13px] text-[var(--black)]">Orders below Rs. 5,000</span>
                  <span className="text-[13px] font-medium text-[var(--black)]">Rs. 200</span>
                </div>
              </div>
              <PolicyP>
                The shipping fee (if applicable) is calculated at checkout before you confirm your order. Discount codes applied to your order may affect the final order value used to determine free shipping eligibility.
              </PolicyP>
            </>
          ),
        },
        {
          id:    "timeline",
          title: "Delivery Timeline",
          content: (
            <>
              <PolicyP>
                Once you place an order, here is what happens next:
              </PolicyP>
              <ShippingTimeline />
              <div className="border border-[var(--border)] divide-y divide-[var(--border)]">
                <div className="flex items-center justify-between px-4 py-3.5 bg-[var(--bg)]">
                  <span className="text-[10px] tracking-[0.15em] uppercase text-[var(--muted)]">Location</span>
                  <span className="text-[10px] tracking-[0.15em] uppercase text-[var(--muted)]">Estimated Delivery</span>
                </div>
                {[
                  ["Lahore",                   "1–2 business days"],
                  ["Karachi, Islamabad, Rawalpindi", "2–3 business days"],
                  ["Other major cities",        "3–4 business days"],
                  ["Remote / rural areas",      "5–7 business days"],
                ].map(([loc, time]) => (
                  <div key={loc} className="flex items-center justify-between px-4 py-3">
                    <span className="text-[13px] text-[var(--black)]">{loc}</span>
                    <span className="text-[12px] text-[var(--muted)]">{time}</span>
                  </div>
                ))}
              </div>
              <PolicyP>
                Business days are Monday through Saturday, excluding public holidays. Delivery estimates begin from the dispatch date, not the order date.
              </PolicyP>
            </>
          ),
        },
        {
          id:    "processing",
          title: "Order Processing",
          content: (
            <>
              <PolicyP>
                Orders placed before 2:00 PM PKT on business days are typically processed and dispatched the same day. Orders placed after 2:00 PM or on Sundays and public holidays will be processed on the next business day.
              </PolicyP>
              <PolicyList
                items={[
                  "You will receive an order confirmation email/SMS immediately after placing your order",
                  "A dispatch notification with tracking details will be sent once your parcel is handed to the courier",
                  "You can also track your order on our Track Order page using your order number and email",
                ]}
              />
            </>
          ),
        },
        {
          id:    "tracking",
          title: "Tracking Your Order",
          content: (
            <>
              <PolicyP>
                Once your order is dispatched, you will receive a tracking number via SMS and email. You can use this number directly on your courier&apos;s website, or use our built-in order tracking tool.
              </PolicyP>
              <PolicyP>
                To track your order on our site, visit the{" "}
                <a href="/track-order" className="text-[var(--black)] underline underline-offset-2 hover:opacity-60 transition-opacity">
                  Track Order
                </a>{" "}
                page and enter your order number and the email address used at checkout.
              </PolicyP>
            </>
          ),
        },
        {
          id:    "payment",
          title: "Payment Methods",
          content: (
            <>
              <PolicyP>We currently accept the following payment methods:</PolicyP>
              <PolicyList
                items={[
                  "Cash on Delivery (COD) — pay in cash when your parcel arrives",
                  "Bank Transfer — advance payment to our designated account",
                  "EasyPaisa / JazzCash — mobile wallet payments",
                ]}
              />
              <PolicyCallout>
                Cash on Delivery is available for orders up to Rs. 25,000. For higher-value orders, advance payment via bank transfer is required.
              </PolicyCallout>
            </>
          ),
        },
        {
          id:    "issues",
          title: "Lost, Delayed, or Damaged Parcels",
          content: (
            <>
              <PolicyP>
                While we take great care to ensure your order arrives on time and in perfect condition, occasionally courier delays may occur.
              </PolicyP>
              <PolicyList
                items={[
                  "If your order hasn't arrived within 7 business days of dispatch, please contact us immediately",
                  "For parcels showing as delivered but not received, report within 24 hours",
                  "For damaged parcels, photograph the sealed parcel before opening and contact us within 48 hours of delivery",
                ]}
              />
              <PolicyP>
                We will liaise with the courier on your behalf and ensure a resolution as quickly as possible.
              </PolicyP>
              <PolicyContactBox
                phone="+92 304 6665494"
                email="care@memonaas.com"
                hours="Mon – Sat, 10:00 AM – 6:00 PM PKT"
              />
            </>
          ),
        },
      ]}
    />
  );
}
