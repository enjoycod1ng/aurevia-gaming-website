import { ButtonLink } from "@/components/button-link";
import type { ProjectCta, SiteContent } from "@/types/content";

interface HomeCtaSectionProps {
  content: ProjectCta;
  contact: SiteContent["contact"];
  className?: string;
}

export function HomeCtaSection({
  content,
  contact,
  className = "",
}: HomeCtaSectionProps) {
  return (
    <section className={`home-cta-section ${className}`.trim()}>
      <div className="container">
        <div className="home-cta">
          <div>
            <h2>{content.title}</h2>
            <p>{content.description}</p>
          </div>
          <div className="home-cta__actions">
            <ButtonLink href={content.primaryAction.href}>
              {content.primaryAction.label}
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}
