import type { Metadata } from "next";
import { AddressesManager } from "@/components/account/addresses-manager";
import { getCountry } from "@/lib/country";
import { addressList, requireCustomer } from "@/lib/customers";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/locale";

export async function generateMetadata(): Promise<Metadata> {
  const t = (await getDictionary(await getLocale())).account.addresses;
  return { title: `${t.title} — Dar Rida`, robots: { index: false } };
}

export default async function AddressesPage() {
  const customer = await requireCustomer("/account/addresses");
  const t = (await getDictionary(await getLocale())).account.addresses;

  return (
    <section className="max-w-4xl">
      <h1 className="font-heading text-5xl leading-tight font-light md:text-6xl">{t.title}</h1>
      <p className="mt-3 text-muted-foreground">{t.intro}</p>
      <div className="mt-10">
        <AddressesManager addresses={addressList(customer)} defaultCountry={await getCountry()} />
      </div>
    </section>
  );
}
