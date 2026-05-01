import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  allowedDevOrigins: [
    "preview-chat-002699ee-ab75-4fc2-9072-c3000d3d6eb4.space-z.ai",
  ],
  serverExternalPackages: ["pg", "drizzle-orm", "bcryptjs"],
};

export default nextConfig;
