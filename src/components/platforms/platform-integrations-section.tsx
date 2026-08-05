import { SectionHeading } from "@/components/section-heading";
import type { SiteContent } from "@/types/content";

import styles from "./platforms-page.module.css";

type IntegrationsContent = SiteContent["platformPage"]["integrations"];

export function PlatformIntegrationsSection({
  content,
}: {
  content: IntegrationsContent;
}) {
  return (
    <section className={styles.integrations}>
      <div className={`container ${styles.integrationsGrid}`}>
        <div>
          <div className={styles.sectionHeading}>
            <SectionHeading {...content.heading} />
          </div>
          <ul
            className={styles.capabilities}
            aria-label={content.capabilitiesAriaLabel}
          >
            {content.capabilities.map((capability) => (
              <li key={capability}>{capability}</li>
            ))}
          </ul>
        </div>
        <aside className={styles.securityPanel}>
          <h3>{content.securityTitle}</h3>
          <ul>
            {content.securityItems.map((item) => (
              <li className={styles[`tone--${item.tone}`]} key={item.title}>
                <span aria-hidden="true">✓</span>
                <strong>{item.title}</strong>
                <p>{item.description}</p>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </section>
  );
}
