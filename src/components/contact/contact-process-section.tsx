import { SectionHeading } from "@/components/section-heading";
import type { SiteContent } from "@/types/content";

import styles from "./contact-page.module.css";

type ContactProcessContent = SiteContent["contactPage"]["process"];

export function ContactProcessSection({ content }: { content: ContactProcessContent }) {
  return (
    <section className={styles.process}>
      <div className="container">
        <SectionHeading {...content.heading} />
        <ol className={styles.processGrid}>
          {content.steps.map((step, index) => (
            <li className={index === 0 ? styles.processActive : undefined} key={step.number}>
              <span>{step.number}</span>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
