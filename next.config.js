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
}

module.exports = nextConfig
