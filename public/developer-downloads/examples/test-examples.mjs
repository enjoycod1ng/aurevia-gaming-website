import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {verifyCallback, providerRequest, launchGame} from './provider.mjs';
const fixture = JSON.parse(readFileSync(new URL('./signature-fixture.json', import.meta.url)));
const verify = (raw = fixture.raw_body, headers = fixture.headers, now = fixture.now, op = 'debit') =>
  verifyCallback(fixture.example_secret, raw, headers, op, fixture.expected_operator_id, now);
assert.equal(verify().amount, '2.00');
assert.throws(() => verify(fixture.raw_body + ' '));
assert.throws(() => verify(undefined, undefined, fixture.now + 301));
assert.throws(() => verify(undefined, undefined, undefined, 'credit'));
let called;
globalThis.fetch = async (url, options) => {
  called = {url: String(url), options};
  return new Response(JSON.stringify({success: true, data: {session_id: 'example'}}));
};
assert.equal((await providerRequest('https://provider.example/playngo-sandbox', 'example-key', 'POST',
  'api/provider/v1/launch-url', {symbol: 'wildframes'}, 'retry-key')).session_id, 'example');
assert.equal(called.url, 'https://provider.example/playngo-sandbox/api/provider/v1/launch-url');
assert.equal(called.options.headers['Idempotency-Key'], 'retry-key');
assert.equal(called.options.redirect, 'error');
await launchGame('https://provider.example/playngo-sandbox','example-key','player','https://client.example','mobile-key','wildframes','mobile');
assert.equal(JSON.parse(called.options.body).device,'mobile');
assert.throws(() => launchGame('https://provider.example','key','player','https://client.example','key','wildframes','invalid'));
console.log('Node.js: callback fixture, tampering, timestamp, operation, request construction passed.');
