import type { SiteContent } from "@/types/content";

type OperatorDashboardContent = SiteContent["home"]["platform"]["dashboard"];

export function OperatorDashboard({
  content,
}: {
  content: OperatorDashboardContent;
}) {
  const chartPath = `M${content.chart.points.map(([x, y]) => `${x} ${y}`).join(" ")}`;

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
              <small
                className={stat.tone === "neutral" ? "is-neutral" : undefined}
              >
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
          <svg
            aria-hidden="true"
            viewBox="0 0 500 180"
            preserveAspectRatio="none"
          >
            <path className="grid-line" d="M0 35H500M0 90H500M0 145H500" />
            <path className="chart-line" d={chartPath} />
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
