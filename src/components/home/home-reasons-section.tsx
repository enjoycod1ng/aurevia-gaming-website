import type { SiteContent } from "@/types/content";

type HomeReasonsContent = SiteContent["home"]["reasons"];

export function HomeReasonsSection({
  content,
}: {
  content: HomeReasonsContent;
}) {
  return (
    <section className="section-space scroll-reveal relative" data-scroll-reveal>
      <div className="container">
        <div className="mb-12 max-w-262.5 md:mb-16">
          <p className="mb-8 inline-flex min-h-10 items-center rounded-full border border-line-strong bg-surface-strong px-6 text-xs font-extrabold text-gold-bright uppercase">{content.heading.label}</p>
          <h2 className="text-4xl leading-[1.08] uppercase md:text-5xl">{content.heading.title}</h2>
          <p className="mt-6 max-w-245 text-base leading-[1.65] text-muted">{content.heading.description}</p>
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {content.items.map((reason) => (
            <article className="scroll-reveal flex min-h-65 flex-col rounded-[22px] border border-line-strong bg-surface p-6 md:min-h-72.5 md:p-8" data-scroll-reveal key={reason.number}>
              <span className="text-xs font-extrabold text-gold-bright">{reason.number}</span>
              <h3 className="mt-8 text-xl leading-[1.2] uppercase">{reason.title}</h3>
              <p className="mt-4 text-sm leading-7 text-muted">{reason.description}</p>
              <strong className="mt-auto border-t border-line pt-6 text-xs text-gold-bright">{reason.result}</strong>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
