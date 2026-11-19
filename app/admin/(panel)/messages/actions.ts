"use server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/firebase/admin";
import { requireRole } from "@/lib/auth";

export async function setRead(id: string, read: boolean) {
  await requireRole("editor");
  await db().doc(`messages/${id}`).update({ read });
  revalidatePath("/admin", "layout"); return { ok: true };
}
export async function deleteMessage(id: string) {
  await requireRole("editor");
  await db().doc(`messages/${id}`).delete();
  revalidatePath("/admin", "layout"); return { ok: true };
}
