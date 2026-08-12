import Link from "next/link";

import type {
  AnalyticsEventName,
} from "@/components/analytics/analytics-consent";

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
  const classes = `button button--${variant} ${className}`.trim();
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
