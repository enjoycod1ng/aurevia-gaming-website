# Platform compatibility and setup

**Package 1.0.1 — public sandbox.** Nine games and two simulated operator wallets are available. EUR and English game content are supported, with four concurrent sessions overall and two per operator. Use simulated funds only. Each client platform needs wallet and browser acceptance before production enablement. This is a controlled single-VPS deployment; large-scale concurrency targets are not claimed. Read the developer guide in [English](GUIDE.en.html), [Español](GUIDE.es.html) or [Português](GUIDE.pt.html).

## Can my platform integrate?

The API uses HTTPS and JSON. Your choice of programming language or database does not need to match Aurevia Gaming. Your game frontend can use your existing web framework; the hosted game opens through a returned URL.

| Client environment | Integration approach |
|---|---|
| PHP, Node.js, Python, Java, .NET, Go, Ruby or another server stack | Call the provider API from your backend and implement the same four wallet callbacks |
| Custom casino platform | Add an adapter between your wallet ledger and the callback contract |
| Hosted or proprietary casino platform | Confirm that the platform permits a custom game provider and wallet callback integration; its vendor may need to supply the adapter |
| CMS-backed website | Use a secure backend/plugin or separate integration service connected to the wallet; browser-only scripts cannot hold operator credentials |
| Static-only website | Add a backend for authenticated launch requests and wallet callbacks |
| Native mobile app | Launch the hosted web game in a tested browser/WebView, with a backend handling credentials and callbacks; native game binaries are not provided |

The package includes PHP, Node.js, C# and Java request/signature helpers with offline tests, a Python verifier, OpenAPI schemas and Postman requests. These are integration examples; a certified framework/browser matrix and a finished client wallet adapter are not included.

## Minimum capabilities

Your integration must be able to:

1. Authenticate the player and derive their stable ID on your server.
2. Send HTTPS requests with an API key and keep that key out of frontend code.
3. Serve publicly reachable, approved HTTPS wallet callback endpoints and verify their raw-body HMAC signatures.
4. Store decimal balances and apply wallet updates/idempotency records atomically, including simultaneous or repeated requests.
5. Persist transaction/cancellation records and resume processing after a restart.
6. Display the hosted game in a compatible browser and allow the assigned game origin in your website's embedding policy.

If your platform already provides a different wallet API, an adapter can translate between that API and this contract, provided it preserves player identity, amount/currency precision, transaction IDs and cancellation semantics. Endpoint translation alone does not establish financial correctness.

## Simple client flow

| Step | Client action | Result |
|---|---|---|
| 1 | Configure your assigned API key, wallet signing secret, website origins and callback base URL | Operator setup |
| 2 | Call `GET /api/provider/v1/games?provider_id=playngo` | Your enabled game list |
| 3 | Call `POST /api/provider/v1/launch-url` for the logged-in player | One session-bound launch URL |
| 4 | Open that URL in an iframe or redirect | The game loads from Aurevia Gaming |
| 5 | Handle `/balance`, `/debit`, `/credit`, `/rollback` callbacks | Your wallet remains authoritative |
| 6 | Pass sandbox tests, then receive live enablement | Production handoff |

You do not install game servers, copy game databases or implement the native game protocol. A separate game runtime per client is not required by this design. Additional clients receive their own operator configuration and isolated identities on the shared service.

## Reliability responsibilities

Aurevia Gaming will persist game rounds and callback delivery state, retry uncertain transactions with stable IDs, recover pending payouts, and isolate operators. Your wallet must process repeated deliveries without charging or crediting twice and retain cancellation markers so a late debit cannot undo a cancellation.

Callbacks can be delivered more than once. Reliability comes from one financial effect per logical transaction, durable records and reconciliation on both sides. Network delivery itself is not guaranteed to occur exactly once.

Follow [the integration guide](INTEGRATION-GUIDE.md) for the precise signing, idempotency, timeout and rollback rules. Before going live, test duplicate/concurrent callbacks, lost responses after commit, disconnects, rejected wagers, late debits and pending wins with the included resumable wallet acceptance tool and the provider's sandbox conformance suite.
