import { ServiceIcon } from "@/components/home/service-icon";
import { SectionHeading } from "@/components/section-heading";
import type { SiteContent } from "@/types/content";

type ContactScopesContent = SiteContent["contactPage"]["scopes"];

const toneClasses = {
  gold: "bg-gold-bright text-gold-bright",
  blue: "bg-[#35b9f3] text-[#35b9f3]",
  violet: "bg-[#b36cff] text-[#b36cff]",
  green: "bg-[#46d79b] text-[#46d79b]",
} as const;

export function ContactScopeSection({ content }: { content: ContactScopesContent }) {
  return (
    <section className="section-space scroll-reveal" data-scroll-reveal>
      <div className="container">
        <SectionHeading {...content.heading} />
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:mt-16 xl:grid-cols-4">
          {content.items.map((item) => (
            <article className="scroll-reveal flex min-h-82.5 flex-col items-start rounded-[18px] border border-line bg-surface p-6 transition hover:-translate-y-1 hover:border-line-strong md:min-h-92.5 md:p-8" data-scroll-reveal key={item.title}>
              <span className={`grid size-12 place-items-center rounded-full text-white [&_svg]:size-6 ${toneClasses[item.tone].split(" ")[0]}`}><ServiceIcon name={item.icon} /></span>
              <h3 className="mt-6 text-2xl uppercase">{item.title}</h3>
              <p className="mt-4 text-sm leading-7 text-muted">{item.description}</p>
              <a className={`mt-auto flex w-full items-center gap-2 border-t border-line pt-6 text-xs font-bold ${toneClasses[item.tone].split(" ")[1]}`} href={item.action.href}>{item.action.label} <span aria-hidden="true">→</span></a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
