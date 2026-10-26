import type { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";
import { ProductCard } from "@/components/collection/product-card";
import { pageFrame } from "@/components/page-intro";
import { statusAction } from "@/components/status-page";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/locale";
import { searchProducts } from "@/lib/shopify/products";

export async function generateMetadata(): Promise<Metadata> {
  const t = (await getDictionary(await getLocale())).search;
  return { title: t.metaTitle, robots: { index: false } };
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const raw = (await searchParams).q;
  const q = (Array.isArray(raw) ? raw[0] : raw)?.trim() ?? "";
  const locale = await getLocale();
  const dict = await getDictionary(locale);
  const t = dict.search;
  const results = q ? await searchProducts(q, locale).catch(() => []) : undefined;
  const count = results?.length ?? 0;

  return (
    <div className={pageFrame}>
      <h1 className="font-heading text-5xl font-light md:text-7xl">{t.title}</h1>

      {/* A plain GET form: works without JavaScript and keeps results linkable. */}
      <form action="/search" role="search" className="mt-8 flex max-w-2xl items-center border-b border-foreground/60">
        <label htmlFor="q" className="sr-only">
          {t.label}
        </label>
        <input
          id="q"
          name="q"
          type="search"
          defaultValue={q}
          placeholder={t.placeholder}
          autoFocus={!q}
          className="min-w-0 flex-1 bg-transparent py-4 text-xl outline-none placeholder:text-muted-foreground/70 md:text-2xl"
        />
        <button type="submit" className="inline-flex size-12 items-center justify-center hover:opacity-70">
          <Search className="size-6" strokeWidth={1.5} />
          <span className="sr-only">{t.submit}</span>
        </button>
      </form>

      {q && results === null && <p className="mt-10 text-muted-foreground">{t.notConnected}</p>}

      {q && results && (
        <>
          <p className="mt-10 text-sm tracking-[0.2em] text-muted-foreground uppercase">
            {count === 0
              ? t.none.replace("{q}", q)
              : (count === 1 ? t.resultsOne : t.results.replace("{count}", count.toLocaleString(locale))).replace(
                  "{q}",
                  q,
                )}
          </p>
          {count === 0 ? (
            <div className="mt-6 flex flex-col items-start gap-6">
              <p className="text-lg text-muted-foreground">{t.noneBody}</p>
              <Link href="/collection" className={statusAction.primary}>
                {t.browse}
              </Link>
            </div>
          ) : (
            <ul className="mt-10 grid grid-cols-2 gap-x-4 gap-y-14 md:gap-x-8 lg:grid-cols-3">
              {results.map((product) => (
                <li key={product.handle}>
                  <ProductCard product={product} dict={dict} locale={locale} />
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
