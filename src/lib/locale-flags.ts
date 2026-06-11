const COUNTRY_FLAGS: Record<string, string> = {
  Romania: "🇷🇴",
  Germany: "🇩🇪",
  Poland: "🇵🇱",
  Turkey: "🇹🇷",
  Hungary: "🇭🇺",
  "Czech Republic": "🇨🇿",
  France: "🇫🇷",
  Italy: "🇮🇹",
  Spain: "🇪🇸",
  Portugal: "🇵🇹",
  "United Kingdom": "🇬🇧",
  "United States": "🇺🇸",
  Canada: "🇨🇦",
  Brazil: "🇧🇷",
  Global: "🌍",
};

const LANGUAGE_FLAGS: Record<string, string> = {
  English: "🇬🇧",
  German: "🇩🇪",
  Polish: "🇵🇱",
  Romanian: "🇷🇴",
  Turkish: "🇹🇷",
  Spanish: "🇪🇸",
  Portuguese: "🇵🇹",
  French: "🇫🇷",
  Italian: "🇮🇹",
  Hungarian: "🇭🇺",
  Czech: "🇨🇿",
  Other: "🌐",
};

export function countryFlag(country: string) {
  return COUNTRY_FLAGS[country] ?? "🌍";
}

export function languageFlag(language: string) {
  return LANGUAGE_FLAGS[language] ?? "🌐";
}
