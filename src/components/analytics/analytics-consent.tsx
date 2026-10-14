"use client";

import { GoogleAnalytics, sendGAEvent } from "@next/third-parties/google";
import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";

import type { UiContent } from "@/content/ui-content";
import { localizedPath, type Locale } from "@/lib/i18n";

const consentStorageKey = "aurevia.analytics-consent.v1";
const preferencesEventName = "aurevia:open-cookie-preferences";
const consentChangedEventName = "aurevia:analytics-consent-changed";

type AnalyticsConsentValue = "granted" | "denied";

export type AnalyticsEventName =
  | "demo_request_click"
  | "phone_click"
  | "request_quote_click"
  | "request_quote_submit"
  | "telegram_click"
  | "whatsapp_click";

function readStoredConsent(): AnalyticsConsentValue | null {
  try {
    const stored = window.localStorage.getItem(consentStorageKey);
    return stored === "granted" || stored === "denied" ? stored : null;
  } catch {
    return null;
  }
}

function subscribeToConsent(onStoreChange: () => void) {
  const handleStorage = (event: StorageEvent) => {
    if (event.key === consentStorageKey) {
      onStoreChange();
    }
  };

  window.addEventListener(consentChangedEventName, onStoreChange);
  window.addEventListener("storage", handleStorage);

  return () => {
    window.removeEventListener(consentChangedEventName, onStoreChange);
    window.removeEventListener("storage", handleStorage);
  };
}

function subscribeToHydration() {
  return () => undefined;
}

function setGaDisabled(gaId: string, disabled: boolean) {
  const gaWindow = window as typeof window & Record<string, unknown>;
  gaWindow[`ga-disable-${gaId}`] = disabled;
}

function removeAnalyticsCookies() {
  const cookieNames = document.cookie
    .split(";")
    .map((cookie) => cookie.split("=")[0]?.trim())
    .filter((name): name is string => Boolean(name && /^_ga(?:_|$)/.test(name)));

  const hostname = window.location.hostname;
  const domainParts = hostname.split(".");
  const registrableDomain =
    domainParts.length > 1 ? domainParts.slice(-2).join(".") : hostname;
  const domains = ["", hostname, `.${hostname}`, `.${registrableDomain}`];

  for (const name of cookieNames) {
    for (const domain of new Set(domains)) {
      document.cookie = `${name}=; Max-Age=0; Path=/${
        domain ? `; Domain=${domain}` : ""
      }; SameSite=Lax`;
    }
  }
}

export function trackAnalyticsEvent(
  eventName: AnalyticsEventName,
  parameters: Record<string, string> = {},
) {
  if (
    typeof window === "undefined" ||
    readStoredConsent() !== "granted" ||
    !window.dataLayer
  ) {
    return;
  }

  sendGAEvent("event", eventName, parameters);
}

export function openCookiePreferences() {
  window.dispatchEvent(new Event(preferencesEventName));
}

