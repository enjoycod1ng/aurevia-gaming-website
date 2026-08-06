import type { Metadata, Viewport } from "next";
import { Manrope, Sora } from "next/font/google";

import { JsonLd } from "@/components/json-ld";
import { ScrollRevealInit } from "@/components/scroll-reveal-init";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { siteContent } from "@/content/site-content";

import "./globals.css";

const sora = Sora({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sora",
});

const manrope = Manrope({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-manrope",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteContent.brand.url),
  title: {
    default: `${siteContent.seo.home.title} | ${siteContent.brand.name}`,
    template: `%s | ${siteContent.brand.name}`,
  },
  description: siteContent.brand.description,
  applicationName: siteContent.brand.name,
  authors: [{ name: siteContent.brand.name }],
  creator: siteContent.brand.name,
  publisher: siteContent.brand.name,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: {
      url: "/logo.svg",
      type: "image/svg+xml",
    },
    apple: {
      url: "/logo.svg",
      type: "image/svg+xml",
    },
  },
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0b0908",
  colorScheme: "dark",
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: siteContent.brand.name,
  url: siteContent.brand.url,
  description: siteContent.brand.description,
  contactPoint: [
    {
      "@type": "ContactPoint",
      telephone: siteContent.contact.phoneDisplay,
      contactType: "sales",
      availableLanguage: ["English"],
    },
  ],
  sameAs: [siteContent.contact.telegramUrl],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className={`${manrope.variable} ${sora.variable}`}>
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>
        <JsonLd data={organizationJsonLd} />
        <SiteHeader />
        <ScrollRevealInit />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
