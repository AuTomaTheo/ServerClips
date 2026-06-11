import { LEGAL_DISCLAIMER } from "@/lib/constants";
import { Metin2LegalPage } from "@/components/metin2/metin2-legal-page";

export const metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <Metin2LegalPage title="Privacy Policy">
      <p className="text-sm text-[#6b5a40]">Last updated: {new Date().toLocaleDateString()} (Placeholder)</p>

      <div className="app-disclaimer">
        <p>{LEGAL_DISCLAIMER}</p>
      </div>

      <h2>Information We Collect</h2>
      <p>
        We collect account information (name, email), usage data (views, likes, comments), and content you submit (listings, reports).
      </p>

      <h2>How We Use Information</h2>
      <p>
        Data is used to operate the platform, moderate content, improve discovery features, and communicate about your account.
      </p>

      <h2>Data Storage</h2>
      <p>
        Account and listing data is stored in our database. Uploaded media may be stored on our servers or a third-party storage provider.
      </p>

      <h2>Your Rights</h2>
      <p>
        You may request access, correction, or deletion of your personal data by contacting us. This policy will be expanded before production launch.
      </p>

      <h2>Cookies</h2>
      <p>
        We use session cookies for authentication. Analytics cookies may be added in future versions with appropriate consent mechanisms.
      </p>
    </Metin2LegalPage>
  );
}
