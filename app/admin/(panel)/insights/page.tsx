import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { asObjects, hogql, hogqlConfigured } from "@/lib/posthog-query";
import { analyticsEnabled } from "@/lib/analytics";
import { BarList, Columns, Kpi, Panel, nf } from "./Charts";

const LEAD = "('cta_call','cta_whatsapp','contact_submit')";
const LAGOS = "toTimeZone(timestamp, 'Africa/Lagos')";
const label = (s: string) => (s === "$direct" || !s ? "Direct / unknown" : s);

export default async function Insights({ searchParams }: { searchParams: { range?: string } }) {
  await requireRole("editor");
  const n = [7, 30, 90].includes(Number(searchParams.range)) ? Number(searchParams.range) : 30;

  if (!analyticsEnabled || !hogqlConfigured()) {
    return (
      <>
        <h1 className="h2">Insights</h1>
        <div className="glass adm-card wide">
          <h3>One more step to see your numbers here</h3>
          <p className="lede">Insights are read from PostHog with a private, read-only key. In PostHog: click your name (bottom left), open your account or user settings, then <strong>Personal API keys</strong>, create a key, and give it only the <strong>Query: Read</strong> permission. Copy it once.</p>
          <p className="lede">Then add two variables in Vercel and redeploy: <code>POSTHOG_PERSONAL_API_KEY</code> (that key) and <code>POSTHOG_PROJECT_ID</code> (the number in your PostHog address, <code>.../project/<b>12345</b>/...</code>). Also make sure <code>NEXT_PUBLIC_POSTHOG_KEY</code> is set.</p>
        </div>
      </>
    );
  }

  const W = `timestamp >= now() - INTERVAL ${n} DAY`;
  const visitorSub = (extra: string) => `(SELECT distinct_id, ${extra}, countIf(event IN ${LEAD}) AS leads FROM events WHERE ${W} GROUP BY distinct_id)`;
  const [kpiR, dailyR, srcR, placeR, catR, topicR, reelR, hourR, monthR] = await Promise.all([
    hogql(`SELECT uniq(distinct_id) AS visitors, countIf(event = '$pageview') AS pageviews, uniqIf(distinct_id, event = 'reel_view') AS reel_viewers,
      uniqIf(distinct_id, event IN ('cta_call','cta_whatsapp','cta_email','cta_book','cta_contact')) AS intent, uniqIf(distinct_id, event = 'contact_submit') AS messages,
      uniqIf(distinct_id, event = 'booking_confirmed') AS booked, countIf(event = 'cta_call') AS calls, countIf(event = 'cta_whatsapp') AS whatsapp FROM events WHERE ${W}`, "adglam kpis"),
    hogql(`SELECT toDate(${LAGOS}) AS day, uniq(distinct_id) AS visitors FROM events WHERE ${W} GROUP BY day ORDER BY day`, "adglam daily"),
    hogql(`SELECT source, count() AS visitors, countIf(leads > 0) AS lead_visitors FROM ${visitorSub("coalesce(nullIf(max(properties.utm_source), ''), nullIf(max(properties.$referring_domain), ''), '$direct') AS source")} GROUP BY source ORDER BY visitors DESC LIMIT 10`, "adglam sources"),
    hogql(`SELECT country, city, count() AS visitors, countIf(leads > 0) AS lead_visitors FROM ${visitorSub("coalesce(nullIf(max(properties.$geoip_country_name), ''), 'Unknown') AS country, coalesce(nullIf(max(properties.$geoip_city_name), ''), 'Unknown') AS city")} GROUP BY country, city ORDER BY visitors DESC LIMIT 12`, "adglam places"),
    hogql(`SELECT properties.category AS category, countIf(event = 'reel_view') AS views, countIf(event = 'reel_open') AS opens FROM events WHERE event IN ('reel_view','reel_open') AND isNotNull(properties.category) AND ${W} GROUP BY category ORDER BY views + opens DESC`, "adglam categories"),
    hogql(`SELECT properties.topic AS topic, count() AS n FROM events WHERE event = 'contact_submit' AND ${W} GROUP BY topic ORDER BY n DESC`, "adglam topics"),
    hogql(`SELECT properties.title AS title, properties.category AS category, count() AS views FROM events WHERE event = 'reel_view' AND ${W} GROUP BY properties.reel_id, title, category ORDER BY views DESC LIMIT 8`, "adglam top reels"),
    hogql(`SELECT toHour(${LAGOS}) AS hour, uniq(distinct_id) AS visitors FROM events WHERE event = '$pageview' AND ${W} GROUP BY hour ORDER BY hour`, "adglam hours"),
    hogql(`SELECT toStartOfMonth(${LAGOS}) AS month, uniq(distinct_id) AS visitors, countIf(event = 'contact_submit') AS messages FROM events WHERE timestamp >= now() - INTERVAL 12 MONTH GROUP BY month ORDER BY month`, "adglam months"),
  ]);
  const kpi = asObjects(kpiR)?.[0], daily = asObjects(dailyR), src = asObjects(srcR), places = asObjects(placeR), cats = asObjects(catR), topics = asObjects(topicR), reels = asObjects(reelR), hours = asObjects(hourR), months = asObjects(monthR);
  const err = (r: { ok: boolean; error?: string }) => !r.ok && (r as any).error;

  // fill empty days / hours so the charts have a steady shape
  const dayKeys = Array.from({ length: n }, (_, i) => new Date(Date.now() + 3600000 - (n - 1 - i) * 864e5).toISOString().slice(0, 10));
  const dayMap = new Map((daily ?? []).map((d) => [String(d.day).slice(0, 10), Number(d.visitors)]));
  const dayItems = dayKeys.map((k) => ({ label: k.slice(5), value: dayMap.get(k) ?? 0, title: `${k}: ${dayMap.get(k) ?? 0} visitors` }));
  const hourMap = new Map((hours ?? []).map((h) => [Number(h.hour), Number(h.visitors)]));
  const hourItems = Array.from({ length: 24 }, (_, h) => ({ label: String(h), value: hourMap.get(h) ?? 0, title: `${h}:00 to ${h}:59: ${hourMap.get(h) ?? 0} visitors` }));

  // plain-English takeaways (simple rules for now; machine learning comes later)
  const tips: string[] = [];
  const visitors = Number(kpi?.visitors ?? 0);
  if (src?.[0]) tips.push(`${label(src[0].source)} brings the most visitors (${nf(src[0].visitors)}).`);
  const bestSrc = (src ?? []).filter((s) => Number(s.visitors) >= 5).sort((a, b) => b.lead_visitors / b.visitors - a.lead_visitors / a.visitors)[0];
  if (bestSrc && bestSrc.lead_visitors > 0) tips.push(`${label(bestSrc.source)} turns ${Math.round((bestSrc.lead_visitors / bestSrc.visitors) * 100)}% of its visitors into leads (calls, WhatsApp or messages), the best rate among your sources.`);
  if (places?.[0]) tips.push(`Most visitors are from ${places[0].city !== "Unknown" ? places[0].city + ", " : ""}${places[0].country}.`);
  if (cats?.[0]) tips.push(`${cats[0].category} reels get the most attention (${nf(cats[0].views)} views).`);
  if (topics?.[0]) tips.push(`The most common enquiry is "${topics[0].topic}" (${nf(topics[0].n)}).`);
  const peak = [...hourItems].sort((a, b) => b.value - a.value)[0];
  if (peak && peak.value > 0) tips.push(`Visits peak around ${peak.label}:00 Buea time, a good moment to post.`);
  if (visitors > 0 && visitors < 30) tips.push("Numbers are still small, so treat patterns as hints rather than facts.");

  return (
    <>
      <div className="ins-head">
        <div><h1 className="h2">Insights</h1><p className="lede">Visitors who accepted analytics. Times are Buea time. Refreshes about every 5 minutes.</p></div>
        <div className="chips">{[7, 30, 90].map((r) => <Link key={r} href={`/admin/insights?range=${r}`} className={`glass pill chip ${r === n ? "on" : ""}`}>Last {r} days</Link>)}</div>
      </div>

      <Panel title="Overview" error={err(kpiR)}>
        {kpi && <div className="kpis">
          <Kpi label="Visitors" value={nf(kpi.visitors)} sub={`${nf(kpi.pageviews)} page views`} />
          <Kpi label="Watched reels" value={nf(kpi.reel_viewers)} sub={visitors ? `${Math.round((kpi.reel_viewers / visitors) * 100)}% of visitors` : ""} />
          <Kpi label="Showed intent" value={nf(kpi.intent)} sub="tapped call, WhatsApp, book or contact" />
          <Kpi label="Sent a message" value={nf(kpi.messages)} sub={`${nf(kpi.calls)} calls, ${nf(kpi.whatsapp)} WhatsApp taps`} />
          <Kpi label="Booked" value={nf(kpi.booked)} sub="marked in the inbox" />
        </div>}
      </Panel>

      {tips.length > 0 && <Panel title="What stands out"><ul className="tips">{tips.map((t) => <li key={t}>{t}</li>)}</ul></Panel>}

      <Panel title="Visitors per day" error={err(dailyR)}><Columns items={dayItems} every={n > 30 ? 10 : n > 7 ? 5 : 1} /></Panel>
      <div className="two">
        <Panel title="Where visitors come from" hint="Campaign tag first, otherwise the website they came from" error={err(srcR)}>
          <BarList items={(src ?? []).map((s) => ({ label: label(s.source), value: Number(s.visitors), sub: `${nf(s.lead_visitors)} leads` }))} />
        </Panel>
        <Panel title="Where they are" hint="Approximate, from their connection" error={err(placeR)}>
          <BarList items={(places ?? []).map((p) => ({ label: p.city === "Unknown" ? p.country : `${p.city}, ${p.country}`, value: Number(p.visitors), sub: `${nf(p.lead_visitors)} leads` }))} />
        </Panel>
        <Panel title="Which looks interest people" hint="Reel views and opens by category" error={err(catR)}>
          <BarList items={(cats ?? []).map((c) => ({ label: c.category, value: Number(c.views) + Number(c.opens), sub: `${nf(c.views)} views` }))} />
        </Panel>
        <Panel title="What people ask about" hint="Contact form topics" error={err(topicR)}>
          <BarList items={(topics ?? []).map((t) => ({ label: t.topic, value: Number(t.n) }))} />
        </Panel>
      </div>
      <Panel title="Top reels" error={err(reelR)}>
        <BarList items={(reels ?? []).map((r) => ({ label: `${r.title}`, value: Number(r.views), sub: r.category }))} />
      </Panel>
      <Panel title="When people visit (Buea time)" hint="Unique visitors by hour of the day" error={err(hourR)}><Columns items={hourItems} every={3} /></Panel>
      <Panel title="Seasons: the last 12 months" hint="Needs several months of data before it says anything" error={err(monthR)}>
        {months && months.length >= 3
          ? <Columns items={months.map((m) => ({ label: String(m.month).slice(0, 7), value: Number(m.visitors), title: `${String(m.month).slice(0, 7)}: ${m.visitors} visitors, ${m.messages} messages` }))} />
          : <p className="lede">Only {months?.length ?? 0} month(s) of data so far. This chart fills in as the year goes on, and it is what we will use to spot busy seasons.</p>}
      </Panel>
    </>
  );
}
