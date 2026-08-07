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
    <aside
      className={`${styles.previewSidebar} ${compact ? styles.previewSidebarCompact : ""}`}
    >
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
            <li
              className={index === 0 ? styles.previewNavActive : undefined}
              key={item}
            >
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
        <small
          className={styles[`metricChange--${metric.changeTone ?? "neutral"}`]}
        >
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
    <>
      <svg aria-hidden="true" viewBox="0 0 500 180" preserveAspectRatio="none">
        <path
          className={styles.chartGrid}
          d="M0 35H500M0 90H500M0 145H500"
        ></path>
        <path
          className={styles.chartLine}
          d="M12 132 80 166 130 94 202 153 272 75 340 49 408 92 490 22"
        ></path>
        <circle cx="12" cy="132" r="5"></circle>
        <circle cx="80" cy="166" r="5"></circle>
        <circle cx="130" cy="94" r="5"></circle>
        <circle cx="202" cy="153" r="5"></circle>
        <circle cx="272" cy="75" r="5"></circle>
        <circle cx="340" cy="49" r="5"></circle>
        <circle cx="408" cy="92" r="5"></circle>
        <circle cx="490" cy="22" r="5"></circle>
      </svg>
      {/* <svg
        className={styles.lineChart}
        viewBox="0 0 100 100"
        role="img"
        aria-label={label}
      >
        <path d="M0 25H100M0 50H100M0 75H100" className={styles.chartGrid} />
        <polyline points={polyline} className={styles.chartLine} />
        {points.map(([x, y], index) => (
          <circle cx={x} cy={y} r="1.7" key={`${x}-${y}-${index}`} />
        ))}
      </svg> */}
    </>
  );
}
