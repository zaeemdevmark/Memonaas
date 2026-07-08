import Link from "next/link";
import NewsletterForm from "@/components/NewsletterForm";

const shopLinks = [
  { label: "Shop All",   href: "/shop" },
  { label: "Track Order", href: "/track-order" },
];

const quickLinks = [
  { label: "About Us",           href: "/about-us" },
  { label: "Contact Us",         href: "/contact-us" },
  { label: "Shipping Policy",    href: "/shipping-policy" },
  { label: "Privacy Policy",     href: "/privacy-policy" },
  { label: "Exchanges & Refunds", href: "/returns-exchange" },
  { label: "Terms of Use",       href: "/terms-conditions" },
];

const socialLinks = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/memonaas",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069Zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073Zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324ZM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881Z" />
      </svg>
    ),
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/memonaas",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073Z" />
      </svg>
    ),
  },
  {
    label: "TikTok",
    href: "https://www.tiktok.com/@memonaas",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.74a4.85 4.85 0 0 1-1.01-.05Z" />
      </svg>
    ),
  },
];

export default function Footer() {
  return (
    <footer className="bg-[var(--surface)] border-t border-[var(--border)]">
      <div className="max-w-[1400px] mx-auto px-5 md:px-10 pt-16 pb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">

          <div className="space-y-4 lg:col-span-2 lg:pr-12">
            <span className="font-display text-2xl text-[var(--ink)]">Memonaas</span>
            <p className="text-sm text-[var(--muted)] leading-relaxed max-w-sm">
              Considered clothing for everyday life — modern silhouettes, honest fabrics,
              thoughtfully made.
            </p>
            <div className="flex items-center gap-4 pt-2">
              {socialLinks.map((s) => (
                <Link
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--muted)] hover:text-[var(--accent)] transition-colors"
                >
                  {s.icon}
                </Link>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-[11px] font-medium tracking-[0.2em] uppercase text-[var(--ink)]">Shop</h3>
            <ul className="space-y-2.5">
              {shopLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-[var(--muted)] hover:text-[var(--ink)] transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-[11px] font-medium tracking-[0.2em] uppercase text-[var(--ink)]">Support</h3>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-[var(--muted)] hover:text-[var(--ink)] transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>

        <div className="mt-14 pt-8 border-t border-[var(--border)] grid grid-cols-1 sm:grid-cols-2 gap-6 items-start">
          <div className="space-y-3">
            <h3 className="text-[11px] font-medium tracking-[0.2em] uppercase text-[var(--ink)]">Stay in the loop</h3>
            <p className="text-sm text-[var(--muted)]">Be the first to know about new arrivals and offers.</p>
            <NewsletterForm />
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-[var(--border)] flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs text-[var(--muted)]">
            © {new Date().getFullYear()} Memonaas. All rights reserved.
          </p>
          <p className="text-xs text-[var(--muted)]">
            Crafted with care in Pakistan
          </p>
        </div>
      </div>
    </footer>
  );
}
