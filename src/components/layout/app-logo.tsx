import Link from "next/link";
import { cn } from "@/lib/utils";

export function AppLogo({
  href = "/",
  className,
  size = "md",
}: {
  href?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizes = {
    sm: "text-[11px]",
    md: "text-sm",
    lg: "text-base",
  };

  const content = (
    <span className={cn("inline-flex items-baseline gap-0.5 font-bold tracking-tight", sizes[size], className)}>
      <span className="text-white">SERVER</span>
      <span className="text-red-500">CLIPS</span>
    </span>
  );

  if (href) {
    return (
      <Link href={href} className="shrink-0 transition-opacity hover:opacity-90">
        {content}
      </Link>
    );
  }

  return content;
}
