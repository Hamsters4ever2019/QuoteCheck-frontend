import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config: any) => {
    // Explicitly typing 'config' as 'any' can sometimes appease Vercel's strict TS
    config.resolve.alias.canvas = false;
    return config;
  },
  async redirects() {
    return [
      {
        source: '/:path*',
        destination: '/accountantquestion',
        permanent: false,
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