import "server-only";

import type { Design, Media } from "@/cms/payload-types";
import type { Locale } from "@/lib/i18n/config";
import { designPrice } from "@/lib/cart/pricing";
import { getMarket } from "@/lib/country";
import type { Currency, Market } from "@/lib/markets";
import { mediaPath } from "@/lib/media";
import { payloadClient } from "@/lib/payload";

export type ShopDesign = {
  id: number;
  code: string;
  slug: string;
  name: string;
  description: string;
  cut: string | null;
  /** In the visitor's market, in minor units; null when it has no price there yet. */
  price: number | null;
  currency: Currency;
  leadTime: string | null;
  composition: string | null;
  care: string | null;
  origin: string | null;
  /** The owners' "Complete your look" picks, in order. */
  lookIds: number[];
  drawing: Design["drawing"];
  images: { url: string; alt: string; width: number; height: number }[];
};

function toShop(d: Design, market: Market): ShopDesign {
  return {
    id: d.id,
    code: d.code,
    slug: d.slug,
    name: d.name,
    description: d.description,
    cut: d.cut ?? null,
    price: designPrice(d, market),
    currency: market.currency,
    leadTime: d.leadTime ?? null,
    composition: d.composition?.trim() || null,
    care: d.care?.trim() || null,
    origin: d.origin?.trim() || null,
    lookIds: (d.completeTheLook ?? []).map((l) => (typeof l === "object" ? l.id : l)),
    drawing: d.drawing,
    images: (d.images ?? [])
      .filter((m): m is Media => typeof m === "object" && m !== null && Boolean(m.url))
      .map((m) => ({ url: mediaPath(m.url!), alt: m.alt ?? d.name, width: m.width ?? 1200, height: m.height ?? 1500 })),
  };
}

const shop = (market: Market) => (d: Design) => toShop(d, market);

const active = { active: { equals: true } } as const;

/** The designs on sale, in the owners' order. */
export async function listDesigns(locale: Locale): Promise<ShopDesign[]> {
  const payload = await payloadClient();
  const { docs } = await payload.find({ collection: "designs", where: active, sort: "sortOrder", locale, depth: 1, limit: 100 });
  return docs.map(shop(await getMarket()));
}

export async function getDesign(slug: string, locale: Locale): Promise<ShopDesign | null> {
  if (!/^[a-z0-9-]{1,80}$/.test(slug)) return null;
  const payload = await payloadClient();
  const { docs } = await payload.find({
    collection: "designs",
    where: { and: [active, { slug: { equals: slug } }] },
    locale,
    depth: 1,
    limit: 1,
  });
  return docs[0] ? toShop(docs[0], await getMarket()) : null;
}

/**
 * Up to four pieces to show under a design: the owners' picks that are still on
 * sale, or else other pieces from the collection.
 */
export async function getLook(design: ShopDesign, locale: Locale): Promise<ShopDesign[]> {
  const payload = await payloadClient();
  const others = { id: { not_equals: design.id } };
  if (design.lookIds.length) {
    const { docs } = await payload.find({
      collection: "designs",
      where: { and: [active, others, { id: { in: design.lookIds } }] },
      locale,
      depth: 1,
      limit: 4,
    });
    const order = new Map(design.lookIds.map((id, i) => [id, i]));
    if (docs.length) return docs.sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0)).map(shop(await getMarket()));
  }
  const { docs } = await payload.find({ collection: "designs", where: { and: [active, others] }, sort: "sortOrder", locale, depth: 1, limit: 4 });
  return docs.map(shop(await getMarket()));
}

/** Active designs whose code, name, description or cut match, in either language. */
export async function searchDesigns(query: string, locale: Locale): Promise<ShopDesign[]> {
  const q = query.trim().slice(0, 100);
  if (!q) return [];
  const payload = await payloadClient();
  const fields = ["code", "slug", "name", "description", "cut"] as const;
  const matches = await Promise.all(
    (["en", "ar"] as const).map((l) =>
      payload.find({
        collection: "designs",
        where: { and: [active, { or: fields.map((f) => ({ [f]: { like: q } })) }] },
        locale: l,
        depth: 0,
        limit: 100,
      }),
    ),
  );
  const ids = [...new Set(matches.flatMap((m) => m.docs.map((d) => d.id)))];
  if (!ids.length) return [];
  const { docs } = await payload.find({ collection: "designs", where: { id: { in: ids } }, sort: "sortOrder", locale, depth: 1, limit: 100 });
  return docs.map(shop(await getMarket()));
}
