import { SectionHeading } from "@/components/section-heading";
import type { SiteContent } from "@/types/content";

type ServicesProcessContent = SiteContent["servicesPage"]["process"];

export function ServicesProcessSection({ content }: { content: ServicesProcessContent }) {
  return (
    <section className="section-space scroll-reveal border-y border-line bg-canvas-soft" data-scroll-reveal>
      <div className="container">
        <SectionHeading {...content.heading} />
        <ol className="relative mt-16 grid list-none grid-cols-1 gap-6 p-0 before:absolute before:top-[3%] before:bottom-[3%] before:left-10.5 before:w-0.5 before:bg-gold lg:grid-cols-5 lg:gap-3 lg:before:top-1/2 lg:before:right-[3%] lg:before:bottom-auto lg:before:left-[3%] lg:before:h-0.5 lg:before:w-auto">
          {content.steps.map((step, index) => (
            <li className={`relative z-1 min-h-52 rounded-[18px] border bg-surface py-8 pr-6 pl-19 lg:min-h-67.5 lg:p-6 ${index === 0 ? "border-gold-bright shadow-[inset_0_0_0_1px_var(--color-gold)]" : "border-line-strong"}`} key={step.number}>
              <span className="text-xs font-extrabold text-gold-bright">{step.number}</span>
              <h3 className="mt-8 text-lg leading-6 uppercase">{step.title}</h3>
              <p className="mt-4 text-xs leading-6 text-muted">{step.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
