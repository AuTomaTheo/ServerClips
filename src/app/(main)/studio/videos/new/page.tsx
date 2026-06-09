import { requireCreator } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { Metin2Frame } from "@/components/metin2/metin2-frame";
import { VideoUploadForm } from "@/components/creator/video-upload-form";

export const metadata = { title: "Upload Video" };

export default async function NewVideoPage() {
  const user = await requireCreator();
  const memberships = await prisma.serverMember.findMany({
    where: { userId: user.id },
    include: { server: { select: { id: true, name: true } } },
    orderBy: { createdAt: "asc" },
  });

  const servers = memberships.map((m) => m.server);

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <Metin2Frame title="Upload promo video">
        <p className="mb-4 text-sm text-[#4a3020]">
          Video/image uploads only. No game clients, patches, launchers, or executables.
        </p>
        <VideoUploadForm servers={servers} redirectTo="/studio" />
      </Metin2Frame>
    </div>
  );
}
