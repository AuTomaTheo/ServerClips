import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { auth } from "@/lib/auth";
const f = createUploadthing();

function assertCanUpload(role: string) {
  if (!["USER", "CREATOR", "MODERATOR", "ADMIN"].includes(role)) {
    throw new UploadThingError("Forbidden");
  }
}

export const ourFileRouter = {
  videoUploader: f(
    {
      video: {
        maxFileSize: "128MB",
        maxFileCount: 1,
      },
    },
    { awaitServerData: false }
  )
    .middleware(async () => {
      const session = await auth();
      if (!session?.user) throw new UploadThingError("Unauthorized");
      assertCanUpload(session.user.role);
      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ file }) => {
      return { url: file.url, key: file.key };
    }),

  imageUploader: f(
    {
      image: {
        maxFileSize: "8MB",
        maxFileCount: 1,
      },
    },
    { awaitServerData: false }
  )
    .middleware(async () => {
      const session = await auth();
      if (!session?.user) throw new UploadThingError("Unauthorized");
      assertCanUpload(session.user.role);
      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ file }) => {
      return { url: file.url, key: file.key };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
