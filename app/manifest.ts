import type { MetadataRoute } from "next";
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ADGlam: Makeup & mobile photography",
    short_name: "ADGlam",
    description: "Makeup and mobile photography that comes to you in Buea.",
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
