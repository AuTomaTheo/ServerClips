import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { buildServerWhere, serverInclude } from "@/lib/servers";
import { rankServers } from "@/lib/search-ranking";
import { ServerCard } from "@/components/servers/server-card";
import { ExploreFilters } from "@/components/servers/explore-filters";
import { Skeleton } from "@/components/ui/skeleton";
import type { ServerSystemKey } from "@/lib/constants";

export const metadata = { title: "Explore" };

interface ExploreProps {
  searchParams: Record<string, string | string[] | undefined>;
}

function getParam(
  params: Record<string, string | string[] | undefined>,
  key: string
): string | undefined {
  const val = params[key];
  return Array.isArray(val) ? val[0] : val;
}

async function ExploreFeed({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const systemsParam = getParam(searchParams, "systems");
  const filters = {
    q: getParam(searchParams, "q"),
    schoolType: getParam(searchParams, "schoolType") ?? getParam(searchParams, "serverType"),
    gameplayDifficulty: getParam(searchParams, "gameplayDifficulty"),
    mainLanguage: getParam(searchParams, "mainLanguage") ?? getParam(searchParams, "language"),
    originCountry: getParam(searchParams, "originCountry") ?? getParam(searchParams, "region"),
    maxLevel: getParam(searchParams, "maxLevel")
      ? parseInt(getParam(searchParams, "maxLevel")!, 10)
      : undefined,
    systems: systemsParam
      ? (systemsParam.split(",").filter(Boolean) as ServerSystemKey[])
      : undefined,
    launchAfter: getParam(searchParams, "launchAfter"),
    launchBefore: getParam(searchParams, "launchBefore"),
  };

  const where = buildServerWhere(filters);
  const query = getParam(searchParams, "q");

  const [featured, allServers] = await Promise.all([
    prisma.server.findMany({
      where: { status: "APPROVED", featured: true },
      include: serverInclude,
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
    prisma.server.findMany({
      where,
      include: serverInclude,
      take: 48,
    }),
  ]);

  const servers = query ? rankServers(allServers, query) : allServers;

  return (
    <>
      {featured.length > 0 && !query && (
        <section className="mb-10">
          <h2 className="app-section-title mb-4">Featured Servers</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((server) => (
              <ServerCard key={server.id} server={server} />
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="app-section-title mb-4">
          {query ? `Results for "${query}"` : "All Servers"}
        </h2>
        {servers.length === 0 ? (
          <div className="app-card p-8 text-center text-sm text-zinc-500">
            No servers match your filters.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {servers.map((server) => (
              <ServerCard key={server.id} server={server} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}

export default function ExplorePage({ searchParams }: ExploreProps) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="app-card mb-8 p-6">
        <h1 className="text-xl font-bold text-white">Explore Servers</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Discover servers through their promo videos. Filter by school type, difficulty, systems, and more.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
        <aside className="hidden lg:block">
          <Suspense fallback={<Skeleton className="h-64 rounded-xl" />}>
            <ExploreFilters layout="sidebar" />
          </Suspense>
        </aside>

        <div>
          <div className="mb-6 lg:hidden">
            <Suspense fallback={<Skeleton className="h-40 rounded-xl" />}>
              <ExploreFilters layout="horizontal" />
            </Suspense>
          </div>

          <Suspense
            fallback={
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="aspect-video rounded-xl" />
                ))}
              </div>
            }
          >
            <ExploreFeed searchParams={searchParams} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
