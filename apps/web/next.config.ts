import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@workspace/api", "@workspace/shared", "@workspace/ui"],
};

export default nextConfig;
