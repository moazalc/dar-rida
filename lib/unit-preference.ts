import "server-only";

import { cookies } from "next/headers";
import { DEFAULT_UNIT, isUnit, UNIT_COOKIE, type Unit } from "@/lib/measurements";

/** The visitor's measuring unit, from the cookie the unit switch sets. Inches until they choose. */
export async function getUnitPreference(): Promise<Unit> {
  const value = (await cookies()).get(UNIT_COOKIE)?.value;
  return isUnit(value) ? value : DEFAULT_UNIT;
}
