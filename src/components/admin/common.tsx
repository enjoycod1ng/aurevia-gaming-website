"use client";
import { useRef, useState } from "react";
import type { AdminCopy } from "@/content/admin-copy";
import type { Locale } from "@/lib/i18n";
import { PortalError, portalRequest } from "@/lib/portal-client";

export type Row = Record<string, unknown>;
export type User = {
  id: string;
  username: string;
  role: "owner" | "manager" | "viewer";
  status: string;
};
export type List = {
  items: Row[];
  total?: number;
  offset?: number;
  has_more?: boolean;
};
export type Client = {
  id: string;
  name: string;
  status: string;
  games: string[];
  currencies: string[];
  origins: string[];
  wallet_url: string;
  environment: string;
  demo: boolean;
  keys: { id: string; status: string }[];
};
export type Catalog = {
  items: Client[];
  games: { id: string; title: string }[];
};
export type Operations = {
  ready: boolean;
  checked_at: number;
  alerts: Row[];
  pending_callbacks: Row[];
  open_rounds: Row[];
  workers: Row[];
  admission: {
    wagering_paused: boolean;
    session_limit: number;
    operator_session_limit: number;
    reserved_sessions: number;
    by_operator: Record<string, number>;
  };
};
export type Overview = {
  clients: number;
  sessions: number;
  environment: string;
  operations: Operations;
  checked_at: number;
};

