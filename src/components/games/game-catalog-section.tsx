"use client";

import { useState } from "react";

import { GameCard } from "@/components/games/game-card";
import type { GameFilter, SiteContent } from "@/types/content";

type CatalogContent = SiteContent["gamesPage"]["catalog"];
type ActiveFilter = GameFilter["value"];

export function GameCatalogSection({ content }: { content: CatalogContent }) {
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>("all");
  const visibleGames = activeFilter === "all" ? content.games : content.games.filter((game) => game.category === activeFilter);

  return (
    <section className="scroll-reveal scroll-mt-24 pb-16" data-scroll-reveal id="game-library">
      <div className="container">
        <div className="grid min-h-27.5 grid-cols-1 items-center gap-3.5 rounded-card border border-line bg-surface px-4.5 py-5 sm:px-7.5 lg:grid-cols-[180px_1fr] lg:gap-7" aria-label={content.ariaLabel} role="group">
          <span className="text-sm font-extrabold text-muted uppercase">{content.filterLabel}</span>
          <div className="flex flex-nowrap gap-2.5 overflow-x-auto pb-1 sm:flex-wrap">
            {content.filters.map((filter) => (
              <button className={`min-h-11 shrink-0 cursor-pointer rounded-[10px] border px-5 text-sm font-semibold transition ${activeFilter === filter.value ? "border-gold bg-action text-action-ink" : "border-line bg-surface-strong text-muted hover:border-line-strong hover:text-ink"}`} type="button" aria-pressed={activeFilter === filter.value} key={filter.value} onClick={() => setActiveFilter(filter.value)}>{filter.label}</button>
            ))}
          </div>
        </div>
        <div className="mt-16 max-w-205">
          <p className="mb-7.5 inline-flex min-h-10 items-center rounded-full border border-line-strong bg-surface-strong px-5 text-sm font-extrabold text-gold-bright uppercase">{content.label}</p>
          <h2 className=" heading-2">{content.title}</h2>
          <p className="mt-5 max-w-192.5 text-sm leading-6 text-muted">{content.description}</p>
        </div>
        <p className="sr-only" role="status" aria-live="polite">{content.countLabel.replace("{count}", String(visibleGames.length))}</p>
        <div className="mt-12 grid grid-cols-1 gap-x-6 gap-y-16 md:grid-cols-2 xl:grid-cols-3">
          {visibleGames.map((game) => <GameCard game={game} key={game.id} />)}
        </div>
      </div>
    </section>
  );
}
