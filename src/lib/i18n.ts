export const locales = ["en", "es", "pt"] as const;
export type Locale = (typeof locales)[number];
export const localeNames: Record<Locale, string> = { en: "English", es: "Español", pt: "Português" };
export const languageCookie = "aurevia-language";

export function isLocale(value: string | undefined | null): value is Locale {
  return locales.some((locale) => locale === value);
}

export function localizedPath(path: string, locale: Locale): string {
  if (!path.startsWith("/") || path.startsWith("//")) return path;
  const unprefixed = path.replace(/^\/(en|es|pt)(?=\/|\?|#|$)/, "");
  return `/${locale}${unprefixed === "/" ? "" : unprefixed}`;
}

/** Explicit preference > supported browser language > country hint > English.
 * Country is a coarse Cloudflare header; no IP lookup or storage is needed.
 */
export function preferredLocale(saved?: string, acceptLanguage = "", country = ""): Locale {
  if (isLocale(saved)) return saved;
  const languages = acceptLanguage.split(",").map((part, index) => {
    const [tag, ...parameters] = part.trim().toLowerCase().split(";");
    const quality = parameters.find((parameter) => parameter.trim().startsWith("q="));
    return { locale: tag.split("-")[0], q: quality ? Number(quality.trim().slice(2)) : 1, index };
  }).filter(({ q }) => Number.isFinite(q) && q > 0 && q <= 1)
    .sort((a, b) => b.q - a.q || a.index - b.index);
  for (const { locale } of languages) if (isLocale(locale)) return locale;
  if (["BR", "PT", "AO", "MZ", "CV", "GW", "ST", "TL"].includes(country.toUpperCase())) return "pt";
  if (["ES", "MX", "AR", "BO", "CL", "CO", "CR", "CU", "DO", "EC", "GQ", "GT", "HN", "NI", "PA", "PE", "PR", "PY", "SV", "UY", "VE"].includes(country.toUpperCase())) return "es";
  return "en";
}
