<?php
declare(strict_types=1);
// PHP 8+ with cURL. Call from your authenticated backend route.
require_once __DIR__ . '/provider.php';

function createPlayerLaunch(string $authenticatedPlayerId, string $persistedLaunchKey, string $approvedReturnUrl): array {
    $base = getenv('PROVIDER_BASE_URL');
    $key = getenv('OPERATOR_API_KEY');
    if (!$base || !$key) throw new RuntimeException('Configure server-side provider credentials');
    $catalog = providerRequest($base, $key, 'GET', 'api/provider/v1/games?provider_id=playngo');
    if (empty($catalog['items'])) throw new RuntimeException('No games assigned');
    $session = launchGame($base, $key, $authenticatedPlayerId, $approvedReturnUrl,
        $persistedLaunchKey, $catalog['items'][0]['symbol'], 'desktop');
    // Store session_id with this player. Return only launch_url to their browser.
    // Never log the launch URL or expose operator credentials to the frontend.
    return $session;
}

// Reconcile: providerRequest($base, $key, 'GET', 'api/provider/v1/transactions?limit=50');
// Close: providerRequest($base, $key, 'POST',
//     'api/provider/v1/sessions/' . rawurlencode($storedSessionId) . '/close');
// A timed-out launch must reuse the SAME persisted key AND request body.
