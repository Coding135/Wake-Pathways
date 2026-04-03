import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  async redirects() {
    return [
      {
        source: '/explore',
        destination: '/opportunities',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
