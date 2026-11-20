import "server-only";

// Server-side event, e.g. "booking_confirmed" when the owner marks a message as booked.
export async function captureServer(event: string, distinctId: string, properties: Record<string, unknown> = {}) {
  const key = process.env.POSTHOG_KEY;
  if (!key) return;
  const host = `https://${process.env.NEXT_PUBLIC_POSTHOG_REGION === "eu" ? "eu" : "us"}.i.posthog.com`;
  try {
    await fetch(`${host}/capture/`, {
      method: "POST", headers: { "Content-Type": "application/json" }, signal: AbortSignal.timeout(5000),
      body: JSON.stringify({ api_key: key, event, distinct_id: distinctId, properties: { ...properties, $process_person_profile: false } }),
    });
  } catch {}
}
