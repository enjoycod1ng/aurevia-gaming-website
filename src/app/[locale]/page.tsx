import { HomeCtaSection } from "@/components/home/home-cta-section";
import { HomeDemosSection } from "@/components/home/home-demos-section";
import { HomeHeroSection } from "@/components/home/home-hero-section";
import { HomePlatformSection } from "@/components/home/home-platform-section";
import { HomeReasonsSection } from "@/components/home/home-reasons-section";
import { HomeServicesSection } from "@/components/home/home-services-section";
import { getSiteContent, requireLocale } from "@/content/localized-content";
import { PageStructuredData } from "@/components/page-structured-data";
import { createPageMetadata } from "@/lib/metadata";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const locale = requireLocale((await params).locale);
  return createPageMetadata(getSiteContent(locale).seo.home, locale);
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = requireLocale((await params).locale);
  const siteContent = getSiteContent(locale);
  const { home } = siteContent;

  return (
    <main id="main-content" className="overflow-hidden">
      <PageStructuredData content={siteContent} page="home" locale={locale} />
      <HomeHeroSection content={home.hero} />
      <HomeServicesSection content={home.services} />
      <HomeDemosSection content={home.demos} />
      <HomePlatformSection content={home.platform} />
      <HomeReasonsSection content={home.reasons} />
      <HomeCtaSection content={home.cta} />
    </main>
  );
}
