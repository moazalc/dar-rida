import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { DesignForm } from "@/components/collection/design-form";
import { DesignTile } from "@/components/collection/design-tile";
import { ProductGallery } from "@/components/collection/product-gallery";
import { getDesign } from "@/lib/designs";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/locale";
import { formatUsd } from "@/lib/money";
import { payloadClient } from "@/lib/payload";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = await getLocale();
  const design = await getDesign((await params).slug, locale);
  if (!design) return {};
  const image = design.images[0];
  return {
    title: `${design.code} · ${design.name} — Dar Rida`,
    description: design.description.slice(0, 160),
    openGraph: image ? { images: [{ url: image.url, width: image.width, height: image.height }] } : undefined,
  };
}

export default async function DesignPage({ params }: Props) {
  const { slug } = await params;
  const locale = await getLocale();
  const [dict, design] = await Promise.all([getDictionary(locale), getDesign(slug, locale)]);
  if (!design) notFound();
  const t = dict.product;
  const leadTime =
    design.leadTime ?? (await (await payloadClient()).findGlobal({ slug: "store-settings", locale })).defaultLeadTime;

  // Product structured data, so search results can show the price and photo.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${design.code} ${design.name}`,
    description: design.description,
    image: design.images.map((i) => i.url),
    offers: {
      "@type": "Offer",
      price: (design.price / 100).toFixed(2),
      priceCurrency: "USD",
      availability: "https://schema.org/PreOrder",
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
        <div className="md:sticky md:top-28 md:self-start">
          <ProductGallery
            images={design.images}
            title={design.name}
            fallback={<DesignTile drawing={design.drawing} label={design.name} id="design-leaves" className="aspect-[4/5] w-full" />}
          />
        </div>

        <div className="flex flex-col gap-10 px-4 md:px-0">
          <div>
            <p className="text-sm tracking-[0.3em] text-muted-foreground uppercase">{t.madeToOrder}</p>
            <p dir="ltr" className="mt-5 font-heading text-xl text-foreground/60 italic rtl:text-end">
              {design.code}
            </p>
            <h1 className="mt-1 font-heading text-5xl leading-[1.02] font-light md:text-6xl xl:text-7xl">{design.name}</h1>
            <p className="mt-5 font-heading text-3xl">
              <bdi>{formatUsd(design.price)}</bdi>
            </p>
            <p className="mt-3 text-sm text-muted-foreground">{leadTime || t.leadTimeFallback}</p>
          </div>

          <section>
            <h2 className="text-xs tracking-[0.2em] text-muted-foreground uppercase">{t.details}</h2>
            <p className="mt-4 text-lg leading-relaxed text-foreground/85">{design.description}</p>
            {design.cut && (
              <p className="mt-5 border-t border-champagne pt-3 text-xs tracking-[0.18em] text-foreground/70 uppercase">
                {design.cut}
              </p>
            )}
          </section>

          <DesignForm slug={design.slug} />

          <Link
            href="/design"
            className="group flex flex-col gap-2 border border-border/70 p-5 transition-colors hover:border-foreground/60"
          >
            <span className="font-heading text-2xl">{t.makeItYours}</span>
            <span className="text-sm text-muted-foreground">{t.makeItYoursBody}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
