import type { Metadata } from "next";
import { Almarai, Cormorant_Garamond, El_Messiri, Jost } from "next/font/google";
import "./globals.css";
import { DirectionProvider } from "@/components/ui/direction";
import { I18nProvider } from "@/components/providers/i18n-provider";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getDirection } from "@/lib/i18n/config";

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

const fontVars = {
  "--font-display": fontStack(cormorant, messiri),
  "--font-body": fontStack(jost, almarai),
} as React.CSSProperties;

export const metadata: Metadata = {
  title: "Dar Rida",
  description: "Made-to-order abayas, crafted by hand",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const dir = getDirection(locale);
  const dict = await getDictionary(locale);

  return (
    <html lang={locale} dir={dir} style={fontVars} className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <DirectionProvider direction={dir}>
          <I18nProvider value={{ locale, dir, dict }}>
            <SiteHeader />
            <main id="main" className="flex-1">
              {children}
            </main>
            <SiteFooter dict={dict} />
          </I18nProvider>
        </DirectionProvider>
      </body>
    </html>
  );
}
