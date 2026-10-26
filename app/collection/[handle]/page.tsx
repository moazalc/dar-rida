import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ProductForm } from "@/components/collection/product-form";
import { ProductGallery } from "@/components/collection/product-gallery";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/locale";
import { getProduct } from "@/lib/shopify/products";

type Props = { params: Promise<{ handle: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProduct((await params).handle, await getLocale());
  if (!product) return {};
  const image = product.images[0];
  return {
    title: `${product.seo.title ?? product.title} — Dar Rida`,
    description: product.seo.description ?? product.description.slice(0, 160),
    openGraph: image ? { images: [{ url: image.url, width: image.width, height: image.height }] } : undefined,
  };
}

export default async function ProductPage({ params }: Props) {
  const { handle } = await params;
  const locale = await getLocale();
  const [dict, product] = await Promise.all([getDictionary(locale), getProduct(handle, locale)]);
  if (!product) notFound();
  const t = dict.product;

  // Product structured data, so search results can show the price and photo.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description,
    image: product.images.map((i) => i.url),
    offers: {
      "@type": "Offer",
      price: product.price.amount,
      priceCurrency: product.price.currencyCode,
      availability: product.availableForSale ? "https://schema.org/PreOrder" : "https://schema.org/OutOfStock",
    },
  };

  return (
    <div className="mx-auto max-w-[90rem] pb-24 md:px-10 md:pt-8 md:pb-36 xl:px-18">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />

      <Link
        href="/collection"
        className="hidden items-center gap-2 py-4 text-sm tracking-[0.16em] text-muted-foreground uppercase hover:text-foreground md:inline-flex"
      >
        <ArrowLeft className="size-4 rtl:rotate-180" strokeWidth={1.5} />
        {t.backToCollection}
      </Link>

      <div className="grid gap-10 md:mt-4 md:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] md:gap-14 lg:gap-20">
        <ProductGallery images={product.images} title={product.title} />

        <div className="px-4 md:px-0">
          <div className="flex flex-col gap-8 md:sticky md:top-28">
            <div>
              <p className="text-sm tracking-[0.3em] text-muted-foreground uppercase">{t.madeToOrder}</p>
              <h1 className="mt-4 font-heading text-5xl leading-[1.02] font-light md:text-6xl xl:text-7xl">
                {product.title}
              </h1>
              <p className="mt-4 text-sm text-muted-foreground">{product.leadTime ?? t.leadTimeFallback}</p>
            </div>

            <ProductForm product={product} />

            <Link href="/size-guide" className="self-start text-sm underline underline-offset-4 hover:text-muted-foreground">
              {t.sizeGuide}
            </Link>

            <Link
              href={product.designPreset ? `/design?${product.designPreset}` : "/design"}
              className="group flex flex-col gap-2 border border-border/70 p-5 transition-colors hover:border-foreground/60"
            >
              <span className="font-heading text-2xl">{t.makeItYours}</span>
              <span className="text-sm text-muted-foreground">{t.makeItYoursBody}</span>
            </Link>

            {product.descriptionHtml && (
              <section className="border-t border-border/60 pt-8">
                <h2 className="text-xs tracking-[0.2em] text-muted-foreground uppercase">{t.details}</h2>
                {/* Written by the house in Shopify admin. */}
                <div
                  className="mt-4 leading-relaxed text-foreground/85 [&_li]:ms-5 [&_li]:list-disc [&_p]:mb-4 [&_strong]:font-medium [&_ul]:mb-4"
                  dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
                />
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
