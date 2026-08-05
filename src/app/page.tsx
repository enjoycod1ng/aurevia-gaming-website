import type { CSSProperties } from "react";
import Link from "next/link";

import { ButtonLink } from "@/components/button-link";
import { siteContent } from "@/content/site-content";
import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata(siteContent.seo.home);

const home = siteContent.home;
const dashboardChartPath = `M${home.platform.dashboard.chart.points
  .map(([x, y]) => `${x} ${y}`)
  .join(" ")}`;

type HomeServiceIconName = (typeof home.services.items)[number]["icon"];
type HeroMockupContent = typeof home.hero.mockup;
type OperatorDashboardContent = typeof home.platform.dashboard;

function ServiceIcon({ name }: { name: HomeServiceIconName }) {
  if (name === "devices") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <rect x="3" y="5" width="13" height="10" rx="1.5" />
        <path d="M7 19h5M9.5 15v4" />
        <rect x="15" y="9" width="6" height="10" rx="1.5" />
      </svg>
    );
  }

  if (name === "diamond") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="m12 3 8 9-8 9-8-9 8-9Z" fill="currentColor" stroke="none" />
      </svg>
    );
  }

  if (name === "controls") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="M4 7h10M18 7h2M4 17h2M10 17h10M14 4v6M6 14v6" />
        <circle cx="14" cy="7" r="2" />
        <circle cx="8" cy="17" r="2" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path
        d="M12 2.5c.8 4.6 3.2 7 7.5 7.8-4.3.8-6.7 3.2-7.5 7.7-.8-4.5-3.2-6.9-7.5-7.7C8.8 9.5 11.2 7.1 12 2.5Z"
        fill="currentColor"
        stroke="none"
      />
    </svg>
  );
}

function HeroProductMockup({ content }: { content: HeroMockupContent }) {
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
                style={{ "--metric-progress": `${metric.progress}%` } as CSSProperties}
              />
            ) : null}
            {metric.change ? <small>{metric.change}</small> : null}
          </div>
        ))}
      </div>
    </div>
  );
}

