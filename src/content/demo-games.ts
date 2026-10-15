// Games with a playable demo. next.config.ts reads this list (it cannot resolve
// "@/" imports) to send unknown games to the routed 404 before the per-request
// demo page renders. Keep it in step with prepared-games.ts; a test checks both.
export const demoGameIds = [
  "wildframes",
  "honeyrush",
  "moonprincess",
  "wheelofmictlan",
  "secretofdead",
  "legacyofegypt",
  "hugosadventure",
  "trollhunters2",
  "demon",
] as const;
