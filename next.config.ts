import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone",
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
        hostname: "**.bulky.id",
      },
      {
        protocol: "https",
        hostname: "**.astadigitalagency.com",
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
