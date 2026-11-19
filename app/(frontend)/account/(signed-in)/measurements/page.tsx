import type { Metadata } from "next";
import { ProfilesManager } from "@/components/account/profiles-manager";
import { MAX_PROFILES } from "@/lib/account";
import { requireCustomer, savedProfiles } from "@/lib/customers";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/locale";

export async function generateMetadata(): Promise<Metadata> {
  const t = (await getDictionary(await getLocale())).account.profiles;
  return { title: `${t.title} — Dar Rida`, robots: { index: false } };
}

export default async function MeasurementsPage() {
  await requireCustomer("/account/measurements");
  const t = (await getDictionary(await getLocale())).account.profiles;
  const profiles = (await savedProfiles()) ?? [];

  return (
    <section className="max-w-3xl">
      <h1 className="font-heading text-5xl leading-tight font-light md:text-6xl">{t.title}</h1>
      <p className="mt-3 text-muted-foreground">{t.intro}</p>
      <div className="mt-10">
        <ProfilesManager profiles={profiles} max={MAX_PROFILES} />
      </div>
    </section>
  );
}
