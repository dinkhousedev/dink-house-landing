/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  eslint: {
    ignoreDuringBuilds: true,
  },
  env: {
    DB_HOST: process.env.DB_HOST,
    DB_PORT: process.env.DB_PORT,
    DB_NAME: process.env.DB_NAME,
    DB_USER: process.env.DB_USER,
    DB_PASSWORD: process.env.DB_PASSWORD,
    DB_SSL: process.env.DB_SSL,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    CONTACT_EMAIL: process.env.CONTACT_EMAIL,
    FROM_EMAIL: process.env.FROM_EMAIL,
    SITE_URL: process.env.SITE_URL,
    RATE_LIMIT_PER_MINUTE: process.env.RATE_LIMIT_PER_MINUTE,
    RATE_LIMIT_PER_HOUR: process.env.RATE_LIMIT_PER_HOUR,
    NEXT_PUBLIC_APPSYNC_API_URL: process.env.NEXT_PUBLIC_APPSYNC_API_URL,
    NEXT_PUBLIC_APPSYNC_API_KEY: process.env.NEXT_PUBLIC_APPSYNC_API_KEY,
    NEXT_PUBLIC_APPSYNC_REGION: process.env.NEXT_PUBLIC_APPSYNC_REGION,
    NEXT_PUBLIC_AWS_API_URL: process.env.NEXT_PUBLIC_AWS_API_URL,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "nextuipro.nyc3.cdn.digitaloceanspaces.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "wchxzbuuwssrnaxshseu.supabase.co",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "dpu7e3z5fb56y.cloudfront.net",
        pathname: "/media/**",
      },
      {
        protocol: "https",
        hostname: "d1a058opxsfz0y.cloudfront.net",
        pathname: "/media/**",
      },
    ],
  },
  // Production optimizations - automatically strips console.log in production builds
  compiler: {
    // Remove console.log in production (keeps console.error and console.warn)
    removeConsole:
      process.env.NODE_ENV === "production"
        ? {
            exclude: ["error", "warn"],
          }
        : false,
  },
  // swcMinify is now enabled by default in Next.js 13+, no need to specify
  poweredByHeader: false,
  // Disable source maps in production for security and performance
  productionBrowserSourceMaps: false,
  // Disable x-powered-by header
  generateBuildId: async () => {
    // Use commit hash or timestamp for production builds
    return process.env.BUILD_ID || `build-${Date.now()}`;
  },
};

module.exports = nextConfig;
