import { LEGAL_DISCLAIMER } from "@/lib/constants";
import { Metin2LegalPage } from "@/components/metin2/metin2-legal-page";

export const metadata = { title: "Terms of Service" };

export default function TermsPage() {
  return (
    <Metin2LegalPage title="Terms of Service">
      <p className="text-sm text-[#6b5a40]">Last updated: {new Date().toLocaleDateString()}</p>

      <div className="app-disclaimer">
        <p>{LEGAL_DISCLAIMER}</p>
      </div>

      <h2>1. Platform Purpose</h2>
      <p>
        ServerClips is an independent server discovery and promotional listing platform. We provide a space for server operators to showcase their communities through videos, images, and descriptive content.
      </p>

      <h2>2. Prohibited Content</h2>
      <p>Users and promoters may not use ServerClips to:</p>
      <ul>
        <li>Distribute or link to game clients, launchers, patches, or cracked files</li>
        <li>Host or facilitate distribution of copyrighted game assets without authorization</li>
        <li>Post misleading, fraudulent, or harmful content</li>
        <li>Spam or abuse the reporting system</li>
      </ul>

      <h2>3. User Accounts</h2>
      <p>
        You are responsible for maintaining the security of your account. Promoters may submit server listings subject to admin review and approval.
      </p>

      <h2>4. Content Ownership</h2>
      <p>
        Promoters retain ownership of content they submit but grant ServerClips a license to display it on the platform for promotional purposes.
      </p>

      <h2>5. Moderation</h2>
      <p>
        We reserve the right to approve, reject, suspend, or remove listings and comments that violate these terms or our Community Guidelines.
      </p>

      <h2>6. Disclaimer</h2>
      <p>
        ServerClips is not affiliated with any game publisher or copyright holder. Listings are user-submitted promotional content. We make no warranties about third-party servers.
      </p>

      <h2>7. Contact</h2>
      <p>
        For legal inquiries or copyright concerns, see our{" "}
        <a href="/legal/copyright">Copyright / Takedown Policy</a>.
      </p>
    </Metin2LegalPage>
  );
}
