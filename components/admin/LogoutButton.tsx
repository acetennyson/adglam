"use client";
import { useRouter } from "next/navigation";
export default function LogoutButton() {
  const router = useRouter();
  return <button className="glass pill" onClick={async () => { await fetch("/api/session", { method: "DELETE" }); router.replace("/admin/login"); router.refresh(); }}>Sign out</button>;
}
