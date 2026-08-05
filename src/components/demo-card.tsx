import { ButtonLink } from "@/components/button-link";
import { MediaFrame } from "@/components/media-frame";
import type { DemoItem } from "@/types/content";

interface DemoCardProps {
  demo: DemoItem;
}

export function DemoCard({ demo }: DemoCardProps) {
  return (
    <article className="demo-card">
      <MediaFrame image={demo.image} sizes="(max-width: 760px) 100vw, 50vw" />
      <div className="demo-card__body">
        <p className="demo-card__category">{demo.category}</p>
        <h3>{demo.title}</h3>
        <p>{demo.description}</p>
        <ul className="tag-list" aria-label={`${demo.title} features`}>
          {demo.tags.map((tag) => (
            <li key={tag}>{tag}</li>
          ))}
        </ul>
        {demo.demoUrl ? (
          <ButtonLink href={demo.demoUrl} external variant="secondary">
            Open live demo
          </ButtonLink>
        ) : (
          <ButtonLink href={`/contact?project=${encodeURIComponent(demo.title)}`} variant="text">
            Request demo access
          </ButtonLink>
        )}
      </div>
    </article>
  );
}
