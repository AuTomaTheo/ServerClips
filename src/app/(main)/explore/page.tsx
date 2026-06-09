import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { buildServerWhere, serverInclude } from "@/lib/servers";
import { rankServers } from "@/lib/search-ranking";
import { ServerCard } from "@/components/servers/server-card";
import { ExploreFilters } from "@/components/servers/explore-filters";
import { Skeleton } from "@/components/ui/skeleton";
import { Metin2Frame } from "@/components/metin2/metin2-frame";

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
  const filters = {
    q: getParam(searchParams, "q"),
    language: getParam(searchParams, "language"),
    serverType: getParam(searchParams, "serverType"),
    region: getParam(searchParams, "region"),
    expRate: getParam(searchParams, "expRate"),
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
          <h2 className="mb-4 font-display text-xl font-bold text-metin2-gold">Featured Servers</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((server) => (
              <ServerCard key={server.id} server={server} />
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-4 font-display text-xl font-bold text-metin2-gold">
          {query ? `Results for "${query}"` : "All Servers"}
        </h2>
        {servers.length === 0 ? (
          <Metin2Frame>
            <p className="text-center text-metin2-ink/70">No servers match your filters.</p>
          </Metin2Frame>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
      <Metin2Frame title="Explore Servers" className="mb-8">
        <p className="text-sm text-metin2-ink/80">
          Browse Metin2 private servers in a classic listing layout. Click any server for full details and promo video.
        </p>
      </Metin2Frame>

      <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
        <aside className="hidden lg:block">
          <Suspense fallback={<Skeleton className="h-64 rounded" />}>
            <ExploreFilters layout="sidebar" />
          </Suspense>
        </aside>

        <div>
          <div className="mb-6 lg:hidden">
            <Suspense fallback={<Skeleton className="h-40 rounded" />}>
              <ExploreFilters layout="horizontal" />
            </Suspense>
          </div>

          <Suspense
            fallback={
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="aspect-video rounded" />
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
