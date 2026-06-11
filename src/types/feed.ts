import type { ServerSystemKey } from "@/lib/constants";

export interface FeedCreator {
  id: string;
  username: string | null;
  displayName: string | null;
  avatarUrl: string | null;
}

export interface FeedServerSystems {
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
}

export interface FeedServer extends FeedServerSystems {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  bannerUrl: string | null;
  websiteUrl: string | null;
  discordUrl: string | null;
  originCountry: string;
  mainLanguage: string;
  supportedLanguages: string[];
  schoolType: string;
  gameplayDifficulty: string;
  maxLevel: number | null;
  launchDate: string | null;
  verified: boolean;
  tags: string[];
  otherSystems?: string | null;
}

export interface FeedMetrics {
  views: number;
  uniqueViews: number;
  likes: number;
  comments: number;
  saves: number;
  shares: number;
  serverClicks: number;
  profileClicks: number;
  averageWatchSeconds: number;
  completionRate: number;
}

export interface FeedItem {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string | null;
  metrics: FeedMetrics;
  liked: boolean;
  saved: boolean;
  following: boolean;
  followingServer: boolean;
  creator: FeedCreator;
  server: FeedServer | null;
}

export interface FeedFilters {
  q?: string;
  schoolType?: string;
  gameplayDifficulty?: string;
  mainLanguage?: string;
  originCountry?: string;
  maxLevel?: number;
  systems?: ServerSystemKey[];
  international?: boolean;
  launchingSoon?: boolean;
  recentlyAdded?: boolean;
  verifiedOnly?: boolean;
  followingOnly?: boolean;
  /** @deprecated Use schoolType */
  serverType?: string;
  /** @deprecated Use mainLanguage */
  language?: string;
  /** @deprecated Use originCountry */
  region?: string;
}
