import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Without this, Turbopack walks up to /Users/apple looking for a workspace
  // root and finds an unrelated package-lock.json there.
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
