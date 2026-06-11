function resolvePublicAppUrl() {
  if (process.env.NEXT_PUBLIC_APP_URL?.trim()) {
    const url = process.env.NEXT_PUBLIC_APP_URL.trim().replace(/\/$/, "");
    if (!url.includes("localhost")) return url;
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:3000";
}

function resolveAuthUrl() {
  for (const key of ["AUTH_URL", "NEXTAUTH_URL"]) {
    const value = process.env[key]?.trim();
    if (value && !value.includes("localhost")) {
      return value.replace(/\/$/, "");
    }
  }
  return resolvePublicAppUrl();
}

const appUrl = resolvePublicAppUrl();
const authUrl = resolveAuthUrl();

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_APP_URL: appUrl,
    AUTH_URL: authUrl,
    NEXTAUTH_URL: authUrl,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "localhost" },
    ],
    unoptimized: process.env.NODE_ENV === "development",
  },

  // Prevent corrupted webpack disk cache on Windows (root cause of CSS/JS 404s in dev)
  webpack: (config, { dev }) => {
    if (dev) {
      config.cache = { type: "memory" };
      config.watchOptions = {
        ...config.watchOptions,
        aggregateTimeout: 300,
      };
    }
    return config;
  },
};

export default nextConfig;
