"use client";

import { useEffect } from "react";

/** Opens the print dialog once the fonts have loaded, and offers a button to open it again. */
export function AutoPrint({ label }: { label: string }) {
  useEffect(() => {
    let cancelled = false;
    document.fonts.ready.then(() => {
      if (!cancelled) window.print();
    });
    return () => {
      cancelled = true;
    };
  }, []);
  return (
    <button type="button" className="sheet-print-button" onClick={() => window.print()}>
      {label}
    </button>
  );
}
