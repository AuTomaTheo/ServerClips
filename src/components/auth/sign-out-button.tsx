"use client";

import { signOutToHome } from "@/lib/auth-client";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SignOutButton({ className }: { className?: string }) {
  return (
    <button
      type="button"
      className={cn(buttonVariants({ variant: "ghost", size: "sm" }), className)}
      onClick={() => signOutToHome()}
    >
      Sign out
    </button>
  );
}
