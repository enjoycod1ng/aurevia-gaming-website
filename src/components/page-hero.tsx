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
  secondaryAction,
}: PageHeroProps) {
  return (
    <section className="border-b border-line bg-[radial-gradient(circle_at_88%_0%,rgb(205_164_52/0.13),transparent_30rem)] py-20 md:py-28">
      <div className="container mx-auto max-w-265 text-center">
        <p className="mb-5 text-xs font-extrabold tracking-[0.17em] text-gold-bright uppercase">{label}</p>
        <h1 className="text-5xl md:text-7xl">{title}</h1>
        <p className="mx-auto mt-7 max-w-205 text-xl text-ink-soft">{description}</p>
        {primaryAction || secondaryAction ? (
          <div className="mt-8.5 flex flex-col justify-center gap-3 xs:flex-row">
            {primaryAction ? (
              <ButtonLink href={primaryAction.href}>
                {primaryAction.label}
              </ButtonLink>
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
