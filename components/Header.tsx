"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import { useUIStore } from "@/store/uiStore";
import { useWishlistStore } from "@/store/wishlistStore";

// ── Shared data ────────────────────────────────────────────────────────────

const collectionLinks = [
  { label: "Nayab Casual",      href: "/collections/nayab-casual" },
  { label: "Nayab Semi Formal", href: "/collections/nayab-semi-formal" },
  { label: "Nayab Prints",      href: "/collections/nayab-prints" },
];

// Mobile drawer nav links (flat — collections at top level, Account moved to bottom section)
const drawerLinks = [
  { label: "Home",              href: "/" },
  { label: "Nayab Casual",      href: "/collections/nayab-casual" },
  { label: "Nayab Semi Formal", href: "/collections/nayab-semi-formal" },
  { label: "Nayab Prints",      href: "/collections/nayab-prints" },
  { label: "Shop All",          href: "/shop" },
  { label: "About Us",          href: "/about-us" },
  { label: "Contact Us",        href: "/contact-us" },
];

// ── Desktop helpers ────────────────────────────────────────────────────────

const navClass =
  "group relative text-[13.5px] font-medium leading-none tracking-[0.01em] text-[#222222] whitespace-nowrap";

function NavUnderline({
  active,
  bottom  = "-6px",
  left    = "0",
  restW   = "w-0",
  hoverW  = "group-hover:w-full",
  activeW = "w-full",
}: {
  active:   boolean;
  bottom?:  string;
  left?:    string;
  restW?:   string;
  hoverW?:  string;
  activeW?: string;
}) {
  return (
    <span
      aria-hidden="true"
      style={{ bottom, left }}
      className={`absolute h-[1px] bg-current transition-[width] duration-300 ease ${
        active ? activeW : `${restW} ${hoverW}`
      }`}
    />
  );
}

function accountHref(role: string | null): string {
  if (role === "Admin")    return "/admin";
  if (role === "Customer") return "/dashboard";
  return "/login";
}

function isActive(href: string, pathname: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

// ── Reusable icon components ───────────────────────────────────────────────

function SearchIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
      strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
    </svg>
  );
}

function CloseIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
      strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
  );
}

function HamburgerIcon({ className = "w-[22px] h-[22px]" }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
      strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
  );
}

// ── Component ──────────────────────────────────────────────────────────────

interface Props { role: string | null }

