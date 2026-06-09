import { z } from "zod";
import { LANGUAGES, REGIONS, SERVER_TYPES } from "@/lib/constants";

const serverTypeValues = SERVER_TYPES.map((t) => t.value) as [
  string,
  ...string[],
];

export const listingSchema = z.object({
  name: z.string().min(3).max(80),
  description: z.string().min(10, "Description must be at least 10 characters").max(5000),
  websiteUrl: z.string().url().optional().or(z.literal("")),
  discordUrl: z.string().url().optional().or(z.literal("")),
  region: z.enum(REGIONS as unknown as [string, ...string[]]),
  language: z.enum(LANGUAGES as unknown as [string, ...string[]]),
  serverType: z.enum(serverTypeValues),
  expRate: z.string().min(1).max(30),
  yangRate: z.string().min(1).max(30),
  dropRate: z.string().min(1).max(30),
  launchDate: z.string().optional().or(z.literal("")),
  tags: z.string().optional().or(z.literal("")),
});

export type ListingInput = z.infer<typeof listingSchema>;
