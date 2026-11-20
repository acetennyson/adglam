import "server-only";

// Reads analytics back out of PostHog (HogQL over the Query API). Needs a PERSONAL API key with the "Query: Read" scope only.
const region = process.env.NEXT_PUBLIC_POSTHOG_REGION === "eu" ? "eu" : "us";
export const hogqlConfigured = () => !!(process.env.POSTHOG_PERSONAL_API_KEY && process.env.POSTHOG_PROJECT_ID);
export type Rows = { ok: true; rows: any[][]; cols: string[] } | { ok: false; error: string };
export type Obj = Record<string, any>;

// Never throws: each dashboard panel shows its own error instead of breaking the page. Cached for 5 minutes.
export async function hogql(query: string, name: string): Promise<Rows> {
  try {
    const res = await fetch(`https://${region}.posthog.com/api/projects/${process.env.POSTHOG_PROJECT_ID}/query/`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.POSTHOG_PERSONAL_API_KEY}` },
      body: JSON.stringify({ name, query: { kind: "HogQLQuery", query } }),
      next: { revalidate: 300 }, signal: AbortSignal.timeout(20000),
    });
    const j: any = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, error: String(j?.detail || j?.error || `PostHog answered ${res.status}`).slice(0, 300) };
    return { ok: true, rows: j.results ?? [], cols: j.columns ?? [] };
  } catch (e: any) { return { ok: false, error: e?.message || "Could not reach PostHog" }; }
}
export const asObjects = (r: Rows): Obj[] | null => (r.ok ? r.rows.map((row) => Object.fromEntries(r.cols.map((c, i) => [c, row[i]]))) : null);
