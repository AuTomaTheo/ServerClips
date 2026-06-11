import { ImpersonationBanner } from "@/components/layout/impersonation-banner";

export default function ServerProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <ImpersonationBanner />
      {children}
    </div>
  );
}
