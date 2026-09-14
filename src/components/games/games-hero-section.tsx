import { GamePreview } from "@/components/games/game-preview";
import { ButtonLink } from "@/components/button-link";
import type { SiteContent } from "@/types/content";

type GamesHeroContent = SiteContent["gamesPage"]["hero"];

export function GamesHeroSection({ content }: { content: GamesHeroContent }) {
  return (
    <section className="scroll-reveal relative flex min-h-[calc(100svh-6rem)] items-center py-14 after:pointer-events-none after:absolute after:-top-30 after:-right-25 after:size-150 after:rounded-full after:bg-[radial-gradient(circle,rgb(212_175_55/0.08),transparent_69%)] md:py-18" data-scroll-reveal>
      <div className="container relative z-1 grid grid-cols-1 items-start gap-16 lg:grid-cols-[minmax(0,1fr)_minmax(410px,0.88fr)] xl:grid-cols-[minmax(0,600px)_minmax(0,584px)]">
        <div className="min-w-0 pt-4">
          <p className="mb-8.5 inline-flex min-h-10 items-center rounded-full border border-[#2b323d] bg-[#131923] px-5 text-xs font-extrabold tracking-[0.04em] text-gold-bright uppercase">{content.label}</p>
          <h1 className="max-w-190 text-5xl leading-[1.08] uppercase md:text-6xl xl:text-7xl">
            {content.titleLines.map((line) => <span className="block max-sm:inline" key={line}>{line} </span>)}
          </h1>
          <p className="mt-7 max-w-167.5 text-base leading-[1.6] text-muted">{content.description}</p>
          <div className="mt-10.5 flex flex-col gap-3.5 xs:flex-row">
            <ButtonLink href={content.primaryAction.href} external={content.primaryAction.external} ariaLabel={content.primaryAction.ariaLabel}>{content.primaryAction.label}</ButtonLink>
            <ButtonLink href={content.secondaryAction.href} external={content.secondaryAction.external} ariaLabel={content.secondaryAction.ariaLabel} variant="secondary">{content.secondaryAction.label}</ButtonLink>
          </div>
        </div>
        <GamePreview content={content.featured} />
      </div>
    </section>
  );
}
