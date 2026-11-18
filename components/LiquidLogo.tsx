"use client";
import { LiquidMetal } from "@paper-design/shaders-react";

// Shader needs a high-contrast shape with transparency. Replace this SVG with your real logo
// (export it as SVG/PNG with transparent background and put it in /public/logo.svg).
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="500" viewBox="0 0 1200 500"><text x="600" y="330" text-anchor="middle" font-family="Georgia,serif" font-size="320" font-weight="700" fill="#000">ADGlam</text></svg>`;
const logo = "data:image/svg+xml;utf8," + encodeURIComponent(svg);

export default function LiquidLogo({ className }: { className?: string }) {
  return (
    <div className={className} role="img" aria-label="ADGlam">
      <LiquidMetal
        image={logo}
        width={720}
        height={300}
        colorBack="#00000000"
        colorTint="#f2b8b0"
        speed={0.5}
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}
