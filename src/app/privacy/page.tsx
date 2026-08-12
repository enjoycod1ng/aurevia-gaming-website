import type { Metadata } from "next";
import Link from "next/link";

import styles from "./privacy.module.css";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Aurevia Gaming handles project inquiries, security verification, analytics consent, and website data.",
  alternates: { canonical: "/privacy" },
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
  return (
    <main id="main-content" className={styles.page}>
      <article className={`container ${styles.article}`}>
        <header>
          <p className="home-kicker">Legal</p>
          <h1>Privacy Policy</h1>
          <p className={styles.updated}>Last updated: August 12, 2026</p>
          <p>
            This policy explains how Aurevia Gaming handles information when
            you browse this website or send a project inquiry.
          </p>
        </header>

        <section>
          <h2>Information we process</h2>
          <p>
            When you submit the contact form, we process the information you
            provide, such as your name, email address or Telegram handle,
            company, target market, requested service, budget, timeline, and
            project brief. We also process limited technical information needed
            to secure and operate the site, including IP address, request time,
            and security verification results.
          </p>
        </section>

        <section>
          <h2>Why we use it</h2>
          <p>
            We use inquiry data to respond, evaluate project fit, prepare a
            scope or quote, prevent abuse, maintain service security, and meet
            legal obligations. We do not sell personal information.
          </p>
        </section>

        <section>
          <h2>Service providers</h2>
          <ul>
            <li>
              Cloudflare provides DNS, content delivery, network security, and
              Turnstile bot verification.
            </li>
            <li>
              Google Analytics measures site usage only after you grant
              analytics consent. We do not send names, email addresses, phone
              numbers, messages, or other inquiry contents to Google Analytics.
            </li>
            <li>
              Telegram or a configured business webhook may receive project
              inquiry data so our team can respond.
            </li>
            <li>
              Our hosting provider processes requests and operational logs
              needed to serve and protect the website.
            </li>
          </ul>
        </section>

        <section>
          <h2>Cookies and analytics choices</h2>
          <p>
            The site stores your analytics preference in your browser. Google
            Analytics does not load until you choose to allow it. You can
            reject analytics or change your choice at any time using the
            <strong> Cookie preferences</strong> control in the footer. Turning
            analytics off disables collection and removes accessible Google
            Analytics cookies from this site.
          </p>
        </section>

        <section>
          <h2>Retention and security</h2>
          <p>
            We keep project inquiries only as long as reasonably needed for the
            conversation, a resulting business relationship, security, and
            applicable recordkeeping requirements. We use access controls,
            encrypted transport, bot verification, and rate limiting to reduce
            unauthorized access and abuse. No internet service can guarantee
            absolute security.
          </p>
        </section>

        <section>
          <h2>Your choices</h2>
          <p>
            Depending on where you live, you may have rights to request access,
            correction, deletion, restriction, or a copy of personal data, or
            to object to certain processing. To make a privacy request, use our
            <Link href="/contact"> contact form</Link> or message the Telegram
            contact listed in the site footer.
          </p>
        </section>

        <section>
          <h2>Audience and changes</h2>
          <p>
            This is a business-to-business services website and is not directed
            to children. We may update this policy when the website, providers,
            or legal requirements change. The date above identifies the latest
            version.
          </p>
        </section>
      </article>
    </main>
  );
}
