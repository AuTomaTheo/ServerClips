import { Metin2LegalPage } from "@/components/metin2/metin2-legal-page";
import { Metin2Button } from "@/components/metin2/metin2-button";

export const metadata = { title: "Takedown Request" };

export default function TakedownPage() {
  return (
    <Metin2LegalPage title="Submit a Takedown Request">
      <p>
        Use this page to report copyright infringement or request removal of content that violates
        our policies. We review all requests within a reasonable timeframe.
      </p>

      <h2>What to include</h2>
      <ol className="list-decimal space-y-2 pl-6">
        <li>URL or description of the infringing content on ServerClips</li>
        <li>Identification of the copyrighted work you believe was infringed</li>
        <li>Your contact information (name, email)</li>
        <li>A statement of good-faith belief that use is not authorized</li>
        <li>A statement that the information is accurate, under penalty of perjury</li>
      </ol>

      <h2>Quick report</h2>
      <p>
        For faster review, use the in-app <strong>Report</strong> button on any video or server
        profile and select <strong>Copyright infringement</strong>.
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        <Metin2Button href="/legal/copyright" variant="ghost">
          Copyright policy
        </Metin2Button>
        <Metin2Button href="mailto:legal@serverclips.example?subject=Takedown%20Request">
          Email legal team
        </Metin2Button>
      </div>
    </Metin2LegalPage>
  );
}
