import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SignInForm } from "@/components/account/sign-in-form";
import { safeNext } from "@/lib/account";
import { googleEnabled } from "@/lib/auth";
import { getSessionUser } from "@/lib/customers";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { localePath } from "@/lib/i18n/config";
import { getLocale } from "@/lib/i18n/locale";

export async function generateMetadata(): Promise<Metadata> {
  const t = (await getDictionary(await getLocale())).account.signIn;
  return { title: t.metaTitle, robots: { index: false } };
}

export default async function SignInPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const next = safeNext(params.next);
  if (await getSessionUser()) redirect(localePath(await getLocale(), next));
  const t = (await getDictionary(await getLocale())).account.signIn;

  return (
    <div className="mx-auto max-w-md px-4 pt-16 pb-24 md:pt-24 md:pb-36">
      <h1 className="font-heading text-5xl leading-tight font-light md:text-6xl">{t.title}</h1>
      <p className="mt-4 text-muted-foreground">{t.intro}</p>
      <div className="mt-10">
        <SignInForm next={next} google={googleEnabled()} initialError={params.error === "google" ? "google" : undefined} />
      </div>
      <p className="mt-10 border-t border-border/60 pt-6 text-sm text-muted-foreground">{t.guestNote}</p>
    </div>
  );
}
