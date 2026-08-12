"use client";

import Image from "next/image";
import { useState } from "react";

import { ButtonLink } from "@/components/button-link";
import type { GameCatalogItem, GameFilter, SiteContent } from "@/types/content";

import styles from "./games-page.module.css";

type CatalogContent = SiteContent["gamesPage"]["catalog"];
type ActiveFilter = GameFilter["value"];

function GameArtwork({ game }: { game: GameCatalogItem }) {
  return (
    <div
      className={`${styles.artwork} ${styles[`artwork--${game.artworkTone}`]}`}
    >
      {game.image ? (
        <Image
          className={styles.artworkImage}
          src={game.image.src}
          alt={game.image.alt}
          fill
          sizes="(max-width: 700px) calc(100vw - 64px), (max-width: 1020px) 44vw, 27vw"
        />
      ) : (
        <span className={styles.artworkSymbol} aria-hidden="true">
          {game.symbol}
        </span>
      )}
      <strong>{game.title}</strong>
    </div>
  );
}

function GameCard({ game }: { game: GameCatalogItem }) {
  return (
    <article className={`${styles.gameCard} scroll-reveal`} data-scroll-reveal id={game.id}>
      <GameArtwork game={game} />
      <p
        className={`${styles.gameCategory} ${styles[`gameCategory--${game.artworkTone}`]}`}
      >
        {game.categoryLabel}
      </p>
      <h3>{game.title}</h3>
      <div className={styles.gameDetails}>
        <span>{game.description}</span>
        <strong>{game.metric}</strong>
      </div>
      <div className={styles.gameActions}>
        <ButtonLink
          href={game.primaryAction.href}
          external={game.primaryAction.external}
          ariaLabel={game.primaryAction.ariaLabel}
          analyticsEvent="demo_request_click"
          analyticsLabel={game.id}
        >
          {game.primaryAction.label}
        </ButtonLink>
        <ButtonLink
          href={game.secondaryAction.href}
          external={game.secondaryAction.external}
          ariaLabel={game.secondaryAction.ariaLabel}
          variant="secondary"
        >
          {game.secondaryAction.label}
        </ButtonLink>
      </div>
    </article>
  );
}

export function GameCatalogSection({ content }: { content: CatalogContent }) {
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>("all");
  const visibleGames =
    activeFilter === "all"
      ? content.games
      : content.games.filter((game) => game.category === activeFilter);

  return (
    <section className={`${styles.catalog} scroll-reveal`} data-scroll-reveal id="game-library">
      <div className="container">
        <div
          className={styles.filterBar}
          aria-label={content.ariaLabel}
          role="group"
        >
          <span className={styles.filterLabel}>{content.filterLabel}</span>
          <div className={styles.filters}>
            {content.filters.map((filter) => (
              <button
                className={
                  activeFilter === filter.value
                    ? styles.activeFilter
                    : undefined
                }
                type="button"
                aria-pressed={activeFilter === filter.value}
                key={filter.value}
                onClick={() => setActiveFilter(filter.value)}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.sectionHeading}>
          <p className={styles.kicker}>{content.label}</p>
          <h2>{content.title}</h2>
          <p>{content.description}</p>
        </div>

        <p className="sr-only" role="status" aria-live="polite">
          Showing {visibleGames.length}{" "}
          {visibleGames.length === 1 ? "game" : "games"}.
        </p>
        <div className={styles.gameGrid}>
          {visibleGames.map((game) => (
            <GameCard game={game} key={game.id} />
          ))}
        </div>
      </div>
    </section>
  );
}
