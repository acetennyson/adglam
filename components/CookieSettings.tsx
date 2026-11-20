"use client";
export default function CookieSettings() {
  return <button type="button" className="linkbtn" onClick={() => window.dispatchEvent(new Event("adg:consent-open"))}>Cookie settings</button>;
}
