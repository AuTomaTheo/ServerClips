import { z } from "zod";

const usernameRegex = /^[a-z0-9_]{3,30}$/;

export const profileSchema = z.object({
  displayName: z.string().min(2).max(50).optional(),
  username: z
    .string()
    .min(3)
    .max(30)
    .regex(usernameRegex, "Username: 3-30 chars, lowercase letters, numbers, underscore")
    .optional(),
  bio: z.string().max(500).optional().or(z.literal("")),
  websiteUrl: z.string().url().optional().or(z.literal("")),
  socialLinks: z
    .object({
      discord: z.string().url().optional().or(z.literal("")),
      twitter: z.string().url().optional().or(z.literal("")),
      youtube: z.string().url().optional().or(z.literal("")),
      tiktok: z.string().url().optional().or(z.literal("")),
    })
    .optional(),
  likedVideosPublic: z.boolean().optional(),
  savedVideosPublic: z.boolean().optional(),
});

export type ProfileInput = z.infer<typeof profileSchema>;
