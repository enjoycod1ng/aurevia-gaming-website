import { ContactBriefSection } from "@/components/contact/contact-brief-section";
import { ContactHeroSection } from "@/components/contact/contact-hero-section";
import { ContactProcessSection } from "@/components/contact/contact-process-section";
import { ContactScopeSection } from "@/components/contact/contact-scope-section";
import { HomeCtaSection } from "@/components/home/home-cta-section";
import { siteContent } from "@/content/site-content";
import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata(siteContent.seo.contact);

interface ContactPageProps {
  searchParams: Promise<{
    status?: string | string[];
    project?: string | string[];
  }>;
}

function getStatusMessage(status: string | undefined) {
  const statusMessages = siteContent.contactPage.form.statusMessages;

  return status && Object.hasOwn(statusMessages, status)
    ? statusMessages[status as keyof typeof statusMessages]
    : undefined;
}

export default async function ContactPage({ searchParams }: ContactPageProps) {
  const params = await searchParams;
  const { contact, contactPage } = siteContent;
  const statusParam = Array.isArray(params.status) ? params.status[0] : params.status;
  const projectParam = Array.isArray(params.project) ? params.project[0] : params.project;
  const status = getStatusMessage(statusParam);
  const requestedProject = projectParam?.slice(0, 120) ?? "";

  return (
    <main id="main-content" className="bg-canvas">
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
        content={contactPage.cta}
      />
    </main>
  );
}
