import { notFound } from "next/navigation";
import { requireCreator } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { ListingForm } from "@/components/servers/listing-form";
import { Metin2Frame } from "@/components/metin2/metin2-frame";
import { canEditServerProfile, canBypassServerPermissions } from "@/lib/permissions";
import { getServerMember } from "@/lib/servers";
import { format } from "date-fns";

export const metadata = { title: "Edit Server" };

export default async function EditServerPage({ params }: { params: { id: string } }) {
  const user = await requireCreator();
  const server = await prisma.server.findUnique({
    where: { id: params.id },
    include: { tags: { include: { tag: true } } },
  });

  if (!server) notFound();

  const member = await getServerMember(params.id, user.id);
  if (!canBypassServerPermissions(user) && !canEditServerProfile(member)) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <Metin2Frame title={`Edit: ${server.name}`}>
        <ListingForm
          mode="edit"
          listingId={server.id}
          defaultValues={{
            name: server.name,
            description: server.description,
            websiteUrl: server.websiteUrl ?? "",
            discordUrl: server.discordUrl ?? "",
            region: server.region,
            language: server.language,
            serverType: server.serverType,
            expRate: server.expRate,
            yangRate: server.yangRate,
            dropRate: server.dropRate,
            launchDate: server.launchDate ? format(server.launchDate, "yyyy-MM-dd") : "",
            tags: server.tags.map((t) => t.tag.name).join(", "),
          }}
        />
      </Metin2Frame>
    </div>
  );
}
