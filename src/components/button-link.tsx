import Link from "next/link";

import type { AnalyticsEventName } from "@/components/analytics/analytics-consent";

interface ButtonLinkProps {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "text";
  external?: boolean;
  ariaLabel?: string;
  className?: string;
  analyticsEvent?: AnalyticsEventName;
  analyticsLabel?: string;
}

function inferAnalyticsEvent(href: string): AnalyticsEventName | undefined {
  if (href.startsWith("https://t.me/")) {
    return "telegram_click";
  }

  if (href.startsWith("https://wa.me/")) {
    return "whatsapp_click";
  }

  if (href.startsWith("tel:")) {
    return "phone_click";
  }

  if (href === "/contact" || href.startsWith("/contact?")) {
    return "request_quote_click";
  }

  return undefined;
}

export function ButtonLink({
  href,
  children,
  variant = "primary",
  external = false,
  ariaLabel,
  className = "",
  analyticsEvent,
  analyticsLabel,
}: ButtonLinkProps) {
  const variantClasses = {
    primary:
      "border-transparent bg-linear-to-br from-gold-bright to-gold text-white shadow-[0_12px_34px_rgb(205_164_52/0.18)]",
    secondary:
      "border-line-strong bg-white/3 text-ink hover:border-gold-bright/60 hover:bg-gold/8",
    text: "min-h-0 border-transparent bg-transparent px-0 py-2 text-gold-bright shadow-none hover:text-ink",
  } as const;
  const classes = [
    "inline-flex min-h-13 cursor-pointer appearance-none items-center justify-center gap-3 rounded-xl border px-6 font-sans text-base font-bold leading-none transition duration-160 hover:-translate-y-0.5",
    variantClasses[variant],
    className,
  ]
    .filter(Boolean)
    .join(" ");
  const isExternal = external || /^https?:\/\//.test(href);
  const trackedEvent = analyticsEvent ?? inferAnalyticsEvent(href);

  if (isExternal) {
    return (
      <a
        className={classes}
        href={href}
        target="_blank"
        rel="noreferrer"
        aria-label={ariaLabel}
        data-analytics-event={trackedEvent}
        data-analytics-label={analyticsLabel}
      >
        <span>{children}</span>
      </a>
    );
  }

  return (
    <Link
      className={classes}
      href={href}
      aria-label={ariaLabel}
      data-analytics-event={trackedEvent}
      data-analytics-label={analyticsLabel}
    >
      <span>{children}</span>
    </Link>
  );
}
