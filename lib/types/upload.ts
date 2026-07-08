// ── Core URL set ─────────────────────────────────────────────────────────────

export interface ImageUrls {
  url:          string;
  optimizedUrl: string;
  thumbnailUrl: string;
  publicId:     string;
}

// ── Product image ─────────────────────────────────────────────────────────────

export interface ProductImageDTO {
  id:           string;
  productId:    string;
  url:          string;
  optimizedUrl: string | null;
  thumbnailUrl: string | null;
  publicId:     string | null;
  altText:      string | null;
  position:     number;
  isDefault:    boolean;
  createdAt:    string;
  updatedAt:    string;
}

// ── Category image ────────────────────────────────────────────────────────────

export interface CategoryImageDTO {
  categoryId:   string;
  url:          string;
  optimizedUrl: string;
  thumbnailUrl: string;
  publicId:     string;
}

// ── Size guide image ──────────────────────────────────────────────────────────

export interface SizeGuideImageDTO {
  slot:         1 | 2;
  url:          string;
  optimizedUrl: string;
}

// ── Brand asset ───────────────────────────────────────────────────────────────

export interface BrandAssetDTO {
  id:           string;
  type:         string;
  url:          string;
  optimizedUrl: string;
  thumbnailUrl: string;
  publicId:     string;
  createdAt:    string;
  updatedAt:    string;
}
