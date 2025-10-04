/** @type {import('next').NextConfig} */
const nextConfig = {
    output: "standalone",
    images: { remotePatterns: [{ protocol: "https", hostname: "**" }] },
    experimental: {
        optimizeCss: false, // ⛔ let PostCSS handle CSS for Tailwind v4
    },
};
export default nextConfig;