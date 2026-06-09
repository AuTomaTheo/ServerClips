import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ImpersonationBanner } from "@/components/layout/impersonation-banner";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="metin2-page-bg flex min-h-screen flex-col">
      <ImpersonationBanner />
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
