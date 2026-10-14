# Aurevia Gaming Play’n GO integration

**Package version:** 1.0.1 — single-VPS sandbox software release.
**Availability:** Nine games are supported in the sandbox: Wild Frames, Demon, original Honey Rush, Hugo’s Adventure, Secret of the Dead, Wheel of Mictlan, Troll Hunters 2, Legacy of Egypt and Moon Princess. Query the catalog for your operator’s assigned games. Integration clients have separate simulated wallets. Public website demos use isolated visitor accounts starting with 10,000.00 EUR; admission remains four sessions total and two per operator. EUR and English are supported. Use simulated funds only. Production client access is not enabled.
**Wallet model:** your platform owns the player balance. Aurevia Gaming sends signed wallet callbacks during game play.

The associated OpenAPI files describe the implemented sandbox contract. Your platform holds the authoritative balance. This service wraps the existing VPS replay runtime; it is not the official Play’n GO developer API.

See [platform compatibility and setup](PLATFORM-COMPATIBILITY.md) for supported integration approaches and minimum backend requirements.

## 1. What you implement

Your backend stores an operator API key, lists enabled games, and requests a launch URL for the authenticated player. Your frontend opens that URL. Your wallet server implements four HTTPS callbacks: balance, debit, credit and rollback.

The hosted game handles its own assets and native game protocol. You do not implement spins, outcomes, replay selection or WebSocket messages.

Before onboarding, provide sandbox/live website origins, return/lobby URLs, wallet callback base URLs, requested currencies and technical contact. You will receive separate credentials for each environment and an assigned game catalog. Your callback profile will be configured as `playngo-callback-v1`.

| Setting | Example / rule |
|---|---|
| Live provider URL | Assigned after client acceptance; production access is not enabled |
| Sandbox provider base URL | `https://aureviagaming.com/playngo-sandbox` |
| Operator API key | Stored only on your backend |
| Wallet signing secret | Separate from the API key; stored only on wallet server |
| Wallet base URL | Your HTTPS URL, e.g. `https://wallet.client.example/playngo` |
| Currency | Initial testing uses EUR; additional currencies require explicit enablement and tests |

## 2. Authentication and identifiers

Send the operator key on every provider API request:

```http
x-provider-api-key: YOUR_OPERATOR_API_KEY
```

`Authorization: Bearer YOUR_OPERATOR_API_KEY` is also accepted. Use one authentication method per request. Operator identity comes from the key; omit `operator_id` from client requests. Never send API keys to the browser or place them in URLs.

Use your stable, opaque player ID as `external_player_id` (1–128 characters). Derive it from your logged-in user on the server. The same ID may exist at another operator without sharing identity. `session_id`, `round_id`, `transaction_id` and `request_id` are opaque strings. Keep them unmodified for reconciliation.

The patch preserves `external_player_id` exactly, including case, Unicode characters and leading/trailing whitespace. `player-123` and `player-123 ` are different identities. Your backend may enforce its own ID policy before calling the API; do not trim or normalize an authenticated ID into another account. The launch API separately trims surrounding whitespace from its game, currency, language, device and return-URL fields.

Upgrade note: v1.0.0 trimmed surrounding whitespace from player IDs before storing launches. Existing sessions and transactions keep those persisted identities. Retrying an old launch with the original whitespace-containing ID against the corrected API may return `409 idempotency_conflict`; reconcile the original session before intentionally creating a fresh launch. Do not automatically replace the idempotency key or rewrite historical wallet records to hide the conflict.

## 3. List enabled games

```bash
curl "$PROVIDER_BASE_URL/api/provider/v1/games?provider_id=playngo" \
  -H "x-provider-api-key: $OPERATOR_API_KEY"
```

Example response:

```json
{
  "success": true,
  "data": {
    "operator_id": "client-a",
    "provider_id": "playngo",
    "total": 1,
    "items": [{
      "symbol": "wildframes",
      "slug": "wildframes",
      "title": "Wild Frames",
      "provider_id": "playngo",
      "launch_status": "stable"
    }]
  }
}
```

Only assigned and enabled games are returned. To retrieve a single game, use `GET /api/provider/v1/games/{symbol}`. Optional catalog fields may be added; ignore unknown response fields.

Catalog symbols (only enabled games are returned by the API):

| Game | Symbol |
|---|---|
| Demon | `demon` |
| Honey Rush | `honeyrush` |
| Hugo’s Adventure | `hugosadventure` |
| Legacy of Egypt | `legacyofegypt` |
| Moon Princess | `moonprincess` |
| Secret of the Dead | `secretofdead` |
| Troll Hunters 2 | `trollhunters2` |
| Wheel of Mictlan | `wheelofmictlan` |
| Wild Frames | `wildframes` |

