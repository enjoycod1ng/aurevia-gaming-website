<?php
declare(strict_types=1);
// PHP 8+ with cURL. Server-side only; load credentials from your secret store.

function verifyCallback(string $secret, string $rawBody, array $headers, string $operation, string $operatorId, ?int $now = null): array {
    if ($secret === '' || $operatorId === '' || !in_array($operation, ['balance','debit','credit','rollback'], true)) throw new RuntimeException('Wallet verifier is not configured');
    $headers = array_change_key_case($headers, CASE_LOWER);
    $timestamp = $headers['x-pp-timestamp'] ?? '';
    $signature = $headers['x-pp-signature'] ?? '';
    if (!preg_match('/^\d{1,12}$/D', $timestamp) || abs(($now ?? time()) - (int)$timestamp) > 300 || !preg_match('/^[a-f0-9]{64}$/D', $signature)) {
        throw new RuntimeException('Invalid callback signature or timestamp');
    }
    if (!hash_equals(hash_hmac('sha256', $timestamp . '.' . $rawBody, $secret), $signature)) {
        throw new RuntimeException('Invalid callback signature');
    }
    $payload = json_decode($rawBody, true, 512, JSON_THROW_ON_ERROR);
    if (!is_string($payload['request_id'] ?? null) || $payload['request_id'] === '' || ($payload['request_id'] ?? null) !== ($headers['x-pp-request-id'] ?? null)
        || ($payload['operator_id'] ?? null) !== $operatorId || ($payload['transaction_type'] ?? null) !== $operation) {
        throw new RuntimeException('Callback identity mismatch');
    }
    return $payload;
}

function providerRequest(string $baseUrl, string $apiKey, string $method, string $path, ?array $body = null, ?string $idempotencyKey = null): array {
    if (parse_url($baseUrl, PHP_URL_SCHEME) !== 'https' || !str_starts_with($path, 'api/provider/v1/')) {
        throw new InvalidArgumentException('Invalid provider HTTPS URL or API path');
    }
    if (strpbrk($apiKey . ($idempotencyKey ?? ''), "\r\n") !== false) throw new InvalidArgumentException('Invalid header');
    $headers = ['X-Provider-API-Key: ' . $apiKey, 'Accept: application/json'];
    if ($body !== null) $headers[] = 'Content-Type: application/json';
    if ($idempotencyKey !== null) $headers[] = 'Idempotency-Key: ' . $idempotencyKey;
    $handle = curl_init(rtrim($baseUrl, '/') . '/' . $path);
    curl_setopt_array($handle, [CURLOPT_RETURNTRANSFER => true, CURLOPT_CUSTOMREQUEST => $method,
        CURLOPT_HTTPHEADER => $headers, CURLOPT_CONNECTTIMEOUT => 5, CURLOPT_TIMEOUT => 15,
        CURLOPT_FOLLOWLOCATION => false, CURLOPT_SSL_VERIFYPEER => true, CURLOPT_SSL_VERIFYHOST => 2]);
    if ($body !== null) curl_setopt($handle, CURLOPT_POSTFIELDS, json_encode($body, JSON_THROW_ON_ERROR));
    $raw = curl_exec($handle);
    $status = curl_getinfo($handle, CURLINFO_RESPONSE_CODE);
    $failed = $raw === false;
    $errorNumber = curl_errno($handle);
    curl_close($handle);
    if ($failed) throw new RuntimeException('Provider connection failed (cURL ' . $errorNumber . '); retry launch with the same idempotency key');
    $result = json_decode($raw, true, 512, JSON_THROW_ON_ERROR);
    if ($status < 200 || $status >= 300) throw new RuntimeException($result['message'] ?? 'Provider request failed', $status);
    return $result['data'];
}

function launchGame(string $baseUrl, string $apiKey, string $authenticatedPlayerId, string $returnUrl, string $idempotencyKey, string $symbol = 'wildframes', string $device = 'desktop'): array {
    if ($idempotencyKey === '') throw new InvalidArgumentException('Persist an idempotency key before launching');
    if (!in_array($device, ['desktop','mobile'], true)) throw new InvalidArgumentException('Device must be desktop or mobile');
    return providerRequest($baseUrl, $apiKey, 'POST', 'api/provider/v1/launch-url', [
        'symbol' => $symbol, 'external_player_id' => $authenticatedPlayerId, 'currency' => 'EUR',
        'lang' => 'en', 'device' => $device, 'return_url' => $returnUrl,
    ], $idempotencyKey);
}

// Callback route: $raw = file_get_contents('php://input');
// $payload = verifyCallback($walletSecret, $raw, getallheaders(), $operation, $operatorId);
// Then apply the financial operation and store its response atomically in YOUR
// wallet database. Verification alone is not a wallet implementation.
