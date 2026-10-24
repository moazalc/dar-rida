import Link from "next/link";
import { LanguageToggle } from "@/components/language-toggle";
import { NewsletterForm } from "@/components/newsletter-form";
import type { Dictionary } from "@/lib/i18n/dictionaries";

/**
 * Espresso ground: the sign-up and three quiet link columns up top; underneath,
 * DAR RIDA set edge to edge in light Cormorant and cut off by the page bottom.
 */
export function SiteFooter({ dict }: { dict: Dictionary }) {
  const l = dict.footer.links;
  const columns = [
    {
      title: dict.footer.shop,
      links: [
        { href: "/collection", label: l.collection },
        { href: "/design", label: l.designYourAbaya },
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
        { href: "/our-story", label: l.story },
        { href: "/terms", label: l.terms },
        { href: "/privacy", label: l.privacy },
      ],
    },
  ];

  return (
    <footer className="overflow-hidden bg-espresso text-primary-foreground">
      <div className="mx-auto grid max-w-[90rem] grid-cols-2 gap-x-6 gap-y-12 px-4 pt-20 sm:grid-cols-3 md:px-10 md:pt-24 lg:grid-cols-[2fr_1fr_1fr_1fr] xl:px-18">
        <div className="col-span-2 sm:col-span-3 lg:col-span-1 lg:max-w-md">
          <NewsletterForm />
        </div>
        {/* No visible headings in this design; each column is still a named nav. */}
        {columns.map((col, i) => (
          <nav key={col.title} aria-label={col.title}>
            <ul className="flex flex-col gap-3.5 text-base text-primary-foreground/80">
              {col.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="transition-colors hover:text-primary-foreground">
                    {link.label}
                  </Link>
                </li>
              ))}
              {i === columns.length - 1 && (
                <li>
                  <LanguageToggle className="-ms-2 text-base text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-primary-foreground" />
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
        className="mt-16 -mb-[0.14em] block text-center font-heading text-[19.5vw] leading-[0.75] font-light tracking-[0.02em] whitespace-nowrap select-none md:mt-20"
      >
        DAR RIDA
      </Link>
    </footer>
  );
}
