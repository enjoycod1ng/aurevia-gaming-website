"use client";
import { useRef, useState } from "react";
import type { AdminCopy } from "@/content/admin-copy";
import type { Locale } from "@/lib/i18n";
import {
  DataTable,
  Field,
  Notice,
  text,
  useAction,
  type Operations,
  type Overview,
  type User,
} from "./common";

export function OverviewPanel({
  data,
  copy,
  locale,
}: {
  data: Overview;
  copy: AdminCopy;
  locale: Locale;
}) {
  const ops = data.operations;
  const pending = ops.pending_callbacks
    .filter((row) => row.operation !== "balance")
    .reduce((sum, row) => sum + Number(row.count), 0);
  const metrics = [
    [copy.operators, data.clients],
    [
      copy.activeSessions,
      `${ops.admission.reserved_sessions} / ${ops.admission.session_limit}`,
    ],
    [copy.pending, pending],
    [copy.serviceHealth, ops.ready ? copy.healthy : copy.attention],
  ];
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map(([label, value]) => (
          <div className="portal-card" key={label}>
            <p className="text-sm text-muted">{label}</p>
            <p className="mt-3 text-3xl font-semibold tracking-tight tabular-nums">
              {typeof value === "number"
                ? new Intl.NumberFormat(locale).format(value)
                : value}
            </p>
          </div>
        ))}
      </div>
      <div className="grid gap-5 xl:grid-cols-[1.3fr_1fr]">
        <section className="portal-card">
          <h2 className="text-xl">{copy.capacity}</h2>
          <div className="mt-6 flex items-center justify-between gap-3 text-sm">
            <span>{copy.activeSessions}</span>
            <span className="font-semibold">
              {ops.admission.reserved_sessions} / {ops.admission.session_limit}
            </span>
          </div>
          <progress
            className="mt-3 h-3 w-full accent-[#b8891f]"
            max={ops.admission.session_limit}
            value={ops.admission.reserved_sessions}
            aria-label={copy.capacity}
          />
          <dl className="mt-6 space-y-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">{copy.clientCapacity}</dt>
              <dd>{ops.admission.operator_session_limit}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">{copy.allSessions}</dt>
              <dd>{data.sessions}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">{copy.maintenance}</dt>
              <dd
                className={
                  ops.admission.wagering_paused
                    ? "text-warning"
                    : "text-success"
                }
              >
                {ops.admission.wagering_paused ? copy.paused : copy.running}
              </dd>
            </div>
          </dl>
        </section>
        <section className="portal-card">
          <h2 className="text-xl">{copy.alerts}</h2>
          <div className="mt-5 space-y-3">
            {ops.alerts.length ? (
              ops.alerts.map((alert, i) => (
                <Notice key={i} error>
                  <p>{text(copy, String(alert.code))}</p>
                  {alert.operator_id != null && (
                    <p className="mt-1 font-mono text-xs">
                      {String(alert.operator_id)}
                    </p>
                  )}
                </Notice>
              ))
            ) : (
              <div className="rounded-xl bg-success/5 p-5 text-success">
                <p className="text-2xl" aria-hidden="true">
                  ✓
                </p>
                <p className="mt-2 text-sm">{copy.noAlerts}</p>
              </div>
            )}
          </div>
        </section>
      </div>
      <section>
        <h2 className="mb-4 text-xl">{copy.workers}</h2>
        <DataTable
          rows={ops.workers}
          columns={["role", "game", "status", "age_seconds"]}
          copy={copy}
          locale={locale}
          detail={false}
        />
      </section>
    </div>
  );
}

