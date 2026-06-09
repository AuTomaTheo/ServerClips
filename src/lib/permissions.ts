import { Role, ServerMemberRole, UserStatus } from "@/generated/prisma/client";

export type SessionUser = {
  id: string;
  role: Role;
  status?: UserStatus;
  impersonatedBy?: string;
};

export type ServerMemberContext = {
  role: ServerMemberRole;
};

const PROFILE_EDIT_ROLES: ServerMemberRole[] = ["OWNER", "ADMIN"];
const VIDEO_MANAGE_ROLES: ServerMemberRole[] = ["OWNER", "ADMIN", "PROMOTER"];
const ANALYTICS_ROLES: ServerMemberRole[] = ["OWNER", "ADMIN", "ANALYST"];

export function isAdmin(user: { role: Role }) {
  return user.role === "ADMIN";
}

export function isModerator(user: { role: Role }) {
  return user.role === "MODERATOR" || user.role === "ADMIN";
}

export function isCreator(user: { role: Role }) {
  return user.role === "CREATOR" || user.role === "MODERATOR" || user.role === "ADMIN";
}

export function canModerateContent(user: { role: Role }) {
  return isModerator(user);
}

export function canAccessAdmin(user: { role: Role }) {
  return isModerator(user);
}

export function canAccessCreatorDashboard(user: { role: Role }) {
  return isCreator(user);
}

export function isUserActive(user: { status?: UserStatus }) {
  return !user.status || user.status === "ACTIVE" || user.status === "WARNED";
}

export function canImpersonate(user: { role: Role }) {
  return user.role === "ADMIN";
}

export function isImpersonating(user: { impersonatedBy?: string }) {
  return !!user.impersonatedBy;
}

export function isServerMember(member?: ServerMemberContext | null): member is ServerMemberContext {
  return !!member;
}

export function isServerOwner(member?: ServerMemberContext | null) {
  return member?.role === "OWNER";
}

/** Full server control: team, verification, billing (future), settings. */
export function canManageServer(member?: ServerMemberContext | null) {
  return member?.role === "OWNER";
}

export function canEditServerProfile(member?: ServerMemberContext | null) {
  return member ? PROFILE_EDIT_ROLES.includes(member.role) : false;
}

export function canManageServerVideos(member?: ServerMemberContext | null) {
  return member ? VIDEO_MANAGE_ROLES.includes(member.role) : false;
}

export function canViewServerAnalytics(member?: ServerMemberContext | null) {
  return member ? ANALYTICS_ROLES.includes(member.role) : false;
}

/** Platform moderators/admins bypass server-member checks. */
export function canBypassServerPermissions(user: { role: Role }) {
  return isModerator(user);
}
