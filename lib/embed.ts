// Pure helpers (safe for server and client): detect a platform from a pasted link and build the embed URL.
export type Platform = "tiktok" | "instagram" | "youtube";
export type Parsed = { platform: Platform; externalId: string; url: string };
export type Reel = { id: string; title: string; category: string; platform: Platform | "placeholder"; embedUrl?: string; url?: string; cover?: string | null; tone: [string, string] };
export const PLATFORM_LABEL: Record<Platform, string> = { tiktok: "TikTok", instagram: "Instagram", youtube: "YouTube" };
export const CATEGORIES = ["Glam", "Bridal", "Natural", "Events", "Content", "Portraits"];

export function parseReelUrl(raw: string): Parsed | null {
  let u: URL;
  try { u = new URL(raw.trim()); } catch { return null; }
  const h = u.hostname.replace(/^(www|m)\./, ""), p = u.pathname;
  const yt = (id?: string | null) => (id && /^[\w-]{11}$/.test(id) ? ({ platform: "youtube", externalId: id, url: `https://www.youtube.com/watch?v=${id}` } as Parsed) : null);
  if (h === "youtu.be") return yt(p.slice(1, 12));
  if (h === "youtube.com") return yt(u.searchParams.get("v") || p.match(/^\/(?:shorts|embed|live)\/([\w-]{11})/)?.[1]);
  if (h === "tiktok.com") {
    const m = p.match(/^\/(@[\w.-]+)\/video\/(\d+)/);
    return m ? { platform: "tiktok", externalId: m[2], url: `https://www.tiktok.com/${m[1]}/video/${m[2]}` } : null;
  }
  if (h === "instagram.com") {
    const m = p.match(/\/(?:reel|reels|p|tv)\/([\w-]+)/);
    return m ? { platform: "instagram", externalId: m[1], url: `https://www.instagram.com/reel/${m[1]}/` } : null;
  }
  return null;
}

export function embedSrc(platform: Platform, id: string) {
  if (platform === "youtube") return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&playsinline=1`;
  // Mirrors the iframe TikTok's own oEmbed endpoint returns (player/v1 + embed_from=oembed, muted autoplay).
  // Set NEXT_PUBLIC_TIKTOK_EMBED=classic to fall back to the older /embed/v2 page.
  if (platform === "tiktok") return process.env.NEXT_PUBLIC_TIKTOK_EMBED === "classic" ? `https://www.tiktok.com/embed/v2/${id}` : `https://www.tiktok.com/player/v1/${id}?embed_from=oembed&music_info=1&description=1&autoplay=1&muted=1`;
  return `https://www.instagram.com/reel/${id}/embed/`;
}
export const autoCover = (platform: Platform, id: string) => (platform === "youtube" ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : null);
