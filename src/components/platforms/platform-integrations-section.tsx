import { SectionHeading } from "@/components/section-heading";
import type { SiteContent } from "@/types/content";

type IntegrationsContent = SiteContent["platformPage"]["integrations"];
const tones = { gold: "bg-gold-bright", blue: "bg-[#34b7ee]", violet: "bg-[#a85af5]", green: "bg-[#46d49a]", red: "bg-[#ff6f6a]" } as const;

export function PlatformIntegrationsSection({ content }: { content: IntegrationsContent }) {
  return (
    <section className="section-space scroll-reveal border-t border-line bg-[#0d1117]" data-scroll-reveal>
      <div className="container grid grid-cols-1 items-center gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(430px,0.8fr)]">
        <div><SectionHeading {...content.heading} /><ul className="mt-5 flex list-none flex-wrap gap-3 p-0" aria-label={content.capabilitiesAriaLabel}>{content.capabilities.map((capability, index) => <li className={`inline-flex min-h-9.5 items-center justify-center rounded-xl border border-[#2a3442] bg-[#171d27] px-5 text-xs font-semibold ${index === 0 ? "text-gold-bright" : "text-ink-soft"}`} key={capability}>{capability}</li>)}</ul></div>
        <aside className="rounded-card border border-[#2a3442] bg-surface p-6 md:p-8"><h3 className="text-lg uppercase">{content.securityTitle}</h3><ul className="mt-4 grid list-none gap-4 p-0">{content.securityItems.map((item) => <li className="grid grid-cols-[30px_1fr] items-center gap-3.5 sm:grid-cols-[30px_150px_1fr]" key={item.title}><span className={`grid size-6 place-items-center rounded-full text-white ${tones[item.tone]}`} aria-hidden="true">✓</span><strong className="text-xs uppercase">{item.title}</strong><p className="col-start-2 text-xs text-[#9ca4b0] sm:col-start-auto">{item.description}</p></li>)}</ul></aside>
      </div>
    </section>
  );
}
