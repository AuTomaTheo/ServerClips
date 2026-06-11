import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { ServerSubmissionForm } from "@/components/servers/server-submission-form";
import { LEGAL_DISCLAIMER } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Submit Server",
  description: "Submit a Metin2 private server profile to ServerClips.",
};

export default async function SubmitServerPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/submit-server");
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div className="app-card mb-6 p-6">
        <h1 className="text-xl font-bold text-white">Submit Server Profile</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Server profiles are the authoritative source of server information. Videos are uploaded separately in Studio.
          Profiles require admin approval before appearing publicly.
        </p>
        <p className="mt-2 text-xs text-zinc-600">{LEGAL_DISCLAIMER}</p>
      </div>

      <div className="app-card p-6">
        <ServerSubmissionForm mode="submit" />
      </div>
    </div>
  );
}
