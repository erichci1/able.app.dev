const nextConfig = {
    output: "standalone",
    images: { remotePatterns: [{ protocol: "https", hostname: "**" }] },
    experimental: {
        optimizeCss: false, // ⛔ Next: don't use LightningCSS
    },
};
export default nextConfig;