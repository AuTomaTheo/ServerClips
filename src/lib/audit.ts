import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";

export type AuditAction =
  | "USER_WARN"
  | "USER_SUSPEND"
  | "USER_BAN"
  | "USER_UNBAN"
  | "USER_ROLE_CHANGE"
  | "USER_DELETE_AVATAR"
  | "USER_DELETE_BANNER"
  | "VIDEO_APPROVE"
  | "VIDEO_REJECT"
  | "VIDEO_SUSPEND"
  | "VIDEO_UNSUSPEND"
  | "VIDEO_DELETE"
  | "VIDEO_UPDATE"
  | "SERVER_APPROVE"
  | "SERVER_REJECT"
  | "SERVER_SUSPEND"
  | "SERVER_UPDATE"
  | "COMMENT_DELETE"
  | "COMMENT_RESTORE"
  | "REPORT_DISMISS"
  | "REPORT_RESOLVE"
  | "IMPERSONATION_START"
  | "IMPERSONATION_STOP";

export async function createAuditLog(params: {
  adminId: string;
  action: AuditAction | string;
  targetType: string;
  targetId: string;
  reason?: string;
  metadata?: Record<string, unknown>;
  impersonatedUserId?: string;
}) {
  return prisma.adminAuditLog.create({
    data: {
      adminId: params.adminId,
      action: params.action,
      targetType: params.targetType,
      targetId: params.targetId,
      reason: params.reason,
      metadata: (params.metadata ?? undefined) as Prisma.InputJsonValue | undefined,
      impersonatedUserId: params.impersonatedUserId,
    },
  });
}
