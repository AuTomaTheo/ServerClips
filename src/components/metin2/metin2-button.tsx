"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

interface Metin2ButtonProps {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
  variant?: "primary" | "gold" | "ghost";
  external?: boolean;
  type?: "button" | "submit";
  disabled?: boolean;
}

export function Metin2Button({
  children,
  href,
  onClick,
  className,
  variant = "primary",
  external,
  type = "button",
  disabled,
}: Metin2ButtonProps) {
  const classes = cn(
    "metin2-btn inline-flex items-center justify-center gap-2 font-semibold transition-all",
    variant === "primary" && "metin2-btn-primary",
    variant === "gold" && "metin2-btn-gold",
    variant === "ghost" && "metin2-btn-ghost",
    disabled && "pointer-events-none opacity-50",
    className
  );

  if (href) {
    return (
      <Link
        href={href}
        className={classes}
        onClick={onClick}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {children}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} className={classes} disabled={disabled}>
      {children}
    </button>
  );
}
