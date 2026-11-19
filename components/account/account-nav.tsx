"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTransition } from "react";
import { signOut } from "@/app/(frontend)/account/actions";
import { useI18n } from "@/components/providers/i18n-provider";
import { cn } from "@/lib/utils";

const links = [
  { href: "/account", key: "orders" },
  { href: "/account/measurements", key: "measurements" },
  { href: "/account/addresses", key: "addresses" },
  { href: "/account/details", key: "details" },
] as const;

/** The account's side menu: a row of tabs on phones, a column on wide screens. */
export function AccountNav({ email }: { email: string }) {
  const { dict } = useI18n();
  const t = dict.account.nav;
  const path = usePathname();
  const [pending, startTransition] = useTransition();
  const active = (href: string) => (href === "/account" ? path === "/account" || path.startsWith("/account/orders") : path.startsWith(href));

  return (
    <nav aria-label={dict.account.metaTitle} className="flex flex-col gap-6">
      <p dir="ltr" className="truncate text-sm text-muted-foreground rtl:text-end">
        {email}
      </p>
      <ul className="-mx-4 flex gap-1 overflow-x-auto px-4 lg:mx-0 lg:flex-col lg:px-0">
        {links.map((l) => (
          <li key={l.href} className="shrink-0">
            <Link
              href={l.href}
              aria-current={active(l.href) ? "page" : undefined}
              className={cn(
                "block border-b-2 border-transparent px-3 py-2 text-sm tracking-[0.12em] uppercase transition-colors hover:text-foreground lg:border-b-0 lg:border-s-2 lg:px-4",
                active(l.href) ? "border-foreground text-foreground" : "text-muted-foreground",
              )}
            >
              {t[l.key]}
            </Link>
          </li>
        ))}
      </ul>
      <div className="hidden flex-col items-start gap-2 border-t border-border/60 pt-5 text-sm lg:flex">
        <SignOutButtons pending={pending} onSignOut={(all) => startTransition(() => signOut(all))} />
      </div>
    </nav>
  );
}

/** Sign out here, or of every device. Shown under the menu, and at the foot of the details page on phones. */
export function SignOutButtons({ pending, onSignOut }: { pending: boolean; onSignOut: (everywhere: boolean) => void }) {
  const t = useI18n().dict.account.nav;
  return (
    <>
      <button type="button" disabled={pending} onClick={() => onSignOut(false)} className="underline underline-offset-4 hover:text-muted-foreground disabled:opacity-50">
        {t.signOut}
      </button>
      <button type="button" disabled={pending} onClick={() => onSignOut(true)} className="text-muted-foreground underline underline-offset-4 hover:text-foreground disabled:opacity-50">
        {t.signOutAll}
      </button>
    </>
  );
}

/** The sign-out buttons on their own, for the details page on phones. */
export function MobileSignOut() {
  const [pending, startTransition] = useTransition();
  return (
    <div className="flex flex-col items-start gap-2 border-t border-border/60 pt-6 text-sm lg:hidden">
      <SignOutButtons pending={pending} onSignOut={(all) => startTransition(() => signOut(all))} />
    </div>
  );
}
