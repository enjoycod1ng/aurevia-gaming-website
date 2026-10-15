import type { Metadata, Viewport } from "next";
import { SiteDocument } from "@/components/site-document";
import { requireLocale } from "@/content/localized-content";
import { locales } from "@/lib/i18n";
import { siteMetadata, siteViewport } from "@/lib/metadata";

export const metadata: Metadata = siteMetadata;
export const viewport: Viewport = siteViewport;
// Statically generated pages also export dynamicParams = false, so any other first
// segment (/EN, /api) is a routed 404 instead of being rendered, failing in
// requireLocale and ISR-cached. It is set per page so request-time routes keep theirs.
export function generateStaticParams() { return locales.map(locale => ({ locale })); }

export default async function RootLayout({ children, params }: Readonly<{ children: React.ReactNode; params: Promise<{ locale: string }> }>) {
  const locale = requireLocale((await params).locale);
  return <SiteDocument locale={locale}>{children}</SiteDocument>;
}
