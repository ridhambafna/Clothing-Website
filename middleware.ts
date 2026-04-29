import { NextResponse, NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  // Set a header so layouts can detect the path
  const res = NextResponse.next();
  res.headers.set("x-pathname", pathname);
  // Gate /admin/* (except /admin/login) on cookie presence (real auth is server-side)
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    const token = req.cookies.get("lux-session")?.value;
    if (!token) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      return NextResponse.redirect(url);
    }
  }
  return res;
}

export const config = {
  matcher: ["/admin/:path*"],
};
