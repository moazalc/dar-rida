"use client";

import { useCallback, useEffect, useId, useRef, useState, useTransition } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, ChevronRight, Download, RotateCcw } from "lucide-react";
import { addCustomAbayaToBag, type AddToBagResult } from "@/app/design/actions";
import type { CaptureFn } from "@/components/design/abaya-scene";
import { composeDesignImage, downloadBlob } from "@/components/design/design-image";
import { useI18n } from "@/components/providers/i18n-provider";
import {
  colourHex,
  emptySizing,
  isChoiceStep,
  isSizingComplete,
  measurements,
  NOTES_MAX,
  options,
  sizingFields,
  standardSizes,
  steps,
  type ChoiceStep,
  type Config,
  type Measurement,
  type Sizing,
  type SizingMode,
  type Step,
} from "@/lib/configurator/options";
import { cn } from "@/lib/utils";

// WebGL only exists in the browser, and three.js is heavy: load the scene
// client-side, in its own chunk, only on this page.
const AbayaScene = dynamic(() => import("./abaya-scene"), {
  ssr: false,
  loading: () => <SceneMessage kind="loading" />,
});

function SceneMessage({ kind }: { kind: "loading" | "prototype" }) {
  const t = useI18n().dict.design.preview;
  return (
    <div className="flex h-full items-center justify-center p-6 text-center text-sm tracking-wide text-muted-foreground">
      {kind === "loading" ? t.loading : t.prototype}
    </div>
  );
}

type OptionCopy = { name: string; body: string };

