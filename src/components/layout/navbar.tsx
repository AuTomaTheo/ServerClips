import Link from "next/link";
import { auth } from "@/lib/auth";
import { Shield, LayoutDashboard, Compass, Play, Server } from "lucide-react";
import { Metin2Logo } from "@/components/metin2/metin2-logo";
import { Metin2Button } from "@/components/metin2/metin2-button";
import { SignOutButton } from "@/components/auth/sign-out-button";

export async function Navbar() {
  const session = await auth();
  const user = session?.user;

  return (
    <header className="border-b-2 border-metin2-wood bg-gradient-to-b from-metin2-woodDark to-metin2-bg shadow-lg">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Metin2Logo />

        <nav className="hidden items-center gap-1 text-sm md:flex">
          <Link
            href="/"
            className="metin2-btn-ghost inline-flex items-center gap-1.5 rounded px-3 py-1.5 text-metin2-parchment hover:text-metin2-goldLight"
          >
            <Play className="h-4 w-4 text-metin2-gold" />
            Feed
          </Link>
          <Link
            href="/explore"
            className="metin2-btn-ghost inline-flex items-center gap-1.5 rounded px-3 py-1.5 text-metin2-parchment hover:text-metin2-goldLight"
          >
            <Compass className="h-4 w-4 text-metin2-gold" />
            Explore
          </Link>
          <Link
            href="/legal/terms"
            className="rounded px-3 py-1.5 text-metin2-parchment/70 hover:text-metin2-goldLight"
          >
            Terms
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              {(user.role === "CREATOR" || user.role === "MODERATOR" || user.role === "ADMIN") && (
                <>
                  <Metin2Button href="/studio" variant="ghost" className="text-xs sm:text-sm">
                    <LayoutDashboard className="h-4 w-4" />
                    <span className="hidden sm:inline">Studio</span>
                  </Metin2Button>
                  <Metin2Button href="/server-dashboard" variant="ghost" className="text-xs sm:text-sm">
                    <Server className="h-4 w-4" />
                    <span className="hidden sm:inline">Servers</span>
                  </Metin2Button>
                </>
              )}
              {(user.role === "MODERATOR" || user.role === "ADMIN") && (
                <Metin2Button href="/admin" variant="ghost" className="text-xs sm:text-sm">
                  <Shield className="h-4 w-4" />
                  <span className="hidden sm:inline">Admin</span>
                </Metin2Button>
              )}
              <Metin2Button href="/account" variant="ghost" className="text-xs sm:text-sm">
                Account
              </Metin2Button>
              <SignOutButton className="text-xs sm:text-sm" />
            </>
          ) : (
            <>
              <Metin2Button href="/login" variant="ghost" className="text-xs sm:text-sm">
                Log in
              </Metin2Button>
              <Metin2Button href="/register" variant="primary" className="text-xs sm:text-sm">
                Sign up
              </Metin2Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
