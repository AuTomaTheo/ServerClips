export interface FeedCreator {
  id: string;
  username: string | null;
  displayName: string | null;
  avatarUrl: string | null;
}

export interface FeedServer {
  id: string;
  name: string;
  slug: string;
  websiteUrl: string | null;
  discordUrl: string | null;
  region: string;
  language: string;
  serverType: string;
  expRate: string;
  yangRate: string;
  dropRate: string;
  launchDate: string | null;
  verified: boolean;
  tags: string[];
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
  serverType?: string;
  language?: string;
  region?: string;
  international?: boolean;
  launchingSoon?: boolean;
  recentlyAdded?: boolean;
  verifiedOnly?: boolean;
}
