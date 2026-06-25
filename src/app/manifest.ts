import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return { 
    name: "Moxy Hotels - The Art Hunter",
    short_name: "The Art Hunter",
    description: "HUNT DOWN ALL 5 ARTWORKS?",
    start_url: "/fr/start",
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
