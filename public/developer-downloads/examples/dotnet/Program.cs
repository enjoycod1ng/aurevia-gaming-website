using System.Text;
using System.Text.Json;
using System.Security.Cryptography;

using var fixture = JsonDocument.Parse(File.ReadAllText(args[0]));
var f = fixture.RootElement;
var headers = f.GetProperty("headers");
var secret = f.GetProperty("example_secret").GetString()!;
var raw = f.GetProperty("raw_body").GetString()!;
var now = f.GetProperty("now").GetInt64();
var timestamp = headers.GetProperty("x-pp-timestamp").GetString()!;
var signature = headers.GetProperty("x-pp-signature").GetString()!;
var requestId = headers.GetProperty("x-pp-request-id").GetString()!;
var operatorId = f.GetProperty("expected_operator_id").GetString()!;
JsonElement Verify(string body, string sig, long clock, string op = "debit", string? req = null, string? owner = null) =>
    AureviaProvider.VerifyCallback(secret, Encoding.UTF8.GetBytes(body), timestamp, sig, req ?? requestId, op, owner ?? operatorId, clock);
void Reject(Action action) { try { action(); } catch { return; } throw new Exception("Expected rejection."); }
if (Verify(raw, signature, now).GetProperty("amount").GetString() != "2.00") throw new Exception("Fixture mismatch.");
Reject(() => Verify(raw + " ", signature, now));
Reject(() => Verify(raw, signature, now + 301));
Reject(() => Verify(raw, signature, now - 301));
Reject(() => Verify(raw, signature.ToUpperInvariant(), now));
Reject(() => Verify(raw, signature, now, "credit"));
Reject(() => Verify(raw, signature, now, req: "other"));
Reject(() => Verify(raw, signature, now, owner: "other"));
Reject(() => new AureviaProvider("http://provider.example", "example"));
var unicode = raw.Replace("player-123", "  jogador-é-玩家  ");
var signed = Convert.ToHexString(HMACSHA256.HashData(Encoding.UTF8.GetBytes(secret), Encoding.UTF8.GetBytes(timestamp + "." + unicode))).ToLowerInvariant();
if (Verify(unicode, signed, now).GetProperty("player_id").GetString() != "  jogador-é-玩家  ") throw new Exception("Identity changed.");
Console.WriteLine("C# offline fixture, tampering, clock, identity, Unicode and HTTPS checks passed.");
