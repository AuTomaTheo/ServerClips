import { z } from "zod";

export const videoSchema = z.object({
  title: z.string().min(3).max(120),
  description: z.string().max(2000).optional().or(z.literal("")),
  videoUrl: z.string().min(1),
  thumbnailUrl: z.string().optional().or(z.literal("")),
  serverId: z.string().optional().or(z.literal("")),
  visibility: z.enum(["PUBLIC", "PRIVATE", "UNLISTED"]).default("PUBLIC"),
});

export type VideoInput = z.input<typeof videoSchema>;
export type VideoOutput = z.infer<typeof videoSchema>;

export const commentSchema = z.object({
  body: z.string().min(2).max(1000),
});

export type CommentInput = z.infer<typeof commentSchema>;

export const reportSchema = z.object({
  reason: z.enum([
    "COPYRIGHT",
    "SPAM",
    "SCAM",
    "OFFENSIVE",
    "MISLEADING",
    "MALWARE",
    "OTHER",
  ]),
  details: z.string().max(2000).optional().or(z.literal("")),
  targetType: z.enum(["VIDEO", "COMMENT", "USER", "SERVER", "LINK"]),
  targetId: z.string().min(1),
});

export type ReportInput = z.infer<typeof reportSchema>;
