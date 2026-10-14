"use client";

import { useState, useSyncExternalStore } from "react";
import examples from "@/content/developer-examples.json";
import type guide from "@/content/developer-guide.json";

export type ExampleLabels = { [Key in keyof typeof guide.labels]: string };

const storageKey = "aurevia-code-language";
const changeEvent = "aurevia-code-language-change";
function subscribe(listener: () => void) {
  window.addEventListener("storage", listener);
  window.addEventListener(changeEvent, listener);
  return () => { window.removeEventListener("storage", listener); window.removeEventListener(changeEvent, listener); };
}
function snapshot() {
  try { const value = localStorage.getItem(storageKey); return examples.some(item => item.id === value) ? value! : "node"; }
  catch { return "node"; }
}

export function DeveloperExamples({ labels }: { labels: ExampleLabels }) {
  const savedLanguage = useSyncExternalStore(subscribe, snapshot, () => "node");
  const [fallbackLanguage, setFallbackLanguage] = useState<string | null>(null);
  const [sampleId, setSampleId] = useState("quickstart");
  const [copyStatus, setCopyStatus] = useState<"copied" | "copyFailed" | null>(null);
  const language = fallbackLanguage ?? savedLanguage;
  const example = examples.find(item => item.id === language) ?? examples[0];
  const sample = example.samples.find(item => item.id === sampleId) ?? example.samples[0];
  const label = (key: keyof ExampleLabels) => labels[key];
  function selectLanguage(value: string) {
    setCopyStatus(null);
    try { localStorage.setItem(storageKey, value); setFallbackLanguage(null); window.dispatchEvent(new Event(changeEvent)); }
    catch { setFallbackLanguage(value); }
  }
  async function copy() {
    try { await navigator.clipboard.writeText(sample.code); setCopyStatus("copied"); }
    catch { setCopyStatus("copyFailed"); }
  }
  return (
    <section id="examples" className="docs-section rounded-2xl border border-line-strong bg-surface p-5 sm:p-8" aria-labelledby="examples-title">
      <h2 id="examples-title" className="text-2xl font-semibold text-ink">{label("examples")}</h2>
      <p className="mt-4 text-ink-soft">{label("note")}</p>
      <div className="mt-6 flex flex-wrap gap-4">
        <label className="grid min-w-0 flex-1 basis-52 gap-2 text-sm font-semibold">{label("programmingLanguage")}
          <select className="form-field min-w-0" value={language} onChange={event => selectLanguage(event.target.value)}>
            {examples.map(item => <option value={item.id} key={item.id}>{item.label}</option>)}
          </select>
        </label>
        <label className="grid min-w-0 flex-1 basis-52 gap-2 text-sm font-semibold">{label("sample")}
          <select className="form-field min-w-0" value={sampleId} onChange={event => { setSampleId(event.target.value); setCopyStatus(null); }}>
            <option value="quickstart">{label("quickstart")}</option><option value="helper">{label("helper")}</option>
          </select>
        </label>
      </div>
      <p className="mt-4 text-sm text-ink-soft">{label("requirements")}: {example.requirements}</p>
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button type="button" className="button button-secondary" onClick={copy}>{label("copy")}</button>
        <a className="button button-secondary" href={`/developer-downloads/${sample.file}`} download>{label("download")}</a>
        <span role="status" className="text-sm text-ink-soft">{copyStatus ? label(copyStatus) : ""}</span>
      </div>
      <pre className="docs-code mt-5 max-h-[36rem]" tabIndex={0} aria-label={`${example.label} · ${label(sampleId === "helper" ? "helper" : "quickstart")}`}><code>{sample.code}</code></pre>
      <p className="mt-5 text-sm text-ink-soft">{label("retryNote")}</p>
    </section>
  );
}
