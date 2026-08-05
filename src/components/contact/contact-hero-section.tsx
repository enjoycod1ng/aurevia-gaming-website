import { ContactForm } from "@/components/contact/contact-form";
import { ContactMethodIcon } from "@/components/contact/contact-method-icon";
import type { ContactStatusMessage, SiteContent } from "@/types/content";

import styles from "./contact-page.module.css";

interface ContactHeroSectionProps {
  contact: SiteContent["contact"];
  content: SiteContent["contactPage"];
  requestedProject: string;
  status?: ContactStatusMessage;
}

export function ContactHeroSection({
  contact,
  content,
  requestedProject,
  status,
}: ContactHeroSectionProps) {
  return (
    <section className={styles.hero}>
      <div className={`container ${styles.heroGrid}`}>
        <div className={styles.heroContent}>
          <p className="eyebrow">{content.hero.label}</p>
          <h1>{content.hero.title}</h1>
          <p className={styles.heroDescription}>{content.hero.description}</p>

          <div className={styles.contactMethods}>
            <a href={contact.telegramUrl} target="_blank" rel="noreferrer">
              <span className={`${styles.methodIcon} ${styles.methodTelegram}`}>
                <ContactMethodIcon name="telegram" />
              </span>
              <span>
                <small>Telegram</small>
                <strong>{contact.telegramHandle}</strong>
                <em>{content.hero.telegramDescription}</em>
              </span>
            </a>
            <a href={contact.phoneHref}>
              <span className={`${styles.methodIcon} ${styles.methodPhone}`}>
                <ContactMethodIcon name="phone" />
              </span>
              <span>
                <small>Phone</small>
                <strong>{contact.phoneDisplay}</strong>
                <em>{content.hero.phoneDescription}</em>
              </span>
            </a>
          </div>

          <div className={styles.deliveryNote}>
            <span className={styles.deliveryIcon}>
              <ContactMethodIcon name="delivery" />
            </span>
            <div>
              <strong>{content.hero.deliveryTitle}</strong>
              <p>{content.hero.deliveryDescription}</p>
            </div>
          </div>
        </div>

        <ContactForm
          content={content.form}
          requestedProject={requestedProject}
          status={status}
        />
      </div>
    </section>
  );
}
