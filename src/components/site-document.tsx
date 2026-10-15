import { Manrope, Sora } from "next/font/google";
import { AnalyticsConsent } from "@/components/analytics/analytics-consent";
import { CloudflareWebAnalytics } from "@/components/analytics/cloudflare-web-analytics";
import { JsonLd } from "@/components/json-ld";
import { ScrollRevealInit } from "@/components/scroll-reveal-init";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SiteFrame } from "@/components/site-frame";
import { getSiteContent, getUiContent } from "@/content/localized-content";
import type { Locale } from "@/lib/i18n";
import { themeInitScript } from "@/lib/theme";
import "@/app/globals.css";

const sora = Sora({ subsets: ["latin"], display: "swap", variable: "--font-sora" });
const manrope = Manrope({ subsets: ["latin"], display: "swap", variable: "--font-manrope" });

// Shared by the [locale] root layout and app/global-not-found.tsx, which renders
// outside every layout and must produce the same branded document itself.
export function SiteDocument({ locale, children }: Readonly<{ locale: Locale; children: React.ReactNode }>) {
  const content = getSiteContent(locale), ui = getUiContent(locale);
  return (
    <html lang={locale} data-scroll-behavior="smooth" suppressHydrationWarning>
      {/* eslint-disable-next-line @next/next/no-head-element -- App Router root document; the rule only exempts files under app/ */}
      <head><script dangerouslySetInnerHTML={{ __html: themeInitScript }} /></head>
      <body className={`${manrope.variable} ${sora.variable}`}>
        <a className="fixed top-3 left-3 z-1000 -translate-y-[160%] rounded-lg bg-gold-soft px-4 py-3 text-[#100a06] focus:translate-y-0" href="#main-content">{ui.skip}</a>
        <JsonLd data={{ "@context": "https://schema.org", "@type": "Organization", "@id": `${content.brand.url}/#organization`, name: content.brand.name, url: content.brand.url, logo: `${content.brand.url}/logo.svg`, description: content.brand.description, sameAs: [content.contact.telegramUrl] }} />
        <ScrollRevealInit />
        <SiteFrame header={<SiteHeader key={locale} locale={locale} ui={ui} content={{ brand: content.brand, navigation: content.navigation, primaryCta: content.primaryCta }} />} footer={<><SiteFooter content={content} ui={ui} locale={locale} /><AnalyticsConsent ui={ui} locale={locale} /><CloudflareWebAnalytics /></>}>
          {children}
        </SiteFrame>
      </body>
    </html>
  );
}
