export interface WishlistProductDTO {
  id:        string;
  slug:      string;
  name:      string;
  basePrice: number;
  salePrice: number | null;
  image:     { url: string; optimizedUrl: string | null; altText: string | null } | null;
  soldOut:   boolean;
}

export interface WishlistItemDTO {
  id:        string;
  productId: string;
  product:   WishlistProductDTO;
  createdAt: string;
}

export interface WishlistDTO {
  items:      WishlistItemDTO[];
  totalItems: number;
}
