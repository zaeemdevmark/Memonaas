"use client";

import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// Overlay components: defer loading until after hydration.
// Neither is needed for the initial paint or for crawlers.
const CartDrawer  = dynamic(() => import("@/components/CartDrawer"),  { ssr: false });
const SearchModal = dynamic(() => import("@/components/SearchModal"), { ssr: false });

interface Props {
  children: React.ReactNode;
  role: string | null;
}

export default function ConditionalShell({ children, role }: Props) {
  const pathname    = usePathname();
  const isAdminPath = pathname?.startsWith("/admin");

  if (isAdminPath) return <>{children}</>;

  return (
    <>
      <Header role={role} />
      <main className="flex-1">{children}</main>
      <Footer />
      <CartDrawer />
      <SearchModal />
    </>
  );
}
