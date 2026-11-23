import { describe, expect, it, vi } from "vitest";
import en from "@/lib/i18n/dictionaries/en";
import { mergeDictionary } from "@/lib/i18n/merge";

vi.mock("server-only", () => ({}));

describe("mergeDictionary", () => {
  it("uses a translated string and keeps English for the rest", () => {
    const merged = mergeDictionary(en, { nav: { collection: "Collection FR" } });
    expect(merged.nav.collection).toBe("Collection FR");
    expect(merged.nav.search).toBe(en.nav.search);
    expect(merged.home).toEqual(en.home);
  });
  it("an empty string keeps English", () => {
    expect(mergeDictionary(en, { nav: { collection: "" } }).nav.collection).toBe(en.nav.collection);
  });
  it("does not change the English dictionary", () => {
    mergeDictionary(en, { nav: { collection: "X" } });
    expect(en.nav.collection).not.toBe("X");
  });
});

describe("getDictionary", () => {
  it("an untranslated language falls back to English", async () => {
    const { getDictionary } = await import("@/lib/i18n/dictionaries");
    expect(await getDictionary("fr")).toEqual(en);
    expect((await getDictionary("ar")).nav.collection).not.toBe(en.nav.collection);
  });
});
