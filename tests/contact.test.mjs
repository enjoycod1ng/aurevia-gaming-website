import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { loadModule } from "./load-module.mjs";

const { POST } = loadModule("src/app/api/contact/route.ts");
const { isValidContact } = loadModule("src/lib/contact-validation.ts");
const { siteContent } = loadModule("src/content/site-content.ts");
const { getSiteContent } = loadModule("src/content/localized-content.ts");
const { ContactForm } = loadModule("src/components/contact/contact-form.tsx");

const site = new URL(siteContent.brand.url);
const WEBHOOK_HOST = "hooks.example.test";

// The rate limiter keeps state for the whole file, so each request gets its
// own visitor address unless a test is about sharing one.
let lastIp = 0;
const uniqueIp = () => `198.51.100.${++lastIp}`;

function useEnv(t, overrides = {}) {
  const vars = {
    NODE_ENV: "production",
    TURNSTILE_SECRET_KEY: "test-secret",
    TURNSTILE_ALLOWED_HOSTNAMES: site.hostname,
    TELEGRAM_BOT_TOKEN: "test-bot-token",
    TELEGRAM_CHAT_ID: "1001",
    CONTACT_WEBHOOK_URL: `https://${WEBHOOK_HOST}/quote`,
    CONTACT_WEBHOOK_BEARER_TOKEN: undefined,
    ...overrides,
  };
  const set = (name, value) => {
    if (value === undefined) delete process.env[name];
    else process.env[name] = value;
  };
  const previous = Object.keys(vars).map((name) => [name, process.env[name]]);
  t.after(() => previous.forEach(([name, value]) => set(name, value)));
  Object.entries(vars).forEach(([name, value]) => set(name, value));
}

// Every outbound call is answered here; nothing reaches Cloudflare, Telegram
// or a real webhook.
function stubFetch(t, handlers = {}) {
  const {
    siteverify = () => Response.json({ success: true, hostname: site.hostname, action: "request_quote" }),
    telegram = () => Response.json({ ok: true }),
    webhook = () => Response.json({ ok: true }),
  } = handlers;
  const calls = [];
  t.mock.method(globalThis, "fetch", async (input, init) => {
    const url = new URL(String(input));
    calls.push({ host: url.hostname, init });
    if (url.hostname === "challenges.cloudflare.com") return siteverify(init);
    if (url.hostname === "api.telegram.org") return telegram(init);
    if (url.hostname === WEBHOOK_HOST) return webhook(init);
    throw new Error(`Unexpected request to ${url.origin}`);
  });
  return calls;
}

function quoteForm(overrides = {}) {
  const fields = {
    name: "Ana Silva",
    contact: "ana@example.com",
    company: "",
    targetMarket: "Brazil",
    service: "Casino website",
    project: "",
    budget: "",
    timeline: "",
    message: "We need a casino website with a game lobby and wallet.",
    consent: "accepted",
    "cf-turnstile-response": "turnstile-token",
    ...overrides,
  };
  const form = new FormData();
  for (const [name, value] of Object.entries(fields)) {
    if (value !== undefined) form.set(name, value);
  }
  return form;
}

function contactRequest({ body = quoteForm(), ip = uniqueIp(), origin = site.origin, json = true, headers = {}, duplex } = {}) {
  return new Request(new URL("/api/contact", site), {
    method: "POST",
    body,
    duplex,
    headers: {
      ...(origin ? { Origin: origin } : {}),
      ...(ip ? { "X-Real-IP": ip } : {}),
      ...(json ? { Accept: "application/json" } : {}),
      ...headers,
    },
  });
}

async function assertResult(response, httpStatus, status) {
  assert.equal(response.status, httpStatus);
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.deepEqual(await response.json(), { ok: status === "success", status });
}

test("contact values follow the server rule: an email or a 5-32 character @handle", () => {
  for (const value of ["ana@example.com", " ana@example.com ", "@studio", "@studio_team_2026", `@${"a".repeat(32)}`]) {
    assert.equal(isValidContact(value), true, value);
  }
  for (const value of ["", "   ", "ana@example", "ana example@x.com", "@abcd", `@${"a".repeat(33)}`, "@studio-team", "studio", `${"a".repeat(149)}@example.com`]) {
    assert.equal(isValidContact(value), false, value);
  }
});

