import { ImageResponse } from "next/og";
export const size = { width: 512, height: 512 };
export const contentType = "image/png";
export default function Icon() {
  return new ImageResponse(
    (<div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg,#f6c4bc,#c98686 55%,#a85d6b)", borderRadius: "22%", color: "#fff7f3", fontSize: 250, fontWeight: 700, letterSpacing: -12 }}>AD</div>),
    { ...size }
  );
}
