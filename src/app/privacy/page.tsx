import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Aurevia Gaming handles project inquiries, security verification, analytics consent, and website data.",
  alternates: { canonical: "/privacy" },
  robots: { index: true, follow: true },
};

const sectionClass = "pt-8.5";
const headingClass = "text-xl uppercase md:text-2xl";
const copyClass = "mt-3.5 leading-7 text-muted";

export default function PrivacyPage() {
  return (
    <main id="main-content" className="min-h-[70vh] bg-[radial-gradient(circle_at_85%_5%,rgb(212_175_55/0.1),transparent_30rem)] py-18 md:py-28">
      <article className="container max-w-220">
        <header className="border-b border-line pb-9">
          <p className="inline-flex min-h-10 items-center rounded-full border border-line-strong bg-surface-strong px-6 text-xs font-extrabold text-gold-bright uppercase">Legal</p>
          <h1 className="mt-4 text-5xl uppercase md:text-7xl">Privacy Policy</h1>
          <p className="mt-3 text-xs text-ink-soft">Last updated: August 12, 2026</p>
          <p className={copyClass}>This policy explains how Aurevia Gaming handles information when you browse this website or send a project inquiry.</p>
        </header>
        <section className={sectionClass}><h2 className={headingClass}>Information we process</h2><p className={copyClass}>When you submit the contact form, we process the information you provide, such as your name, email address or Telegram handle, company, target market, requested service, budget, timeline, and project brief. We also process limited technical information needed to secure and operate the site, including IP address, request time, and security verification results.</p></section>
        <section className={sectionClass}><h2 className={headingClass}>Why we use it</h2><p className={copyClass}>We use inquiry data to respond, evaluate project fit, prepare a scope or quote, prevent abuse, maintain service security, and meet legal obligations. We do not sell personal information.</p></section>
        <section className={sectionClass}><h2 className={headingClass}>Service providers</h2><ul className="mt-3.5 grid list-disc gap-2.5 pl-5.5 leading-7 text-muted"><li>Cloudflare provides DNS, content delivery, network security, and Turnstile bot verification.</li><li>Google Analytics measures site usage only after you grant analytics consent. We do not send names, email addresses, phone numbers, messages, or other inquiry contents to Google Analytics.</li><li>Telegram or a configured business webhook may receive project inquiry data so our team can respond.</li><li>Our hosting provider processes requests and operational logs needed to serve and protect the website.</li></ul></section>
        <section className={sectionClass}><h2 className={headingClass}>Cookies and analytics choices</h2><p className={copyClass}>The site stores your analytics preference in your browser. Google Analytics does not load until you choose to allow it. You can reject analytics or change your choice at any time using the <strong>Cookie preferences</strong> control in the footer. Turning analytics off disables collection and removes accessible Google Analytics cookies from this site.</p></section>
        <section className={sectionClass}><h2 className={headingClass}>Retention and security</h2><p className={copyClass}>We keep project inquiries only as long as reasonably needed for the conversation, a resulting business relationship, security, and applicable recordkeeping requirements. We use access controls, encrypted transport, bot verification, and rate limiting to reduce unauthorized access and abuse. No internet service can guarantee absolute security.</p></section>
        <section className={sectionClass}><h2 className={headingClass}>Your choices</h2><p className={copyClass}>Depending on where you live, you may have rights to request access, correction, deletion, restriction, or a copy of personal data, or to object to certain processing. To make a privacy request, use our <Link className="text-gold-bright underline underline-offset-3" href="/contact">contact form</Link> or message the Telegram contact listed in the site footer.</p></section>
        <section className={sectionClass}><h2 className={headingClass}>Audience and changes</h2><p className={copyClass}>This is a business-to-business services website and is not directed to children. We may update this policy when the website, providers, or legal requirements change. The date above identifies the latest version.</p></section>
      </article>
    </main>
  );
}
