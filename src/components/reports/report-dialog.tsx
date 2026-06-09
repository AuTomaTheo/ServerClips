"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { reportSchema, type ReportInput } from "@/lib/validators/video";
import { REPORT_REASONS } from "@/lib/constants";
import { Metin2Button } from "@/components/metin2/metin2-button";
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

  const form = useForm<Pick<ReportInput, "reason" | "details">>({
    resolver: zodResolver(reportSchema.pick({ reason: true, details: true })),
    defaultValues: { reason: "OTHER", details: "" },
  });

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

  if (!open) {
    return <span onClick={() => setOpen(true)} className="cursor-pointer">{trigger}</span>;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="metin2-frame w-full max-w-md">
        <div className="metin2-title-bar font-display">Report content</div>
        <div className="metin2-parchment p-6">
          {success ? (
            <div className="space-y-4">
              <p className="text-sm text-green-800">Report submitted. Our team will review it shortly.</p>
              <Metin2Button onClick={() => { setOpen(false); setSuccess(false); }}>Close</Metin2Button>
            </div>
          ) : (
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="metin2-label">Reason</label>
                <Select className="metin2-input w-full" {...form.register("reason")}>
                  {REPORT_REASONS.map((r) => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="metin2-label">Details (optional)</label>
                <Textarea rows={4} className="metin2-input" {...form.register("details")} />
              </div>
              {error && <p className="text-sm text-red-700">{error}</p>}
              <div className="flex gap-2">
                <Metin2Button type="submit">Submit report</Metin2Button>
                <Metin2Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Metin2Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
