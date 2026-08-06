import { ServiceIcon } from "@/components/home/service-icon";
import { SectionHeading } from "@/components/section-heading";
import type { SiteContent } from "@/types/content";

import styles from "./platforms-page.module.css";

type ModulesContent = SiteContent["platformPage"]["modules"];

export function PlatformModulesSection({
  content,
}: {
  content: ModulesContent;
}) {
  return (
    <section className={`${styles.modules} scroll-reveal`} data-scroll-reveal>
      <div className="container">
        <div className={styles.sectionHeading}>
          <SectionHeading {...content.heading} />
        </div>
        <div className={styles.moduleGrid}>
          {content.items.map((module) => (
            <article
              className={`${styles.moduleCard} ${styles[`tone--${module.tone}`]}`}
              key={module.title}
            >
              <span className={styles.moduleIcon}>
                <ServiceIcon name={module.icon} />
              </span>
              <h3>{module.title}</h3>
              <p>{module.description}</p>
              <strong>{module.footer} →</strong>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
