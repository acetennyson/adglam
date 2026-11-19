import { ImageResponse } from "next/og";
export const alt = "ADGlam: makeup and mobile photography in Buea";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default function OG() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: 90, background: "linear-gradient(135deg,#fbefea,#f2b8b0 60%,#c98686)", color: "#1b1114" }}>
        <div style={{ fontSize: 26, letterSpacing: 6, color: "#6b4f55", display: "flex" }}>LOOK BEAUTIFUL. CAPTURE MOMENTS.</div>
        <div style={{ fontSize: 190, fontWeight: 700, lineHeight: 1.05, display: "flex" }}>ADGlam</div>
        <div style={{ fontSize: 44, color: "#a85d6b", display: "flex" }}>Makeup & mobile photography</div>
        <div style={{ fontSize: 28, marginTop: 28, color: "#6b4f55", display: "flex" }}>Buea, Mayor's Street · We come to you</div>
      </div>
    ),
    { ...size }
  );
}
