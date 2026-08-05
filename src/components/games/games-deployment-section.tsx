import type { SiteContent } from "@/types/content";

import styles from "./games-page.module.css";

type DeploymentContent = SiteContent["gamesPage"]["deployment"];

export function GamesDeploymentSection({ content }: { content: DeploymentContent }) {
  return (
    <section className={styles.deployment}>
      <div className="container">
        <div className={styles.sectionHeading}>
          <p className={styles.kicker}>{content.label}</p>
          <h2>{content.title}</h2>
          <p>{content.description}</p>
        </div>
        <ul className={styles.capabilities} aria-label={content.capabilitiesAriaLabel}>
          {content.capabilities.map((capability, index) => (
            <li className={index === 0 ? styles.highlightedCapability : undefined} key={capability}>
              {capability}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
