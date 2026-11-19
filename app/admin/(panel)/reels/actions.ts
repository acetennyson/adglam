"use server";
import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { Timestamp } from "firebase-admin/firestore";
import { db, storage } from "@/lib/firebase/admin";
import { rank, requireRole, type Session } from "@/lib/auth";
import { CATEGORIES, parseReelUrl } from "@/lib/embed";

type R = { ok: boolean; error?: string };
const fail = (error: string): R => ({ ok: false, error });
const bust = () => { revalidatePath("/"); revalidatePath("/admin/reels"); };
const isEditor = (me: Session) => rank(me.role) >= rank("editor");
const canEdit = (me: Session, r: any) => isEditor(me) || (r.status === "draft" && r.createdBy === me.uid);
async function load(id: string) { const s = await db().doc(`reels/${id}`).get(); return s.exists ? s.data()! : null; }

// Short TikTok links (vm.tiktok.com, tiktok.com/t/...) are resolved on the server; only those hosts are ever fetched.
async function resolveUrl(raw: string) {
  let u: URL; try { u = new URL(raw.trim()); } catch { return null; }
  const h = u.hostname.replace(/^www\./, "");
  if (h === "vm.tiktok.com" || h === "vt.tiktok.com" || (h === "tiktok.com" && u.pathname.startsWith("/t/"))) {
    try { const res = await fetch(u.toString(), { redirect: "follow", signal: AbortSignal.timeout(5000) }); return parseReelUrl(res.url); } catch { return null; }
  }
  return parseReelUrl(raw);
}

async function putCover(id: string, data: string) {
  const m = /^data:image\/jpeg;base64,(.+)$/.exec(data);
  if (!m) throw new Error("Cover must be a JPEG.");
  const buf = Buffer.from(m[1], "base64");
  if (buf.length > 700_000) throw new Error("Cover is too large.");
  const token = randomUUID(), path = `reels/covers/${id}-${Date.now()}.jpg`, file = storage().bucket().file(path);
  await file.save(buf, { contentType: "image/jpeg", metadata: { cacheControl: "public,max-age=31536000", metadata: { firebaseStorageDownloadTokens: token } } });
  return `https://firebasestorage.googleapis.com/v0/b/${file.bucket.name}/o/${encodeURIComponent(path)}?alt=media&token=${token}`;
}

export async function saveReel(i: { id?: string; url: string; title: string; category: string; coverData?: string; publish?: boolean }): Promise<R> {
  const me = await requireRole("contributor");
  const title = i.title.trim();
  if (!title || title.length > 80) return fail("Add a title (80 characters max).");
  if (!CATEGORIES.includes(i.category)) return fail("Pick a category.");
  const p = await resolveUrl(i.url);
  if (!p) return fail("That is not a TikTok, Instagram or YouTube video link.");
  try {
    const existing = i.id ? await load(i.id) : null;
    if (i.id && !existing) return fail("Reel not found.");
    if (existing && !canEdit(me, existing)) return fail("You can only edit your own drafts.");
    const ref = i.id ? db().doc(`reels/${i.id}`) : db().collection("reels").doc();
    const data: Record<string, unknown> = { platform: p.platform, externalId: p.externalId, url: p.url, title, category: i.category, cover: existing?.cover ?? null, updatedAt: Timestamp.now() };
    if (i.coverData) data.cover = await putCover(ref.id, i.coverData);
    if (!existing) Object.assign(data, { status: "draft", sortOrder: Date.now(), createdBy: me.uid, createdByName: me.name, createdAt: Timestamp.now() });
    if (i.publish && isEditor(me) && existing?.status !== "published") Object.assign(data, { status: "published", publishedAt: Timestamp.now() });
    await ref.set(data, { merge: true });
    bust(); return { ok: true };
  } catch (e: any) { return fail(e?.message || "Could not save."); }
}

export async function setStatus(id: string, status: "draft" | "published"): Promise<R> {
  await requireRole("editor");
  if (!(await load(id))) return fail("Reel not found.");
  await db().doc(`reels/${id}`).update({ status, ...(status === "published" ? { publishedAt: Timestamp.now() } : {}) });
  bust(); return { ok: true };
}

export async function deleteReel(id: string): Promise<R> {
  const me = await requireRole("contributor");
  const r = await load(id);
  if (!r) return fail("Reel not found.");
  if (!canEdit(me, r)) return fail("You can only delete your own drafts.");
  await db().doc(`reels/${id}`).delete(); bust(); return { ok: true };
}

// Swap display position with the neighbour among published reels (newest-first order).
export async function moveReel(id: string, dir: "up" | "down"): Promise<R> {
  await requireRole("editor");
  const snap = await db().collection("reels").get();
  const list = snap.docs.filter((d) => d.data().status === "published").sort((a, b) => b.data().sortOrder - a.data().sortOrder);
  const i = list.findIndex((d) => d.id === id), j = dir === "up" ? i - 1 : i + 1;
  if (i < 0 || j < 0 || j >= list.length) return { ok: true };
  const a = list[i], b = list[j];
  const batch = db().batch();
  batch.update(a.ref, { sortOrder: b.data().sortOrder }); batch.update(b.ref, { sortOrder: a.data().sortOrder });
  await batch.commit(); bust(); return { ok: true };
}
