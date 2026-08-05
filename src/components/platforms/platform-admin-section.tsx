import { SectionHeading } from "@/components/section-heading";
import type { SiteContent } from "@/types/content";

import { PlatformLineChart, PlatformMetricCard, PlatformSidebar } from "./platform-ui";
import { PlatformVisual } from "./platform-visual";
import styles from "./platforms-page.module.css";

type AdminContent = SiteContent["platformPage"]["admin"];
type AdminDashboardContent = AdminContent["dashboard"];

function TrafficChart({ items }: { items: AdminDashboardContent["traffic"] }) {
  const segments = items.map((item, index) => ({
    item,
    offset: items.slice(0, index).reduce((total, segment) => total + segment.value, 0),
  }));

  return (
    <div className={styles.trafficLayout}>
      <div className={styles.trafficDonut} aria-label={`${items[0]?.value ?? 0}% organic traffic`}>
        <svg viewBox="0 0 42 42" aria-hidden="true">
          <circle className={styles.trafficTrack} cx="21" cy="21" r="15.9" />
          {segments.map(({ item, offset }) => {
            return (
              <circle
                className={styles[`trafficSegment--${item.tone}`]}
                cx="21"
                cy="21"
                r="15.9"
                pathLength="100"
                strokeDasharray={`${item.value} ${100 - item.value}`}
                strokeDashoffset={-offset}
                key={item.label}
              />
            );
          })}
        </svg>
        <strong>{items[0]?.value ?? 0}%</strong>
      </div>
      <ul className={styles.trafficLegend}>
        {items.map((item) => (
          <li className={styles[`tone--${item.tone}`]} key={item.label}>
            <span aria-hidden="true" />
            <small>{item.label}</small>
            <strong>{item.value}%</strong>
          </li>
        ))}
      </ul>
    </div>
  );
}

function AdminDashboard({ content }: { content: AdminDashboardContent }) {
  const dashboard = (
    <div className={styles.adminDashboard} aria-label={content.ariaLabel}>
      <PlatformSidebar
        brandName={content.brandName}
        brandLabel={content.brandLabel}
        ariaLabel={content.navigationAriaLabel}
        items={content.navigation}
      />
      <div className={styles.adminMain}>
        <header className={styles.dashboardHeader}>
          <div>
            <h3>{content.title}</h3>
            <p>{content.description}</p>
          </div>
          <span>{content.actionLabel}</span>
        </header>
        <div className={styles.dashboardMetrics}>
          {content.metrics.map((metric) => (
            <PlatformMetricCard metric={metric} key={metric.label} />
          ))}
        </div>
        <div className={styles.dashboardCharts}>
          <section className={styles.lineChartPanel}>
            <header>
              <strong>{content.chart.title}</strong>
              <small>{content.chart.period}</small>
            </header>
            <PlatformLineChart points={content.chart.points} label={content.chart.title} />
          </section>
          <section className={styles.trafficPanel}>
            <strong>Traffic mix</strong>
            <TrafficChart items={content.traffic} />
          </section>
        </div>
        <section className={styles.activityPanel}>
          <strong>{content.activityTitle}</strong>
          <ul>
            {content.activity.map((activity) => (
              <li className={styles[`tone--${activity.tone}`]} key={activity.label}>
                <span aria-hidden="true">✓</span>
                <b>{activity.label}</b>
                <small>{activity.detail}</small>
                <time>{activity.time}</time>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );

  return (
    <PlatformVisual
      image={content.image}
      className={styles.visualImage}
      sizes="(max-width: 900px) 100vw, 88vw"
    >
      {dashboard}
    </PlatformVisual>
  );
}

export function PlatformAdminSection({ content }: { content: AdminContent }) {
  return (
    <section className={styles.admin} id="admin-features">
      <div className="container">
        <div className={styles.sectionHeading}>
          <SectionHeading {...content.heading} />
        </div>
        <ul className={styles.adminTabs} aria-label={content.tabsAriaLabel}>
          {content.tabs.map((tab, index) => (
            <li className={index === 0 ? styles.activeTab : undefined} key={tab}>
              {tab}
            </li>
          ))}
        </ul>
        <AdminDashboard content={content.dashboard} />
      </div>
    </section>
  );
}
