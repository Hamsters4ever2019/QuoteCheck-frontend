import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    return config;
  },
  
  async rewrites() {
    return {
      // `beforeFiles` runs BEFORE the middleware or any client-side redirects
      beforeFiles: [
        {
          source: '/:path*', 
          destination: '/accountantquestion',
          has: [
            {
              type: 'host',
              value: 'fifteenquidukaccountantquestion.uk',
            },
          ],
        },
      ],
    };
  },
};

export default nextConfig;