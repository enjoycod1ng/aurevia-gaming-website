import { ServiceIcon } from "@/components/home/service-icon";
import { SectionHeading } from "@/components/section-heading";
import type { SiteContent } from "@/types/content";

type ServicesPrinciplesContent = SiteContent["servicesPage"]["principles"];

const toneClasses = {
  gold: "bg-gold-bright",
  blue: "bg-[#2bb7f6]",
  violet: "bg-[#ad5cff]",
  green: "bg-success",
} as const;

export function ServicesPrinciplesSection({ content }: { content: ServicesPrinciplesContent }) {
  return (
    <section className="section-space scroll-reveal" data-scroll-reveal>
      <div className="container">
        <SectionHeading {...content.heading} />
        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {content.items.map((item) => (
            <article className="min-h-60 rounded-card border border-line-strong bg-surface p-6 md:min-h-67.5 md:p-8" key={item.title}>
              <span className={`grid size-11 place-items-center rounded-full text-white [&_svg]:size-6 ${toneClasses[item.tone]}`}>
                <ServiceIcon name={item.icon} />
              </span>
              <h3 className="mt-6 text-lg leading-6 uppercase">{item.title}</h3>
              <p className="mt-4 text-sm leading-7 text-muted">{item.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
