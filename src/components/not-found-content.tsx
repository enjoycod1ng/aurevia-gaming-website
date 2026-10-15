import { ButtonLink } from "@/components/button-link";
import { getUiContent, translate } from "@/content/localized-content";
import { localizedPath, type Locale } from "@/lib/i18n";

export function NotFoundContent({ locale }: { locale: Locale }) {
  const ui = getUiContent(locale);
  return (
    <main id="main-content" className="grid min-h-[70vh] place-items-center py-20">
      <div className="container max-w-205 text-center">
        <p className="mb-5 text-sm font-extrabold tracking-[0.17em] text-gold-bright uppercase">404</p>
        <h1 className="heading-1">{ui.notFoundTitle}</h1>
        <p className="mx-auto mt-6 text-muted">
          {ui.notFoundDescription}
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 xs:flex-row">
          <ButtonLink href={localizedPath("/", locale)}>{ui.backHome}</ButtonLink>
          <ButtonLink href={localizedPath("/contact", locale)} variant="secondary">
            {translate("Contact", locale)}
          </ButtonLink>
        </div>
      </div>
    </main>
  );
}
