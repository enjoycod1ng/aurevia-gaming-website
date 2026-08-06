import { ButtonLink } from "@/components/button-link";
import type { SiteContent } from "@/types/content";

import styles from "./games-page.module.css";

type GamesHeroContent = SiteContent["gamesPage"]["hero"];

function FeaturedGame({ content }: { content: GamesHeroContent["featured"] }) {
  return (
    <article
      className={styles.featuredGame}
      aria-labelledby="featured-game-title"
    >
      <p className={styles.featuredLabel}>{content.label}</p>
      <h2 id="featured-game-title">{content.title}</h2>
      <p className={styles.featuredDescription}>{content.description}</p>

      <div
        className={styles.reels}
        aria-label={`${content.title} reel preview`}
      >
        {content.reels.map((reel, index) => (
          <span
            className={reel.active ? styles.activeReel : undefined}
            key={`${reel.symbol}-${index}`}
          >
            {reel.symbol}
          </span>
        ))}
      </div>

      <div className={styles.featuredActions}>
        <ButtonLink
          href={content.primaryAction.href}
          external={content.primaryAction.external}
          ariaLabel={content.primaryAction.ariaLabel}
        >
          {content.primaryAction.label}
        </ButtonLink>
        <ButtonLink
          href={content.secondaryAction.href}
          external={content.secondaryAction.external}
          ariaLabel={content.secondaryAction.ariaLabel}
          variant="secondary"
        >
          {content.secondaryAction.label}
        </ButtonLink>
      </div>

      <p className={styles.featuredMeta}>
        <span>{content.metric}</span>
        <span aria-hidden="true">·</span>
        <span>{content.volatility}</span>
      </p>
    </article>
  );
}

export function GamesHeroSection({ content }: { content: GamesHeroContent }) {
  return (
    <section className={`${styles.hero} scroll-reveal`} data-scroll-reveal>
      <div className={`container ${styles.heroGrid}`}>
        <div className={styles.heroContent}>
          <p className={styles.kicker}>{content.label}</p>
          <h1>
            {content.titleLines.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </h1>
          <p className={styles.heroDescription}>{content.description}</p>
          <div className={styles.heroActions}>
            <ButtonLink
              href={content.primaryAction.href}
              external={content.primaryAction.external}
              ariaLabel={content.primaryAction.ariaLabel}
            >
              {content.primaryAction.label}
            </ButtonLink>
            <ButtonLink
              href={content.secondaryAction.href}
              external={content.secondaryAction.external}
              ariaLabel={content.secondaryAction.ariaLabel}
              variant="secondary"
            >
              {content.secondaryAction.label}
            </ButtonLink>
          </div>
        </div>

        <FeaturedGame content={content.featured} />
      </div>
    </section>
  );
}
