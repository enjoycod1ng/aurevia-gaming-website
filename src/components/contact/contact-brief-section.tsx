import { SectionHeading } from "@/components/section-heading";
import type { SiteContent } from "@/types/content";

type ContactBriefContent = SiteContent["contactPage"]["brief"];

export function ContactBriefSection({ content }: { content: ContactBriefContent }) {
  return (
    <section className="section-space scroll-reveal" data-scroll-reveal>
      <div className="container grid grid-cols-1 items-end gap-9 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div>
          <SectionHeading {...content.heading} />
          <ul className="mt-12 grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2" aria-label={content.checklistAriaLabel}>
            {content.checklist.map((item) => (
              <li className="flex min-h-14.5 items-center gap-3 rounded-xl border border-line bg-surface px-4 py-3 text-xs font-semibold text-ink-soft" key={item}>
                <span className="grid size-5 shrink-0 place-items-center rounded-full bg-gold-bright text-xs font-black text-[#150c03]" aria-hidden="true">✓</span>{item}
              </li>
            ))}
          </ul>
        </div>
        <aside className="max-w-155 rounded-[18px] border border-line bg-surface p-6 md:p-8">
          <h3 className="text-2xl uppercase">{content.questionsTitle}</h3>
          <dl className="mt-6">
            {content.questions.map((item) => (
              <div className="border-t border-line py-4.5 first:border-t-0 first:pt-0 last:pb-0" key={item.question}>
                <dt className="text-xs font-bold text-ink-soft">{item.question}</dt>
                <dd className="mt-2 text-xs leading-5 text-muted">{item.answer}</dd>
              </div>
            ))}
          </dl>
        </aside>
      </div>
    </section>
  );
}
