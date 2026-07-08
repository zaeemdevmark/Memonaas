import Link from "next/link";
import { requireCustomer }            from "@/lib/auth/helpers";
import { getUserDashboardStats, getUserRecentOrders } from "@/lib/services/order.service";
import { fp, formatDate, StatusBadge } from "@/components/dashboard/ui";

function StatCard({ value, label, icon }: { value: string | number; label: string; icon: React.ReactNode }) {
  return (
    <div className="border border-[var(--border)] p-6 hover:border-[var(--muted)] transition-colors duration-200 group">
      <div className="flex items-start justify-between mb-4">
        <div className="text-[var(--muted)] group-hover:text-[var(--accent)] transition-colors duration-200">{icon}</div>
      </div>
      <p className="font-display text-3xl text-[var(--ink)] mb-1">{value}</p>
      <p className="text-[11px] tracking-[0.15em] uppercase text-[var(--muted)]">{label}</p>
    </div>
  );
}

export default async function DashboardHomePage() {
  const { session, customerId } = await requireCustomer();
  const firstName = session.user.name.split(" ")[0];

  const [stats, recentOrders] = await Promise.all([
    getUserDashboardStats(customerId),
    getUserRecentOrders(customerId, 3),
  ]);

  return (
    <div>
      <div className="mb-10">
        <p className="text-[10px] tracking-[0.3em] uppercase text-[var(--muted)] mb-2">Member Area</p>
        <h1 className="font-display text-3xl sm:text-4xl text-[var(--ink)]">
          Welcome back, {firstName}
        </h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard
          value={stats.totalOrders}
          label="Total Orders"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007Z" />
            </svg>
          }
        />
        <StatCard
          value={stats.pendingOrders}
          label="Pending Orders"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
          }
        />
        <StatCard
          value={stats.deliveredOrders}
          label="Delivered"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
          }
        />
        <StatCard
          value={fp(stats.totalSpent)}
          label="Total Spent"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" />
            </svg>
          }
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[11px] tracking-[0.25em] uppercase text-[var(--black)] font-medium">Recent Orders</h2>
          <Link
            href="/dashboard/orders"
            className="text-[10px] tracking-[0.15em] uppercase text-[var(--muted)] hover:text-[var(--accent)] transition-colors underline underline-offset-2"
          >
            View all
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="border border-[var(--border)] px-6 py-12 text-center">
            <p className="text-[13px] text-[var(--black)] font-medium mb-1">No orders yet</p>
            <p className="text-[12px] text-[var(--muted)]">Your recent orders will appear here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="border border-[var(--border)] px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-[var(--muted)] transition-colors duration-200"
              >
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-[12px] font-medium text-[var(--black)]">#{order.orderNumber}</p>
                    <p className="text-[10px] text-[var(--muted)] mt-0.5">
                      {formatDate(order.createdAt)} · {order.totalItems} item{order.totalItems !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <StatusBadge status={order.status} />
                  <span className="text-[12px] text-[var(--black)] font-medium">{fp(order.total)}</span>
                  <Link
                    href={`/dashboard/orders/${order.id}`}
                    className="text-[10px] tracking-[0.15em] uppercase text-[var(--muted)] hover:text-[var(--accent)] transition-colors border border-[var(--border)] hover:border-[var(--accent)] px-3 py-1.5"
                  >
                    View
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
