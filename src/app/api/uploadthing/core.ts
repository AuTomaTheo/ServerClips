import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";
import type { Role } from "@/generated/prisma/client";

const f = createUploadthing();

function assertCanUpload(role: string) {
  if (!["USER", "CREATOR", "MODERATOR", "ADMIN"].includes(role)) {
    throw new UploadThingError("Forbidden");
  }
}

async function requireUploadSession(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET,
  });

  if (!token) {
    throw new UploadThingError("Unauthorized — please sign in again");
  }

  const userId = (token.id ?? token.sub) as string | undefined;
  const role = token.role as Role | undefined;

  if (!userId || !role) {
    throw new UploadThingError("Unauthorized — session expired");
  }

  assertCanUpload(role);
  return { userId };
}

export const ourFileRouter = {
  videoUploader: f(
    {
      video: {
        maxFileSize: "128MB",
        maxFileCount: 1,
      },
    },
    { awaitServerData: true }
  )
    .middleware(async ({ req }) => requireUploadSession(req))
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
    { awaitServerData: true }
  )
    .middleware(async ({ req }) => requireUploadSession(req))
    .onUploadComplete(async ({ file }) => {
      return { url: file.url, key: file.key };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
