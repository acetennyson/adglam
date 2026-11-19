import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";
import { city } from "@/lib/contact";
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ADGlam: Makeup & mobile photography",
    short_name: SITE.name,
    description: `Makeup and mobile photography that comes to you in ${city}.`,
    start_url: "/",
    display: "standalone",
    background_color: "#fbefea",
    theme_color: "#c98686",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
