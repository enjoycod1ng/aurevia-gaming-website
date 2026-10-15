import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { NotFoundContent } from "@/components/not-found-content";
import { SiteDocument } from "@/components/site-document";
import { getUiContent } from "@/content/localized-content";
import { siteContent } from "@/content/site-content";
import { isLocale, localeHeader, type Locale } from "@/lib/i18n";
import { siteMetadata, siteViewport } from "@/lib/metadata";

// Every 404 is routed here: unmatched paths, unprefixed paths (rewritten to /en/... in
// next.config.ts) and params outside generateStaticParams (dynamicParams = false).
// Unlike [locale]/not-found.tsx this renders on the server, so crawlers and no-JS
// visitors get the branded page. Reading the header makes it per-request.
async function requestLocale(): Promise<Locale> {
  const value = (await headers()).get(localeHeader);
  return isLocale(value) ? value : "en";
}

export async function generateMetadata(): Promise<Metadata> {
  return { ...siteMetadata, title: `${getUiContent(await requestLocale()).notFoundTitle} | ${siteContent.brand.name}` };
}
export const viewport: Viewport = siteViewport;

export default async function GlobalNotFound() {
  const locale = await requestLocale();
  return <SiteDocument locale={locale}><NotFoundContent locale={locale} /></SiteDocument>;
}
