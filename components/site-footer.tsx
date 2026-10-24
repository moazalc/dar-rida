import Link from "next/link";
import { LanguageToggle } from "@/components/language-toggle";
import { NewsletterForm } from "@/components/newsletter-form";
import type { Dictionary } from "@/lib/i18n/dictionaries";

/**
 * Link columns and the sign-up up top; underneath, DAR RIDA set edge to edge
 * in light Cormorant and cut off by the bottom of the page.
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
    <footer className="overflow-hidden border-t border-border bg-background">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-x-6 gap-y-12 px-4 pt-16 sm:grid-cols-3 md:px-10 md:pt-20 lg:grid-cols-[1fr_1fr_1fr_1.6fr]">
        {columns.map((col) => (
          <div key={col.title} className="flex flex-col gap-4">
            <h2 className="text-sm tracking-[0.3em] text-muted-foreground uppercase">{col.title}</h2>
            <ul className="flex flex-col gap-3 text-base">
              {col.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="transition-opacity hover:opacity-60">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
        <div className="col-span-2 sm:col-span-3 lg:col-span-1">
          <NewsletterForm />
        </div>
      </div>

      <div className="mx-auto mt-14 flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 text-sm text-muted-foreground md:mt-20 md:px-10">
        <p>
          © {new Date().getFullYear()} {dict.common.brandName}. {dict.footer.rights}
        </p>
        <LanguageToggle className="-me-2" />
      </div>

      {/* The sign-off. Latin in both locales: it is the wordmark, not copy.
          The negative bottom margin crops it at the page edge on purpose. */}
      <Link
        href="/"
        aria-label={dict.common.home}
        dir="ltr"
        lang="en"
        className="mt-6 -mb-[0.14em] block text-center font-heading text-[19.5vw] leading-[0.75] font-light tracking-[0.02em] whitespace-nowrap select-none"
      >
        DAR RIDA
      </Link>
    </footer>
  );
}
