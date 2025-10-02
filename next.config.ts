// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    output: "standalone",
    images: { remotePatterns: [{ protocol: "https", hostname: "**" }] },
    // eslint: { ignoreDuringBuilds: true }, // (optional)
};

export default nextConfig;