"use client";

import { signOut } from "next-auth/react";
import { Metin2Button } from "@/components/metin2/metin2-button";

export function SignOutButton({ className }: { className?: string }) {
  return (
    <Metin2Button
      type="button"
      className={className}
      onClick={() => signOut({ callbackUrl: "/" })}
    >
      Sign out
    </Metin2Button>
  );
}
