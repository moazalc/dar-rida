import Link from "next/link";
import { Logo } from "@/components/logo";
import { LanguageToggle } from "@/components/language-toggle";
import type { Dictionary } from "@/lib/i18n/dictionaries";

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
      title: dict.footer.about,
      links: [
        { href: "/our-story", label: l.story },
        { href: "/terms", label: l.terms },
        { href: "/privacy", label: l.privacy },
      ],
    },
  ];

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 md:grid-cols-[1.5fr_1fr_1fr_1fr] md:px-10">
        <div className="flex flex-col items-start gap-5">
          <Logo label={dict.common.home} className="items-start" />
          <p className="max-w-xs text-base leading-relaxed text-primary-foreground/75">
            {dict.footer.tagline}
          </p>
        </div>
        {columns.map((col) => (
          <div key={col.title} className="flex flex-col gap-4">
            <h2 className="text-sm tracking-[0.3em] text-champagne uppercase">{col.title}</h2>
            <ul className="flex flex-col gap-3 text-base">
              {col.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-primary-foreground/80 transition-colors hover:text-primary-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-primary-foreground/15">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-6 text-sm text-primary-foreground/60 md:px-10">
          <p>
            © {new Date().getFullYear()} {dict.common.brandName}. {dict.footer.rights}
          </p>
          <LanguageToggle className="text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-primary-foreground" />
        </div>
      </div>
    </footer>
  );
}
