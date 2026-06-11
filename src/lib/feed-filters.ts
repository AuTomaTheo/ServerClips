import type { FeedFilters } from "@/types/feed";

export function buildFeedQuery(filters: FeedFilters): string {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.schoolType ?? filters.serverType) {
    params.set("schoolType", filters.schoolType ?? filters.serverType!);
  }
  if (filters.gameplayDifficulty) params.set("gameplayDifficulty", filters.gameplayDifficulty);
  if (filters.mainLanguage ?? filters.language) {
    params.set("mainLanguage", filters.mainLanguage ?? filters.language!);
  }
  if (filters.originCountry ?? filters.region) {
    params.set("originCountry", filters.originCountry ?? filters.region!);
  }
  if (filters.maxLevel) params.set("maxLevel", String(filters.maxLevel));
  if (filters.systems?.length) params.set("systems", filters.systems.join(","));
  if (filters.international) params.set("international", "true");
  if (filters.launchingSoon) params.set("launchingSoon", "true");
  if (filters.recentlyAdded) params.set("recentlyAdded", "true");
  if (filters.verifiedOnly) params.set("verifiedOnly", "true");
  if (filters.followingOnly) params.set("following", "true");
  return params.toString();
}
