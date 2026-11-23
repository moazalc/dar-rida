import { NextResponse, type NextRequest } from "next/server";
import { adminRoute } from "@/lib/admin-route";
import { COUNTRY_COOKIE } from "@/lib/markets";
import { defaultLocale, isLocale, isRoutableLocale, LOCALE_COOKIE, LOCALE_HEADER, PATH_HEADER } from "./config";
import { pickLocale } from "./negotiate";

/** Paths that never carry a language: the admin, the API, files, print pages and the coming-soon page. */
export function skipsLocale(pathname: string): boolean {
  const under = (base: string) => pathname === base || pathname.startsWith(`${base}/`);
  if (["/api", "/admin", "/media", "/print", "/_next", "/coming-soon", adminRoute()].some(under)) return true;
  return (pathname.split("/").pop() ?? "").includes(".");
}

/**
 * The shop's language lives in the address (/ar/collection). A prefixed path is
 * served by the un-prefixed page with the language passed in a header; a path
 * without one is redirected to the visitor's language, so old links keep working.
 * Returns null for paths that don't take a language.
 */
export function routeLocale(request: NextRequest): NextResponse | null {
  const { pathname, search } = request.nextUrl;
  if (skipsLocale(pathname)) return null;

  const [, first = "", ...rest] = pathname.split("/");
  const restPath = `/${rest.join("/")}`.replace(/\/+$/, "") || "/";

  if (isLocale(first)) {
    if (!isRoutableLocale(first)) {
      const url = request.nextUrl.clone();
      url.pathname = restPath === "/" ? `/${defaultLocale}` : `/${defaultLocale}${restPath}`;
      return NextResponse.redirect(url, 307);
    }
    const url = request.nextUrl.clone();
    url.pathname = restPath;
    const headers = new Headers(request.headers);
    headers.set(LOCALE_HEADER, first);
    headers.set(PATH_HEADER, restPath);
    return NextResponse.rewrite(url, { request: { headers } });
  }

  const locale = pickLocale({
    cookie: request.cookies.get(LOCALE_COOKIE)?.value,
    acceptLanguage: request.headers.get("accept-language"),
    country: request.cookies.get(COUNTRY_COOKIE)?.value,
  });
  const url = request.nextUrl.clone();
  url.pathname = pathname === "/" ? `/${locale}` : `/${locale}${pathname}`;
  url.search = search;
  return NextResponse.redirect(url, 307);
}
