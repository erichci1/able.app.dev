import type { NextConfig } from "next";

const nextConfig: NextConfig = {
output: "standalone",
images: { remotePatterns: [{ protocol: "https", hostname: "example.com" }] }
};

export default nextConfig;