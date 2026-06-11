import { GAMEPLAY_DIFFICULTIES, SCHOOL_TYPES } from "@/lib/constants";
import { otherSystemsLabels, systemsFromServer } from "@/lib/server-systems";
import { Metin2Badge } from "@/components/metin2/metin2-badge";
import { format } from "date-fns";

export type ServerBadgeData = {
  schoolType: string;
  gameplayDifficulty: string;
  originCountry: string;
  mainLanguage: string;
  supportedLanguages?: string[];
  maxLevel?: number | null;
  launchDate?: Date | string | null;
  verified?: boolean;
  systemAlchemy?: boolean;
  systemScarf?: boolean;
  systemLycan?: boolean;
  systemBonus67?: boolean;
  systemOfflineShop?: boolean;
  systemCostume?: boolean;
  systemPet?: boolean;
  systemMount?: boolean;
  systemBattlePass?: boolean;
  systemDungeonRanking?: boolean;
  systemElement?: boolean;
  systemTalisman?: boolean;
  otherSystems?: string | null;
};

function labelFor(value: string, list: readonly { value: string; label: string }[]) {
  return list.find((item) => item.value === value)?.label ?? value;
}

export function ServerBadges({ server }: { server: ServerBadgeData }) {
  const systems = systemsFromServer(server);
  const launch =
    server.launchDate instanceof Date
      ? server.launchDate
      : server.launchDate
        ? new Date(server.launchDate)
        : null;

  const extraLanguages =
    server.supportedLanguages?.filter((l) => l !== server.mainLanguage) ?? [];

  return (
    <div className="flex flex-wrap gap-2">
      {server.verified && <Metin2Badge variant="gold">Verified</Metin2Badge>}
      <Metin2Badge variant="red">{labelFor(server.schoolType, SCHOOL_TYPES)}</Metin2Badge>
      <Metin2Badge variant="red">{labelFor(server.gameplayDifficulty, GAMEPLAY_DIFFICULTIES)}</Metin2Badge>
      <Metin2Badge>{server.originCountry}</Metin2Badge>
      <Metin2Badge>{server.mainLanguage}</Metin2Badge>
      {extraLanguages.map((lang) => (
        <Metin2Badge key={lang} variant="gold">{lang}</Metin2Badge>
      ))}
      {server.maxLevel != null && <Metin2Badge>Max Lv. {server.maxLevel}</Metin2Badge>}
      {launch && <Metin2Badge>Launch {format(launch, "MMM d, yyyy")}</Metin2Badge>}
      {systems.map((s) => (
        <Metin2Badge key={s.key} variant="gold">{s.label}</Metin2Badge>
      ))}
      {otherSystemsLabels(server.otherSystems).map((label) => (
        <Metin2Badge key={label} variant="gold">{label}</Metin2Badge>
      ))}
    </div>
  );
}
