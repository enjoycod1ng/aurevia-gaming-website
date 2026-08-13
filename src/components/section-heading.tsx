interface SectionHeadingProps {
  label: string;
  title: string;
  description?: string;
  align?: "left" | "center";
}

export function SectionHeading({
  label,
  title,
  description,
  align = "left",
}: SectionHeadingProps) {
  const centered = align === "center";

  return (
    <div className={centered ? "mx-auto max-w-190 text-center" : "max-w-190"}>
      <p className="mb-8 inline-flex min-h-10 w-fit items-center justify-center rounded-full border border-line-strong bg-surface-strong px-5 text-xs font-extrabold tracking-[0.04em] text-gold-bright uppercase">
        {label}
      </p>
      <h2 className="text-4xl leading-[1.08] uppercase md:text-5xl">{title}</h2>
      {description ? (
        <p
          className={`mt-5 max-w-210 text-base leading-[1.65] text-muted ${centered ? "mx-auto" : ""}`}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}
