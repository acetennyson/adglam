import "server-only";
import { db } from "@/lib/firebase/admin";
import { autoCover, embedSrc, type Reel } from "@/lib/embed";
export type { Reel } from "@/lib/embed";

const TONES: [string, string][] = [["#f2b8b0", "#c98686"], ["#f7dcd9", "#d9a0a0"], ["#e8b4b4", "#8f5560"], ["#f4c9c0", "#b4707a"], ["#fbe3df", "#c98686"], ["#eaa9a9", "#6e3b47"]];
const PLACEHOLDERS: Reel[] = ["Soft glam, golden hour", "Bridal morning in Buea", "Natural look, studio portrait", "Birthday shoot, on location", "Brand content day", "Date night glow"]
  .map((title, i) => ({ id: String(i), title, category: ["Glam", "Bridal", "Natural", "Events", "Content", "Glam"][i], platform: "placeholder", tone: TONES[i] }));

const live = () => !!process.env.FIREBASE_PROJECT_ID;
const toReel = (id: string, r: any, i: number): Reel => ({
  id, title: r.title, category: r.category, platform: r.platform, externalId: r.externalId, url: r.url,
  embedUrl: embedSrc(r.platform, r.externalId), cover: r.cover || autoCover(r.platform, r.externalId),
  publishedAt: r.publishedAt?.toDate?.().toISOString(), tone: TONES[i % TONES.length],
});

// Published reels only, in the order set in admin (newest first by default).
export async function getPublishedReels(): Promise<Reel[]> {
  if (!live()) return [];
  try {
    const snap = await db().collection("reels").get();
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })).filter((r) => r.status === "published")
      .sort((a, b) => b.sortOrder - a.sortOrder).map((r, i) => toReel(r.id, r, i));
  } catch { return []; }
}

// Real reels, or placeholder cards until the first one is published.
export async function getReels(): Promise<Reel[]> {
  const rows = await getPublishedReels();
  return rows.length ? rows : PLACEHOLDERS;
}

export async function getReel(id: string): Promise<Reel | null> {
  if (!live() || !/^[\w-]{1,40}$/.test(id)) return null;
  try {
    const s = await db().doc(`reels/${id}`).get();
    return s.exists && s.data()!.status === "published" ? toReel(s.id, s.data(), 0) : null;
  } catch { return null; }
}
