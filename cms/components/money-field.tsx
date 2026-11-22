"use client";

import type { StaticLabel } from "payload";
import { TextInput, useField, useFormFields } from "@payloadcms/ui";
import { formatOrderMoney } from "@/cms/fields";

type Props = { path: string; field?: { label?: StaticLabel | false }; currencyPath?: string };

/**
 * An amount stored in minor units (40000), shown as money ("$400.00") in the
 * order's currency. Display only: the stored number is never changed here.
 */
export function MoneyField({ path, field, currencyPath = "currency" }: Props) {
  const { value } = useField<number>({ path });
  const currency = useFormFields(([fields]) => fields[currencyPath]?.value as string | undefined);
  return (
    <TextInput
      path={path}
      label={field?.label || undefined}
      value={formatOrderMoney(value, currency) || "—"}
      readOnly
      onChange={() => {}}
    />
  );
}
