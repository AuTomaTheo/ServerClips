export const SERVER_TYPES = [
  { value: "OLDSCHOOL", label: "Oldschool" },
  { value: "MIDDLESCHOOL", label: "Middleschool" },
  { value: "NEWSCHOOL", label: "Newschool" },
  { value: "PVP", label: "PvP" },
  { value: "PVM", label: "PvM" },
  { value: "MIXED", label: "Mixed" },
] as const;

export const REGIONS = [
  "Europe",
  "North America",
  "South America",
  "Asia",
  "Oceania",
  "Middle East",
  "Africa",
  "Global",
] as const;

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
