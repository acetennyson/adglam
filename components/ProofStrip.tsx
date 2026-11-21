import { PROOF, SITE } from "@/lib/site";

// Social proof. Renders only what is filled in lib/site.ts (PROOF), so nothing is ever claimed without a real number behind it.
export default function ProofStrip() {
  const items: { label: string; href?: string }[] = [];
  if (PROOF.googleRating && PROOF.googleReviews) items.push({ label: `★ ${PROOF.googleRating} on Google · ${PROOF.googleReviews} reviews`, href: PROOF.googleReviewsUrl || undefined });
  if (PROOF.tiktokFollowers) items.push({ label: `${PROOF.tiktokFollowers} followers on TikTok`, href: SITE.tiktok });
  if (PROOF.instagramFollowers) items.push({ label: `${PROOF.instagramFollowers} followers on Instagram`, href: PROOF.instagramUrl || undefined });
  PROOF.highlights.filter(Boolean).forEach((h) => items.push({ label: h }));
  if (!items.length) return null;
  return (
    <section className="proof" aria-label="Trusted by">
      <ul>{items.map((i) => <li key={i.label}>{i.href ? <a href={i.href} target="_blank" rel="noreferrer">{i.label}</a> : i.label}</li>)}</ul>
      {PROOF.googleReviewsUrl && <a className="proof-cta" href={PROOF.googleReviewsUrl} target="_blank" rel="noreferrer">Leave a review</a>}
    </section>
  );
}
