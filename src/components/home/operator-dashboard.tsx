import type { SiteContent } from "@/types/content";

type OperatorDashboardContent = SiteContent["home"]["platform"]["dashboard"];

export function OperatorDashboard({
  content,
}: {
  content: OperatorDashboardContent;
}) {
  const chartPath = `M${content.chart.points.map(([x, y]) => `${x} ${y}`).join(" ")}`;

  return (
    <div
      className="grid min-h-185 grid-cols-1 overflow-hidden rounded-3xl border border-line-strong bg-surface shadow-[0_28px_90px_rgb(0_0_0/0.26)] sm:grid-cols-[205px_1fr]"
      aria-label={content.ariaLabel}
    >
      <aside className="hidden border-r border-line bg-[#080c12] px-6 py-8.5 sm:block">
        <div className="mb-12 flex items-center gap-3.5 uppercase">
          <strong className="text-2xl text-gold-bright">{content.brandMark}</strong>
          <span className="text-xs font-bold">{content.brandName}</span>
        </div>
        <nav className="grid gap-3" aria-label={content.navigationAriaLabel}>
          {content.navigation.map((item, index) => (
            <span
              className={`flex min-h-11 items-center gap-3 rounded-xl px-3.5 text-xs ${index === 0 ? "bg-[#2c220a] text-ink" : "text-muted"}`}
              key={item}
            >
              <i
                className={`size-2 rounded-full ${index === 0 ? "bg-gold" : "bg-current"}`}
                aria-hidden="true"
              />
              {item}
            </span>
          ))}
        </nav>
      </aside>
      <div className="p-4.5 sm:p-8">
        <header>
          <h3 className="text-2xl">{content.title}</h3>
          <p className="mt-2 text-xs text-muted">{content.description}</p>
        </header>
        <div className="mt-7.5 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {content.stats.map((stat) => (
            <div
              className="grid min-h-24 content-center gap-2.5 rounded-2xl border border-line-strong bg-[#171d27] px-4"
              key={stat.label}
            >
              <span className="text-xs font-bold text-muted uppercase">{stat.label}</span>
              <strong className="text-lg">{stat.value}</strong>
              <small
                className={`text-xs font-bold uppercase ${stat.tone === "neutral" ? "text-gold-bright" : "text-success"}`}
              >
                {stat.change}
              </small>
            </div>
          ))}
        </div>
        <div className="mt-4.5 rounded-2xl border border-line-strong bg-surface p-5.5">
          <div className="flex items-center justify-between gap-5 text-xs">
            <strong>{content.chart.title}</strong>
            <span className="text-muted">{content.chart.period}</span>
          </div>
          <svg
            className="mt-3.5 h-39.5 w-full overflow-visible"
            aria-hidden="true"
            viewBox="0 0 500 180"
            preserveAspectRatio="none"
          >
            <path className="fill-none stroke-[#28313c] stroke-1" d="M0 35H500M0 90H500M0 145H500" />
            <path className="fill-none stroke-gold-bright stroke-3 [stroke-linecap:round] [stroke-linejoin:round]" d={chartPath} />
            {content.chart.points.map(([cx, cy]) => (
              <circle className="fill-gold-bright" cx={cx} cy={cy} r="5" key={`${cx}-${cy}`} />
            ))}
          </svg>
        </div>
        <div className="mt-4.5 rounded-2xl border border-line-strong bg-surface p-5.5">
          <strong className="text-sm">{content.gamesTitle}</strong>
          {content.games.map((game) => (
            <div className="grid min-h-11.5 grid-cols-[32px_1fr_auto] items-center gap-3 border-b border-line text-xs last:border-b-0 sm:grid-cols-[34px_1fr_auto_auto]" key={game.name}>
              <i className="size-7 rounded-full bg-[#171d27]" aria-hidden="true" />
              <span>{game.name}</span>
              <small className="hidden text-muted sm:block">{game.players}</small>
              <b className="min-w-12.5 text-right text-success">{game.revenue}</b>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
