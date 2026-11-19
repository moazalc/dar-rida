"use client";

import { useRowLabel } from "@payloadcms/ui";

/** Saved measurements listed by their name ("Me", "Mama") instead of "Profile 01". */
export function ProfileRowLabel() {
  const { data, rowNumber } = useRowLabel<{ name?: string }>();
  return <span>{data?.name?.trim() || `Profile ${(rowNumber ?? 0) + 1}`}</span>;
}

/** Addresses listed as "Home · Dubai, AE (default)". */
export function AddressRowLabel() {
  const { data, rowNumber } = useRowLabel<{ name?: string; city?: string; country?: string; isDefault?: boolean }>();
  const place = [data?.city, data?.country].filter(Boolean).join(", ");
  const name = data?.name?.trim() || `Address ${(rowNumber ?? 0) + 1}`;
  return (
    <span>
      {place ? `${name} · ${place}` : name}
      {data?.isDefault ? " (default)" : ""}
    </span>
  );
}
