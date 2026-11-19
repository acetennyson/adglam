import { NextRequest, NextResponse } from "next/server";

// Cheap redirect only. Real verification happens on the server in lib/auth.ts.
export function middleware(req: NextRequest) {
  const p = req.nextUrl.pathname;
  if (p.startsWith("/admin/login") || p.startsWith("/admin/accept")) return NextResponse.next();
  if (!req.cookies.get("adg_session")) {
    const u = req.nextUrl.clone(); u.pathname = "/admin/login"; u.search = "";
    return NextResponse.redirect(u);
  }
  return NextResponse.next();
}
export const config = { matcher: ["/admin/:path*"] };
