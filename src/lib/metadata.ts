import type { Metadata, Viewport } from "next";

import { siteContent } from "@/content/site-content";
import { locales, localizedPath, type Locale } from "@/lib/i18n";
import type { SeoEntry } from "@/types/content";

// Document-level metadata for the [locale] root layout and app/global-not-found.tsx.
export const siteMetadata: Metadata = {
  metadataBase: new URL(siteContent.brand.url),
  title: { default: siteContent.brand.name, template: `%s | ${siteContent.brand.name}` },
  applicationName: siteContent.brand.name,
  authors: [{ name: siteContent.brand.name }], creator: siteContent.brand.name, publisher: siteContent.brand.name,
  formatDetection: { email: false, address: false, telephone: false },
  // public/logo.svg is the source; scripts/generate-icons.mjs renders the rasters.
  // Browsers that read SVG icons prefer it to the 32px favicon.ico entry.
  icons: {
    icon: [{ url: "/favicon.ico", sizes: "32x32" }, { url: "/logo.svg", type: "image/svg+xml" }],
    apple: { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
  },
  manifest: "/manifest.webmanifest",
};
export const siteViewport: Viewport = {
  width: "device-width", initialScale: 1, colorScheme: "light dark",
  themeColor: [{ media: "(prefers-color-scheme: light)", color: "#faf9f6" }, { media: "(prefers-color-scheme: dark)", color: "#07090c" }],
};

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
