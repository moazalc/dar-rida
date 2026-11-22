import type { Metadata } from "next";
import "../(frontend)/globals.css";
import "./print.css";
import { fontVars } from "@/lib/fonts";
import { printContext } from "./print-access";

export const metadata: Metadata = { robots: { index: false, follow: false } };

/**
 * Its own root layout for pages made to be printed from the admin (the tailor
 * sheet): no shop header or footer, and the admin's language and direction.
 */
export default async function PrintLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const { lang } = await printContext();
  return (
    <html lang={lang} dir={lang === "ar" ? "rtl" : "ltr"} style={fontVars}>
      <body className="print-body">{children}</body>
    </html>
  );
}
