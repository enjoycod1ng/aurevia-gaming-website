import { CtaBand } from "@/components/cta-band";
import { PageHero } from "@/components/page-hero";
import { SectionHeading } from "@/components/section-heading";
import { ServiceCard } from "@/components/service-card";
import { siteContent } from "@/content/site-content";
import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata(siteContent.seo.services);

export default function ServicesPage() {
  return (
    <main id="main-content">
      <PageHero
        {...siteContent.servicesPage}
        primaryAction={siteContent.primaryCta}
        secondaryAction={siteContent.secondaryCta}
      />

      <section className="section section--tight-top">
        <div className="container service-detail-list">
          {siteContent.services.map((service) => (
            <ServiceCard service={service} key={service.id} />
          ))}
        </div>
      </section>

      <section className="section section--surface section--content-visibility">
        <div className="container">
          <SectionHeading {...siteContent.home.processHeading} align="center" />
          <div className="process-grid">
            {siteContent.process.map((step) => (
              <article className="process-card" key={step.number}>
                <span>{step.number}</span>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <CtaBand title="Choose the product scope. Keep one accountable engineering partner." />
    </main>
  );
}
