import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Moxy Gallery Quest",
    short_name: "Gallery Quest",
    description: "Mobile-first QR-led gallery activation for Moxy events.",
    start_url: "/en/start",
    display: "standalone",
    orientation: "portrait",
    icons: [
      {
        src: "/images/moxy_hotels_logo.png",
        sizes: "any",
        type: "image/png",
      },
    ],
  };
}
