import Link from "@/components/locale-link";
import { ComingSoon } from "@/components/coming-soon";
import { CountrySwitcher } from "@/components/country-switcher";
import { LanguageToggle } from "@/components/language-toggle";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { Country } from "@/lib/markets";

/**
 * Warm sand (linen) ground: three quiet link columns up top; underneath,
 * DAR RIDA set edge to edge in light Cormorant, tone on tone, and cut off by
 * the page bottom.
 */
export function SiteFooter({ dict, country }: { dict: Dictionary; country: Country | null }) {
  const l = dict.footer.links;
  const columns = [
    {
      title: dict.footer.shop,
      links: [
        { href: "/collection", label: l.collection },
        { href: "/design", label: l.designYourAbaya, soon: true },
        { href: "/size-guide", label: l.sizeGuide },
        { href: "/fabrics", label: l.fabricLibrary },
      ],
    },
    {
      title: dict.footer.help,
      links: [
        { href: "/shipping", label: l.shipping },
        { href: "/returns", label: l.returns },
        { href: "/faq", label: l.faq },
        { href: "/contact", label: l.contact },
      ],
    },
    {
      title: dict.footer.house,
      links: [
        { href: "/terms", label: l.terms },
        { href: "/privacy", label: l.privacy },
      ],
    },
  ];

  return (
    <footer className="overflow-hidden bg-linen text-foreground">
      <div className="mx-auto grid max-w-[90rem] grid-cols-2 gap-x-6 gap-y-12 px-4 pt-20 sm:grid-cols-3 md:px-10 md:pt-24 xl:px-18">
        {/* No visible headings in this design; each column is still a named nav. */}
        {columns.map((col, i) => (
          <nav key={col.title} aria-label={col.title}>
            <ul className="flex flex-col gap-3.5 text-base text-foreground/80">
              {col.links.map((link) => (
                <li key={link.href}>
                  {"soon" in link && link.soon ? (
                    <ComingSoon label={link.label} soon={dict.common.comingSoon} />
                  ) : (
                    <Link href={link.href} className="transition-colors hover:text-foreground">
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
              {i === columns.length - 1 && (
                <li>
                  <LanguageToggle className="-ms-2 text-base text-foreground/80 hover:bg-foreground/5 hover:text-foreground" />
                </li>
              )}
              {i === 0 && (
                <li className="pt-2">
                  <CountrySwitcher country={country} className="flex-wrap text-sm" />
                </li>
              )}
            </ul>
          </nav>
        ))}
      </div>

      {/* The sign-off. Latin in both locales: it is the wordmark, not copy.
          The negative bottom margin crops it at the page edge on purpose. */}
      <Link
        href="/"
        aria-label={dict.common.home}
        dir="ltr"
        lang="en"
        className="mt-16 -mb-[0.14em] block text-center font-heading text-[19.5vw] leading-[0.75] font-light tracking-[0.02em] whitespace-nowrap text-champagne/60 select-none md:mt-20"
      >
        DAR RIDA
      </Link>
    </footer>
  );
}
