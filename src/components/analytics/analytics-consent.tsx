"use client";

import { GoogleAnalytics, sendGAEvent } from "@next/third-parties/google";
import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";

import styles from "./analytics-consent.module.css";

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

export function AnalyticsConsent() {
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
          className={styles.notice}
          role="dialog"
          aria-labelledby="cookie-notice-title"
          aria-describedby="cookie-notice-description"
        >
          <div>
            <h2 id="cookie-notice-title">Your privacy choices</h2>
            <p id="cookie-notice-description">
              We use optional Google Analytics cookies to understand site
              usage. Turnstile security and essential site functions do not
              depend on analytics consent. Read our{" "}
              <Link href="/privacy">privacy policy</Link>.
            </p>
          </div>
          <div className={styles.actions}>
            <button type="button" onClick={() => persistConsent("denied")}>
              Reject analytics
            </button>
            <button
              type="button"
              onClick={() => {
                setAnalyticsEnabled(false);
                setPreferencesOpen(true);
              }}
            >
              Manage preferences
            </button>
            <button
              className={styles.primaryAction}
              type="button"
              onClick={() => persistConsent("granted")}
            >
              Accept analytics
            </button>
          </div>
        </section>
      ) : null}

      {preferencesOpen ? (
        <section
          className={styles.preferences}
          role="dialog"
          aria-labelledby="cookie-preferences-title"
        >
          <div className={styles.preferencesHeader}>
            <div>
              <h2 id="cookie-preferences-title">Cookie preferences</h2>
              <p>Choose whether optional analytics may run on this device.</p>
            </div>
            {consent ? (
              <button
                className={styles.closeButton}
                type="button"
                onClick={() => setPreferencesOpen(false)}
                aria-label="Close cookie preferences"
              >
                ×
              </button>
            ) : null}
          </div>

          <div className={styles.preferenceRow}>
            <span>
              <strong>Necessary</strong>
              <small>Security, form delivery, and saved privacy choice.</small>
            </span>
            <span className={styles.alwaysOn}>Always on</span>
          </div>

          <label className={styles.preferenceRow}>
            <span>
              <strong>Google Analytics</strong>
              <small>Site usage and conversion measurement.</small>
            </span>
            <input
              type="checkbox"
              checked={analyticsEnabled}
              onChange={(event) => setAnalyticsEnabled(event.target.checked)}
            />
          </label>

          <div className={styles.preferencesFooter}>
            <Link href="/privacy">Privacy policy</Link>
            <button
              className={styles.primaryAction}
              type="button"
              onClick={() =>
                persistConsent(analyticsEnabled ? "granted" : "denied")
              }
            >
              Save preferences
            </button>
          </div>
        </section>
      ) : null}
    </>
  );
}
