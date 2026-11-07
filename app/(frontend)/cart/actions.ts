"use server";

import { revalidatePath } from "next/cache";
import { setLineQuantity } from "@/lib/shopify/cart";

const LINE_ID = /^gid:\/\/shopify\/CartLine\/\S{1,300}$/;

/** Change a line's quantity from the bag page; 0 removes it. Inputs come from a form. */
export async function updateLine(formData: FormData) {
  const lineId = formData.get("lineId");
  const quantity = Number(formData.get("quantity"));
  if (typeof lineId !== "string" || !LINE_ID.test(lineId)) return;
  if (!Number.isInteger(quantity) || quantity < 0 || quantity > 20) return;

  try {
    await setLineQuantity(lineId, quantity);
  } catch (error) {
    console.error("Updating cart line failed", error);
  }
  revalidatePath("/", "layout");
}
