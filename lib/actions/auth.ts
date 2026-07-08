"use server";

import { signOut } from "@/auth";

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}

export async function adminSignOutAction() {
  await signOut({ redirectTo: "/admin/login" });
}
