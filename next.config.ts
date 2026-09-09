import type { NextConfig } from "next";

const isStaticExport = process.env.NEXT_EXPORT === "1";

const nextConfig: NextConfig = {
  output: isStaticExport ? "export" : undefined,
  allowedDevOrigins: ["10.0.2.2"],
};

export default nextConfig;
