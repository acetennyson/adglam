import Link from "next/link";
import { requireRole, type Role } from "@/lib/auth";

const CAN: Record<Role, string> = {
  owner: "You can manage the team and do everything editors can.",
  editor: "You can create, edit and publish content.",
  contributor: "You can create and edit drafts. An editor publishes them.",
};

export default async function Dashboard({ searchParams }: { searchParams: { denied?: string } }) {
  const me = await requireRole();
  return (
    <>
      <h1 className="h2">Welcome, {me.name.split(" ")[0]}</h1>
      <p className="lede">{CAN[me.role]}</p>
      {searchParams.denied && <p className="adm-err">Your role does not have access to that page.</p>}
      <div className="two">
        {(me.role === "owner" || me.role === "editor") && <Link href="/admin/messages" className="glass card"><h3>Messages</h3><p className="lede">Read and answer enquiries from the contact page.</p></Link>}
        {(me.role === "owner" || me.role === "editor") && <Link href="/admin/insights" className="glass card"><h3>Insights</h3><p className="lede">Visitors, sources, places and what people are interested in.</p></Link>}
        {(me.role === "owner" || me.role === "editor") && <Link href="/admin/campaigns" className="glass card"><h3>Campaigns</h3><p className="lede">Tagged links and what each campaign brings in.</p></Link>}
        {me.role === "owner" && <Link href="/admin/team" className="glass card"><h3>Team</h3><p className="lede">Invite admins, change roles, disable access.</p></Link>}
        <Link href="/admin/reels" className="glass card"><h3>Reels</h3><p className="lede">Add social videos, draft and publish them.</p></Link>
        {["Blog", "Contact info"].map((m) => <div key={m} className="glass card soon"><h3>{m}</h3><p className="lede">Coming next.</p></div>)}
      </div>
    </>
  );
}
