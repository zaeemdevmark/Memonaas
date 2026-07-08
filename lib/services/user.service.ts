import prisma from "@/lib/prisma";
import { comparePassword, hashPassword } from "@/lib/password";
import type { UserProfileDTO } from "@/lib/types/user";

export class UserError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = "UserError";
  }
}

// Profile lives on the Customer model; changePassword lives on User.

export async function getUserProfile(customerId: string): Promise<UserProfileDTO | null> {
  const customer = await prisma.customer.findUnique({
    where:  { id: customerId },
    select: { id: true, name: true, email: true, phone: true },
  });
  if (!customer) return null;
  return { id: customer.id, name: customer.name, email: customer.email, phone: customer.phone };
}

export async function updateUserProfile(
  customerId: string,
  data:       { name: string; phone: string | null },
): Promise<UserProfileDTO> {
  const customer = await prisma.customer.update({
    where:  { id: customerId },
    data:   { name: data.name, phone: data.phone },
    select: { id: true, name: true, email: true, phone: true },
  });
  return { id: customer.id, name: customer.name, email: customer.email, phone: customer.phone };
}

// changePassword still uses User.id (credentials are on User, not Customer).
export async function changePassword(
  userId:          string,
  currentPassword: string,
  newPassword:     string,
): Promise<void> {
  const user = await prisma.user.findUnique({
    where:  { id: userId },
    select: { passwordHash: true },
  });
  if (!user || !user.passwordHash) throw new UserError("User not found", 404);

  const valid = await comparePassword(currentPassword, user.passwordHash);
  if (!valid) throw new UserError("Current password is incorrect", 400);

  const hash = await hashPassword(newPassword);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash: hash } });
}
