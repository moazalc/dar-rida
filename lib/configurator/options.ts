// The "Design Your Abaya" option catalogue — safe to import from both server
// and client code. Labels live in the dictionaries (`design.options`); this file
// only holds ids, order and the values the 3D preview needs.

export const steps = ["cut", "sleeve", "fabric", "colour", "finishing", "size", "review"] as const;
export type Step = (typeof steps)[number];

/** Steps that pick one option. `size` takes measurements; `review` holds the notes and bag. */
export type ChoiceStep = Exclude<Step, "size" | "review">;

export const options = {
  cut: ["classic", "butterfly", "wrap"],
  sleeve: ["straight", "cape", "bell", "cuffed"],
  fabric: ["crepe", "nida", "silk", "chiffon"],
  colour: ["black", "navy", "mocha", "olive", "stone"],
  finishing: ["plain", "lace", "crystals", "embroidery"],
} as const satisfies Record<ChoiceStep, readonly string[]>;

export type Config = { [S in ChoiceStep]: (typeof options)[S][number] };

export const defaultConfig: Config = {
  cut: "classic",
  sleeve: "cape",
  fabric: "crepe",
  colour: "black",
  finishing: "plain",
};

/** Swatch and 3D base colour per colour option. */
export const colourHex: Record<Config["colour"], string> = {
  black: "#141213",
  navy: "#1c2233",
  mocha: "#5a4337",
  olive: "#4b4a36",
  stone: "#b3a794",
};

export const NOTES_MAX = 500;

// --- Sizing ---------------------------------------------------------------
// Abayas are sized by length (shoulder to floor, in inches, as in the Gulf)
// plus either a standard size or the shopper's own measurements.

function range(from: number, to: number, step: number): string[] {
  const values: string[] = [];
  for (let v = from; v <= to + 1e-9; v += step) values.push(String(Math.round(v * 10) / 10));
  return values;
}

export const standardSizes = ["XS", "S", "M", "L", "XL", "XXL"] as const;

/** Each measurement's dropdown values and unit. */
export const measurements = {
  length: { unit: "in", values: range(50, 62, 1) },
  bust: { unit: "in", values: range(30, 52, 1) },
  shoulder: { unit: "in", values: range(13, 19, 0.5) },
  sleeve: { unit: "in", values: range(20, 27, 0.5) },
  hips: { unit: "in", values: range(34, 58, 1) },
  height: { unit: "cm", values: range(145, 190, 1) },
} as const;
export type Measurement = keyof typeof measurements;

/** Measurements asked for in each mode; length is asked in both. */
export const sizingFields = {
  standard: ["length"],
  custom: ["length", "bust", "shoulder", "sleeve", "hips", "height"],
} as const satisfies Record<string, readonly Measurement[]>;

export type SizingMode = keyof typeof sizingFields;

export type Sizing = { mode: SizingMode; size: string } & Record<Measurement, string>;

export const emptySizing: Sizing = {
  mode: "standard",
  size: "",
  length: "",
  bust: "",
  shoulder: "",
  sleeve: "",
  hips: "",
  height: "",
};

/** Whether every field the chosen mode needs holds an allowed value. */
export function isSizingComplete(s: Sizing): boolean {
  if (!Object.hasOwn(sizingFields, s.mode)) return false;
  if (s.mode === "standard" && !(standardSizes as readonly string[]).includes(s.size)) return false;
  return sizingFields[s.mode].every((m) => (measurements[m].values as readonly string[]).includes(s[m]));
}

export function isChoiceStep(step: string): step is ChoiceStep {
  return step in options;
}

export function isOption<S extends ChoiceStep>(step: S, value: unknown): value is Config[S] {
  return typeof value === "string" && (options[step] as readonly string[]).includes(value);
}

/** Build a config from URL search params, falling back to the default per step. */
export function parseConfig(params: Record<string, string | string[] | undefined>): Config {
  const config = { ...defaultConfig } as Record<ChoiceStep, string>;
  for (const step of Object.keys(options) as ChoiceStep[]) {
    const value = params[step];
    if (isOption(step, value)) config[step] = value;
  }
  return config as Config;
}
