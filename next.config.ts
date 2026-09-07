import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async redirects() {
    return [
      {
        source: "/admin/rejestracje/new",
        destination: "/admin/wydarzenia/new",
        permanent: false,
      },
      {
        source: "/admin/rejestracje/oboz/:slug/edit",
        destination: "/admin/wydarzenia/oboz/:slug/edit",
        permanent: false,
      },
      {
        source: "/admin/rejestracje/oboz/:slug/pytania",
        destination: "/admin/wydarzenia/oboz/:slug/pytania",
        permanent: false,
      },
      {
        source: "/admin/rejestracje/nocowanka/new",
        destination: "/admin/wydarzenia/nocowanka/new",
        permanent: false,
      },
      {
        source: "/admin/rejestracje/nocowanka/:slug/edit",
        destination: "/admin/wydarzenia/nocowanka/:slug/edit",
        permanent: false,
      },
      {
        source: "/admin/rejestracje/nocowanka/:slug/pytania",
        destination: "/admin/wydarzenia/nocowanka/:slug/pytania",
        permanent: false,
      },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.pexels.com", pathname: "/**" },
      { protocol: "https", hostname: "lh3.googleusercontent.com", pathname: "/**" },
      // Facebook CDN (camp images etc.)
      { protocol: "https", hostname: "**.fbcdn.net", pathname: "/**" },
      // Convex file storage (e.g. gallery URLs from api/storage/…)
      { protocol: "https", hostname: "**.convex.cloud", pathname: "/**" },
    ],
  },
};

export default nextConfig;
