import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.1.186"],
  typescript: {
    ignoreBuildErrors: true,
  },
  serverExternalPackages: ["bcryptjs"],
};

export default nextConfig;
