// Placeholder data. Replace the body of getReels() with a DB call (see README).
export type Reel = {
  id: string; title: string; kind: "video" | "image"; category: string;
  src?: string; poster?: string; tone: [string, string];
};

export async function getReels(): Promise<Reel[]> {
  return [
    { id: "1", title: "Soft glam, golden hour", kind: "video", category: "Glam", tone: ["#f2b8b0", "#c98686"] },
    { id: "2", title: "Bridal morning in Buea", kind: "video", category: "Bridal", tone: ["#f7dcd9", "#d9a0a0"] },
    { id: "3", title: "Natural look, studio portrait", kind: "image", category: "Natural", tone: ["#e8b4b4", "#8f5560"] },
    { id: "4", title: "Birthday shoot, on location", kind: "video", category: "Events", tone: ["#f4c9c0", "#b4707a"] },
    { id: "5", title: "Brand content day", kind: "image", category: "Content", tone: ["#fbe3df", "#c98686"] },
    { id: "6", title: "Date night glow", kind: "video", category: "Glam", tone: ["#eaa9a9", "#6e3b47"] },
  ];
}
