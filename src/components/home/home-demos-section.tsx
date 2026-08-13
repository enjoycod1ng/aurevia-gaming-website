import { ButtonLink } from "@/components/button-link";
import type { SiteContent } from "@/types/content";

type HomeDemosContent = SiteContent["home"]["demos"];

export function HomeDemosSection({ content }: { content: HomeDemosContent }) {
  const visualThemes = {
    fortune: "bg-[radial-gradient(circle_at_46%_36%,rgb(212_175_55/0.42),transparent_34%),linear-gradient(110deg,#9a6a0d,#211a08)]",
    neon: "bg-[radial-gradient(circle_at_48%_38%,rgb(0_198_255/0.38),transparent_35%),linear-gradient(110deg,#0497c2,#041322)]",
    royal: "bg-[radial-gradient(circle_at_48%_38%,rgb(208_108_255/0.44),transparent_35%),linear-gradient(110deg,#8d40b6,#21072f)]",
  } as const;

  return (
    <section
      className="section-space scroll-reveal"
      data-scroll-reveal
    >
      <div className="container">
        <div className="mb-12 max-w-262.5 md:mb-16">
          <p className="mb-8 inline-flex min-h-10 items-center rounded-full border border-line-strong bg-surface-strong px-6 text-xs font-extrabold text-gold-bright uppercase">{content.heading.label}</p>
          <h2 className="text-4xl leading-[1.08] uppercase md:text-5xl">{content.heading.title}</h2>
          <p className="mt-6 max-w-245 text-base leading-[1.65] text-muted">{content.heading.description}</p>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {content.items.map((demo) => (
            <article
              className="scroll-reveal rounded-3xl border border-line-strong bg-surface p-6 md:min-h-161"
              data-scroll-reveal
              key={demo.title}
            >
              <div
                className={`grid min-h-82.5 content-center justify-items-center gap-20 overflow-hidden rounded-[19px] text-center uppercase md:min-h-97.5 ${visualThemes[demo.theme]}`}
              >
                <span className={`font-display font-extrabold leading-none ${demo.theme === "royal" ? "text-6xl" : "text-7xl xl:text-8xl"}`}>{demo.symbol}</span>
                <strong className="text-2xl leading-none">{demo.title}</strong>
              </div>
              <h3 className="mt-6 text-xl uppercase">{demo.title}</h3>
              <p className="mt-3 text-sm text-muted">{demo.description}</p>
              <div className="mt-6 grid grid-cols-1 gap-4 xs:grid-cols-2 [&_a]:min-h-12.5 [&_a]:px-4.5 [&_a]:text-xs">
                <ButtonLink
                  href={demo.primaryAction.href}
                  analyticsEvent="demo_request_click"
                  analyticsLabel={demo.title}
                >
                  {demo.primaryAction.label}
                </ButtonLink>
                <ButtonLink
                  href={demo.secondaryAction.href}
                  variant="secondary"
                >
                  {demo.secondaryAction.label}
                </ButtonLink>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
