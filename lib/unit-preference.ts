import "server-only";

import { cookies } from "next/headers";
import { getCountry } from "@/lib/country";
import { DEFAULT_UNIT, isMetricOnly, isUnit, UNIT_COOKIE, type Unit } from "@/lib/measurements";

/**
 * The visitor's measuring unit, from the cookie the unit switch sets (inches
 * until they choose), and whether it is locked to centimetres because they
 * ship to a country that only uses cm (Libya).
 */
export async function getUnitPreference(): Promise<{ unit: Unit; locked: boolean }> {
  if (isMetricOnly(await getCountry())) return { unit: "cm", locked: true };
  const value = (await cookies()).get(UNIT_COOKIE)?.value;
  return { unit: isUnit(value) ? value : DEFAULT_UNIT, locked: false };
}
