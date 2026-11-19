import { NextResponse, type NextRequest } from "next/server";
import { adminRoute } from "@/lib/admin-route";

/**
 * Serves the admin at its own path (ADMIN_PATH, see lib/admin-route.ts) while
 * the code stays in app/(payload)/admin, and makes "/admin" itself a plain
 * "page not found", so scanners never see a login page there.
 */
export function proxy(request: NextRequest) {
  const admin = adminRoute();
  if (admin === "/admin") return NextResponse.next();
  const { pathname } = request.nextUrl;
  const under = (base: string) => pathname === base || pathname.startsWith(`${base}/`);

  if (under(admin)) {
    const url = request.nextUrl.clone();
    url.pathname = `/admin${pathname.slice(admin.length)}`;
    return NextResponse.rewrite(url);
  }
  if (under("/admin")) {
    const url = request.nextUrl.clone();
    url.pathname = "/__not-found";
    return NextResponse.rewrite(url, { status: 404 });
  }
  return NextResponse.next();
}

export const config = {
  // Pages only: never the API, Next's own files or uploaded photos.
  matcher: ["/((?!api/|_next/|media/|favicon.ico).*)"],
};
