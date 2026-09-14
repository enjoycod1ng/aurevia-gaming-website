import { ContactBriefSection } from "@/components/contact/contact-brief-section";
import { ContactHeroSection } from "@/components/contact/contact-hero-section";
import { ContactProcessSection } from "@/components/contact/contact-process-section";
import { ContactScopeSection } from "@/components/contact/contact-scope-section";
import { HomeCtaSection } from "@/components/home/home-cta-section";
import { getSiteContent, requireLocale } from "@/content/localized-content";
import { PageStructuredData } from "@/components/page-structured-data";
import { createPageMetadata } from "@/lib/metadata";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const locale = requireLocale((await params).locale);
  return createPageMetadata(getSiteContent(locale).seo.contact, locale);
}

interface ContactPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    status?: string | string[];
    project?: string | string[];
  }>;
}

function getStatusMessage(status: string | undefined, statusMessages: Readonly<Record<string, import("@/types/content").ContactStatusMessage>>) {

  return status && Object.hasOwn(statusMessages, status)
    ? statusMessages[status as keyof typeof statusMessages]
    : undefined;
}

export default async function ContactPage({ searchParams, params: routeParams }: ContactPageProps) {
  const locale = requireLocale((await routeParams).locale);
  const siteContent = getSiteContent(locale);
  const params = await searchParams;
  const { contact, contactPage } = siteContent;
  const statusParam = Array.isArray(params.status) ? params.status[0] : params.status;
  const projectParam = Array.isArray(params.project) ? params.project[0] : params.project;
  const status = getStatusMessage(statusParam, contactPage.form.statusMessages);
  const requestedProject = projectParam?.slice(0, 120) ?? "";

  return (
    <main id="main-content" className="bg-canvas">
      <PageStructuredData content={siteContent} page="contact" locale={locale} />
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
