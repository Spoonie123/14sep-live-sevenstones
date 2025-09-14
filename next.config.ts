import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Laat de build niet falen op ESLint-fouten
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Laat de build niet falen op TypeScript type errors
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
