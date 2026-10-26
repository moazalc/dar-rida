"use client";

import { useState, useTransition } from "react";
import { addVariantToBag } from "@/app/collection/actions";
import type { AddToBagResult } from "@/app/design/actions";
import { useI18n } from "@/components/providers/i18n-provider";
import { formatMoney } from "@/lib/shopify/money";
import type { Product, Variant } from "@/lib/shopify/products";
import { cn } from "@/lib/utils";

type Selection = Record<string, string>;

function matches(variant: Variant, selection: Selection) {
  return variant.selectedOptions.every((o) => selection[o.name] === o.value);
}

/** Price, option pickers and "Add to bag" for one collection piece. */
export function ProductForm({ product }: { product: Pick<Product, "options" | "variants" | "price"> }) {
  const { dict, locale } = useI18n();
  const t = dict.product;

  // A product with no real options has a single "Title: Default Title" option; don't show it.
  const options = product.options.filter((o) => !(o.values.length === 1 && o.values[0] === "Default Title"));
  const initial = product.variants.find((v) => v.availableForSale) ?? product.variants[0];
  const [selection, setSelection] = useState<Selection>(() =>
    Object.fromEntries(initial?.selectedOptions.map((o) => [o.name, o.value]) ?? []),
  );
  const [result, setResult] = useState<AddToBagResult | null>(null);
  const [pending, startTransition] = useTransition();

  const variant = product.variants.find((v) => matches(v, selection));
  const canAdd = !!variant?.availableForSale && !pending;

  /** Whether picking `value` for `name`, keeping the other choices, leads to something buyable. */
  const available = (name: string, value: string) =>
    product.variants.some((v) => v.availableForSale && matches(v, { ...selection, [name]: value }));

  return (
    <div className="flex flex-col gap-7">
      <p className="font-heading text-3xl">
        <bdi>{formatMoney(variant?.price ?? product.price, locale)}</bdi>
      </p>

      {options.map((option) => (
        <fieldset key={option.name} className="flex flex-col gap-3">
          <legend className="text-sm">
            {option.name}
            {selection[option.name] && <span className="text-muted-foreground"> — {selection[option.name]}</span>}
          </legend>
          <div className="flex flex-wrap gap-2">
            {option.values.map((value) => {
              const selected = selection[option.name] === value;
              const ok = available(option.name, value);
              return (
                <button
                  key={value}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => {
                    setSelection((s) => ({ ...s, [option.name]: value }));
                    setResult(null);
                  }}
                  className={cn(
                    "h-11 min-w-12 border px-4 text-sm transition-colors",
                    selected ? "border-foreground bg-primary text-primary-foreground" : "border-border/70 hover:border-foreground/60",
                    !ok && !selected && "text-muted-foreground/60 line-through",
                  )}
                >
                  {value}
                </button>
              );
            })}
          </div>
        </fieldset>
      ))}

      <div className="flex flex-col gap-3">
        <button
          type="button"
          disabled={!canAdd}
          onClick={() =>
            variant &&
            startTransition(async () => {
              setResult(await addVariantToBag(variant.id));
            })
          }
          className="inline-flex h-14 items-center justify-center bg-primary px-10 text-sm tracking-[0.16em] text-primary-foreground uppercase transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {pending ? t.adding : !variant ? t.chooseAll : variant.availableForSale ? t.addToBag : t.unavailable}
        </button>

        <div aria-live="polite" className="min-h-5 text-sm">
          {result?.status === "added" && (
            <p>
              {t.added}{" "}
              <a href={result.checkoutUrl} className="underline underline-offset-4">
                {t.checkout}
              </a>
            </p>
          )}
          {result?.status === "not-configured" && <p className="text-muted-foreground">{t.notConnected}</p>}
          {(result?.status === "error" || result?.status === "invalid") && <p className="text-destructive">{t.error}</p>}
        </div>
      </div>
    </div>
  );
}
