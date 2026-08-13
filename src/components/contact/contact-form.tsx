"use client";

import { useEffect, useRef, useState } from "react";

import { trackAnalyticsEvent } from "@/components/analytics/analytics-consent";
import { TurnstileWidget } from "@/components/security/turnstile-widget";
import type { ContactStatusMessage, SiteContent } from "@/types/content";

type ContactFormContent = SiteContent["contactPage"]["form"];

interface ContactFormProps {
  content: ContactFormContent;
  requestedProject: string;
  status?: ContactStatusMessage;
}

function getStatusToneClass(tone: ContactStatusMessage["tone"]) {
  if (tone === "success") {
    return "border-success/35 bg-success/7 text-success";
  }

  if (tone === "warning") {
    return "border-warning/35 bg-warning/7 text-warning";
  }

  return "border-error/35 bg-error/7 text-error";
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
    <div className="scroll-mt-28 rounded-[26px] border border-line bg-[radial-gradient(circle_at_100%_100%,rgb(212_175_55/0.09),transparent_18rem),var(--color-surface)] p-5.5 shadow-panel sm:p-8.5" id="quote-form">
      <h2 className="text-4xl uppercase">{content.title}</h2>
      <p className="mt-3.5 max-w-130 text-sm leading-6 text-muted">{content.description}</p>

      {currentStatus ? (
        <div
          className={`mt-5 rounded-[10px] border px-3.5 py-3 text-xs ${getStatusToneClass(currentStatus.tone)}`}
          role="status"
          aria-live="polite"
        >
          {currentStatus.message}
        </div>
      ) : null}

      <form
        ref={formRef}
        className="mt-7 grid gap-5 [&_input]:w-full [&_input]:rounded-xl [&_input]:border [&_input]:border-line [&_input]:bg-canvas-soft [&_input]:text-ink [&_input]:transition [&_select]:w-full [&_select]:rounded-xl [&_select]:border [&_select]:border-line [&_select]:bg-canvas-soft [&_select]:text-ink [&_textarea]:w-full [&_textarea]:rounded-xl [&_textarea]:border [&_textarea]:border-line [&_textarea]:bg-canvas-soft [&_textarea]:text-ink"
        action="/api/contact"
        method="post"
        onSubmit={handleSubmit}
      >
        <div className="absolute left-[-10000px] size-px overflow-hidden" aria-hidden="true">
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

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 [&_label]:grid [&_label]:gap-2 [&_label>span]:text-xs [&_label>span]:font-bold [&_label>span]:tracking-[0.04em] [&_label>span]:text-ink-soft [&_label>span]:uppercase">
          <label>
            <span>{content.fields.name.label} *</span>
            <input
              className="min-h-12.5 px-3.5 focus:border-gold-bright focus:outline-none focus:ring-3 focus:ring-gold-bright/13"
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
              className="min-h-12.5 px-3.5 focus:border-gold-bright focus:outline-none focus:ring-3 focus:ring-gold-bright/13"
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

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 [&_label]:grid [&_label]:gap-2 [&_label>span]:text-xs [&_label>span]:font-bold [&_label>span]:tracking-[0.04em] [&_label>span]:text-ink-soft [&_label>span]:uppercase">
          <label>
            <span>{content.fields.company.label}</span>
            <input
              className="min-h-12.5 px-3.5 focus:border-gold-bright focus:outline-none focus:ring-3 focus:ring-gold-bright/13"
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
              className="min-h-12.5 px-3.5 focus:border-gold-bright focus:outline-none focus:ring-3 focus:ring-gold-bright/13"
              name="targetMarket"
              type="text"
              maxLength={160}
              placeholder={content.fields.targetMarket.placeholder}
            />
          </label>
        </div>

        <fieldset className="min-w-0 border-0 p-0">
          <legend className="mb-2 text-xs font-bold tracking-[0.04em] text-ink-soft uppercase">{content.fields.projectTypeLabel} *</legend>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {content.projectTypes.map((projectType) => (
              <label className="relative cursor-pointer" key={projectType}>
                <input
                  className="peer absolute size-px opacity-0"
                  name="service"
                  type="radio"
                  value={projectType}
                  defaultChecked={projectType === selectedProject}
                  required
                />
                <span className="flex min-h-11 items-center justify-center rounded-[10px] border border-line bg-canvas-soft px-3 py-2 text-center text-xs font-semibold leading-4 text-muted peer-checked:border-gold peer-checked:bg-gold-bright/9 peer-checked:text-gold-bright peer-focus-visible:outline-3 peer-focus-visible:outline-offset-3 peer-focus-visible:outline-gold-bright">{projectType}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 [&_label]:grid [&_label]:gap-2 [&_label>span]:text-xs [&_label>span]:font-bold [&_label>span]:tracking-[0.04em] [&_label>span]:text-ink-soft [&_label>span]:uppercase">
          <label>
            <span>{content.fields.budget.label}</span>
            <select className="min-h-12.5 px-3.5 focus:border-gold-bright focus:outline-none focus:ring-3 focus:ring-gold-bright/13" name="budget" defaultValue="">
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
              className="min-h-12.5 px-3.5 focus:border-gold-bright focus:outline-none focus:ring-3 focus:ring-gold-bright/13"
              name="timeline"
              type="text"
              maxLength={120}
              placeholder={content.fields.timeline.placeholder}
            />
          </label>
        </div>

        <label className="grid gap-2 [&>span]:text-xs [&>span]:font-bold [&>span]:tracking-[0.04em] [&>span]:text-ink-soft [&>span]:uppercase">
          <span>{content.fields.details.label} *</span>
          <textarea
            className="min-h-28 resize-y px-3.5 py-3 focus:border-gold-bright focus:outline-none focus:ring-3 focus:ring-gold-bright/13"
            name="message"
            rows={5}
            minLength={20}
            maxLength={3000}
            placeholder={content.fields.details.placeholder}
            required
          />
        </label>

        <label className="grid cursor-pointer grid-cols-[auto_1fr] items-start gap-2.5">
          <input className="mt-px! size-4.5! min-h-0! accent-gold" name="consent" type="checkbox" value="accepted" required />
          <span className="text-xs font-medium leading-5 text-muted">{content.consentLabel}</span>
        </label>

        <div className="grid gap-2">
          <TurnstileWidget
            onTokenChange={setTurnstileToken}
            resetSignal={resetSignal}
          />
          <input
            type="hidden"
            name="cf-turnstile-response"
            value={turnstileToken ?? ""}
          />
          <small className="text-[0.72rem] leading-5 text-muted">
            Protected by Cloudflare Turnstile. Verification tokens are checked
            by our server and cannot be reused.
          </small>
        </div>

        <button
          className="mt-px inline-flex min-h-13 w-full cursor-pointer items-center justify-center rounded-xl border border-transparent bg-linear-to-br from-gold-bright to-gold px-6 font-bold text-[#1b0c03] disabled:cursor-not-allowed disabled:opacity-55"
          type="submit"
          disabled={!turnstileToken || isSubmitting}
        >
          <span>{isSubmitting ? "Sending…" : content.submitLabel}</span>
        </button>
      </form>
    </div>
  );
}