test("production rejects posts from other origins before reading them", async (t) => {
  useEnv(t);
  const calls = stubFetch(t);
  for (const origin of ["https://evil.example", undefined]) {
    await assertResult(await POST(contactRequest({ origin: origin ?? null })), 403, "invalid");
  }
  const www = new URL(site);
  www.hostname = `www.${site.hostname}`;
  await assertResult(await POST(contactRequest({ origin: www.origin, body: new FormData() })), 400, "invalid");
  assert.equal(calls.length, 0);
});

test("honeypot submissions look successful but are never verified or delivered", async (t) => {
  useEnv(t);
  const calls = stubFetch(t);
  await assertResult(await POST(contactRequest({ body: quoteForm({ website: "https://spam.example" }) })), 200, "success");
  assert.equal(calls.length, 0);
});

test("invalid fields are rejected before Turnstile or delivery", async (t) => {
  useEnv(t);
  const calls = stubFetch(t);
  const invalid = [
    { name: " " },
    { contact: "ana@example" },
    { contact: "@abc" },
    { contact: `${"a".repeat(149)}@example.com` },
    // A deep-link project label is not one of the offered services.
    { service: "Game API integration" },
    { message: "Too short" },
    { consent: undefined },
  ];
  for (const overrides of invalid) {
    await assertResult(await POST(contactRequest({ body: quoteForm(overrides) })), 400, "invalid");
  }
  await assertResult(await POST(contactRequest({ body: "name=Ana", headers: { "Content-Type": "text/plain" } })), 400, "invalid");
  assert.equal(calls.length, 0);
});

test("Turnstile failures map to verification or unavailable without delivering", async (t) => {
  const cases = [
    ["missing token", { form: { "cf-turnstile-response": undefined } }, 400, "verification"],
    ["rejected token", { siteverify: () => Response.json({ success: false, "error-codes": ["invalid-input-response"] }) }, 400, "verification"],
    ["foreign hostname", { siteverify: () => Response.json({ success: true, hostname: "evil.example", action: "request_quote" }) }, 400, "verification"],
    ["wrong action", { siteverify: () => Response.json({ success: true, hostname: site.hostname, action: "login" }) }, 400, "verification"],
    ["Siteverify HTTP error", { siteverify: () => new Response("busy", { status: 500 }) }, 503, "unavailable"],
    ["Siteverify unreachable", { siteverify: () => { throw new TypeError("fetch failed"); } }, 503, "unavailable"],
    ["missing secret", { env: { TURNSTILE_SECRET_KEY: undefined } }, 503, "unavailable"],
    ["missing hostnames", { env: { TURNSTILE_ALLOWED_HOSTNAMES: undefined } }, 503, "unavailable"],
  ];
  for (const [name, { form, siteverify, env }, httpStatus, status] of cases) {
    await t.test(name, async (t) => {
      useEnv(t, env);
      t.mock.method(console, "warn", () => {});
      t.mock.method(console, "error", () => {});
      const calls = stubFetch(t, { siteverify });
      await assertResult(await POST(contactRequest({ body: quoteForm(form) })), httpStatus, status);
      assert.ok(calls.every((call) => call.host === "challenges.cloudflare.com"));
    });
  }
});

test("verified requests go to Telegram with the Nginx-verified IP sent to Turnstile", async (t) => {
  useEnv(t);
  const calls = stubFetch(t);
  const ip = uniqueIp();
  await assertResult(await POST(contactRequest({ ip, body: quoteForm({ contact: "@studio_team" }) })), 200, "success");
  assert.deepEqual(calls.map((call) => call.host), ["challenges.cloudflare.com", "api.telegram.org"]);
  assert.equal(calls[0].init.body.get("remoteip"), ip);
  assert.match(JSON.parse(calls[1].init.body).text, /^Email or Telegram: @studio_team$/m);
});

