import type { Metadata, Viewport } from "next";
import { Manrope, Sora } from "next/font/google";
import { AnalyticsConsent } from "@/components/analytics/analytics-consent";
import { JsonLd } from "@/components/json-ld";
import { ScrollRevealInit } from "@/components/scroll-reveal-init";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getSiteContent, getUiContent, requireLocale } from "@/content/localized-content";
import { siteContent } from "@/content/site-content";
import { locales } from "@/lib/i18n";
import { themeInitScript } from "@/lib/theme";
import "../globals.css";

const sora = Sora({ subsets: ["latin"], display: "swap", variable: "--font-sora" });
const manrope = Manrope({ subsets: ["latin"], display: "swap", variable: "--font-manrope" });
export const metadata: Metadata = {
  metadataBase: new URL(siteContent.brand.url),
  title: { default: siteContent.brand.name, template: `%s | ${siteContent.brand.name}` },
  applicationName: siteContent.brand.name,
  authors: [{ name: siteContent.brand.name }], creator: siteContent.brand.name, publisher: siteContent.brand.name,
  formatDetection: { email: false, address: false, telephone: false },
  icons: { icon: { url: "/logo.svg", type: "image/svg+xml" } },
  manifest: "/manifest.webmanifest",
};
export const viewport: Viewport = {
  width: "device-width", initialScale: 1, colorScheme: "light dark",
  themeColor: [{ media: "(prefers-color-scheme: light)", color: "#faf9f6" }, { media: "(prefers-color-scheme: dark)", color: "#07090c" }],
};
export function generateStaticParams() { return locales.map(locale => ({ locale })); }

export default async function RootLayout({ children, params }: Readonly<{ children: React.ReactNode; params: Promise<{ locale: string }> }>) {
  const locale = requireLocale((await params).locale);
  const content = getSiteContent(locale), ui = getUiContent(locale);
  return (
    <html lang={locale} data-scroll-behavior="smooth" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: themeInitScript }} /></head>
      <body className={`${manrope.variable} ${sora.variable}`}>
        <a className="fixed top-3 left-3 z-1000 -translate-y-[160%] rounded-lg bg-gold-soft px-4 py-3 text-[#100a06] focus:translate-y-0" href="#main-content">{ui.skip}</a>
        <JsonLd data={{ "@context": "https://schema.org", "@type": "Organization", "@id": `${content.brand.url}/#organization`, name: content.brand.name, url: content.brand.url, logo: `${content.brand.url}/logo.svg`, description: content.brand.description, sameAs: [content.contact.telegramUrl] }} />
        <SiteHeader key={locale} locale={locale} ui={ui} content={{ brand: content.brand, navigation: content.navigation, primaryCta: content.primaryCta }} />
        <ScrollRevealInit />
        {children}
        <SiteFooter content={content} ui={ui} locale={locale} />
        <AnalyticsConsent ui={ui} locale={locale} />
      </body>
    </html>
  );
}
