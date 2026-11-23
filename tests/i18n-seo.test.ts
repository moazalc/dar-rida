import { describe, expect, it } from "vitest";
import { alternatesFor } from "@/lib/i18n/seo";

describe("alternatesFor", () => {
  it("gives the canonical address and one per published language", () => {
    const a = alternatesFor("/collection", "ar", "https://darrida.net");
    expect(a.canonical).toBe("https://darrida.net/ar/collection");
    expect(a.languages.en).toBe("https://darrida.net/en/collection");
    expect(a.languages.ar).toBe("https://darrida.net/ar/collection");
    expect(a.languages["x-default"]).toBe(a.languages.en);
    expect(a.languages).not.toHaveProperty("fr");
  });
  it("handles the home page", () => {
    const a = alternatesFor("/", "en", "https://darrida.net");
    expect(a.canonical).toBe("https://darrida.net/en");
    expect(a.languages.ar).toBe("https://darrida.net/ar");
  });
});
