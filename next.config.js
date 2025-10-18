/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
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
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'nextuipro.nyc3.cdn.digitaloceanspaces.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'wchxzbuuwssrnaxshseu.supabase.co',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'dznfm70a0fusp.cloudfront.net',
        pathname: '/media/**',
      },
    ],
  },
  // Production optimizations - automatically strips console.log in production builds
  compiler: {
    // Remove console.log in production (keeps console.error and console.warn)
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  swcMinify: true,
  poweredByHeader: false,
}

module.exports = nextConfig
