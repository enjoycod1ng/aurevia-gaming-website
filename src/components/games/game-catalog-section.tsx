"use client";

import Image from "next/image";
import { useState } from "react";

import { ButtonLink } from "@/components/button-link";
import type { GameCatalogItem, GameFilter, SiteContent } from "@/types/content";

type CatalogContent = SiteContent["gamesPage"]["catalog"];
type ActiveFilter = GameFilter["value"];

const artworkToneClasses = {
  fortune: "bg-[linear-gradient(100deg,#9a6a0d,#4a380b_56%,#211a08)] after:bg-[rgb(212_175_55/0.42)]",
  neon: "bg-[linear-gradient(100deg,#03a0ca,#073347_56%,#06111a)] after:bg-[rgb(24_201_255/0.34)]",
  royal: "bg-[linear-gradient(100deg,#9d42d4,#3f145c_56%,#12071a)] after:bg-[rgb(190_92_255/0.36)]",
  treasure: "bg-[linear-gradient(100deg,#d39427,#57350c_56%,#160d07)] after:bg-[rgb(255_177_45/0.4)]",
  cosmic: "bg-[linear-gradient(100deg,#436dd6,#183773_56%,#07101c)] after:bg-[rgb(93_135_255/0.34)]",
  table: "bg-[linear-gradient(100deg,#24af79,#0c5139_56%,#06130e)] after:bg-[rgb(56_224_155/0.3)]",
} as const;

const categoryToneClasses = {
  fortune: "text-gold",
  neon: "text-[#17bfe9]",
  royal: "text-[#bd58f5]",
  treasure: "text-[#dfa332]",
  cosmic: "text-[#17bfe9]",
  table: "text-[#bd58f5]",
} as const;

function GameArtwork({ game }: { game: GameCatalogItem }) {
  return (
    <div className={`relative isolate flex min-h-90 items-center justify-center overflow-hidden rounded-2xl after:absolute after:top-1/5 after:left-1/2 after:-z-1 after:size-62.5 after:-translate-x-1/2 after:rounded-full after:blur-3xl lg:min-h-107.5 ${artworkToneClasses[game.artworkTone]}`}>
      {game.image ? (
        <Image className="-z-1 object-cover" src={game.image.src} alt={game.image.alt} fill sizes="(max-width: 700px) calc(100vw - 64px), (max-width: 1020px) 44vw, 27vw" />
      ) : (
        <span className="font-display text-6xl font-extrabold leading-none text-white [text-shadow:0_0_32px_rgb(255_255_255/0.36)]" aria-hidden="true">{game.symbol}</span>
      )}
      <strong className="absolute right-6 bottom-6 left-6 font-display text-lg font-bold text-center text-white uppercase">{game.title}</strong>
    </div>
  );
}

function GameCard({ game }: { game: GameCatalogItem }) {
  return (
    <article className="scroll-reveal flex min-h-0 flex-col rounded-[22px] border border-line bg-surface p-4 pb-6 lg:min-h-177.5" data-scroll-reveal id={game.id}>
      <GameArtwork game={game} />
      <p className={`mt-5 text-xs font-extrabold uppercase ${categoryToneClasses[game.artworkTone]}`}>{game.categoryLabel}</p>
      <h3 className="mt-3 text-xl leading-[1.15] uppercase">{game.title}</h3>
      <div className="mt-3 flex min-h-10.5 items-start justify-between gap-4 text-xs text-muted">
        <span>{game.description}</span><strong className="shrink-0 text-xs text-success">{game.metric}</strong>
      </div>
      <div className="mt-auto grid grid-cols-1 gap-3 pt-5 xs:grid-cols-2 [&_a]:min-h-12.5 [&_a]:w-full [&_a]:px-4.5 [&_a]:text-xs">
        <ButtonLink href={game.primaryAction.href} external={game.primaryAction.external} ariaLabel={game.primaryAction.ariaLabel} analyticsEvent="demo_request_click" analyticsLabel={game.id}>{game.primaryAction.label}</ButtonLink>
        <ButtonLink href={game.secondaryAction.href} external={game.secondaryAction.external} ariaLabel={game.secondaryAction.ariaLabel} variant="secondary">{game.secondaryAction.label}</ButtonLink>
      </div>
    </article>
  );
}

export function GameCatalogSection({ content }: { content: CatalogContent }) {
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>("all");
  const visibleGames = activeFilter === "all" ? content.games : content.games.filter((game) => game.category === activeFilter);

  return (
    <section className="scroll-reveal scroll-mt-24 pb-16" data-scroll-reveal id="game-library">
      <div className="container">
        <div className="grid min-h-27.5 grid-cols-1 items-center gap-3.5 rounded-card border border-line bg-[#0e131b] px-4.5 py-5 sm:px-7.5 lg:grid-cols-[180px_1fr] lg:gap-7" aria-label={content.ariaLabel} role="group">
          <span className="text-xs font-extrabold text-muted uppercase">{content.filterLabel}</span>
          <div className="flex flex-nowrap gap-2.5 overflow-x-auto pb-1 sm:flex-wrap">
            {content.filters.map((filter) => (
              <button className={`min-h-10.5 shrink-0 cursor-pointer rounded-[10px] border px-5 text-xs font-semibold transition ${activeFilter === filter.value ? "border-gold bg-gold text-white" : "border-[#29313d] bg-[#171d27] text-muted hover:border-[#485464] hover:text-ink"}`} type="button" aria-pressed={activeFilter === filter.value} key={filter.value} onClick={() => setActiveFilter(filter.value)}>{filter.label}</button>
            ))}
          </div>
        </div>
        <div className="mt-16 max-w-205">
          <p className="mb-7.5 inline-flex min-h-10 items-center rounded-full border border-line-strong bg-surface-strong px-5 text-xs font-extrabold text-gold-bright uppercase">{content.label}</p>
          <h2 className="text-4xl leading-[1.08] uppercase md:text-5xl">{content.title}</h2>
          <p className="mt-5 max-w-192.5 text-sm leading-6 text-muted">{content.description}</p>
        </div>
        <p className="sr-only" role="status" aria-live="polite">Showing {visibleGames.length} {visibleGames.length === 1 ? "game" : "games"}.</p>
        <div className="mt-12 grid grid-cols-1 gap-x-6 gap-y-16 md:grid-cols-2 xl:grid-cols-3">
          {visibleGames.map((game) => <GameCard game={game} key={game.id} />)}
        </div>
      </div>
    </section>
  );
}
