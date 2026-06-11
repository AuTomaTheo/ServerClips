export const SCHOOL_TYPES = [
  { value: "OLDSCHOOL", label: "Oldschool" },
  { value: "MIDDLESCHOOL", label: "Middleschool" },
  { value: "NEWSCHOOL", label: "Newschool" },
] as const;

export const GAMEPLAY_DIFFICULTIES = [
  { value: "EASY", label: "Easy" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HARD", label: "Hard" },
  { value: "FARM", label: "Farm" },
  { value: "PVP", label: "PvP" },
  { value: "PVP_FARM", label: "PvP-Farm" },
] as const;

/** @deprecated Use SCHOOL_TYPES and GAMEPLAY_DIFFICULTIES */
export const SERVER_TYPES = [
  ...SCHOOL_TYPES,
  ...GAMEPLAY_DIFFICULTIES.filter((d) => d.value !== "EASY" && d.value !== "MEDIUM" && d.value !== "HARD"),
] as const;

export const ORIGIN_COUNTRIES = [
  "Romania",
  "Germany",
  "Poland",
  "Turkey",
  "Hungary",
  "Czech Republic",
  "France",
  "Italy",
  "Spain",
  "Portugal",
  "United Kingdom",
  "United States",
  "Canada",
  "Brazil",
  "Global",
] as const;

/** @deprecated Use ORIGIN_COUNTRIES */
export const REGIONS = ORIGIN_COUNTRIES;

export const LANGUAGES = [
  "English",
  "German",
  "Polish",
  "Romanian",
  "Turkish",
  "Spanish",
  "Portuguese",
  "French",
  "Italian",
  "Hungarian",
  "Czech",
  "Other",
] as const;

export const SERVER_MEMBER_ROLES = [
  { value: "OWNER", label: "Owner" },
  { value: "CO_OWNER", label: "Co-Owner" },
  { value: "ADMINISTRATOR", label: "Administrator" },
  { value: "COMMUNITY_MANAGER", label: "Community Manager" },
  { value: "PROMOTER", label: "Promoter" },
  { value: "CONTENT_CREATOR", label: "Content Creator" },
  { value: "PLAYER", label: "Player" },
] as const;

export const SERVER_SYSTEMS = [
  { key: "systemAlchemy", label: "Alchemy" },
  { key: "systemScarf", label: "Scarf" },
  { key: "systemLycan", label: "Lycan" },
  { key: "systemBonus67", label: "6/7 Bonus" },
  { key: "systemOfflineShop", label: "Offline Shop" },
  { key: "systemCostume", label: "Costume System" },
  { key: "systemPet", label: "Pet System" },
  { key: "systemMount", label: "Mount System" },
  { key: "systemBattlePass", label: "Battle Pass" },
  { key: "systemDungeonRanking", label: "Dungeon Ranking" },
  { key: "systemElement", label: "Element System" },
  { key: "systemTalisman", label: "Talisman System" },
] as const;

export type ServerSystemKey = (typeof SERVER_SYSTEMS)[number]["key"];

export const REPORT_REASONS = [
  { value: "COPYRIGHT", label: "Copyright infringement" },
  { value: "SPAM", label: "Spam" },
  { value: "SCAM", label: "Scam / fraud" },
  { value: "OFFENSIVE", label: "Offensive content" },
  { value: "MISLEADING", label: "Misleading information" },
  { value: "OTHER", label: "Other" },
] as const;

export const LEGAL_DISCLAIMER =
  "We do not host or distribute game clients, launchers, patches, server files, or copyrighted game assets. ServerClips is an independent discovery and promotional listing platform.";

export const MAX_VIDEO_SIZE_MB = 100;
export const MAX_IMAGE_SIZE_MB = 5;
export const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
