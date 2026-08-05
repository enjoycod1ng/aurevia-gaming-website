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

export function ContactForm({ content, requestedProject, status }: ContactFormProps) {
  const selectedProject = content.projectTypes.includes(requestedProject)
    ? requestedProject
    : content.projectTypes[0];

  return (
    <div className={styles.formPanel} id="quote-form">
      <h2>{content.title}</h2>
      <p className={styles.formDescription}>{content.description}</p>

      {status ? (
        <div
          className={`${styles.formStatus} ${getStatusToneClass(status.tone)}`}
          role="status"
          aria-live="polite"
        >
          {status.message}
        </div>
      ) : null}

      <form className={styles.form} action="/api/contact" method="post">
        <div className={styles.honeypot} aria-hidden="true">
          <label htmlFor="website">Website</label>
          <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
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
            maxLength={4000}
            placeholder={content.fields.details.placeholder}
            required
          />
        </label>

        <label className={styles.consent}>
          <input name="consent" type="checkbox" value="accepted" required />
          <span>{content.consentLabel}</span>
        </label>

        <button className={`button button--primary ${styles.submitButton}`} type="submit">
          <span>{content.submitLabel}</span>
        </button>
      </form>
    </div>
  );
}
