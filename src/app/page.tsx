import { HomeCtaSection } from "@/components/home/home-cta-section";
import { HomeDemosSection } from "@/components/home/home-demos-section";
import { HomeHeroSection } from "@/components/home/home-hero-section";
import { HomePlatformSection } from "@/components/home/home-platform-section";
import { HomeReasonsSection } from "@/components/home/home-reasons-section";
import { HomeServicesSection } from "@/components/home/home-services-section";
import { siteContent } from "@/content/site-content";
import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata(siteContent.seo.home);

export default function HomePage() {
  const { contact, home } = siteContent;

  return (
    <main id="main-content" className="home-page">
      <HomeHeroSection content={home.hero} />
      <HomeServicesSection content={home.services} />
      <HomeDemosSection content={home.demos} />
      <HomePlatformSection content={home.platform} />
      <HomeReasonsSection content={home.reasons} />
      <HomeCtaSection content={home.cta} contact={contact} />
    </main>
  );
}
