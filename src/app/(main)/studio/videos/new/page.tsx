import { requireAuth } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { VideoUploadForm } from "@/components/creator/video-upload-form";

export const metadata = { title: "Upload Video" };

export default async function NewVideoPage() {
  const user = await requireAuth();
  const memberships = await prisma.serverMember.findMany({
    where: { userId: user.id },
    include: { server: { select: { id: true, name: true } } },
    orderBy: { createdAt: "asc" },
  });

  const servers = memberships.map((m) => m.server);
  const profilePath = user.username ? `/u/${user.username}` : "/";

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <div className="app-card p-6">
        <h1 className="mb-2 text-xl font-bold text-white">Upload promo video</h1>
        <p className="mb-6 text-sm text-zinc-400">
          Uploading your first video makes you a Creator on ServerClips. Video/image uploads only — no game clients or executables.
        </p>
        <VideoUploadForm servers={servers} redirectTo={profilePath} />
      </div>
    </div>
  );
}
