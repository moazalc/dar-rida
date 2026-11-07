"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { addLine, setLineQuantity } from "@/lib/cart";
import { isValidQuantity, MAX_QUANTITY } from "@/lib/cart/pricing";
import { startCheckout } from "@/lib/checkout";
import { parseConfig } from "@/lib/configurator/options";
import { getLocale } from "@/lib/i18n/locale";
import { cleanNotes, parseMeasurements } from "@/lib/measurements";
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

/** Add an abaya from the builder. */
export async function addCustomAbayaToBag(input: { config: unknown; measurements: unknown; notes: unknown }): Promise<AddToBagResult> {
  const config = parseConfig(input?.config);
  const measurements = parseMeasurements(input?.measurements);
  if (!config || !measurements) return { status: "invalid" };
  try {
    await addLine({ kind: "custom", config, measurements, notes: cleanNotes(input.notes), quantity: 1 });
  } catch (error) {
    console.error("Adding a custom abaya to the bag failed", error);
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
