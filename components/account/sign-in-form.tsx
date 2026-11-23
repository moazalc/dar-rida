"use client";

import { useEffect, useId, useState } from "react";
import { useI18n } from "@/components/providers/i18n-provider";
import { authClient } from "@/lib/auth/client";
import { localePath } from "@/lib/i18n/config";

const RESEND_SECONDS = 30;
const input = "h-12 w-full border border-border bg-card px-3 text-base outline-none focus:border-foreground";
const primary =
  "inline-flex h-12 w-full items-center justify-center bg-primary px-7 text-sm tracking-[0.16em] text-primary-foreground uppercase transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50";
const link = "text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground";

type ErrorKey = keyof ReturnType<typeof useI18n>["dict"]["account"]["signIn"]["errors"];

function errorFor(error: { code?: string; status?: number } | null | undefined): ErrorKey {
  if (!error) return "generic";
  if (error.status === 429 || error.code === "TOO_MANY_ATTEMPTS") return "tooMany";
  if (error.code === "OTP_EXPIRED") return "expired";
  if (error.code === "INVALID_OTP") return "badCode";
  return "generic";
}

/**
 * Email, then the 6-digit code; or Google. Either way she lands on
 * /account/welcome, which joins her bag to her account and sends her on.
 */
export function SignInForm({ next, google, initialError }: { next: string; google: boolean; initialError?: ErrorKey }) {
  const { dict, locale } = useI18n();
  const t = dict.account.signIn;
  const ids = { email: useId(), code: useId() };
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<ErrorKey | null>(initialError ?? null);
  const [wait, setWait] = useState(0);
  const welcome = localePath(locale, `/account/welcome?next=${encodeURIComponent(next)}`);

  useEffect(() => {
    if (wait <= 0) return;
    const timer = setTimeout(() => setWait((w) => w - 1), 1000);
    return () => clearTimeout(timer);
  }, [wait]);

  async function sendCode() {
    const address = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address)) return setError("invalidEmail");
    setBusy(true);
    setError(null);
    const { error } = await authClient.emailOtp.sendVerificationOtp({ email: address, type: "sign-in" });
    setBusy(false);
    if (error) return setError(error.status === 429 ? "tooMany" : "sendFailed");
    setEmail(address);
    setCode("");
    setStep("code");
    setWait(RESEND_SECONDS);
  }

  async function verify() {
    const otp = code.replace(/\D/g, "");
    if (otp.length !== 6) return setError("badCode");
    setBusy(true);
    setError(null);
    const { error } = await authClient.signIn.emailOtp({ email, otp });
    if (error) {
      setBusy(false);
      return setError(errorFor(error));
    }
    // A full page load: /account/welcome is a route handler that sets cookies and redirects.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.assign(welcome);
  }

  async function withGoogle() {
    setBusy(true);
    setError(null);
    const { error } = await authClient.signIn.social({
      provider: "google",
      callbackURL: welcome,
      errorCallbackURL: `/account/sign-in?next=${encodeURIComponent(next)}&error=google`,
    });
    if (error) {
      setBusy(false);
      setError("google");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {step === "email" ? (
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            void sendCode();
          }}
        >
          <label htmlFor={ids.email} className="text-sm">
            {t.email}
          </label>
          <input
            id={ids.email}
            type="email"
            inputMode="email"
            autoComplete="email"
            autoFocus
            required
            dir="ltr"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t.emailPlaceholder}
            className={input}
          />
          <button type="submit" disabled={busy} className={primary}>
            {busy ? t.sending : t.sendCode}
          </button>
        </form>
      ) : (
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            void verify();
          }}
        >
          <p className="text-sm">{t.codeSent.replace("{email}", email)}</p>
          <label htmlFor={ids.code} className="text-sm">
            {t.code}
          </label>
          <input
            id={ids.code}
            inputMode="numeric"
            autoComplete="one-time-code"
            autoFocus
            maxLength={6}
            dir="ltr"
            value={code}
            onChange={(e) => {
              const digits = e.target.value.replace(/\D/g, "").slice(0, 6);
              setCode(digits);
              setError(null);
            }}
            className={`${input} text-center font-heading text-3xl tracking-[0.5em] tabular-nums`}
          />
          <button type="submit" disabled={busy || code.length !== 6} className={primary}>
            {busy ? t.verifying : t.verify}
          </button>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <button type="button" onClick={() => void sendCode()} disabled={busy || wait > 0} className={`${link} disabled:no-underline disabled:opacity-60`}>
              {wait > 0 ? t.resendIn.replace("{seconds}", String(wait)) : t.resend}
            </button>
            <button type="button" onClick={() => (setStep("email"), setError(null))} className={link}>
              {t.changeEmail}
            </button>
          </div>
        </form>
      )}

      <p aria-live="polite" className="min-h-5 text-sm text-destructive">
        {error ? t.errors[error] : null}
      </p>

      {google && (
        <>
          <div className="flex items-center gap-4 text-xs tracking-[0.2em] text-muted-foreground uppercase">
            <span className="h-px flex-1 bg-border" />
            {t.or}
            <span className="h-px flex-1 bg-border" />
          </div>
          <button
            type="button"
            onClick={() => void withGoogle()}
            disabled={busy}
            className="inline-flex h-12 w-full items-center justify-center gap-3 border border-foreground/70 bg-background px-7 text-sm transition-colors hover:bg-linen disabled:opacity-50"
          >
            <GoogleMark />
            {t.google}
          </button>
        </>
      )}
    </div>
  );
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 48 48" className="size-5" aria-hidden>
      <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.6 5.4 2.7 13.2l7.9 6.2C12.5 13.6 17.8 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.4c-.5 2.9-2.1 5.3-4.6 7l7.4 5.7c4.3-4 6.9-9.9 6.9-17.2z" />
      <path fill="#FBBC05" d="M10.6 28.6c-.5-1.4-.8-3-.8-4.6s.3-3.2.8-4.6l-7.9-6.2C1 16.6 0 20.2 0 24s1 7.4 2.7 10.8l7.9-6.2z" />
      <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.4-5.7c-2.1 1.4-4.8 2.3-8.5 2.3-6.2 0-11.5-4.1-13.4-9.9l-7.9 6.2C6.6 42.6 14.6 48 24 48z" />
    </svg>
  );
}
