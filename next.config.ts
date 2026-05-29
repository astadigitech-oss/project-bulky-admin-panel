import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    dangerouslyAllowLocalIP: true,
    localPatterns: [
      {
        pathname: "/assets/images/**",
      },
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.bulky.id",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "8080",
        pathname: "/uploads/**",
      },
    ],
  },
};

export default nextConfig;