export function text(copy: AdminCopy, key: string) {
  return copy[key as keyof AdminCopy] ?? key;
}
export function errorText(reason: unknown, copy: AdminCopy) {
  const code =
    reason instanceof PortalError ? reason.code : "service_unavailable";
  const mapped: Record<string, keyof AdminCopy> = {
    unauthorized: "expired",
    forbidden: "forbidden",
    login_failed: "loginFailed",
    invalid_otp: "loginFailed",
    rate_limited: "rateLimited",
    service_unavailable: "unavailable",
    invalid_invitation: "invalidInvitation",
    export_too_large: "exportLimit",
    invalid_dates: "invalidDates",
    self_change_denied: "selfChange",
    enrollment_required: "enrollmentRequired",
    staff_exists: "staffExists",
    operator_unavailable: "notConfigured",
    missing_secret: "notConfigured",
    operator_scope_denied: "notConfigured",
  };
  return copy[mapped[code] ?? "error"];
}
export function useAction(copy: AdminCopy, onDone?: () => void) {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  async function run<T>(path: string, payload: unknown) {
    setBusy(true);
    setError("");
    try {
      const result = await portalRequest<T>(path, payload);
      onDone?.();
      return result;
    } catch (reason) {
      setError(errorText(reason, copy));
      return null;
    } finally {
      setBusy(false);
    }
  }
  return { busy, error, run };
}
export function Notice({
  children,
  error = false,
}: {
  children: React.ReactNode;
  error?: boolean;
}) {
  return (
    <div
      role={error ? "alert" : "status"}
      className={`rounded-xl border px-4 py-3 text-sm ${error ? "border-error/30 bg-error/5 text-error" : "border-line bg-canvas-soft text-muted"}`}
    >
      {children}
    </div>
  );
}
export function Badge({ value, copy }: { value: string; copy: AdminCopy }) {
  const good = ["active", "success", "settled", "ok"].includes(value);
  const bad = [
    "rejected",
    "unknown",
    "disabled",
    "suspended",
    "stale",
  ].includes(value);
  return (
    <span
      className={`portal-badge ${good ? "text-success" : bad ? "text-warning" : "text-muted"}`}
    >
      <span aria-hidden="true">●</span>
      {text(copy, value)}
    </span>
  );
}
export function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="portal-field">
      <span>{label}</span>
      {children}
    </label>
  );
}
export function CopyValue({ value, copy }: { value: string; copy: AdminCopy }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex flex-col gap-3">
      <code className="break-all rounded-lg border border-line bg-canvas p-3 text-sm">
        {value}
      </code>
      <button
        type="button"
        className="button button-secondary self-start"
        onClick={() =>
          navigator.clipboard
            .writeText(value)
            .then(() => setCopied(true))
            .catch(() => setCopied(false))
        }
      >
        {copied ? copy.copied : copy.copy}
      </button>
    </div>
  );
}
export function format(
  value: unknown,
  key: string,
  locale: Locale,
  copy: AdminCopy,
): React.ReactNode {
  if (value == null) return "—";
  if (typeof value === "boolean") return value ? copy.yes : copy.no;
  if (typeof value === "number" && key.endsWith("_at"))
    return new Intl.DateTimeFormat(locale, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value * 1000));
  if (typeof value === "number")
    return new Intl.NumberFormat(locale).format(value);
  if (Array.isArray(value)) return value.map(String).join(", ");
  if (typeof value === "object") return JSON.stringify(value, null, 2);
  if (["status", "operation", "action", "role"].includes(key))
    return text(copy, String(value));
  return String(value);
}
export function DataTable({
  rows,
  columns,
  copy,
  locale,
  detail = true,
}: {
  rows: Row[];
  columns: string[];
  copy: AdminCopy;
  locale: Locale;
  detail?: boolean;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [selected, setSelected] = useState<Row | null>(null);
  return (
    <>
      {rows.length === 0 ? (
        <div className="portal-card py-12 text-center text-muted">
          {copy.empty}
        </div>
      ) : (
        <div className="portal-table-wrap">
          <table className="portal-table">
            <thead>
              <tr>
                {columns.map((key) => (
                  <th key={key} scope="col">
                    {text(copy, key)}
                  </th>
                ))}
                {detail && (
                  <th scope="col">
                    <span className="sr-only">{copy.details}</span>
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={String(row.id ?? i)}>
                  {columns.map((key) => (
                    <td
                      key={key}
                      className={
                        key === "amount" || key === "ggr" ? "tabular-nums" : ""
                      }
                    >
                      {key === "status" ? (
                        <Badge value={String(row[key])} copy={copy} />
                      ) : (
                        format(row[key], key, locale, copy)
                      )}
                    </td>
                  ))}
                  {detail && (
                    <td>
                      <button
                        className="min-h-11 cursor-pointer whitespace-nowrap text-sm font-semibold text-gold-bright"
                        onClick={() => {
                          setSelected(row);
                          dialog.current?.showModal();
                        }}
                      >
                        {copy.details} ↗
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <dialog
        ref={dialog}
        className="portal-dialog portal-dialog-wide"
        aria-label={copy.details}
      >
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="text-xl">{copy.details}</h2>
          <button
            className="button button-secondary"
            onClick={() => dialog.current?.close()}
          >
            {copy.close} ×
          </button>
        </div>
        <dl className="grid gap-4 sm:grid-cols-2">
          {selected &&
            Object.entries(selected).map(([key, value]) => (
              <div
                key={key}
                className="min-w-0 rounded-lg border border-line p-3"
              >
                <dt className="text-xs text-muted">{text(copy, key)}</dt>
                <dd className="mt-2 whitespace-pre-wrap break-all text-sm">
                  {format(value, key, locale, copy)}
                </dd>
              </div>
            ))}
        </dl>
      </dialog>
    </>
  );
}
export function Pagination({
  data,
  onPage,
  copy,
}: {
  data: List;
  onPage: (offset: number) => void;
  copy: AdminCopy;
}) {
  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
      <span className="text-muted">
        {copy.records}: {data.total ?? data.items.length}
      </span>
      <div className="flex gap-2">
        <button
          className="button button-secondary"
          disabled={!data.offset}
          onClick={() => onPage(Math.max(0, (data.offset ?? 0) - 50))}
        >
          {copy.previous}
        </button>
        <button
          className="button button-secondary"
          disabled={!data.has_more || (data.offset ?? 0) >= 5000}
          onClick={() => onPage((data.offset ?? 0) + 50)}
        >
          {copy.next}
        </button>
      </div>
    </div>
  );
}
