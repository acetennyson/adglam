import type { ReactNode } from "react";

export const nf = (n: unknown) => Number(n ?? 0).toLocaleString("en-US");

export function Panel({ title, hint, error, children }: { title: string; hint?: string; error?: string | false; children?: ReactNode }) {
  return (
    <section className="glass adm-card wide">
      <h3>{title}</h3>{hint && <small>{hint}</small>}
      {error ? <p className="adm-err">Could not load this panel: {error}</p> : children}
    </section>
  );
}
export function Kpi({ label, value, sub }: { label: string; value: ReactNode; sub?: string }) {
  return <div className="glass kpi"><small>{label}</small><strong>{value}</strong>{sub && <small>{sub}</small>}</div>;
}
export function BarList({ items }: { items: { label: string; value: number; sub?: string }[] }) {
  if (!items.length) return <p className="lede">No data for this period yet.</p>;
  const max = Math.max(1, ...items.map((i) => i.value));
  return (
    <div className="bars">{items.map((i) => (
      <div className="bar-row" key={i.label}><span className="bl">{i.label}</span><span className="bt"><i style={{ width: `${(i.value / max) * 100}%` }} /></span><b>{nf(i.value)}</b>{i.sub && <small>{i.sub}</small>}</div>
    ))}</div>
  );
}
export function Columns({ items, every = 1 }: { items: { label: string; value: number; title?: string }[]; every?: number }) {
  const max = Math.max(1, ...items.map((i) => i.value));
  return (
    <div className="cols">{items.map((i, k) => (
      <div className="col" key={k} title={i.title ?? `${i.label}: ${i.value}`}><i style={{ height: `${Math.max(2, (i.value / max) * 100)}%` }} /><span>{k % every === 0 ? i.label : ""}</span></div>
    ))}</div>
  );
}
