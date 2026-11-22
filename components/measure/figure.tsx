import type { Measurement } from "@/lib/measurements";
import { cn } from "@/lib/utils";

/**
 * The measuring figure: a woman in an open black abaya and shayla, front and
 * back, with a gold line for each measurement. The active one is drawn full
 * strength; ones with a value are half strength; the rest are faint. Each
 * value given in `labels` is printed along its own line.
 *
 * Shoulder width is taken across the back, so it is drawn on the back view.
 * Pure SVG with no state, so it renders on the server and in the browser.
 */

const ROBE =
  "M90 63 C80 65 70 69 65 78 C59 122 53 182 48 229 L72 232 C73 190 76 146 80 106 C82 160 77 270 52 441 Q100 449 148 441 C123 270 118 160 120 106 C124 146 127 190 128 232 L152 229 C147 182 141 122 135 78 C130 69 120 65 110 63 Z";
const SHAYLA = "M100 13 C86 13 79 25 79 40 C79 52 83 59 89 64 L111 64 C117 59 121 52 121 40 C121 25 114 13 100 13 Z";
const HANDS = "M52 232 C50 244 54 254 60 254 C66 254 69 244 69 233 Z M131 233 C131 244 134 254 140 254 C146 254 150 244 148 232 Z";

type Labels = Partial<Record<Measurement, string>>;

function line(m: Measurement, active: Measurement | null | undefined, labels: Labels) {
  return cn(
    "fill-none stroke-gold transition-[opacity,stroke-width] duration-300",
    m === active ? "stroke-[2.2] opacity-100" : labels[m] ? "stroke-[1.2] opacity-60" : "stroke-[1.2] opacity-25",
  );
}

function Label({
  m,
  active,
  labels,
  onCloth,
  ...attrs
}: { m: Measurement; active?: Measurement | null; labels: Labels; onCloth?: boolean } & React.SVGProps<SVGTextElement>) {
  const text = labels[m];
  if (!text) return null;
  return (
    <text
      key={text}
      textAnchor="middle"
      className={cn(
        "animate-fade text-[12px] tabular-nums",
        onCloth ? "fill-gold-soft" : "fill-gold",
        m === active ? "font-semibold" : "font-medium opacity-85",
      )}
      {...attrs}
    >
      {text}
    </text>
  );
}

export function MeasureFigure({
  view,
  active,
  labels = {},
  viewLabel,
  className,
}: {
  view: "front" | "back";
  active?: Measurement | null;
  /** Text to print along each measurement's line, e.g. "36 in". */
  labels?: Labels;
  /** "Front" / "Back", printed under the figure. */
  viewLabel?: string;
  className?: string;
}) {
  const front = view === "front";
  return (
    <svg viewBox="-4 0 210 478" aria-hidden className={cn("block h-auto overflow-visible", className)}>
      <path d={ROBE} className="fill-espresso stroke-espresso" strokeLinejoin="round" />
      <path d={SHAYLA} className="fill-espresso stroke-espresso" />
      {front && <ellipse cx="100" cy="41" rx="10" ry="13" className="fill-background stroke-muted-foreground" strokeWidth="1" />}
      <path d={HANDS} className="fill-background stroke-muted-foreground" strokeWidth="1" />
      <g className="fill-none stroke-champagne opacity-50" strokeWidth="1.1" strokeLinecap="round">
        {front ? <path d="M92 64 L100 86 L108 64 M100 86 V444" /> : <path d="M100 64 V444" strokeDasharray="3 4" />}
        <path d="M49 222 L72 225 M128 225 L151 222" />
      </g>
      <path d="M86 444 Q90 451 98 449 M102 449 Q110 451 114 444" className="fill-none stroke-muted-foreground" strokeWidth="1.1" strokeLinecap="round" />

      {front ? (
        <>
          <path className={line("length", active, labels)} d="M184 71 V441 M178 71 H190 M178 441 H190" />
          <ellipse className={line("bust", active, labels)} cx="100" cy="124" rx="22" ry="5" />
          <path className={line("sleeve", active, labels)} d="M142 75 L160 228 M137 77 L147 73 M155 230 L165 226" />
          <ellipse className={line("waist", active, labels)} cx="100" cy="163" rx="19" ry="5" />
          <ellipse className={line("hips", active, labels)} cx="100" cy="202" rx="23" ry="6" />
          <Label m="length" active={active} labels={labels} x="188" y="256" transform="rotate(90 188 256)" />
          <Label m="bust" active={active} labels={labels} onCloth x="100" y="144" />
          <Label m="sleeve" active={active} labels={labels} x="157" y="152" transform="rotate(83 157 152)" />
          <Label m="waist" active={active} labels={labels} onCloth x="100" y="181" />
          <Label m="hips" active={active} labels={labels} onCloth x="100" y="224" />
        </>
      ) : (
        <>
          <path className={line("shoulder", active, labels)} d="M65 74 H135 M65 67 V81 M135 67 V81" />
          <Label m="shoulder" active={active} labels={labels} onCloth x="100" y="96" />
        </>
      )}
      {viewLabel && (
        <text x="100" y="474" textAnchor="middle" className="fill-muted-foreground text-[11px] font-medium tracking-[0.18em] uppercase">
          {viewLabel}
        </text>
      )}
    </svg>
  );
}

/** Front and back side by side, each scaled to the given height. */
export function MeasureFigures({
  active,
  labels,
  views,
  label,
  className,
  figureClassName = "h-[min(440px,62vw)] w-auto max-w-[46%]",
}: {
  active?: Measurement | null;
  labels?: Labels;
  views: { front: string; back: string };
  /** Describes the drawing for screen readers. */
  label: string;
  className?: string;
  figureClassName?: string;
}) {
  return (
    <div role="img" aria-label={label} className={cn("flex justify-center gap-[clamp(12px,5vw,48px)]", className)}>
      <MeasureFigure view="front" active={active} labels={labels} viewLabel={views.front} className={figureClassName} />
      <MeasureFigure view="back" active={active} labels={labels} viewLabel={views.back} className={figureClassName} />
    </div>
  );
}
