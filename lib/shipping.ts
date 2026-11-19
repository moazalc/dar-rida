import { toMinor, type Country } from "@/lib/markets";

/** The Shipping settings as the admin stores them: amounts in whole AED or USD. */
export type ShippingSettings = {
  uae?: { fee?: number | null; freeOver?: number | null } | null;
  zones?: { name: string; countries?: string[] | null; fee?: number | null; freeOver?: number | null }[] | null;
  restOfWorld?: { fee?: number | null; freeOver?: number | null } | null;
};

export type ShippingQuote = {
  /** Minor units of the market's currency; 0 when free. */
  fee: number;
  /** For the order and the workshop: "UAE", the zone's name, or "Rest of world". */
  zone: string;
  free: boolean;
};

function quote(zone: string, rule: { fee?: number | null; freeOver?: number | null } | null | undefined, subtotal: number): ShippingQuote {
  const fee = toMinor(rule?.fee) ?? 0;
  const freeOver = toMinor(rule?.freeOver);
  const free = fee === 0 || (freeOver !== null && subtotal >= freeOver);
  return { fee: free ? 0 : fee, zone, free };
}

/**
 * Shipping to a country for a bag subtotal (minor units). The UAE has one flat
 * fee in AED; elsewhere the first zone that lists the country applies, or the
 * rest-of-world fee, in USD.
 */
export function shippingFor(country: Country, subtotal: number, settings: ShippingSettings): ShippingQuote {
  if (country === "AE") return quote("UAE", settings.uae, subtotal);
  const zone = settings.zones?.find((z) => z.countries?.includes(country));
  return zone ? quote(zone.name, zone, subtotal) : quote("Rest of world", settings.restOfWorld, subtotal);
}
