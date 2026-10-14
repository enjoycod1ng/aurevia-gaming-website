import type { Locale } from "@/lib/i18n";

const copy = {
  demo: ["Open Demo", "Abrir demo", "Abrir demo"],
  title: ["Game demo", "Demo del juego", "Demo do jogo"],
  notice: [
    "Play with 10,000 demo credits. No deposits, purchases or cash prizes.",
    "Juega con 10.000 créditos de demostración. Sin depósitos, compras ni premios en dinero.",
    "Jogue com 10.000 créditos de demonstração. Sem depósitos, compras ou prêmios em dinheiro.",
  ],
  balance: ["Demo balance", "Saldo de demostración", "Saldo de demonstração"],
  loading: [
    "Preparing your game…",
    "Preparando tu juego…",
    "Preparando seu jogo…",
  ],
  loadingHint: [
    "Your private demo wallet is getting ready.",
    "Estamos preparando tu saldo privado de demostración.",
    "Estamos preparando seu saldo privado de demonstração.",
  ],
  back: ["All games", "Todos los juegos", "Todos os jogos"],
  fullscreen: ["Full screen", "Pantalla completa", "Tela cheia"],
  restart: [
    "Restart with 10,000",
    "Reiniciar con 10.000",
    "Reiniciar com 10.000",
  ],
  restartTitle: [
    "Start a fresh demo?",
    "¿Comenzar una demo nueva?",
    "Começar uma nova demo?",
  ],
  restartBody: [
    "This closes your current game and starts a new demo with 10,000 credits.",
    "Se cerrará el juego actual y comenzará una nueva demo con 10.000 créditos.",
    "O jogo atual será fechado e uma nova demo começará com 10.000 créditos.",
  ],
  cancel: ["Keep playing", "Seguir jugando", "Continuar jogando"],
  retry: ["Try again", "Volver a intentar", "Tentar novamente"],
  resume: ["Reconnect", "Reconectar", "Reconectar"],
  unavailable: [
    "The demo is temporarily unavailable. Please try again shortly.",
    "La demo no está disponible temporalmente. Inténtalo de nuevo en unos instantes.",
    "A demo está temporariamente indisponível. Tente novamente em instantes.",
  ],
  busy: [
    "All demo seats are currently in use. Please try again shortly.",
    "Todas las plazas de demostración están ocupadas. Inténtalo de nuevo en unos instantes.",
    "Todas as vagas de demonstração estão ocupadas. Tente novamente em instantes.",
  ],
  maintenance: [
    "Games are briefly paused for maintenance. Please check back shortly.",
    "Los juegos están pausados por mantenimiento. Vuelve en unos instantes.",
    "Os jogos estão pausados para manutenção. Volte em instantes.",
  ],
  expired: [
    "Reconnect to continue with your existing demo balance.",
    "Reconecta para continuar con tu saldo de demostración actual.",
    "Reconecte para continuar com seu saldo de demonstração atual.",
  ],
  simulated: [
    "Simulated funds · EUR",
    "Fondos simulados · EUR",
    "Fundos simulados · EUR",
  ],
  runtimeNote: [
    "Game audio and text are currently available in English.",
    "El audio y los textos del juego están disponibles en inglés.",
    "O áudio e os textos do jogo estão disponíveis em inglês.",
  ],
} as const;
export type DemoCopy = Record<keyof typeof copy, string>;
export function getDemoCopy(locale: Locale): DemoCopy {
  const index = { en: 0, es: 1, pt: 2 }[locale];
  return Object.fromEntries(
    Object.entries(copy).map(([key, value]) => [key, value[index]]),
  ) as DemoCopy;
}
