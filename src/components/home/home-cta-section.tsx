import { ButtonLink } from "@/components/button-link";
import type { ProjectCta } from "@/types/content";

interface HomeCtaSectionProps {
  content: ProjectCta;
  className?: string;
}

export function HomeCtaSection({
  content,
  className = "",
}: HomeCtaSectionProps) {
  return (
    <section
      className={`scroll-reveal pb-10 md:pb-16 ${className}`.trim()}
      data-scroll-reveal
    >
      <div className="container">
        <div className="grid min-h-95 grid-cols-1 items-center gap-11 overflow-hidden rounded-[26px] border border-[#6f5518] bg-[radial-gradient(circle_at_93%_10%,rgb(212_175_55/0.3),transparent_28%),linear-gradient(110deg,#2c2109,#080c12_76%)] px-6.5 py-10 md:px-13.5 md:py-15 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-20">
          <div>
            <h2 className="max-w-175 text-4xl leading-[1.08] uppercase md:text-5xl">{content.title}</h2>
            <p className="mt-7 max-w-162.5 text-base leading-[1.65] text-muted">{content.description}</p>
          </div>
          <div className="grid justify-items-start gap-4.5 lg:justify-items-center">
            <ButtonLink className="w-full min-w-55 xs:w-auto" href={content.primaryAction.href}>
              {content.primaryAction.label}
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}
