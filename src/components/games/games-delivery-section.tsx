import { ServiceIcon } from "@/components/home/service-icon";
import type { SiteContent } from "@/types/content";

import styles from "./games-page.module.css";

type DeliveryContent = SiteContent["gamesPage"]["delivery"];

export function GamesDeliverySection({ content }: { content: DeliveryContent }) {
  return (
    <section className={styles.delivery}>
      <div className="container">
        <div className={styles.sectionHeading}>
          <p className={styles.kicker}>{content.label}</p>
          <h2>{content.title}</h2>
          <p>{content.description}</p>
        </div>

        <div className={styles.pillarGrid}>
          {content.pillars.map((pillar) => (
            <article className={`${styles.pillar} ${styles[`pillar--${pillar.tone}`]}`} key={pillar.title}>
              <span className={styles.pillarIcon}>
                <ServiceIcon name={pillar.icon} />
              </span>
              <h3>{pillar.title}</h3>
              <p>{pillar.description}</p>
              <strong>{pillar.footer}</strong>
            </article>
          ))}
        </div>

        <ol className={styles.process} aria-label={content.processAriaLabel}>
          {content.processSteps.map((step, index) => (
            <li key={step}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{step}</strong>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
