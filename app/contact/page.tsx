import type { Metadata } from "next";
import { ContactForm } from "@/components/contact-form";
import { PageIntro, pageFrame } from "@/components/page-intro";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/locale";
import { contact } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const t = (await getDictionary(await getLocale())).info.contact;
  return { title: t.metaTitle, description: t.intro };
}

export default async function ContactPage() {
  const t = (await getDictionary(await getLocale())).info.contact;

  // Only channels the house has filled in (lib/site.ts) are shown.
  const channels = [
    contact.whatsapp && {
      label: t.channels.whatsapp,
      value: `+${contact.whatsapp}`,
      href: `https://wa.me/${contact.whatsapp}`,
    },
    contact.email && { label: t.channels.email, value: contact.email, href: `mailto:${contact.email}` },
    contact.instagram && {
      label: t.channels.instagram,
      value: `@${contact.instagram}`,
      href: `https://instagram.com/${contact.instagram}`,
    },
  ].filter((c): c is { label: string; value: string; href: string } => !!c);

  return (
    <div className={pageFrame}>
      <PageIntro eyebrow={t.eyebrow} title={t.title} intro={t.intro} />

      <div className="mt-16 grid gap-16 border-t border-border/60 pt-14 md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] md:gap-20">
        <div>
          {channels.length > 0 ? (
            <dl className="flex flex-col gap-8">
              {channels.map((c) => (
                <div key={c.label}>
                  <dt className="text-xs tracking-[0.2em] text-muted-foreground uppercase">{c.label}</dt>
                  <dd className="mt-2">
                    <a href={c.href} className="font-heading text-2xl hover:opacity-70 md:text-3xl" dir="ltr">
                      {c.value}
                    </a>
                  </dd>
                </div>
              ))}
              <div>
                <dt className="text-xs tracking-[0.2em] text-muted-foreground uppercase">{t.channels.hours}</dt>
                <dd className="mt-2 text-lg">{t.hours}</dd>
              </div>
            </dl>
          ) : (
            <p className="max-w-sm text-lg leading-relaxed text-muted-foreground">{t.soon}</p>
          )}
        </div>
        <ContactForm />
      </div>
    </div>
  );
}