export function AnalyticsConsent({ ui, locale }: { ui: UiContent; locale: Locale }) {
  const configuredGaId = process.env.NEXT_PUBLIC_GA_ID?.trim();
  const gaId =
    configuredGaId && /^G-[A-Z0-9]+$/.test(configuredGaId)
      ? configuredGaId
      : undefined;
  const consent = useSyncExternalStore(
    subscribeToConsent,
    readStoredConsent,
    () => null,
  );
  const hydrated = useSyncExternalStore(
    subscribeToHydration,
    () => true,
    () => false,
  );
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);

  useEffect(() => {
    if (!gaId) {
      return;
    }

    const openPreferences = () => {
      const current = readStoredConsent();
      setAnalyticsEnabled(current === "granted");
      setPreferencesOpen(true);
    };

    window.addEventListener(preferencesEventName, openPreferences);
    return () => {
      window.removeEventListener(preferencesEventName, openPreferences);
    };
  }, [gaId]);

  useEffect(() => {
    if (!gaId) {
      return;
    }

    const disabled = consent !== "granted";
    setGaDisabled(gaId, disabled);

    if (disabled) {
      removeAnalyticsCookies();
    }
  }, [consent, gaId]);

  useEffect(() => {
    if (!gaId || consent !== "granted") {
      return;
    }

    const trackMarkedInteraction = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }

      const markedElement = target.closest<HTMLElement>(
        "[data-analytics-event]",
      );
      const eventName = markedElement?.dataset.analyticsEvent as
        | AnalyticsEventName
        | undefined;

      if (!markedElement || !eventName) {
        return;
      }

      trackAnalyticsEvent(eventName, {
        interaction_location: window.location.pathname,
        ...(markedElement.dataset.analyticsLabel
          ? { item_label: markedElement.dataset.analyticsLabel }
          : {}),
      });
    };

    document.addEventListener("click", trackMarkedInteraction);
    return () => {
      document.removeEventListener("click", trackMarkedInteraction);
    };
  }, [consent, gaId]);

  if (!gaId) {
    return null;
  }

  const persistConsent = (value: AnalyticsConsentValue) => {
    try {
      window.localStorage.setItem(consentStorageKey, value);
    } catch {
      // Privacy-safe fallback: analytics remains disabled without storage.
    }

    setGaDisabled(gaId, value !== "granted");
    if (value === "denied") {
      removeAnalyticsCookies();
    }

    setAnalyticsEnabled(value === "granted");
    setPreferencesOpen(false);
    window.dispatchEvent(new Event(consentChangedEventName));
  };

  return (
    <>
      {consent === "granted" ? <GoogleAnalytics gaId={gaId} /> : null}

      {hydrated && !consent && !preferencesOpen ? (
        <section
          className="fixed right-6 bottom-6 left-6 z-1000 mx-auto w-[min(760px,calc(100%-48px))] rounded-[18px] border border-line-strong bg-surface p-6 text-ink shadow-[0_24px_80px_rgb(0_0_0/0.55)] max-sm:right-3 max-sm:bottom-3 max-sm:left-3 max-sm:w-[calc(100%-24px)] max-sm:p-5"
          role="dialog"
          aria-labelledby="cookie-notice-title"
          aria-describedby="cookie-notice-description"
        >
          <div>
            <h2 className="text-base " id="cookie-notice-title">{ui.cookieTitle}</h2>
            <p className="mt-2.5 text-sm leading-5 text-muted" id="cookie-notice-description">
              {ui.cookieDescription}{" "}
              <Link className="text-gold-bright underline underline-offset-3" href={localizedPath("/privacy", locale)}>{ui.privacy}</Link>.
            </p>
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-2.5 max-sm:flex-col max-sm:items-stretch [&_button]:min-h-11 [&_button]:cursor-pointer [&_button]:rounded-[10px] [&_button]:border [&_button]:border-line-strong [&_button]:bg-surface [&_button]:px-4 [&_button]:text-sm [&_button]:font-bold [&_button]:text-ink">
            <button type="button" onClick={() => persistConsent("denied")}>
              {ui.rejectAnalytics}
            </button>
            <button
              type="button"
              onClick={() => {
                setAnalyticsEnabled(false);
                setPreferencesOpen(true);
              }}
            >
              {ui.managePreferences}
            </button>
            <button
              className="!border-gold !bg-action !text-action-ink"
              type="button"
              onClick={() => persistConsent("granted")}
            >
              {ui.acceptAnalytics}
            </button>
          </div>
        </section>
      ) : null}

      {preferencesOpen ? (
        <section
          className="fixed bottom-6 left-1/2 z-1000 w-[min(580px,calc(100%-48px))] -translate-x-1/2 rounded-[18px] border border-line-strong bg-surface p-6 text-ink shadow-[0_24px_80px_rgb(0_0_0/0.55)] max-sm:right-3 max-sm:bottom-3 max-sm:left-3 max-sm:w-[calc(100%-24px)] max-sm:translate-x-0 max-sm:p-5"
          role="dialog"
          aria-labelledby="cookie-preferences-title"
        >
          <div className="flex items-center justify-between gap-6">
            <div>
              <h2 className="text-base " id="cookie-preferences-title">{ui.cookiePreferences}</h2>
              <p className="mt-2 text-sm leading-5 text-muted">{ui.preferencesDescription}</p>
            </div>
            {consent ? (
              <button
                className="size-11 shrink-0 cursor-pointer rounded-full border border-line bg-transparent text-2xl text-muted"
                type="button"
                onClick={() => setPreferencesOpen(false)}
                aria-label={ui.closePreferences}
              >
                ×
              </button>
            ) : null}
          </div>

          <div className="mt-5 flex items-center justify-between gap-6 border-t border-line py-4.5">
            <span className="grid gap-1">
              <strong>{ui.necessary}</strong>
              <small className="text-sm leading-5 text-muted">{ui.necessaryDescription}</small>
            </span>
            <span className="whitespace-nowrap text-sm font-bold text-success">{ui.alwaysOn}</span>
          </div>

          <label className="flex items-center justify-between gap-6 border-t border-line py-4.5">
            <span className="grid gap-1">
              <strong>Google Analytics</strong>
              <small className="text-sm leading-5 text-muted">{ui.analyticsDescription}</small>
            </span>
            <input
              className="size-5.5 shrink-0 accent-gold"
              type="checkbox"
              checked={analyticsEnabled}
              onChange={(event) => setAnalyticsEnabled(event.target.checked)}
            />
          </label>

          <div className="flex items-center justify-between gap-6 border-t border-line pt-4.5 max-sm:flex-col max-sm:items-stretch">
            <Link className="text-gold-bright underline underline-offset-3 max-sm:text-center" href={localizedPath("/privacy", locale)}>{ui.privacy}</Link>
            <button
              className="min-h-11 cursor-pointer rounded-[10px] border border-gold bg-action px-4 text-sm font-bold text-action-ink"
              type="button"
              onClick={() =>
                persistConsent(analyticsEnabled ? "granted" : "denied")
              }
            >
              {ui.savePreferences}
            </button>
          </div>
        </section>
      ) : null}
    </>
  );
}
