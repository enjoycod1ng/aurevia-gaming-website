import type { MetadataRoute } from "next";

import { siteContent } from "@/content/site-content";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteContent.brand.name,
    short_name: siteContent.brand.shortName,
    description: siteContent.brand.description,
    start_url: "/",
    display: "standalone",
    background_color: "#0b0a08",
    theme_color: "#cda434",
    icons: [
      {
        src: "/logo.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
