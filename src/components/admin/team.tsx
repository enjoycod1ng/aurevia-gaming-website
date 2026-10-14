"use client";
import { useEffect, useRef, useState } from "react";
import type { AdminCopy } from "@/content/admin-copy";
import type { Locale } from "@/lib/i18n";
import { portalRequest } from "@/lib/portal-client";
import {
  Badge,
  CopyValue,
  Field,
  Notice,
  errorText,
  useAction,
  type User,
} from "./common";

export function Team({
  user,
  locale,
  copy,
  revision,
  refresh,
}: {
  user: User;
  locale: Locale;
  copy: AdminCopy;
  revision: number;
  refresh: () => void;
}) {
  const [users, setUsers] = useState<User[]>([]),
    [error, setError] = useState("");
  const [selected, setSelected] = useState<User | null>(null),
    [link, setLink] = useState("");
  const dialog = useRef<HTMLDialogElement>(null);
  const form = useRef<HTMLFormElement>(null);
  const action = useAction(copy, refresh);
  useEffect(() => {
    let active = true;
    portalRequest<{ items: User[] }>("admin/staff")
      .then((result) => {
        if (active) {
          setUsers(result.items);
          setError("");
        }
      })
      .catch((reason) => {
        if (active) setError(errorText(reason, copy));
      });
    return () => {
      active = false;
    };
  }, [revision, copy]);
  function open(target: User | null) {
    setSelected(target);
    setLink("");
    form.current?.reset();
    dialog.current?.showModal();
  }
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    const result = await action.run<{ token?: string }>(
      selected ? `admin/staff/${selected.id}` : "admin/staff",
      selected
        ? { role: values.get("role"), status: values.get("status") }
        : { username: values.get("username"), role: values.get("role") },
    );
    if (result?.token)
      setLink(
        `${location.origin}/${locale}/admin#invite=${encodeURIComponent(result.token)}`,
      );
    else if (result) dialog.current?.close();
  }
  async function resetAccess() {
    if (!selected) return;
    const result = await action.run<{ token: string }>(
      `admin/staff/${selected.id}/reset`,
      { confirm: selected.username },
    );
    if (result)
      setLink(
        `${location.origin}/${locale}/admin#invite=${encodeURIComponent(result.token)}`,
      );
  }
  return (
    <div className="space-y-5">
      <Notice>{copy.teamHint}</Notice>
      {error && <Notice error>{error}</Notice>}
      <button className="button button-primary" onClick={() => open(null)}>
        + {copy.invite}
      </button>
      <div className="portal-table-wrap">
        <table className="portal-table">
          <thead>
            <tr>
              <th>{copy.username}</th>
              <th>{copy.role}</th>
              <th>{copy.status}</th>
              <th>
                <span className="sr-only">{copy.changeAccess}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((member) => (
              <tr key={member.id}>
                <td className="font-semibold">{member.username}</td>
                <td>{copy[member.role]}</td>
                <td>
                  <Badge value={member.status} copy={copy} />
                </td>
                <td>
                  <button
                    className="button button-secondary"
                    disabled={member.id === user.id}
                    title={member.id === user.id ? copy.selfChange : undefined}
                    onClick={() => open(member)}
                  >
                    {copy.changeAccess}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <dialog
        ref={dialog}
        className="portal-dialog"
        aria-label={selected ? copy.changeAccess : copy.invite}
        onClose={() => setLink("")}
      >
        <h2 className="text-2xl">
          {selected ? copy.changeAccess : copy.invite}
        </h2>
        {link ? (
          <div className="mt-5 space-y-5">
            <Notice>{copy.inviteOnce}</Notice>
            <CopyValue value={link} copy={copy} />
            <button
              className="button button-primary"
              onClick={() => dialog.current?.close()}
            >
              {copy.close}
            </button>
          </div>
        ) : (
          <form
            ref={form}
            key={selected?.id ?? "invite"}
            className="mt-5 space-y-5"
            onSubmit={submit}
          >
            {selected ? (
              <p className="font-semibold">{selected.username}</p>
            ) : (
              <Field label={copy.username}>
                <input
                  name="username"
                  className="portal-input"
                  required
                  pattern="[a-z0-9][a-z0-9._-]{2,63}"
                  minLength={3}
                  maxLength={64}
                  autoCapitalize="none"
                  autoComplete="off"
                />
              </Field>
            )}
            <Field label={copy.role}>
              <select
                className="portal-input"
                name="role"
                defaultValue={selected?.role ?? "viewer"}
              >
                {(["viewer", "manager", "owner"] as const).map((role) => (
                  <option key={role} value={role}>
                    {copy[role]}
                  </option>
                ))}
              </select>
            </Field>
            {selected && (
              <Field label={copy.status}>
                <select
                  name="status"
                  className="portal-input"
                  defaultValue={
                    selected.status === "active" ? "active" : "disabled"
                  }
                >
                  <option value="active">{copy.active}</option>
                  <option value="disabled">{copy.disabled}</option>
                </select>
              </Field>
            )}
            {action.error && <Notice error>{action.error}</Notice>}
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                className="button button-secondary"
                onClick={() => dialog.current?.close()}
              >
                {copy.cancel}
              </button>
              <button className="button button-primary" disabled={action.busy}>
                {selected ? copy.save : copy.invite}
              </button>
            </div>
            {selected && (
              <details className="border-t border-line pt-2">
                <summary className="min-h-11 cursor-pointer py-3 text-sm text-warning">
                  {copy.resetAccess}
                </summary>
                <p className="mb-4 text-sm text-muted">
                  {copy.resetAccessHint}
                </p>
                <button
                  type="button"
                  className="button button-secondary"
                  disabled={action.busy}
                  onClick={resetAccess}
                >
                  {copy.resetAccess}
                </button>
              </details>
            )}
          </form>
        )}
      </dialog>
    </div>
  );
}
