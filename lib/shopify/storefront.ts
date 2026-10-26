import "server-only";

// Minimal Shopify Storefront API client. Server-only: the access token never
// reaches the browser. Configure through the env vars listed in .env.example.

const domain = process.env.SHOPIFY_STORE_DOMAIN;
const token = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
const apiVersion = process.env.SHOPIFY_API_VERSION ?? "2026-10";

/** Shopify's public demo storefront: set SHOPIFY_STORE_DOMAIN=mock.shop to try the shop without a store. */
const isMockShop = domain === "mock.shop";
const endpoint = isMockShop ? "https://mock.shop/api" : `https://${domain}/api/${apiVersion}/graphql.json`;

export function isShopifyConfigured(): boolean {
  return isMockShop || (!!domain && !!token);
}

export class ShopifyError extends Error {}

/** Tag on every cached catalogue read; revalidate it to refresh products at once. */
export const PRODUCTS_TAG = "shopify-products";

export async function storefront<T>(
  query: string,
  variables: Record<string, unknown> = {},
  /** Cache catalogue reads for this many seconds. Omit for carts and other writes. */
  { revalidate }: { revalidate?: number } = {},
): Promise<T> {
  if (!isShopifyConfigured()) throw new ShopifyError("Shopify is not configured");

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token && !isMockShop ? { "X-Shopify-Storefront-Access-Token": token } : {}),
    },
    body: JSON.stringify({ query, variables }),
    ...(revalidate ? { next: { revalidate, tags: [PRODUCTS_TAG] } } : { cache: "no-store" as const }),
  });

  if (!res.ok) throw new ShopifyError(`Storefront API responded ${res.status}`);

  const json = (await res.json()) as { data?: T; errors?: { message: string }[] };
  if (json.errors?.length) throw new ShopifyError(json.errors.map((e) => e.message).join("; "));
  if (!json.data) throw new ShopifyError("Storefront API returned no data");
  return json.data;
}
