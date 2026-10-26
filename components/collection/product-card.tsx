import Image from "next/image";
import Link from "next/link";
import { Placeholder } from "@/components/placeholder";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/config";
import { formatMoney } from "@/lib/shopify/money";
import type { ProductCard as Card } from "@/lib/shopify/products";

const SIZES = "(min-width: 1024px) 30vw, (min-width: 768px) 45vw, 50vw";

/** One design in the collection grid: photo (second photo on hover), name, price. */
export function ProductCard({ product, dict, locale }: { product: Card; dict: Dictionary; locale: Locale }) {
  const t = dict.collection;
  const [first, second] = product.images;

  return (
    <Link href={`/collection/${product.handle}`} className="group flex flex-col gap-4">
      <div className="relative aspect-[4/5] overflow-hidden bg-muted">
        {first ? (
          <>
            <Image
              src={first.url}
              alt={first.altText ?? product.title}
              fill
              sizes={SIZES}
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
            />
            {second && (
              <Image
                src={second.url}
                alt=""
                fill
                sizes={SIZES}
                className="object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              />
            )}
          </>
        ) : (
          <Placeholder label={dict.placeholder} className="absolute inset-0" />
        )}
        <span className="absolute start-3 bottom-3 bg-background/95 px-2.5 py-1.5 text-[0.65rem] tracking-[0.2em] uppercase md:start-4 md:bottom-4">
          {product.availableForSale ? t.madeToOrder : t.soldOut}
        </span>
      </div>
      <div className="flex flex-col gap-1">
        <h2 className="font-heading text-2xl leading-tight md:text-3xl">{product.title}</h2>
        <p className="text-muted-foreground">
          <bdi>{formatMoney(product.price, locale)}</bdi>
        </p>
      </div>
    </Link>
  );
}
