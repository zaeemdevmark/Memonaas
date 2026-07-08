import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost";
type Size    = "sm" | "md" | "lg";

const VARIANT_CLS: Record<Variant, string> = {
  primary:   "bg-[var(--ink)] text-[var(--surface)] hover:bg-[var(--accent-ink)]",
  secondary: "bg-transparent text-[var(--ink)] border border-[var(--ink)] hover:bg-[var(--ink)] hover:text-[var(--surface)]",
  ghost:     "bg-transparent text-[var(--ink)] hover:text-[var(--accent)]",
};

const SIZE_CLS: Record<Size, string> = {
  sm: "px-4 py-2 text-[13px]",
  md: "px-6 py-3 text-sm",
  lg: "px-8 py-4 text-[15px]",
};

const BASE = "inline-flex items-center justify-center gap-2 rounded-full font-medium tracking-wide transition-colors duration-200 disabled:opacity-40 disabled:pointer-events-none";

type CommonProps = {
  variant?: Variant;
  size?:    Size;
  children: ReactNode;
  className?: string;
};

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: CommonProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={`${BASE} ${VARIANT_CLS[variant]} ${SIZE_CLS[size]} ${className}`} {...props} />
  );
}

export function LinkButton({
  variant = "primary",
  size = "md",
  className = "",
  href,
  children,
}: CommonProps & { href: string }) {
  return (
    <Link href={href} className={`${BASE} ${VARIANT_CLS[variant]} ${SIZE_CLS[size]} ${className}`}>
      {children}
    </Link>
  );
}
