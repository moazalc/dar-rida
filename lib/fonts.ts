import { Almarai, Cormorant_Garamond, El_Messiri, Jost } from "next/font/google";
import type { CSSProperties } from "react";

// Latin: Cormorant Garamond (display) + Jost (body).
// Arabic: El Messiri (display) + Almarai (body).
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

const jost = Jost({
  subsets: ["latin"],
  weight: ["400", "500"],
});

const messiri = El_Messiri({
  subsets: ["arabic"],
  weight: ["400", "500", "600"],
});

const almarai = Almarai({
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
function fontStack(...fonts: { style: { fontFamily: string } }[]): string {
  const families = fonts.map((f) => f.style.fontFamily.split(",").map((s) => s.trim()));
  return [...families.map((f) => f[0]), ...families.flatMap((f) => f.slice(1))].join(", ");
}

export const fontVars = {
  "--font-display": fontStack(cormorant, messiri),
  "--font-body": fontStack(jost, almarai),
} as CSSProperties;
