"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Search, ShoppingBag, X } from "lucide-react";
import { Logo } from "@/components/logo";
import { LanguageToggle } from "@/components/language-toggle";
import { useI18n } from "@/components/providers/i18n-provider";
import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

/** Pages whose first section is a full-bleed hero the header floats over. */
const OVERLAY_PATHS = new Set(["/"]);

function subscribe(onChange: () => void) {
  window.addEventListener("scroll", onChange, { passive: true });
  window.addEventListener("resize", onChange);
  return () => {
    window.removeEventListener("scroll", onChange);
    window.removeEventListener("resize", onChange);
  };
}

/** True once the page's [data-hero] section has scrolled out from under the header. */
function pastHeroSnapshot() {
  const hero = document.querySelector("[data-hero]");
  const header = document.querySelector("header");
  if (!hero || !header) return window.scrollY > 0;
  return hero.getBoundingClientRect().bottom <= header.offsetHeight;
}

function usePastHero() {
  return useSyncExternalStore(subscribe, pastHeroSnapshot, () => false);
}

export function SiteHeader() {
  const { dict, dir } = useI18n();
  const overlay = OVERLAY_PATHS.has(usePathname());
  const pastHero = usePastHero();
  const solid = !overlay || pastHero;

  const links = [
    { href: "/collection", label: dict.nav.collection },
    { href: "/design", label: dict.nav.designYourAbaya },
    { href: "/size-guide", label: dict.nav.sizeGuide },
  ];

  const iconButton = cn(
    "inline-flex size-11 items-center justify-center transition-opacity hover:opacity-70",
  );

  return (
    <header
      className={cn(
        "inset-x-0 top-0 z-40 transition-colors duration-300",
        overlay ? "fixed" : "sticky",
        solid
          ? "border-b border-border/60 bg-background/95 text-foreground backdrop-blur"
          : "border-b border-transparent bg-transparent text-primary-foreground",
      )}
    >
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-4 focus:bg-background focus:px-3 focus:py-2 focus:text-foreground"
      >
        {dict.common.skipToContent}
      </a>

      <div className="mx-auto grid h-16 max-w-7xl grid-cols-[1fr_auto_1fr] items-center px-4 md:h-20 md:px-10">
        {/* Start: desktop links / mobile menu */}
        <div className="flex items-center">
          <nav className="hidden items-center gap-9 text-base tracking-wide lg:flex">
            {links.map((l) => (
              <Link key={l.href} href={l.href} className="transition-opacity hover:opacity-70">
                {l.label}
              </Link>
            ))}
          </nav>

          <Sheet>
            <SheetTrigger className={cn(iconButton, "-ms-2 lg:hidden")}>
              <Menu className="size-6" strokeWidth={1.5} />
              <span className="sr-only">{dict.common.menu}</span>
            </SheetTrigger>
            <SheetContent
              side={dir === "rtl" ? "right" : "left"}
              showCloseButton={false}
              className="gap-0 bg-background p-6"
            >
              <div className="flex items-center justify-between">
                <SheetTitle className="text-sm tracking-[0.3em] text-muted-foreground uppercase">
                  {dict.common.menu}
                </SheetTitle>
                <SheetClose className={cn(iconButton, "-me-2")}>
                  <X className="size-6" strokeWidth={1.5} />
                  <span className="sr-only">{dict.common.close}</span>
                </SheetClose>
              </div>
              <nav className="mt-10 flex flex-col gap-7 font-heading text-4xl">
                {links.map((l) => (
                  <SheetClose key={l.href} render={<Link href={l.href} />} nativeButton={false}>
                    {l.label}
                  </SheetClose>
                ))}
              </nav>
              <div className="mt-auto border-t pt-4">
                <LanguageToggle />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <Logo label={dict.common.home} />

        {/* End: utilities */}
        <div className="flex items-center justify-end gap-1">
          <LanguageToggle
            className={cn(
              "hidden h-11 px-3 text-base lg:inline-flex",
              !solid && "text-primary-foreground hover:bg-white/10 hover:text-primary-foreground",
            )}
          />
          <Link href="/search" className={iconButton}>
            <Search className="size-6" strokeWidth={1.5} />
            <span className="sr-only">{dict.nav.search}</span>
          </Link>
          <Link href="/cart" className={cn(iconButton, "-me-2")}>
            <ShoppingBag className="size-6" strokeWidth={1.5} />
            <span className="sr-only">{dict.nav.cart}</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
