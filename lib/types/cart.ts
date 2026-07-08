// ── Nested DTOs ────────────────────────────────────────────────────────────

export interface CartItemImage {
  url:     string;
  altText: string | null;
}

export interface CartItemProduct {
  id:    string;
  name:  string;
  slug:  string;
  image: CartItemImage | null;
}

export interface CartItemVariant {
  id:        string;
  sku:       string;
  size:      string;
  color:     string;
  colorHex:  string | null;
  stock:     number;
  price:     number;
  salePrice: number | null;
}

// ── Core DTOs ──────────────────────────────────────────────────────────────

/** A single line in the cart. */
export interface CartItemDTO {
  id:             string;
  quantity:       number;
  variant:        CartItemVariant;
  product:        CartItemProduct;
  /** salePrice if set, otherwise price. */
  effectivePrice: number;
  /** effectivePrice × quantity. */
  lineTotal:      number;
}

/** Full cart returned by all cart endpoints. */
export interface CartDTO {
  id:         string;
  items:      CartItemDTO[];
  /** Sum of all item quantities. */
  totalItems: number;
  /** Sum of all lineTotals (in PKR). */
  subtotal:   number;
}

/** Returned when no cart cookie exists or the cart has been cleared. */
export interface EmptyCartDTO {
  id:         null;
  items:      [];
  totalItems: 0;
  subtotal:   0;
}
