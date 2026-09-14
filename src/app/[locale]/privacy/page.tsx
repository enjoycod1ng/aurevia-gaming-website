import { requireLocale, translate } from "@/content/localized-content";
import { createPageMetadata } from "@/lib/metadata";
import { localizedPath } from "@/lib/i18n";
import Link from "next/link";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const locale = requireLocale((await params).locale);
  return createPageMetadata({ title: translate("Privacy Policy", locale), description: translate("How Aurevia Gaming handles project inquiries, security verification, analytics consent, and website data.", locale), path: "/privacy", keywords: [] }, locale);
}

const sectionClass = "pt-8.5";
const headingClass = "text-xl uppercase md:text-2xl";
const copyClass = "mt-3.5 leading-7 text-muted";

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = requireLocale((await params).locale);
  return (
    <main id="main-content" className="min-h-[70vh] bg-[radial-gradient(circle_at_85%_5%,rgb(212_175_55/0.1),transparent_30rem)] py-18 md:py-28">
      <article className="container max-w-220">
        <header className="border-b border-line pb-9">
          <p className="inline-flex min-h-10 items-center rounded-full border border-line-strong bg-surface-strong px-6 text-sm font-extrabold text-gold-bright uppercase">{translate("Legal", locale)}</p>
          <h1 className="mt-4 heading-1">{translate("Privacy Policy", locale)}</h1>
          <p className="mt-3 text-sm text-ink-soft">{translate("Last updated: September 13, 2026", locale)}</p>
          <p className={copyClass}>{translate("This policy explains how Aurevia Gaming handles information when you browse this website or send a project inquiry.", locale)}</p>
        </header>
        <section className={sectionClass}><h2 className={headingClass}>{translate("Information we process", locale)}</h2><p className={copyClass}>{translate("When you submit the contact form, we process the information you provide, such as your name, email address or Telegram handle, company, target market, requested service, budget, timeline, and project brief. We also process limited technical information needed to secure and operate the site, including IP address, request time, and security verification results.", locale)}</p></section>
        <section className={sectionClass}><h2 className={headingClass}>{translate("Why we use it", locale)}</h2><p className={copyClass}>{translate("We use inquiry data to respond, evaluate project fit, prepare a scope or quote, prevent abuse, maintain service security, and meet legal obligations. We do not sell personal information.", locale)}</p></section>
        <section className={sectionClass}><h2 className={headingClass}>{translate("Service providers", locale)}</h2><ul className="mt-3.5 grid list-disc gap-2.5 pl-5.5 leading-7 text-muted"><li>{translate("Cloudflare provides DNS, content delivery, network security, and Turnstile bot verification.", locale)}</li><li>{translate("Google Analytics measures site usage only after you grant analytics consent. We do not send names, email addresses, phone numbers, messages, or other inquiry contents to Google Analytics.", locale)}</li><li>{translate("Telegram or a configured business webhook may receive project inquiry data so our team can respond.", locale)}</li><li>{translate("Our hosting provider processes requests and operational logs needed to serve and protect the website.", locale)}</li></ul></section>
        <section className={sectionClass}><h2 className={headingClass}>{translate("Cookies and analytics choices", locale)}</h2><p className={copyClass}>{translate("The site stores your analytics preference in your browser. Your language choice is saved in an essential cookie for one year, and your theme choice is saved in local storage. On the homepage, we use your saved language, browser language, or a country hint from Cloudflare to choose a language. We do not store your IP address for language selection. Google Analytics does not load until you choose to allow it. You can reject analytics or change your choice at any time using the", locale)}{" "}<strong>{translate("Cookie preferences", locale)}</strong>{" "}{translate("control in the footer. Turning analytics off disables collection and removes accessible Google Analytics cookies from this site.", locale)}</p></section>
        <section className={sectionClass}><h2 className={headingClass}>{translate("Retention and security", locale)}</h2><p className={copyClass}>{translate("We keep project inquiries only as long as reasonably needed for the conversation, a resulting business relationship, security, and applicable recordkeeping requirements. We use access controls, encrypted transport, bot verification, and rate limiting to reduce unauthorized access and abuse. No internet service can guarantee absolute security.", locale)}</p></section>
        <section className={sectionClass}><h2 className={headingClass}>{translate("Your choices", locale)}</h2><p className={copyClass}>{translate("Depending on where you live, you may have rights to request access, correction, deletion, restriction, or a copy of personal data, or to object to certain processing. To make a privacy request, use our", locale)}{" "}<Link className="text-gold-bright underline underline-offset-3" href={localizedPath("/contact", locale)}>{translate("contact form", locale)}</Link>{" "}{translate("or message the Telegram contact listed in the site footer.", locale)}</p></section>
        <section className={sectionClass}><h2 className={headingClass}>{translate("Audience and changes", locale)}</h2><p className={copyClass}>{translate("This is a business-to-business services website and is not directed to children. We may update this policy when the website, providers, or legal requirements change. The date above identifies the latest version.", locale)}</p></section>
      </article>
    </main>
  );
}
