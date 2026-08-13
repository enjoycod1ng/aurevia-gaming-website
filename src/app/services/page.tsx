import { HomeCtaSection } from "@/components/home/home-cta-section";
import { SectionHeading } from "@/components/section-heading";
import { ServiceCard } from "@/components/service-card";
import { ServicesHeroSection } from "@/components/services/services-hero-section";
import { ServicesPrinciplesSection } from "@/components/services/services-principles-section";
import { ServicesProcessSection } from "@/components/services/services-process-section";
import { siteContent } from "@/content/site-content";
import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata(siteContent.seo.services);

export default function ServicesPage() {
  const { servicesPage } = siteContent;

  return (
    <main id="main-content" className="overflow-hidden bg-canvas">
      <ServicesHeroSection content={servicesPage.hero} />

      <section className="section-space">
        <div className="container">
          <SectionHeading {...servicesPage.offerings.heading} />
          <div className="mt-16 grid grid-cols-1 gap-6 lg:grid-cols-2">
            {servicesPage.offerings.items.map((service) => (
              <ServiceCard service={service} key={service.id} />
            ))}
          </div>
        </div>
      </section>

      <ServicesProcessSection content={servicesPage.process} />
      <ServicesPrinciplesSection content={servicesPage.principles} />
      <HomeCtaSection
        content={servicesPage.cta}
      />
    </main>
  );
}
