"use client";

import { useEffect, useRef, useState } from "react";

import { trackAnalyticsEvent } from "@/components/analytics/analytics-consent";
import { TurnstileWidget } from "@/components/security/turnstile-widget";
import type { ContactStatusMessage, SiteContent } from "@/types/content";

import styles from "./contact-page.module.css";

type ContactFormContent = SiteContent["contactPage"]["form"];

interface ContactFormProps {
  content: ContactFormContent;
  requestedProject: string;
  status?: ContactStatusMessage;
}

function getStatusToneClass(tone: ContactStatusMessage["tone"]) {
  if (tone === "success") {
    return styles.statusSuccess;
  }

  if (tone === "warning") {
    return styles.statusWarning;
  }

  return styles.statusError;
}

export function ContactForm({
  content,
  requestedProject,
  status,
}: ContactFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [currentStatus, setCurrentStatus] =
    useState<ContactStatusMessage | undefined>(status);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [resetSignal, setResetSignal] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const selectedProject = content.projectTypes.includes(requestedProject)
    ? requestedProject
    : content.projectTypes[0];

  useEffect(() => {
    const url = new URL(window.location.href);

    if (!url.searchParams.has("project") && !url.searchParams.has("status")) {
      return;
    }

    url.searchParams.delete("project");
    url.searchParams.delete("status");
    window.history.replaceState(
      window.history.state,
      "",
      `${url.pathname}${url.search}${url.hash}`,
    );
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!turnstileToken || isSubmitting) {
      setCurrentStatus(content.statusMessages.verification);
      return;
    }

    setIsSubmitting(true);
    setCurrentStatus(undefined);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "X-Requested-With": "fetch",
        },
        body: new FormData(event.currentTarget),
      });
      const result = (await response.json().catch(() => null)) as {
        status?: string;
      } | null;
      const nextStatusCode = result?.status ?? "error";
      const nextStatus = content.statusMessages[nextStatusCode];

      setCurrentStatus(nextStatus ?? content.statusMessages.error);

      if (response.ok && nextStatusCode === "success") {
        formRef.current?.reset();
        trackAnalyticsEvent("request_quote_submit", {
          form_location: "contact_page",
          submission_result: "success",
        });
      }

      setTurnstileToken(null);
      setResetSignal((signal) => signal + 1);
    } catch {
      setCurrentStatus(content.statusMessages.error);
      setTurnstileToken(null);
      setResetSignal((signal) => signal + 1);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.formPanel} id="quote-form">
      <h2>{content.title}</h2>
      <p className={styles.formDescription}>{content.description}</p>

      {currentStatus ? (
        <div
          className={`${styles.formStatus} ${getStatusToneClass(currentStatus.tone)}`}
          role="status"
          aria-live="polite"
        >
          {currentStatus.message}
        </div>
      ) : null}

      <form
        ref={formRef}
        className={styles.form}
        action="/api/contact"
        method="post"
        onSubmit={handleSubmit}
      >
        <div className={styles.honeypot} aria-hidden="true">
          <label htmlFor="website">Website</label>
          <input
            id="website"
            name="website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
          />
        </div>

        {requestedProject ? (
          <input name="project" type="hidden" value={requestedProject} />
        ) : null}

        <div className={styles.formRow}>
          <label>
            <span>{content.fields.name.label} *</span>
            <input
              name="name"
              type="text"
              autoComplete="name"
              minLength={2}
              maxLength={100}
              placeholder={content.fields.name.placeholder}
              required
            />
          </label>
          <label>
            <span>{content.fields.contact.label} *</span>
            <input
              name="contact"
              type="text"
              autoComplete="email"
              inputMode="email"
              maxLength={160}
              placeholder={content.fields.contact.placeholder}
              required
            />
          </label>
        </div>

        <div className={styles.formRow}>
          <label>
            <span>{content.fields.company.label}</span>
            <input
              name="company"
              type="text"
              autoComplete="organization"
              maxLength={140}
              placeholder={content.fields.company.placeholder}
            />
          </label>
          <label>
            <span>{content.fields.targetMarket.label}</span>
            <input
              name="targetMarket"
              type="text"
              maxLength={160}
              placeholder={content.fields.targetMarket.placeholder}
            />
          </label>
        </div>

        <fieldset className={styles.projectTypes}>
          <legend>{content.fields.projectTypeLabel} *</legend>
          <div className={styles.projectTypeGrid}>
            {content.projectTypes.map((projectType) => (
              <label key={projectType}>
                <input
                  name="service"
                  type="radio"
                  value={projectType}
                  defaultChecked={projectType === selectedProject}
                  required
                />
                <span>{projectType}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className={styles.formRow}>
          <label>
            <span>{content.fields.budget.label}</span>
            <select name="budget" defaultValue="">
              <option value="" disabled>
                {content.fields.budget.placeholder}
              </option>
              {content.budgetOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>{content.fields.timeline.label}</span>
            <input
              name="timeline"
              type="text"
              maxLength={120}
              placeholder={content.fields.timeline.placeholder}
            />
          </label>
        </div>

        <label>
          <span>{content.fields.details.label} *</span>
          <textarea
            name="message"
            rows={5}
            minLength={20}
            maxLength={3000}
            placeholder={content.fields.details.placeholder}
            required
          />
        </label>

        <label className={styles.consent}>
          <input name="consent" type="checkbox" value="accepted" required />
          <span>{content.consentLabel}</span>
        </label>

        <div className={styles.turnstileField}>
          <TurnstileWidget
            onTokenChange={setTurnstileToken}
            resetSignal={resetSignal}
          />
          <input
            type="hidden"
            name="cf-turnstile-response"
            value={turnstileToken ?? ""}
          />
          <small>
            Protected by Cloudflare Turnstile. Verification tokens are checked
            by our server and cannot be reused.
          </small>
        </div>

        <button
          className={`button button--primary ${styles.submitButton}`}
          type="submit"
          disabled={!turnstileToken || isSubmitting}
        >
          <span>{isSubmitting ? "Sending…" : content.submitLabel}</span>
        </button>
      </form>
    </div>
  );
}