test("the webhook takes over when Telegram fails, whether it errors or throws", async (t) => {
  const failures = [
    ["HTTP error", () => new Response("Bad Request", { status: 400 })],
    ["timeout", () => { throw new DOMException("The operation was aborted due to timeout", "TimeoutError"); }],
    ["DNS failure", () => { throw new TypeError("fetch failed"); }],
  ];
  for (const [name, telegram] of failures) {
    await t.test(name, async (t) => {
      useEnv(t);
      const errors = t.mock.method(console, "error", () => {});
      const calls = stubFetch(t, { telegram });
      await assertResult(await POST(contactRequest()), 200, "success");
      const webhook = calls.find((call) => call.host === WEBHOOK_HOST);
      assert.ok(webhook, "webhook was not called");
      assert.equal(JSON.parse(webhook.init.body).contact, "ana@example.com");
      assert.equal(errors.mock.callCount(), 1);
    });
  }

  await t.test("both channels fail", async (t) => {
    useEnv(t);
    t.mock.method(console, "error", () => {});
    stubFetch(t, {
      telegram: () => { throw new TypeError("fetch failed"); },
      webhook: () => { throw new TypeError("fetch failed"); },
    });
    await assertResult(await POST(contactRequest()), 502, "error");
  });

  await t.test("Telegram fails and no webhook is configured", async (t) => {
    useEnv(t, { CONTACT_WEBHOOK_URL: undefined });
    t.mock.method(console, "error", () => {});
    stubFetch(t, { telegram: () => { throw new TypeError("fetch failed"); } });
    await assertResult(await POST(contactRequest()), 502, "error");
  });

  await t.test("no delivery channel configured", async (t) => {
    useEnv(t, { TELEGRAM_BOT_TOKEN: undefined, CONTACT_WEBHOOK_URL: undefined });
    stubFetch(t);
    await assertResult(await POST(contactRequest()), 503, "unavailable");
  });
});

test("bodies over 32 KB are refused while streaming, with or without Content-Length", async (t) => {
  useEnv(t);
  const calls = stubFetch(t);
  const chunk = new Uint8Array(1024).fill(97);
  let pulled = 0;
  // 1 MB sent in chunks with no Content-Length, as a chunked upload would be.
  const body = new ReadableStream({
    pull(controller) {
      if (++pulled > 1024) controller.close();
      else controller.enqueue(chunk);
    },
  });
  const headers = { "Content-Type": "application/x-www-form-urlencoded" };
  await assertResult(await POST(contactRequest({ body, duplex: "half", headers })), 413, "invalid");
  assert.ok(pulled < 40, `read ${pulled} KB before giving up`);

  await assertResult(await POST(contactRequest({ body: `message=${"a".repeat(33 * 1024)}`, headers })), 413, "invalid");
  await assertResult(await POST(contactRequest({ body: "name=Ana", headers: { ...headers, "Content-Length": String(64 * 1024) } })), 413, "invalid");
  assert.equal(calls.length, 0);
});

test("rate limits apply per verified IP, with a shared higher limit when X-Real-IP is missing", async (t) => {
  useEnv(t);
  const warnings = t.mock.method(console, "warn", () => {});
  stubFetch(t);
  const ip = uniqueIp();
  for (let attempt = 1; attempt <= 5; attempt += 1) {
    assert.equal((await POST(contactRequest({ ip, body: new FormData() }))).status, 400, `attempt ${attempt}`);
  }
  const limited = await POST(contactRequest({ ip }));
  assert.ok(Number(limited.headers.get("retry-after")) > 0);
  await assertResult(limited, 429, "rate-limited");

  const redirected = await POST(contactRequest({ ip, json: false }));
  assert.equal(redirected.status, 303);
  assert.equal(new URL(redirected.headers.get("location")).searchParams.get("status"), "rate-limited");
  assert.ok(Number(redirected.headers.get("retry-after")) > 0);

  // Another visitor is unaffected.
  assert.equal((await POST(contactRequest({ body: new FormData() }))).status, 400);

  // Without a verified address five requests must not lock everyone out.
  for (let attempt = 1; attempt <= 30; attempt += 1) {
    const unverifiedIp = attempt % 2 ? null : "not-an-ip";
    assert.equal((await POST(contactRequest({ ip: unverifiedIp, body: new FormData() }))).status, 400, `attempt ${attempt}`);
  }
  await assertResult(await POST(contactRequest({ ip: null })), 429, "rate-limited");
  assert.equal(warnings.mock.callCount(), 1);
  assert.equal((await POST(contactRequest({ body: new FormData() }))).status, 400);
});

