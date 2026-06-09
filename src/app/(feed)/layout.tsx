import { ImpersonationBanner } from "@/components/layout/impersonation-banner";

export default function FeedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 h-[100dvh] w-full overflow-hidden bg-black text-white">
      <ImpersonationBanner />
      {children}
    </div>
  );
}
