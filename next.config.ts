import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      // ExcelJS uses browser APIs (Blob, etc.) — exclude from server bundle
      config.externals = [...(config.externals || []), 'exceljs'];
    }
    return config;
  },
};

export default nextConfig;
