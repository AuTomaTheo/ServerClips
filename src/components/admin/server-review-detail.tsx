import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import {
  GAMEPLAY_DIFFICULTIES,
  SCHOOL_TYPES,
  SERVER_MEMBER_ROLES,
} from "@/lib/constants";
import { otherSystemsLabels, systemsFromServer } from "@/lib/server-systems";
import { ServerBadges } from "@/components/servers/server-badges";
import { Metin2Frame } from "@/components/metin2/metin2-frame";
import { Metin2Badge } from "@/components/metin2/metin2-badge";
import { ExternalLink } from "lucide-react";

export type ServerReviewData = {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  bannerUrl: string | null;
  description: string | null;
  websiteUrl: string | null;
  discordUrl: string | null;
  launchDate: Date | null;
  createdAt: Date;
  maxLevel: number | null;
  schoolType: string;
  gameplayDifficulty: string;
  originCountry: string;
  mainLanguage: string;
  supportedLanguages: string[];
  representsServer: boolean;
  verificationStatus: string;
  otherSystems: string | null;
  status: string;
  verified: boolean;
  featured: boolean;
  profileViews: number;
  systemAlchemy: boolean;
  systemScarf: boolean;
  systemLycan: boolean;
  systemBonus67: boolean;
  systemOfflineShop: boolean;
  systemCostume: boolean;
  systemPet: boolean;
  systemMount: boolean;
  systemBattlePass: boolean;
  systemDungeonRanking: boolean;
  systemElement: boolean;
  systemTalisman: boolean;
  members: {
    role: string;
    user: {
      id: string;
      username: string | null;
      displayName: string | null;
      name: string | null;
      email?: string | null;
    };
  }[];
  _count?: { videos: number };
};

function labelFor(value: string, list: readonly { value: string; label: string }[]) {
  return list.find((item) => item.value === value)?.label ?? value;
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1 border-b border-[#5c3d1e]/20 py-3 sm:grid-cols-[10rem_1fr] sm:gap-4">
      <dt className="text-xs font-semibold uppercase tracking-wide text-[#6b5a40]">{label}</dt>
      <dd className="text-sm text-[#2a1f0f]">{children}</dd>
    </div>
  );
}

function Empty() {
  return <span className="text-[#6b5a40] italic">Not provided</span>;
}

