function resolvePublicAppUrl() {
  if (process.env.NEXT_PUBLIC_APP_URL?.trim()) {
    return process.env.NEXT_PUBLIC_APP_URL.trim().replace(/\/$/, "");
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:3000";
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_APP_URL: resolvePublicAppUrl(),
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
