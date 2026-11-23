import { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { routeLocale } from "@/lib/i18n/routing";

afterEach(() => vi.unstubAllEnvs());

const req = (path: string, headers: Record<string, string> = {}) => new NextRequest(`https://darrida.net${path}`, { headers });
const location = (res: Response | null) => res?.headers.get("location") ?? "";

describe("routeLocale", () => {
  it("redirects un-prefixed to the negotiated locale", () => {
    const res = routeLocale(req("/collection", { "accept-language": "ar" }));
    expect(res?.status).toBe(307);
    expect(location(res)).toBe("https://darrida.net/ar/collection");
  });

  it("redirect keeps the query", () => {
    expect(location(routeLocale(req("/search?q=black")))).toBe("https://darrida.net/en/search?q=black");
  });

  it("root redirects", () => {
    expect(location(routeLocale(req("/")))).toBe("https://darrida.net/en");
  });

  it("uses the language cookie", () => {
    expect(location(routeLocale(req("/faq", { cookie: "darrida_locale=ar" })))).toBe("https://darrida.net/ar/faq");
  });

  it("rewrites prefixed paths with headers", () => {
    const res = routeLocale(req("/ar/collection/rida-01"));
    expect(res?.headers.get("x-middleware-rewrite")).toBe("https://darrida.net/collection/rida-01");
    expect(res?.headers.get("x-middleware-request-x-dr-locale")).toBe("ar");
    expect(res?.headers.get("x-middleware-request-x-dr-path")).toBe("/collection/rida-01");
  });

  it("rewrites the language home to the home page", () => {
    expect(routeLocale(req("/ar"))?.headers.get("x-middleware-rewrite")).toBe("https://darrida.net/");
    expect(routeLocale(req("/ar/"))?.headers.get("x-middleware-request-x-dr-path")).toBe("/");
  });

  it("unpublished locale redirects to english", () => {
    expect(location(routeLocale(req("/fr/faq?x=1")))).toBe("https://darrida.net/en/faq?x=1");
    vi.stubEnv("ALL_LOCALES", "1");
    expect(routeLocale(req("/fr/faq"))?.headers.get("x-middleware-request-x-dr-locale")).toBe("fr");
  });

  it.each(["/atelier/collections/orders", "/admin", "/api/orders/export", "/media/a.jpg", "/print/orders/1", "/robots.txt", "/sitemap.xml", "/coming-soon"])(
    "skips %s",
    (path) => {
      expect(routeLocale(req(path))).toBeNull();
    },
  );

  it("does not treat a word starting with a locale as a prefix", () => {
    expect(location(routeLocale(req("/arrivals")))).toBe("https://darrida.net/en/arrivals");
  });
});
