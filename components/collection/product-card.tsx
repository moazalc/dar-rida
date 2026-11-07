import Image from "next/image";
import Link from "next/link";
import { DesignTile } from "@/components/collection/design-tile";
import type { ShopDesign } from "@/lib/designs";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { formatUsd } from "@/lib/money";

const SIZES = "(min-width: 1024px) 30vw, (min-width: 768px) 45vw, 50vw";

/** One design in the collection grid: photo (second photo on hover) or drawing, name, price. */
export function ProductCard({ design, dict, locale }: { design: ShopDesign; dict: Dictionary; locale: Locale }) {
  const t = dict.collection;
  const [first, second] = design.images;

  return (
    <Link href={`/collection/${design.slug}`} className="group flex flex-col gap-4">
      <div className="relative aspect-[4/5] overflow-hidden bg-muted">
        {first ? (
          <>
            <Image
              src={first.url}
              alt={first.alt}
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
          <DesignTile
            drawing={design.drawing}
            label={design.name}
            id={`card-leaves-${design.id}`}
            className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-[1.02]"
          />
        )}
        <span className="absolute start-3 bottom-3 bg-background/95 px-2.5 py-1.5 text-[0.65rem] tracking-[0.2em] uppercase md:start-4 md:bottom-4">
          {t.madeToOrder}
        </span>
      </div>
      <div className="flex flex-col gap-1">
        <p dir="ltr" className="self-start text-xs tracking-[0.2em] text-muted-foreground uppercase rtl:self-end">
          {design.code}
        </p>
        <h2 className="font-heading text-2xl leading-tight md:text-3xl">{design.name}</h2>
        <p className="text-muted-foreground">
          <bdi>{formatUsd(design.price, locale)}</bdi>
        </p>
      </div>
    </Link>
  );
}
