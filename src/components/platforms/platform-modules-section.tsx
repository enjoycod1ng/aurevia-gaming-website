import { ServiceIcon } from "@/components/home/service-icon";
import { SectionHeading } from "@/components/section-heading";
import type { SiteContent } from "@/types/content";

type ModulesContent = SiteContent["platformPage"]["modules"];

const tones = {
  gold: "bg-gold-bright text-gold-bright",
  blue: "bg-[#34b7ee] text-[#34b7ee]",
  violet: "bg-[#a85af5] text-[#a85af5]",
  green: "bg-[#46d49a] text-[#46d49a]",
  red: "bg-[#ff6f6a] text-[#ff6f6a]",
} as const;

export function PlatformModulesSection({ content }: { content: ModulesContent }) {
  return (
    <section className="section-space scroll-reveal" data-scroll-reveal>
      <div className="container">
        <SectionHeading {...content.heading} />
        <div className="mt-13 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:mt-16 xl:grid-cols-3">
          {content.items.map((module) => {
            const [background, text] = tones[module.tone].split(" ");
            return <article className="flex min-h-70 flex-col rounded-card border border-[#2a3442] bg-surface p-6 md:min-h-82.5 md:p-8" key={module.title}>
              <span className={`grid size-12 place-items-center rounded-full text-white [&_svg]:size-6 ${background}`}><ServiceIcon name={module.icon} /></span>
              <h3 className="mt-6 text-xl leading-6 uppercase">{module.title}</h3>
              <p className="mt-4 text-sm leading-7 text-[#9ca4b0]">{module.description}</p>
              <strong className={`mt-auto border-t border-[#293340] pt-6 text-xs ${text}`}>{module.footer} →</strong>
            </article>;
          })}
        </div>
      </div>
    </section>
  );
}