export function OperationsPanel({
  data,
  user,
  copy,
  locale,
  refresh,
}: {
  data: Operations;
  user: User;
  copy: AdminCopy;
  locale: Locale;
  refresh: () => void;
}) {
  const action = useAction(copy, refresh);
  const dialog = useRef<HTMLDialogElement>(null);
  const [pending, setPending] = useState<{
    paused: boolean;
    session_limit: number;
    operator_session_limit: number;
  } | null>(null);
  async function save() {
    if (
      pending &&
      (await action.run("admin/controls", {
        confirm: "deployment",
        ...pending,
      }))
    )
      dialog.current?.close();
  }
  return (
    <div className="space-y-6">
      <section className="portal-card">
        <h2 className="text-xl">
          {copy.maintenance} & {copy.capacity}
        </h2>
        <p className="mt-4 max-w-3xl text-sm text-muted">{copy.controlsHint}</p>
        <form
          key={`${data.admission.wagering_paused}-${data.admission.session_limit}-${data.admission.operator_session_limit}`}
          className="mt-5 max-w-2xl space-y-5"
          onSubmit={(event) => {
            event.preventDefault();
            const form = new FormData(event.currentTarget);
            setPending({
              paused: form.get("paused") === "on",
              session_limit: Number(form.get("session_limit")),
              operator_session_limit: Number(
                form.get("operator_session_limit"),
              ),
            });
            dialog.current?.showModal();
          }}
        >
          <label className="flex min-h-11 items-center gap-3 text-sm">
            <input
              name="paused"
              type="checkbox"
              className="size-5 accent-[#b8891f]"
              defaultChecked={data.admission.wagering_paused}
              disabled={user.role === "viewer"}
            />
            {copy.pauseGames}
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={copy.capacity}>
              <input
                name="session_limit"
                className="portal-input"
                type="number"
                required
                min={1}
                max={4}
                defaultValue={data.admission.session_limit}
                disabled={user.role === "viewer"}
              />
            </Field>
            <Field label={copy.clientCapacity}>
              <input
                name="operator_session_limit"
                className="portal-input"
                type="number"
                required
                min={1}
                max={2}
                defaultValue={data.admission.operator_session_limit}
                disabled={user.role === "viewer"}
              />
            </Field>
          </div>
          {user.role !== "viewer" && (
            <button className="button button-primary">{copy.save}</button>
          )}
        </form>
      </section>
      <section>
        <h2 className="mb-4 text-xl">{copy.pending}</h2>
        <DataTable
          rows={data.pending_callbacks}
          columns={["operator_id", "operation", "count", "oldest_seconds"]}
          copy={copy}
          locale={locale}
          detail={false}
        />
      </section>
      <section>
        <h2 className="mb-4 text-xl">{copy.rounds}</h2>
        <DataTable
          rows={data.open_rounds}
          columns={["operator_id", "game", "status", "count", "oldest_seconds"]}
          copy={copy}
          locale={locale}
          detail={false}
        />
      </section>
      <section>
        <h2 className="mb-4 text-xl">{copy.workers}</h2>
        <DataTable
          rows={data.workers}
          columns={["role", "game", "status", "age_seconds"]}
          copy={copy}
          locale={locale}
          detail={false}
        />
      </section>
      <dialog
        ref={dialog}
        className="portal-dialog"
        aria-label={copy.confirmTitle}
      >
        <h2 className="text-2xl">{copy.confirmTitle}</h2>
        <p className="mt-4 text-sm text-muted">{copy.settlementNotice}</p>
        <dl className="my-5 space-y-3 text-sm">
          <div className="flex justify-between">
            <dt>{copy.maintenance}</dt>
            <dd>{pending?.paused ? copy.paused : copy.running}</dd>
          </div>
          <div className="flex justify-between">
            <dt>{copy.capacity}</dt>
            <dd>{pending?.session_limit}</dd>
          </div>
          <div className="flex justify-between">
            <dt>{copy.clientCapacity}</dt>
            <dd>{pending?.operator_session_limit}</dd>
          </div>
        </dl>
        {action.error && <Notice error>{action.error}</Notice>}
        <div className="mt-5 flex flex-wrap gap-3">
          <button
            className="button button-secondary"
            onClick={() => dialog.current?.close()}
          >
            {copy.cancel}
          </button>
          <button
            className="button button-primary"
            onClick={save}
            disabled={action.busy}
          >
            {copy.save}
          </button>
        </div>
      </dialog>
    </div>
  );
}
