import type { Dictionary } from "./dictionaries/en";

type DeepPartial<T> = T extends string | number | boolean | ((...args: never[]) => unknown) | readonly unknown[]
  ? T
  : { [K in keyof T]?: DeepPartial<T[K]> };

/** A language that's only partly translated: anything missing shows in English. */
export type PartialDictionary = DeepPartial<Dictionary>;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function merge(base: unknown, partial: unknown): unknown {
  if (partial === undefined || partial === "") return base;
  if (!isPlainObject(base) || !isPlainObject(partial)) return partial;
  const out: Record<string, unknown> = { ...base };
  for (const key of Object.keys(partial)) out[key] = merge(base[key], partial[key]);
  return out;
}

/** English with the translated strings laid over it. Never changes `base`. */
export function mergeDictionary(base: Dictionary, partial: PartialDictionary): Dictionary {
  return merge(base, partial) as Dictionary;
}
