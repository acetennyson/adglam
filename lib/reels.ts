import "server-only";
import { db } from "@/lib/firebase/admin";
import { autoCover, embedSrc, type Reel } from "@/lib/embed";
export type { Reel } from "@/lib/embed";

const TONES: [string, string][] = [["#f2b8b0", "#c98686"], ["#f7dcd9", "#d9a0a0"], ["#e8b4b4", "#8f5560"], ["#f4c9c0", "#b4707a"], ["#fbe3df", "#c98686"], ["#eaa9a9", "#6e3b47"]];
const PLACEHOLDERS: Reel[] = ["Soft glam, golden hour", "Bridal morning in Buea", "Natural look, studio portrait", "Birthday shoot, on location", "Brand content day", "Date night glow"]
  .map((title, i) => ({ id: String(i), title, category: ["Glam", "Bridal", "Natural", "Events", "Content", "Glam"][i], platform: "placeholder", tone: TONES[i] }));

// Published reels from Firestore (newest first, or the order set in admin). Falls back to placeholders until there is real content.
export async function getReels(): Promise<Reel[]> {
  if (!process.env.FIREBASE_PROJECT_ID) return PLACEHOLDERS;
  try {
    const snap = await db().collection("reels").get();
    const rows = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })).filter((r) => r.status === "published").sort((a, b) => b.sortOrder - a.sortOrder);
    if (!rows.length) return PLACEHOLDERS;
    return rows.map((r, i) => ({ id: r.id, title: r.title, category: r.category, platform: r.platform, embedUrl: embedSrc(r.platform, r.externalId), url: r.url, cover: r.cover || autoCover(r.platform, r.externalId), tone: TONES[i % TONES.length] }));
  } catch { return PLACEHOLDERS; }
}
