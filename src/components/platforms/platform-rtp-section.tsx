import { SectionHeading } from "@/components/section-heading";
import type { SiteContent } from "@/types/content";

import { PlatformMetricCard } from "./platform-ui";
import { PlatformVisual } from "./platform-visual";
import styles from "./platforms-page.module.css";

type RtpContent = SiteContent["platformPage"]["rtp"];
type RtpPanelContent = RtpContent["panel"];

function RtpPanel({ content }: { content: RtpPanelContent }) {
  const panel = (
    <div className={styles.rtpPanel} aria-label={content.ariaLabel}>
      <aside className={styles.rtpSidebar}>
        <header>
          <strong>{content.profilesTitle}</strong>
          <span>{content.newProfileLabel}</span>
        </header>
        <div className={styles.profileList}>
          {content.profiles.map((profile) => (
            <article
              className={profile.selected ? styles.selectedProfile : undefined}
              key={profile.name}
            >
              <span>{profile.name}</span>
              <strong>{profile.value}</strong>
              <small className={styles[`profileStatus--${profile.statusTone}`]}>
                {profile.status}
              </small>
            </article>
          ))}
        </div>
      </aside>
      <div className={styles.rtpMain}>
        <header className={styles.dashboardHeader}>
          <div>
            <h3>{content.title}</h3>
            <p>{content.description}</p>
          </div>
          <span>{content.actionLabel}</span>
        </header>
        <div className={styles.rtpMetrics}>
          {content.metrics.map((metric) => (
            <PlatformMetricCard metric={metric} key={metric.label} />
          ))}
        </div>
        <section className={styles.payoutPanel}>
          <strong>{content.payoutTitle}</strong>
          <ul>
            {content.payouts.map((payout) => (
              <li className={styles[`tone--${payout.tone}`]} key={payout.label}>
                <span>{payout.label}</span>
                <b>
                  <span style={{ width: `${payout.value}%` }} />
                </b>
                <strong>{payout.value}%</strong>
              </li>
            ))}
          </ul>
        </section>
        <section className={styles.auditPanel}>
          <strong>{content.auditTitle}</strong>
          <ul>
            {content.audit.map((activity) => (
              <li
                className={styles[`tone--${activity.tone}`]}
                key={activity.label}
              >
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
      {panel}
    </PlatformVisual>
  );
}

export function PlatformRtpSection({ content }: { content: RtpContent }) {
  return (
    <section className={`${styles.rtp} scroll-reveal`} data-scroll-reveal>
      <div className="container">
        <div className={styles.sectionHeading}>
          <SectionHeading {...content.heading} />
        </div>
        <RtpPanel content={content.panel} />
      </div>
    </section>
  );
}
