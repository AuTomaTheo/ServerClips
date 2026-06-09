"use client";

import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

export function Metin2Banner({
  href,
  label = "Visit Server",
  sublabel,
  className,
}: {
  href: string;
  label?: string;
  sublabel?: string;
  className?: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn("metin2-download-banner group", className)}
    >
      <span className="metin2-download-icon">
        <ExternalLink className="h-5 w-5" />
      </span>
      <span className="flex flex-col">
        <span className="font-display text-base font-bold tracking-wide sm:text-lg">
          {label}
        </span>
        {sublabel && (
          <span className="text-xs opacity-90 sm:text-sm">{sublabel}</span>
        )}
      </span>
    </a>
  );
}
