import { ButtonLink } from "@/components/button-link";
import type { SiteContent } from "@/types/content";

import { PlatformMetricCard, PlatformSidebar } from "./platform-ui";
import { PlatformVisual } from "./platform-visual";
import styles from "./platforms-page.module.css";

type PlatformHeroContent = SiteContent["platformPage"]["hero"];

function OperatorOverview({
  content,
}: {
  content: PlatformHeroContent["overview"];
}) {
  const panel = (
    <aside className={styles.overviewPanel} aria-label={content.ariaLabel}>
      <PlatformSidebar
        brandMark={content.brandMark}
        brandName={content.brandName}
        ariaLabel={content.navigationAriaLabel}
        items={content.navigation}
        compact
      />
      <div className={styles.overviewContent}>
        <header>
          <h2>{content.title}</h2>
          <p>{content.description}</p>
        </header>
        <div className={styles.overviewMetrics}>
          {content.metrics.map((metric) => (
            <PlatformMetricCard metric={metric} key={metric.label} />
          ))}
        </div>
        <section className={styles.barChart} aria-label={content.chartTitle}>
          <strong>{content.chartTitle}</strong>
          <div aria-hidden="true">
            {content.chartBars.map((height, index) => (
              <span style={{ height }} key={`${height}-${index}`} />
            ))}
          </div>
        </section>
        <section className={styles.productList}>
          <strong>{content.productsTitle}</strong>
          <ul>
            {content.products.map((product) => (
              <li key={product.name}>
                <span>{product.name}</span>
                <small>{product.players}</small>
                <b>{product.revenue}</b>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </aside>
  );

  return (
    <PlatformVisual
      image={content.image}
      className={styles.visualImage}
      sizes="(max-width: 900px) 100vw, 52vw"
      priority
    >
      {panel}
    </PlatformVisual>
  );
}

export function PlatformHeroSection({
  content,
}: {
  content: PlatformHeroContent;
}) {
  return (
    <section className={styles.hero}>
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
        <OperatorOverview content={content.overview} />
      </div>
    </section>
  );
}

interface PlatformProofProps {
  ariaLabel: string;
  points: SiteContent["platformPage"]["proofPoints"];
}

export function PlatformProof({ ariaLabel, points }: PlatformProofProps) {
  return (
    <section className={styles.proof} aria-label={ariaLabel}>
      <div className={`container ${styles.proofGrid}`}>
        {points.map((point) => (
          <article key={point.number}>
            <span>{point.number}</span>
            <h2>{point.title}</h2>
            <p>{point.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
