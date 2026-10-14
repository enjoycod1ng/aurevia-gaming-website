"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import type { AdminCopy } from "@/content/admin-copy";
import { CopyValue, Field, Notice, useAction, type User } from "./common";

export function AdminLogin({
  copy,
  onLogin,
}: {
  copy: AdminCopy;
  onLogin: (user: User) => void;
}) {
  // This form mounts after the client session check, so invitation fragments
  // stay out of server requests and can initialize the activation form directly.
  const [token, setToken] = useState(() =>
    typeof window === "undefined"
      ? ""
      : (new URLSearchParams(location.hash.slice(1)).get("invite") ?? ""),
  );
  const [activate, setActivate] = useState(Boolean(token));
  const [setup, setSetup] = useState<{
    username: string;
    secret: string;
    uri: string;
    qr: string;
  } | null>(null);
  const action = useAction(copy);
  useEffect(() => {
    const invite = new URLSearchParams(location.hash.slice(1)).get("invite");
    if (invite)
      history.replaceState(null, "", location.pathname + location.search);
  }, []);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    if (activate && !setup) {
      const result = await action.run<{
        username: string;
        secret: string;
        uri: string;
        qr: string;
      }>("admin/enroll/begin", { token });
      if (result) setSetup(result);
      return;
    }
    const result = await action.run<{ user: User }>(
      activate ? "admin/enroll/finish" : "admin/login",
      {
        ...(activate ? { token } : { username: form.get("username") }),
        password: form.get("password"),
        code: form.get("code"),
      },
    );
    if (result) {
      setToken("");
      setSetup(null);
      onLogin(result.user);
    }
  }
  return (
    <div className="mx-auto max-w-lg py-12 sm:py-20">
      <div className="portal-card p-6 sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[.15em] text-gold-bright">
          Aurevia Gaming
        </p>
        <h1 className="mt-4 text-3xl">
          {activate ? copy.activate : copy.signIn}
        </h1>
        <p className="mt-4 text-sm text-muted">
          {setup ? copy.mfaHint : copy.loginHint}
        </p>
        <form className="mt-7 space-y-5" onSubmit={submit}>
          {action.error && <Notice error>{action.error}</Notice>}
          {activate && !setup ? (
            <Field label={copy.inviteToken}>
              <input
                className="portal-input"
                value={token}
                onChange={(event) => setToken(event.target.value)}
                required
                minLength={32}
                maxLength={128}
                autoComplete="off"
              />
            </Field>
          ) : (
            <>
              {setup ? (
                <div className="rounded-xl border border-line p-4">
                  <p className="mb-3 text-sm font-medium">
                    {copy.setupKey} · {setup.username}
                  </p>
                  <Image
                    src={setup.qr}
                    alt={copy.mfaTitle}
                    width={224}
                    height={224}
                    unoptimized
                    className="mx-auto mb-4 rounded-lg bg-white"
                  />
                  <CopyValue value={setup.secret} copy={copy} />
                  <a
                    href={setup.uri}
                    className="mt-3 inline-flex min-h-11 items-center text-sm font-semibold text-gold-bright"
                  >
                    {copy.openAuthenticator} ↗
                  </a>
                </div>
              ) : (
                <Field label={copy.username}>
                  <input
                    name="username"
                    className="portal-input"
                    required
                    autoComplete="username"
                    maxLength={64}
                    autoCapitalize="none"
                    spellCheck={false}
                  />
                </Field>
              )}
              <Field label={copy.password}>
                <input
                  name="password"
                  type="password"
                  className="portal-input"
                  required
                  minLength={activate ? 14 : 1}
                  maxLength={256}
                  autoComplete={activate ? "new-password" : "current-password"}
                />
              </Field>
              <Field label={copy.code}>
                <input
                  name="code"
                  className="portal-input tracking-widest"
                  required
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  autoComplete="one-time-code"
                />
              </Field>
            </>
          )}
          <button
            className="button button-primary w-full"
            disabled={action.busy}
          >
            {action.busy
              ? copy.loading
              : activate
                ? setup
                  ? copy.activate
                  : copy.continue
                : copy.signIn}
          </button>
          <button
            type="button"
            className="min-h-11 w-full cursor-pointer text-sm font-semibold text-gold-bright"
            onClick={() => {
              setActivate(!activate);
              setSetup(null);
            }}
          >
            {activate ? copy.signIn : copy.activate}
          </button>
        </form>
      </div>
    </div>
  );
}
