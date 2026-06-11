import { notFound } from "next/navigation";
import { requireCreator } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { ListingForm } from "@/components/servers/listing-form";
import { canEditServerProfile, canBypassServerPermissions } from "@/lib/permissions";
import { getServerMember } from "@/lib/servers";
import { format } from "date-fns";

export const metadata = { title: "Edit Server" };

export default async function EditServerPage({ params }: { params: { id: string } }) {
  const user = await requireCreator();
  const server = await prisma.server.findUnique({
    where: { id: params.id },
    include: {
      tags: { include: { tag: true } },
      members: { where: { userId: user.id } },
    },
  });

  if (!server) notFound();

  const member = await getServerMember(params.id, user.id);
  if (!canBypassServerPermissions(user) && !canEditServerProfile(member)) notFound();

  const userMember = server.members[0];

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="app-card p-6">
        <h1 className="mb-6 text-xl font-bold text-white">Edit: {server.name}</h1>
        <ListingForm
          mode="edit"
          listingId={server.id}
          defaultValues={{
            name: server.name,
            description: server.description ?? "",
            otherSystems: server.otherSystems ?? "",
            websiteUrl: server.websiteUrl ?? "",
            discordUrl: server.discordUrl ?? "",
            logoUrl: server.logoUrl ?? "",
            bannerUrl: server.bannerUrl ?? "",
            originCountry: server.originCountry,
            mainLanguage: server.mainLanguage,
            supportedLanguages: server.supportedLanguages,
            schoolType: server.schoolType,
            gameplayDifficulty: server.gameplayDifficulty,
            maxLevel: server.maxLevel ?? undefined,
            launchDate: server.launchDate ? format(server.launchDate, "yyyy-MM-dd") : "",
            memberRole: userMember?.role ?? "OWNER",
            representsServer: server.representsServer,
            systems: {
              systemAlchemy: server.systemAlchemy,
              systemScarf: server.systemScarf,
              systemLycan: server.systemLycan,
              systemBonus67: server.systemBonus67,
              systemOfflineShop: server.systemOfflineShop,
              systemCostume: server.systemCostume,
              systemPet: server.systemPet,
              systemMount: server.systemMount,
              systemBattlePass: server.systemBattlePass,
              systemDungeonRanking: server.systemDungeonRanking,
              systemElement: server.systemElement,
              systemTalisman: server.systemTalisman,
            },
          }}
        />
      </div>
    </div>
  );
}
