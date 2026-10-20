import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 1. Your existing build rules
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // 2. The Vercel Build Fix for @react-pdf/renderer (The Canvas Fix)
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    return config;
  },
  
  // 3. The Domain Routing Magic for the £15 Landing Page
  async rewrites() {
    return [
      {
        source: '/',
        destination: '/accountantquestion',
        has: [
          {
            type: 'host',
            value: 'fifteenquidukaccountantquestion.uk',
          },
        ],
      },
    ];
  },
};

export default nextConfig;