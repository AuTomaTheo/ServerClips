import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role, UserStatus } from "@/generated/prisma/client";
import { redirect } from "next/navigation";
import {
  canAccessAdmin,
  canAccessCreatorDashboard,
  canModerateContent,
  isUserActive,
} from "@/lib/permissions";

export type AppUser = {
  id: string;
  email: string;
  name?: string | null;
  role: Role;
  status: UserStatus;
  username?: string | null;
  displayName?: string | null;
  impersonatedBy?: string;
  realAdminId?: string;
};

export async function getCurrentUser(): Promise<AppUser | null> {
  const session = await auth();
  if (!session?.user) return null;

  const realAdminId = session.impersonatedBy;
  const effectiveId = session.user.id;

  if (realAdminId) {
    const impersonated = await prisma.user.findUnique({
      where: { id: effectiveId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        username: true,
        displayName: true,
      },
    });
    if (!impersonated) return null;
    return {
      ...impersonated,
      impersonatedBy: realAdminId,
      realAdminId,
    };
  }

  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    role: session.user.role,
    status: session.user.status ?? "ACTIVE",
    username: session.user.username,
    displayName: session.user.displayName,
  };
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!isUserActive(user) && !user.impersonatedBy) redirect("/login?error=suspended");
  return user;
}

export async function requireRole(...roles: Role[]) {
  const user = await requireAuth();
  const effectiveRole = user.impersonatedBy
    ? (await prisma.user.findUnique({ where: { id: user.realAdminId! }, select: { role: true } }))
        ?.role ?? user.role
    : user.role;
  if (!roles.includes(effectiveRole)) redirect("/");
  return user;
}

export async function requireAdmin() {
  const user = await requireAuth();
  const admin = user.impersonatedBy
    ? await prisma.user.findUnique({ where: { id: user.realAdminId! } })
    : user;
  if (!admin || !canAccessAdmin(admin)) redirect("/");
  return { user, admin };
}

export async function requireModerator() {
  const user = await requireAuth();
  const mod = user.impersonatedBy
    ? await prisma.user.findUnique({ where: { id: user.realAdminId! } })
    : user;
  if (!mod || !canModerateContent(mod)) redirect("/");
  return { user, moderator: mod };
}

export async function requireCreator() {
  const user = await requireAuth();
  if (!canAccessCreatorDashboard(user) && !user.impersonatedBy) redirect("/");
  return user;
}

export function canManageListing(
  user: { id: string; role: Role; impersonatedBy?: string },
  ownerId: string
): boolean {
  if (user.impersonatedBy) return false;
  return user.id === ownerId || user.role === "ADMIN";
}

export function canManageVideo(
  user: { id: string; role: Role; impersonatedBy?: string },
  ownerId: string
): boolean {
  if (user.impersonatedBy) return false;
  return user.id === ownerId || user.role === "ADMIN";
}
