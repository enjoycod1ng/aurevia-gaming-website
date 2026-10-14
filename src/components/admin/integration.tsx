"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import type { AdminCopy } from "@/content/admin-copy";
import type { Locale } from "@/lib/i18n";
import { portalRequest } from "@/lib/portal-client";
import {
  Field,
  Notice,
  errorText,
  useAction,
  type Catalog,
  type User,
} from "./common";

export function IntegrationDesk({
  user,
  catalog,
  locale,
  copy,
  refresh,
}: {
  user: User;
  catalog: Catalog;
  locale: Locale;
  copy: AdminCopy;
  refresh: () => void;
}) {
  return (
    <div className="space-y-6">
      <section className="portal-card">
        <h2 className="text-xl">{copy.integration}</h2>
        <p className="mt-4 max-w-3xl text-muted">{copy.integrationHint}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link className="button button-primary" href={`/${locale}/docs`}>
            {copy.docs} ↗
          </Link>
          <Link className="button button-secondary" href={`/${locale}/games`}>
            {copy.publicGames} ↗
          </Link>
        </div>
      </section>
      {user.role === "owner" && (
        <Onboarding catalog={catalog} copy={copy} refresh={refresh} />
      )}
    </div>
  );
}
function Onboarding({
  catalog,
  copy,
  refresh,
}: {
  catalog: Catalog;
  copy: AdminCopy;
  refresh: () => void;
}) {
  const [prepared, setPrepared] = useState<{
    prepared_ids: string[];
    prepared_secret_refs: string[];
  } | null>(null);
  const [error, setError] = useState(""),
    [saved, setSaved] = useState(false);
  const action = useAction(copy, refresh);
  useEffect(() => {
    let active = true;
    portalRequest<typeof prepared>("admin/onboarding")
      .then((result) => {
        if (active) setPrepared(result);
      })
      .catch((reason) => {
        if (active) setError(errorText(reason, copy));
      });
    return () => {
      active = false;
    };
  }, [copy, catalog]);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const result = await action.run("admin/operators", {
      id: form.get("id"),
      name: form.get("name"),
      origins: String(form.get("origins")).split(/\s+/).filter(Boolean),
      wallet_url: form.get("wallet_url"),
      secret_ref: form.get("secret_ref"),
      games: form.getAll("games"),
    });
    if (result) setSaved(true);
  }
  return (
    <section className="portal-card">
      <h2 className="text-xl">{copy.onboard}</h2>
      <p className="mt-4 max-w-3xl text-sm text-muted">{copy.onboardingHint}</p>
      {error && (
        <div className="mt-4">
          <Notice error>{error}</Notice>
        </div>
      )}
      {saved && (
        <div className="mt-4">
          <Notice>{copy.saved}</Notice>
        </div>
      )}
      {!prepared ? (
        <p className="mt-5 text-sm text-muted">{copy.loading}</p>
      ) : !prepared.prepared_ids.length ||
        !prepared.prepared_secret_refs.length ? (
        <p className="mt-5 text-sm text-muted">{copy.noPrepared}</p>
      ) : (
        <form className="mt-6 max-w-3xl space-y-5" onSubmit={submit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={copy.operator_id}>
              <select name="id" className="portal-input" required>
                {prepared.prepared_ids.map((id) => (
                  <option key={id}>{id}</option>
                ))}
              </select>
            </Field>
            <Field label={copy.name}>
              <input
                name="name"
                className="portal-input"
                required
                maxLength={128}
              />
            </Field>
          </div>
          <Field label={copy.origins}>
            <textarea
              name="origins"
              className="portal-input"
              required
              rows={2}
              placeholder="https://casino.example"
            />
          </Field>
          <Field label={copy.wallet_url}>
            <input
              name="wallet_url"
              className="portal-input"
              type="url"
              required
              maxLength={2048}
            />
          </Field>
          <Field label={copy.secretRef}>
            <select name="secret_ref" className="portal-input" required>
              {prepared.prepared_secret_refs.map((ref) => (
                <option key={ref}>{ref}</option>
              ))}
            </select>
          </Field>
          <fieldset>
            <legend className="mb-2 text-sm">{copy.games}</legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {catalog.games.map((game) => (
                <label
                  key={game.id}
                  className="flex min-h-11 items-center gap-3 text-sm"
                >
                  <input
                    name="games"
                    value={game.id}
                    type="checkbox"
                    className="size-4 accent-[#b8891f]"
                  />
                  {game.title}
                </label>
              ))}
            </div>
          </fieldset>
          {action.error && <Notice error>{action.error}</Notice>}
          <button className="button button-primary" disabled={action.busy}>
            {copy.onboard}
          </button>
        </form>
      )}
    </section>
  );
}