export function Configurator({ initialConfig }: { initialConfig: Config }) {
  const { dict, locale, dir } = useI18n();
  const t = dict.design;
  const num = (n: number) => n.toLocaleString(locale);

  const [config, setConfig] = useState<Config>(initialConfig);
  const [sizing, setSizing] = useState<Sizing>(emptySizing);
  const [stepIndex, setStepIndex] = useState(0);
  const [resetKey, setResetKey] = useState(0);
  const step = steps[stepIndex];

  // Keep the design in the URL, so it survives a refresh and can be shared.
  useEffect(() => {
    const params = new URLSearchParams(config);
    window.history.replaceState(null, "", `?${params}${window.location.hash}`);
  }, [config]);

  const goTo = (s: Step) => setStepIndex(steps.indexOf(s));
  const choose = <S extends ChoiceStep>(s: S, value: Config[S]) => setConfig((c) => ({ ...c, [s]: value }));
  const optionCopy = (s: ChoiceStep, value: string) =>
    (t.options[s] as Record<string, OptionCopy>)[value];

  // "Save image": snapshot the 3D view and add a caption strip with her choices.
  const capture = useRef<CaptureFn | null>(null);
  const [canCapture, setCanCapture] = useState(false);
  const onCaptureReady = useCallback((fn: CaptureFn) => {
    capture.current = fn;
    setCanCapture(true);
  }, []);
  const [saving, setSaving] = useState(false);
  const saveImage = async () => {
    if (!capture.current) return;
    setSaving(true);
    try {
      const blob = await composeDesignImage({
        shot: capture.current(),
        brand: dict.common.brandName,
        caption: t.preview.imageCaption,
        summary: steps
          .filter(isChoiceStep)
          .map((s) => optionCopy(s, config[s]).name)
          .join(" · "),
        dir,
      });
      downloadBlob(blob, t.preview.imageFile);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="grid grid-cols-[minmax(0,1fr)] lg:h-[calc(100svh-5rem)] lg:grid-cols-[minmax(0,1fr)_30rem]">
      {/* Preview — pinned under the header on phones while the options scroll */}
      <div className="sticky top-16 z-10 h-[46svh] border-b border-border/60 bg-muted lg:relative lg:top-0 lg:h-full lg:border-b-0">
        <AbayaScene
          config={config}
          step={step}
          resetKey={resetKey}
          onPartSelect={goTo}
          onCaptureReady={onCaptureReady}
          fallback={<SceneMessage kind="prototype" />}
        />
        <p className="pointer-events-none absolute inset-x-0 top-3 px-4 text-center text-xs tracking-wide text-muted-foreground md:top-5 md:text-sm">
          {t.preview.hint}
        </p>
        <p className="pointer-events-none absolute start-3 bottom-3 hidden bg-background/80 px-2.5 py-1 text-[0.7rem] tracking-[0.12em] text-muted-foreground uppercase sm:block md:start-5 md:bottom-5">
          {t.preview.prototype}
        </p>
        <div className="absolute end-2 bottom-2 flex items-center gap-1 md:end-4 md:bottom-4">
          <button
            type="button"
            onClick={() => setResetKey((k) => k + 1)}
            className="inline-flex size-11 items-center justify-center text-muted-foreground transition-opacity hover:opacity-70"
          >
            <RotateCcw className="size-5" strokeWidth={1.5} />
            <span className="sr-only">{t.preview.reset}</span>
          </button>
          <button
            type="button"
            onClick={saveImage}
            disabled={saving || !canCapture}
            className="inline-flex h-11 items-center gap-2 bg-background/90 px-4 text-xs tracking-[0.14em] uppercase transition-opacity hover:opacity-80 disabled:opacity-60"
          >
            <Download className="size-4" strokeWidth={1.5} />
            {t.preview.save}
          </button>
        </div>
      </div>

      {/* Options */}
      <div className="flex min-w-0 flex-col lg:min-h-0 lg:border-s lg:border-border/60">
        <div className="flex-1 px-4 pt-8 pb-6 md:px-10 lg:overflow-y-auto">
          <p className="text-sm tracking-[0.3em] text-muted-foreground uppercase">{t.eyebrow}</p>

          <StepTrail current={stepIndex} onSelect={setStepIndex} sizingDone={isSizingComplete(sizing)} />

          <div className="mt-10">
            <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">
              {t.stepOf.replace("{current}", num(stepIndex + 1)).replace("{total}", num(steps.length))}
            </p>
            <h1 className="mt-2 font-heading text-4xl leading-tight md:text-5xl">{t.steps[step].title}</h1>
            <p className="mt-2 text-muted-foreground">{t.steps[step].intro}</p>
          </div>

          <div className="mt-8">
            {step === "review" ? (
              <Review config={config} sizing={sizing} optionCopy={optionCopy} onEdit={goTo} />
            ) : step === "size" ? (
              <SizeStep sizing={sizing} onChange={setSizing} />
            ) : step === "colour" ? (
              <ColourPicker value={config.colour} onChange={(v) => choose("colour", v)} optionCopy={optionCopy} />
            ) : (
              <OptionList
                step={step}
                value={config[step]}
                onChange={(v) => choose(step, v as Config[typeof step])}
                optionCopy={optionCopy}
              />
            )}
          </div>
        </div>

        <div className="sticky bottom-0 z-10 flex items-center justify-between gap-4 border-t border-border/60 bg-background px-4 py-3 md:px-10 lg:static lg:py-4">
          <button
            type="button"
            onClick={() => setStepIndex((i) => i - 1)}
            disabled={stepIndex === 0}
            className="inline-flex h-12 items-center gap-2 text-sm tracking-[0.16em] uppercase transition-opacity hover:opacity-70 disabled:invisible"
          >
            <ArrowLeft className="size-4 rtl:rotate-180" strokeWidth={1.5} />
            {t.back}
          </button>
          {stepIndex < steps.length - 1 && (
            <button
              type="button"
              onClick={() => setStepIndex((i) => i + 1)}
              className="inline-flex h-12 items-center gap-2 bg-primary px-8 text-sm tracking-[0.16em] text-primary-foreground uppercase transition-opacity hover:opacity-90"
            >
              {t.next}
              <ArrowRight className="size-4 rtl:rotate-180" strokeWidth={1.5} />
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

/**
 * Cut → Sleeve → Fabric → … as one line. Steps behind you are ticked, the
 * current one is underlined, and any of them can be jumped to. On narrow
 * screens the line scrolls sideways and keeps the current step in view.
 */
function StepTrail({
  current,
  onSelect,
  sizingDone,
}: {
  current: number;
  onSelect: (index: number) => void;
  sizingDone: boolean;
}) {
  const t = useI18n().dict.design;
  const list = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const container = list.current;
    const item = container?.children[current] as HTMLElement | undefined;
    if (!container || !item) return;
    // Centre the current step horizontally without scrolling the page.
    const c = container.getBoundingClientRect();
    const i = item.getBoundingClientRect();
    container.scrollBy({ left: i.left + i.width / 2 - (c.left + c.width / 2), behavior: "smooth" });
  }, [current]);

  return (
    <nav aria-label={t.eyebrow} className="-mx-4 mt-5 md:-mx-10">
      <ol
        ref={list}
        className="flex items-center gap-1 overflow-x-auto px-4 text-[0.8125rem] whitespace-nowrap [scrollbar-width:none] md:px-10 [&::-webkit-scrollbar]:hidden"
      >
        {steps.map((s, i) => {
          const done = i < current && (s !== "size" || sizingDone);
          return (
            <li key={s} className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => onSelect(i)}
                aria-current={i === current ? "step" : undefined}
                className={cn(
                  "inline-flex items-center gap-1 border-b py-1 transition-colors",
                  i === current
                    ? "border-foreground text-foreground"
                    : cn(
                        "border-transparent hover:text-foreground",
                        i < current ? "text-foreground/80" : "text-muted-foreground",
                      ),
                )}
              >
                {done && <Check className="size-3.5 text-champagne" strokeWidth={2} />}
                {t.steps[s].short}
              </button>
              {i < steps.length - 1 && (
                <ChevronRight className="size-3.5 shrink-0 text-muted-foreground/60 rtl:rotate-180" strokeWidth={1.5} />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function OptionList({
  step,
  value,
  onChange,
  optionCopy,
}: {
  step: Exclude<ChoiceStep, "colour">;
  value: string;
  onChange: (value: string) => void;
  optionCopy: (s: ChoiceStep, value: string) => OptionCopy;
}) {
  const name = useId();
  return (
    <fieldset>
      <legend className="sr-only">{step}</legend>
      <div className="flex flex-col gap-3">
        {options[step].map((option) => {
          const copy = optionCopy(step, option);
          return (
            <label
              key={option}
              className="flex cursor-pointer gap-4 border border-border/70 p-4 transition-colors hover:border-foreground/60 has-checked:border-foreground has-checked:bg-card has-focus-visible:ring-2 has-focus-visible:ring-ring/50"
            >
              <input
                type="radio"
                name={name}
                value={option}
                checked={value === option}
                onChange={() => onChange(option)}
                className="mt-1.5 size-4 shrink-0 accent-primary"
              />
              <span>
                <span className="block font-heading text-2xl leading-tight">{copy.name}</span>
                <span className="mt-1 block text-sm text-muted-foreground">{copy.body}</span>
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

function ColourPicker({
  value,
  onChange,
  optionCopy,
}: {
  value: Config["colour"];
  onChange: (value: Config["colour"]) => void;
  optionCopy: (s: ChoiceStep, value: string) => OptionCopy;
}) {
  const name = useId();
  return (
    <fieldset>
      <legend className="sr-only">{optionCopy("colour", value).name}</legend>
      <div className="grid grid-cols-3 gap-x-4 gap-y-6 sm:grid-cols-5 lg:grid-cols-3">
        {options.colour.map((option) => (
          <label key={option} className="group flex cursor-pointer flex-col items-center gap-2 text-sm">
            <input
              type="radio"
              name={name}
              value={option}
              checked={value === option}
              onChange={() => onChange(option)}
              className="peer sr-only"
            />
            <span
              className="size-14 rounded-full ring-1 ring-border ring-offset-4 ring-offset-background transition-shadow group-hover:ring-foreground/50 peer-checked:ring-2 peer-checked:ring-foreground peer-focus-visible:ring-2 peer-focus-visible:ring-ring"
              style={{ backgroundColor: colourHex[option] }}
            />
            <span className="text-muted-foreground peer-checked:text-foreground">
              {optionCopy("colour", option).name}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

const selectClass = "h-12 w-full border border-border/70 bg-background px-3 text-base";

function SizeStep({ sizing, onChange }: { sizing: Sizing; onChange: (sizing: Sizing) => void }) {
  const { dict, locale } = useI18n();
  const t = dict.design.sizing;
  const id = useId();
  const set = (patch: Partial<Sizing>) => onChange({ ...sizing, ...patch });

  return (
    <div className="flex flex-col gap-7">
      {/* Standard size / my measurements */}
      <div role="radiogroup" className="grid grid-cols-2 border border-border/70">
        {(Object.keys(sizingFields) as SizingMode[]).map((mode) => (
          <button
            key={mode}
            type="button"
            role="radio"
            aria-checked={sizing.mode === mode}
            onClick={() => set({ mode })}
            className={cn(
              "h-12 text-sm tracking-[0.08em] transition-colors",
              sizing.mode === mode ? "bg-primary text-primary-foreground" : "hover:bg-muted",
            )}
          >
            {t.modes[mode]}
          </button>
        ))}
      </div>

      {sizing.mode === "standard" && (
        <div className="flex flex-col gap-2">
          <label htmlFor={`${id}-size`} className="text-sm">
            {t.size}
          </label>
          <select
            id={`${id}-size`}
            value={sizing.size}
            onChange={(e) => set({ size: e.target.value })}
            className={selectClass}
          >
            <option value="" disabled>
              {t.choose}
            </option>
            {standardSizes.map((s) => (
              <option key={s} value={s}>
                {s} — {t.sizeHints[s]}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="grid gap-x-4 gap-y-6 sm:grid-cols-2 lg:grid-cols-1">
        {(sizingFields[sizing.mode] as readonly Measurement[]).map((m) => (
          <div key={m} className="flex flex-col gap-2">
            <label htmlFor={`${id}-${m}`} className="text-sm">
              {t.fields[m].label}
            </label>
            <select
              id={`${id}-${m}`}
              value={sizing[m]}
              onChange={(e) => set({ [m]: e.target.value })}
              className={selectClass}
            >
              <option value="" disabled>
                {t.choose}
              </option>
              {measurements[m].values.map((v) => (
                <option key={v} value={v}>
                  {Number(v).toLocaleString(locale)} {t.units[measurements[m].unit]}
                </option>
              ))}
            </select>
            <p className="text-sm text-muted-foreground">{t.fields[m].hint}</p>
          </div>
        ))}
      </div>

      <Link href="/size-guide" className="text-sm underline underline-offset-4 hover:text-muted-foreground">
        {t.howToMeasure}
      </Link>
    </div>
  );
}

function Review({
  config,
  sizing,
  optionCopy,
  onEdit,
}: {
  config: Config;
  sizing: Sizing;
  optionCopy: (s: ChoiceStep, value: string) => OptionCopy;
  onEdit: (step: Step) => void;
}) {
  const { dict, locale } = useI18n();
  const t = dict.design;
  const [notes, setNotes] = useState("");
  const [result, setResult] = useState<AddToBagResult | null>(null);
  const [pending, startTransition] = useTransition();
  const notesId = useId();
  const sizeDone = isSizingComplete(sizing);

  const sizeSummary = sizeDone
    ? `${sizing.mode === "standard" ? sizing.size : t.sizing.custom} · ${Number(sizing.length).toLocaleString(locale)} ${t.sizing.units.in}`
    : t.sizing.incomplete;

  const rows: { step: Step; label: string; value: string }[] = [
    ...steps.filter(isChoiceStep).map((s) => ({
      step: s as Step,
      label: t.steps[s].title,
      value: optionCopy(s, config[s]).name,
    })),
    { step: "size", label: t.steps.size.title, value: sizeSummary },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-xs tracking-[0.2em] text-muted-foreground uppercase">{t.review.summary}</h2>
        <dl className="mt-3 divide-y divide-border/60 border-y border-border/60">
          {rows.map((row) => (
            <div key={row.step} className="flex items-baseline justify-between gap-4 py-3">
              <dt className="text-sm text-muted-foreground">{row.label}</dt>
              <dd className="flex items-baseline gap-4 text-end">
                <span
                  className={cn(
                    row.step === "size" && !sizeDone ? "text-sm text-destructive" : "font-heading text-xl",
                  )}
                >
                  {row.value}
                </span>
                <button
                  type="button"
                  onClick={() => onEdit(row.step)}
                  className="text-xs tracking-[0.12em] text-muted-foreground uppercase underline-offset-4 hover:text-foreground hover:underline"
                >
                  {t.review.edit}
                </button>
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <form
        className="flex flex-col gap-6"
        onSubmit={(e) => {
          e.preventDefault();
          startTransition(async () => {
            setResult(await addCustomAbayaToBag({ config, sizing, notes }));
          });
        }}
      >
        <div className="flex flex-col gap-2">
          <label htmlFor={notesId} className="text-sm">
            {t.review.notes}
          </label>
          <textarea
            id={notesId}
            rows={3}
            maxLength={NOTES_MAX}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={t.review.notesPlaceholder}
            className="border border-border/70 bg-background px-3 py-2 text-base placeholder:text-muted-foreground/70"
          />
        </div>

        <button
          type="submit"
          disabled={pending || !sizeDone}
          className="inline-flex h-14 items-center justify-center bg-primary px-10 text-sm tracking-[0.16em] text-primary-foreground uppercase transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {pending ? t.review.adding : t.review.addToBag}
        </button>
        <p className="text-center text-sm text-muted-foreground">{t.review.madeToOrder}</p>

        <div aria-live="polite" className="text-sm">
          {result?.status === "added" && (
            <p>
              {t.review.added}{" "}
              <a href={result.checkoutUrl} className="underline underline-offset-4">
                {t.review.checkout}
              </a>
            </p>
          )}
          {result?.status === "not-configured" && <p className="text-muted-foreground">{t.review.notConnected}</p>}
          {(result?.status === "error" || result?.status === "invalid") && (
            <p className="text-destructive">{t.review.error}</p>
          )}
        </div>
      </form>
    </div>
  );
}
