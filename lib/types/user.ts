export interface UserProfileDTO {
  id:    string;
  name:  string;
  email: string;
  phone: string | null;
}

export interface DashboardStatsDTO {
  totalOrders:     number;
  pendingOrders:   number;
  deliveredOrders: number;
  totalSpent:      number;
}
