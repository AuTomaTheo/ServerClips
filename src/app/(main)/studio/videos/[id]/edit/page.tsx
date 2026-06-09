import { notFound } from "next/navigation";
import { requireCreator, canManageVideo } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { Metin2Frame } from "@/components/metin2/metin2-frame";
import { VideoUploadForm } from "@/components/creator/video-upload-form";

export default async function EditVideoPage({ params }: { params: { id: string } }) {
  const user = await requireCreator();
  const video = await prisma.video.findUnique({ where: { id: params.id } });
  if (!video || !canManageVideo(user, video.creatorId)) notFound();

  const memberships = await prisma.serverMember.findMany({
    where: { userId: user.id },
    include: { server: { select: { id: true, name: true } } },
  });

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <Metin2Frame title="Edit video">
        <VideoUploadForm
          servers={memberships.map((m) => m.server)}
          videoId={video.id}
          defaultValues={{
            title: video.title,
            description: video.description ?? "",
            videoUrl: video.videoUrl,
            visibility: video.visibility,
            serverId: video.serverId ?? "",
          }}
        />
      </Metin2Frame>
    </div>
  );
}
