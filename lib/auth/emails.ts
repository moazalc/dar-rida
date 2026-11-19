import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/config";
import { esc, INK, MUTED, SERIF, shell, type Email } from "@/lib/orders/emails";

/** The sign-in code email, in the visitor's language. */
export function codeEmail(code: string, dict: Dictionary, locale: Locale): Email {
  const t = dict.account.codeEmail;
  const dir = locale === "ar" ? "rtl" : "ltr";
  const body = `<p style="margin:0 0 16px">${esc(t.intro)}</p>
<p style="margin:0 0 16px;font-family:${SERIF};font-size:36px;letter-spacing:0.3em;color:${INK};text-align:center" dir="ltr">${esc(code)}</p>
<p style="margin:0 0 8px;color:${MUTED}">${esc(t.expiry)}</p>
<p style="margin:0;color:${MUTED}">${esc(t.ignore)}</p>`;
  return {
    subject: t.subject.replace("{code}", code),
    html: shell(body, dir, locale),
    text: `${t.intro}\n\n${code}\n\n${t.expiry}\n${t.ignore}`,
  };
}
