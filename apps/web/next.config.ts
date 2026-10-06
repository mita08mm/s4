import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Self-contained server (`.next/standalone`) for a small production Docker image.
  output: "standalone",
  reactCompiler: true,
};

export default nextConfig;
