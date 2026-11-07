import type { Metadata } from "next";
import "./globals.css";
import { fontVars } from "@/lib/fonts";
import { DirectionProvider } from "@/components/ui/direction";
import { I18nProvider } from "@/components/providers/i18n-provider";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getDirection } from "@/lib/i18n/config";
import { cartCount as readCartCount } from "@/lib/cart";

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
  const cartCount = await readCartCount();

  return (
    <html lang={locale} dir={dir} style={fontVars} className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <DirectionProvider direction={dir}>
          <I18nProvider value={{ locale, dir, dict }}>
            <SiteHeader cartCount={cartCount} />
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
