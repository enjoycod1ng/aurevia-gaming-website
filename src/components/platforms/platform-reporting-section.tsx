import { SectionHeading } from "@/components/section-heading";
import type { SiteContent } from "@/types/content";

export function PlatformReportingSection({ content }: { content: SiteContent["platformPage"]["reporting"] }) {
  return (
    <section className="section-space scroll-reveal border-t border-line" data-scroll-reveal>
      <div className="container">
        <SectionHeading {...content.heading} />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {content.items.map((item, index) => (
            <article className="rounded-2xl border border-line bg-surface p-7" key={item.title}>
              <span className="text-xs font-bold text-gold-bright">0{index + 1}</span>
              <h3 className="mt-5 text-xl">{item.title}</h3>
              <p className="mt-4 text-sm leading-6 text-muted">{item.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
