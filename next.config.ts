import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Exclude exceljs from server bundle — it uses browser APIs (Blob, etc.)
  serverExternalPackages: ['exceljs'],
};

export default nextConfig;
