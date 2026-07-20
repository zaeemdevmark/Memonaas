"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import MobileNav from "@/components/MobileNav";
import { NAV_LINKS } from "@/lib/nav";

function accountHref(role: string | null): string {
  if (role === "Admin")    return "/admin";
  if (role === "Customer") return "/dashboard";
  return "/login";
}

function isActive(href: string, pathname: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

function SearchIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.836l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 1.98-4.706 2.545-7.192.135-.6-.336-1.158-.95-1.158H5.106M7.5 14.25 5.106 5.272M6 18.75a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
    </svg>
  );
}

function AccountIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
  );
}

function HamburgerIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
  );
}

interface Props { role: string | null }

export default function Header({ role }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { openCart, items } = useCartStore();
  const cartCount = items.reduce((n, i) => n + i.quantity, 0);
  const { setIds: setWishlistIds } = useWishlistStore();
  const pathname = usePathname();
  const accHref = accountHref(role);

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

  return (
    <header className="sticky top-0 w-full z-40 bg-[var(--bg)] border-b border-[var(--border)]">
      <div className="relative mx-auto max-w-[1400px] px-5 md:px-10 h-[76px] flex items-center justify-between gap-6">

        {/* Left — mobile hamburger / desktop wordmark */}
        <div className="flex items-center gap-8">
          <button
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            className="min-[992px]:hidden text-[var(--ink)] -ml-1 p-1"
          >
            <HamburgerIcon />
          </button>

          <Link href="/" aria-label="Memonaas home" className="shrink-0">
            <Image
              src="/images/logo-memonaas.png"
              alt="Memonaas"
              width={1200}
              height={242}
              priority
              className="h-8 md:h-9 w-auto -mt-1"
            />
          </Link>
        </div>

        {/* Center — desktop nav links, absolutely centered on the header row */}
        <nav className="hidden min-[992px]:flex items-center gap-7 absolute left-1/2 -translate-x-1/2">
          {NAV_LINKS.map((link) => {
            const active = isActive(link.href, pathname);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`group relative pb-0.5 text-[16.5px] font-medium tracking-wide ${
                  active ? "font-display text-[var(--accent)]" : "text-[var(--ink)]"
                }`}
              >
                {link.label}
                <span
                  aria-hidden="true"
                  className={`absolute left-0 -bottom-0 h-[1.5px] w-full bg-[var(--accent)] origin-left transition-transform duration-300 ease-out ${
                    active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                  }`}
                />
              </Link>
            );
          })}
        </nav>

        {/* Right — search / account / cart */}
        <div className="flex items-center gap-5 text-[var(--ink)]">
          <Link href="/search" aria-label="Search" className="hover:text-[var(--accent)] transition-colors p-1">
            <SearchIcon />
          </Link>
          <Link href={accHref} aria-label="Account" className="hidden min-[992px]:inline-flex hover:text-[var(--accent)] transition-colors p-1">
            <AccountIcon />
          </Link>
          <button onClick={openCart} aria-label="Cart" className="relative hover:text-[var(--accent)] transition-colors p-1">
            <CartIcon />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[16px] h-4 px-[3px] rounded-full bg-[var(--accent)] text-[10px] font-medium text-white leading-none">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      <MobileNav open={menuOpen} onClose={() => setMenuOpen(false)} role={role} accountHref={accHref} />
    </header>
  );
}
