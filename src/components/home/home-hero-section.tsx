import { ButtonLink } from "@/components/button-link";
import { HeroProductMockup } from "@/components/home/hero-product-mockup";
import type { SiteContent } from "@/types/content";

type HomeHeroContent = SiteContent["home"]["hero"];

export function HomeHeroSection({ content }: { content: HomeHeroContent }) {
  return (
    <section className="home-hero">
      <div className="container home-hero__grid">
        <div className="home-hero__content">
          <p className="home-kicker">{content.label}</p>
          <h1>
            {content.title}
            <span>{content.highlightedTitle}</span>
          </h1>
          <p className="home-hero__description">{content.description}</p>
          <div className="button-row home-hero__actions">
            <ButtonLink href={content.primaryAction.href}>
              {content.primaryAction.label}
            </ButtonLink>
            <ButtonLink href={content.secondaryAction.href} variant="secondary">
              {content.secondaryAction.label}
            </ButtonLink>
          </div>
          <div
            className="home-hero__details"
            aria-label={content.detailsAriaLabel}
          >
            {content.details.map((detail) => (
              <div key={detail.label}>
                <span>{detail.label}</span>
                <p>{detail.value}</p>
              </div>
            ))}
          </div>
        </div>
        <HeroProductMockup content={content.mockup} />
      </div>
    </section>
  );
}
