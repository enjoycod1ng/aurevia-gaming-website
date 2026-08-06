import { ServiceIcon } from "@/components/home/service-icon";
import { SectionHeading } from "@/components/section-heading";
import type { SiteContent } from "@/types/content";

import styles from "./contact-page.module.css";

type ContactScopesContent = SiteContent["contactPage"]["scopes"];

export function ContactScopeSection({ content }: { content: ContactScopesContent }) {
  return (
    <section className={`${styles.scopes} scroll-reveal`} data-scroll-reveal>
      <div className="container">
        <SectionHeading {...content.heading} />
        <div className={styles.scopeGrid}>
          {content.items.map((item) => (
            <article
              className={`${styles[`tone--${item.tone}`]} scroll-reveal`}
              data-scroll-reveal
              key={item.title}
            >
              <span className={styles.scopeIcon}>
                <ServiceIcon name={item.icon} />
              </span>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              <a href={item.action.href}>
                {item.action.label} <span aria-hidden="true">→</span>
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
