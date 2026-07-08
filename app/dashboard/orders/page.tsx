import Link from "next/link";
import { requireCustomer }  from "@/lib/auth/helpers";
import { getUserOrders }    from "@/lib/services/order.service";
import { parseOrdersQuery } from "@/lib/validations/order";
import { fp, formatDate, StatusBadge, SectionTitle, EmptyState } from "@/components/dashboard/ui";

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function Pagination({ page, totalPages }: { page: number; totalPages: number }) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between mt-8 pt-6 border-t border-[var(--border)]">
      <Link
        href={page > 1 ? `?page=${page - 1}` : "#"}
        aria-disabled={page <= 1}
        className={`text-[10px] tracking-[0.2em] uppercase border px-4 py-2 transition-colors ${
          page <= 1
            ? "border-[var(--border)] text-[#D0D0D0] pointer-events-none"
            : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
        }`}
      >
        Previous
      </Link>
      <span className="text-[11px] text-[var(--muted)]">
        Page {page} of {totalPages}
      </span>
      <Link
        href={page < totalPages ? `?page=${page + 1}` : "#"}
        aria-disabled={page >= totalPages}
        className={`text-[10px] tracking-[0.2em] uppercase border px-4 py-2 transition-colors ${
          page >= totalPages
            ? "border-[var(--border)] text-[#D0D0D0] pointer-events-none"
            : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
        }`}
      >
        Next
      </Link>
    </div>
  );
}

export default async function OrdersPage({ searchParams }: Props) {
  const { customerId } = await requireCustomer();
  const sp = await searchParams;

  const rawParams = new URLSearchParams();
  if (typeof sp.page  === "string") rawParams.set("page",  sp.page);
  if (typeof sp.limit === "string") rawParams.set("limit", sp.limit);

  const parsed = parseOrdersQuery(rawParams);
  const query  = parsed.ok ? parsed.value : { page: 1, limit: 10 };

  const { orders, total } = await getUserOrders(customerId, query);
  const totalPages = Math.max(1, Math.ceil(total / query.limit));

  return (
    <div>
      <SectionTitle>My Orders</SectionTitle>

      {orders.length === 0 ? (
        <EmptyState
          title="No orders yet"
          body="Once you place an order, it will appear here."
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-12 h-12">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007Z" />
            </svg>
          }
        />
      ) : (
        <>
          <div className="space-y-3">
            {orders.map((order) => (
              <div key={order.id} className="border border-[var(--border)] hover:border-[#BBBBBB] transition-colors duration-200">
                <div className="px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-[13px] font-medium text-[var(--black)]">#{order.orderNumber}</p>
                    <p className="text-[11px] text-[var(--muted)]">{formatDate(order.createdAt)}</p>
                    <p className="text-[11px] text-[var(--muted)]">
                      {order.totalItems} item{order.totalItems !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-4">
                    <StatusBadge status={order.status} />
                    <span className="text-[13px] font-medium text-[var(--black)]">{fp(order.total)}</span>
                    <Link
                      href={`/dashboard/orders/${order.id}`}
                      className="text-[10px] tracking-[0.2em] uppercase border border-[var(--black)] text-[var(--black)] px-4 py-2 hover:bg-[var(--black)] hover:text-white transition-colors duration-200"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Pagination page={query.page} totalPages={totalPages} />
        </>
      )}
    </div>
  );
}
