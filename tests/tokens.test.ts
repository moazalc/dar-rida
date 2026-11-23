import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { contrastRatio, readCssColors } from "@/lib/contrast";

const css = readFileSync("app/(frontend)/globals.css", "utf8");
const c = readCssColors(css);

describe("design tokens", () => {
  it("computes WCAG contrast", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBe(21);
    expect(contrastRatio("#24211f", "#f7f2e9")).toBeCloseTo(14.35, 1);
  });

  it("uses the spec values", () => {
    expect(c.taupe).toBe("#6b645c");
    expect(c["line-strong"]).toBe("#857a6e");
  });

  it.each([
    ["charcoal", "ivory", 4.5],
    ["taupe", "ivory", 4.5],
    ["taupe", "card", 4.5],
    ["destructive", "ivory", 4.5],
    ["ivory", "espresso", 4.5],
    ["gold-soft", "espresso", 4.5],
    ["line-strong", "ivory", 3],
    ["line-strong", "card", 3],
    ["line-strong", "linen", 3],
  ] as const)("%s on %s ≥ %s:1", (fg, bg, min) => {
    expect(contrastRatio(c[fg], c[bg])).toBeGreaterThanOrEqual(min);
  });

  it("has a focus rule for dark grounds and a reduced-motion rule", () => {
    expect(css).toMatch(/\[data-ground="dark"\][^{]*:focus-visible/);
    expect(css).toMatch(/prefers-reduced-motion:\s*reduce[\s\S]*transition-duration/);
  });
});

describe("palette data", () => {
  it("matches globals.css", async () => {
    const { palette } = await import("@/lib/tokens");
    for (const swatch of palette) expect(c[swatch.name], swatch.name).toBe(swatch.hex);
  });
});
