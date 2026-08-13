import { ButtonLink } from "@/components/button-link";
import type { SiteContent } from "@/types/content";

type GamesHeroContent = SiteContent["gamesPage"]["hero"];

function FeaturedGame({ content }: { content: GamesHeroContent["featured"] }) {
  return (
    <article className="min-h-155 w-full rounded-3xl border border-[#6f5518] bg-[radial-gradient(circle_at_58%_59%,rgb(212_175_55/0.16),transparent_36%),linear-gradient(135deg,#2f260c,#111009_72%)] px-4.5 py-7 text-center shadow-panel sm:px-9 sm:py-8.5" aria-labelledby="featured-game-title">
      <p className="mb-7.5 inline-flex min-h-7 items-center rounded-full border border-[#37404d] bg-[#171d27] px-4 text-xs font-bold text-gold-bright uppercase">{content.label}</p>
      <h2 className="text-2xl leading-none text-gold-bright uppercase" id="featured-game-title">{content.title}</h2>
      <p className="mx-auto mt-5.5 max-w-100 text-xs leading-5 text-muted">{content.description}</p>
      <div className="mt-8.5 grid grid-cols-4 gap-1.5 rounded-[15px] border-2 border-[#6d330f] bg-[#090d13] p-2.5 sm:gap-2 sm:p-3" aria-label={`${content.title} reel preview`}>
        {content.reels.map((reel, index) => (
          <span className={`grid min-h-12 place-items-center rounded-[10px] border font-display text-sm font-extrabold ${reel.active ? "border-gold bg-[#3d2f0d] text-gold-bright" : "border-[#29313d] bg-[#171d27] text-ink"}`} key={`${reel.symbol}-${index}`}>{reel.symbol}</span>
        ))}
      </div>
      <div className="mt-8.5 grid grid-cols-1 gap-3.5 sm:grid-cols-2 [&_a]:w-full">
        <ButtonLink href={content.primaryAction.href} external={content.primaryAction.external} ariaLabel={content.primaryAction.ariaLabel}>{content.primaryAction.label}</ButtonLink>
        <ButtonLink href={content.secondaryAction.href} external={content.secondaryAction.external} ariaLabel={content.secondaryAction.ariaLabel} variant="secondary">{content.secondaryAction.label}</ButtonLink>
      </div>
      <p className="mt-5.5 flex justify-center gap-2 text-xs font-extrabold text-success uppercase">
        <span>{content.metric}</span><span aria-hidden="true">·</span><span>{content.volatility}</span>
      </p>
    </article>
  );
}

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
        <FeaturedGame content={content.featured} />
      </div>
    </section>
  );
}
