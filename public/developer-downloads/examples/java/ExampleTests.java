import com.fasterxml.jackson.databind.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.util.HexFormat;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

public final class ExampleTests {
    interface Check { void run() throws Exception; }
    static void reject(Check check) throws Exception {
        try { check.run(); } catch (Exception expected) { return; }
        throw new AssertionError("Expected rejection");
    }
    public static void main(String[] args) throws Exception {
        var f = new ObjectMapper().readTree(Files.readString(Path.of(args[0])));
        var h = f.required("headers");
        var secret = f.required("example_secret").asText();
        var raw = f.required("raw_body").asText().getBytes(StandardCharsets.UTF_8);
        var now = f.required("now").asLong();
        var time = h.required("x-pp-timestamp").asText();
        var sig = h.required("x-pp-signature").asText();
        var req = h.required("x-pp-request-id").asText();
        var owner = f.required("expected_operator_id").asText();
        if (!"2.00".equals(AureviaProvider.verifyCallback(secret, raw, time, sig, req, "debit", owner, now).required("amount").asText())) throw new AssertionError("Fixture mismatch");
        reject(() -> AureviaProvider.verifyCallback(secret, (new String(raw, StandardCharsets.UTF_8) + " ").getBytes(StandardCharsets.UTF_8), time, sig, req, "debit", owner, now));
        reject(() -> AureviaProvider.verifyCallback(secret, raw, time, sig, req, "debit", owner, now + 301));
        reject(() -> AureviaProvider.verifyCallback(secret, raw, time, sig, req, "debit", owner, now - 301));
        reject(() -> AureviaProvider.verifyCallback(secret, raw, time, sig.toUpperCase(), req, "debit", owner, now));
        reject(() -> AureviaProvider.verifyCallback(secret, raw, time, sig, req, "credit", owner, now));
        reject(() -> AureviaProvider.verifyCallback(secret, raw, time, sig, "other", "debit", owner, now));
        reject(() -> AureviaProvider.verifyCallback(secret, raw, time, sig, req, "debit", "other", now));
        reject(() -> new AureviaProvider("http://provider.example", "example"));
        var unicode = new String(raw, StandardCharsets.UTF_8).replace("player-123", "  jogador-é-玩家  ").getBytes(StandardCharsets.UTF_8);
        var mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
        mac.update((time + ".").getBytes(StandardCharsets.US_ASCII));
        var signed = HexFormat.of().formatHex(mac.doFinal(unicode));
        if (!"  jogador-é-玩家  ".equals(AureviaProvider.verifyCallback(secret, unicode, time, signed, req, "debit", owner, now).required("player_id").asText())) throw new AssertionError("Identity changed");
        System.out.println("Java offline fixture, tampering, clock, identity, Unicode and HTTPS checks passed.");
    }
}
