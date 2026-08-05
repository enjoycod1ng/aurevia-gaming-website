import { ButtonLink } from "@/components/button-link";

interface PageHeroProps {
  label: string;
  title: string;
  description: string;
  primaryAction?: {
    label: string;
    href: string;
  };
  secondaryAction?: {
    label: string;
    href: string;
    external?: boolean;
  };
}

export function PageHero({
  label,
  title,
  description,
  primaryAction,
  secondaryAction
}: PageHeroProps) {
  return (
    <section className="page-hero">
      <div className="container page-hero__inner">
        <p className="eyebrow">{label}</p>
        <h1>{title}</h1>
        <p className="page-hero__description">{description}</p>
        {primaryAction || secondaryAction ? (
          <div className="button-row">
            {primaryAction ? (
              <ButtonLink href={primaryAction.href}>{primaryAction.label}</ButtonLink>
            ) : null}
            {secondaryAction ? (
              <ButtonLink
                href={secondaryAction.href}
                variant="secondary"
                external={secondaryAction.external}
              >
                {secondaryAction.label}
              </ButtonLink>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}