Discover availability through the API. Symbols do not promise every bonus/gamble feature, language or stake. No promotional free-spin allocation API is included in v1.

`honeyrush` identifies the original Honey Rush game. It uses matching original-game records; Honey Rush Black & Yellow is a different title and is not offered under this symbol.

## 4. Create a player launch

```bash
curl "$PROVIDER_BASE_URL/api/provider/v1/launch-url" \
  -H "content-type: application/json" \
  -H "x-provider-api-key: $OPERATOR_API_KEY" \
  -H "Idempotency-Key: launch-unique-request-001" \
  --data '{
    "symbol":"wildframes",
    "external_player_id":"player-123",
    "currency":"EUR",
    "lang":"en",
    "device":"desktop",
    "return_url":"https://client.example/lobby"
  }'
```

| Field | Required | Rule |
|---|---|---|
| `symbol` | Yes | Assigned game symbol from catalog |
| `external_player_id` | Yes | Your authenticated player’s stable ID |
| `currency` | Yes | Uppercase enabled currency; immutable for this session |
| `lang` | No | Defaults to `en`; unsupported requested language is rejected |
| `device` | No | `desktop` or `mobile`; defaults to `desktop` |
| `return_url` | Yes | HTTPS URL on an approved client origin |

`Idempotency-Key` is required for this Play’n GO launch endpoint. Reuse it only when retrying the exact same launch request. Keep retry keys for at least 24 hours; the sandbox retains launch records; a mismatched request using the same key returns 409. An identical retry returns the original launch response, including its original expiry. Once that URL expires or is consumed, request a new launch with a new key. It must not create a second session while an identical request is in progress.

Example response:

```json
{
  "success": true,
  "data": {
    "symbol":"wildframes",
    "operator_id":"client-a",
    "currency":"EUR",
    "lang":"en",
    "session_id":"ses_example_01",
    "launch_url":"https://aureviagaming.com/playngo-sandbox/runtime/wildframes/casino/ContainerLauncher?ticket=EXAMPLE_ONLY",
    "expires_at":"2026-09-11T16:01:00Z"
  }
}
```

The launch ticket is opaque, single use and valid for 60 seconds from issuance. Open it promptly and do not modify it. After redemption, the game uses a separate session credential for authenticated reconnect. Session limits are 30 minutes idle and four hours absolute; expiry blocks new wagers while outstanding settlement continues.

Reconnect here means a network reconnect while the same game page remains loaded. A full page reload, browser restart or reopening a copied launch URL requires a fresh launch from your backend. Close the previous session with the session API, then request a new launch with a new idempotency key. Do not retry an already consumed ticket or reuse the old launch key for this new play session. Closing a session preserves recovery of its accepted payouts and refunds. Keep the original session and transaction IDs for reconciliation; do not create replacement wallet transactions yourself.

Your backend returns only the launch URL to the correct authenticated browser. The frontend can redirect or place it in an iframe:

```html
<iframe id="game" title="Game" allow="fullscreen" allowfullscreen
        referrerpolicy="no-referrer"
        style="width:100%;height:100dvh;border:0"></iframe>
```

Set the iframe `src` to the launch URL returned by your own backend. Your site’s content security policy must allow the assigned game origin in `frame-src`; Aurevia Gaming will configure your approved origin for framing. Validate desktop/mobile behavior and blocked third-party cookies in sandbox. Do not assume that CORS settings control whether an iframe can display a game.

Opening a new session does not cancel a payout from a previous session. A return to the lobby is a navigation event, not proof that every transaction settled.

## 5. Wallet callbacks

Aurevia Gaming calls your configured wallet base URL plus one of these paths:

| Method | Path | Operation |
|---|---|---|
| POST | `/balance` | Read the available balance |
| POST | `/debit` | Deduct an accepted wager atomically if funds are sufficient |
| POST | `/credit` | Add a win; zero amount may signal completion of a losing round |
| POST | `/rollback` | Cancel/refund the referenced debit exactly once |

Amounts and balances are **base-10 strings with exactly two decimal places**, such as `"2.00"`. Do not use binary floating-point arithmetic. Convert to integer minor units or a decimal type. The initial profile accepts only explicitly enabled currencies with two fractional digits; no automatic FX conversion occurs. This profile’s decimal-string encoding is an extension to the existing platform callback contract and is configured separately from existing provider integrations.

Every callback contains these headers:

```http
content-type: application/json
x-pp-request-id: req_example_01
x-pp-timestamp: 1789142400
x-pp-signature: HEX_HMAC_SHA256_VALUE
```

