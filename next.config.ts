import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone",
  reactCompiler: true,
  async rewrites() {
    const rawApiUrl = (
      process.env.NEXT_PUBLIC_BASE_API_URL ||
      process.env.BASE_API_URL ||
      ""
    ).trim();
    if (!rawApiUrl) {
      return [];
    }
    const backendUrl = rawApiUrl.replace(/\/+$/, "").replace(/\/api$/, "");
    return [
      {
        source: "/api/panel/:path*",
        destination: `${backendUrl}/api/panel/:path*`,
      },
      {
        source: "/uploads/:path*",
        destination: `${backendUrl}/uploads/:path*`,
      },
    ];
  },
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
        hostname: "**.astadigitalagency.com",
        pathname: "/uploads/**",
      },
      {
        protocol: "https",
        hostname: "**.bulky.id",
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
