"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import DashboardSidebar from "./Sidebar";

const PAGE_LABELS: Record<string, string> = {
  "/dashboard":           "Dashboard",
  "/dashboard/orders":    "My Orders",
  "/dashboard/addresses": "Addresses",
  "/dashboard/profile":   "Profile Settings",
};

interface Props {
  user:     { name: string; email: string };
  children: React.ReactNode;
}

export default function DashboardShell({ user, children }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const isOrderDetail = /^\/dashboard\/orders\/.+$/.test(pathname);
  const label = isOrderDetail
    ? "Order Details"
    : (PAGE_LABELS[pathname] ?? "Dashboard");

  return (
    <div className="flex min-h-[calc(100vh-96px)] relative bg-white">
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/30 z-[54] lg:hidden"
        />
      )}

      <aside className={`
        fixed lg:relative inset-y-0 left-0 z-[55] lg:z-auto
        w-64 bg-white border-r border-[var(--border)]
        flex flex-col shrink-0
        transition-transform duration-300 ease-in-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        overflow-y-auto
      `}>
        <DashboardSidebar user={user} onClose={() => setSidebarOpen(false)} />
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <div className="lg:hidden flex items-center gap-4 px-4 py-4 border-b border-[var(--border)] bg-white sticky top-0 z-10">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-[var(--muted)] hover:text-[var(--accent)] transition-colors"
            aria-label="Open menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
          <span className="text-[11px] tracking-[0.2em] uppercase text-[var(--black)]">{label}</span>
        </div>

        <div className="flex-1 overflow-y-auto px-6 sm:px-10 py-10">
          {children}
        </div>
      </div>
    </div>
  );
}
