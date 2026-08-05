import { PageHero } from "@/components/page-hero";
import { siteContent } from "@/content/site-content";
import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata(siteContent.seo.contact);

interface ContactPageProps {
  searchParams: Promise<{
    status?: string;
    project?: string;
  }>;
}

const statusMessages: Record<string, { tone: string; message: string }> = {
  success: {
    tone: "success",
    message: "Thank you. Your project brief was delivered successfully."
  },
  invalid: {
    tone: "error",
    message: "Please check the required fields and submit the form again."
  },
  unavailable: {
    tone: "warning",
    message:
      "Form delivery is not configured on the server yet. Please contact us directly on Telegram."
  },
  error: {
    tone: "error",
    message: "The message could not be delivered. Please use Telegram or phone instead."
  },
  "rate-limited": {
    tone: "warning",
    message: "Too many form attempts were received. Please wait a few minutes or use Telegram."
  }
};

export default async function ContactPage({ searchParams }: ContactPageProps) {
  const params = await searchParams;
  const status = params.status ? statusMessages[params.status] : undefined;
  const requestedProject = params.project?.slice(0, 120) ?? "";

  return (
    <main id="main-content">
      <PageHero
        label={siteContent.contactPage.label}
        title={siteContent.contactPage.title}
        description={siteContent.contactPage.description}
      />

      <section className="section section--tight-top">
        <div className="container contact-layout">
          <aside className="contact-panel">
            <p className="eyebrow">Direct contact</p>
            <h2>{siteContent.contactPage.directContactTitle}</h2>
            <p>{siteContent.contactPage.directContactDescription}</p>

            <div className="contact-methods">
              <a href={siteContent.contact.telegramUrl} target="_blank" rel="noreferrer">
                <span>Telegram</span>
                <strong>{siteContent.contact.telegramHandle}</strong>
              </a>
              <a href={siteContent.contact.phoneHref}>
                <span>Phone</span>
                <strong>{siteContent.contact.phoneDisplay}</strong>
              </a>
            </div>
          </aside>

          <div className="contact-form-wrap">
            <p className="eyebrow">Project details</p>
            <h2>{siteContent.contactPage.formTitle}</h2>
            <p>{siteContent.contactPage.formDescription}</p>

            {status ? (
              <div className={`form-status form-status--${status.tone}`} role="status" aria-live="polite">
                {status.message}
              </div>
            ) : null}

            <form className="contact-form" action="/api/contact" method="post">
              <div className="honeypot" aria-hidden="true">
                <label htmlFor="website">Website</label>
                <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
              </div>

              <div className="form-grid">
                <label>
                  <span>Name *</span>
                  <input name="name" type="text" autoComplete="name" minLength={2} maxLength={100} required />
                </label>
                <label>
                  <span>Email *</span>
                  <input name="email" type="email" autoComplete="email" maxLength={160} required />
                </label>
              </div>

              <div className="form-grid">
                <label>
                  <span>Company</span>
                  <input name="company" type="text" autoComplete="organization" maxLength={140} />
                </label>
                <label>
                  <span>Service *</span>
                  <select name="service" required defaultValue="">
                    <option value="" disabled>
                      Select a service
                    </option>
                    {siteContent.contactPage.serviceOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label>
                <span>Project or reference name</span>
                <input
                  name="project"
                  type="text"
                  maxLength={120}
                  defaultValue={requestedProject}
                  placeholder="Example: New slot game or operator dashboard"
                />
              </label>

              <label>
                <span>Project brief *</span>
                <textarea
                  name="message"
                  rows={7}
                  minLength={20}
                  maxLength={4000}
                  placeholder="Describe the product, target platforms, integrations and expected timeline."
                  required
                />
              </label>

              <label className="consent-row">
                <input name="consent" type="checkbox" value="accepted" required />
                <span>I agree to be contacted about this project request.</span>
              </label>

              <button className="button button--primary" type="submit">
                <span>Send project brief</span>
                <span className="button__arrow" aria-hidden="true">
                  →
                </span>
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
