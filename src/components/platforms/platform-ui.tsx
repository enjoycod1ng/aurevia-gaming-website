import type { PlatformMetric } from "@/types/content";

import styles from "./platforms-page.module.css";

interface PlatformSidebarProps {
  brandName: string;
  brandLabel?: string;
  brandMark?: string;
  ariaLabel: string;
  items: readonly string[];
  compact?: boolean;
}

export function PlatformSidebar({
  brandName,
  brandLabel,
  brandMark,
  ariaLabel,
  items,
  compact = false,
}: PlatformSidebarProps) {
  return (
    <aside className={`${styles.previewSidebar} ${compact ? styles.previewSidebarCompact : ""}`}>
      <div className={styles.previewBrand}>
        {brandMark ? <strong>{brandMark}</strong> : null}
        <span>
          <b>{brandName}</b>
          {brandLabel ? <small>{brandLabel}</small> : null}
        </span>
      </div>
      <nav aria-label={ariaLabel}>
        <ul>
          {items.map((item, index) => (
            <li className={index === 0 ? styles.previewNavActive : undefined} key={item}>
              <span aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}

export function PlatformMetricCard({ metric }: { metric: PlatformMetric }) {
  return (
    <article className={styles.metricCard}>
      <span>{metric.label}</span>
      <strong>{metric.value}</strong>
      {metric.change ? (
        <small className={styles[`metricChange--${metric.changeTone ?? "neutral"}`]}>
          {metric.change}
        </small>
      ) : null}
    </article>
  );
}

interface PlatformLineChartProps {
  points: readonly (readonly [number, number])[];
  label: string;
}

export function PlatformLineChart({ points, label }: PlatformLineChartProps) {
  const polyline = points.map(([x, y]) => `${x},${y}`).join(" ");

  return (
    <svg className={styles.lineChart} viewBox="0 0 100 100" role="img" aria-label={label}>
      <path d="M0 25H100M0 50H100M0 75H100" className={styles.chartGrid} />
      <polyline points={polyline} className={styles.chartLine} />
      {points.map(([x, y], index) => (
        <circle cx={x} cy={y} r="1.7" key={`${x}-${y}-${index}`} />
      ))}
    </svg>
  );
}
