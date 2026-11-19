import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { auth, db } from "@/lib/firebase/admin";
import { COOKIE, rank } from "@/lib/auth";

const MAX = 5 * 24 * 60 * 60 * 1000; // 5 days

export async function POST(req: NextRequest) {
  try {
    const { idToken } = await req.json();
    const d = await auth().verifyIdToken(idToken, true);
    if (rank(d.role) < 0) return NextResponse.json({ ok: false }, { status: 403 });
    const ref = db().doc(`admins/${d.uid}`), snap = await ref.get();
    if (!snap.exists || snap.data()!.disabled) return NextResponse.json({ ok: false }, { status: 403 });
    const cookie = await auth().createSessionCookie(idToken, { expiresIn: MAX });
    await ref.update({ lastLoginAt: FieldValue.serverTimestamp() });
    const res = NextResponse.json({ ok: true });
    res.cookies.set(COOKIE, cookie, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: MAX / 1000 });
    return res;
  } catch { return NextResponse.json({ ok: false }, { status: 401 }); }
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
