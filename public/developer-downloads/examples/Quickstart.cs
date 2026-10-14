// .NET 8+. Register/reuse AureviaProvider in your backend's dependency container.
using System.Text.Json;

public static class Quickstart
{
    public static async Task<JsonElement> CreatePlayerLaunch(AureviaProvider provider,
        string authenticatedPlayerId, string persistedLaunchKey, string approvedReturnUrl)
    {
        var catalog = await provider.RequestAsync(HttpMethod.Get, "api/provider/v1/games?provider_id=playngo");
        var games = catalog.GetProperty("items");
        if (games.GetArrayLength() == 0) throw new InvalidOperationException("No games assigned.");
        var session = await provider.LaunchAsync(authenticatedPlayerId, approvedReturnUrl,
            persistedLaunchKey, games[0].GetProperty("symbol").GetString()!, "desktop");
        // Store session_id with this player. Return only launch_url to their browser.
        // Never log launch URLs or expose provider credentials to the frontend.
        return session;
    }
}

// Configure the reusable client from your server's secret store:
// new AureviaProvider(PROVIDER_BASE_URL, OPERATOR_API_KEY)
// Reconcile: provider.RequestAsync(HttpMethod.Get, "api/provider/v1/transactions?limit=50")
// Close: provider.RequestAsync(HttpMethod.Post,
//     $"api/provider/v1/sessions/{Uri.EscapeDataString(storedSessionId)}/close")
// A timed-out launch must reuse the SAME persisted key AND request body.
