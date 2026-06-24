import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [],
    // Allow data URLs (base64) for uploaded images handled client-side
    // Local /public images work by default
  },
};

export default nextConfig;
