"use client";

import Link from "next/link";
import { X } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function LoginPromptModal({
  open,
  onClose,
  action = "do that",
}: {
  open: boolean;
  onClose: () => void;
  action?: string;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/60 p-4 sm:items-center">
      <div className="absolute inset-0" onClick={onClose} aria-hidden />
      <div className="relative w-full max-w-sm rounded-xl border border-zinc-800 bg-zinc-950 p-5 shadow-xl">
        <button
          onClick={onClose}
          className="absolute right-3 top-3 rounded-lg p-1 text-zinc-500 hover:bg-zinc-900 hover:text-white"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
        <h3 className="text-lg font-bold text-white">Sign in required</h3>
        <p className="mt-2 text-sm text-zinc-400">
          Create an account or log in to {action}.
        </p>
        <div className="mt-5 flex gap-2">
          <Link href="/login" className={cn(buttonVariants(), "flex-1 justify-center")}>
            Log in
          </Link>
          <Link href="/register" className={cn(buttonVariants({ variant: "secondary" }), "flex-1 justify-center")}>
            Sign up
          </Link>
        </div>
        <button
          onClick={onClose}
          className="mt-3 w-full text-center text-xs text-zinc-500 hover:text-zinc-300"
        >
          Continue browsing
        </button>
      </div>
    </div>
  );
}
