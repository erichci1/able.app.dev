import path from "node:path";

/** @type {import('next').NextConfig} */
const nextConfig = {
    output: "standalone",
    images: { remotePatterns: [{ protocol: "https", hostname: "**" }] },
    experimental: {
        optimizeCss: false, // Tailwind v4 stability
    },
    // 👇 make Next use THIS repo as the root for tooling resolution
    outputFileTracingRoot: path.join(process.cwd()),

    // Optional safety net while you finish typing:
    // typescript: { ignoreBuildErrors: true },
};

export default nextConfig;