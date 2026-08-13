import { ButtonLink } from "@/components/button-link";
import { OperatorDashboard } from "@/components/home/operator-dashboard";
import type { SiteContent } from "@/types/content";

type HomePlatformContent = SiteContent["home"]["platform"];

export function HomePlatformSection({
  content,
}: {
  content: HomePlatformContent;
}) {
  return (
    <section
      className="section-space scroll-reveal border-y border-line/30 bg-canvas-soft"
      data-scroll-reveal
    >
      <div className="container grid grid-cols-1 items-center gap-17 lg:gap-12 xl:grid-cols-[minmax(0,0.82fr)_minmax(620px,1.18fr)]">
        <div className="max-w-190">
          <p className="mb-10 inline-flex min-h-10 items-center rounded-full border border-line-strong bg-surface-strong px-6 text-xs font-extrabold text-gold-bright uppercase">
            {content.heading.label}
          </p>
          <h2 className="text-4xl leading-[1.08] uppercase md:text-5xl">
            {content.heading.title}
            <span className="block text-ink">{content.highlightedTitle}</span>
          </h2>
          <p className="my-10 max-w-162.5 text-base leading-7 text-muted">
            {content.heading.description}
          </p>
          <ButtonLink href={content.action.href}>
            {content.action.label}
          </ButtonLink>
          <ul className="mt-12.5 grid list-none gap-7 p-0">
            {content.features.map((item) => (
              <li className="flex items-center gap-4 text-base font-semibold" key={item}>
                <span
                  className="grid size-6 shrink-0 place-items-center rounded-full bg-gold text-xs text-white"
                  aria-hidden="true"
                >
                  ✓
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
        <OperatorDashboard content={content.dashboard} />
      </div>
    </section>
  );
}
