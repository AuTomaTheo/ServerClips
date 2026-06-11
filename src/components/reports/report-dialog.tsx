"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import { reportSchema, type ReportInput } from "@/lib/validators/video";
import { REPORT_REASONS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";

export function ReportDialog({
  targetType,
  targetId,
  trigger,
}: {
  targetType: ReportInput["targetType"];
  targetId: string;
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  const form = useForm<Pick<ReportInput, "reason" | "details">>({
    resolver: zodResolver(reportSchema.pick({ reason: true, details: true })),
    defaultValues: { reason: "OTHER", details: "" },
  });

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  async function onSubmit(data: Pick<ReportInput, "reason" | "details">) {
    setError(null);
    const res = await fetch("/api/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...data,
        targetType,
        targetId,
      }),
    });
    const result = await res.json();
    if (!res.ok) {
      setError(result.error ?? "Failed to submit report");
      return;
    }
    setSuccess(true);
    form.reset();
  }

  function close() {
    setOpen(false);
    setSuccess(false);
    setError(null);
  }

  const modal =
    open && mounted
      ? createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
            onClick={close}
          >
            <div
              className="relative w-full max-w-md rounded-xl border border-zinc-800 bg-zinc-950 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-4">
                <h2 className="text-base font-semibold text-white">Report content</h2>
                <button
                  type="button"
                  onClick={close}
                  className="rounded-lg p-1 text-zinc-500 hover:bg-zinc-900 hover:text-white"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="p-5">
                {success ? (
                  <div className="space-y-4">
                    <p className="text-sm text-emerald-400">
                      Report submitted. Our team will review it shortly.
                    </p>
                    <Button type="button" onClick={close}>
                      Close
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                      <label className="app-label">Reason</label>
                      <Select className="app-input w-full" {...form.register("reason")}>
                        {REPORT_REASONS.map((r) => (
                          <option key={r.value} value={r.value}>
                            {r.label}
                          </option>
                        ))}
                      </Select>
                    </div>
                    <div>
                      <label className="app-label">Details (optional)</label>
                      <Textarea rows={4} className="app-input" {...form.register("details")} />
                    </div>
                    {error && <p className="text-sm text-red-400">{error}</p>}
                    <div className="flex gap-2">
                      <Button type="submit">Submit report</Button>
                      <Button type="button" variant="secondary" onClick={close}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <>
      <span onClick={() => setOpen(true)} className="cursor-pointer">
        {trigger}
      </span>
      {modal}
    </>
  );
}
