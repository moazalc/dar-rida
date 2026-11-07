"use client";

import Link from "next/link";
import { useId, useState, useTransition } from "react";
import { addDesignToBag, type AddToBagResult } from "@/app/(frontend)/cart/actions";
import { MeasurementsFields } from "@/components/measurements-fields";
import { useI18n } from "@/components/providers/i18n-provider";
import { emptyMeasurements, isMeasurementsComplete, NOTES_MAX, type MeasurementsInput } from "@/lib/measurements";

/** Measurements, notes and Add to bag for one collection design. */
export function DesignForm({ slug }: { slug: string }) {
  const t = useI18n().dict.product;
  const [measurements, setMeasurements] = useState<MeasurementsInput>(emptyMeasurements);
  const [notes, setNotes] = useState("");
  const [result, setResult] = useState<AddToBagResult | null>(null);
  const [pending, startTransition] = useTransition();
  const notesId = useId();
  const complete = isMeasurementsComplete(measurements);

  return (
    <form
      className="flex flex-col gap-7"
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(async () => {
          const r = await addDesignToBag({ slug, measurements, notes });
          setResult(r);
          if (r.status === "added") {
            setMeasurements(emptyMeasurements);
            setNotes("");
          }
        });
      }}
    >
      <fieldset className="flex flex-col gap-5">
        <legend className="font-heading text-3xl">{t.measurementsTitle}</legend>
        <p className="-mt-1 text-sm text-muted-foreground">{t.measurementsIntro}</p>
        <MeasurementsFields value={measurements} onChange={setMeasurements} />
      </fieldset>

      <div className="flex flex-col gap-2">
        <label htmlFor={notesId} className="text-sm">
          {t.notes}
        </label>
        <textarea
          id={notesId}
          rows={3}
          maxLength={NOTES_MAX}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={t.notesPlaceholder}
          className="border border-border/70 bg-background px-3 py-2 text-base placeholder:text-muted-foreground/70"
        />
      </div>

      <div className="flex flex-col gap-3">
        <button
          type="submit"
          disabled={pending || !complete}
          className="inline-flex h-14 items-center justify-center bg-primary px-10 text-sm tracking-[0.16em] text-primary-foreground uppercase transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {pending ? t.adding : t.addToBag}
        </button>
        {!complete && !result && <p className="text-sm text-muted-foreground">{t.incomplete}</p>}
        <div aria-live="polite" className="text-sm">
          {result?.status === "added" && (
            <p>
              {t.added}{" "}
              <Link href="/cart" className="underline underline-offset-4">
                {t.checkout}
              </Link>
            </p>
          )}
          {(result?.status === "error" || result?.status === "invalid") && <p className="text-destructive">{t.error}</p>}
        </div>
      </div>
    </form>
  );
}
