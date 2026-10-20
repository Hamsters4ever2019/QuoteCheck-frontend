import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    return config;
  },
  
  // 🚨 THE BULLETPROOF REDIRECT 🚨
  async redirects() {
    return [
      {
        source: '/:path*', // Catch EVERYTHING (/, /login, /dashboard, etc.)
        destination: '/accountantquestion', // Send it to the landing page
        permanent: false, // Use 307 (temporary) so browsers don't cache it forever
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