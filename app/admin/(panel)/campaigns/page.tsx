import { db } from "@/lib/firebase/admin";
import { requireRole } from "@/lib/auth";
import { asObjects, hogql, hogqlConfigured } from "@/lib/posthog-query";
import CampaignsClient from "./CampaignsClient";

export default async function Campaigns() {
  await requireRole("editor");
  const snap = await db().collection("campaigns").orderBy("createdAt", "desc").limit(100).get();
  let results: Record<string, { visitors: number; leads: number; booked: number }> | null = null, error = "";
  if (hogqlConfigured()) {
    const r = await hogql(`SELECT campaign, count() AS visitors, countIf(leads > 0) AS lead_visitors, countIf(booked > 0) AS booked
      FROM (SELECT distinct_id, max(properties.utm_campaign) AS campaign, countIf(event IN ('cta_call','cta_whatsapp','contact_submit')) AS leads, countIf(event = 'booking_confirmed') AS booked
            FROM events WHERE timestamp >= now() - INTERVAL 365 DAY GROUP BY distinct_id)
      WHERE campaign IS NOT NULL AND campaign != '' GROUP BY campaign`, "adglam campaigns");
    const rows = asObjects(r);
    if (rows) results = Object.fromEntries(rows.map((x) => [String(x.campaign), { visitors: Number(x.visitors), leads: Number(x.lead_visitors), booked: Number(x.booked) }]));
    else error = (r as any).error;
  }
  const items = snap.docs.map((d) => { const x = d.data(); return { id: d.id, name: x.name, slug: x.slug, source: x.source, medium: x.medium, link: x.link, budget: x.budget ?? null, notes: x.notes || "", at: x.createdAt.toMillis() }; });
  return (<><h1 className="h2">Campaigns</h1><p className="lede">Make a tagged link for every post, story or flyer you share. Visitors who arrive through it are counted against that campaign, with the leads and bookings they lead to.</p><CampaignsClient items={items} results={results} error={error} configured={hogqlConfigured()} /></>);
}