function OperatorDashboard({ content }: { content: OperatorDashboardContent }) {
  return (
    <div className="operator-dashboard" aria-label={content.ariaLabel}>
      <aside className="operator-dashboard__sidebar">
        <div className="operator-dashboard__brand">
          <strong>{content.brandMark}</strong>
          <span>{content.brandName}</span>
        </div>
        <nav aria-label={content.navigationAriaLabel}>
          {content.navigation.map((item, index) => (
            <span className={index === 0 ? "is-current" : ""} key={item}>
              <i aria-hidden="true" />
              {item}
            </span>
          ))}
        </nav>
      </aside>
      <div className="operator-dashboard__main">
        <header>
          <h3>{content.title}</h3>
          <p>{content.description}</p>
        </header>
        <div className="operator-dashboard__stats">
          {content.stats.map((stat) => (
            <div key={stat.label}>
              <span>{stat.label}</span>
              <strong>{stat.value}</strong>
              <small className={stat.tone === "neutral" ? "is-neutral" : undefined}>
                {stat.change}
              </small>
            </div>
          ))}
        </div>
        <div className="operator-dashboard__chart">
          <div className="operator-dashboard__panel-heading">
            <strong>{content.chart.title}</strong>
            <span>{content.chart.period}</span>
          </div>
          <svg aria-hidden="true" viewBox="0 0 500 180" preserveAspectRatio="none">
            <path className="grid-line" d="M0 35H500M0 90H500M0 145H500" />
            <path className="chart-line" d={dashboardChartPath} />
            {content.chart.points.map(([cx, cy]) => (
              <circle cx={cx} cy={cy} r="5" key={`${cx}-${cy}`} />
            ))}
          </svg>
        </div>
        <div className="operator-dashboard__games">
          <strong>{content.gamesTitle}</strong>
          {content.games.map((game) => (
            <div key={game.name}>
              <i aria-hidden="true" />
              <span>{game.name}</span>
              <small>{game.players}</small>
              <b>{game.revenue}</b>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <main id="main-content" className="home-page">
      <section className="home-hero">
        <div className="container home-hero__grid">
          <div className="home-hero__content">
            <p className="home-kicker">{home.hero.label}</p>
            <h1>
              {home.hero.title}
              <span>{home.hero.highlightedTitle}</span>
            </h1>
            <p className="home-hero__description">{home.hero.description}</p>
            <div className="button-row home-hero__actions">
              <ButtonLink href={home.hero.primaryAction.href}>
                {home.hero.primaryAction.label}
              </ButtonLink>
              <ButtonLink href={home.hero.secondaryAction.href} variant="secondary">
                {home.hero.secondaryAction.label}
              </ButtonLink>
            </div>
            <div className="home-hero__details" aria-label={home.hero.detailsAriaLabel}>
              {home.hero.details.map((detail) => (
                <div key={detail.label}>
                  <span>{detail.label}</span>
                  <p>{detail.value}</p>
                </div>
              ))}
            </div>
          </div>
          <HeroProductMockup content={home.hero.mockup} />
        </div>
      </section>

      <section className="home-proof" aria-label={home.proofAriaLabel}>
        <div className="container home-proof__grid">
          {home.proofPoints.map((point) => (
            <div key={point.number}>
              <span>{point.number}</span>
              <p>{point.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="home-section home-services">
        <div className="container">
          <div className="home-section-heading">
            <p className="home-kicker">{home.services.heading.label}</p>
            <h2>{home.services.heading.title}</h2>
            <p>{home.services.heading.description}</p>
          </div>
          <div className="home-service-grid">
            {home.services.items.map((service, index) => (
              <article
                className={index === 0 ? "home-service-card is-featured" : "home-service-card"}
                key={service.number}
              >
                <span className="home-service-card__number">{service.number}</span>
                <span className="home-service-card__icon">
                  <ServiceIcon name={service.icon} />
                </span>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
                <Link href={service.action.href}>
                  {service.action.label}
                  <svg aria-hidden="true" viewBox="0 0 20 20">
                    <path d="M4 10h11M11 6l4 4-4 4" />
                  </svg>
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="home-section home-demos">
        <div className="container">
          <div className="home-section-heading">
            <p className="home-kicker">{home.demos.heading.label}</p>
            <h2>{home.demos.heading.title}</h2>
            <p>{home.demos.heading.description}</p>
          </div>
          <div className="home-demo-grid">
            {home.demos.items.map((demo) => (
              <article className="home-demo-card" key={demo.title}>
                <div className={`home-demo-card__visual home-demo-card__visual--${demo.theme}`}>
                  <span>{demo.symbol}</span>
                  <strong>{demo.title}</strong>
                </div>
                <h3>{demo.title}</h3>
                <p>{demo.description}</p>
                <div className="button-row">
                  <ButtonLink href={demo.primaryAction.href}>{demo.primaryAction.label}</ButtonLink>
                  <ButtonLink href={demo.secondaryAction.href} variant="secondary">
                    {demo.secondaryAction.label}
                  </ButtonLink>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="home-section home-platform">
        <div className="container home-platform__grid">
          <div className="home-platform__content">
            <p className="home-kicker">{home.platform.heading.label}</p>
            <h2>
              {home.platform.heading.title}
              <span>{home.platform.highlightedTitle}</span>
            </h2>
            <p>{home.platform.heading.description}</p>
            <ButtonLink href={home.platform.action.href}>{home.platform.action.label}</ButtonLink>
            <ul>
              {home.platform.features.map((item) => (
                <li key={item}>
                  <span aria-hidden="true">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <OperatorDashboard content={home.platform.dashboard} />
        </div>
      </section>

      <section className="home-section home-reasons">
        <div className="container">
          <div className="home-section-heading">
            <p className="home-kicker">{home.reasons.heading.label}</p>
            <h2>{home.reasons.heading.title}</h2>
            <p>{home.reasons.heading.description}</p>
          </div>
          <div className="home-reason-grid">
            {home.reasons.items.map((reason) => (
              <article key={reason.number}>
                <span>{reason.number}</span>
                <h3>{reason.title}</h3>
                <p>{reason.description}</p>
                <strong>{reason.result}</strong>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="home-cta-section">
        <div className="container">
          <div className="home-cta">
            <div>
              <h2>{home.cta.title}</h2>
              <p>{home.cta.description}</p>
            </div>
            <div className="home-cta__actions">
              <ButtonLink href={home.cta.primaryAction.href}>{home.cta.primaryAction.label}</ButtonLink>
              <a href={siteContent.contact.telegramUrl} target="_blank" rel="noreferrer">
                {home.cta.telegramLabel} {siteContent.contact.telegramHandle}
              </a>
              <a href={siteContent.contact.phoneHref}>
                {home.cta.phoneLabel} {siteContent.contact.phoneDisplay}
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
