import com.fasterxml.jackson.databind.JsonNode;

// Java 17+. Reuse AureviaProvider from your authenticated backend controller.
public final class Quickstart {
    public static JsonNode createPlayerLaunch(AureviaProvider provider, String authenticatedPlayerId,
        String persistedLaunchKey, String approvedReturnUrl) throws Exception {
        var catalog = provider.request("GET", "api/provider/v1/games?provider_id=playngo", null, null);
        var games = catalog.required("items");
        if (games.isEmpty()) throw new IllegalStateException("No games assigned.");
        var session = provider.launch(authenticatedPlayerId, approvedReturnUrl, persistedLaunchKey,
            games.get(0).required("symbol").asText(), "desktop");
        // Store session_id with this player. Return only launch_url to their browser.
        // Never log launch URLs or expose provider credentials to the frontend.
        return session;
    }
}

// Configure the reusable client with your server's secret store:
// new AureviaProvider(PROVIDER_BASE_URL, OPERATOR_API_KEY)
// Reconcile: provider.request("GET", "api/provider/v1/transactions?limit=50", null, null)
// Close: provider.request("POST", "api/provider/v1/sessions/" +
//     java.net.URLEncoder.encode(storedSessionId, java.nio.charset.StandardCharsets.UTF_8)
//       .replace("+", "%20") + "/close", null, null)
// A timed-out launch must reuse the SAME persisted key AND request body.
