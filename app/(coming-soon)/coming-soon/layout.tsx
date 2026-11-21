import type { Metadata } from "next";
import "../../(frontend)/globals.css";
import { fontVars } from "@/lib/fonts";

export const metadata: Metadata = {
  title: "Dar Rida — Coming soon",
  description: "Made-to-order abayas, crafted by hand. Opening soon.",
  robots: { index: false },
};

/**
 * Its own root layout, without the shop's header and footer, so nothing on the
 * page links back into the shop while COMING_SOON is on (see proxy.ts).
 */
export default function ComingSoonLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" style={fontVars} className="h-full antialiased">
      <body className="h-full">{children}</body>
    </html>
  );
}
