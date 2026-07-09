"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_LINKS } from "@/lib/nav";

function isActive(href: string, pathname: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

interface Props {
  open:      boolean;
  onClose:   () => void;
  role:      string | null;
  accountHref: string;
}

export default function MobileNav({ open, onClose, role, accountHref }: Props) {
  const pathname = usePathname();

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Navigation menu"
      aria-hidden={!open}
      className={`min-[992px]:hidden fixed inset-0 z-50 flex flex-col bg-[var(--bg)] transition-transform duration-300 ease-in-out ${
        open ? "translate-x-0" : "-translate-x-full pointer-events-none"
      }`}
    >
      <div className="flex items-center justify-between h-[64px] px-5 border-b border-[var(--border)] shrink-0">
        <span className="font-display text-xl text-[var(--ink)]">Memonaas</span>
        <button onClick={onClose} aria-label="Close menu" className="text-[var(--ink)] p-1 hover:text-[var(--accent)] transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <nav className="flex flex-col flex-1 overflow-y-auto px-5 pt-8 pb-6 gap-6">
        {NAV_LINKS.map((link) => {
          const active = isActive(link.href, pathname);
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              className={`font-display text-2xl leading-snug transition-colors ${
                active ? "text-[var(--accent)]" : "text-[var(--ink)] hover:text-[var(--accent)]"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="shrink-0 px-5 pb-10 pt-6 border-t border-[var(--border)] space-y-4">
        <Link
          href={accountHref}
          onClick={onClose}
          className="flex items-center justify-center w-full h-12 rounded-full bg-[var(--ink)] text-[var(--surface)] text-[13px] font-medium tracking-[0.1em] uppercase hover:bg-[var(--accent-ink)] transition-colors"
        >
          {role ? "My Account" : "Login"}
        </Link>
        {!role && (
          <div className="text-center">
            <Link
              href="/register"
              onClick={onClose}
              className="text-[13px] text-[var(--muted)] hover:text-[var(--ink)] underline underline-offset-4 transition-colors"
            >
              Create an account
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
