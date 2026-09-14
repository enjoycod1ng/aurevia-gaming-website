import { HomeCtaSection } from "@/components/home/home-cta-section";
import { SectionHeading } from "@/components/section-heading";
import { ServiceCard } from "@/components/service-card";
import { ServicesHeroSection } from "@/components/services/services-hero-section";
import { ServicesPrinciplesSection } from "@/components/services/services-principles-section";
import { ServicesProcessSection } from "@/components/services/services-process-section";
import { getSiteContent, requireLocale } from "@/content/localized-content";
import { PageStructuredData } from "@/components/page-structured-data";
import { createPageMetadata } from "@/lib/metadata";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const locale = requireLocale((await params).locale);
  return createPageMetadata(getSiteContent(locale).seo.services, locale);
}

export default async function ServicesPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = requireLocale((await params).locale);
  const siteContent = getSiteContent(locale);
  const { servicesPage } = siteContent;

  return (
    <main id="main-content" className="overflow-hidden bg-canvas">
      <PageStructuredData content={siteContent} page="services" locale={locale} />
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
