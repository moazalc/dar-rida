import "server-only";

import type { Locale } from "@/lib/i18n/config";
import { isShopifyConfigured, storefront } from "./storefront";

// Catalogue reads for the collection and product pages. Cached for a few
// minutes (see PRODUCTS_TAG to refresh at once). Product text comes back in
// the shopper's language when the store has translations (Shopify
// Translate & Adapt); otherwise Shopify falls back to the default language.

const REVALIDATE = 300;

/** Which collection the Collection page lists; without one, every product is listed. */
const collectionHandle = process.env.SHOPIFY_COLLECTION_HANDLE;
/** Prices in this market's currency (ISO country, e.g. AE). Optional. */
const country = process.env.SHOPIFY_COUNTRY;

/** Products with this tag (the configurator's "Custom Abaya") never appear in the collection. */
const HIDDEN_TAG = "configurator";

export type Money = { amount: string; currencyCode: string };
export type ShopImage = { url: string; altText: string | null; width: number; height: number };

export type ProductCard = {
  handle: string;
  title: string;
  price: Money;
  images: ShopImage[];
  availableForSale: boolean;
};

export type Variant = {
  id: string;
  title: string;
  availableForSale: boolean;
  price: Money;
  selectedOptions: { name: string; value: string }[];
};

export type Product = ProductCard & {
  description: string;
  descriptionHtml: string;
  options: { name: string; values: string[] }[];
  variants: Variant[];
  /** Configurator options this design starts from, e.g. "cut=classic&sleeve=cape". */
  designPreset: string | null;
  /** Lead-time line, e.g. "Ships in 3 weeks". */
  leadTime: string | null;
  seo: { title: string | null; description: string | null };
};

const IMAGE = "url altText width height";
const MONEY = "amount currencyCode";

const CARD_FIELDS = `
  handle title availableForSale tags
  priceRange { minVariantPrice { ${MONEY} } }
  images(first: 2) { nodes { ${IMAGE} } }
`;

type CardNode = {
  handle: string;
  title: string;
  availableForSale: boolean;
  tags: string[];
  priceRange: { minVariantPrice: Money };
  images: { nodes: ShopImage[] };
};

function toCard(node: CardNode): ProductCard {
  return {
    handle: node.handle,
    title: node.title,
    availableForSale: node.availableForSale,
    price: node.priceRange.minVariantPrice,
    images: node.images.nodes,
  };
}

/** The `@inContext` directive: language from the site locale, optional market. */
function context(locale: Locale) {
  const args = [`language: ${locale.toUpperCase()}`, country && `country: ${country.toUpperCase()}`];
  return `@inContext(${args.filter(Boolean).join(", ")})`;
}

export async function getCollectionProducts(locale: Locale): Promise<ProductCard[] | null> {
  if (!isShopifyConfigured()) return null;

  if (collectionHandle) {
    const data = await storefront<{ collection: { products: { nodes: CardNode[] } } | null }>(
      `query CollectionProducts($handle: String!) ${context(locale)} {
        collection(handle: $handle) {
          products(first: 100, sortKey: COLLECTION_DEFAULT) { nodes { ${CARD_FIELDS} } }
        }
      }`,
      { handle: collectionHandle },
      { revalidate: REVALIDATE },
    );
    return (data.collection?.products.nodes ?? []).filter((p) => !p.tags.includes(HIDDEN_TAG)).map(toCard);
  }

  const data = await storefront<{ products: { nodes: CardNode[] } }>(
    `query AllProducts ${context(locale)} {
      products(first: 100, sortKey: CREATED_AT, reverse: true) { nodes { ${CARD_FIELDS} } }
    }`,
    {},
    { revalidate: REVALIDATE },
  );
  return data.products.nodes.filter((p) => !p.tags.includes(HIDDEN_TAG)).map(toCard);
}

/** Products whose title, description or tags match the shopper's words. */
export async function searchProducts(q: string, locale: Locale): Promise<ProductCard[] | null> {
  if (!isShopifyConfigured()) return null;
  const data = await storefront<{ products: { nodes: CardNode[] } }>(
    `query Search($q: String!) ${context(locale)} {
      products(first: 48, query: $q, sortKey: RELEVANCE) { nodes { ${CARD_FIELDS} } }
    }`,
    { q: q.slice(0, 100) },
    { revalidate: REVALIDATE },
  );
  return data.products.nodes.filter((p) => !p.tags.includes(HIDDEN_TAG)).map(toCard);
}

type ProductNode = CardNode & {
  description: string;
  descriptionHtml: string;
  options: { name: string; optionValues: { name: string }[] }[];
  variants: { nodes: Variant[] };
  allImages: { nodes: ShopImage[] };
  designPreset: { value: string } | null;
  leadTime: { value: string } | null;
  seo: { title: string | null; description: string | null };
};

export async function getProduct(handle: string, locale: Locale): Promise<Product | null> {
  if (!isShopifyConfigured()) return null;

  const data = await storefront<{ product: ProductNode | null }>(
    `query Product($handle: String!) ${context(locale)} {
      product(handle: $handle) {
        ${CARD_FIELDS}
        description descriptionHtml
        seo { title description }
        options { name optionValues { name } }
        variants(first: 100) {
          nodes { id title availableForSale price { ${MONEY} } selectedOptions { name value } }
        }
        allImages: images(first: 12) { nodes { ${IMAGE} } }
        designPreset: metafield(namespace: "custom", key: "design_preset") { value }
        leadTime: metafield(namespace: "custom", key: "lead_time") { value }
      }
    }`,
    { handle },
    { revalidate: REVALIDATE },
  );

  const p = data.product;
  if (!p || p.tags.includes(HIDDEN_TAG)) return null;
  return {
    ...toCard(p),
    images: p.allImages.nodes,
    description: p.description,
    descriptionHtml: p.descriptionHtml,
    options: p.options.map((o) => ({ name: o.name, values: o.optionValues.map((v) => v.name) })),
    variants: p.variants.nodes,
    designPreset: p.designPreset?.value ?? null,
    leadTime: p.leadTime?.value ?? null,
    seo: p.seo,
  };
}
