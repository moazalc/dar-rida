/**
 * A looping taste of the Design Your Abaya builder: one abaya drawing whose
 * sleeves change (straight → bell → cape → bell with crystals) while the
 * garment moves between black and mocha. A label under it names each change.
 * Pure CSS animation (see `.builder-frame` in globals.css); no client JS.
 */

// Crystals in a soft scatter at the bell-sleeve cuffs, denser at the opening.
const scatterLeft: [number, number, number][] = [
  [52, 304, 1.6], [62, 306, 1.5], [73, 308, 1.7], [85, 308, 1.5], [97, 309, 1.6], [106, 306, 1.4],
  [58, 294, 1.3], [70, 297, 1.2], [82, 296, 1.4], [95, 298, 1.2], [104, 292, 1.1],
  [66, 282, 1.1], [80, 284, 1], [93, 281, 1.1], [74, 268, 0.9], [90, 264, 0.9], [83, 250, 0.8], [96, 238, 0.7],
];
const scatter = [...scatterLeft, ...scatterLeft.map(([x, y, r]): [number, number, number] => [320 - x, y, r])];

const bell = (
  <>
    <path className="g" d="M100,58 Q80,180 40,310 Q74,322 112,312 Q106,230 108,150 Z" />
    <path className="g" d="M220,58 Q240,180 280,310 Q246,322 208,312 Q214,230 212,150 Z" />
    <path className="s" d="M92,120 Q76,220 60,312 M228,120 Q244,220 260,312" />
  </>
);

export function BuilderPreview({ label, chips }: { label: string; chips: { label: string; value: string }[] }) {
  return (
    <div className="relative flex aspect-[4/5] w-full items-center justify-center border border-champagne/40 bg-background">
      <svg viewBox="0 0 320 560" role="img" aria-label={label} className="abaya-drawing builder-preview h-[84%] w-auto">
        <path className="g" d="M138,40 Q160,32 182,40 L220,58 L212,150 L242,530 Q160,542 78,530 L108,150 L100,58 Z" />
        <path className="s" d="M130,200 Q126,360 116,522 M190,200 Q194,360 204,522 M160,62 L160,536" />
        <path className="n" d="M139,41 Q160,66 181,41" />
        <g className="builder-frame" data-frame="1">
          <path className="g" d="M100,58 Q84,170 62,298 L98,304 Q104,220 108,150 Z" />
          <path className="g" d="M220,58 Q236,170 258,298 L222,304 Q216,220 212,150 Z" />
          <path className="s" d="M90,120 Q80,210 74,296 M230,120 Q240,210 246,296" />
        </g>
        <g className="builder-frame" data-frame="2">
          {bell}
        </g>
        <g className="builder-frame" data-frame="3">
          <path className="g" d="M100,58 Q60,120 22,330 Q70,350 130,335 Q120,240 108,150 Z" />
          <path className="g" d="M220,58 Q260,120 298,330 Q250,350 190,335 Q200,240 212,150 Z" />
          <path
            className="s"
            d="M86,110 Q58,220 48,336 M234,110 Q262,220 272,336 M100,130 Q96,240 96,340 M220,130 Q224,240 224,340"
          />
        </g>
        <g className="builder-frame" data-frame="4">
          {bell}
          <g className="c">
            {scatter.map(([cx, cy, r]) => (
              <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} />
            ))}
          </g>
        </g>
      </svg>

      <div aria-hidden className="absolute inset-x-0 bottom-5 h-10">
        {chips.map((chip, i) => (
          <p
            key={chip.label + chip.value}
            data-frame={i + 1}
            className="builder-frame absolute start-1/2 -translate-x-1/2 border border-champagne bg-card px-4 py-2.5 text-xs tracking-[0.12em] whitespace-nowrap uppercase rtl:translate-x-1/2"
          >
            <span className="me-2 text-muted-foreground">{chip.label}</span>
            {chip.value}
          </p>
        ))}
      </div>
    </div>
  );
}
