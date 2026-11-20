// Client-side analytics helpers. PostHog is only loaded AFTER the visitor accepts, and removed if they decline.
export type Consent = "granted" | "denied" | null;
export const analyticsEnabled = !!process.env.POSTHOG_KEY;
const KEY = process.env.POSTHOG_KEY || "";
const REGION = process.env.NEXT_PUBLIC_POSTHOG_REGION === "eu" ? "eu" : "us";
const CONSENT_KEY = "adg-consent";

console.log("POSTHOG", [analyticsEnabled, KEY, REGION])

type PH = typeof import("posthog-js").default;
let ph: PH | null = null;
let loading: Promise<void> | null = null;
const queue: [string, Record<string, unknown> | undefined][] = [];

export function getConsent(): Consent {
  try { const v = localStorage.getItem(CONSENT_KEY); return v === "granted" || v === "denied" ? v : null; } catch { return null; }
}
export function setConsent(v: "granted" | "denied") { try { localStorage.setItem(CONSENT_KEY, v); } catch {} }
// Browsers that have opened the admin are the owner's: never count them.
export function isInternal() { try { return localStorage.getItem("adg-internal") === "1"; } catch { return false; } }

export function startAnalytics() {
  if (!analyticsEnabled || ph || loading) return loading ?? Promise.resolve();
  loading = (async () => {
    await new Promise((r) => ("requestIdleCallback" in window ? (window as any).requestIdleCallback(() => r(0), { timeout: 3000 }) : setTimeout(r, 1500)));
    const { default: posthog } = await import("posthog-js");
    posthog.init(KEY, {
      api_host: "/ingest", ui_host: `https://${REGION}.posthog.com`,
      person_profiles: "identified_only", autocapture: false, capture_pageview: false, capture_pageleave: true,
      disable_session_recording: true, persistence: "localStorage+cookie",
    });
    ph = posthog;
    queue.splice(0).forEach(([e, p]) => posthog.capture(e, p));
  })();
  return loading;
}

export function stopAnalytics() {
  queue.length = 0;
  if (ph) { ph.opt_out_capturing(); ph.reset(); ph = null; }
  loading = null;
  try { Object.keys(localStorage).filter((k) => k.startsWith("ph_")).forEach((k) => localStorage.removeItem(k)); } catch {}
}

export function track(event: string, props?: Record<string, unknown>) {
  if (getConsent() !== "granted" || isInternal()) return;
  if (ph) ph.capture(event, props); else queue.push([event, props]);
}
// Lets server-side events (a confirmed booking) be tied to the same anonymous visitor. Only when they consented.
export const distinctId = () => (ph && getConsent() === "granted" ? ph.get_distinct_id() : undefined);
