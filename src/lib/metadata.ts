import type { Metadata } from "next";

import { siteContent } from "@/content/site-content";
import type { SeoEntry } from "@/types/content";

const openGraphImage = {
  url: "/opengraph-image.png",
  width: 1200,
  height: 630,
  alt: "Aurevia Gaming casino game and platform development"
};

export function createPageMetadata(entry: SeoEntry): Metadata {
  return {
    title: entry.title,
    description: entry.description,
    keywords: [...entry.keywords],
    alternates: {
      canonical: entry.path
    },
    openGraph: {
      type: "website",
      locale: "en_US",
      url: entry.path,
      siteName: siteContent.brand.name,
      title: entry.title,
      description: entry.description,
      images: [openGraphImage]
    },
    twitter: {
      card: "summary_large_image",
      title: entry.title,
      description: entry.description,
      images: [openGraphImage.url]
    }
  };
}
