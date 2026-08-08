import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  // Avoid picking a parent lockfile as Turbopack root (breaks CSS resolution).
  turbopack: {
    root: path.join(__dirname),
  },
  async redirects() {
    return [
      {
        source: '/explore',
        destination: '/opportunities',
        permanent: true,
      },
      {
        source: '/browse',
        destination: '/opportunities',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
