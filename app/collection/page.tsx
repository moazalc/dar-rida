import type { Metadata } from "next";
import Link from "next/link";
import { ProductCard } from "@/components/collection/product-card";
import { statusAction } from "@/components/status-page";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/locale";
import { getCollectionProducts } from "@/lib/shopify/products";

export async function generateMetadata(): Promise<Metadata> {
  const t = (await getDictionary(await getLocale())).collection;
  return { title: t.metaTitle, description: t.metaDescription };
}

export default async function CollectionPage() {
  const locale = await getLocale();
  const dict = await getDictionary(locale);
  const t = dict.collection;
  const products = await getCollectionProducts(locale);
  const count = products?.length ?? 0;

  return (
    <div className="mx-auto max-w-[90rem] px-4 pt-14 pb-24 md:px-10 md:pt-20 md:pb-36 xl:px-18">
      <header className="flex flex-col gap-5 border-b border-border/60 pb-10 md:flex-row md:items-end md:justify-between md:pb-14">
        <div className="max-w-3xl">
          <p className="text-sm tracking-[0.3em] text-muted-foreground uppercase">{t.eyebrow}</p>
          <h1 className="mt-5 font-heading text-5xl leading-[1.04] font-light md:text-7xl">{t.title}</h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">{t.intro}</p>
        </div>
        {count > 0 && (
          <p className="text-sm tracking-[0.2em] text-muted-foreground uppercase">
            {count === 1 ? t.countOne : t.count.replace("{count}", count.toLocaleString(locale))}
          </p>
        )}
      </header>

      {count === 0 ? (
        <div className="flex flex-col items-start gap-8 py-20">
          <p className="max-w-xl text-lg text-muted-foreground">{products ? t.empty : t.notConnected}</p>
          <Link href="/design" className={statusAction.primary}>
            {t.designYourOwn}
          </Link>
        </div>
      ) : (
        <ul className="mt-12 grid grid-cols-2 gap-x-4 gap-y-14 md:mt-16 md:gap-x-8 lg:grid-cols-3 lg:gap-y-20">
          {products!.map((product) => (
            <li key={product.handle}>
              <ProductCard product={product} dict={dict} locale={locale} />
            </li>
          ))}
          <li>
            <Link
              href="/design"
              className="group relative flex aspect-[4/5] flex-col justify-end overflow-hidden bg-espresso p-5 text-primary-foreground md:p-8"
            >
              <svg
                aria-hidden
                viewBox="0 0 200 300"
                preserveAspectRatio="xMidYMax meet"
                className="absolute inset-x-0 bottom-0 mx-auto h-4/5 w-auto text-champagne/40 transition-transform duration-700 group-hover:scale-[1.03]"
              >
                <path d="M30 300 V120 A70 70 0 0 1 170 120 V300" fill="none" stroke="currentColor" strokeWidth="0.75" />
              </svg>
              <span className="relative text-xs tracking-[0.3em] text-champagne uppercase">{t.customCard.eyebrow}</span>
              <span className="relative mt-3 font-heading text-3xl leading-tight md:text-5xl">{t.customCard.title}</span>
              <span className="relative mt-3 hidden max-w-xs text-primary-foreground/75 md:block">
                {t.customCard.body}
              </span>
              <span className="relative mt-6 text-sm tracking-[0.16em] uppercase underline-offset-8 group-hover:underline">
                {t.customCard.cta}
              </span>
            </Link>
          </li>
        </ul>
      )}
    </div>
  );
}
