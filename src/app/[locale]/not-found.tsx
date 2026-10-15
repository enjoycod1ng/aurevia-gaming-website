import { locale as rootLocale } from "next/root-params";
import { NotFoundContent } from "@/components/not-found-content";
import { isLocale } from "@/lib/i18n";

// Only for notFound() thrown while rendering a matched route. Next sends that as an
// empty error shell and renders this boundary after hydration, so routes 404 before
// rendering instead (dynamicParams = false, unmatched paths) and get the
// server-rendered app/global-not-found.tsx.
export default async function NotFound() {
  const value = await rootLocale();
  return <NotFoundContent locale={isLocale(value) ? value : "en"} />;
}
