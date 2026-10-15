"use client";

import { useEffect, useId, useRef, useState } from "react";

import { trackAnalyticsEvent } from "@/components/analytics/analytics-consent";
import { TurnstileWidget } from "@/components/security/turnstile-widget";
import { CONTACT_MAX_LENGTH, isValidContact } from "@/lib/contact-validation";
import type { ContactStatusMessage, SiteContent } from "@/types/content";

type ContactFormContent = SiteContent["contactPage"]["form"];

interface ContactFormProps {
  content: ContactFormContent;
  requestedProject: string;
  requestedService: string;
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
  requestedService,
  status,
}: ContactFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const contactRef = useRef<HTMLInputElement>(null);
  const statusRef = useRef<HTMLParagraphElement>(null);
  const submittingRef = useRef(false);
  const contactErrorId = useId();
  const [currentStatus, setCurrentStatus] =
    useState<ContactStatusMessage | undefined>(status);
  // Bumped for every message so a repeated one is announced and focused again.
  // It starts at 1 when the page loads with a result from a redirect.
  const [statusVersion, setStatusVersion] = useState(status ? 1 : 0);
  const [contactInvalid, setContactInvalid] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [resetSignal, setResetSignal] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Deep links name the service; older links may pass a service as the project.
  const selectedProject =
    [requestedService, requestedProject].find((value) =>
      content.projectValues.includes(value),
    ) ?? content.projectValues[0];

  useEffect(() => {
    const url = new URL(window.location.href);
    const params = ["project", "service", "status"];

    if (!params.some((param) => url.searchParams.has(param))) {
      return;
    }

    for (const param of params) {
      url.searchParams.delete(param);
    }
    window.history.replaceState(
      window.history.state,
      "",
      `${url.pathname}${url.search}${url.hash}`,
    );
  }, []);

  useEffect(() => {
    if (statusVersion > 0) {
      statusRef.current?.focus();
    }
  }, [statusVersion]);

  const showStatus = (nextStatus: ContactStatusMessage) => {
    setCurrentStatus(nextStatus);
    setStatusVersion((version) => version + 1);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // The button stays focusable while a request is in flight (aria-disabled
    // rather than disabled), so repeated submits are ignored here.
    if (submittingRef.current) {
      return;
    }

    if (!isValidContact(contactRef.current?.value ?? "")) {
      setContactInvalid(true);
      contactRef.current?.focus();
      return;
    }

    if (!turnstileToken) {
      showStatus(content.statusMessages.verification);
      return;
    }

    submittingRef.current = true;
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

      showStatus(nextStatus ?? content.statusMessages.error);

      if (response.ok && nextStatusCode === "success") {
        formRef.current?.reset();
        setContactInvalid(false);
        trackAnalyticsEvent("request_quote_submit", {
          form_location: "contact_page",
          submission_result: "success",
        });
      }

      setTurnstileToken(null);
      setResetSignal((signal) => signal + 1);
    } catch {
      showStatus(content.statusMessages.error);
      setTurnstileToken(null);
      setResetSignal((signal) => signal + 1);
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  const statusMessage = currentStatus ? (
    <p
      key={statusVersion}
      ref={statusRef}
      className={`mt-5 scroll-mt-28 rounded-[10px] border px-3.5 py-3 text-sm ${getStatusToneClass(currentStatus.tone)}`}
      tabIndex={-1}
    >
      {currentStatus.message}
    </p>
  ) : null;
  // Anything but success means the request was not delivered.
  const statusIsAlert =
    currentStatus !== undefined && currentStatus.tone !== "success";

  return (
    <div className="scroll-mt-28 rounded-[26px] border border-line bg-[radial-gradient(circle_at_100%_100%,rgb(212_175_55/0.09),transparent_18rem),var(--color-surface)] p-5.5 shadow-panel sm:p-8.5" id="quote-form">
      <h2 className=" heading-2">{content.title}</h2>
      <p className="mt-3.5 max-w-130 text-sm leading-6 text-muted">{content.description}</p>

      {/* Both live regions stay mounted: screen readers announce messages
          inserted into an existing region, not regions mounted with them. */}
      <div role="status" aria-live="polite">
        {statusIsAlert ? null : statusMessage}
      </div>
      <div role="alert">{statusIsAlert ? statusMessage : null}</div>

      <form
        ref={formRef}
        className="mt-7 grid gap-5"
        action="/api/contact"
        method="post"
        onSubmit={handleSubmit}
      >
        <input type="hidden" name="locale" value={content.locale} />
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

        <div className="field-row">
          <label>
            <span>{content.fields.name.label} *</span>
            <input
              className="form-field"
              name="name"
              type="text"
              autoComplete="name"
              minLength={2}
              maxLength={100}
              placeholder={content.fields.name.placeholder}
              required
            />
          </label>
          <div className="grid content-start gap-2">
            <label>
              <span>{content.fields.contact.label} *</span>
              <input
                ref={contactRef}
                className="form-field aria-invalid:border-error"
                name="contact"
                type="text"
                autoComplete="email"
                inputMode="email"
                maxLength={CONTACT_MAX_LENGTH}
                placeholder={content.fields.contact.placeholder}
                required
                aria-invalid={contactInvalid}
                aria-describedby={contactInvalid ? contactErrorId : undefined}
                onBlur={(event) => {
                  const { value } = event.currentTarget;
                  setContactInvalid(value.trim() !== "" && !isValidContact(value));
                }}
                onChange={(event) => {
                  if (contactInvalid) {
                    setContactInvalid(!isValidContact(event.currentTarget.value));
                  }
                }}
              />
            </label>
            {contactInvalid ? (
              <p className="text-sm leading-5 text-error" id={contactErrorId}>
                {content.fields.contact.error}
              </p>
            ) : null}
          </div>
        </div>

        <div className="field-row">
          <label>
            <span>{content.fields.company.label}</span>
            <input
              className="form-field"
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
              className="form-field"
              name="targetMarket"
              type="text"
              maxLength={160}
              placeholder={content.fields.targetMarket.placeholder}
            />
          </label>
        </div>

        <fieldset className="min-w-0 border-0 p-0">
          <legend className="mb-2 text-sm font-bold tracking-[0.04em] text-ink-soft uppercase">{content.fields.projectTypeLabel} *</legend>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {content.projectTypes.map((projectType, index) => (
              <label className="relative cursor-pointer" key={projectType}>
                <input
                  className="peer absolute size-px opacity-0"
                  name="service"
                  type="radio"
                  value={content.projectValues[index]}
                  defaultChecked={content.projectValues[index] === selectedProject}
                  required
                />
                <span className="flex min-h-11 items-center justify-center rounded-[10px] border border-line bg-canvas-soft px-3 py-2 text-center text-sm font-semibold leading-4 text-muted peer-checked:border-gold peer-checked:bg-gold-bright/9 peer-checked:text-gold-bright peer-focus-visible:outline-3 peer-focus-visible:outline-offset-3 peer-focus-visible:outline-gold-bright">{projectType}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="field-row">
          <label>
            <span>{content.fields.budget.label}</span>
            <select className="form-field" name="budget" defaultValue="">
              <option value="" disabled>
                {content.fields.budget.placeholder}
              </option>
              {content.budgetOptions.map((option, index) => (
                <option key={option} value={content.budgetValues[index]}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>{content.fields.timeline.label}</span>
            <input
              className="form-field"
              name="timeline"
              type="text"
              maxLength={120}
              placeholder={content.fields.timeline.placeholder}
            />
          </label>
        </div>

        <label className="field-label">
          <span>{content.fields.details.label} *</span>
          <textarea
            className="form-field min-h-28 resize-y"
            name="message"
            rows={5}
            minLength={20}
            maxLength={3000}
            placeholder={content.fields.details.placeholder}
            required
          />
        </label>

        <label className="grid cursor-pointer grid-cols-[auto_1fr] items-start gap-2.5">
          <input className="mt-1 size-5 shrink-0 accent-gold" name="consent" type="checkbox" value="accepted" required />
          <span className="text-sm font-medium leading-5 text-muted">{content.consentLabel}</span>
        </label>

        <div className="grid gap-2">
          <TurnstileWidget
            locale={content.locale}
            unavailableLabel={content.verificationUnavailable}
            onTokenChange={setTurnstileToken}
            resetSignal={resetSignal}
          />
          <input
            type="hidden"
            name="cf-turnstile-response"
            value={turnstileToken ?? ""}
          />
          <small className="text-sm leading-5 text-muted">
            {content.verificationLabel}
          </small>
        </div>

        <button
          className="button button-primary w-full"
          type="submit"
          aria-disabled={!turnstileToken || isSubmitting}
        >
          <span>{isSubmitting ? content.sendingLabel : content.submitLabel}</span>
        </button>
      </form>
    </div>
  );
}
