import { ContactBriefSection } from "@/components/contact/contact-brief-section";
import { ContactHeroSection } from "@/components/contact/contact-hero-section";
import styles from "@/components/contact/contact-page.module.css";
import { ContactProcessSection } from "@/components/contact/contact-process-section";
import { ContactScopeSection } from "@/components/contact/contact-scope-section";
import { HomeCtaSection } from "@/components/home/home-cta-section";
import { siteContent } from "@/content/site-content";
import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata(siteContent.seo.contact);

interface ContactPageProps {
  searchParams: Promise<{
    status?: string;
    project?: string;
  }>;
}

function getStatusMessage(status: string | undefined) {
  const statusMessages = siteContent.contactPage.form.statusMessages;

  return status && status in statusMessages
    ? statusMessages[status as keyof typeof statusMessages]
    : undefined;
}

export default async function ContactPage({ searchParams }: ContactPageProps) {
  const params = await searchParams;
  const { contact, contactPage } = siteContent;
  const status = getStatusMessage(params.status);
  const requestedProject = params.project?.slice(0, 120) ?? "";

  return (
    <main id="main-content" className={styles.page}>
      <ContactHeroSection
        contact={contact}
        content={contactPage}
        requestedProject={requestedProject}
        status={status}
      />
      <ContactScopeSection content={contactPage.scopes} />
      <ContactProcessSection content={contactPage.process} />
      <ContactBriefSection content={contactPage.brief} />
      <HomeCtaSection
        className={styles.ctaSection}
        content={contactPage.cta}
      />
    </main>
  );
}
