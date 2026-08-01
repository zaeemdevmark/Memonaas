// Shared product badge logic — one place that decides which single badge
// (if any) a product card / product page should show, so every listing
// surface agrees on the same rules.

export const NEW_ARRIVAL_DAYS    = 14; // product counts as "New Arrival" for this many days after creation
export const LOW_STOCK_THRESHOLD = 5;  // available stock at/below this shows "Only N Left"

export type BadgeType = "sold-out" | "limited-edition" | "bestseller" | "new-arrival" | "low-stock";

export interface BadgeInput {
  soldOut:           boolean;
  isLimitedEdition?: boolean;
  isBestseller?:     boolean;
  createdAt?:        string | Date | null;
  totalStock?:       number;
}

/**
 * Priority (highest first): Sold Out > Limited Edition > Bestseller >
 * New Arrival > Low Stock. Only one badge is ever shown per product so
 * cards stay small and non-intrusive.
 */
export function getProductBadge(input: BadgeInput): BadgeType | null {
  if (input.soldOut) return "sold-out";
  if (input.isLimitedEdition) return "limited-edition";
  if (input.isBestseller) return "bestseller";

  if (input.createdAt) {
    const createdMs = new Date(input.createdAt).getTime();
    if (!isNaN(createdMs)) {
      const ageDays = (Date.now() - createdMs) / (1000 * 60 * 60 * 24);
      if (ageDays <= NEW_ARRIVAL_DAYS) return "new-arrival";
    }
  }

  if (input.totalStock !== undefined && input.totalStock > 0 && input.totalStock <= LOW_STOCK_THRESHOLD) {
    return "low-stock";
  }

  return null;
}

export function badgeLabel(type: BadgeType, stock?: number): string {
  switch (type) {
    case "sold-out":         return "Sold Out";
    case "limited-edition":  return "Limited Edition";
    case "bestseller":       return "Bestseller";
    case "new-arrival":      return "New Arrival";
    case "low-stock":        return stock != null ? `Only ${stock} Left` : "Low Stock";
  }
}
