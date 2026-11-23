import { IBM_Plex_Sans_Arabic, Manrope, Noto_Kufi_Arabic, Noto_Serif_Display, Playfair_Display } from "next/font/google";
import type { CSSProperties } from "react";
import { almarai, cormorant, fontStack, jost, messiri } from "@/lib/fonts";

// Only the style guide imports this file, so these faces never load on shop pages.
const playfair = Playfair_Display({ subsets: ["latin", "latin-ext", "cyrillic"], weight: ["400", "500"] });
const notoSerif = Noto_Serif_Display({ subsets: ["latin", "latin-ext", "cyrillic"], weight: ["400", "500"] });
const manrope = Manrope({ subsets: ["latin", "latin-ext", "cyrillic"], weight: ["400", "500"] });
const plexArabic = IBM_Plex_Sans_Arabic({ subsets: ["arabic"], weight: ["400", "500"] });
const kufi = Noto_Kufi_Arabic({ subsets: ["arabic"], weight: ["400", "500"] });

export type FontPairing = {
  id: "current" | "playfair" | "noto";
  label: string;
  /** Sets --font-display and --font-body on the element it's applied to. */
  style: CSSProperties;
};

function pairing(id: FontPairing["id"], label: string, display: string, body: string): FontPairing {
  return { id, label, style: { "--font-display": display, "--font-body": body } as CSSProperties };
}

export const fontPairings: FontPairing[] = [
  pairing("current", "Current: Cormorant + Jost / El Messiri + Almarai", fontStack(cormorant, messiri), fontStack(jost, almarai)),
  pairing("playfair", "Playfair + Manrope / El Messiri + IBM Plex Arabic", fontStack(playfair, messiri), fontStack(manrope, plexArabic)),
  pairing("noto", "Noto Serif Display + Manrope / Noto Kufi + IBM Plex Arabic", fontStack(notoSerif, kufi), fontStack(manrope, plexArabic)),
];
