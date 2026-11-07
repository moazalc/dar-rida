// The "Design Your Abaya" option catalogue — safe to import from both server
// and client code. Labels live in the dictionaries (`design.options`); this file
// only holds ids, order and the values the 3D preview needs.

export const steps = ["cut", "sleeve", "fabric", "colour", "finishing", "size", "review"] as const;
export type Step = (typeof steps)[number];

/** Steps that pick one option. `size` takes the measurements (see `lib/measurements`); `review` holds the notes and bag. */
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

export function isChoiceStep(step: string): step is ChoiceStep {
  return step in options;
}

export function isOption<S extends ChoiceStep>(step: S, value: unknown): value is Config[S] {
  return typeof value === "string" && (options[step] as readonly string[]).includes(value);
}

/** Build a config from URL search params, falling back to the default per step. */
export function configFromParams(params: Record<string, string | string[] | undefined>): Config {
  const config = { ...defaultConfig } as Record<ChoiceStep, string>;
  for (const step of Object.keys(options) as ChoiceStep[]) {
    const value = params[step];
    if (isOption(step, value)) config[step] = value;
  }
  return config as Config;
}

/** Check an untrusted builder config (e.g. a Server Action argument); null if any choice is not allowed. */
export function parseConfig(input: unknown): Config | null {
  if (typeof input !== "object" || input === null) return null;
  const out = {} as Record<ChoiceStep, string>;
  for (const step of Object.keys(options) as ChoiceStep[]) {
    const value = (input as Record<string, unknown>)[step];
    if (!isOption(step, value)) return null;
    out[step] = value;
  }
  return out as Config;
}
