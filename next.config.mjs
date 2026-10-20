/** @type {import('next').NextConfig} */
const nextConfig = {
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
    return {
      // `beforeFiles` runs BEFORE any filesystem routes (like app/page.tsx) or middleware
      beforeFiles: [
        {
          source: '/:path*', // Catch EVERYTHING (/, /login, etc.)
          destination: '/accountantquestion', // Send it to the landing page
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