import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    localPatterns: [
      {
        pathname: "/assets/images/**",
      },
    ],
    remotePatterns: [
      { hostname: "api.bulky.id" },
      { hostname: "localhost" },
    ],
  },
};

export default nextConfig;
