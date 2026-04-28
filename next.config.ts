import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow loading dev assets (HMR, etc.) when opening the dev server
  // from another device on the LAN (e.g. phone).
  allowedDevOrigins: [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://10.50.72.115:3000",
  ],
};

export default nextConfig;
