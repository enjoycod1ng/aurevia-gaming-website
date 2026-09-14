"use client";
import { useRef, useState } from "react";
import type { AdminCopy } from "@/content/admin-copy";
import { Field, Notice, useAction } from "./common";

export function AccountSecurity({ copy }: { copy: AdminCopy }) {
  const dialog = useRef<HTMLDialogElement>(null),
    form = useRef<HTMLFormElement>(null);
  const [saved, setSaved] = useState(false);
  const action = useAction(copy);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const result = await action.run("admin/password", {
      current_password: data.get("current_password"),
      new_password: data.get("new_password"),
      code: data.get("code"),
    });
    if (result) {
      form.current?.reset();
      setSaved(true);
    }
  }
  return (
    <>
      <button
        className="button button-secondary"
        onClick={() => {
          setSaved(false);
          form.current?.reset();
          dialog.current?.showModal();
        }}
      >
        {copy.security}
      </button>
      <dialog ref={dialog} className="portal-dialog" aria-label={copy.security}>
        <h2 className="text-2xl">{copy.security}</h2>
        <p className="mt-4 text-sm text-muted">{copy.passwordHint}</p>
        {saved ? (
          <div className="mt-5 space-y-4">
            <Notice>{copy.passwordChanged}</Notice>
            <button
              className="button button-primary"
              onClick={() => dialog.current?.close()}
            >
              {copy.close}
            </button>
          </div>
        ) : (
          <form ref={form} className="mt-5 space-y-5" onSubmit={submit}>
            <Field label={copy.currentPassword}>
              <input
                name="current_password"
                className="portal-input"
                required
                type="password"
                maxLength={256}
                autoComplete="current-password"
              />
            </Field>
            <Field label={copy.newPassword}>
              <input
                name="new_password"
                className="portal-input"
                required
                type="password"
                minLength={14}
                maxLength={256}
                autoComplete="new-password"
              />
            </Field>
            <Field label={copy.code}>
              <input
                name="code"
                className="portal-input"
                required
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                autoComplete="one-time-code"
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
              <button className="button button-primary" disabled={action.busy}>
                {copy.save}
              </button>
            </div>
          </form>
        )}
      </dialog>
    </>
  );
}
