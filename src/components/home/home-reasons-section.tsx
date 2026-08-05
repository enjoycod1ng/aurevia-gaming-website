import type { SiteContent } from "@/types/content";

type HomeReasonsContent = SiteContent["home"]["reasons"];

export function HomeReasonsSection({ content }: { content: HomeReasonsContent }) {
  return (
    <section className="home-section home-reasons">
      <div className="container">
        <div className="home-section-heading">
          <p className="home-kicker">{content.heading.label}</p>
          <h2>{content.heading.title}</h2>
          <p>{content.heading.description}</p>
        </div>
        <div className="home-reason-grid">
          {content.items.map((reason) => (
            <article key={reason.number}>
              <span>{reason.number}</span>
              <h3>{reason.title}</h3>
              <p>{reason.description}</p>
              <strong>{reason.result}</strong>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
