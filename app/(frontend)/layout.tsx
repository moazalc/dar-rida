import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { fontVars } from "@/lib/fonts";
import { DirectionProvider } from "@/components/ui/direction";
import { I18nProvider } from "@/components/providers/i18n-provider";
import { UnitProvider } from "@/components/providers/unit-provider";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getLocale, getPathname } from "@/lib/i18n/locale";
import { alternatesFor } from "@/lib/i18n/seo";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getDirection } from "@/lib/i18n/config";
import { cartCount as readCartCount } from "@/lib/cart";
import { getUnitPreference } from "@/lib/unit-preference";
import { getCountry } from "@/lib/country";
import { getSessionUser } from "@/lib/customers";
import { siteUrl } from "@/lib/stripe";

// In the visitor's language. Pages set their own titles (which already end in
// the brand name), so this default only shows on the homepage and on pages
// without one. metadataBase makes Open Graph image paths absolute.
export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dict = await getDictionary(locale);
  return {
    metadataBase: new URL(siteUrl()),
    // This page in each language (hreflang) and its own address in this one.
    alternates: alternatesFor(await getPathname(), locale, siteUrl()),
    title: dict.common.brandName,
    description: dict.common.siteDescription,
    openGraph: { siteName: dict.common.brandName, title: dict.common.brandName, description: dict.common.siteDescription },
  };
}

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

  // Visitor counts for the admin dashboard, only once Umami is set up (UMAMI_URL, UMAMI_WEBSITE_ID).
  const umamiUrl = process.env.UMAMI_URL?.replace(/\/$/, "");
  const umamiSite = process.env.UMAMI_WEBSITE_ID;
  // In production the browser loads it through nginx (/stats/script.js) while the server talks to Umami directly.
  const umamiScript = process.env.UMAMI_SCRIPT_URL || `${umamiUrl}/script.js`;

  return (
    <html lang={locale} dir={dir} style={fontVars} className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <DirectionProvider direction={dir}>
          <I18nProvider value={{ locale, dir, dict }}>
            <UnitProvider key={unit.locked ? "cm-only" : "any-unit"} initial={unit.unit} locked={unit.locked}>
              <SiteHeader cartCount={cartCount} signedIn={Boolean(user)} />
              <main id="main" className="flex-1">
                {children}
              </main>
              <SiteFooter dict={dict} country={country} />
            </UnitProvider>
          </I18nProvider>
        </DirectionProvider>
        {umamiUrl && umamiSite ? <Script src={umamiScript} data-website-id={umamiSite} strategy="afterInteractive" /> : null}
      </body>
    </html>
  );
}
