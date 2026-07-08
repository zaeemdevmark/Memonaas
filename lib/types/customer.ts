export interface CustomerSummaryDTO {
  id:           string;
  email:        string;
  name:         string;
  phone:        string | null;
  totalOrders:  number;
  totalSpent:   number;
  lastOrderAt:  string | null;
  isRegistered: boolean;
  createdAt:    string;
}

export interface CustomerDetailDTO {
  id:            string;
  email:         string;
  name:          string;
  phone:         string | null;
  isRegistered:  boolean;
  totalOrders:   number;
  totalSpent:    number;
  avgOrderValue: number | null;
  lastOrderAt:   string | null;
  createdAt:     string;
  orders:        CustomerOrderHistoryDTO[];
  addresses:     CustomerAddressDTO[];
}

export interface CustomerOrderHistoryDTO {
  id:          string;
  orderNumber: string;
  status:      string;
  total:       number;
  totalItems:  number;
  createdAt:   string;
}

export interface CustomerAddressDTO {
  id:         string;
  label:      string | null;
  fullName:   string;
  phone:      string;
  street:     string;
  city:       string;
  province:   string;
  postalCode: string;
  country:    string;
  isDefault:  boolean;
}
