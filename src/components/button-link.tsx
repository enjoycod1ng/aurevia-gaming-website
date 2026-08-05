import Link from "next/link";

interface ButtonLinkProps {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "text";
  external?: boolean;
  ariaLabel?: string;
  className?: string;
}

export function ButtonLink({
  href,
  children,
  variant = "primary",
  external = false,
  ariaLabel,
  className = "",
}: ButtonLinkProps) {
  const classes = `button button--${variant} ${className}`.trim();
  const isExternal = external || /^https?:\/\//.test(href);

  if (isExternal) {
    return (
      <a
        className={classes}
        href={href}
        target="_blank"
        rel="noreferrer"
        aria-label={ariaLabel}
      >
        <span>{children}</span>
      </a>
    );
  }

  return (
    <Link className={classes} href={href} aria-label={ariaLabel}>
      <span>{children}</span>
    </Link>
  );
}
