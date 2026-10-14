"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { AdminCopy } from "@/content/admin-copy";
import type { Locale } from "@/lib/i18n";
import { PortalError, portalRequest } from "@/lib/portal-client";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";
import {
  Notice,
  errorText,
  type User,
  type Overview,
  type Catalog,
} from "./common";
import { AdminLogin } from "./login";
import { Clients } from "./clients";
import { OverviewPanel, OperationsPanel } from "./operations";
import { Records, Audit } from "./records";
import { Team } from "./team";
import { IntegrationDesk } from "./integration";
import { AccountSecurity } from "./account-security";

const tabs = [
  "overview",
  "operators",
  "sessions",
  "transactions",
  "rounds",
  "report",
  "operations",
  "audit",
  "staff",
  "integration",
] as const;
type Tab = (typeof tabs)[number];
const symbols: Record<Tab, string> = {
  overview: "◫",
  operators: "◎",
  sessions: "▷",
  transactions: "⇄",
  rounds: "↻",
  report: "▥",
  operations: "⚙",
  audit: "☷",
  staff: "♙",
  integration: "⌘",
};

export function AdminWorkspace({
  locale,
  copy,
  initialTab,
}: {
  locale: Locale;
  copy: AdminCopy;
  initialTab: string;
}) {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [tab, setTab] = useState<Tab>(
    tabs.includes(initialTab as Tab) ? (initialTab as Tab) : "overview",
  );
  const [overview, setOverview] = useState<Overview | null>(null),
    [catalog, setCatalog] = useState<Catalog | null>(null);
  const [error, setError] = useState(""),
    [revision, setRevision] = useState(0);
  const refresh = useCallback(() => setRevision((value) => value + 1), []);
  useEffect(() => {
    let active = true;
    portalRequest<{ user: User }>("admin/me")
      .then((result) => {
        if (active) setUser(result.user);
      })
      .catch((reason) => {
        if (active) {
          setUser(null);
          if (!(reason instanceof PortalError && reason.status === 401))
            setError(errorText(reason, copy));
        }
      });
    return () => {
      active = false;
    };
  }, [copy]);
  useEffect(() => {
    if (!user) return;
    let active = true;
    Promise.all([
      portalRequest<Overview>("admin/overview"),
      portalRequest<Catalog>("admin/operators"),
    ])
      .then(([nextOverview, nextCatalog]) => {
        if (active) {
          setOverview(nextOverview);
          setCatalog(nextCatalog);
          setError("");
        }
      })
      .catch((reason) => {
        if (active) {
          setError(errorText(reason, copy));
          if (reason instanceof PortalError && reason.status === 401) {
            setUser(null);
            setOverview(null);
            setCatalog(null);
          }
        }
      });
    return () => {
      active = false;
    };
  }, [user, revision, copy]);
  useEffect(() => {
    const expire = () => {
      setUser(null);
      setOverview(null);
      setCatalog(null);
      setError(copy.expired);
    };
    window.addEventListener("aurevia:admin-expired", expire);
    return () => window.removeEventListener("aurevia:admin-expired", expire);
  }, [copy]);
  async function logout() {
    try {
      await portalRequest("admin/logout", {});
      setUser(null);
      setOverview(null);
      setCatalog(null);
      setError("");
    } catch (reason) {
      setError(errorText(reason, copy));
    }
  }
  function navigate(value: Tab) {
    setTab(value);
    history.replaceState(null, "", `/${locale}/admin?tab=${value}`);
  }
  const accessible =
    tab === "staff" && user?.role !== "owner" ? "overview" : tab;
  return (
    <div className="min-h-svh bg-canvas">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link href={`/${locale}/admin`} className="flex items-center gap-3">
            <span
              className="flex size-10 items-center justify-center rounded-xl border border-gold/30 bg-gold/10 font-display text-xl font-bold text-gold-bright"
              aria-hidden="true"
            >
              A
            </span>
            <span>
              <span className="block text-sm font-extrabold tracking-[.1em]">
                AUREVIA GAMING
              </span>
              <span className="block text-xs text-muted">{copy.admin}</span>
            </span>
          </Link>
          <HeaderControls
            locale={locale}
            copy={copy}
            user={user}
            logout={logout}
          />
        </div>
      </header>
      {user ? (
        <div className="mx-auto max-w-[1600px] lg:grid lg:grid-cols-[220px_minmax(0,1fr)]">
          <aside className="border-b border-line bg-surface p-3 lg:min-h-[calc(100svh-81px)] lg:border-r lg:border-b-0 lg:p-4">
            <label className="block lg:hidden">
              <span className="sr-only">{copy.admin}</span>
              <select
                className="portal-input"
                value={accessible}
                onChange={(event) => navigate(event.target.value as Tab)}
              >
                {tabs
                  .filter((value) => value !== "staff" || user.role === "owner")
                  .map((value) => (
                    <option key={value} value={value}>
                      {copy[value]}
                    </option>
                  ))}
              </select>
            </label>
            <nav
              aria-label={copy.admin}
              className="hidden flex-col gap-1 lg:flex"
            >
              {tabs
                .filter((value) => value !== "staff" || user.role === "owner")
                .map((value) => (
                  <button
                    key={value}
                    className="portal-nav"
                    onClick={() => navigate(value)}
                    aria-current={accessible === value ? "page" : undefined}
                  >
                    <span
                      aria-hidden="true"
                      className="w-5 text-center text-lg"
                    >
                      {symbols[value]}
                    </span>
                    {copy[value]}
                  </button>
                ))}
            </nav>
            <div className="mt-8 hidden border-t border-line pt-5 text-sm lg:block">
              <p className="font-semibold">{user.username}</p>
              <p className="mt-1 text-xs text-muted">{copy[user.role]}</p>
              <Link
                className="mt-5 inline-flex min-h-11 items-center text-xs text-muted hover:text-ink"
                href={`/${locale}`}
              >
                ← {copy.backWebsite}
              </Link>
            </div>
          </aside>
          <main id="main-content" className="min-w-0 px-4 py-7 sm:p-7 xl:p-9">
            <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-gold-bright">
                  {copy.workspace}
                </p>
                <h1 className="mt-3 text-3xl sm:text-4xl">
                  {copy[accessible]}
                </h1>
                {overview && (
                  <p className="mt-3 text-xs text-muted">
                    {copy.updated}:{" "}
                    {new Intl.DateTimeFormat(locale, {
                      dateStyle: "medium",
                      timeStyle: "short",
                    }).format(new Date(overview.checked_at * 1000))}
                  </p>
                )}
              </div>
              <button className="button button-secondary" onClick={refresh}>
                ↻ {copy.refresh}
              </button>
            </div>
            <div className="mb-6">
              <Notice>
                <span className="font-semibold">{copy.sandbox}</span>
                <span className="ml-2">{copy.sandboxHint}</span>
              </Notice>
            </div>
            {error && (
              <div className="mb-5">
                <Notice error>{error}</Notice>
              </div>
            )}
            {overview && catalog ? (
              <>
                {accessible === "overview" && (
                  <OverviewPanel data={overview} copy={copy} locale={locale} />
                )}
                {accessible === "operators" && (
                  <Clients
                    catalog={catalog}
                    copy={copy}
                    user={user}
                    refresh={refresh}
                  />
                )}
                {(
                  ["sessions", "transactions", "rounds", "report"] as string[]
                ).includes(accessible) && (
                  <Records
                    key={accessible}
                    kind={
                      accessible as
                        "sessions" | "transactions" | "rounds" | "report"
                    }
                    catalog={catalog}
                    locale={locale}
                    copy={copy}
                    revision={revision}
                  />
                )}
                {accessible === "operations" && (
                  <OperationsPanel
                    data={overview.operations}
                    copy={copy}
                    locale={locale}
                    user={user}
                    refresh={refresh}
                  />
                )}
                {accessible === "audit" && (
                  <Audit copy={copy} locale={locale} revision={revision} />
                )}
                {accessible === "staff" && (
                  <Team
                    user={user}
                    locale={locale}
                    copy={copy}
                    revision={revision}
                    refresh={refresh}
                  />
                )}
                {accessible === "integration" && (
                  <IntegrationDesk
                    user={user}
                    catalog={catalog}
                    locale={locale}
                    copy={copy}
                    refresh={refresh}
                  />
                )}
              </>
            ) : (
              !error && <Notice>{copy.loading}</Notice>
            )}
          </main>
        </div>
      ) : (
        <main id="main-content" className="container">
          {error && (
            <div className="mx-auto mt-8 max-w-lg">
              <Notice error>{error}</Notice>
            </div>
          )}
          {user === undefined ? (
            <div className="py-20 text-center text-muted" role="status">
              {copy.loading}
            </div>
          ) : (
            <AdminLogin
              copy={copy}
              onLogin={(next) => {
                setUser(next);
                setError("");
              }}
            />
          )}
          <div className="pb-10 text-center">
            <Link
              className="inline-flex min-h-11 items-center text-sm text-muted"
              href={`/${locale}`}
            >
              ← {copy.backWebsite}
            </Link>
          </div>
        </main>
      )}
    </div>
  );
}

function HeaderControls({
  locale,
  copy,
  user,
  logout,
}: {
  locale: Locale;
  copy: AdminCopy;
  user: User | null | undefined;
  logout: () => void;
}) {
  const controls = (
    <>
      <ThemeToggle labels={copy} />
      <LanguageSwitcher locale={locale} label={copy.language} />
      {user && (
        <>
          <AccountSecurity copy={copy} />
          <button className="button button-secondary" onClick={logout}>
            {copy.signOut}
          </button>
        </>
      )}
    </>
  );
  return (
    <>
      <div className="hidden flex-wrap items-center gap-3 md:flex">
        {controls}
      </div>
      <details className="relative md:hidden">
        <summary
          className="flex size-11 cursor-pointer list-none items-center justify-center rounded-xl border border-line-strong text-xl"
          aria-label={copy.security}
        >
          ⚙
        </summary>
        <div className="absolute right-0 z-30 mt-3 flex w-72 max-w-[calc(100vw-2rem)] flex-wrap gap-3 rounded-xl border border-line bg-surface p-4 shadow-panel">
          {controls}
        </div>
      </details>
    </>
  );
}
