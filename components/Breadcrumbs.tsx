import Link from "next/link";
import { SITE } from "@/lib/site";

// Breadcrumb structured data (lets Google show the page path in results) plus a small visible trail.
export default function Breadcrumbs({ trail, visible = true }: { trail: [string, string][]; visible?: boolean }) {
  const ld = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: trail.map(([name, href], i) => ({ "@type": "ListItem", position: i + 1, name, item: `${SITE.url}${href}` })) };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      {visible && (
        <nav className="crumbs" aria-label="Breadcrumb">
          {trail.map(([n, h], i) => i === trail.length - 1 ? <span key={h} aria-current="page">{n}</span> : <span key={h}><Link href={h}>{n}</Link> / </span>)}
        </nav>
      )}
    </>
  );
}
