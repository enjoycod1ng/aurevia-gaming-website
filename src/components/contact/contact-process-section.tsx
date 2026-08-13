import { SectionHeading } from "@/components/section-heading";
import type { SiteContent } from "@/types/content";

type ContactProcessContent = SiteContent["contactPage"]["process"];

export function ContactProcessSection({ content }: { content: ContactProcessContent }) {
  return (
    <section className="section-space bg-canvas-soft">
      <div className="container">
        <SectionHeading {...content.heading} />
        <ol className="relative mt-12 grid list-none grid-cols-1 gap-6 p-0 sm:grid-cols-2 lg:mt-16 lg:grid-cols-4 lg:before:absolute lg:before:top-21 lg:before:right-[5%] lg:before:left-[5%] lg:before:h-0.5 lg:before:bg-gold">
          {content.steps.map((step, index) => (
            <li className={`relative z-1 min-h-57.5 rounded-[18px] border bg-surface p-6 md:min-h-63.5 md:p-8 ${index === 0 ? "border-gold shadow-[inset_0_0_0_1px_rgb(212_175_55/0.18)]" : "border-line"}`} key={step.number}>
              <span className="text-xs font-extrabold text-gold-bright">{step.number}</span>
              <h3 className="mt-8 text-2xl uppercase">{step.title}</h3>
              <p className="mt-4 text-xs leading-6 text-muted">{step.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
