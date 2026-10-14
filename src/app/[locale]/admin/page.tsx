import type { Metadata } from "next";
import { AdminWorkspace } from "@/components/admin/admin-workspace";
import { getAdminCopy } from "@/content/admin-copy";
import { requireLocale } from "@/content/localized-content";

export const dynamic = "force-dynamic";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const locale = requireLocale((await params).locale);
  return {
    title: getAdminCopy(locale).admin,
    robots: { index: false, follow: false, nocache: true },
    referrer: "no-referrer",
  };
}
export default async function AdminPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const locale = requireLocale((await params).locale);
  return (
    <AdminWorkspace
      key={locale}
      locale={locale}
      copy={getAdminCopy(locale)}
      initialTab={(await searchParams).tab ?? "overview"}
    />
  );
}
