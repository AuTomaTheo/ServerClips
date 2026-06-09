"use client";

import { cn } from "@/lib/utils";

interface Metin2FrameProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  variant?: "parchment" | "wood" | "dark";
  flush?: boolean;
}

export function Metin2Frame({
  children,
  className,
  title,
  variant = "parchment",
  flush = false,
}: Metin2FrameProps) {
  return (
    <div className={cn("metin2-frame", className)}>
      {title && (
        <div className="metin2-title-bar">
          <span className="font-display">{title}</span>
        </div>
      )}
      <div
        className={cn(
          !flush && variant === "parchment" && "metin2-parchment",
          !flush && variant === "wood" && "metin2-wood-panel",
          !flush && variant === "dark" && "metin2-dark-panel",
          flush && "overflow-hidden bg-black"
        )}
      >
        {children}
      </div>
    </div>
  );
}
