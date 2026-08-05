import { ButtonLink } from "@/components/button-link";
import type { SiteContent } from "@/types/content";

interface HomeCtaSectionProps {
  content: SiteContent["home"]["cta"];
  contact: SiteContent["contact"];
}

export function HomeCtaSection({ content, contact }: HomeCtaSectionProps) {
  return (
    <section className="home-cta-section">
      <div className="container">
        <div className="home-cta">
          <div>
            <h2>{content.title}</h2>
            <p>{content.description}</p>
          </div>
          <div className="home-cta__actions">
            <ButtonLink href={content.primaryAction.href}>{content.primaryAction.label}</ButtonLink>
            <a href={contact.telegramUrl} target="_blank" rel="noreferrer">
              {content.telegramLabel} {contact.telegramHandle}
            </a>
            <a href={contact.phoneHref}>
              {content.phoneLabel} {contact.phoneDisplay}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
