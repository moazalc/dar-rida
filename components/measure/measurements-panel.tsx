"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { MeasureFigures } from "@/components/measure/figure";
import { Tape } from "@/components/measure/tape";
import { UnitSwitch } from "@/components/measure/unit-switch";
import { useI18n } from "@/components/providers/i18n-provider";
import { useUnit } from "@/components/providers/unit-provider";
import { Sheet, SheetClose, SheetContent, SheetTitle } from "@/components/ui/sheet";
import {
  convertToGrid,
  formatMeasurement,
  isComplete,
  measurementGrid,
  measurementKeys,
  otherUnit,
  suggestedLength,
  type Measurement,
  type Measurements,
  type MeasurementsDraft,
  type Unit,
} from "@/lib/measurements";
import { cn } from "@/lib/utils";

const ctaClass =
  "inline-flex h-12 items-center justify-center bg-primary px-7 text-sm tracking-[0.16em] text-primary-foreground uppercase transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-45";
const linkClass = "text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground";

/**
 * "Your measurements" on the product page: a compact card that opens a guided
 * panel, one measurement per step with the figure lighting up where to measure,
 * then a review. The card then lists the six values. Values are kept exactly as
 * picked, in the unit picked (see lib/measurements for why nothing drifts).
 */
export function MeasurementsPanel({ value, onChange }: { value: Measurements | null; onChange: (m: Measurements) => void }) {
  const { dict, locale, dir } = useI18n();
  const t = dict.measure;
  const { unit: preferred, setUnit } = useUnit();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<MeasurementsDraft>(() => value ?? { unit: preferred });
  const [step, setStep] = useState(0);
  const [mode, setMode] = useState<"steps" | "review" | "all">("steps");
  const [pendingUnit, setPendingUnit] = useState<Unit | null>(null);

  const unit = draft.unit;
  const entered = measurementKeys.filter((m) => draft[m] !== undefined);
  const fmt = (m: Measurement, v: number, u: Unit = unit) => formatMeasurement(m, v, u, locale, t.units);
  const labels = Object.fromEntries(entered.map((m) => [m, fmt(m, draft[m]!)]));

  function requestUnit(next: Unit) {
    if (next === unit) return setPendingUnit(null);
    if (entered.length === 0) {
      setDraft({ unit: next });
      setUnit(next);
      return;
    }
    setPendingUnit(next);
  }

  function convert() {
    if (!pendingUnit) return;
    const next: MeasurementsDraft = { unit: pendingUnit };
    for (const m of entered) next[m] = convertToGrid(m, draft[m]!, unit, pendingUnit);
    setDraft(next);
    setUnit(pendingUnit);
    setPendingUnit(null);
    // Converted values are rounded once, here, so the customer checks them before saving.
    if (isComplete(next)) {
      setMode("review");
      setOpen(true);
    }
  }

  function openPanel() {
    setMode(isComplete(draft) ? "review" : "steps");
    setOpen(true);
  }

  function save() {
    if (!isComplete(draft)) return;
    onChange({ ...draft });
    setOpen(false);
  }

  const notice = pendingUnit && (
    <div className="flex flex-col gap-3 border border-gold p-4 text-sm" role="status">
      <p>
        {t.convert.replace("{unit}", t.unitNames[pendingUnit].toLocaleLowerCase(locale)).replace("{step}", t.convertSteps[pendingUnit])}
      </p>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={convert} className="h-9 bg-primary px-4 text-xs tracking-[0.12em] text-primary-foreground uppercase">
          {t.convertConfirm}
        </button>
        <button type="button" onClick={() => setPendingUnit(null)} className="h-9 border border-foreground/60 px-4 text-xs tracking-[0.12em] uppercase">
          {t.convertKeep.replace("{unit}", t.unitNames[unit])}
        </button>
      </div>
    </div>
  );

  return (
    <>
      <section aria-labelledby="measurements-title" className="flex flex-col gap-4 border border-border/70 p-5 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="measurements-title" className="font-heading text-3xl">
            {t.title}
          </h2>
          <div className="flex items-center gap-4">
            <UnitSwitch value={pendingUnit ?? unit} onChange={requestUnit} />
            {value && (
              <button type="button" onClick={openPanel} className={linkClass}>
                {t.edit}
              </button>
            )}
          </div>
        </div>
        {value ? (
          <dl className="grid grid-cols-2 gap-x-5 gap-y-3 sm:grid-cols-3">
            {measurementKeys.map((m) => (
              <div key={m} className="flex min-w-0 flex-col">
                <dt className="text-[0.6875rem] tracking-[0.14em] text-muted-foreground uppercase">{t.fields[m].label}</dt>
                <dd className="tabular-nums">
                  <bdi>{fmt(m, value[m], value.unit)}</bdi>
                </dd>
              </div>
            ))}
          </dl>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">{t.intro}</p>
            <button
              type="button"
              onClick={openPanel}
              className="h-12 self-start border border-foreground px-6 text-xs tracking-[0.16em] uppercase transition-colors hover:bg-foreground hover:text-background"
            >
              {entered.length ? t.edit : t.add}
            </button>
          </>
        )}
        {!open && notice}
        <Link href="/size-guide" className={cn(linkClass, "self-start")}>
          {t.howToMeasure}
        </Link>
      </section>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side={dir === "rtl" ? "left" : "right"}
          showCloseButton={false}
          className="gap-0 bg-background p-0 data-[side=left]:w-full data-[side=right]:w-full data-[side=left]:sm:max-w-[45rem] data-[side=right]:sm:max-w-[45rem]"
        >
          <div className="flex items-center justify-between gap-3 border-b border-border/60 px-4 py-3 sm:px-7">
            <SheetTitle className="text-xs font-normal tracking-[0.22em] text-muted-foreground uppercase">{t.title}</SheetTitle>
            <div className="flex items-center gap-3">
              <UnitSwitch value={pendingUnit ?? unit} onChange={requestUnit} />
              <SheetClose className="inline-flex size-10 items-center justify-center text-2xl leading-none hover:opacity-70">
                <span aria-hidden>×</span>
                <span className="sr-only">{t.close}</span>
              </SheetClose>
            </div>
          </div>

          <div className="flex flex-1 flex-col gap-7 overflow-y-auto px-4 pt-6 pb-8 sm:px-7">
            <div>
              {notice ? (
                notice
              ) : mode === "review" ? (
                <Review draft={draft} fmt={fmt} onEdit={(i) => (setStep(i), setMode("steps"))} onSave={save} />
              ) : mode === "all" ? (
                <AllAtOnce draft={draft} setDraft={setDraft} fmt={fmt} onSave={save} onGuided={() => (setStep(0), setMode("steps"))} />
              ) : (
                <Step
                  step={step}
                  draft={draft}
                  fmt={fmt}
                  onPick={(m, v) => setDraft((d) => ({ ...d, [m]: v }))}
                  onBack={() => setStep((s) => Math.max(0, s - 1))}
                  onNext={() => (step < measurementKeys.length - 1 ? setStep(step + 1) : setMode("review"))}
                  onAll={() => setMode("all")}
                />
              )}
            </div>
            <MeasureFigures
              active={mode === "steps" && !notice ? measurementKeys[step] : null}
              labels={labels}
              views={t.views}
              label={t.figureLabel}
              className="border-t border-border/60 pt-6"
              figureClassName="h-[min(440px,62vw)] w-auto max-w-[46%] max-sm:h-[min(360px,80vw)]"
            />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

type Fmt = (m: Measurement, v: number, u?: Unit) => string;

function Step({
  step,
  draft,
  fmt,
  onPick,
  onBack,
  onNext,
  onAll,
}: {
  step: number;
  draft: MeasurementsDraft;
  fmt: Fmt;
  onPick: (m: Measurement, v: number) => void;
  onBack: () => void;
  onNext: () => void;
  onAll: () => void;
}) {
  const t = useI18n().dict.measure;
  const m = measurementKeys[step];
  const value = draft[m];
  const last = step === measurementKeys.length - 1;
  let suggestion: string | null = null;
  if (m === "length" && draft.height !== undefined) {
    const [a, b] = suggestedLength(draft.height, draft.unit);
    suggestion = t.suggest.replace("{range}", a === b ? fmt("length", a) : `${fmt("length", a)} – ${fmt("length", b)}`);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-1" aria-hidden>
        {measurementKeys.map((k, i) => (
          <span key={k} className={cn("h-0.5 flex-1 transition-colors duration-300", i <= step ? "bg-foreground" : "bg-border/70")} />
        ))}
      </div>
      <p className="text-xs tracking-[0.22em] text-muted-foreground uppercase">
        {t.stepOf.replace("{current}", String(step + 1)).replace("{total}", String(measurementKeys.length))}
      </p>
      <div>
        <h3 className="font-heading text-4xl leading-tight">{t.fields[m].label}</h3>
        <p className="mt-1 text-muted-foreground">{t.fields[m].hint}</p>
      </div>
      {suggestion && <p className="bg-muted px-3 py-2 text-sm">{suggestion}</p>}
      <Tape
        values={measurementGrid[draft.unit][m]}
        value={value}
        format={(v) => fmt(m, v)}
        onChange={(v) => onPick(m, v)}
        label={t.fields[m].label}
      />
      <div className="flex items-center justify-between gap-3">
        <button type="button" onClick={onBack} className={cn(linkClass, step === 0 && "invisible")}>
          {t.back}
        </button>
        <button type="button" onClick={onNext} disabled={value === undefined} className={ctaClass}>
          {last ? t.review : t.next}
        </button>
      </div>
      <button type="button" onClick={onAll} className={cn(linkClass, "self-start")}>
        {t.allAtOnce}
      </button>
    </div>
  );
}

function Review({
  draft,
  fmt,
  onEdit,
  onSave,
}: {
  draft: MeasurementsDraft;
  fmt: Fmt;
  onEdit: (step: number) => void;
  onSave: () => void;
}) {
  const { dict, locale } = useI18n();
  const t = dict.measure;
  return (
    <div className="flex flex-col gap-5">
      <h3 className="font-heading text-4xl leading-tight">{t.reviewTitle}</h3>
      <dl className="grid gap-x-8 sm:grid-cols-2">
        {measurementKeys.map((m, i) => (
          <div key={m} className="flex items-baseline justify-between gap-3 border-b border-border/60 py-2.5">
            <dt className="text-muted-foreground">{t.fields[m].label}</dt>
            <dd className="flex items-baseline gap-3 text-end tabular-nums">
              {draft[m] !== undefined && (
                <span className="flex flex-col">
                  <bdi>{fmt(m, draft[m]!)}</bdi>
                  <bdi className="text-[0.6875rem] text-muted-foreground">{otherUnit(m, draft[m]!, draft.unit, locale, t.units)}</bdi>
                </span>
              )}
              <button type="button" onClick={() => onEdit(i)} className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground">
                {t.edit}
              </button>
            </dd>
          </div>
        ))}
      </dl>
      <button type="button" onClick={onSave} disabled={!isComplete(draft)} className={cn(ctaClass, "w-full")}>
        {t.save}
      </button>
    </div>
  );
}

function AllAtOnce({
  draft,
  setDraft,
  fmt,
  onSave,
  onGuided,
}: {
  draft: MeasurementsDraft;
  setDraft: (d: MeasurementsDraft) => void;
  fmt: Fmt;
  onSave: () => void;
  onGuided: () => void;
}) {
  const t = useI18n().dict.measure;
  const id = useId();
  return (
    <div className="flex flex-col gap-5">
      <h3 className="font-heading text-4xl leading-tight">{t.allAtOnceTitle}</h3>
      <div className="grid gap-x-4 gap-y-5 sm:grid-cols-2">
        {measurementKeys.map((m) => (
          <div key={m} className="flex flex-col gap-1.5">
            <label htmlFor={`${id}-${m}`} className="text-sm">
              {t.fields[m].label}
            </label>
            <select
              id={`${id}-${m}`}
              value={draft[m] ?? ""}
              onChange={(e) => setDraft({ ...draft, [m]: e.target.value === "" ? undefined : Number(e.target.value) })}
              className="h-12 w-full border border-border/70 bg-background px-3 text-base"
            >
              <option value="" disabled>
                {t.choose}
              </option>
              {measurementGrid[draft.unit][m].map((v) => (
                <option key={v} value={v}>
                  {fmt(m, v)}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
      <button type="button" onClick={onSave} disabled={!isComplete(draft)} className={cn(ctaClass, "w-full")}>
        {t.save}
      </button>
      <button type="button" onClick={onGuided} className={cn(linkClass, "self-start")}>
        {t.guided}
      </button>
    </div>
  );
}