export default function Header({ role }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { openCart, items } = useCartStore();
  const cartCount  = items.reduce((n, i) => n + i.quantity, 0);
  const { openSearch } = useUIStore();
  const { setIds: setWishlistIds } = useWishlistStore();
  const pathname   = usePathname();
  const accHref    = accountHref(role);

  // Load the customer's wishlist product ids once on mount
  useEffect(() => {
    if (role !== "Customer") return;
    fetch("/api/wishlist")
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          setWishlistIds(json.data.items.map((i: { productId: string }) => i.productId));
        }
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  // Desktop active states
  const isHome          = pathname === "/";
  const isShopAll       = pathname === "/shop";
  const isAboutUs       = pathname === "/about-us";
  const isContactUs     = pathname === "/contact-us";
  const isNayabCasual   = pathname === "/collections/nayab-casual";
  const isNayabSemi     = pathname === "/collections/nayab-semi-formal";
  const isNayabPrints   = pathname === "/collections/nayab-prints";
  const isOurCollection = isNayabCasual || isNayabSemi || isNayabPrints;
  const isAccount       = pathname.startsWith("/dashboard") || pathname.startsWith("/admin") || pathname === "/login";
  const isCart          = pathname === "/cart";

  // Lock body scroll while mobile drawer is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  // Auto-close drawer if viewport crosses the 992 px breakpoint
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 992px)");
    const handler = (e: MediaQueryListEvent) => { if (e.matches) setMenuOpen(false); };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const closeMenu = () => setMenuOpen(false);

  // Shared mobile header row markup — used in both navbar and drawer header
  const mobileHeaderRow = (isDrawer: boolean) => (
    <div
      className="grid items-center h-[54.5px] px-4 shrink-0"
      style={{
        gridTemplateColumns: "1fr auto 1fr",
        borderBottom: "1px solid rgba(0,0,0,0.08)",
      }}
    >
      {/* Left — X (drawer) or hamburger (navbar) */}
      <div className="flex items-center">
        {isDrawer ? (
          <button onClick={closeMenu} aria-label="Close menu"
            className="text-[#222222] hover:opacity-60 transition-opacity">
            <CloseIcon />
          </button>
        ) : (
          <button onClick={() => setMenuOpen(true)} aria-label="Open menu"
            className="text-[#222222] hover:opacity-60 transition-opacity">
            <HamburgerIcon />
          </button>
        )}
      </div>

      {/* Center — logo, always perfectly centered in the auto column */}
      <Link href="/" onClick={isDrawer ? closeMenu : undefined} className="flex items-center justify-center">
        <Image
          src="/logo.png"
          alt="Nayab Posh"
          width={120}
          height={30}
          style={{ width: "85px", height: "auto", objectFit: "contain" }}
          priority
        />
      </Link>

      {/* Right — search icon + Cart text */}
      <div className="flex items-center justify-end gap-4">
        <button onClick={openSearch} aria-label="Search"
          className="text-[#222222] hover:opacity-60 transition-opacity">
          <SearchIcon />
        </button>
        <button onClick={openCart}
          className="text-[13px] font-medium tracking-[0.01em] text-[#222222] hover:opacity-60 transition-opacity">
          Cart({cartCount})
        </button>
      </div>
    </div>
  );

  return (
    <header className="w-full bg-white sticky top-0 z-50">

      {/* ════════════════════════════════════════════════════════════════
          DESKTOP NAVBAR — unchanged, visible at ≥ 992 px
          ════════════════════════════════════════════════════════════════ */}
      <div
        className="hidden min-[992px]:grid items-center h-[100px]"
        style={{
          gridTemplateColumns: "5fr auto 5fr",
          gap: "2.4rem",
          paddingLeft: "2.4rem",
          paddingRight: "2.4rem",
        }}
      >
        {/* Left — nav links */}
        <nav className="flex items-center gap-[30px]">
          <Link href="/" className={navClass}>
            Home
            <NavUnderline active={isHome} />
          </Link>

          {/* Our Collection — hover dropdown */}
          <div className="relative group/col">
            <button className={`${navClass} group flex items-center gap-1`} aria-haspopup="true">
              Our Collection
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
                className="w-3 h-3 mt-px transition-transform duration-200 group-hover/col:rotate-180">
                <path d="M6 9l6 6 6-6" />
              </svg>
              <NavUnderline active={isOurCollection} />
            </button>
            <div className="absolute top-full left-0 pt-3 opacity-0 invisible translate-y-1 group-hover/col:opacity-100 group-hover/col:visible group-hover/col:translate-y-0 transition-all duration-200 z-50">
              <div className="bg-white border border-[#f0f0f0] shadow-sm py-2 min-w-[190px] rounded-[15px] overflow-hidden">
                {collectionLinks.map((link) => (
                  <Link key={link.label} href={link.href}
                    className="group relative block px-5 py-2.5 text-[13.5px] font-medium tracking-[0.02em] text-[#222222] whitespace-nowrap">
                    {link.label}
                    <NavUnderline active={pathname === link.href} bottom="6px" left="10%"
                      restW="w-0" hoverW="group-hover:w-[70%]" activeW="w-[70%]" />
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <Link href="/shop" className={navClass}>
            Shop All <NavUnderline active={isShopAll} />
          </Link>
          <Link href="/about-us" className={navClass}>
            About Us <NavUnderline active={isAboutUs} />
          </Link>
          <Link href="/contact-us" className={navClass}>
            Contact Us <NavUnderline active={isContactUs} />
          </Link>
        </nav>

        {/* Center — Logo */}
        <Link href="/" className="flex justify-center py-[10px]">
          <Image src="/logo.png" alt="Nayab Posh" width={120} height={55}
            style={{ width: "120px", height: "auto" }} className="object-contain" priority />
        </Link>

        {/* Right — Search, Account, Cart */}
        <div className="flex items-center gap-[30px] justify-end">
          <button onClick={openSearch} className={navClass}>
            Search <NavUnderline active={false} />
          </button>
          <Link href={accHref} className={navClass}>
            Account <NavUnderline active={isAccount} />
          </Link>
          <button onClick={openCart} className={navClass}>
            Cart<span className="ml-1">({cartCount})</span>
            <NavUnderline active={isCart} />
          </button>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════
          MOBILE NAVBAR — visible below 992 px (always visible)
          ════════════════════════════════════════════════════════════════ */}
      <div className="min-[992px]:hidden bg-white">
        {mobileHeaderRow(false)}
      </div>

      {/* ════════════════════════════════════════════════════════════════
          MOBILE FULL-SCREEN DRAWER — slides in from left, 100 vw × 100 vh
          ════════════════════════════════════════════════════════════════ */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className={`min-[992px]:hidden fixed inset-0 z-50 flex flex-col bg-white transition-transform duration-300 ease-in-out ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Drawer header — identical layout to navbar but with X on the left */}
        {mobileHeaderRow(true)}

        {/* Scrollable body */}
        <div className="flex flex-col flex-1 overflow-hidden">

          {/* Nav links */}
          <nav className="flex flex-col flex-1 overflow-y-auto px-5 pt-8 pb-6 gap-5">
            {drawerLinks.map((link) => {
              const active = isActive(link.href, pathname);
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={closeMenu}
                  className="group relative self-start text-[16px] font-medium tracking-[0.01em] text-[#222222] leading-snug transition-[transform,color] duration-300 ease-out hover:text-black hover:translate-x-1 active:scale-[0.98]"
                >
                  {link.label}
                  {/* left-to-right underline — stays full-width on active page */}
                  <span
                    aria-hidden="true"
                    className={`absolute bottom-[-6px] left-0 h-[1px] bg-current transition-[width] duration-300 ease ${
                      active ? "w-full" : "w-0 group-hover:w-full"
                    }`}
                  />
                </Link>
              );
            })}
          </nav>

          {/* Bottom account section */}
          <div
            className="shrink-0 px-5 pb-10 pt-6"
            style={{ borderTop: "1px solid rgba(0,0,0,0.08)" }}
          >
            {role ? (
              /* Logged-in: My Account — fill black on hover + slight lift */
              <Link
                href={accHref}
                onClick={closeMenu}
                className="flex items-center justify-center w-full h-12 border border-[#222222] text-[13px] font-medium tracking-[0.1em] uppercase bg-transparent text-[#222222] hover:bg-[#222222] hover:text-white hover:-translate-y-[1px] transition-all duration-300 ease active:scale-[0.98]"
              >
                My Account
              </Link>
            ) : (
              /* Guest: Login + Create Account */
              <>
                {/* Login — fill black on hover + slight lift */}
                <Link
                  href="/login"
                  onClick={closeMenu}
                  className="flex items-center justify-center w-full h-12 border border-[#222222] text-[13px] font-medium tracking-[0.1em] uppercase bg-transparent text-[#222222] hover:bg-[#222222] hover:text-white hover:-translate-y-[1px] transition-all duration-300 ease active:scale-[0.98]"
                >
                  Login
                </Link>
                <div className="text-center mt-4">
                  {/* Create Account — left-to-right animated underline */}
                  <Link
                    href="/register"
                    onClick={closeMenu}
                    className="group relative inline-block text-[13px] font-normal tracking-[0.01em] text-[#222222] hover:text-black transition-colors duration-300"
                  >
                    Create Account
                    <span aria-hidden="true" className="absolute bottom-[-1px] left-0 h-[1px] bg-[#222222] w-0 group-hover:w-full transition-[width] duration-300 ease" />
                  </Link>
                </div>
              </>
            )}
          </div>

        </div>
      </div>

    </header>
  );
}
