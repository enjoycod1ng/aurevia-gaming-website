import { mediaPath } from "@/lib/media";
import type { GameCatalogItem, GamePreview } from "@/types/content";

export const sandboxUrl = "https://aureviagaming.com/playngo-sandbox/lab/";

// The nine titles selected by playngo-api-integration/scripts/game-manifest.json.
// Honey Rush is the original game (375), not Black and Yellow (922).
const titles = [
  { id: "wildframes", title: "Wild Frames", category: "grid-slots", description: "Classic symbols, cascading clusters and wild frames." },
  { id: "honeyrush", title: "Honey Rush", category: "grid-slots", description: "The original Honey Rush, with its distinctive honeycomb grid." },
  { id: "moonprincess", title: "Moon Princess", category: "grid-slots", description: "A colorful fantasy grid slot starring the Moon Princesses." },
  { id: "wheelofmictlan", title: "Wheel of Mictlan", category: "video-slots", description: "An underworld adventure with wild features and a bonus wheel." },
  { id: "secretofdead", title: "Secret of Dead", category: "video-slots", description: "An Egyptian adventure across six reels." },
  { id: "legacyofegypt", title: "Legacy of Egypt", category: "video-slots", description: "Five reels set in the world of ancient Egypt." },
  { id: "hugosadventure", title: "Hugo’s Adventure", category: "video-slots", description: "Hugo returns for a colorful adventure slot." },
  { id: "trollhunters2", title: "Troll Hunters 2", category: "grid-slots", description: "A Norse fantasy grid slot in the Troll Hunters series." },
  { id: "demon", title: "Demon", category: "video-slots", description: "A music-themed video slot inspired by the band Demon." },
] as const;

export const preparedGames: readonly GameCatalogItem[] = titles.map((game) => ({
  ...game,
  categoryLabel: game.category === "grid-slots" ? "Grid slot" : "Video slot",
  image: {
    src: mediaPath(`/media/games/${game.id}.webp`),
    alt: `${game.title} — Play’n GO game artwork`,
    width: 500,
    height: 350,
  },
  primaryAction: { label: "Open Sandbox", href: sandboxUrl, external: true },
  secondaryAction: {
    label: "Discuss Integration",
    href: `/contact?project=${encodeURIComponent(`${game.title} API integration`)}`,
  },
}));

export const gameShowcase: GamePreview = {
  label: "Play’n GO · Integration showcase",
  statusLabel: "Sandbox capture",
  title: "Wild Frames",
  description: "A real gameplay capture from our prepared integration. Explore the nine-game catalog in the sandbox lobby with a simulated wallet.",
  image: {
    src: mediaPath("/media/games/wildframes-gameplay.webp"),
    alt: "Wild Frames running in the prepared integration, showing its seven-column grid, wild symbols and simulated balance",
    width: 1366,
    height: 768,
  },
  primaryAction: { label: "Open Sandbox", href: sandboxUrl, external: true },
  secondaryAction: { label: "View All Games", href: "/games#game-library" },
};
