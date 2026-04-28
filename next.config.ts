import type { NextConfig } from "next";

const useLocalWindowsBuildWorkaround = process.platform === "win32" && !process.env.VERCEL;

const nextConfig: NextConfig = useLocalWindowsBuildWorkaround
  ? {
      // Keep build output behind a local junction that points outside OneDrive on
      // Windows. The helper script prepares the junction before Next starts.
      distDir: "next-build-link",
    }
  : {};

export default nextConfig;
