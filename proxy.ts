import { timingSafeEqual } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { adminRoute } from "@/lib/admin-route";

/**
 * Before launch, the whole site sits behind the browser's own login box when
 * SITE_USERNAME and SITE_PASSWORD are both set (deploy/.env). Leave either one
 * empty to open the site. Stripe's webhook stays open because Stripe cannot type
 * a password, and so do the photo/video files in /media (see the matcher).
 */
function passwordGate(request: NextRequest): NextResponse | null {
  const user = process.env.SITE_USERNAME;
  const pass = process.env.SITE_PASSWORD;
  if (!user || !pass) return null;

  const header = request.headers.get("authorization") ?? "";
  if (header.startsWith("Basic ")) {
    const given = Buffer.from(header.slice(6), "base64").toString();
    const expected = `${user}:${pass}`;
    const a = Buffer.from(given);
    const b = Buffer.from(expected);
    if (a.length === b.length && timingSafeEqual(a, b)) return null;
  }
  return new NextResponse("Dar Rida is not open yet.", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Dar Rida", charset="UTF-8"', "Cache-Control": "no-store" },
  });
}

/**
 * Also serves the admin at its own path (ADMIN_PATH, see lib/admin-route.ts)
 * while the code stays in app/(payload)/admin, and makes "/admin" itself a
 * plain "page not found", so scanners never see a login page there.
 */
export function proxy(request: NextRequest) {
  const locked = passwordGate(request);
  if (locked) return locked;

  const { pathname } = request.nextUrl;
  // The API is gated above but never rewritten.
  if (pathname.startsWith("/api/")) return NextResponse.next();

  const admin = adminRoute();
  const under = (base: string) => pathname === base || pathname.startsWith(`${base}/`);

  if (admin !== "/admin" && under(admin)) {
    const url = request.nextUrl.clone();
    url.pathname = `/admin${pathname.slice(admin.length)}`;
    return NextResponse.rewrite(url);
  }
  if (admin !== "/admin" && under("/admin")) {
    const url = request.nextUrl.clone();
    url.pathname = "/__not-found";
    return NextResponse.rewrite(url, { status: 404 });
  }
  // COMING_SOON=1 (deploy/.env): every shop page shows the coming-soon picture.
  // The admin, the API, /media and the admin's print pages (/print, app/(print)) keep working,
  // so products can still be added and orders printed.
  if (process.env.COMING_SOON === "1" && !under(admin) && !under("/print") && pathname !== "/coming-soon") {
    const url = request.nextUrl.clone();
    url.pathname = "/coming-soon";
    return NextResponse.rewrite(url, { headers: { "Cache-Control": "no-store" } });
  }
  return NextResponse.next();
}

export const config = {
  // Everything but Next's own build files, robots.txt, Stripe's webhook and /media. Media
  // stays open because Next's image optimizer fetches /media itself without the
  // visitor's password, and Safari's video player never sends it, so a gated
  // /media meant broken photos and the login box popping up again and again.
  matcher: ["/((?!_next/|favicon.ico|robots.txt|api/stripe/webhook|media/).*)"],
};
