# Backend examples · API v1 / release 1.0.1

Read GUIDE.en.html, GUIDE.es.html or GUIDE.pt.html in the integration kit, or the
localized portal at https://aureviagaming.com/en/docs. Protocol field names and
sample code are intentionally identical in every documentation language.

## Run offline checks

- Node.js 20+: `node examples/test-examples.mjs`
- PHP 8+ and cURL: `php examples/test-examples.php`
- .NET SDK 8+: `dotnet run --project examples/dotnet/ExampleTests.csproj -- examples/signature-fixture.json`
- Java 17+ and Maven: from `examples/java`, run `mvn compile dependency:copy-dependencies`,
  then `java -cp "target/classes:target/dependency/*" ExampleTests ../signature-fixture.json`.
  On Windows replace the classpath separator `:` with `;`.

These checks use a published example secret and fixed test clock. They never
contact a real wallet. Run the wallet-conformance tool only against your own
configured sandbox wallet with simulated funds as described in the guide.

## Use the helpers

Use `quickstart.mjs`, `quickstart.php`, `Quickstart.cs` or `java/Quickstart.java`
inside an authenticated backend route. Load PROVIDER_BASE_URL and OPERATOR_API_KEY
from your server secret store. Pass the player ID from the server-side session.
Use the assigned HTTPS return URL. Reuse HTTP clients in Java and .NET.

The quickstart shows a **new** launch. Persist its selected game, exact body and
idempotency key before sending. For a retry, call the launch/request helper with
that stored request; do not rerun catalog selection. Never generate a new key in
a retry loop. Return only launch_url to the correct browser, and keep session_id
on your backend for lookups and closing the session. Do not log credentials or
launch URLs. Keep certificate validation on; redirects are deliberately disabled.

For callbacks, capture the raw request bytes before JSON middleware. Verify the
HMAC and delivery identity using the helper, then validate the full OpenAPI body,
player/session ownership, currency and operation-specific rules. Use integer
minor units or exact decimal arithmetic. Commit the wallet mutation, transaction
deduplication and immutable response in one database transaction. The helpers
are not a finished wallet implementation or a framework certification.

Language changes in the docs do not change game availability. The current sandbox
launch request uses EUR and lang=en. Keep API identifiers unchanged.

## Runtime references

- .NET redirects: https://learn.microsoft.com/en-us/dotnet/api/system.net.http.httpclienthandler.allowautoredirect
- .NET constant-time comparison: https://learn.microsoft.com/en-us/dotnet/api/system.security.cryptography.cryptographicoperations.fixedtimeequals
- Java HTTP client: https://docs.oracle.com/en/java/javase/17/docs/api/java.net.http/java/net/http/HttpClient.html
- Jackson: https://github.com/FasterXML/jackson-databind
