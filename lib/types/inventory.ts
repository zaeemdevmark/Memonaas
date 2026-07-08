export type InventoryStatus = "InStock" | "LowStock" | "OutOfStock";

export interface VariantInventoryDTO {
  variantId:         string;
  sku:               string;
  size:              string;
  color:             string;
  colorHex:          string | null;
  productId:         string;
  productName:       string;
  productSlug:       string;
  stock:             number;   // total physical inventory
  reservedStock:     number;   // committed to active orders
  availableStock:    number;   // stock − reservedStock
  lowStockThreshold: number;
  status:            InventoryStatus;
  updatedAt:         string;
}

export interface InventoryListResult {
  items: VariantInventoryDTO[];
  total: number;
}
