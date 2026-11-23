import { Almarai, Cormorant_Garamond, El_Messiri, Jost } from "next/font/google";
import type { CSSProperties } from "react";

// Latin and Cyrillic: Cormorant Garamond (display) + Jost (body), with Latin
// Extended for Turkish, German, French and Spanish letters.
// Arabic: El Messiri (display) + Almarai (body).
export const cormorant = Cormorant_Garamond({
  subsets: ["latin", "latin-ext", "cyrillic"],
  weight: ["300", "400", "500", "600"],
});

export const jost = Jost({
  subsets: ["latin", "latin-ext", "cyrillic"],
  weight: ["400", "500"],
});

export const messiri = El_Messiri({
  subsets: ["arabic"],
  weight: ["400", "500", "600"],
});

export const almarai = Almarai({
  subsets: ["arabic"],
  weight: ["400", "700"],
});

/**
 * One font-family list per role: every real face first, then every fallback.
 * The Latin faces only cover Latin, so Arabic characters fall through to the
 * Arabic face in either locale. The fallbacks (local Times/Arial, which carry
 * Arabic glyphs on Windows and macOS) must come after BOTH real faces or they
 * would catch Arabic text first. `adjustFontFallback: false` would avoid that
 * too, but Turbopack ignores it.
 */
export function fontStack(...fonts: { style: { fontFamily: string } }[]): string {
  const families = fonts.map((f) => f.style.fontFamily.split(",").map((s) => s.trim()));
  return [...families.map((f) => f[0]), ...families.flatMap((f) => f.slice(1))].join(", ");
}

export const fontVars = {
  "--font-display": fontStack(cormorant, messiri),
  "--font-body": fontStack(jost, almarai),
} as CSSProperties;
