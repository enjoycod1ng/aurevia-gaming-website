import { ButtonLink } from "@/components/button-link";
import type { SiteContent } from "@/types/content";

type HomeDemosContent = SiteContent["home"]["demos"];

export function HomeDemosSection({ content }: { content: HomeDemosContent }) {
  return (
    <section className="home-section home-demos">
      <div className="container">
        <div className="home-section-heading">
          <p className="home-kicker">{content.heading.label}</p>
          <h2>{content.heading.title}</h2>
          <p>{content.heading.description}</p>
        </div>
        <div className="home-demo-grid">
          {content.items.map((demo) => (
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
  );
}
