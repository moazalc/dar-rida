"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { setUnitPreference } from "@/app/(frontend)/cart/actions";
import type { Unit } from "@/lib/measurements";

type UnitContextValue = {
  unit: Unit;
  setUnit: (unit: Unit) => void;
  /** Centimetres only (Libya): the unit switch is hidden and the unit stays cm. */
  locked: boolean;
};

const UnitContext = createContext<UnitContextValue | null>(null);

/**
 * The visitor's measuring unit, shared by the product page and the size guide.
 * Starts from the cookie (read on the server, so no flash) and saves every
 * change back to it. When `locked` (a centimetre-only country), it stays cm.
 * The layout remounts it (key) when the shipping country changes.
 */
export function UnitProvider({ initial, locked = false, children }: { initial: Unit; locked?: boolean; children: React.ReactNode }) {
  const [unit, setState] = useState<Unit>(locked ? "cm" : initial);
  const setUnit = useCallback(
    (next: Unit) => {
      if (locked) return;
      setState(next);
      void setUnitPreference(next).catch(() => undefined);
    },
    [locked],
  );
  const value = useMemo(() => ({ unit, setUnit, locked }), [unit, setUnit, locked]);
  return <UnitContext.Provider value={value}>{children}</UnitContext.Provider>;
}

export function useUnit(): UnitContextValue {
  const ctx = useContext(UnitContext);
  if (!ctx) throw new Error("useUnit must be used within a <UnitProvider>");
  return ctx;
}
