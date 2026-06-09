"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

export function Metin2Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("group inline-block", className)}>
      <span className="metin2-logo font-display text-xl font-bold tracking-wider sm:text-2xl">
        ServerClips
      </span>
    </Link>
  );
}
