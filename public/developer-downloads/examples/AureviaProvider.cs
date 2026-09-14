// .NET 8+. Server-side only. Reuse this client; obtain credentials from a secret store.
using System.Net;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;

public sealed class AureviaProvider : IDisposable
{
    private readonly HttpClient http;
    private readonly Uri baseUri;
    private readonly string apiKey;

    public AureviaProvider(string baseUrl, string apiKey)
    {
        baseUri = new Uri(baseUrl.TrimEnd('/') + "/");
        if (baseUri.Scheme != "https" || baseUri.UserInfo != "" || baseUri.Query != "" || baseUri.Fragment != "")
            throw new ArgumentException("Use the assigned HTTPS provider base URL.");
        if (string.IsNullOrEmpty(apiKey) || apiKey.Contains('\r') || apiKey.Contains('\n'))
            throw new ArgumentException("Invalid API key header.");
        this.apiKey = apiKey;
        http = new HttpClient(new HttpClientHandler { AllowAutoRedirect = false, UseCookies = false })
            { Timeout = TimeSpan.FromSeconds(15) };
    }

    public async Task<JsonElement> RequestAsync(HttpMethod method, string path, object? body = null,
        string? idempotencyKey = null, CancellationToken cancellationToken = default)
    {
        if (!path.StartsWith("api/provider/v1/", StringComparison.Ordinal) || path.Contains("..") || path.Contains('\\'))
            throw new ArgumentException("Invalid provider path.");
        using var request = new HttpRequestMessage(method, new Uri(baseUri, path));
        request.Headers.Add("X-Provider-API-Key", apiKey);
        request.Headers.Add("Accept", "application/json");
        if (idempotencyKey != null) request.Headers.Add("Idempotency-Key", idempotencyKey);
        if (body != null) request.Content = new StringContent(JsonSerializer.Serialize(body), Encoding.UTF8, "application/json");
        using var response = await http.SendAsync(request, cancellationToken);
        if (!response.IsSuccessStatusCode)
            throw new ProviderException(response.StatusCode, response.Headers.RetryAfter?.ToString());
        using var document = JsonDocument.Parse(await response.Content.ReadAsStringAsync(cancellationToken));
        return document.RootElement.GetProperty("data").Clone();
    }

    public Task<JsonElement> LaunchAsync(string authenticatedPlayerId, string returnUrl, string persistedKey,
        string symbol = "wildframes", string device = "desktop", CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrEmpty(persistedKey)) throw new ArgumentException("Persist a key before launching; reuse it with the exact body on retries.");
        if (device != "desktop" && device != "mobile") throw new ArgumentException("Invalid device.");
        return RequestAsync(HttpMethod.Post, "api/provider/v1/launch-url", new {
            symbol, external_player_id = authenticatedPlayerId, currency = "EUR", lang = "en", device, return_url = returnUrl
        }, persistedKey, cancellationToken);
    }

    public static JsonElement VerifyCallback(string secret, byte[] rawBody, string timestamp, string signature,
        string requestId, string operation, string operatorId, long? now = null)
    {
        if (string.IsNullOrEmpty(secret) || string.IsNullOrEmpty(operatorId) ||
            !new[] { "balance", "debit", "credit", "rollback" }.Contains(operation))
            throw new ArgumentException("Wallet verifier is not configured.");
        if (!Regex.IsMatch(timestamp, @"\A[0-9]{1,12}\z") ||
            Math.Abs((now ?? DateTimeOffset.UtcNow.ToUnixTimeSeconds()) - long.Parse(timestamp)) > 300 ||
            !Regex.IsMatch(signature, @"\A[a-f0-9]{64}\z")) throw new CryptographicException("Invalid signature or timestamp.");
        using var hmac = IncrementalHash.CreateHMAC(HashAlgorithmName.SHA256, Encoding.UTF8.GetBytes(secret));
        hmac.AppendData(Encoding.ASCII.GetBytes(timestamp + "."));
        hmac.AppendData(rawBody);
        if (!CryptographicOperations.FixedTimeEquals(hmac.GetHashAndReset(), Convert.FromHexString(signature)))
            throw new CryptographicException("Invalid signature.");
        using var document = JsonDocument.Parse(rawBody);
        var payload = document.RootElement;
        if (string.IsNullOrEmpty(requestId) || payload.GetProperty("request_id").GetString() != requestId ||
            payload.GetProperty("operator_id").GetString() != operatorId || payload.GetProperty("transaction_type").GetString() != operation)
            throw new InvalidOperationException("Callback identity mismatch.");
        return payload.Clone();
    }

    public void Dispose() => http.Dispose();
}

public sealed class ProviderException(HttpStatusCode status, string? retryAfter) : Exception($"Provider HTTP {(int)status}")
{
    public HttpStatusCode Status { get; } = status;
    public string? RetryAfter { get; } = retryAfter;
}

// ASP.NET: read Request.Body as bytes BEFORE JSON deserialization. Pass the four
// x-pp-* header/route values to VerifyCallback. Next validate the entire payload,
// ownership and money fields, and commit wallet + immutable response atomically.
// Signature verification alone is not a wallet implementation.
