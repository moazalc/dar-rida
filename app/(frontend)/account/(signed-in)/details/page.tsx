import type { Metadata } from "next";
import { MobileSignOut } from "@/components/account/account-nav";
import { DetailsForm } from "@/components/account/details-form";
import { requireCustomer } from "@/lib/customers";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/locale";

export async function generateMetadata(): Promise<Metadata> {
  const t = (await getDictionary(await getLocale())).account.details;
  return { title: `${t.title} — Dar Rida`, robots: { index: false } };
}

export default async function DetailsPage() {
  const customer = await requireCustomer("/account/details");
  const t = (await getDictionary(await getLocale())).account.details;

  return (
    <section className="flex flex-col gap-10">
      <h1 className="font-heading text-5xl leading-tight font-light md:text-6xl">{t.title}</h1>
      <DetailsForm email={customer.email} name={customer.name ?? ""} phone={customer.phone ?? ""} />
      <MobileSignOut />
    </section>
  );
}
