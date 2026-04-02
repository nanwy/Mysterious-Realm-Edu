import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@workspace/api", "@workspace/shared", "@workspace/ui"],
  allowedDevOrigins: ["ctf.chuzelab.com"],
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
