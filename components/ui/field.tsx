"use client";

import { useId, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export type FieldControlProps = {
  id: string;
  "aria-describedby"?: string;
  "aria-invalid"?: true;
};

/**
 * A label, an optional hint and an optional error around one control. The
 * control is a render function so any input gets the ids and ARIA wiring.
 */
export function Field({
  label,
  hint,
  error,
  id: givenId,
  className,
  children,
}: {
  label: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  id?: string;
  className?: string;
  children: (control: FieldControlProps) => ReactNode;
}) {
  const autoId = useId();
  const id = givenId ?? autoId;
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="text-small font-medium">
        {label}
      </label>
      {hint ? (
        <p id={hintId} className="text-small text-muted-foreground">
          {hint}
        </p>
      ) : null}
      {children({ id, "aria-describedby": describedBy, ...(error ? { "aria-invalid": true as const } : {}) })}
      {error ? (
        <p id={errorId} role="alert" className="text-small text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
