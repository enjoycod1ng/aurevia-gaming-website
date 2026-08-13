import { HomeCtaSection } from "@/components/home/home-cta-section";
import { PlatformAdminSection } from "@/components/platforms/platform-admin-section";
import { PlatformHeroSection } from "@/components/platforms/platform-hero-section";
import { PlatformIntegrationsSection } from "@/components/platforms/platform-integrations-section";
import { PlatformModulesSection } from "@/components/platforms/platform-modules-section";
import { PlatformRtpSection } from "@/components/platforms/platform-rtp-section";
import { siteContent } from "@/content/site-content";
import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata(siteContent.seo.platforms);

export default function CasinoPlatformsPage() {
  const { platformPage } = siteContent;

  return (
    <main id="main-content" className="overflow-hidden bg-canvas">
      <PlatformHeroSection content={platformPage.hero} />
      <PlatformModulesSection content={platformPage.modules} />
      <PlatformAdminSection content={platformPage.admin} />
      <PlatformRtpSection content={platformPage.rtp} />
      <PlatformIntegrationsSection content={platformPage.integrations} />
      <HomeCtaSection
        className="bg-[#0d1117]"
        content={platformPage.cta}
      />
    </main>
  );
}
