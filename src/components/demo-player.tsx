"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type SyntheticEvent,
} from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n";
import type { DemoCopy } from "@/content/demo-copy";
import { PortalError, portalRequest } from "@/lib/portal-client";

type Launch = { session_id: string; launch_url: string; currency: string };
export function DemoPlayer({
  game,
  title,
  locale,
  copy,
}: {
  game: string;
  title: string;
  locale: Locale;
  copy: DemoCopy;
}) {
  const [launch, setLaunch] = useState<Launch | null>(null);
  const [balance, setBalance] = useState("10000.00");
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState("");
  const initial = useRef<Promise<Launch> | null>(null);
  const session = useRef<string | null>(null);
  const player = useRef<HTMLDivElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const requestId = useRef("");
  const restartIntent = useRef(false);
  const router = useRouter();

  const requestLaunch = useCallback(async (): Promise<Launch> => {
    await portalRequest("demo/visitor", {});
    requestId.current ||= crypto.randomUUID();
    return portalRequest<Launch>("demo/launch", {
      game,
      locale,
      request_id: requestId.current,
      restart: restartIntent.current,
    });
  }, [game, locale]);
  const showError = useCallback(
    (reason: unknown) => {
      const code =
        reason instanceof PortalError ? reason.code : "service_unavailable";
      setError(
        code === "capacity_reached" || code === "rate_limited"
          ? copy.busy
          : code === "maintenance"
            ? copy.maintenance
            : code === "demo_request_consumed"
              ? copy.expired
              : copy.unavailable,
      );
      if (code === "demo_request_consumed") {
        requestId.current = "";
        restartIntent.current = false;
      }
      setBusy(false);
    },
    [copy],
  );
  const accept = useCallback(
    (result: Launch) => {
      const url = new URL(result.launch_url, location.origin);
      if (
        url.origin !== location.origin ||
        !url.pathname.startsWith(`/playngo-sandbox/runtime/${game}/`)
      )
        throw new Error("Unexpected game destination");
      session.current = result.session_id;
      setLaunch(result);
      setError("");
      setBusy(false);
      portalRequest<{ balance: string }>("demo/state")
        .then((state) => setBalance(state.balance))
        .catch(() => {});
    },
    [game],
  );

  useEffect(() => {
    let active = true;
    initial.current ??= requestLaunch();
    initial.current
      .then((result) => {
        if (active) accept(result);
      })
      .catch((reason) => {
        if (active) showError(reason);
      });
    return () => {
      active = false;
    };
  }, [requestLaunch, accept, showError]);
  useEffect(() => {
    const close = () => {
      if (session.current)
        navigator.sendBeacon(
          `/api/portal/demo/sessions/${session.current}/close`,
          new Blob(["{}"], { type: "application/json" }),
        );
    };
    window.addEventListener("pagehide", close);
    const timer = window.setInterval(() => {
      if (!session.current || document.hidden) return;
      portalRequest<{ balance: string }>("demo/state")
        .then((state) => setBalance(state.balance))
        .catch(() => {});
    }, 10000);
    return () => {
      close();
      clearInterval(timer);
      window.removeEventListener("pagehide", close);
    };
  }, []);
  async function start(restart = false) {
    dialog.current?.close();
    setBusy(true);
    setError("");
    setLaunch(null);
    if (restart) {
      requestId.current = "";
      restartIntent.current = true;
    }
    try {
      accept(await requestLaunch());
    } catch (reason) {
      showError(reason);
    }
  }
  async function exit() {
    if (session.current) {
      try {
        await portalRequest(`demo/sessions/${session.current}/close`, {});
      } catch {
        /* Expiry also releases abandoned sessions. */
      }
      session.current = null;
    }
    router.push(`/${locale}/games`);
  }
  function frameLoaded(event: SyntheticEvent<HTMLIFrameElement>) {
    if (!launch || session.current !== launch.session_id) return;
    try {
      const frame = event.currentTarget.contentWindow as
        (Window & { __pngSession?: { id?: string } }) | null;
      if (
        frame?.document.URL === "about:blank" ||
        frame?.__pngSession?.id === launch.session_id
      )
        return;
    } catch {
      /* A valid runtime stays on the verified same origin. */
    }
    // Runtime HTTP errors also fire iframe load. Do not leave a failed launcher
    // embedded in the player, or reuse a potentially consumed launch ticket.
    portalRequest(`demo/sessions/${launch.session_id}/close`, {}).catch(
      () => {},
    );
    session.current = null;
    requestId.current = "";
    restartIntent.current = false;
    setLaunch(null);
    showError(new Error("Runtime did not initialize"));
  }
  return (
    <main id="main-content" className="container py-8 sm:py-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-gold-bright">
            <span>Play’n GO</span> · {copy.title}
          </p>
          <h1 className="mt-2 text-3xl sm:text-4xl">{title}</h1>
        </div>
        <button className="button button-secondary" onClick={exit}>
          ← {copy.back}
        </button>
      </div>
      <p className="mt-5 max-w-3xl text-muted">{copy.notice}</p>
      <div className="mt-6 overflow-hidden rounded-2xl border border-line bg-surface shadow-panel">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line p-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">
              {copy.balance}
            </p>
            <p className="text-2xl font-semibold tabular-nums">
              {new Intl.NumberFormat(locale, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }).format(Number(balance))}{" "}
              <span className="text-sm font-normal text-muted">EUR</span>
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              className="button button-secondary"
              disabled={busy}
              onClick={() => dialog.current?.showModal()}
            >
              {copy.restart}
            </button>
            <button
              className="button button-secondary"
              disabled={!launch}
              onClick={() =>
                player.current?.requestFullscreen().catch(() => {})
              }
            >
              {copy.fullscreen}
            </button>
          </div>
        </div>
        <div
          ref={player}
          className="relative min-h-[55svh] bg-[#090c12] sm:aspect-video sm:min-h-0"
        >
          {launch && (
            <iframe
              key={launch.session_id}
              src={launch.launch_url}
              onLoad={frameLoaded}
              title={`${title} — ${copy.title}`}
              className="absolute inset-0 h-full min-h-[55svh] w-full border-0 sm:min-h-0"
              allow="fullscreen; autoplay"
              referrerPolicy="no-referrer"
            />
          )}
          {!launch && (
            <div
              className="absolute inset-0 flex flex-col items-center justify-center gap-5 p-8 text-center text-white"
              aria-live="polite"
            >
              {busy ? (
                <>
                  <span
                    className="size-10 animate-spin rounded-full border-2 border-white/20 border-t-[#d4af37] motion-reduce:animate-none"
                    aria-hidden="true"
                  />
                  <p className="text-xl font-semibold">{copy.loading}</p>
                  <p className="text-sm text-white/70">{copy.loadingHint}</p>
                </>
              ) : (
                <>
                  <p className="max-w-lg text-lg" role="alert">
                    {error}
                  </p>
                  <button
                    className="button button-primary"
                    onClick={() => start()}
                  >
                    {copy.retry}
                  </button>
                </>
              )}
            </div>
          )}
        </div>
        <div className="flex flex-wrap justify-between gap-2 px-4 py-3 text-xs text-muted">
          <span>{copy.simulated}</span>
          <span>{copy.runtimeNote}</span>
        </div>
      </div>
      <dialog
        ref={dialog}
        className="portal-dialog"
        aria-labelledby="restart-title"
      >
        <h2 id="restart-title" className="text-2xl">
          {copy.restartTitle}
        </h2>
        <p className="mt-4 text-muted">{copy.restartBody}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            className="button button-secondary"
            onClick={() => dialog.current?.close()}
          >
            {copy.cancel}
          </button>
          <button className="button button-primary" onClick={() => start(true)}>
            {copy.restart}
          </button>
        </div>
      </dialog>
    </main>
  );
}
