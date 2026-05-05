import type { NextConfig } from "next";

const DEFAULT_IMAGE_HOSTS = [
  "images.unsplash.com",
  "picsum.photos",
  "placehold.co",
  "lh3.googleusercontent.com",
];

const imageHostsFromEnv =
  process.env.NEXT_PUBLIC_IMAGE_HOSTS?.split(",")
    .map((s) => s.trim())
    .filter(Boolean) ?? [];

const imageHostnames = [
  ...new Set([...DEFAULT_IMAGE_HOSTS, ...imageHostsFromEnv]),
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      ...imageHostnames.map((hostname) => ({
        protocol: "https" as const,
        hostname,
        pathname: "/**",
      })),
      {
        protocol: "http",
        hostname: "localhost",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
