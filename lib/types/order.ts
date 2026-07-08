// ── Nested DTOs ────────────────────────────────────────────────────────────

export interface OrderItemDTO {
  id:             string;
  productId:      string;
  variantId:      string;
  productName:    string;
  size:           string;
  color:          string;
  unitPrice:      number;
  salePrice:      number | null;
  /** salePrice if present, otherwise unitPrice. */
  effectivePrice: number;
  quantity:       number;
  lineTotal:      number;
}

export interface PaymentDTO {
  id:            string;
  method:        string;
  status:        string;
  amount:        number;
  transactionId: string | null;
  failureReason: string | null;
  paidAt:        string | null;
}

export interface ShippingAddressDTO {
  name:       string;
  email:      string;
  phone:      string;
  street:     string;
  city:       string;
  province:   string;
  postalCode: string;
  country:    string;
}

export interface OrderStatusHistoryDTO {
  id:        string;
  status:    string;
  note:      string | null;
  createdAt: string;
}

// ── Core DTOs ──────────────────────────────────────────────────────────────

/** Full order — returned by GET /api/orders/[id] and POST /api/orders. */
export interface OrderDTO {
  id:             string;
  orderNumber:    string;
  status:         string;
  items:          OrderItemDTO[];
  payment:        PaymentDTO | null;
  statusHistory:  OrderStatusHistoryDTO[];
  subtotal:       number;
  discountAmount: number;
  shippingCost:   number;
  taxAmount:      number;
  total:          number;
  shipping:       ShippingAddressDTO;
  notes:          string | null;
  createdAt:      string;
  updatedAt:      string;
}

/** Lightweight order — returned by GET /api/orders list (customer). */
export interface OrderSummaryDTO {
  id:          string;
  orderNumber: string;
  status:      string;
  total:       number;
  totalItems:  number;
  createdAt:   string;
}

/** Admin list entry — includes payment and customer snapshot. */
export interface AdminOrderSummaryDTO {
  id:            string;
  orderNumber:   string;
  status:        string;
  payment:       { method: string; status: string } | null;
  total:         number;
  totalItems:    number;
  shipName:      string;
  customerEmail: string | null;
  customerPhone: string | null;
  createdAt:     string;
}

/** Order item with product thumbnail — returned by customer order detail. */
export interface CustomerOrderItemDTO extends OrderItemDTO {
  productImage: string | null;
}

/** Full order with product images — returned by customer dashboard detail view. */
export interface CustomerOrderDTO extends Omit<OrderDTO, "items"> {
  items: CustomerOrderItemDTO[];
}
