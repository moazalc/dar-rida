import "server-only";

// Minimal Shopify Storefront API client. Server-only: the access token never
// reaches the browser. Configure through the env vars listed in .env.example.

const domain = process.env.SHOPIFY_STORE_DOMAIN;
const token = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
const apiVersion = process.env.SHOPIFY_API_VERSION ?? "2026-10";

export function isShopifyConfigured(): boolean {
  return !!domain && !!token;
}

export class ShopifyError extends Error {}

export async function storefront<T>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
  if (!domain || !token) throw new ShopifyError("Shopify is not configured");

  const res = await fetch(`https://${domain}/api/${apiVersion}/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": token,
    },
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
  });

  if (!res.ok) throw new ShopifyError(`Storefront API responded ${res.status}`);

  const json = (await res.json()) as { data?: T; errors?: { message: string }[] };
  if (json.errors?.length) throw new ShopifyError(json.errors.map((e) => e.message).join("; "));
  if (!json.data) throw new ShopifyError("Storefront API returned no data");
  return json.data;
}
