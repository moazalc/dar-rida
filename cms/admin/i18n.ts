/**
 * The admin's own wording in both interface languages (ported from datum).
 * Payload translates its built-in screens; what Dar Rida adds (menu, dashboard,
 * order steps) is written here as `t("English", "العربية")` and shown in the
 * language each person picked under Account.
 */

export type Text = { en: string; ar: string };
export type AdminLang = keyof Text;

export const t = (en: string, ar: string): Text => ({ en, ar });

/** The interface language of a request or of Payload's `i18n` (anything but Arabic is English). */
export const adminLang = (i18n: { language?: string } | null | undefined): AdminLang => (i18n?.language === "ar" ? "ar" : "en");

/** Dates and numbers in the admin language. Arabic keeps Western digits, as the shop does. */
export const intlLocale = (lang: AdminLang) => (lang === "ar" ? "ar-AE-u-nu-latn" : "en-GB");

/** The shop's clock: Dubai, whatever the server runs on. */
export const TZ = "Asia/Dubai";

/** "19 Nov 2026" in the admin language, Dubai time. */
export const shortDate = (when: string | Date, lang: AdminLang) =>
  new Intl.DateTimeFormat(intlLocale(lang), { day: "numeric", month: "short", year: "numeric", timeZone: TZ }).format(new Date(when));

/** Order statuses as the team says them. */
export const STATUS_LABEL: Record<string, Text> = {
  pending_payment: t("Awaiting payment", "بانتظار الدفع"),
  paid: t("New", "جديد"),
  in_production: t("In production", "قيد التنفيذ"),
  shipped: t("Shipped", "تم الشحن"),
  completed: t("Delivered", "تم التسليم"),
  cancelled: t("Cancelled", "ملغى"),
};

/**
 * An Arabic count with the noun in the right form: one, two (dual), 3 to 10
 * (plural), 11 and up (singular accusative). `one` and `two` are whole phrases.
 */
export function arCount(n: number, forms: { one: string; two: string; few: string; many: string }): string {
  if (n === 1) return forms.one;
  if (n === 2) return forms.two;
  const mod = n % 100;
  if (mod >= 3 && mod <= 10) return `${n} ${forms.few}`;
  return `${n} ${forms.many}`;
}

const NOUNS = {
  order: { en: ["order", "orders"], ar: { one: "طلب واحد", two: "طلبان", few: "طلبات", many: "طلبًا" } },
  piece: { en: ["piece", "pieces"], ar: { one: "قطعة واحدة", two: "قطعتان", few: "قطع", many: "قطعة" } },
  late: { en: ["late", "late"], ar: { one: "طلب متأخر", two: "طلبان متأخران", few: "طلبات متأخرة", many: "طلبًا متأخرًا" } },
} as const;

/** "1 order", "3 orders" / "طلب واحد", "3 طلبات". */
export function counted(n: number, noun: keyof typeof NOUNS, lang: AdminLang): string {
  if (lang === "ar") return arCount(n, NOUNS[noun].ar);
  const [one, many] = NOUNS[noun].en;
  return `${n} ${n === 1 ? one : many}`;
}
