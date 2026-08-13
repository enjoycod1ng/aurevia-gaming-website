import { ContactForm } from "@/components/contact/contact-form";
import { ContactMethodIcon } from "@/components/contact/contact-method-icon";
import type { ContactStatusMessage, SiteContent } from "@/types/content";

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
    <section className="scroll-reveal flex min-h-[calc(100svh-6rem)] items-center bg-[radial-gradient(circle_at_88%_18%,rgb(212_175_55/0.12),transparent_28rem)] py-10 md:py-14" data-scroll-reveal>
      <div className="container grid grid-cols-1 items-center gap-10 xl:grid-cols-[minmax(0,0.96fr)_minmax(580px,1.04fr)] xl:gap-20">
        <div>
          <p className="mb-8 inline-flex min-h-10 items-center rounded-full border border-line-strong bg-surface-strong px-6 text-xs font-extrabold text-gold-bright uppercase">{content.hero.label}</p>
          <h1 className="max-w-162.5 text-5xl uppercase md:text-6xl xl:text-7xl">{content.hero.title}</h1>
          <p className="mt-7 max-w-155 leading-7 text-muted">{content.hero.description}</p>

          <div className="mt-13.5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <a
              href={contact.telegramUrl}
              target="_blank"
              rel="noreferrer"
              className="grid min-h-29.5 grid-cols-[auto_1fr] items-start gap-4 rounded-2xl border border-line bg-surface p-5 transition hover:-translate-y-0.5 hover:border-line-strong"
              data-analytics-event="telegram_click"
            >
              <span className="grid size-10.5 shrink-0 place-items-center [&_svg]:w-full">
                <ContactMethodIcon name="telegram" />
              </span>
              <span className="grid min-w-0 gap-1">
                <small className="text-xs font-bold tracking-[0.08em] text-muted uppercase">Telegram</small>
                <strong className="wrap-anywhere text-base">{contact.telegramHandle}</strong>
                <em className="mt-3 text-xs not-italic text-muted">{content.hero.telegramDescription}</em>
              </span>
            </a>
            <a
              href={contact.whatsappHref}
              className="grid min-h-29.5 grid-cols-[auto_1fr] items-start gap-4 rounded-2xl border border-line bg-surface p-5 transition hover:-translate-y-0.5 hover:border-line-strong"
              data-analytics-event="whatsapp_click"
            >
              <span className="grid size-10.5 shrink-0 place-items-center [&_svg]:w-full">
                <ContactMethodIcon name="whatsapp" />
              </span>
              <span className="grid min-w-0 gap-1">
                <small className="text-xs font-bold tracking-[0.08em] text-muted uppercase">WhatsApp</small>
                <strong className="wrap-anywhere text-base">{contact.phoneDisplay}</strong>
                <em className="mt-3 text-xs not-italic text-muted">{content.hero.whatsappDescription}</em>
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
