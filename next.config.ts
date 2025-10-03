import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    output: "standalone",
    images: { remotePatterns: [{ protocol: "https", hostname: "**" }] },
    experimental: {
        optimizeCss: false, // ⛔ Next: don't use LightningCSS
    },
};
export default nextConfig;