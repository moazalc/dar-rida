import { afterEach, describe, expect, it, vi } from "vitest";
import { isRoutableLocale, locales, publishedLocales } from "@/lib/i18n/config";
import { pickLocale } from "@/lib/i18n/negotiate";

afterEach(() => vi.unstubAllEnvs());

describe("locales", () => {
  it("lists the seven, English and Arabic published", () => {
    expect(locales).toEqual(["en", "ar", "fr", "ru", "tr", "de", "es"]);
    expect(publishedLocales).toEqual(["en", "ar"]);
  });
  it("only published locales are routable unless ALL_LOCALES=1", () => {
    expect(isRoutableLocale("fr")).toBe(false);
    vi.stubEnv("ALL_LOCALES", "1");
    expect(isRoutableLocale("fr")).toBe(true);
  });
});

describe("pickLocale", () => {
  it("the cookie wins", () => {
    expect(pickLocale({ cookie: "ar", acceptLanguage: "en" })).toBe("ar");
  });
  it("then the best Accept-Language match", () => {
    expect(pickLocale({ acceptLanguage: "de;q=0.4, ar;q=0.9" })).toBe("ar");
    expect(pickLocale({ acceptLanguage: "ar-LY,ar;q=0.9" })).toBe("ar");
  });
  it("skips unpublished languages", () => {
    expect(pickLocale({ acceptLanguage: "fr-CA, fr;q=0.9" })).toBe("en");
    vi.stubEnv("ALL_LOCALES", "1");
    expect(pickLocale({ acceptLanguage: "fr-CA, fr;q=0.9" })).toBe("fr");
  });
  it("Libya defaults to Arabic", () => {
    expect(pickLocale({ country: "LY" })).toBe("ar");
  });
  it("falls back to English and ignores junk", () => {
    expect(pickLocale({})).toBe("en");
    expect(pickLocale({ cookie: "xx", acceptLanguage: "*" })).toBe("en");
  });
});
