import { requireAuth } from "@/lib/auth/helpers";
import DashboardShell  from "@/components/dashboard/DashboardShell";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAuth();
  const user    = { name: session.user.name, email: session.user.email };

  return (
    <DashboardShell user={user}>
      {children}
    </DashboardShell>
  );
}
