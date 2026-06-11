import { z } from "zod";
import {
  GAMEPLAY_DIFFICULTIES,
  LANGUAGES,
  ORIGIN_COUNTRIES,
  SCHOOL_TYPES,
  SERVER_MEMBER_ROLES,
  SERVER_SYSTEMS,
} from "@/lib/constants";
import { normalizeMediaUrl } from "@/lib/media-url";

const schoolValues = SCHOOL_TYPES.map((t) => t.value) as [string, ...string[]];
const difficultyValues = GAMEPLAY_DIFFICULTIES.map((t) => t.value) as [string, ...string[]];
const roleValues = SERVER_MEMBER_ROLES.map((r) => r.value) as [string, ...string[]];

const systemShape = Object.fromEntries(
  SERVER_SYSTEMS.map((s) => [s.key, z.coerce.boolean().optional()])
) as Record<string, z.ZodOptional<z.ZodBoolean>>;

function optionalExternalUrlField(label: string) {
  return z
    .string()
    .optional()
    .or(z.literal(""))
    .transform((v) => {
      const trimmed = (v ?? "").trim();
      if (!trimmed) return "";
      if (trimmed.startsWith("/")) return trimmed;
      if (/^https?:\/\//i.test(trimmed)) return trimmed;
      return `https://${trimmed}`;
    })
    .pipe(
      z.union([
        z.literal(""),
        z.string().url(`Invalid ${label} — use a full URL like https://example.com`),
      ])
    );
}

function optionalMediaUrlField(label: string) {
  return z
    .string()
    .optional()
    .or(z.literal(""))
    .transform((v) => normalizeMediaUrl(v))
    .pipe(
      z.union([
        z.literal(""),
        z.string().startsWith("/"),
        z.string().url(`Invalid ${label}`),
      ])
    );
}

export const serverSubmissionSchema = z.object({
  name: z.string().min(3, "Server name must be at least 3 characters").max(80),
  websiteUrl: optionalExternalUrlField("website URL"),
  discordUrl: optionalExternalUrlField("Discord URL"),
  logoUrl: optionalMediaUrlField("logo URL"),
  bannerUrl: optionalMediaUrlField("banner URL"),
  launchDate: z.string().optional().or(z.literal("")),
  memberRole: z.enum(roleValues),
  representsServer: z.boolean(),
  maxLevel: z
    .union([z.number().int().min(1).max(250), z.string()])
    .optional()
    .transform((v) => {
      if (v === undefined || v === "") return undefined;
      const n = typeof v === "number" ? v : parseInt(v, 10);
      return Number.isFinite(n) ? n : undefined;
    }),
  schoolType: z.enum(schoolValues),
  gameplayDifficulty: z.enum(difficultyValues),
  originCountry: z.enum(ORIGIN_COUNTRIES as unknown as [string, ...string[]]),
  mainLanguage: z.enum(LANGUAGES as unknown as [string, ...string[]]),
  supportedLanguages: z.array(z.enum(LANGUAGES as unknown as [string, ...string[]])).min(1),
  systems: z.object(systemShape).optional(),
  description: z.string().max(5000).optional().or(z.literal("")),
  otherSystems: z.string().max(1000).optional().or(z.literal("")),
});

export type ServerSubmissionInput = z.infer<typeof serverSubmissionSchema>;

/** Studio edit form — same fields as submission */
export const listingSchema = serverSubmissionSchema;

export type ListingInput = ServerSubmissionInput;
