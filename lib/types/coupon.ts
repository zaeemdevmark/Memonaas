export interface CouponDTO {
  id:            string;
  code:          string;
  description:   string | null;
  discountType:  "Percentage" | "Fixed";
  discountValue: number;
  minOrderValue: number | null;
  maxDiscount:   number | null;
  usageLimit:    number | null;
  usedCount:     number;
  isActive:      boolean;
  startDate:     string | null;
  endDate:       string | null;
  createdAt:     string;
  updatedAt:     string;
}

export interface ApplyCouponResult {
  couponId:        string;
  code:            string;
  discountType:    "Percentage" | "Fixed";
  discountValue:   number;
  discountAmount:  number;
  subtotal:        number;
  updatedSubtotal: number;
}

export interface CouponListResult {
  items: CouponDTO[];
  total: number;
}
