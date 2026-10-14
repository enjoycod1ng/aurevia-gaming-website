// Java 17+ and Jackson (see pom.xml). Backend only; never expose API keys to a browser.
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.net.URI;
import java.net.http.*;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Duration;
import java.time.Instant;
import java.util.*;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

public final class AureviaProvider {
    private static final ObjectMapper JSON = new ObjectMapper();
    private final HttpClient http = HttpClient.newBuilder().followRedirects(HttpClient.Redirect.NEVER)
        .connectTimeout(Duration.ofSeconds(5)).build();
    private final URI base;
    private final String key;

    public AureviaProvider(String baseUrl, String apiKey) {
        base = URI.create(baseUrl.replaceAll("/+$", "") + "/");
        if (!"https".equals(base.getScheme()) || base.getHost() == null || base.getUserInfo() != null ||
            base.getQuery() != null || base.getFragment() != null) throw new IllegalArgumentException("Use the assigned HTTPS base URL.");
        if (apiKey == null || apiKey.isEmpty() || apiKey.contains("\r") || apiKey.contains("\n"))
            throw new IllegalArgumentException("Invalid API key header.");
        key = apiKey;
    }

    public JsonNode request(String method, String path, Object body, String persistedKey) throws Exception {
        if (!path.startsWith("api/provider/v1/") || path.contains("..") || path.contains("\\"))
            throw new IllegalArgumentException("Invalid provider path.");
        var builder = HttpRequest.newBuilder(base.resolve(path)).timeout(Duration.ofSeconds(15))
            .header("X-Provider-API-Key", key).header("Accept", "application/json");
        if (persistedKey != null) builder.header("Idempotency-Key", persistedKey);
        var publisher = HttpRequest.BodyPublishers.noBody();
        if (body != null) {
            builder.header("Content-Type", "application/json");
            publisher = HttpRequest.BodyPublishers.ofString(JSON.writeValueAsString(body), StandardCharsets.UTF_8);
        }
        var response = http.send(builder.method(method, publisher).build(), HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
        if (response.statusCode() < 200 || response.statusCode() >= 300)
            throw new ProviderException(response.statusCode(), response.headers().firstValue("Retry-After").orElse(null));
        return JSON.readTree(response.body()).required("data");
    }

    public JsonNode launch(String authenticatedPlayerId, String returnUrl, String persistedKey, String symbol, String device) throws Exception {
        if (persistedKey == null || persistedKey.isEmpty()) throw new IllegalArgumentException("Persist the launch key before sending; reuse it on retries.");
        if (!Set.of("desktop", "mobile").contains(device)) throw new IllegalArgumentException("Invalid device.");
        return request("POST", "api/provider/v1/launch-url", Map.of("symbol", symbol,
            "external_player_id", authenticatedPlayerId, "currency", "EUR", "lang", "en", "device", device,
            "return_url", returnUrl), persistedKey);
    }

    public static JsonNode verifyCallback(String secret, byte[] rawBody, String timestamp, String signature,
        String requestId, String operation, String operatorId, long now) throws Exception {
        if (secret == null || secret.isEmpty() || operatorId == null || operatorId.isEmpty() ||
            !Set.of("balance", "debit", "credit", "rollback").contains(operation)) throw new IllegalArgumentException("Verifier is not configured.");
        if (timestamp == null || !timestamp.matches("[0-9]{1,12}") ||
            Math.abs(now - Long.parseLong(timestamp)) > 300 || signature == null || !signature.matches("[a-f0-9]{64}"))
            throw new SecurityException("Invalid signature or timestamp.");
        var mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
        mac.update((timestamp + ".").getBytes(StandardCharsets.US_ASCII));
        if (!MessageDigest.isEqual(mac.doFinal(rawBody), HexFormat.of().parseHex(signature))) throw new SecurityException("Invalid signature.");
        var payload = JSON.readTree(rawBody);
        if (requestId == null || requestId.isEmpty() || !payload.path("request_id").isTextual() ||
            !requestId.equals(payload.path("request_id").asText()) || !operatorId.equals(payload.path("operator_id").asText()) ||
            !operation.equals(payload.path("transaction_type").asText())) throw new SecurityException("Callback identity mismatch.");
        return payload;
    }

    public static final class ProviderException extends Exception {
        public final int status;
        public final String retryAfter;
        ProviderException(int status, String retryAfter) {
            super("Provider HTTP " + status); this.status = status; this.retryAfter = retryAfter;
        }
    }
}
// In your callback controller preserve raw byte[] before parsing, use
// Instant.now().getEpochSecond() for now, then validate the full wallet contract
// and commit ownership checks, ledger mutation and immutable response atomically.
