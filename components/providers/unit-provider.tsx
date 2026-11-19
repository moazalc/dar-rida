"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { setUnitPreference } from "@/app/(frontend)/cart/actions";
import type { Unit } from "@/lib/measurements";

type UnitContextValue = { unit: Unit; setUnit: (unit: Unit) => void };

const UnitContext = createContext<UnitContextValue | null>(null);

/**
 * The visitor's measuring unit, shared by the product page and the size guide.
 * Starts from the cookie (read on the server, so no flash) and saves every
 * change back to it. Later this can come from a signed-in customer's profile.
 */
export function UnitProvider({ initial, children }: { initial: Unit; children: React.ReactNode }) {
  const [unit, setState] = useState<Unit>(initial);
  const setUnit = useCallback((next: Unit) => {
    setState(next);
    void setUnitPreference(next).catch(() => undefined);
  }, []);
  const value = useMemo(() => ({ unit, setUnit }), [unit, setUnit]);
  return <UnitContext.Provider value={value}>{children}</UnitContext.Provider>;
}

export function useUnit(): UnitContextValue {
  const ctx = useContext(UnitContext);
  if (!ctx) throw new Error("useUnit must be used within a <UnitProvider>");
  return ctx;
}
