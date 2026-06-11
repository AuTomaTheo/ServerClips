import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

/** Public site origin — manual env, Vercel system vars, browser, or localhost. */
export function getAppBaseUrl(): string {
  const manual = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (manual) return manual.replace(/\/$/, "");

  const vercelProd =
    process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL ??
    process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercelProd) {
    return `https://${vercelProd.replace(/^https?:\/\//, "")}`;
  }

  const vercelUrl =
    process.env.NEXT_PUBLIC_VERCEL_URL ?? process.env.VERCEL_URL;
  if (vercelUrl) {
    return `https://${vercelUrl.replace(/^https?:\/\//, "")}`;
  }

  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  return "http://localhost:3000";
}

export function absoluteUrl(path: string): string {
  const base = getAppBaseUrl();
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}