The `x-pp-*` names are retained for compatibility with the shared provider infrastructure.

Compute the signature over the exact UTF-8 request bytes:

```text
HMAC-SHA256(wallet_secret, ASCII(timestamp) + "." + raw_request_body)
```

Compare the lowercase hexadecimal signature in constant time. Accept at most 300 seconds of timestamp skew. Verify the raw body **before** parsing JSON, validate that header request ID matches body `request_id`, and require `transaction_type` to match the called endpoint. Keep server clocks synchronized. Retries receive a fresh timestamp, signature and request ID, but retain the same transaction ID and financial fields. See the tested Python, PHP and Node.js verifiers and deterministic signing fixture in `examples/`. The helpers run on your backend; they do not implement your wallet ledger for you.

### Common body

```json
{
  "operator_id":"client-a",
  "player_id":"player-123",
  "session_id":"ses_example_01",
  "game_symbol":"wildframes",
  "currency":"EUR",
  "request_id":"req_example_01",
  "transaction_id":"txn_debit_example_01",
  "transaction_type":"debit",
  "action_type":"spin",
  "amount":"2.00",
  "round_id":"rnd_example_01",
  "round_closed":false
}
```

For balance, `amount` is `"0.00"`, `action_type` is `"balance"`, and round fields are omitted. For financial operations, `round_id` and `round_closed` are required. Debit is positive and leaves the round open. Credit may be zero; a final credit closes the round. `action_type` is descriptive (`spin`, `feature`, `gamble`, `collect`, `rollback`, or `balance`) and does not override the operation selected by `transaction_type`.

Multiple game stages or free spins may belong to a single round. Apply transactions by transaction ID; never deduplicate all transactions just by round ID. Do not deduct another stake for a visual free-spin animation.

### Success

```json
{
  "success":true,
  "balance":"98.00",
  "currency":"EUR",
  "transaction_id":"txn_debit_example_01"
}
```

Return HTTP 200 with the resulting authoritative balance, matching currency and transaction ID. The provider requires these fields for every success response. For a duplicate successful financial request, return the stored original result, even if the balance changed later; do not apply it again. The game can request a fresh balance separately.

### Rejection

```json
{
  "success":false,
  "error":"insufficient_funds",
  "message":"Insufficient funds",
  "transaction_id":"txn_debit_example_01"
}
```

For an authenticated valid request with a business rejection, return HTTP 200 and `success:false`. Stable error values: `insufficient_funds`, `unknown_player`, `currency_mismatch`, `player_blocked`, `transaction_cancelled`. This is a definite rejection, so the provider does not treat it as an unknown debit.

Invalid signature/stale timestamp: 401. Wrong operator/session ownership: 403. Invalid payload: 400. Existing transaction ID with different financial fields: 409 and `idempotency_conflict`. Temporary server failure: 503. Do not return HTML for a wallet response.

### Idempotency and atomicity

Within an environment/operator, a transaction ID represents one immutable financial operation. Store it durably with a fingerprint of player, session, game, round, type, action, currency, amount, round-close flag and original debit reference. Timestamp and request ID identify delivery attempts and are excluded from that fingerprint.

In one database transaction: claim/check the ID, lock or atomically update the wallet, verify funds/currency, write the ledger entry and original response, then commit. Concurrent duplicates must wait for or read that same result. Reject changed financial fields using the same ID. Persist definitive business rejections too. Never purge deduplication data while a transaction can still be retried or reconciled; archival retention is agreed during onboarding and unresolved records do not expire.

### Rollback and out-of-order delivery

Rollback adds `original_transaction_id` referencing the original debit. Its amount and currency must match that debit; it cannot reverse an unrelated credit.

```json
{
  "operator_id":"client-a",
  "player_id":"player-123",
  "session_id":"ses_example_01",
  "game_symbol":"wildframes",
  "currency":"EUR",
  "request_id":"req_rollback_example_01",
  "transaction_id":"txn_rollback_example_01",
  "transaction_type":"rollback",
  "action_type":"rollback",
  "amount":"2.00",
  "round_id":"rnd_example_01",
  "round_closed":true,
  "original_transaction_id":"txn_debit_example_01"
}
```

If the original debit exists and is not cancelled, refund it once. If already cancelled, return success without another refund. If missing, persist a cancellation marker for that debit ID and return success without changing funds. Reject any later debit arriving under that cancelled ID. Lock/deduplicate both the rollback ID and original debit reference so two distinct rollback attempts cannot refund twice.

