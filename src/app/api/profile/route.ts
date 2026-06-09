import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { profileSchema } from "@/lib/validators/profile";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      username: true,
      displayName: true,
      bio: true,
      avatarUrl: true,
      bannerUrl: true,
      websiteUrl: true,
      socialLinks: true,
      likedVideosPublic: true,
      savedVideosPublic: true,
      role: true,
      status: true,
    },
  });

  return NextResponse.json(user);
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user || session.impersonatedBy) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = profileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  }

  const data = parsed.data;
  const username = data.username;

  if (username) {
    const taken = await prisma.user.findFirst({
      where: { username, NOT: { id: session.user.id } },
    });
    if (taken) {
      return NextResponse.json({ error: "Username taken" }, { status: 400 });
    }
  }

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      displayName: data.displayName,
      username: username ?? undefined,
      bio: data.bio ?? undefined,
      websiteUrl: data.websiteUrl || null,
      socialLinks: data.socialLinks ?? undefined,
      likedVideosPublic: data.likedVideosPublic,
      savedVideosPublic: data.savedVideosPublic,
    },
  });

  return NextResponse.json(user);
}
