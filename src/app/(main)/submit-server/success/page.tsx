import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, Clock } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Submission Received",
};

export default function SubmitServerSuccessPage({
  searchParams,
}: {
  searchParams: { name?: string; slug?: string };
}) {
  const serverName = searchParams.name?.trim() || "Your server";

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <div className="app-card p-8">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 ring-2 ring-emerald-500/30">
            <CheckCircle2 className="h-9 w-9 text-emerald-400" aria-hidden />
          </div>

          <h1 className="text-xl font-bold text-white">Submission received</h1>
          <h2 className="mt-2 text-lg font-semibold text-red-400">{serverName}</h2>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-zinc-400">
            Your server profile has been submitted successfully. Our team will review it before it
            appears publicly on ServerClips.
          </p>

          <div className="mt-6 flex w-full max-w-sm items-start gap-3 rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-3 text-left text-sm text-zinc-400">
            <Clock className="mt-0.5 h-4 w-4 shrink-0 text-red-400" aria-hidden />
            <p>
              Approval usually takes a short while. You can upload promo videos from Studio once
              your profile is approved.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/studio" className={cn(buttonVariants())}>
              Go to Studio
            </Link>
            <Link href="/" className={cn(buttonVariants({ variant: "secondary" }))}>
              Back to feed
            </Link>
            {searchParams.slug && (
              <Link
                href={`/server/${searchParams.slug}`}
                className="text-xs text-zinc-500 underline-offset-2 hover:text-red-400 hover:underline"
              >
                Preview profile (pending)
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
