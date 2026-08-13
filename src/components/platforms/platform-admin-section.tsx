import { SectionHeading } from "@/components/section-heading";
import type { SiteContent } from "@/types/content";

import { PlatformLineChart, PlatformMetricCard, PlatformSidebar } from "./platform-ui";
import { PlatformVisual } from "./platform-visual";

type AdminContent = SiteContent["platformPage"]["admin"];
type Dashboard = AdminContent["dashboard"];

const tones = { gold: "#d4af37", blue: "#34b7ee", violet: "#a85af5", green: "#46d49a", red: "#ff6f6a" } as const;

function TrafficChart({ items }: { items: Dashboard["traffic"] }) {
  const segments = items.map((item, index) => ({ item, offset: items.slice(0, index).reduce((total, segment) => total + segment.value, 0) }));
  return (
    <div className="grid min-h-52.5 grid-cols-1 items-center gap-3.5 sm:grid-cols-[minmax(120px,1fr)_1fr]">
      <div className="relative grid size-35.5 place-items-center justify-self-center" aria-label={`${items[0]?.value ?? 0}% organic traffic`}>
        <svg className="absolute inset-0 size-full -rotate-90" viewBox="0 0 42 42" aria-hidden="true">
          <circle className="fill-none stroke-[#1b222d] stroke-5" cx="21" cy="21" r="15.9" />
          {segments.map(({ item, offset }) => <circle className="fill-none stroke-5" style={{ stroke: tones[item.tone] }} cx="21" cy="21" r="15.9" pathLength="100" strokeDasharray={`${item.value} ${100 - item.value}`} strokeDashoffset={-offset} key={item.label} />)}
        </svg>
        <strong className="font-display text-xl">{items[0]?.value ?? 0}%</strong>
      </div>
      <ul className="grid list-none gap-3 p-0">{items.map((item) => <li className="grid grid-cols-[9px_1fr_auto] items-center gap-2 text-xs" key={item.label}><span className="size-2 rounded-full" style={{ background: tones[item.tone] }} /><small className="text-[#a3abb7]">{item.label}</small><strong>{item.value}%</strong></li>)}</ul>
    </div>
  );
}

function AdminDashboard({ content }: { content: Dashboard }) {
  const dashboard = (
    <div className="grid min-h-197.5 grid-cols-1 overflow-hidden rounded-3xl border border-line-strong bg-surface sm:grid-cols-[150px_minmax(0,1fr)] xl:grid-cols-[190px_minmax(0,1fr)]" aria-label={content.ariaLabel}>
      <div className="hidden sm:block"><PlatformSidebar brandName={content.brandName} brandLabel={content.brandLabel} ariaLabel={content.navigationAriaLabel} items={content.navigation} /></div>
      <div className="min-w-0 p-4 sm:p-6 xl:p-7.5">
        <header className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center"><div><h3 className="text-2xl">{content.title}</h3><p className="mt-2 text-xs text-[#9ca4b0]">{content.description}</p></div><span className="inline-flex min-h-11 shrink-0 items-center rounded-xl border border-[#2a3442] bg-[#171d27] px-6 text-xs font-semibold">{content.actionLabel}</span></header>
        <div className="mt-6.5 grid grid-cols-2 gap-3 lg:grid-cols-4">{content.metrics.map((metric) => <PlatformMetricCard metric={metric} key={metric.label} />)}</div>
        <div className="mt-4.5 grid grid-cols-1 gap-4.5 lg:grid-cols-[minmax(0,1.85fr)_minmax(240px,1fr)]">
          <section className="min-h-67.5 rounded-[14px] border border-[#293340] bg-surface p-5"><header className="flex justify-between gap-4"><strong className="text-xs">{content.chart.title}</strong><small className="text-xs text-[#9ca4b0]">{content.chart.period}</small></header><PlatformLineChart points={content.chart.points} label={content.chart.title} /></section>
          <section className="min-h-67.5 rounded-[14px] border border-[#293340] bg-surface p-5"><strong className="text-xs">Traffic mix</strong><TrafficChart items={content.traffic} /></section>
        </div>
        <section className="mt-4.5 rounded-[14px] border border-[#293340] bg-surface p-5"><strong className="text-xs">{content.activityTitle}</strong><ul className="mt-2.5 list-none p-0">{content.activity.map((activity) => <li className="grid min-h-11 grid-cols-[28px_1fr_auto] items-center gap-3 border-b border-[#293340] text-xs last:border-b-0 sm:grid-cols-[28px_1fr_1.5fr_auto]" key={activity.label}><span className="grid size-6 place-items-center rounded-full text-white" style={{ background: tones[activity.tone] }}>✓</span><b>{activity.label}</b><small className="hidden text-[#9ca4b0] sm:block">{activity.detail}</small><time className="text-[#9ca4b0]">{activity.time}</time></li>)}</ul></section>
      </div>
    </div>
  );
  return <PlatformVisual image={content.image} className="w-full" sizes="(max-width: 900px) 100vw, 88vw">{dashboard}</PlatformVisual>;
}

export function PlatformAdminSection({ content }: { content: AdminContent }) {
  return (
    <section className="section-space scroll-reveal scroll-mt-24 border-t border-line bg-[#0d1117]" data-scroll-reveal id="admin-features">
      <div className="container"><SectionHeading {...content.heading} /><ul className="mt-11.5 mb-8.5 flex list-none flex-nowrap gap-3 overflow-x-auto p-0">{content.tabs.map((tab, index) => <li className={`inline-flex min-h-11.5 shrink-0 items-center rounded-xl border px-6 text-xs font-semibold ${index === 0 ? "border-gold bg-gold text-[#191006]" : "border-[#2a3442] bg-[#171d27] text-[#a3abb7]"}`} key={tab}>{tab}</li>)}</ul><AdminDashboard content={content.dashboard} /></div>
    </section>
  );
}
