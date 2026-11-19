import { db } from "@/lib/firebase/admin";
import { requireRole } from "@/lib/auth";
import MessagesClient from "./MessagesClient";

export default async function Messages() {
  await requireRole("editor");
  const snap = await db().collection("messages").orderBy("createdAt", "desc").limit(200).get();
  const rows = snap.docs.map((d) => { const x = d.data(); return { id: d.id, topic: x.topic, name: x.name, phone: x.phone || "", email: x.email || "", eventDate: x.eventDate || "", message: x.message, read: !!x.read, at: x.createdAt.toMillis() }; });
  return (<><h1 className="h2">Messages</h1><p className="lede">Enquiries from the contact page. Newest first, latest 200.</p><MessagesClient rows={rows} /></>);
}
