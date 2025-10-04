// File: next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
    output: "standalone",
    images: { remotePatterns: [{ protocol: "https", hostname: "**" }] },

    // If you chose to disable LightningCSS earlier:
    // experimental: { optimizeCss: false },
};

export default nextConfig;
