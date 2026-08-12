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
    <section className={`${styles.hero} scroll-reveal`} data-scroll-reveal>
      <div className={`container ${styles.heroGrid}`}>
        <div className={styles.heroContent}>
          <p className="home-kicker">{content.hero.label}</p>
          <h1>{content.hero.title}</h1>
          <p className={styles.heroDescription}>{content.hero.description}</p>

          <div className={styles.contactMethods}>
            <a
              href={contact.telegramUrl}
              target="_blank"
              rel="noreferrer"
              data-analytics-event="telegram_click"
            >
              <span className={`${styles.methodIcon} ${styles.methodTelegram}`}>
                <ContactMethodIcon name="telegram" />
              </span>
              <span>
                <small>Telegram</small>
                <strong>{contact.telegramHandle}</strong>
                <em>{content.hero.telegramDescription}</em>
              </span>
            </a>
            <a
              href={contact.whatsappHref}
              data-analytics-event="whatsapp_click"
            >
              <span className={`${styles.methodIcon} ${styles.methodPhone}`}>
                <ContactMethodIcon name="whatsapp" />
              </span>
              <span>
                <small>WhatsApp</small>
                <strong>{contact.phoneDisplay}</strong>
                <em>{content.hero.whatsappDescription}</em>
              </span>
            </a>
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
