"use server";
import { revalidatePath } from "next/cache";
import { Timestamp } from "firebase-admin/firestore";
import { db } from "@/lib/firebase/admin";
import { requireRole } from "@/lib/auth";
import { SITE } from "@/lib/site";
import { MEDIUMS, PATHS, SOURCES, slugify } from "@/lib/campaigns";

type R = { ok: boolean; error?: string; link?: string };

export async function createCampaign(i: { name: string; source: string; medium: string; path: string; budget: string; notes: string }): Promise<R> {
  const me = await requireRole("editor");
  const name = i.name.trim(), slug = slugify(name);
  if (name.length < 3 || !slug) return { ok: false, error: "Give the campaign a short name." };
  if (!SOURCES.some(([v]) => v === i.source) || !MEDIUMS.some(([v]) => v === i.medium) || !PATHS.some(([v]) => v === i.path)) return { ok: false, error: "Check the source, type and landing page." };
  const budget = i.budget.trim() ? Number(i.budget) : null;
  if (budget !== null && (!Number.isFinite(budget) || budget < 0)) return { ok: false, error: "Budget must be a number." };
  if (!(await db().collection("campaigns").where("slug", "==", slug).limit(1).get()).empty) return { ok: false, error: "A campaign with that name already exists." };
  const link = `${SITE.url}${i.path}?utm_source=${i.source}&utm_medium=${i.medium}&utm_campaign=${slug}`;
  await db().collection("campaigns").add({ name, slug, source: i.source, medium: i.medium, path: i.path, link, budget, notes: i.notes.trim().slice(0, 500), createdBy: me.uid, createdAt: Timestamp.now() });
  revalidatePath("/admin/campaigns"); return { ok: true, link };
}

export async function deleteCampaign(id: string): Promise<R> {
  await requireRole("editor");
  await db().doc(`campaigns/${id}`).delete();
  revalidatePath("/admin/campaigns"); return { ok: true };
}
