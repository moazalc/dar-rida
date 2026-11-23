// The brand palette as data, for the style guide. globals.css is the source the
// site uses; tests/tokens.test.ts fails if the two ever differ.

export type Swatch = {
  name: string;
  hex: string;
  use: string;
  /** What it's checked against: "text" needs 4.5:1, "line" 3:1, "decor" nothing. */
  role: "ground" | "text" | "line" | "decor";
};

export const palette: Swatch[] = [
  { name: "ivory", hex: "#f7f2e9", use: "Page ground", role: "ground" },
  { name: "card", hex: "#fbf8f2", use: "Raised surfaces", role: "ground" },
  { name: "linen", hex: "#e6dccb", use: "Alternate section ground", role: "ground" },
  { name: "espresso", hex: "#1a1715", use: "Dark sections, footer", role: "ground" },
  { name: "charcoal", hex: "#24211f", use: "Text, primary button", role: "text" },
  { name: "taupe", hex: "#6b645c", use: "Secondary text", role: "text" },
  { name: "destructive", hex: "#9b2c2c", use: "Errors", role: "text" },
  { name: "line-strong", hex: "#857a6e", use: "Input borders, edges", role: "line" },
  { name: "champagne", hex: "#c7b49a", use: "Decorative lines only", role: "decor" },
  { name: "gold", hex: "#9a7f57", use: "Measuring lines, ornament; never text", role: "decor" },
  { name: "gold-soft", hex: "#dcc69d", use: "Gold on espresso", role: "decor" },
];
