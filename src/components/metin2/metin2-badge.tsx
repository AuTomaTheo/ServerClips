"use client";

import { cn } from "@/lib/utils";

export function Metin2Badge({
  children,
  className,
  variant = "default",
}: {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "gold" | "red";
}) {
  return (
    <span
      className={cn(
        "metin2-badge",
        variant === "gold" && "metin2-badge-gold",
        variant === "red" && "metin2-badge-red",
        className
      )}
    >
      {children}
    </span>
  );
}