Aurevia Gaming will not cancel a revealed, payable round as a substitute for delivering its win. Rollback is for a failed/cancelled wager whose outcome has not been accepted for play. Keep applying valid pending credits/rollbacks after the browser closes or a session expires.

### Timeouts and recovery

Respond within the five-second callback deadline, including DNS, connection, headers and response body; normal responses should be much faster. Return uncompressed UTF-8 JSON with a maximum body size of 65,536 bytes. The provider sends `Accept-Encoding: identity` and rejects compressed responses. A network error, timeout or invalid response can mean your wallet committed the operation even though the provider did not receive confirmation.

| Situation | Expected behavior |
|---|---|
| Debit explicitly rejected | No accepted wager or payout; show the relevant game error |
| Debit response unknown | Hold play; resolve/retry the same transaction or cancel using rollback |
| Credit response unknown | Keep payout pending; retry the same credit until confirmed |
| Rollback response unknown | Retry the same cancellation; never double refund |
| Invalid signature / ownership | Reject; correct configuration before resuming |
| Browser disconnect | Settlement/recovery continues independently |

Retries use bounded backoff with jitter (approximately 1, 5, 15 and then 60 seconds), checked by a worker every five seconds. Pending obligations remain durable and appear in transaction lookup and internal diagnostics; they are not discarded after a retry count. Production alert delivery is a separate operational setup item. A fresh `/balance` request reflects the current wallet, while repeated financial transactions return their original result.

## 6. Provider API errors and retries

Example provider error:

```json
{"success":false,"error":"game_not_enabled","message":"Game is not enabled for this operator","request_id":"req_example"}
```

| HTTP | Meaning | Client action |
|---:|---|---|
| 400 / 422 | Invalid request or unsupported currency/language | Correct input |
| 401 | Missing/invalid key | Correct credentials |
| 403 | Inactive operator, unassigned game or disallowed return origin | Contact provider/configure assignment |
| 404 | Game/resource unavailable | Refresh catalog |
| 409 | Idempotency conflict | Use a new key for a different logical launch; preserve the original key/body for retries |
| 429 | Request limit | Honor `Retry-After` |
| 502 / 503 | Temporarily unavailable | Back off; retry launch with same idempotency key |

The sandbox provider API limit is 60 requests/minute per operator, excluding hosted gameplay and outgoing wallet callbacks; live limits are supplied during onboarding. Request bodies are limited to 65,536 bytes and must arrive within ten seconds; oversized bodies receive HTTP 413 and body timeouts receive HTTP 408. Transaction cursors are at most 2,048 characters. GET requests may be retried. Retry a timed-out launch only with its original key/body. Redact keys and launch tokens from logs, while retaining provider request IDs.

The initial single-VPS sandbox reserves at most **four concurrent sessions in total, two per simulated operator**. An unused launch ticket reserves a place for its 60-second lifetime; a redeemed session holds it until closed or expired. Close the previous session through the API when switching games or leaving the lobby. `503 capacity_reached` means wait and retry the same launch key; `503 maintenance` means new wagering is paused. These responses include `Retry-After: 5`. Existing accepted payouts and refunds continue during maintenance. These are conservative admission settings, not a high-volume capacity claim.

## 7. Sandbox acceptance and support

Before live enablement, demonstrate catalog/authentication, correct player launch, mobile/iframe behavior, all four callbacks, duplicate and concurrent transactions, timeout-after-commit, rollback-before-debit, insufficient funds, credit recovery and reconnect during features. Reconcile all accepted debits to final credits or confirmed cancellation.

Use sandbox balances only. Aurevia Gaming will confirm enabled currencies, features, domains, limits and production credentials after acceptance. A success response from a health endpoint or a demo game does not complete wallet certification.

For support, provide environment, UTC time, game symbol, session/round/transaction IDs, provider request ID and sanitized errors. Do not send API keys, signing secrets or active launch URLs. The support contact and operational escalation channel will be provided during onboarding.


## 8. Transaction lookup and closing sessions

`GET /api/provider/v1/transactions?limit=50` returns your operator’s transactions, newest first. Pass `data.next_cursor` as the next request’s `cursor` without modifying it. The maximum page size is 100. `GET /api/provider/v1/transactions/{transaction_id}` returns one transaction, including operation, amount, currency, round/session IDs, status, attempt count and the latest error.

| Status | Meaning |
|---|---|
| `pending`, `sending`, `unknown` | Still resolving; do not create a replacement financial transaction |
| `success` | Wallet confirmed the operation |
| `rejected` | Wallet definitively rejected a debit/balance request |
| `cancelled` | An unresolved debit was cancelled through rollback |

