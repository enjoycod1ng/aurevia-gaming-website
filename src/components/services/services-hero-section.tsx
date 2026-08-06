import { ButtonLink } from "@/components/button-link";
import { ServicesLayerPanel } from "@/components/services/services-layer-panel";
import type { SiteContent } from "@/types/content";

type ServicesHeroContent = SiteContent["servicesPage"]["hero"];

export function ServicesHeroSection({
  content,
}: {
  content: ServicesHeroContent;
}) {
  return (
    <>
      <section className="services-hero scroll-reveal" data-scroll-reveal>
        <div className="container services-hero__grid">
          <div className="services-hero__content">
            <p className="home-kicker">{content.label}</p>
            <h1>{content.title}</h1>
            <p className="services-hero__description">{content.description}</p>
            <div className="button-row services-hero__actions">
              <ButtonLink href={content.primaryAction.href}>
                {content.primaryAction.label}
              </ButtonLink>
              <ButtonLink
                href={content.secondaryAction.href}
                variant="secondary"
              >
                {content.secondaryAction.label}
              </ButtonLink>
            </div>
          </div>
          <ServicesLayerPanel
            ariaLabel={content.layersAriaLabel}
            layers={content.layers}
          />
        </div>
      </section>
    </>
  );
}
