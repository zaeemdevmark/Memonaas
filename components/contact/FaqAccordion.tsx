"use client";

import { useState } from "react";

interface FaqItem {
  question: string;
  answer:   string;
}

interface FaqCategory {
  label: string;
  icon:  React.ReactNode;
  items: FaqItem[];
}

const FAQ_CATEGORIES: FaqCategory[] = [
  {
    label: "Shipping & Delivery",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
      </svg>
    ),
    items: [
      {
        question: "How long does delivery take?",
        answer:   "We deliver within 3–5 business days across Pakistan. Orders to major cities such as Karachi, Lahore, and Islamabad typically arrive within 2–3 business days. You will receive a tracking notification once your order is dispatched.",
      },
      {
        question: "Is free shipping available?",
        answer:   "Yes! Enjoy free shipping on all orders above Rs. 5,000. For orders below this amount, a flat delivery fee of Rs. 200 applies. Free shipping is automatically applied at checkout — no promo code needed.",
      },
      {
        question: "Do you ship to all cities in Pakistan?",
        answer:   "We ship to all major and secondary cities across Pakistan through our trusted courier partners. Delivery times may vary for remote areas. Currently, we do not offer international shipping, but we are working on expanding our reach.",
      },
    ],
  },
  {
    label: "Returns & Exchanges",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
      </svg>
    ),
    items: [
      {
        question: "What is your return policy?",
        answer:   "We accept returns within 7 days of delivery, provided the item is unworn, unwashed, and in its original packaging with all tags intact. Sale items and undergarments are not eligible for returns. Please retain your original packaging for return shipments.",
      },
      {
        question: "How do I initiate a return or exchange?",
        answer:   "To start a return or exchange, contact our customer support team via WhatsApp at +92 300 000 0000 or email us at support@memonaas.com with your order number and reason for the return. Our team will provide a return authorisation and guide you through the next steps.",
      },
      {
        question: "How long does a refund take?",
        answer:   "Once we receive and inspect your returned item, refunds are processed within 3–5 business days. For exchanges, your new item will be dispatched as soon as the return is confirmed.",
      },
    ],
  },
  {
    label: "Order Tracking",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
      </svg>
    ),
    items: [
      {
        question: "How can I track my order?",
        answer:   "Once your order is shipped, you will receive an email with a tracking number and courier details. You can use this tracking number on the courier's website to monitor your delivery in real time. You can also track your order through your account dashboard under 'My Orders'.",
      },
      {
        question: "Can I modify or cancel my order?",
        answer:   "Orders can be modified or cancelled within 24 hours of placement, provided they have not yet been processed for dispatch. To make changes, contact us immediately via WhatsApp or email with your order number. After the 24-hour window, we are unable to guarantee changes.",
      },
    ],
  },
  {
    label: "Payment",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 21Z" />
      </svg>
    ),
    items: [
      {
        question: "What payment methods do you accept?",
        answer:   "We currently accept Cash on Delivery (COD) for all orders across Pakistan. COD is a convenient and secure option that lets you pay only when your parcel arrives at your door. Online card payments are coming soon.",
      },
      {
        question: "Is it safe to shop on Memonaas?",
        answer:   "Absolutely. Our website uses industry-standard SSL encryption to ensure that all your personal information is handled securely. We never store sensitive payment data on our servers. You can shop with complete confidence.",
      },
    ],
  },
];

function FaqItem({ question, answer }: FaqItem) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-[var(--border)]">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-start justify-between gap-4 py-4 text-left group"
      >
        <span className="text-[13px] font-medium text-[var(--black)] group-hover:opacity-70 transition-opacity leading-snug">
          {question}
        </span>
        <span className={`shrink-0 mt-0.5 transition-transform duration-300 ${open ? "rotate-45" : "rotate-0"}`}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-[var(--muted)]">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </span>
      </button>
      {open && (
        <p className="pb-5 text-[13px] text-[var(--muted)] leading-relaxed pr-8">
          {answer}
        </p>
      )}
    </div>
  );
}

export default function FaqAccordion() {
  const [activeCategory, setActiveCategory] = useState(0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-12">
      {/* Category Tabs — vertical on desktop, pills on mobile */}
      <div className="lg:col-span-1">
        <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-1 lg:pb-0">
          {FAQ_CATEGORIES.map((cat, i) => (
            <button
              key={cat.label}
              onClick={() => setActiveCategory(i)}
              className={`flex items-center gap-2.5 px-4 py-3 text-left whitespace-nowrap lg:whitespace-normal rounded-lg transition-colors duration-150 shrink-0 lg:shrink ${
                activeCategory === i
                  ? "bg-[var(--ink)] text-[var(--surface)]"
                  : "bg-[var(--bg)] text-[var(--muted)] hover:text-[var(--accent)]"
              }`}
            >
              <span className={`shrink-0 ${activeCategory === i ? "text-[var(--surface)]" : "text-[var(--muted)]"}`}>
                {cat.icon}
              </span>
              <span className="text-[12px] font-medium tracking-wide">{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* FAQ Items */}
      <div className="lg:col-span-3">
        <div className="divide-y-0">
          {FAQ_CATEGORIES[activeCategory].items.map((item) => (
            <FaqItem key={item.question} {...item} />
          ))}
        </div>
      </div>
    </div>
  );
}
