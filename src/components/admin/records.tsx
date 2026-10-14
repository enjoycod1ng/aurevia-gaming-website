"use client";
import { useEffect, useState } from "react";
import type { AdminCopy } from "@/content/admin-copy";
import type { Locale } from "@/lib/i18n";
import { portalRequest, PortalError } from "@/lib/portal-client";
import {
  DataTable,
  Field,
  Notice,
  Pagination,
  errorText,
  type Catalog,
  type List,
  type Row,
} from "./common";

const columns = {
  sessions: ["created_at", "operator_id", "game", "player_id", "status"],
  transactions: [
    "created_at",
    "operator_id",
    "operation",
    "amount",
    "currency",
    "status",
  ],
  rounds: ["created_at", "session_id", "bet", "win", "status"],
  report: ["operator_id", "currency", "rounds", "bets", "payouts", "ggr"],
};
export function Records({
  kind,
  catalog,
  locale,
  copy,
  revision,
}: {
  kind: keyof typeof columns;
  catalog: Catalog;
  locale: Locale;
  copy: AdminCopy;
  revision: number;
}) {
  const [query, setQuery] = useState("");
  const [offset, setOffset] = useState(0);
  const [data, setData] = useState<(List & { callbacks?: Row[] }) | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [filterRevision, setFilterRevision] = useState(0);
  const statuses =
    kind === "sessions"
      ? ["active", "closed"]
      : kind === "transactions"
        ? ["pending", "sending", "unknown", "success", "rejected", "cancelled"]
        : ["debit_pending", "active", "settled", "cancelled", "rejected"];
  useEffect(() => {
    let active = true;
    const path = kind === "report" ? "admin/report" : `admin/records/${kind}`;
    portalRequest<List & { callbacks?: Row[] }>(
      `${path}?${query}&offset=${offset}`,
    )
      .then((result) => {
        if (active) {
          setData(result);
          setError("");
          setLoading(false);
        }
      })
      .catch((reason) => {
        if (active) {
          setError(errorText(reason, copy));
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [kind, query, offset, revision, filterRevision, copy]);
  async function download() {
    try {
      const response = await fetch(
        `/api/portal/admin/export/${kind}?${query}`,
        { cache: "no-store" },
      );
      if (!response.ok) {
        const result = await response.json();
        throw new PortalError(result.error, response.status);
      }
      const url = URL.createObjectURL(await response.blob());
      const link = document.createElement("a");
      link.href = url;
      link.download = `aurevia-${kind}.csv`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (reason) {
      setError(errorText(reason, copy));
    }
  }
  return (
    <div className="space-y-5">
      {kind === "report" && <Notice>{copy.reportHint}</Notice>}
      <form
        className="portal-card"
        onSubmit={(event) => {
          event.preventDefault();
          const values = new FormData(event.currentTarget);
          const params = new URLSearchParams();
          values.forEach((value, key) => {
            if (String(value)) params.set(key, String(value));
          });
          setQuery(params.toString());
          setOffset(0);
          setFilterRevision((value) => value + 1);
          setLoading(true);
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <Field label={copy.operators}>
            <select name="operator" className="portal-input">
              <option value="">{copy.allClients}</option>
              {catalog.items.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label={copy.game}>
            <select name="game" className="portal-input">
              <option value="">{copy.allGames}</option>
              {catalog.games.map((game) => (
                <option key={game.id} value={game.id}>
                  {game.title}
                </option>
              ))}
            </select>
          </Field>
          {kind !== "report" && (
            <Field label={copy.status}>
              <select name="status" className="portal-input">
                <option value="">{copy.allStatuses}</option>
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {copy[status as keyof AdminCopy]}
                  </option>
                ))}
              </select>
            </Field>
          )}
          <Field label={copy.start}>
            <input name="start" type="date" className="portal-input" />
          </Field>
          <Field label={copy.end}>
            <input name="end" type="date" className="portal-input" />
          </Field>
          {kind !== "report" && (
            <Field label={copy.search}>
              <input
                name="search"
                type="search"
                className="portal-input"
                maxLength={128}
              />
            </Field>
          )}
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button className="button button-primary">{copy.apply}</button>
          <button
            type="reset"
            className="button button-secondary"
            onClick={() => {
              setQuery("");
              setOffset(0);
            }}
          >
            {copy.reset}
          </button>
          <button
            type="button"
            className="button button-secondary sm:ml-auto"
            onClick={download}
          >
            {copy.export} ↓
          </button>
        </div>
      </form>
      {error && <Notice error>{error}</Notice>}
      {loading ? (
        <Notice>{copy.loading}</Notice>
      ) : (
        data && (
          <>
            <DataTable
              rows={data.items}
              columns={columns[kind]}
              locale={locale}
              copy={copy}
            />
            {kind !== "report" && (
              <Pagination
                data={data}
                onPage={(value) => {
                  setOffset(value);
                  setLoading(true);
                }}
                copy={copy}
              />
            )}
          </>
        )
      )}
      {kind === "report" && data?.callbacks && (
        <section>
          <h2 className="mb-4 text-xl">{copy.callbacks}</h2>
          <DataTable
            rows={data.callbacks}
            columns={["currency", "operation", "status", "count", "amount"]}
            copy={copy}
            locale={locale}
            detail={false}
          />
        </section>
      )}
    </div>
  );
}

export function Audit({
  copy,
  locale,
  revision,
}: {
  copy: AdminCopy;
  locale: Locale;
  revision: number;
}) {
  const [offset, setOffset] = useState(0),
    [data, setData] = useState<List | null>(null),
    [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    portalRequest<List>(`admin/audit?offset=${offset}`)
      .then((result) => {
        if (active) {
          setData(result);
          setError("");
        }
      })
      .catch((reason) => {
        if (active) setError(errorText(reason, copy));
      });
    return () => {
      active = false;
    };
  }, [offset, revision, copy]);
  return (
    <div className="space-y-4">
      {error && <Notice error>{error}</Notice>}
      {data ? (
        <>
          <DataTable
            rows={data.items}
            columns={["created_at", "actor", "action", "target"]}
            locale={locale}
            copy={copy}
          />
          <Pagination data={data} onPage={setOffset} copy={copy} />
        </>
      ) : (
        <Notice>{copy.loading}</Notice>
      )}
    </div>
  );
}
