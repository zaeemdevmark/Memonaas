import Link from "next/link";
import NewsletterForm from "@/components/NewsletterForm";

const collectionLinks = [
  { label: "Nayab Casual",      href: "/collections/nayab-casual" },
  { label: "Nayab Semi Formal", href: "/collections/nayab-semi-formal" },
  { label: "Nayab Prints",      href: "/collections/nayab-prints" },
  { label: "Shop All",          href: "/shop" },
];

const quickLinks = [
  { label: "About Us",           href: "/about-us" },
  { label: "Contact Us",         href: "/contact-us" },
  { label: "Track Order",        href: "/track-order" },
  { label: "Shipping Policy",    href: "/shipping-policy" },
  { label: "Privacy Policy",     href: "/privacy-policy" },
  { label: "Exchanges & Refunds", href: "/returns-exchange" },
  { label: "Terms of Use",       href: "/terms-conditions" },
];

const socialLinks = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/nayabposh?igsh=ZjhqbDhrNm03ZnYx&utm_source=qr",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069Zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073Zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324ZM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881Z" />
      </svg>
    ),
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/profile.php?id=61583343042160&mibextid=wwXIfr",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073Z" />
      </svg>
    ),
  },
  {
    label: "Pinterest",
    href: "https://pin.it/MQXvI5GGN",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0Z" />
      </svg>
    ),
  },
  {
    label: "TikTok",
    href: "https://www.tiktok.com/@nayabposh.com?_r=1&_t=ZS-97aqaDVb43Y",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.74a4.85 4.85 0 0 1-1.01-.05Z" />
      </svg>
    ),
  },
  {
    label: "YouTube",
    href: "https://youtube.com/@nayabposh?si=rp-4w4bzKtPAwJH6",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814ZM9.545 15.568V8.432L15.818 12l-6.273 3.568Z" />
      </svg>
    ),
  },
];

export default function Footer() {
  return (
    <footer className="bg-white border-t border-[var(--border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 pb-16 min-[992px]:pt-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">

          {/* Brand */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium tracking-[0.01em] uppercase text-[var(--black)]">
              Nayab Posh
            </h3>
            <p className="text-sm text-[var(--black)] leading-relaxed max-w-xs">
              At <span className="font-semibold">Nayab Posh</span>, we are dedicated to creating contemporary designs that empower modern women to express themselves.
            </p>
            <div className="flex items-center gap-4 pt-2">
              {socialLinks.map((s) => (
                <Link
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--muted)] hover:text-[var(--black)] transition-colors"
                >
                  {s.icon}
                </Link>
              ))}
            </div>
          </div>

          {/* Collections */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium tracking-[0.01em] uppercase text-[var(--black)]">
              Collections
            </h3>
            <ul className="space-y-2.5">
              {collectionLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-[var(--black)] hover:opacity-60 transition-opacity"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium tracking-[0.01em] uppercase text-[var(--black)]">
              Quick Links
            </h3>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-[var(--black)] hover:opacity-60 transition-opacity"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium tracking-[0.01em] uppercase text-[var(--black)]">
              Subscribe to our Newsletter
            </h3>
            <p className="text-sm text-[var(--black)]">
              Be the first to know about new arrivals and exclusive offers.
            </p>
            <NewsletterForm />
          </div>

        </div>

        {/* Bottom */}
        <div className="mt-16 pt-8 border-t border-[var(--border)] flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs text-[var(--muted)]">
            © {new Date().getFullYear()} Nayab Posh. All rights reserved.
          </p>
          <p className="text-xs text-[var(--muted)]">
            Crafted with care in Pakistan
          </p>
        </div>
      </div>
    </footer>
  );
}
