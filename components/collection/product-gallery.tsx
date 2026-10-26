"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Placeholder } from "@/components/placeholder";
import { useI18n } from "@/components/providers/i18n-provider";
import type { ShopImage } from "@/lib/shopify/products";

/**
 * Phones: a swipeable strip, one photo per screen, with a counter.
 * Desktop: every photo stacked down the page beside the sticky details.
 */
export function ProductGallery({ images, title }: { images: ShopImage[]; title: string }) {
  const { dict, locale } = useI18n();
  const t = dict.product;
  const strip = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(0);

  if (images.length === 0) {
    return <Placeholder label={dict.placeholder} className="aspect-[4/5] w-full" />;
  }

  const onScroll = () => {
    const el = strip.current;
    if (!el) return;
    setCurrent(Math.round(Math.abs(el.scrollLeft) / el.clientWidth));
  };

  return (
    <>
      <div className="relative md:hidden">
        <div
          ref={strip}
          onScroll={onScroll}
          className="flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {images.map((img, i) => (
            <div key={img.url} className="relative aspect-[4/5] w-full shrink-0 snap-center bg-muted">
              <Image
                src={img.url}
                alt={img.altText ?? title}
                fill
                sizes="100vw"
                priority={i === 0}
                className="object-cover"
              />
            </div>
          ))}
        </div>
        {images.length > 1 && (
          <p
            aria-live="polite"
            className="absolute end-3 bottom-3 bg-background/90 px-2.5 py-1 text-xs tracking-[0.12em]"
          >
            <span className="sr-only">
              {t.image
                .replace("{current}", (current + 1).toLocaleString(locale))
                .replace("{total}", images.length.toLocaleString(locale))}
            </span>
            <span aria-hidden dir="ltr">
              {(current + 1).toLocaleString(locale)} / {images.length.toLocaleString(locale)}
            </span>
          </p>
        )}
      </div>

      <div className="hidden grid-cols-2 gap-3 md:grid">
        {images.map((img, i) => (
          <div
            key={img.url}
            className={i === 0 ? "relative col-span-2 aspect-[4/5] bg-muted" : "relative aspect-[4/5] bg-muted"}
          >
            <Image
              src={img.url}
              alt={img.altText ?? title}
              fill
              sizes={i === 0 ? "55vw" : "28vw"}
              priority={i === 0}
              className="object-cover"
            />
          </div>
        ))}
      </div>
    </>
  );
}
