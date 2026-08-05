import { HomeCtaSection } from "@/components/home/home-cta-section";
import { PlatformAdminSection } from "@/components/platforms/platform-admin-section";
import { PlatformHeroSection } from "@/components/platforms/platform-hero-section";
import { PlatformIntegrationsSection } from "@/components/platforms/platform-integrations-section";
import { PlatformModulesSection } from "@/components/platforms/platform-modules-section";
import { PlatformRtpSection } from "@/components/platforms/platform-rtp-section";
import styles from "@/components/platforms/platforms-page.module.css";
import { siteContent } from "@/content/site-content";
import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata(siteContent.seo.platforms);

export default function CasinoPlatformsPage() {
  const { contact, platformPage } = siteContent;

  return (
    <main id="main-content" className={styles.page}>
      <PlatformHeroSection content={platformPage.hero} />
      <PlatformModulesSection content={platformPage.modules} />
      <PlatformAdminSection content={platformPage.admin} />
      <PlatformRtpSection content={platformPage.rtp} />
      <PlatformIntegrationsSection content={platformPage.integrations} />
      <HomeCtaSection
        className={styles.ctaSection}
        content={platformPage.cta}
        contact={contact}
      />
    </main>
  );
}
