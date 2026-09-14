import { HomeCtaSection } from "@/components/home/home-cta-section";
import { PlatformAdminSection } from "@/components/platforms/platform-admin-section";
import { PlatformHeroSection } from "@/components/platforms/platform-hero-section";
import { PlatformIntegrationsSection } from "@/components/platforms/platform-integrations-section";
import { PlatformModulesSection } from "@/components/platforms/platform-modules-section";
import { PlatformReportingSection } from "@/components/platforms/platform-reporting-section";
import { getSiteContent, requireLocale } from "@/content/localized-content";
import { PageStructuredData } from "@/components/page-structured-data";
import { createPageMetadata } from "@/lib/metadata";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const locale = requireLocale((await params).locale);
  return createPageMetadata(getSiteContent(locale).seo.platforms, locale);
}

export default async function CasinoPlatformsPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = requireLocale((await params).locale);
  const siteContent = getSiteContent(locale);
  const { platformPage } = siteContent;

  return (
    <main id="main-content" className="overflow-hidden bg-canvas">
      <PageStructuredData content={siteContent} page="platforms" locale={locale} />
      <PlatformHeroSection content={platformPage.hero} />
      <PlatformModulesSection content={platformPage.modules} />
      <PlatformAdminSection content={platformPage.admin} />
      <PlatformReportingSection content={platformPage.reporting} />
      <PlatformIntegrationsSection content={platformPage.integrations} />
      <HomeCtaSection
        className="bg-canvas-soft"
        content={platformPage.cta}
      />
    </main>
  );
}
