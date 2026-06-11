import Link from "next/link";
import { cn } from "@/lib/utils";

export function AdminPageTitle({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold text-white">{title}</h1>
      {description && <p className="mt-1 text-sm text-zinc-400">{description}</p>}
    </div>
  );
}

export function AdminListCard({
  children,
  className,
  href,
}: {
  children: React.ReactNode;
  className?: string;
  href?: string;
}) {
  const classes = cn(
    "app-card block p-4 transition-colors hover:border-zinc-600",
    className
  );
  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }
  return <div className={classes}>{children}</div>;
}

const STATUS_STYLES: Record<string, string> = {
  APPROVED: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  PENDING: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  REJECTED: "bg-red-500/15 text-red-400 border-red-500/30",
  SUSPENDED: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  DELETED: "bg-zinc-500/15 text-zinc-400 border-zinc-500/30",
  ACTIVE: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  BANNED: "bg-red-500/15 text-red-400 border-red-500/30",
  SUSPENDED_USER: "bg-orange-500/15 text-orange-400 border-orange-500/30",
};

export function AdminStatusBadge({ status }: { status: string }) {
  const style =
    STATUS_STYLES[status] ??
    "bg-zinc-800 text-zinc-300 border-zinc-700";

  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
        style
      )}
    >
      {status}
    </span>
  );
}

export function AdminSection({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("app-card overflow-hidden", className)}>
      <div className="border-b border-zinc-800 px-4 py-3 text-sm font-semibold text-white">
        {title}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

export function AdminFilterTabs({
  items,
  activeValue,
  basePath,
}: {
  items: readonly { label: string; value?: string }[];
  activeValue?: string;
  basePath: string;
}) {
  return (
    <div className="mb-6 flex flex-wrap gap-2">
      {items.map((item) => {
        const href = item.value ? `${basePath}?status=${item.value}` : basePath;
        const active = (activeValue ?? undefined) === item.value;
        return (
          <Link
            key={item.label}
            href={href}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
              active
                ? "border-red-500/50 bg-red-500/10 text-red-400"
                : "border-zinc-700 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200"
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}
