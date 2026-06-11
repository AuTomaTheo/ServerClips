import { createRouteHandler } from "uploadthing/next";
import { NextResponse } from "next/server";
import { ourFileRouter } from "./core";
import { isUploadThingConfigured } from "@/lib/upload/config";

const { GET: uploadthingGet, POST: uploadthingPost } = createRouteHandler({
  router: ourFileRouter,
});

export async function GET(req: import("next/server").NextRequest) {
  if (new URL(req.url).searchParams.get("health") === "1") {
    return NextResponse.json({
      configured: isUploadThingConfigured(),
    });
  }
  return uploadthingGet(req);
}

export const POST = uploadthingPost;
