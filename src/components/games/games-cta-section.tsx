import { ButtonLink } from "@/components/button-link";
import type { ProjectCta, SiteContent } from "@/types/content";

import styles from "./games-page.module.css";

interface GamesCtaSectionProps {
  content: ProjectCta;
  contact: SiteContent["contact"];
}

export function GamesCtaSection({ content, contact }: GamesCtaSectionProps) {
  return (
    <section className={styles.ctaSection}>
      <div className="container">
        <div className={styles.cta}>
          <div>
            <h2>{content.title}</h2>
            <p>{content.description}</p>
          </div>
          <div className={styles.ctaActions}>
            <ButtonLink
              href={content.primaryAction.href}
              external={content.primaryAction.external}
              ariaLabel={content.primaryAction.ariaLabel}
            >
              {content.primaryAction.label}
            </ButtonLink>
            <a href={contact.telegramUrl} target="_blank" rel="noreferrer">
              {content.telegramLabel} {contact.telegramHandle}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