A confirmed debit later refunded keeps its original success record, with `cancelled_by_rollback` and a separate successful rollback. Credits and refunds rejected by a wallet remain unresolved for recovery and operator attention.

`GET /api/provider/v1/sessions/{session_id}` returns session ownership-safe metadata. `POST /api/provider/v1/sessions/{session_id}/close` blocks further gameplay and is safe to repeat. It does not cancel an accepted round or an owed win. Closed or abandoned accepted rounds are auto-collected by recovery after two minutes of inactivity; game gamble is disabled for this release.

## 9. Run the examples

- Node.js: import `launchGame` from `examples/provider.mjs`. Pass the configured provider base URL, server-only API key, player ID derived from your authenticated session, approved return URL and a persisted launch idempotency key.
- PHP: require `examples/provider.php` and call the same `launchGame` helper. PHP requires the cURL extension and a configured trusted CA bundle. A cURL 60 error means the local trust store needs configuration; keep TLS certificate verification enabled. If PHP has no system CA store configured, set `curl.cainfo` in `php.ini` to your trusted CA bundle path.
- Both launch helpers accept an optional final `device` argument: `desktop` (default) or `mobile`. Preserve the same device, game and player values when retrying an existing launch key.
- Verify callbacks against the exact raw body before your JSON middleware. The provided helpers check timestamp, HMAC, request ID, operation and operator.
- Apply each wallet mutation and its saved response in one database transaction, using a unique `(operator_id, transaction_id)` constraint and a wallet row lock. A rollback must also serialize against the original debit ID and persist a cancellation marker when the debit has not arrived.

Run `node examples/test-examples.mjs` and `php examples/test-examples.php` from this package. The fixture uses an example secret and a fixed test time. The complete persistent Python sample wallet is in the provider source under `playngo_integration/simulator.py`; its internal fault controls are not public endpoints.

The public [game demos](https://aureviagaming.com/en/games) launch a selected game with an isolated visitor wallet starting at 10,000.00 EUR. The website handles its demo credentials server-side. These simulated visitor accounts are separate from your integration player identities and wallet acceptance tests. The retired lab is restricted; authorized staff use the [administration workspace](https://aureviagaming.com/en/admin).

## 10. Automated wallet acceptance

Use Node.js 20 or later and a dedicated sandbox player funded with at least EUR 1.00. Keep that player idle in other applications during the test. Copy `examples/wallet-conformance.config.example.json` to a private file and replace its wallet URL, operator/player IDs, and signing secret. The URL is the callback base; the tool appends `/balance`, `/debit`, `/credit`, and `/rollback`.

```sh
node examples/wallet-conformance.mjs private-wallet.json private-journal.json
```

The 17 checks cover signature/timestamp/request-ID validation, concurrent duplicate debits and credits, conflicting duplicates, immutable old responses, zero wins, concurrent refunds, cancellation before debit, insufficient funds, and final balance conservation. Successful completion has zero net balance change. The test journal contains financial identifiers and results; keep both files private and out of source control.

If the connection fails after your wallet applies a payment, correct the problem and rerun with the **same config and journal**. The tool persists transaction IDs before sending money operations. Do not delete the journal, reset the balance, or assign replacement transaction IDs. A completed journal is read without repeating transactions; use a new journal for a deliberately new acceptance run. After a forcibly terminated process, remove its `.lock` file only once you confirm that process has stopped.

HTTP is disabled except for a specifically configured `local_test_host` in a local sandbox. Live funds are never permitted. Passing this tool covers the wallet contract; provider crash/recovery, game rendering, real-client acceptance, and capacity tests remain separate release requirements.

## 11. API compatibility and upgrades

`/api/provider/v1` and the `playngo-callback-v1` callback profile identify the integration contract. The software release number is separate. Updating the service does not require a new integration when that contract stays the same.

Within API v1, existing required request fields, documented response fields, signing bytes, decimal amount rules, ownership and idempotency semantics retain their meaning. New optional request fields, additional response fields and newly assigned games may be added. Ignore unknown response fields, handle errors through the documented HTTP status and error envelope, and refresh the catalog instead of hardcoding its size. Treat launch URLs, transaction IDs and pagination cursors as opaque values.

A change that removes or reinterprets an existing contract field, changes a required callback or changes financial semantics requires a separately versioned contract and an agreed migration. Keep the accepted OpenAPI files and wallet test journal with your deployment so an upgrade can be reviewed against the version you integrated.

For an operator handoff, retain the assigned origins, callback base URL, currencies, games and session limits; the completed wallet acceptance journal; and a completed launch/feature/reconnect test on the client website. API keys and signing secrets are delivered through the agreed private channel. Sandbox credentials never become live credentials by changing a URL.
