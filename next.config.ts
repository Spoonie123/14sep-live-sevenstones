// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  experimental: { optimizePackageImports: ["@supabase/supabase-js"] },

  async redirects() {
    return [
      {
        source: "/",
        destination: "/login",
        permanent: false, // 307 on Vercel edge
      },
    ];
  },
};

export default nextConfig;
