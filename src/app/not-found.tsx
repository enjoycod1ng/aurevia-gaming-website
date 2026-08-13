import { ButtonLink } from "@/components/button-link";

export default function NotFound() {
  return (
    <main id="main-content" className="grid min-h-[70vh] place-items-center py-20">
      <div className="container max-w-205 text-center">
        <p className="mb-5 text-xs font-extrabold tracking-[0.17em] text-gold-bright uppercase">404</p>
        <h1 className="text-5xl md:text-7xl">This page is not part of the current build.</h1>
        <p className="mx-auto mt-6 text-muted">
          Return to the website or start a conversation about your casino
          product.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 xs:flex-row">
          <ButtonLink href="/">Back to home</ButtonLink>
          <ButtonLink href="/contact" variant="secondary">
            Request a quote
          </ButtonLink>
        </div>
      </div>
    </main>
  );
}
