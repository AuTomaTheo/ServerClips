"use client";

import { useState } from "react";
import { Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";
import { LoginPromptModal } from "./login-prompt-modal";

export function FeedSaveButton({
  videoId,
  initialSaved,
  isAuthenticated,
}: {
  videoId: string;
  initialSaved: boolean;
  isAuthenticated: boolean;
}) {
  const [saved, setSaved] = useState(initialSaved);
  const [loading, setLoading] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);

  async function toggleSave() {
    if (!isAuthenticated) {
      setLoginOpen(true);
      return;
    }
    setLoading(true);
    const res = await fetch(`/api/videos/${videoId}/save`, { method: "POST" });
    const data = await res.json();
    if (res.ok) setSaved(data.saved);
    setLoading(false);
  }

  return (
    <>
      <button
        onClick={toggleSave}
        disabled={loading}
        className="flex flex-col items-center gap-0.5 text-white"
        aria-label="Save"
      >
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-black/45 backdrop-blur-sm">
          <Bookmark className={cn("h-6 w-6", saved && "fill-metin2-gold text-metin2-gold")} />
        </span>
        <span className="text-[11px] font-medium drop-shadow">Save</span>
      </button>
      <LoginPromptModal
        open={loginOpen}
        onClose={() => setLoginOpen(false)}
        action="save videos"
      />
    </>
  );
}
