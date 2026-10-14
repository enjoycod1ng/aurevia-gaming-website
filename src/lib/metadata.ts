import type { Metadata } from "next";

import { siteContent } from "@/content/site-content";
import { locales, localizedPath, type Locale } from "@/lib/i18n";
import type { SeoEntry } from "@/types/content";

const openGraphImage = {
  url: "/opengraph-image.png",
  width: 1200,
  height: 630,
  alt: "Aurevia Gaming casino game and platform development"
};

export function createPageMetadata(entry: SeoEntry, locale: Locale = "en"): Metadata {
  return {
    title: entry.path === "/"
      ? { absolute: `${entry.title} | ${siteContent.brand.name}` }
      : entry.title,
    description: entry.description,
    robots: process.env.APP_ENV === "staging" ? { index: false, follow: false } : { index: true, follow: true, googleBot: { "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } },
    alternates: {
      canonical: localizedPath(entry.path, locale),
      languages: { ...Object.fromEntries(locales.map(language => [language, localizedPath(entry.path, language)])), "x-default": localizedPath(entry.path, "en") }
    },
    openGraph: {
      type: "website",
      locale: { en: "en_US", es: "es_ES", pt: "pt_BR" }[locale],
      alternateLocale: locales.filter(language => language !== locale).map(language => ({ en: "en_US", es: "es_ES", pt: "pt_BR" })[language]),
      url: localizedPath(entry.path, locale),
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
