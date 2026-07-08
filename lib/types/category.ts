// ── Shared building blocks ─────────────────────────────────────────────────

export interface CategoryParent {
  id:   string;
  name: string;
  slug: string;
}

export interface CategoryChildSummary {
  id:           string;
  name:         string;
  slug:         string;
  description:  string | null;
  imageUrl:     string | null;
  sortOrder:    number;
  productCount: number;
}

// ── List DTO ───────────────────────────────────────────────────────────────

/** Returned by GET /api/categories (flat list, default view). */
export interface CategoryListItem {
  id:            string;
  name:          string;
  slug:          string;
  description:   string | null;
  imageUrl:      string | null;
  sortOrder:     number;
  isActive:      boolean;
  parentId:      string | null;
  parent:        CategoryParent | null;
  productCount:  number;
  childrenCount: number;
  createdAt:     string;
  updatedAt:     string;
}

// ── Tree DTO ───────────────────────────────────────────────────────────────

/** Returned by GET /api/categories?tree=true. */
export interface CategoryTreeNode extends CategoryListItem {
  children: CategoryTreeNode[];
}

// ── Detail DTO ─────────────────────────────────────────────────────────────

/** Returned by GET /api/categories/[slug]. */
export interface CategoryDetail {
  id:           string;
  name:         string;
  slug:         string;
  description:  string | null;
  imageUrl:     string | null;
  sortOrder:    number;
  parentId:     string | null;
  parent:       CategoryParent | null;
  children:     CategoryChildSummary[];
  productCount: number;
  createdAt:    string;
  updatedAt:    string;
}
