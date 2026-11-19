import { db } from "@/lib/firebase/admin";
import { requireRole } from "@/lib/auth";
import ReelsClient from "./ReelsClient";

export default async function ReelsPage() {
  const me = await requireRole("contributor");
  const snap = await db().collection("reels").get();
  const reels = snap.docs.map((d) => { const x = d.data(); return { id: d.id, title: x.title, category: x.category, platform: x.platform, externalId: x.externalId, url: x.url, cover: x.cover ?? null, status: x.status, sortOrder: x.sortOrder, by: x.createdByName ?? "", mine: x.createdBy === me.uid }; })
    .sort((a, b) => b.sortOrder - a.sortOrder);
  return (<><h1 className="h2">Reels</h1><p className="lede">Paste a TikTok, Instagram or YouTube link. Contributors save drafts; editors publish.</p><ReelsClient reels={reels} role={me.role} /></>);
}
