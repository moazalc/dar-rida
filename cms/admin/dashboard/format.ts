import { intlLocale, TZ, type AdminLang } from "../i18n";

/** Formatting for the dashboard, in the admin language and Dubai time (ported from datum). */

const dubaiHour = (d: Date) => Number(new Intl.DateTimeFormat("en-GB", { hour: "numeric", hourCycle: "h23", timeZone: TZ }).format(d));

export function dubaiGreeting(now = new Date(), lang: AdminLang = "en"): string {
  const h = dubaiHour(now);
  if (h >= 5 && h < 12) return lang === "ar" ? "صباح الخير" : "Good morning";
  if (lang === "ar") return "مساء الخير";
  return h >= 12 && h < 17 ? "Good afternoon" : "Good evening";
}

export function dubaiDateLine(now = new Date(), lang: AdminLang = "en"): string {
  const part = (o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat(intlLocale(lang), { ...o, timeZone: TZ }).format(now);
  return `${part({ weekday: "long" })}${lang === "ar" ? "،" : ","} ${part({ day: "numeric" })} ${part({ month: "long" })}`;
}

const DAY = 86_400_000;

/** "today", "3 days ago", "in 2 days" — whole Dubai days between two moments. */
export function dayDistance(when: string | Date, now = new Date(), lang: AdminLang = "en"): string {
  const day = (d: Date) => Math.floor((d.getTime() + 4 * 3_600_000) / DAY);
  const diff = day(new Date(when)) - day(now);
  const ar = lang === "ar";
  if (diff === 0) return ar ? "اليوم" : "today";
  if (diff === -1) return ar ? "أمس" : "yesterday";
  if (diff === 1) return ar ? "غدًا" : "tomorrow";
  const n = Math.abs(diff);
  if (ar) return diff < 0 ? `قبل ${n} أيام` : `بعد ${n} أيام`;
  return diff < 0 ? `${n} days ago` : `in ${n} days`;
}

/** Whole numbers with thousands separators, in the admin language. */
export const formatNumber = (n: number, lang: AdminLang = "en") => n.toLocaleString(intlLocale(lang));

/** Bar lengths in percent of the largest value; a non-zero value never shrinks below a visible sliver. */
export function barWidths(values: number[]): number[] {
  const max = Math.max(0, ...values);
  return values.map((v) => (max === 0 || v === 0 ? 0 : Math.max(2, Math.round((v / max) * 100))));
}

/** "+12%" against the previous period, or null when there is nothing to compare with. */
export function percentChange(current: number, previous: number): string | null {
  if (!previous) return null;
  const pct = Math.round(((current - previous) / previous) * 100);
  return `${pct > 0 ? "+" : pct < 0 ? "−" : "±"}${Math.abs(pct)}%`;
}
