import { ButtonLink } from "@/components/button-link";
import { OperatorDashboard } from "@/components/home/operator-dashboard";
import type { SiteContent } from "@/types/content";

type HomePlatformContent = SiteContent["home"]["platform"];

export function HomePlatformSection({
  content,
}: {
  content: HomePlatformContent;
}) {
  return (
    <section className="home-section home-platform scroll-reveal" data-scroll-reveal>
      <div className="container home-platform__grid">
        <div className="home-platform__content">
          <p className="home-kicker">{content.heading.label}</p>
          <h2>
            {content.heading.title}
            <span>{content.highlightedTitle}</span>
          </h2>
          <p>{content.heading.description}</p>
          <ButtonLink href={content.action.href}>
            {content.action.label}
          </ButtonLink>
          <ul>
            {content.features.map((item) => (
              <li key={item}>
                <span aria-hidden="true">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
        <OperatorDashboard content={content.dashboard} />
      </div>
    </section>
  );
}
