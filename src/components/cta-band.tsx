import { ButtonLink } from "@/components/button-link";
import { siteContent } from "@/content/site-content";

interface CtaBandProps {
  title?: string;
  description?: string;
}

export function CtaBand({
  title = "Ready to turn the product brief into a working build?",
  description = "Share the scope, target platforms and integrations. We will use that context to plan the first technical conversation.",
}: CtaBandProps) {
  return (
    <section className="section section--compact">
      <div className="container">
        <div className="cta-band">
          <div>
            <p className="eyebrow">Start a project</p>
            <h2>{title}</h2>
            <p>{description}</p>
          </div>
          <div className="button-row">
            <ButtonLink href={siteContent.primaryCta.href}>
              {siteContent.primaryCta.label}
            </ButtonLink>
            <ButtonLink
              href={siteContent.secondaryCta.href}
              variant="secondary"
              external
              ariaLabel={siteContent.secondaryCta.ariaLabel}
            >
              Telegram
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}
