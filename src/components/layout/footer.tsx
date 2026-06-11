import Link from "next/link";
import { LEGAL_DISCLAIMER } from "@/lib/constants";
import { AppLogo } from "@/components/layout/app-logo";

export function Footer() {
  return (
    <footer className="border-t border-zinc-800 bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <div className="mb-3">
              <AppLogo href={undefined} size="lg" />
            </div>
            <p className="text-sm text-zinc-500">{LEGAL_DISCLAIMER}</p>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold text-zinc-300">Legal</h4>
            <ul className="space-y-2 text-sm text-zinc-500">
              <li>
                <Link href="/legal/terms" className="hover:text-red-400">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/legal/privacy" className="hover:text-red-400">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/legal/copyright" className="hover:text-red-400">
                  Copyright Policy
                </Link>
              </li>
              <li>
                <Link href="/legal/takedown" className="hover:text-red-400">
                  Submit Takedown Request
                </Link>
              </li>
              <li>
                <Link href="/legal/guidelines" className="hover:text-red-400">
                  Community Guidelines
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold text-zinc-300">Platform</h4>
            <p className="text-sm text-zinc-500">
              Video-first discovery for MMORPG private server communities. Promotional listings only.
            </p>
          </div>
        </div>
        <p className="mt-8 text-center text-xs text-zinc-600">
          © {new Date().getFullYear()} ServerClips. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
