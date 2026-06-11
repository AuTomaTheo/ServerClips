import Link from "next/link";
import { auth } from "@/lib/auth";
import { Shield, LayoutDashboard, Compass, Play, Server, Plus } from "lucide-react";
import { AppLogo } from "@/components/layout/app-logo";
import { buttonVariants } from "@/components/ui/button";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { cn } from "@/lib/utils";

export async function Navbar() {
  const session = await auth();
  const user = session?.user;

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-800/80 bg-black/90 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        <AppLogo size="md" />

        <nav className="hidden items-center gap-1 md:flex">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-zinc-400 transition-colors hover:bg-zinc-900 hover:text-white"
          >
            <Play className="h-4 w-4 text-red-500" />
            Feed
          </Link>
          <Link
            href="/explore"
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-zinc-400 transition-colors hover:bg-zinc-900 hover:text-white"
          >
            <Compass className="h-4 w-4 text-red-500" />
            Explore
          </Link>
          <Link
            href="/submit-server"
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-zinc-400 transition-colors hover:bg-zinc-900 hover:text-white"
          >
            <Server className="h-4 w-4 text-red-500" />
            Submit Server
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              {(user.role === "CREATOR" || user.role === "MODERATOR" || user.role === "ADMIN") && (
                <>
                  <Link
                    href="/studio/videos/new"
                    className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
                  >
                    <Plus className="h-4 w-4" />
                    <span className="hidden sm:inline">Upload</span>
                  </Link>
                  <Link
                    href="/studio"
                    className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    <span className="hidden sm:inline">Studio</span>
                  </Link>
                </>
              )}
              {(user.role === "MODERATOR" || user.role === "ADMIN") && (
                <Link
                  href="/admin"
                  className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
                >
                  <Shield className="h-4 w-4" />
                  <span className="hidden sm:inline">Admin</span>
                </Link>
              )}
              <Link
                href={user.username ? `/u/${user.username}` : "/account"}
                className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
              >
                Profile
              </Link>
              <SignOutButton className="text-xs sm:text-sm" />
            </>
          ) : (
            <>
              <Link href="/login" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
                Log in
              </Link>
              <Link href="/register" className={cn(buttonVariants({ size: "sm" }))}>
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
