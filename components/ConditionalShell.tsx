"use client";

import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// Overlay: defer loading until after hydration.
// Not needed for the initial paint or for crawlers.
const CartDrawer = dynamic(() => import("@/components/CartDrawer"), { ssr: false });

interface Props {
  children: React.ReactNode;
  role: string | null;
}

export default function ConditionalShell({ children, role }: Props) {
  const pathname    = usePathname();
  const isAdminPath = pathname?.startsWith("/admin");
  const isHome      = pathname === "/";

  if (isAdminPath) return <>{children}</>;

  return (
    <>
      {/* Homepage renders its own Header — placed between the hero and the
          2nd section in app/page.tsx — instead of here at the very top. */}
      {!isHome && <Header role={role} />}
      <main className="flex-1">{children}</main>
      <Footer />
      <CartDrawer />
    </>
  );
}
