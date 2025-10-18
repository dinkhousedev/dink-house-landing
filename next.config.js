/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
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
