import type { Metadata } from "next";
import "./globals.css";
import { fontVars } from "@/lib/fonts";
import { DirectionProvider } from "@/components/ui/direction";
import { I18nProvider } from "@/components/providers/i18n-provider";
import { UnitProvider } from "@/components/providers/unit-provider";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getDirection } from "@/lib/i18n/config";
import { cartCount as readCartCount } from "@/lib/cart";
import { getUnitPreference } from "@/lib/unit-preference";
import { getCountry } from "@/lib/country";
import { getSessionUser } from "@/lib/customers";

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
  const [cartCount, unit, country, user] = await Promise.all([
    readCartCount(),
    getUnitPreference(),
    getCountry(),
    getSessionUser().catch((error) => (console.error("Reading the session failed", error), null)),
  ]);

  return (
    <html lang={locale} dir={dir} style={fontVars} className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <DirectionProvider direction={dir}>
          <I18nProvider value={{ locale, dir, dict }}>
            <UnitProvider initial={unit}>
              <SiteHeader cartCount={cartCount} signedIn={Boolean(user)} />
              <main id="main" className="flex-1">
                {children}
              </main>
              <SiteFooter dict={dict} country={country} />
            </UnitProvider>
          </I18nProvider>
        </DirectionProvider>
      </body>
    </html>
  );
}
