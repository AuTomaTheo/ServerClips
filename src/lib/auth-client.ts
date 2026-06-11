"use client";

import { signOut } from "next-auth/react";

/** Sign out and stay on the current site (avoids localhost redirects on Vercel). */
export function signOutToHome() {
  const redirectTo =
    typeof window !== "undefined" ? `${window.location.origin}/` : "/";
  return signOut({ redirectTo });
}
