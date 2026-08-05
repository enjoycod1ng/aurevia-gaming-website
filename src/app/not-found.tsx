import { ButtonLink } from "@/components/button-link";

export default function NotFound() {
  return (
    <main id="main-content" className="not-found">
      <div className="container not-found__inner">
        <p className="eyebrow">404</p>
        <h1>This page is not part of the current build.</h1>
        <p>Return to the website or start a conversation about your casino product.</p>
        <div className="button-row">
          <ButtonLink href="/">Back to home</ButtonLink>
          <ButtonLink href="/contact" variant="secondary">
            Request a quote
          </ButtonLink>
        </div>
      </div>
    </main>
  );
}
