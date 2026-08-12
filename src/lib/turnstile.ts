type TurnstileApiResponse = {
  success: boolean;
  challenge_ts?: string;
  hostname?: string;
  action?: string;
  cdata?: string;
  "error-codes"?: string[];
};

type VerifyTurnstileOptions = {
  token: string;
  expectedAction: string;
  remoteIp?: string;
};

export type TurnstileVerification = {
  ok: boolean;
  hostname?: string;
  action?: string;
  errorCodes: string[];
};

function csvToSet(value: string | undefined): Set<string> {
  return new Set(
    (value ?? "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
  );
}

export async function verifyTurnstileToken({
  token,
  expectedAction,
  remoteIp,
}: VerifyTurnstileOptions): Promise<TurnstileVerification> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  const allowedHostnames = csvToSet(process.env.TURNSTILE_ALLOWED_HOSTNAMES);

  if (!token || token.length > 2048) {
    return {
      ok: false,
      errorCodes: ["invalid-token"],
    };
  }

  if (!secret) {
    console.error("TURNSTILE_SECRET_KEY is not configured");

    return {
      ok: false,
      errorCodes: ["missing-server-secret"],
    };
  }

  if (allowedHostnames.size === 0) {
    console.error("TURNSTILE_ALLOWED_HOSTNAMES is not configured");

    return {
      ok: false,
      errorCodes: ["missing-allowed-hostnames"],
    };
  }

  const requestBody = new URLSearchParams({
    secret,
    response: token,
    idempotency_key: crypto.randomUUID(),
  });

  if (remoteIp) {
    requestBody.set("remoteip", remoteIp);
  }

  try {
    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: requestBody,
        cache: "no-store",
        signal: AbortSignal.timeout(8_000),
      },
    );

    if (!response.ok) {
      return {
        ok: false,
        errorCodes: [`siteverify-http-${response.status}`],
      };
    }

    const result = (await response.json()) as TurnstileApiResponse;

    const hostnameIsValid =
      typeof result.hostname === "string" &&
      allowedHostnames.has(result.hostname);

    const actionIsValid = result.action === expectedAction;

    return {
      ok: result.success === true && hostnameIsValid && actionIsValid,
      hostname: result.hostname,
      action: result.action,
      errorCodes: result["error-codes"] ?? [],
    };
  } catch (error) {
    console.error(
      "Turnstile Siteverify request failed:",
      error instanceof Error ? error.message : error,
    );

    return {
      ok: false,
      errorCodes: ["siteverify-unavailable"],
    };
  }
}
