import { SectionHeading } from "@/components/section-heading";
import type { SiteContent } from "@/types/content";

import { PlatformMetricCard } from "./platform-ui";
import { PlatformVisual } from "./platform-visual";

type RtpContent = SiteContent["platformPage"]["rtp"];
type Panel = RtpContent["panel"];
const tones = { gold: "#d4af37", blue: "#34b7ee", violet: "#a85af5", green: "#46d49a", red: "#ff6f6a" } as const;
const statuses = { active: "bg-[#0d3427] text-success", draft: "bg-[#293041] text-[#a9b0bc]", test: "bg-[#34280c] text-gold-bright" } as const;

function RtpPanel({ content }: { content: Panel }) {
  const panel = (
    <div className="mt-13 grid min-h-162.5 grid-cols-1 overflow-hidden rounded-3xl border border-line-strong bg-surface lg:grid-cols-[300px_minmax(0,1fr)] xl:grid-cols-[340px_minmax(0,1fr)]" aria-label={content.ariaLabel}>
      <aside className="min-w-0 border-b border-[#202a36] bg-[#080c12] px-5.5 py-7 lg:border-r lg:border-b-0">
        <header className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center"><strong className="text-sm uppercase">{content.profilesTitle}</strong><span className="inline-flex min-h-11 items-center rounded-xl border border-gold-bright bg-gold-bright px-6 text-xs font-semibold text-[#191006]">{content.newProfileLabel}</span></header>
        <div className="mt-8 grid grid-cols-[repeat(4,minmax(180px,1fr))] gap-4 overflow-x-auto pb-1 lg:grid-cols-1">{content.profiles.map((profile) => <article className={`relative grid min-h-26 content-center gap-2 rounded-xl border p-4 ${profile.selected ? "border-gold bg-[#2b210d]" : "border-[#2a3442] bg-[#171d27]"}`} key={profile.name}><span className="text-xs">{profile.name}</span><strong className="font-display text-lg">{profile.value}</strong><small className={`absolute right-4 bottom-6 min-w-17 rounded-full px-2 py-1 text-center text-xs font-bold uppercase ${statuses[profile.statusTone]}`}>{profile.status}</small></article>)}</div>
      </aside>
      <div className="min-w-0 p-4 sm:p-7.5">
        <header className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center"><div><h3 className="text-2xl">{content.title}</h3><p className="mt-2 text-xs text-[#9ca4b0]">{content.description}</p></div><span className="inline-flex min-h-11 items-center rounded-xl border border-[#2a3442] bg-[#171d27] px-6 text-xs font-semibold">{content.actionLabel}</span></header>
        <div className="mt-9 grid grid-cols-2 gap-3 lg:grid-cols-4">{content.metrics.map((metric) => <PlatformMetricCard metric={metric} key={metric.label} />)}</div>
        <section className="mt-5 rounded-[14px] border border-[#293340] bg-surface p-4 sm:p-5"><strong className="text-xs">{content.payoutTitle}</strong><ul className="mt-4.5 grid list-none gap-4 p-0">{content.payouts.map((payout) => <li className="grid grid-cols-[86px_1fr_34px] items-center gap-2.5 text-xs sm:grid-cols-[105px_1fr_38px] sm:gap-4" key={payout.label}><span>{payout.label}</span><b className="block h-2.5 overflow-hidden rounded-full bg-[#252e3a]"><span className="block h-full rounded-[inherit]" style={{ width: `${payout.value}%`, background: tones[payout.tone] }} /></b><strong className="text-right">{payout.value}%</strong></li>)}</ul></section>
        <section className="mt-5 rounded-[14px] border border-[#293340] bg-surface p-4 sm:p-5"><strong className="text-xs">{content.auditTitle}</strong><ul className="mt-2.5 list-none p-0">{content.audit.map((activity) => <li className="grid min-h-11 grid-cols-[28px_1fr_auto] items-center gap-3 border-b border-[#293340] text-xs last:border-b-0 sm:grid-cols-[28px_1fr_1.5fr_auto]" key={activity.label}><span className="grid size-6 place-items-center rounded-full text-white" style={{ background: tones[activity.tone] }}>✓</span><b>{activity.label}</b><small className="hidden text-[#9ca4b0] sm:block">{activity.detail}</small><time className="text-[#9ca4b0]">{activity.time}</time></li>)}</ul></section>
      </div>
    </div>
  );
  return <PlatformVisual image={content.image} className="w-full" sizes="(max-width: 900px) 100vw, 88vw">{panel}</PlatformVisual>;
}

export function PlatformRtpSection({ content }: { content: RtpContent }) {
  return <section className="section-space scroll-reveal" data-scroll-reveal><div className="container"><SectionHeading {...content.heading} /><RtpPanel content={content.panel} /></div></section>;
}
