import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Metin2Frame } from "@/components/metin2/metin2-frame";
import { ProfileEditForm } from "@/components/profile/profile-edit-form";

export const metadata = { title: "Edit Profile" };

export default async function EditProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      displayName: true,
      username: true,
      bio: true,
      websiteUrl: true,
      socialLinks: true,
      likedVideosPublic: true,
      savedVideosPublic: true,
      avatarUrl: true,
    },
  });

  if (!user) redirect("/login");

  return (
    <div className="mx-auto max-w-lg px-4 py-10 sm:px-6">
      <Metin2Frame title="Edit Profile">
        <ProfileEditForm
          defaultValues={{
            displayName: user.displayName ?? "",
            username: user.username ?? "",
            bio: user.bio ?? "",
            websiteUrl: user.websiteUrl ?? "",
            likedVideosPublic: user.likedVideosPublic,
            savedVideosPublic: user.savedVideosPublic,
            socialLinks: (user.socialLinks as Record<string, string>) ?? {},
          }}
        />
      </Metin2Frame>
    </div>
  );
}
