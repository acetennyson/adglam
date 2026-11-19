import { SITE } from "./site";

// "+237670724330" -> "+237 670 724 330" (other formats are shown as written)
export function phonePretty(p: string = SITE.phone) {
  const d = p.replace(/\D/g, "");
  return d.startsWith("237") && d.length === 12 ? `+237 ${d.slice(3, 6)} ${d.slice(6, 9)} ${d.slice(9)}` : p;
}
// "https://www.tiktok.com/@adianenow" -> "@adianenow"
export function tiktokHandle(url: string = SITE.tiktok) {
  return url.match(/tiktok\.com\/(@[\w.]+)/i)?.[1] ?? "TikTok";
}
// "Buea, Cameroon" -> city "Buea", country "Cameroon"
const parts = SITE.location.split(",").map((x) => x.trim());
export const city = parts[0];
export const country = parts.slice(1).join(", ");
