import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    qualities: [75, 90],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  // Three.js / R3F are client-only; keep them out of the server bundle path issues.
  transpilePackages: ["three"],
};

export default nextConfig;
