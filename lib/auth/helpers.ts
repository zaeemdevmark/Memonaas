import { auth } from "@/auth";
import { redirect } from "next/navigation";
import type { Session } from "next-auth";

export function isAdmin(session: Session | null): boolean {
  return session?.user?.role === "Admin";
}

export function isCustomer(session: Session | null): boolean {
  return session?.user?.role === "Customer";
}

export async function getSession(): Promise<Session | null> {
  return auth();
}

export async function requireAuth(): Promise<Session> {
  const session = await auth();
  if (!session?.user) redirect("/login");
  return session;
}

export async function requireAdmin(): Promise<Session> {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");
  if (session.user.role !== "Admin") redirect("/forbidden");
  return session;
}

export async function requireCustomer(): Promise<{ session: Session; customerId: string }> {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "Customer") redirect("/forbidden");
  const customerId = session.user.customerId;
  if (!customerId) redirect("/login");
  return { session, customerId };
}
