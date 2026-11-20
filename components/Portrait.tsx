import { FOUNDER } from "@/lib/site";

// Arch-shaped portrait. Shows her photo when FOUNDER.photo is set, otherwise an elegant monogram.
export default function Portrait() {
  const initials = FOUNDER.name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  return (
    <div className="portrait">
      {FOUNDER.photo ? <img src={FOUNDER.photo} alt={`Portrait of ${FOUNDER.name}`} /> : <span aria-hidden>{initials}</span>}
      <i className="spark s1" /><i className="spark s2" /><i className="spark s3" />
    </div>
  );
}
