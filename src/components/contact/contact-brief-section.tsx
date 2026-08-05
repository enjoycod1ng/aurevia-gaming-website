import { SectionHeading } from "@/components/section-heading";
import type { SiteContent } from "@/types/content";

import styles from "./contact-page.module.css";

type ContactBriefContent = SiteContent["contactPage"]["brief"];

export function ContactBriefSection({ content }: { content: ContactBriefContent }) {
  return (
    <section className={styles.brief}>
      <div className={`container ${styles.briefGrid}`}>
        <div>
          <SectionHeading {...content.heading} />
          <ul className={styles.checklist} aria-label={content.checklistAriaLabel}>
            {content.checklist.map((item) => (
              <li key={item}>
                <span aria-hidden="true">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <aside className={styles.questions}>
          <h3>{content.questionsTitle}</h3>
          <dl>
            {content.questions.map((item) => (
              <div key={item.question}>
                <dt>{item.question}</dt>
                <dd>{item.answer}</dd>
              </div>
            ))}
          </dl>
        </aside>
      </div>
    </section>
  );
}
