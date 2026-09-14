import { ButtonLink } from "@/components/button-link";
import type { SiteContent } from "@/types/content";

import { AnalyticsPreview } from "@/components/platforms/analytics-preview";

type PlatformHeroContent = SiteContent["platformPage"]["hero"];

export function PlatformHeroSection({ content }: { content: PlatformHeroContent }) {
  return (
    <section className="scroll-reveal relative flex min-h-[calc(100svh-6rem)] items-center py-16 after:pointer-events-none after:absolute after:-top-32.5 after:-right-30 after:size-165 after:rounded-full after:bg-[radial-gradient(circle,rgb(212_175_55/0.12),transparent_69%)]" data-scroll-reveal>
      <div className="container relative z-1 grid grid-cols-1 items-center gap-12 lg:grid-cols-[minmax(0,0.84fr)_minmax(500px,1.16fr)] xl:grid-cols-[minmax(0,0.92fr)_minmax(540px,1.08fr)] xl:gap-19">
        <div className="min-w-0 max-w-190">
          <p className="mb-9 inline-flex min-h-10 items-center rounded-full border border-line-strong bg-surface px-5 text-xs font-bold text-gold-bright uppercase">{content.label}</p>
          <h1 className="max-w-162.5 text-5xl leading-[1.04] uppercase md:text-6xl xl:text-7xl">{content.titleLines.map((line) => <span className="block max-sm:inline" key={line}>{line} </span>)}</h1>
          <p className="mt-7 max-w-165 text-base leading-7 text-muted">{content.description}</p>
          <div className="mt-10 flex flex-col gap-4 xs:flex-row"><ButtonLink href={content.primaryAction.href} external={content.primaryAction.external} ariaLabel={content.primaryAction.ariaLabel}>{content.primaryAction.label}</ButtonLink><ButtonLink href={content.secondaryAction.href} external={content.secondaryAction.external} ariaLabel={content.secondaryAction.ariaLabel} variant="secondary">{content.secondaryAction.label}</ButtonLink></div>
        </div>
        <AnalyticsPreview image={content.overview} compact preload />
      </div>
    </section>
  );
}
