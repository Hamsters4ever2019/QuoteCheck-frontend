/** @type {import('next').NextConfig} */
const nextConfig = {
  // 1. Keep your TypeScript build error ignore rule
  typescript: {
    ignoreBuildErrors: true,
  },

  // 2. THE FIX: Port the canvas alias to Turbopack
  turbopack: {
    resolveAlias: {
      canvas: false,
    },
  },

  // 3. The domain routing magic for your £15 landing page
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