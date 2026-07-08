import { buildMetadata } from "@/lib/seo";
import type { Metadata } from "next";
import TrackOrderClient from "@/components/track/TrackOrderClient";

export const metadata: Metadata = buildMetadata({
  title:       "Track Your Order",
  description: "Track your Memonaas order status in real time. Enter your order number and email to get live updates on your delivery.",
  path:        "/track-order",
});

export default function TrackOrderPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-[var(--bg)] py-16 sm:py-24 border-b border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-[10px] tracking-[0.35em] uppercase text-[var(--muted)] mb-4">
            Order Status
          </p>
          <h1
            className="text-4xl sm:text-5xl lg:text-6xl font-light text-[var(--black)] mb-5 leading-tight"
          >
            Track Your Order
          </h1>
          <div className="w-10 h-px bg-[var(--black)] mx-auto mb-5" />
          <p className="text-[13px] sm:text-[14px] text-[var(--muted)] leading-relaxed max-w-md mx-auto">
            Enter your order number and the email address used at checkout to see
            real-time updates on your delivery.
          </p>
        </div>
      </section>

      {/* Tracking form + result */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16 items-start">

            {/* Left — how to find your order number */}
            <aside className="lg:col-span-1 lg:sticky lg:top-24 order-2 lg:order-1">
              <div className="bg-[var(--bg)] border border-[var(--border)] p-6 space-y-5">
                <p className="text-[10px] tracking-[0.2em] uppercase text-[var(--muted)]">
                  Where to find your order number
                </p>

                <div className="space-y-4">
                  {[
                    {
                      step: "01",
                      title: "Confirmation email",
                      detail: "Check the email you used at checkout — your order number is in the subject line and body.",
                    },
                    {
                      step: "02",
                      title: "SMS notification",
                      detail: "If you provided a phone number, we also sent your order number via SMS.",
                    },
                    {
                      step: "03",
                      title: "My Account",
                      detail: "Logged-in customers can find all orders listed under My Account → Order History.",
                    },
                  ].map((item) => (
                    <div key={item.step} className="flex items-start gap-3">
                      <span className="text-[10px] tabular-nums text-[var(--muted)] mt-0.5 shrink-0">{item.step}</span>
                      <div>
                        <p className="text-[12px] font-medium text-[var(--black)]">{item.title}</p>
                        <p className="text-[11px] text-[var(--muted)] leading-relaxed mt-0.5">{item.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-[var(--border)] pt-5">
                  <p className="text-[11px] text-[var(--muted)] mb-3">Still can&apos;t find your order?</p>
                  <a
                    href="/contact-us"
                    className="text-[11px] tracking-[0.15em] uppercase text-[var(--black)] underline underline-offset-2 hover:opacity-60 transition-opacity"
                  >
                    Contact Support →
                  </a>
                </div>
              </div>
            </aside>

            {/* Right — client tracking form */}
            <div className="lg:col-span-2 order-1 lg:order-2">
              <TrackOrderClient />
            </div>

          </div>
        </div>
      </section>

      {/* Bottom strip */}
      <section className="py-12 bg-[var(--bg)] border-t border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            {[
              {
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mx-auto mb-2 text-[var(--muted)]">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                  </svg>
                ),
                label: "3–5 Business Days",
                detail: "Nationwide delivery",
              },
              {
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mx-auto mb-2 text-[var(--muted)]">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                  </svg>
                ),
                label: "Live Tracking",
                detail: "Real-time status updates",
              },
              {
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mx-auto mb-2 text-[var(--muted)]">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                  </svg>
                ),
                label: "Need Help?",
                detail: (
                  <a href="/contact-us" className="underline underline-offset-2 hover:opacity-60 transition-opacity">
                    Contact Support
                  </a>
                ) as unknown as string,
              },
            ].map((card) => (
              <div key={card.label} className="space-y-1">
                {card.icon}
                <p className="text-[12px] font-medium text-[var(--black)]">{card.label}</p>
                <p className="text-[11px] text-[var(--muted)]">{card.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
