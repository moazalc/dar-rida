import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { PageIntro, pageFrame } from "@/components/page-intro";
import { statusAction } from "@/components/status-page";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/locale";

export async function generateMetadata(): Promise<Metadata> {
  const t = (await getDictionary(await getLocale())).info.faq;
  return { title: t.metaTitle, description: t.intro };
}

export default async function FaqPage() {
  const t = (await getDictionary(await getLocale())).info.faq;

  // FAQ structured data, so answers can appear directly in search results.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: t.items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  return (
    <div className={pageFrame}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <div className="grid gap-12 md:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] md:gap-20">
        <div className="md:sticky md:top-28 md:self-start">
          <PageIntro eyebrow={t.eyebrow} title={t.title} intro={t.intro} />
          <div className="mt-10 hidden md:block">
            <p className="font-heading text-2xl">{t.more}</p>
            <Link href="/contact" className={`${statusAction.secondary} mt-5`}>
              {t.contact}
            </Link>
          </div>
        </div>

        <div className="divide-y divide-border/60 border-y border-border/60">
          {t.items.map((item) => (
            <details key={item.q} className="group py-2">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 [&::-webkit-details-marker]:hidden">
                <span className="font-heading text-2xl leading-snug md:text-3xl">{item.q}</span>
                <Plus
                  className="size-5 shrink-0 text-muted-foreground transition-transform duration-300 group-open:rotate-45"
                  strokeWidth={1.25}
                />
              </summary>
              <p className="max-w-2xl pb-6 text-lg leading-relaxed text-foreground/80">{item.a}</p>
            </details>
          ))}
        </div>

        <div className="md:hidden">
          <p className="font-heading text-2xl">{t.more}</p>
          <Link href="/contact" className={`${statusAction.secondary} mt-5`}>
            {t.contact}
          </Link>
        </div>
      </div>
    </div>
  );
}
