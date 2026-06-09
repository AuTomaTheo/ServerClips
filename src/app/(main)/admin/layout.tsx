import Link from "next/link";
import { requireModerator } from "@/lib/auth/session";
import { canAccessAdmin } from "@/lib/permissions";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Overview", adminOnly: false },
  { href: "/admin/users", label: "Users", adminOnly: true },
  { href: "/admin/videos", label: "Videos", adminOnly: false },
  { href: "/admin/servers", label: "Servers", adminOnly: false },
  { href: "/admin/comments", label: "Comments", adminOnly: false },
  { href: "/admin/reports", label: "Reports", adminOnly: false },
  { href: "/admin/audit", label: "Audit logs", adminOnly: true },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { moderator } = await requireModerator();
  const isAdmin = canAccessAdmin(moderator);

  return (
    <div className="mx-auto flex max-w-7xl gap-6 px-4 py-8 sm:px-6">
      <aside className="hidden w-52 shrink-0 lg:block">
        <nav className="metin2-frame sticky top-24">
          <div className="metin2-title-bar font-display text-sm">Moderation</div>
          <div className="metin2-wood-panel space-y-0 p-0">
            {NAV.filter((n) => !n.adminOnly || isAdmin).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn("metin2-nav-item block")}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
