import Link from "next/link";

import type { AnalyticsEventName } from "@/components/analytics/analytics-consent";

interface ButtonLinkProps {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
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

  if (/^(?:\/(?:en|es|pt))?\/contact(?:\?|$)/.test(href)) {
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
      "button-primary",
    secondary:
      "button-secondary",
  } as const;
  const classes = [
    "button",
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
