"use client";

import { X } from "lucide-react";
import { Metin2Button } from "@/components/metin2/metin2-button";

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
      <div
        className="absolute inset-0"
        onClick={onClose}
        aria-hidden
      />
      <div className="relative w-full max-w-sm rounded-lg border border-[#5c3d1e] bg-[#1a1208] p-5 shadow-xl">
        <button
          onClick={onClose}
          className="absolute right-3 top-3 rounded p-1 text-metin2-parchment/60 hover:text-metin2-parchment"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
        <h3 className="font-display text-lg font-bold text-metin2-gold">Sign in required</h3>
        <p className="mt-2 text-sm text-metin2-parchment/80">
          Create an account or log in to {action}.
        </p>
        <div className="mt-5 flex gap-2">
          <Metin2Button href="/login" className="flex-1 justify-center">
            Log in
          </Metin2Button>
          <Metin2Button href="/register" variant="gold" className="flex-1 justify-center">
            Sign up
          </Metin2Button>
        </div>
        <button
          onClick={onClose}
          className="mt-3 w-full text-center text-xs text-metin2-parchment/50 hover:text-metin2-parchment/70"
        >
          Continue browsing
        </button>
      </div>
    </div>
  );
}
