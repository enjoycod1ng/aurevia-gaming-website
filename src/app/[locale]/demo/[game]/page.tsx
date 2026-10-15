import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { DemoPlayer } from "@/components/demo-player";
import { getDemoCopy } from "@/content/demo-copy";
import { requireLocale } from "@/content/localized-content";
import { preparedGames } from "@/content/prepared-games";

// Rendered per request so Next.js can add src/proxy.ts's CSP nonce to its scripts;
// prerendered HTML would carry no nonce and be blocked. dynamicParams = false only
// applies to prerendered routes, so a next.config.ts rewrite sends unknown games to
// the routed 404 (app/global-not-found.tsx) before this page renders.
export const dynamic = "force-dynamic";

// That rewrite matches regardless of case, so other spellings of a game reach this
// page and are sent to its canonical address.
function findGame(id: string) {
  return preparedGames.find((game) => game.id === id.toLowerCase());
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; game: string }>;
}): Promise<Metadata> {
  const values = await params;
  const locale = requireLocale(values.locale);
  const game = findGame(values.game);
  if (!game) notFound();
  return {
    title: `${game.title} · ${getDemoCopy(locale).title}`,
    robots: { index: false, follow: false },
    referrer: "no-referrer",
  };
}
export default async function DemoPage({
  params,
}: {
  params: Promise<{ locale: string; game: string }>;
}) {
  const values = await params;
  const locale = requireLocale(values.locale);
  const game = findGame(values.game);
  if (!game) notFound();
  if (game.id !== values.game) permanentRedirect(`/${locale}/demo/${game.id}`);
  return (
    <DemoPlayer
      game={game.id}
      title={game.title}
      locale={locale}
      copy={getDemoCopy(locale)}
    />
  );
}
