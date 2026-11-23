import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

// next/font only accepts literal options, so the subsets are checked in the source.
function subsetsIn(file: string): Record<string, string[]> {
  const src = readFileSync(file, "utf8");
  const found: Record<string, string[]> = {};
  for (const [, loader, list] of src.matchAll(/\b([A-Z][A-Za-z_]+)\(\{\s*subsets:\s*\[([^\]]*)\]/g)) {
    found[loader.replace(/_/g, " ")] = [...list.matchAll(/"([^"]+)"/g)].map((m) => m[1]);
  }
  return found;
}

const brand = subsetsIn("lib/fonts.ts");
const candidates = subsetsIn("app/(frontend)/styleguide/candidate-fonts.ts");

describe("fonts", () => {
  it.each(["Cormorant Garamond", "Jost"])("%s covers Turkish and Russian", (family) => {
    expect(brand[family]).toEqual(expect.arrayContaining(["latin-ext", "cyrillic"]));
  });
  it.each(["El Messiri", "Almarai"])("%s covers Arabic", (family) => {
    expect(brand[family]).toContain("arabic");
  });
  it.each(["Playfair Display", "Noto Serif Display", "Manrope"])("candidate %s covers Turkish and Russian", (family) => {
    expect(candidates[family]).toEqual(expect.arrayContaining(["latin-ext", "cyrillic"]));
  });
  it.each(["IBM Plex Sans Arabic", "Noto Kufi Arabic"])("candidate %s covers Arabic", (family) => {
    expect(candidates[family]).toContain("arabic");
  });
});
