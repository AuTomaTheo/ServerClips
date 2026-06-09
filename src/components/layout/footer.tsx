import Link from "next/link";
import { LEGAL_DISCLAIMER } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="border-t-2 border-metin2-wood bg-metin2-woodDark">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <h3 className="mb-3 font-display text-lg font-bold text-metin2-gold">ServerClips</h3>
            <p className="text-sm text-metin2-parchment/70">{LEGAL_DISCLAIMER}</p>
          </div>
          <div>
            <h4 className="mb-3 font-display text-sm font-semibold text-metin2-goldLight">Legal</h4>
            <ul className="space-y-2 text-sm text-metin2-parchment/70">
              <li>
                <Link href="/legal/terms" className="hover:text-metin2-gold">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/legal/privacy" className="hover:text-metin2-gold">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/legal/copyright" className="hover:text-metin2-gold">
                  Copyright Policy
                </Link>
              </li>
              <li>
                <Link href="/legal/takedown" className="hover:text-metin2-gold">
                  Submit Takedown Request
                </Link>
              </li>
              <li>
                <Link href="/legal/guidelines" className="hover:text-metin2-gold">
                  Community Guidelines
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 font-display text-sm font-semibold text-metin2-goldLight">Platform</h4>
            <p className="text-sm text-metin2-parchment/70">
              Video-first discovery for MMORPG private server communities. Promotional listings only.
            </p>
          </div>
        </div>
        <p className="mt-8 text-center text-xs text-metin2-parchment/50">
          © {new Date().getFullYear()} ServerClips. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
