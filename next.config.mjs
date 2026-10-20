/** @type {import('next').NextConfig} */
const nextConfig = {
  // 1. Keep your TypeScript build error ignore rule
  typescript: {
    ignoreBuildErrors: true,
  },

  // 2. Add an empty turbopack config to satisfy Next.js 16
  turbopack: {},

  // 3. Keep your canvas fix for @react-pdf/renderer
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    return config;
  },

  // 4. The domain routing magic for your £15 landing page
  async rewrites() {
    return {
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