import { ServiceIcon } from "@/components/home/service-icon";
import { SectionHeading } from "@/components/section-heading";
import type { SiteContent } from "@/types/content";

type ModulesContent = SiteContent["platformPage"]["modules"];

const tones = {
  gold: "bg-gold-bright text-gold-bright",
  blue: "bg-accent-blue text-accent-blue",
  violet: "bg-accent-violet text-accent-violet",
  green: "bg-success text-success",
  red: "bg-error text-error",
} as const;

export function PlatformModulesSection({ content }: { content: ModulesContent }) {
  return (
    <section className="section-space scroll-reveal" data-scroll-reveal>
      <div className="container">
        <SectionHeading {...content.heading} />
        <div className="mt-13 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:mt-16 xl:grid-cols-3">
          {content.items.map((module) => {
            const [background, text] = tones[module.tone].split(" ");
            return <article className="flex min-h-70 flex-col rounded-card border border-line-strong bg-surface p-6 md:min-h-82.5 md:p-8" key={module.title}>
              <span className={`grid size-12 place-items-center rounded-full text-white [&_svg]:size-6 ${background}`}><ServiceIcon name={module.icon} /></span>
              <h3 className="mt-6 text-xl leading-6 uppercase">{module.title}</h3>
              <p className="mt-4 text-sm leading-7 text-muted">{module.description}</p>
              <strong className={`mt-auto border-t border-line pt-6 text-sm ${text}`}>{module.footer} →</strong>
            </article>;
          })}
        </div>
      </div>
    </section>
  );
}
