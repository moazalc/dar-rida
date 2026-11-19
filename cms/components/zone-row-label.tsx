"use client";

import { useRowLabel } from "@payloadcms/ui";

/** Shipping zones listed by name and fee ("Europe · $45") instead of "Zone 01". */
export function ZoneRowLabel() {
  const { data, rowNumber } = useRowLabel<{ name?: string; fee?: number }>();
  const name = data?.name?.trim() || `Zone ${(rowNumber ?? 0) + 1}`;
  return <span>{typeof data?.fee === "number" ? `${name} · $${data.fee}` : name}</span>;
}