test("form posts without fetch headers get a localized 303 redirect", async (t) => {
  useEnv(t);
  stubFetch(t);
  const honeypot = quoteForm({ website: "bot" });
  const fromPortuguese = await POST(contactRequest({ json: false, body: honeypot, headers: { Referer: `${site.origin}/pt/contact` } }));
  assert.equal(fromPortuguese.status, 303);
  assert.equal(fromPortuguese.headers.get("cache-control"), "no-store");
  const location = new URL(fromPortuguese.headers.get("location"));
  assert.equal(`${location.pathname}${location.search}${location.hash}`, "/pt/contact?status=success#quote-form");

  const foreign = await POST(contactRequest({ json: false, body: new FormData(), headers: { Referer: "https://evil.example/es/contact" } }));
  assert.equal(new URL(foreign.headers.get("location")).pathname, "/en/contact");

  const fetchClient = await POST(contactRequest({ json: false, body: new FormData(), headers: { "X-Requested-With": "fetch" } }));
  await assertResult(fetchClient, 400, "invalid");
});

test("contact deep links preselect the service they name", () => {
  const { projectValues } = siteContent.contactPage.form;
  const links = [];
  (function visit(value, key) {
    if (key === "href" && typeof value === "string" && value.startsWith("/contact?")) links.push(new URL(value, site));
    else if (value && typeof value === "object") Object.entries(value).forEach(([name, item]) => visit(item, name));
  })(siteContent);
  assert.ok(links.length >= 12, `found ${links.length} contact links`);
  for (const link of links) {
    assert.ok(projectValues.includes(link.searchParams.get("service")), `${link.search} names no offered service`);
  }
  assert.equal(new URL(siteContent.platformPage.hero.primaryAction.href, site).searchParams.get("service"), "Admin panel");

  const content = getSiteContent("es").contactPage.form;
  const render = (props) => renderToStaticMarkup(createElement(ContactForm, { content, requestedProject: "", requestedService: "", ...props }));
  const checked = (markup) => markup.match(/<input[^>]*name="service"[^>]*>/g).filter((input) => / checked=""/.test(input)).map((input) => input.match(/value="([^"]*)"/)[1]);
  assert.deepEqual(checked(render({ requestedService: "Admin panel", requestedProject: "Admin panel / operator platform" })), ["Admin panel"]);
  assert.deepEqual(checked(render({ requestedProject: "Web / mobile casino" })), ["Web / mobile casino"]);
  assert.deepEqual(checked(render({ requestedService: "Unknown" })), [projectValues[0]]);
});

test("the quote form keeps its live regions mounted and its submit button focusable", () => {
  const content = getSiteContent("en").contactPage.form;
  const markup = renderToStaticMarkup(createElement(ContactForm, { content, requestedProject: "", requestedService: "" }));
  assert.match(markup, /<div role="status" aria-live="polite"><\/div><div role="alert"><\/div>/);
  const button = markup.match(/<button[^>]*type="submit"[^>]*>/)[0];
  assert.match(button, /aria-disabled="true"/);
  assert.doesNotMatch(button, /\sdisabled=/);
  assert.match(markup.match(/<input[^>]*name="contact"[^>]*>/)[0], /aria-invalid="false"/);

  const withError = renderToStaticMarkup(createElement(ContactForm, { content, requestedProject: "", requestedService: "", status: content.statusMessages.error }));
  assert.match(withError, /<div role="status" aria-live="polite"><\/div><div role="alert"><p[^>]*tabindex="-1"[^>]*>The message could not be delivered/);
  const withSuccess = renderToStaticMarkup(createElement(ContactForm, { content, requestedProject: "", requestedService: "", status: content.statusMessages.success }));
  assert.match(withSuccess, /<div role="status" aria-live="polite"><p[^>]*tabindex="-1"[^>]*>Thank you\.[^<]*<\/p><\/div><div role="alert"><\/div>/);
});
