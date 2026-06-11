"use client";

import Link from "next/link";
import { Loader2 } from "lucide-react";
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
  loading?: boolean;
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
  loading,
}: Metin2ButtonProps) {
  const isDisabled = disabled || loading;
  const classes = cn(
    "metin2-btn inline-flex items-center justify-center gap-2 font-semibold transition-all",
    variant === "primary" && "metin2-btn-primary",
    variant === "gold" && "metin2-btn-gold",
    variant === "ghost" && "metin2-btn-ghost",
    isDisabled && "pointer-events-none opacity-50",
    className
  );

  const content = (
    <>
      {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
      {children}
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className={classes}
        onClick={onClick}
        aria-disabled={isDisabled}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {content}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} className={classes} disabled={isDisabled}>
      {content}
    </button>
  );
}
