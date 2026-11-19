"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { addLine, setLineQuantity } from "@/lib/cart";
import { isValidQuantity, MAX_QUANTITY } from "@/lib/cart/pricing";
import { startCheckout } from "@/lib/checkout";
import { getLocale } from "@/lib/i18n/locale";
import { COUNTRY_COOKIE, isCountry } from "@/lib/markets";
import { cleanNotes, isUnit, parseMeasurements, UNIT_COOKIE, type Unit } from "@/lib/measurements";
import { payloadClient } from "@/lib/payload";

// Server Actions are public endpoints: every input is checked again here,
// whatever the form allowed. Prices are never taken from the browser.

export type AddToBagResult = { status: "added" } | { status: "invalid" } | { status: "error" };

/** Add a collection design, made to the given measurements. */
export async function addDesignToBag(input: { slug: unknown; measurements: unknown; notes: unknown }): Promise<AddToBagResult> {
  const measurements = parseMeasurements(input?.measurements);
  if (typeof input?.slug !== "string" || !/^[a-z0-9-]{1,80}$/.test(input.slug) || !measurements) {
    return { status: "invalid" };
  }
  try {
    const payload = await payloadClient();
    const { docs } = await payload.find({
      collection: "designs",
      where: { and: [{ slug: { equals: input.slug } }, { active: { equals: true } }] },
      limit: 1,
      depth: 0,
    });
    if (!docs[0]) return { status: "invalid" };
    await addLine({ kind: "design", design: docs[0].id, measurements, notes: cleanNotes(input.notes), quantity: 1 });
  } catch (error) {
    console.error("Adding a design to the bag failed", error);
    return { status: "error" };
  }
  revalidatePath("/", "layout");
  return { status: "added" };
}

/** Change a line's quantity from the bag page; 0 removes it. Inputs come from a form. */
export async function updateLine(formData: FormData) {
  const lineId = formData.get("lineId");
  const quantity = Number(formData.get("quantity"));
  if (typeof lineId !== "string" || !/^[a-f0-9]{24}$/.test(lineId)) return;
  if (!(quantity === 0 || isValidQuantity(quantity)) || quantity > MAX_QUANTITY) return;
  try {
    await setLineQuantity(lineId, quantity);
  } catch (error) {
    console.error("Updating a bag line failed", error);
  }
  revalidatePath("/", "layout");
}

/** Start Stripe Checkout for the whole bag and send the customer there. */
export async function checkout(): Promise<{ status: "error" | "not-ready" }> {
  const result = await startCheckout(await getLocale());
  if (result.status === "redirect") redirect(result.url);
  return { status: result.status };
}

/** Remember the visitor's measuring unit (inches or centimetres) for a year. */
export async function setUnitPreference(unit: Unit) {
  if (!isUnit(unit)) return;
  (await cookies()).set(UNIT_COOKIE, unit, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
}

/** Save the country we ship to. It sets the market, so the page re-renders with its prices. */
export async function setShippingCountry(country: string) {
  if (!isCountry(country)) return;
  (await cookies()).set(COUNTRY_COOKIE, country, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
}
