import type { Dictionary } from "@/lib/i18n/dictionaries";
import { isChoiceStep, options, parseConfig, type ChoiceStep } from "./options";

/** A builder config as "Cut: Classic" rows, in the dictionary's language. Empty if the config is invalid. */
export function describeConfig(config: unknown, dict: Dictionary): { label: string; value: string }[] {
  const parsed = parseConfig(config);
  if (!parsed) return [];
  return (Object.keys(options) as ChoiceStep[]).filter(isChoiceStep).map((step) => ({
    label: dict.design.steps[step].short,
    value: (dict.design.options[step] as Record<string, { name: string }>)[parsed[step]].name,
  }));
}
