import { LEGAL_DISCLAIMER } from "@/lib/constants";
import { Metin2LegalPage } from "@/components/metin2/metin2-legal-page";

export const metadata = { title: "Copyright / Takedown Policy" };

export default function CopyrightPage() {
  return (
    <Metin2LegalPage title="Copyright & Takedown Policy">
      <div className="metin2-disclaimer">
        <p>{LEGAL_DISCLAIMER}</p>
      </div>

      <h2>Our Commitment</h2>
      <p>
        ServerClips respects intellectual property rights. We do not host game clients, launchers, patches, server files, or copyrighted game assets. Our platform hosts only user-submitted promotional content such as trailers, screenshots, and descriptive text.
      </p>

      <h2>Reporting Infringement</h2>
      <p>If you believe content on ServerClips infringes your copyright, you may:</p>
      <ol className="list-decimal space-y-1 pl-6">
        <li>Use the in-app <strong>Report</strong> button on any listing or comment and select &quot;Copyright infringement&quot;</li>
        <li>Provide sufficient detail to identify the copyrighted work and the infringing material</li>
        <li>Include your contact information and a statement of good faith belief</li>
      </ol>

      <h2>Review Process</h2>
      <p>
        Reports are reviewed by our moderation team. Valid copyright claims may result in content removal, listing suspension, or account action. Repeat infringers may be permanently banned.
      </p>

      <h2>Counter-Notification</h2>
      <p>
        If you believe your content was removed in error, contact us with a counter-notification including your contact details and a statement under penalty of perjury that the removal was mistaken.
      </p>

      <h2>Designated Agent</h2>
      <p>
        Copyright inquiries: <strong>legal@serverclips.example</strong> (placeholder — update before production)
      </p>
    </Metin2LegalPage>
  );
}
