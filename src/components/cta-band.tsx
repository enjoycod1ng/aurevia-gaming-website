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
    <section className="pt-6 pb-16">
      <div className="container">
        <div className="flex min-h-87.5 flex-col items-start justify-between gap-12 overflow-hidden rounded-panel border border-gold-bright/30 bg-[radial-gradient(circle_at_92%_0%,rgb(231_195_90/0.2),transparent_34%),linear-gradient(135deg,#211c12,#13110c_70%)] p-8 shadow-panel md:p-16 lg:flex-row lg:items-center">
          <div>
            <p className="mb-5 text-xs font-extrabold tracking-[0.17em] text-gold-bright uppercase">Start a project</p>
            <h2 className="max-w-190 text-4xl uppercase md:text-5xl">{title}</h2>
            <p className="mt-5 max-w-162.5 text-ink-soft">{description}</p>
          </div>
          <div className="flex shrink-0 flex-col gap-3 xs:flex-row">
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
