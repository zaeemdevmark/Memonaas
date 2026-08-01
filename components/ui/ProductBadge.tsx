import type { BadgeType } from "@/lib/badges";
import { badgeLabel } from "@/lib/badges";

const STYLES: Record<BadgeType, string> = {
  "sold-out":        "bg-[var(--sold-out)]/10 text-[var(--sold-out)]",
  "limited-edition": "bg-[var(--ink)]/8 text-[var(--ink)]",
  "bestseller":      "bg-[var(--accent-soft)] text-[var(--accent-text)]",
  "new-arrival":     "bg-[var(--sage)]/10 text-[var(--sage)]",
  "low-stock":       "bg-red-50 text-red-500",
};

interface ProductBadgeProps {
  type:  BadgeType;
  stock?: number;
  className?: string;
}

export default function ProductBadge({ type, stock, className = "" }: ProductBadgeProps) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-[3px] px-2 py-[3px] text-[9.5px] font-medium tracking-[0.08em] uppercase ${STYLES[type]} ${className}`}
    >
      {badgeLabel(type, stock)}
    </span>
  );
}
