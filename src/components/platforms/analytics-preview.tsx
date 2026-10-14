"use client";
import { useRef } from "react";
import { useParams } from "next/navigation";
import type { MediaAsset } from "@/types/content";

const labels = {
  en: {
    overview: "Operations overview",
    sample: "Illustrative sample data",
    clients: "Clients",
    sessions: "Active sessions",
    rounds: "Settled rounds",
    health: "Service health",
    activity: "Game activity",
    client: "Client",
    status: "Status",
    games: "Games",
    active: "Active",
    healthy: "Healthy",
    close: "Close preview",
    period: "Last 7 days",
  },
  es: {
    overview: "Resumen de operaciones",
    sample: "Datos de ejemplo ilustrativos",
    clients: "Clientes",
    sessions: "Sesiones activas",
    rounds: "Rondas liquidadas",
    health: "Estado del servicio",
    activity: "Actividad de juegos",
    client: "Cliente",
    status: "Estado",
    games: "Juegos",
    active: "Activo",
    healthy: "Correcto",
    close: "Cerrar vista previa",
    period: "Últimos 7 días",
  },
  pt: {
    overview: "Visão geral das operações",
    sample: "Dados ilustrativos de exemplo",
    clients: "Clientes",
    sessions: "Sessões ativas",
    rounds: "Rodadas liquidadas",
    health: "Estado do serviço",
    activity: "Atividade dos jogos",
    client: "Cliente",
    status: "Estado",
    games: "Jogos",
    active: "Ativo",
    healthy: "Saudável",
    close: "Fechar prévia",
    period: "Últimos 7 dias",
  },
};
export function AnalyticsPreview({
  image,
  compact = false,
}: {
  image: MediaAsset;
  compact?: boolean;
  preload?: boolean;
}) {
  const { locale } = useParams<{ locale: string }>();
  const t = labels[locale as keyof typeof labels] ?? labels.en;
  const dialog = useRef<HTMLDialogElement>(null);
  const dashboard = (
    <div className="bg-canvas p-4 text-ink sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold tracking-[0.15em] text-gold-bright">
            AUREVIA GAMING
          </p>
          <h3 className="mt-3 text-xl leading-tight sm:text-2xl">
            {t.overview}
          </h3>
        </div>
        <span className="rounded-full border border-line bg-surface px-3 py-1 text-xs text-muted">
          {t.sample}
        </span>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          [t.clients, "12"],
          [t.sessions, "4"],
          [t.rounds, "8,420"],
          [t.health, t.healthy],
        ].map(([label, value]) => (
          <div
            key={label}
            className="rounded-xl border border-line bg-surface p-4"
          >
            <p className="text-xs text-muted">{label}</p>
            <p className="mt-2 text-xl font-semibold tabular-nums sm:text-2xl">
              {value}
            </p>
          </div>
        ))}
      </div>
      <div className="mt-4 rounded-xl border border-line bg-surface p-4">
        <div className="flex justify-between gap-3 text-sm">
          <span className="font-semibold">{t.activity}</span>
          <span className="text-muted">{t.period}</span>
        </div>
        <div
          className="mt-5 flex h-28 items-end gap-2 sm:h-36"
          role="img"
          aria-label={t.activity + " · " + t.sample}
        >
          {[32, 48, 41, 65, 50, 74, 60, 85, 69, 92, 76, 96, 86, 72].map(
            (height, i) => (
              <span
                key={i}
                className="flex-1 rounded-t bg-gold-bright/70"
                style={{ height: `${height}%` }}
              />
            ),
          )}
        </div>
      </div>
      <div className="mt-4 overflow-x-auto rounded-xl border border-line bg-surface">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line text-xs text-muted">
            <tr>
              {[t.client, t.status, t.games].map((label) => (
                <th className="px-4 py-3 font-medium" key={label}>
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {["Aurora", "Solstice", "Meridian"].map((name, i) => (
              <tr key={name} className="border-b border-line last:border-0">
                <td className="px-4 py-3 font-medium">{name}</td>
                <td className="px-4 py-3 text-success">● {t.active}</td>
                <td className="px-4 py-3 text-muted">{[9, 6, 9][i]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
  return (
    <figure className="min-w-0">
      <div
        className={`overflow-hidden rounded-2xl border border-line-strong shadow-panel ${compact ? "text-sm" : ""}`}
      >
        {dashboard}
        <button
          className="flex min-h-12 w-full cursor-pointer items-center justify-between gap-4 border-t border-line bg-surface px-4 py-3 text-left text-sm text-muted hover:text-ink"
          onClick={() => dialog.current?.showModal()}
          aria-label={image.openAriaLabel}
        >
          <span>{image.previewLabel}</span>
          <span className="text-gold-bright">{image.openLabel}</span>
        </button>
      </div>
      <figcaption className="mt-4 text-sm leading-5 text-muted">
        {image.caption}
      </figcaption>
      <dialog
        ref={dialog}
        className="portal-dialog portal-dialog-wide"
        aria-label={t.overview}
      >
        <div className="mb-4 flex justify-end">
          <button
            className="button button-secondary"
            onClick={() => dialog.current?.close()}
          >
            {t.close} ×
          </button>
        </div>
        {dashboard}
        <p className="mt-4 text-sm text-muted">{t.sample}</p>
      </dialog>
    </figure>
  );
}
