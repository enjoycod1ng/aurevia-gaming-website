import type { CSSProperties } from "react";

import type { SiteContent } from "@/types/content";

type HeroMockupContent = SiteContent["home"]["hero"]["mockup"];

export function HeroProductMockup({ content }: { content: HeroMockupContent }) {
  return (
    <div className="home-hero-mockup" aria-label={content.ariaLabel}>
      <div className="home-game-panel">
        <div className="home-game-panel__heading">
          <span>{content.title}</span>
          <small>{content.subtitle}</small>
        </div>
        <div className="home-game-reels" aria-hidden="true">
          {content.reels.map((reel, index) => (
            <span
              className={reel.active ? "is-active" : ""}
              key={`${reel.symbol}-${index}`}
            >
              {reel.symbol}
            </span>
          ))}
        </div>
        <div className="home-jackpot">
          <span>{content.jackpotLabel}</span>
          <strong>{content.jackpotValue}</strong>
          <i aria-hidden="true" />
        </div>
      </div>
      <div className="home-game-metrics">
        {content.metrics.map((metric) => (
          <div key={metric.label}>
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
            {typeof metric.progress === "number" ? (
              <i
                aria-hidden="true"
                style={
                  {
                    "--metric-progress": `${metric.progress}%`,
                  } as CSSProperties
                }
              />
            ) : null}
            {metric.change ? <small>{metric.change}</small> : null}
          </div>
        ))}
      </div>
    </div>
  );
}
