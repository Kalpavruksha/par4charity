import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
    ],
  },
  // Allow builds with TypeScript warnings during development
  typescript: {
    ignoreBuildErrors: false,
  },
}

export default nextConfig
