/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['fra.cloud.appwrite.io'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'fra.cloud.appwrite.io',
        pathname: '/v1/storage/buckets/**',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '5mb',
    },
  },
}

module.exports = nextConfig