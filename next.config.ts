import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    output: "standalone",
    images: { remotePatterns: [{ protocol: "https", hostname: "**" }] },
    experimental: {
        optimizeCss: false, // ⛔ disable LightningCSS optimizer
    },
};

export default nextConfig;