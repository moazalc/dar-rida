import type { Order } from "@/cms/payload-types";
import type { BagLine } from "@/lib/cart";
import { describeConfig } from "@/lib/configurator/describe";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export type OrderLine = NonNullable<Order["lines"]>[number];

/**
 * Freeze a priced bag line for the order: English names and choices for the
 * workshop, the Arabic name and raw choices so emails can speak the customer's
 * language, and the price as charged.
 */
export function snapshotLine(line: BagLine, en: Dictionary): OrderLine {
  if (line.unitPrice === null) throw new Error("Cannot order an unavailable line");
  return {
    kind: line.kind,
    name: line.code ? `${line.code} · ${line.nameEn}` : line.nameEn,
    nameAr: line.nameAr ? `${line.code} · ${line.nameAr}` : null,
    quantity: line.quantity,
    unitPrice: line.unitPrice,
    design: line.designId,
    choices: line.kind === "custom" ? describeConfig(line.config, en) : [],
    config: line.config,
    measurements: line.measurements,
    notes: line.notes || null,
  };
}
