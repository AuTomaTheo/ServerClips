import { LEGAL_DISCLAIMER } from "@/lib/constants";
import { Metin2LegalPage } from "@/components/metin2/metin2-legal-page";

export const metadata = { title: "Community Guidelines" };

export default function GuidelinesPage() {
  return (
    <Metin2LegalPage title="Community Guidelines">
      <div className="metin2-disclaimer">
        <p>{LEGAL_DISCLAIMER}</p>
      </div>

      <h2>Be Respectful</h2>
      <p>Treat other community members with respect. Harassment, hate speech, and personal attacks are not tolerated.</p>

      <h2>Honest Promotion</h2>
      <p>
        Server listings must accurately represent rates, launch dates, and features. Misleading information may result in removal.
      </p>

      <h2>No Piracy or Distribution</h2>
      <p>
        Do not use ServerClips to distribute or link to game clients, cracked files, unauthorized patches, or copyrighted assets. Link only to your official website and community channels.
      </p>

      <h2>Quality Content</h2>
      <p>
        Upload original promotional videos and images you have rights to use. Avoid spam, duplicate listings, and low-effort content.
      </p>

      <h2>Reporting</h2>
      <p>
        Use the report feature for copyright issues, scams, spam, or offensive content. False reports may result in account restrictions.
      </p>
    </Metin2LegalPage>
  );
}
