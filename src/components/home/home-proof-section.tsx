import type { SiteContent } from "@/types/content";

interface HomeProofSectionProps {
  ariaLabel: string;
  points: SiteContent["home"]["proofPoints"];
}

export function HomeProofSection({ ariaLabel, points }: HomeProofSectionProps) {
  return (
    <section className="home-proof" aria-label={ariaLabel}>
      <div className="container home-proof__grid">
        {points.map((point) => (
          <div key={point.number}>
            <span>{point.number}</span>
            <p>{point.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
