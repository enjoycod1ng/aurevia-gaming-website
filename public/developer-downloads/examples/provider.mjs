// Node.js 20+ server-side helper. Never bundle this file with credentials into a browser.
import {createHmac, timingSafeEqual} from 'node:crypto';

export function verifyCallback(secret, rawBody, headers, operation, operatorId, now = Date.now() / 1000) {
  if (!secret || !operatorId || !['balance','debit','credit','rollback'].includes(operation)) throw new Error('Wallet verifier is not configured');
  const timestamp = headers['x-pp-timestamp'];
  const signature = headers['x-pp-signature'];
  if (!/^\d{1,12}$/.test(timestamp ?? '') || Math.abs(now - Number(timestamp)) > 300 || !/^[a-f0-9]{64}$/.test(signature ?? '')) {
    throw new Error('Invalid callback signature or timestamp');
  }
  const raw = Buffer.isBuffer(rawBody) ? rawBody : Buffer.from(rawBody, 'utf8');
  const expected = createHmac('sha256', secret).update(timestamp + '.').update(raw).digest();
  if (!timingSafeEqual(expected, Buffer.from(signature, 'hex'))) throw new Error('Invalid callback signature');
  const payload = JSON.parse(raw.toString('utf8'));
  if (typeof payload?.request_id !== 'string' || !payload.request_id || payload.request_id !== headers['x-pp-request-id'] || payload.operator_id !== operatorId || payload.transaction_type !== operation) {
    throw new Error('Callback identity mismatch');
  }
  return payload;
}

export async function providerRequest(baseUrl, apiKey, method, path, body, idempotencyKey) {
  const base = new URL(baseUrl.endsWith('/') ? baseUrl : baseUrl + '/');
  if (base.protocol !== 'https:') throw new Error('Provider URL must use HTTPS');
  if (!path.startsWith('api/provider/v1/')) throw new Error('Invalid provider path');
  const headers = {'X-Provider-API-Key': apiKey, 'Accept': 'application/json'};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (idempotencyKey) headers['Idempotency-Key'] = idempotencyKey;
  const response = await fetch(new URL(path, base), {
    method, headers, body: body === undefined ? undefined : JSON.stringify(body),
    redirect: 'error', signal: AbortSignal.timeout(15000),
  });
  const result = await response.json();
  if (!response.ok) {
    const error = new Error(result.message ?? 'Provider request failed');
    error.status = response.status;
    error.code = result.error;
    error.retryAfter = response.headers.get('retry-after');
    throw error;
  }
  return result.data;
}

export function launchGame(baseUrl, apiKey, authenticatedPlayerId, returnUrl, idempotencyKey, symbol = 'wildframes', device = 'desktop') {
  if (!idempotencyKey) throw new Error('Persist one idempotency key per launch attempt and reuse it on retries');
  if (!['desktop','mobile'].includes(device)) throw new Error('Device must be desktop or mobile');
  return providerRequest(baseUrl, apiKey, 'POST', 'api/provider/v1/launch-url', {
    symbol, external_player_id: authenticatedPlayerId, currency: 'EUR', lang: 'en', device, return_url: returnUrl,
  }, idempotencyKey);
}

// In an Express callback route use express.raw({type:'application/json'}) BEFORE
// any JSON parser. Verify req.body, then atomically lock the player's wallet,
// enforce the (operator_id,transaction_id) unique key, apply the ledger mutation,
// and store the immutable response in the same database transaction.
