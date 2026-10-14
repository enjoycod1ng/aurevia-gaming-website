"use client";
import { useRef, useState } from "react";
import type { AdminCopy } from "@/content/admin-copy";
import {
  Badge,
  CopyValue,
  Field,
  Notice,
  useAction,
  type Catalog,
  type Client,
  type User,
} from "./common";

type Change = {
  client: Client;
  kind: "status" | "games" | "issue" | "revoke";
  keyId?: string;
};
export function Clients({
  catalog,
  copy,
  user,
  refresh,
}: {
  catalog: Catalog;
  copy: AdminCopy;
  user: User;
  refresh: () => void;
}) {
  const [search, setSearch] = useState("");
  const [change, setChange] = useState<Change | null>(null);
  const [selectedGames, setSelectedGames] = useState<string[]>([]);
  const [secret, setSecret] = useState("");
  const dialog = useRef<HTMLDialogElement>(null);
  const form = useRef<HTMLFormElement>(null);
  const action = useAction(copy, refresh);
  function open(value: Change) {
    setChange(value);
    setSelectedGames(value.client.games);
    setSecret("");
    form.current?.reset();
    dialog.current?.showModal();
  }
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!change) return;
    const confirm = String(new FormData(event.currentTarget).get("confirm"));
    const base = `admin/operators/${encodeURIComponent(change.client.id)}`;
    const path =
      change.kind === "issue"
        ? `${base}/keys`
        : change.kind === "revoke"
          ? `${base}/keys/${change.keyId}/revoke`
          : base;
    const payload = {
      confirm,
      ...(change.kind === "games"
        ? { games: selectedGames }
        : change.kind === "status"
          ? {
              status:
                change.client.status === "active" ? "suspended" : "active",
            }
          : {}),
    };
    const result = await action.run<{ api_key?: string }>(path, payload);
    if (result?.api_key) setSecret(result.api_key);
    else if (result) dialog.current?.close();
  }
  const visible = catalog.items.filter((client) =>
    `${client.name} ${client.id}`.toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <div className="space-y-5">
      <div className="max-w-md">
        <Field label={copy.searchClients}>
          <input
            type="search"
            className="portal-input"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </Field>
      </div>
      {visible.length === 0 && <Notice>{copy.empty}</Notice>}
      <div className="grid gap-5 xl:grid-cols-2">
        {visible.map((client) => (
          <article key={client.id} className="portal-card">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-xl leading-tight">{client.name}</h2>
                <p className="mt-2 font-mono text-xs text-muted">{client.id}</p>
              </div>
              <Badge value={client.status} copy={copy} />
            </div>
            {client.demo && (
              <p className="mt-3 text-sm font-medium text-gold-bright">
                {copy.demo} · 10,000 EUR
              </p>
            )}
            <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs text-muted">{copy.games}</dt>
                <dd className="mt-1">
                  {client.games
                    .map(
                      (id) =>
                        catalog.games.find((game) => game.id === id)?.title ??
                        id,
                    )
                    .join(", ")}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted">{copy.currencies}</dt>
                <dd className="mt-1">{client.currencies.join(", ")}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs text-muted">{copy.origins}</dt>
                <dd className="mt-1 break-all">{client.origins.join(", ")}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs text-muted">{copy.wallet_url}</dt>
                <dd className="mt-1 break-all font-mono text-xs">
                  {client.wallet_url}
                </dd>
              </div>
            </dl>
            {user.role !== "viewer" && (
              <div className="mt-5 flex flex-wrap gap-2">
                <button
                  className="button button-secondary"
                  onClick={() => open({ client, kind: "games" })}
                >
                  {copy.games}
                </button>
                <button
                  className="button button-secondary"
                  onClick={() => open({ client, kind: "status" })}
                >
                  {client.status === "active"
                    ? copy.suspendClient
                    : copy.activateClient}
                </button>
              </div>
            )}
            {!client.demo && (
              <details className="mt-5 border-t border-line pt-2">
                <summary className="min-h-11 cursor-pointer py-3 text-sm font-semibold">
                  {copy.credentials} (
                  {client.keys.filter((key) => key.status === "active").length})
                </summary>
                <p className="mb-3 text-xs text-muted">{copy.keyRotation}</p>
                {client.keys.map((key) => (
                  <div
                    key={key.id}
                    className="flex flex-wrap items-center justify-between gap-2 border-b border-line py-2"
                  >
                    <div className="flex items-center gap-2">
                      <code className="text-xs">…{key.id.slice(-12)}</code>
                      <Badge value={key.status} copy={copy} />
                    </div>
                    {user.role === "owner" && key.status === "active" && (
                      <button
                        className="min-h-11 cursor-pointer text-sm font-semibold text-warning"
                        onClick={() =>
                          open({ client, kind: "revoke", keyId: key.id })
                        }
                      >
                        {copy.revoke}
                      </button>
                    )}
                  </div>
                ))}
                {user.role === "owner" && (
                  <button
                    className="button button-secondary mt-4"
                    onClick={() => open({ client, kind: "issue" })}
                  >
                    {copy.issueKey}
                  </button>
                )}
              </details>
            )}
          </article>
        ))}
      </div>
      <dialog
        ref={dialog}
        className="portal-dialog"
        aria-labelledby="client-change-title"
        onClose={() => setSecret("")}
      >
        <h2 id="client-change-title" className="text-2xl">
          {secret ? copy.credentials : copy.confirmTitle}
        </h2>
        {secret ? (
          <div className="mt-5 space-y-5">
            <Notice>{copy.keyOnce}</Notice>
            <CopyValue value={secret} copy={copy} />
            <button
              className="button button-primary"
              onClick={() => dialog.current?.close()}
            >
              {copy.close}
            </button>
          </div>
        ) : (
          <form ref={form} onSubmit={submit} className="mt-5 space-y-5">
            <p className="font-semibold">
              {change?.client.name}{" "}
              <span className="font-mono text-sm text-muted">
                ({change?.client.id})
              </span>
            </p>
            <Notice>
              {change?.kind === "issue" || change?.kind === "revoke"
                ? copy.keyRotation
                : copy.settlementNotice}
            </Notice>
            {change?.kind === "status" && (
              <p>
                {change.client.status === "active"
                  ? copy.suspendClient
                  : copy.activateClient}
              </p>
            )}
            {change?.kind === "issue" && <p>{copy.issueKey}</p>}
            {change?.kind === "revoke" && (
              <p>
                {copy.revoke}: <code>…{change.keyId?.slice(-12)}</code>
              </p>
            )}
            {change?.kind === "games" && (
              <fieldset>
                <legend className="mb-2 text-sm font-semibold">
                  {copy.games}
                </legend>
                <div className="grid gap-1 sm:grid-cols-2">
                  {catalog.games.map((game) => (
                    <label
                      key={game.id}
                      className="flex min-h-11 cursor-pointer items-center gap-3 text-sm"
                    >
                      <input
                        type="checkbox"
                        className="size-4 accent-[#b8891f]"
                        checked={selectedGames.includes(game.id)}
                        onChange={(event) =>
                          setSelectedGames((current) =>
                            event.target.checked
                              ? [...current, game.id]
                              : current.filter((id) => id !== game.id),
                          )
                        }
                      />
                      {game.title}
                    </label>
                  ))}
                </div>
              </fieldset>
            )}
            <Field label={copy.confirmId}>
              <input
                name="confirm"
                className="portal-input"
                required
                autoComplete="off"
                onInput={(event) =>
                  event.currentTarget.setCustomValidity(
                    event.currentTarget.value === change?.client.id
                      ? ""
                      : copy.confirmId,
                  )
                }
              />
            </Field>
            {action.error && <Notice error>{action.error}</Notice>}
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                className="button button-secondary"
                onClick={() => dialog.current?.close()}
              >
                {copy.cancel}
              </button>
              <button
                className="button button-primary"
                disabled={
                  action.busy ||
                  (change?.kind === "games" && !selectedGames.length)
                }
              >
                {copy.save}
              </button>
            </div>
          </form>
        )}
      </dialog>
    </div>
  );
}
