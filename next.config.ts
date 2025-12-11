import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
      },
    ],
  },

  async rewrites() {
  return [
    {
      source: "/django/:path*",
      destination: "https://slcrdss.in/django/:path*",
    },
  ]
},
}

export default nextConfig
