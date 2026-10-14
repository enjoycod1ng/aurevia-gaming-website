// Node.js 20+. Call this from your authenticated backend route.
import {providerRequest, launchGame} from './provider.mjs';

export async function createPlayerLaunch(authenticatedPlayerId, persistedLaunchKey, approvedReturnUrl) {
  const base = process.env.PROVIDER_BASE_URL;
  const key = process.env.OPERATOR_API_KEY;
  if (!base || !key) throw new Error('Configure server-side provider credentials');
  const catalog = await providerRequest(base, key, 'GET', 'api/provider/v1/games?provider_id=playngo');
  if (!catalog.items.length) throw new Error('No games assigned');
  const session = await launchGame(base, key, authenticatedPlayerId, approvedReturnUrl,
    persistedLaunchKey, catalog.items[0].symbol, 'desktop');
  // Store session.session_id with this player for lookup and close.
  // Return ONLY session.launch_url to their authenticated browser; do not log it.
  return session;
}

// Reconcile: providerRequest(base, key, 'GET', 'api/provider/v1/transactions?limit=50');
// Close: providerRequest(base, key, 'POST',
//   `api/provider/v1/sessions/${encodeURIComponent(storedSessionId)}/close`);
// A timed-out launch must reuse the SAME persisted key AND request body.
