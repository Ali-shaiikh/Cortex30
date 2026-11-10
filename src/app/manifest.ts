import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Mind Gym",
    short_name: "Mind Gym",
    description: "A 30-day AI-coached thinking program.",
    start_url: "/",
    display: "standalone",
    background_color: "#07090f",
    theme_color: "#07090f",
    orientation: "portrait",
    icons: [
      { src: "/icons/png/192", sizes: "192x192", type: "image/png" },
      { src: "/icons/png/512", sizes: "512x512", type: "image/png" },
      { src: "/icons/png/512", sizes: "512x512", type: "image/png", purpose: "maskable" },
      { src: "/icons/icon.svg", sizes: "any", type: "image/svg+xml" },
    ],
  };
}