export function ServerReviewDetail({ server }: { server: ServerReviewData }) {
  const submitter = server.members[0];
  const systems = systemsFromServer(server);
  const customSystems = otherSystemsLabels(server.otherSystems);

  return (
    <div className="space-y-6">
      <Metin2Frame title="Status">
        <div className="flex flex-wrap items-center gap-2">
          <Metin2Badge>{server.status}</Metin2Badge>
          {server.verified && <Metin2Badge variant="gold">Verified</Metin2Badge>}
          {server.featured && <Metin2Badge variant="gold">Featured</Metin2Badge>}
          {server.representsServer && (
            <Metin2Badge variant="red">Claims to represent server</Metin2Badge>
          )}
          <Metin2Badge variant="red">Verification: {server.verificationStatus}</Metin2Badge>
        </div>
        <p className="mt-3 text-xs text-[#6b5a40]">
          Submitted {format(server.createdAt, "MMM d, yyyy 'at' h:mm a")} · {server._count?.videos ?? 0} videos ·{" "}
          {server.profileViews} profile views
        </p>
      </Metin2Frame>

      {(server.bannerUrl || server.logoUrl) && (
        <Metin2Frame title="Media">
          <div className="flex flex-col gap-4 sm:flex-row">
            {server.logoUrl && (
              <div>
                <p className="mb-2 text-xs text-[#6b5a40]">Logo</p>
                <Image
                  src={server.logoUrl}
                  alt={`${server.name} logo`}
                  width={96}
                  height={96}
                  className="h-24 w-24 rounded border border-[#5c3d1e]/40 object-cover"
                  unoptimized
                />
              </div>
            )}
            {server.bannerUrl && (
              <div className="min-w-0 flex-1">
                <p className="mb-2 text-xs text-[#6b5a40]">Banner</p>
                <Image
                  src={server.bannerUrl}
                  alt={`${server.name} banner`}
                  width={640}
                  height={160}
                  className="h-32 w-full rounded border border-[#5c3d1e]/40 object-cover sm:h-40"
                  unoptimized
                />
              </div>
            )}
          </div>
        </Metin2Frame>
      )}

      <Metin2Frame title="Server identity">
        <dl>
          <DetailRow label="Name">{server.name}</DetailRow>
          <DetailRow label="Slug">
            <code className="text-xs">{server.slug}</code>
          </DetailRow>
          <DetailRow label="Website">
            {server.websiteUrl ? (
              <a
                href={server.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-metin2-red underline-offset-2 hover:underline"
              >
                {server.websiteUrl}
                <ExternalLink className="h-3 w-3" />
              </a>
            ) : (
              <Empty />
            )}
          </DetailRow>
          <DetailRow label="Discord">
            {server.discordUrl ? (
              <a
                href={server.discordUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-metin2-red underline-offset-2 hover:underline"
              >
                {server.discordUrl}
                <ExternalLink className="h-3 w-3" />
              </a>
            ) : (
              <Empty />
            )}
          </DetailRow>
          <DetailRow label="Launch date">
            {server.launchDate ? format(server.launchDate, "MMM d, yyyy") : <Empty />}
          </DetailRow>
        </dl>
      </Metin2Frame>

      <Metin2Frame title="Description">
        {server.description ? (
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-[#2a1f0f]">{server.description}</p>
        ) : (
          <p className="text-sm italic text-[#6b5a40]">No description provided.</p>
        )}
      </Metin2Frame>

      <Metin2Frame title="Submitter">
        <dl>
          <DetailRow label="User">
            {submitter?.user.username ? (
              <Link href={`/u/${submitter.user.username}`} className="text-metin2-red hover:underline">
                @{submitter.user.username}
              </Link>
            ) : (
              <Empty />
            )}
          </DetailRow>
          <DetailRow label="Display name">
            {submitter?.user.displayName ?? submitter?.user.name ?? <Empty />}
          </DetailRow>
          {submitter?.user.email && (
            <DetailRow label="Email">{submitter.user.email}</DetailRow>
          )}
          <DetailRow label="Role on server">
            {submitter ? labelFor(submitter.role, SERVER_MEMBER_ROLES) : <Empty />}
          </DetailRow>
          <DetailRow label="Represents server">
            {server.representsServer ? "Yes — claims official representation" : "No"}
          </DetailRow>
        </dl>
      </Metin2Frame>

      <Metin2Frame title="Metin2 metadata">
        <ServerBadges server={server} />
        <dl className="mt-4">
          <DetailRow label="School type">{labelFor(server.schoolType, SCHOOL_TYPES)}</DetailRow>
          <DetailRow label="Difficulty">{labelFor(server.gameplayDifficulty, GAMEPLAY_DIFFICULTIES)}</DetailRow>
          <DetailRow label="Origin">{server.originCountry}</DetailRow>
          <DetailRow label="Main language">{server.mainLanguage}</DetailRow>
          <DetailRow label="Supported languages">
            {server.supportedLanguages.length > 0 ? server.supportedLanguages.join(", ") : <Empty />}
          </DetailRow>
          <DetailRow label="Max level">{server.maxLevel ?? <Empty />}</DetailRow>
        </dl>
      </Metin2Frame>

      <Metin2Frame title="Systems">
        {systems.length === 0 && customSystems.length === 0 ? (
          <p className="text-sm italic text-[#6b5a40]">No systems selected.</p>
        ) : (
          <ul className="grid gap-1 sm:grid-cols-2">
            {systems.map((s) => (
              <li key={s.key} className="flex items-center gap-2 text-sm text-[#2a1f0f]">
                <span className="text-metin2-gold">✓</span> {s.label}
              </li>
            ))}
            {customSystems.map((label) => (
              <li key={label} className="flex items-center gap-2 text-sm text-[#2a1f0f]">
                <span className="text-metin2-gold">✓</span> {label}
              </li>
            ))}
          </ul>
        )}
        {server.otherSystems && customSystems.length === 0 && (
          <p className="mt-3 whitespace-pre-wrap text-sm text-[#2a1f0f]">{server.otherSystems}</p>
        )}
      </Metin2Frame>
    </div>
  );
}
