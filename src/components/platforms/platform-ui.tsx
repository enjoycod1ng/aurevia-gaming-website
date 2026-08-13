import type { PlatformMetric } from "@/types/content";

interface PlatformSidebarProps {
  brandName: string;
  brandLabel?: string;
  brandMark?: string;
  ariaLabel: string;
  items: readonly string[];
  compact?: boolean;
}

export function PlatformSidebar({ brandName, brandLabel, brandMark, ariaLabel, items, compact = false }: PlatformSidebarProps) {
  return (
    <aside className={`min-w-0 border-r border-[#202a36] bg-[#080c12] py-7.5 ${compact ? "px-4" : "px-5"}`}>
      <div className="mb-10 flex min-w-0 items-center gap-3 font-display leading-none uppercase">
        {brandMark ? <strong className="text-2xl text-gold-bright">{brandMark}</strong> : null}
        <span className="grid min-w-0 gap-1.5"><b className="overflow-hidden text-xs text-ellipsis">{brandName}</b>{brandLabel ? <small className="text-xs font-bold text-gold-bright">{brandLabel}</small> : null}</span>
      </div>
      <nav aria-label={ariaLabel}>
        <ul className="grid list-none gap-2.5 p-0">
          {items.map((item, index) => (
            <li className={`flex min-h-10.5 items-center gap-2.5 rounded-lg px-3 text-xs font-semibold whitespace-nowrap ${index === 0 ? "bg-[#2c220a] text-ink" : "text-[#a3abb7]"}`} key={item}>
              <span className={`size-1.75 shrink-0 rounded-full ${index === 0 ? "bg-gold" : "bg-current"}`} aria-hidden="true" />{item}
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}

const changeClasses = { positive: "text-success", negative: "text-error", neutral: "text-gold-bright" } as const;

export function PlatformMetricCard({ metric }: { metric: PlatformMetric }) {
  return (
    <article className="grid min-h-27.5 min-w-0 content-center gap-2 rounded-[14px] border border-[#2a3442] bg-[#171d27] p-4">
      <span className="overflow-hidden text-xs font-bold text-ellipsis whitespace-nowrap text-[#9ca4b0] uppercase">{metric.label}</span>
      <strong className="font-display text-lg leading-none">{metric.value}</strong>
      {metric.change ? <small className={`text-xs font-bold ${changeClasses[metric.changeTone ?? "neutral"]}`}>{metric.change}</small> : null}
    </article>
  );
}

interface PlatformLineChartProps { points: readonly (readonly [number, number])[]; label: string; }

export function PlatformLineChart({ points, label }: PlatformLineChartProps) {
  const polyline = points.map(([x, y]) => `${x},${y}`).join(" ");
  return (
    <svg className="mt-3 block h-52.5 w-full overflow-visible" viewBox="0 0 100 100" role="img" aria-label={label} preserveAspectRatio="none">
      <path d="M0 25H100M0 50H100M0 75H100" className="fill-none stroke-[#293340] stroke-[0.6]" />
      <polyline points={polyline} className="fill-none stroke-gold-bright stroke-[1.5] [stroke-linecap:round] [stroke-linejoin:round]" />
      {points.map(([x, y], index) => <circle className="fill-gold-bright" cx={x} cy={y} r="1.7" key={`${x}-${y}-${index}`} />)}
    </svg>
  );
}
