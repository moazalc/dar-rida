# Foundation B: Language in the URL Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move the shop's language from a cookie into the web address (`/en/…`, `/ar/…`) with seven locales wired end to end, English fallback for missing strings, hreflang, and redirects so every old link keeps working.

**Architecture:** The proxy owns locale routing. A prefixed path (`/ar/collection`) is rewritten to the existing un-prefixed route (`/collection`) with the locale passed in a request header (`x-dr-locale`) and the stripped path in `x-dr-path`; `getLocale()` reads that header first. An un-prefixed path is redirected (307) to the visitor's locale. This keeps every page where it is (no move into `app/[lang]`), so `getLocale()` stays the one API the 47 callers already use. Links get the prefix through a `LocaleLink` wrapper and a `localePath()` helper; any link that misses it still works via the redirect.

**Tech Stack:** Next 16.4 proxy (`proxy.ts`), Payload 3.93 localization (Postgres), Vitest 5.

**Spec:** `docs/superpowers/specs/2026-11-23-redesign-blueprint-design.md` (section 3.10; section 4 default languages).

**Companion plan:** `docs/superpowers/plans/2026-11-23-foundation-design-system.md`. Independent; either can land first.

## Global Constraints

- Locales, in this order: `en, ar, fr, ru, tr, de, es`. Only `ar` is RTL.
- Published (shown in the language picker, sitemap, hreflang, and routable) at the end of this plan: `en, ar`. The other five become routable only when `ALL_LOCALES=1` is set (for translation work in Phase 6); otherwise a request for them redirects to the same path in English.
- Locale choice order for an un-prefixed request: `darrida_locale` cookie → first published match in `Accept-Language` → `ar` if the `dr_country` cookie is `LY` → `en`.
- A missing dictionary string falls back to English, never to a blank or a key name.
- Never prefixed or redirected: `/api/*`, the admin path (`ADMIN_PATH`, default `/atelier`) and `/admin`, `/print/*`, `/media/*`, `/_next/*`, `/coming-soon`, and any path whose last segment contains a dot (`robots.txt`, `sitemap.xml`, `favicon.ico`).
- The password gate and the coming-soon switch keep working exactly as today and run before locale routing.
- The cookie `darrida_locale` stays (Better Auth reads it for email-code language in `lib/auth/index.ts`); it is written whenever the visitor changes language.
- Local checks before every commit: `pnpm lint`, `pnpm exec vitest run`, `pnpm exec tsc --noEmit`.

## Review Focus

1. **Query strings and hashes survive the redirect.** `/collection?q=black` must land on `/en/collection?q=black`. → Task 3 test `redirect keeps the query`.
2. **Stripe returns.** `success_url`/`cancel_url` must come back in the buyer's language, and the old un-prefixed URLs in already-open Stripe sessions must still work. → Task 4 test `checkout urls carry the locale`; the redirect covers old sessions.
3. **Sign-in `next=` targets.** `next=/account/orders/DR-1` must not become `/en/en/account/...` or an open redirect. → Task 4 test `localePath is idempotent and ignores external urls`.
4. **Unpublished locale in a shared link.** `/fr/collection` without `ALL_LOCALES` must redirect to `/en/collection`, not 404. → Task 3 test `unpublished locale redirects to english`.
5. **Admin and media untouched.** `/atelier/collections/orders`, `/media/x.jpg`, `/api/orders/export` must pass through unchanged. → Task 3 test `skips admin, api, media, print and files`.

---

### Task 1: Seven locales and the negotiation rule

**Files:**
- Modify: `lib/i18n/config.ts`
- Create: `lib/i18n/negotiate.ts`
- Test: `tests/i18n-negotiate.test.ts`

**Interfaces:**
- Produces in `config.ts`: `locales = ["en","ar","fr","ru","tr","de","es"] as const`; `publishedLocales: readonly Locale[] = ["en","ar"]`; `isRoutableLocale(l: Locale): boolean` (published, or any when `process.env.ALL_LOCALES === "1"`); labels for all seven (`English, العربية, Français, Русский, Türkçe, Deutsch, Español`; short `EN, عربي, FR, RU, TR, DE, ES`); direction map (only `ar` rtl).
- Produces in `negotiate.ts`: `pickLocale(input: { cookie?: string | null; acceptLanguage?: string | null; country?: string | null }): Locale` — follows the Global Constraints order, considering only routable locales; parses `Accept-Language` q-values (highest first), matching on the primary subtag (`fr-CA` → `fr`).

- [ ] **Step 1: Failing tests:** cookie `ar` wins over `Accept-Language: en`; `Accept-Language: "de;q=0.4, ar;q=0.9"` → `ar`; `Accept-Language: fr` with `ALL_LOCALES` unset → `en` (unpublished skipped); same with `vi.stubEnv("ALL_LOCALES","1")` → `fr`; no cookie, no header, country `LY` → `ar`; nothing → `en`; cookie `xx` (invalid) ignored.
- [ ] **Step 2: Run, expect FAIL.**  - [ ] **Step 3: Implement.**  - [ ] **Step 4: Run, expect PASS.** tsc will now fail wherever a `Record<Locale, …>` lists only en/ar — that is Task 2's job; commit after Task 2 if needed, or add the five entries now.
- [ ] **Step 5: Commit** — `git commit -m "Add seven locales and the locale negotiation rule"`

---

### Task 2: Dictionaries with English fallback

**Files:**
- Modify: `lib/i18n/dictionaries.ts`
- Create: `lib/i18n/merge.ts`, `lib/i18n/dictionaries/fr.ts`, `ru.ts`, `tr.ts`, `de.ts`, `es.ts`
- Test: `tests/i18n-dictionaries.test.ts`

**Interfaces:**
- Produces: `type PartialDictionary = DeepPartial<Dictionary>` (exported from `merge.ts`, with `DeepPartial` defined there); `mergeDictionary(base: Dictionary, partial: PartialDictionary): Dictionary` — deep merge of plain objects; strings, arrays and functions in `partial` replace the base value; `undefined` or empty string keeps the base.
- The five new files each `export default {} satisfies PartialDictionary;` with a header comment that this is filled in Phase 6.
- `getDictionary(locale)`: `en` and `ar` load as today (full `Dictionary`, still type-checked for exact shape); the others return `mergeDictionary(en, partial)`.

- [ ] **Step 1: Failing tests:** `mergeDictionary(en, { nav: { collection: "Collection FR" } }).nav.collection === "Collection FR"` and `.nav.search === en.nav.search`; empty string in partial keeps English; `getDictionary("fr")` deep-equals `en` while `fr.ts` is empty (mock `server-only` with `vi.mock("server-only", () => ({}))`).
- [ ] **Step 2: Run, expect FAIL.**  - [ ] **Step 3: Implement.**  - [ ] **Step 4: Run tests and tsc, expect PASS.**
- [ ] **Step 5: Commit** — `git commit -m "Add the five new dictionaries with English fallback"`

---

### Task 3: Locale routing in the proxy

**Files:**
- Create: `lib/i18n/routing.ts`
- Modify: `proxy.ts`, `lib/i18n/locale.ts`
- Test: `tests/locale-routing.test.ts`

**Interfaces:**
- Consumes: `pickLocale`, `isRoutableLocale`, `locales`, `adminRoute()` from `lib/admin-route.ts`.
- Produces: `LOCALE_HEADER = "x-dr-locale"`, `PATH_HEADER = "x-dr-path"` (in `config.ts` so client-safe); `routeLocale(request: NextRequest): NextResponse | null` in `routing.ts` — returns `null` for skipped paths (see Global Constraints), a 307 redirect for un-prefixed or unpublished-locale paths, or a rewrite to the stripped path with both request headers set (`NextResponse.rewrite(url, { request: { headers } })`). `/ar` and `/ar/` rewrite to `/`.
- `getLocale()` in `locale.ts`: `x-dr-locale` header (if a valid locale) → otherwise the current cookie/Accept-Language logic via `pickLocale` (covers routes the proxy skips, e.g. `/coming-soon`, `global-not-found`).
- Produces `getPathname(): Promise<string>` in `locale.ts` — the `x-dr-path` header or `/`.
- `proxy.ts`: call `routeLocale(request)` as the last step (after password gate, `/api`, admin rewrite/404, coming-soon), returning its response when non-null.

- [ ] **Step 1: Failing tests** (build requests with `new NextRequest("https://darrida.net/…", { headers })`):
  - `redirects un-prefixed to the negotiated locale`: `/collection` + `Accept-Language: ar` → 307, `Location` ends `/ar/collection`.
  - `redirect keeps the query`: `/search?q=black` → `/en/search?q=black`.
  - `root redirects`: `/` → `/en`.
  - `rewrites prefixed paths with headers`: `/ar/collection/rida-01` → rewrite; `x-middleware-rewrite` header ends `/collection/rida-01`; `x-middleware-request-x-dr-locale` is `ar`; `x-middleware-request-x-dr-path` is `/collection/rida-01`.
  - `unpublished locale redirects to english`: `/fr/faq` → 307 to `/en/faq`; with `ALL_LOCALES=1` → rewrite.
  - `skips admin, api, media, print and files`: `/atelier/collections/orders`, `/api/orders/export`, `/media/a.jpg`, `/print/orders/1`, `/robots.txt`, `/coming-soon` → `null`.
- [ ] **Step 2: Run, expect FAIL.**  - [ ] **Step 3: Implement `routing.ts`, update `proxy.ts` and `locale.ts`.**  - [ ] **Step 4: Run, expect PASS.**
- [ ] **Step 5: Commit** — `git commit -m "Route the shop by language in the URL, redirecting old links"`

---

### Task 4: Links, redirects and Stripe URLs carry the locale

**Files:**
- Modify: `lib/i18n/config.ts` (add `localePath`), `lib/checkout.ts:173-174`, `app/(frontend)/account/actions.ts:58`, `app/(frontend)/account/sign-in/page.tsx:18`, `app/(frontend)/account/welcome/route.ts:19,26`, `lib/customers.ts:60`, and the 22 files that import `next/link` under `app/(frontend)`, `app/(coming-soon)` and `components/`
- Create: `components/locale-link.tsx`
- Test: `tests/locale-path.test.ts`, `tests/checkout-urls.test.ts` (or extend the existing `tests/pricing.test.ts` if checkout URL building is already tested there)

**Interfaces:**
- Produces: `localePath(locale: Locale, href: string): string` — prefixes internal absolute paths (`/x` → `/ar/x`, `/` → `/ar`); leaves untouched: external URLs (`https:`, `mailto:`, `tel:`), hash-only (`#x`), relative paths, anything already starting with a locale prefix, and the never-prefixed paths from Global Constraints. Keeps query and hash.
- Produces: `LocaleLink` — client component with the same props as `next/link`; when `href` is a string it passes `localePath(useI18n().locale, href)`; object hrefs pass through unchanged.
- Checkout: the function that builds the Stripe session (around `lib/checkout.ts:173`) uses `${siteUrl()}${localePath(locale, "/checkout/success")}?session_id={CHECKOUT_SESSION_ID}` and `${siteUrl()}${localePath(locale, "/cart")}`; take `locale` from its existing input (add a `locale: Locale` parameter if it has none, and pass `await getLocale()` from `app/(frontend)/cart/actions.ts`).
- Server redirects: `redirect(localePath(await getLocale(), path))` in the listed files; `welcome/route.ts` builds both URLs with `localePath` using the locale from `getLocale()`.

- [ ] **Step 1: Failing tests** `tests/locale-path.test.ts`: `/collection`→`/ar/collection`; `/`→`/ar`; `/search?q=a#r`→`/ar/search?q=a#r`; `/ar/cart` unchanged (idempotent); `/en/cart` with locale `ar` unchanged (already prefixed — the link means English); `https://x.com/a`, `mailto:a@b.c`, `#top`, `/api/x`, `/media/a.jpg`, `/atelier` unchanged. Checkout test: the built session params' `success_url` contains `/ar/checkout/success?session_id=` when called with `ar`.
- [ ] **Step 2: Run, expect FAIL.**  - [ ] **Step 3: Implement `localePath`, `LocaleLink`, checkout and redirect changes.**
- [ ] **Step 4: Swap imports** — in every listed file replace `import Link from "next/link"` with `import Link from "@/components/locale-link"`. Server components may import it (it's a client component rendered from the server). Do not touch `cms/` or `app/(print)` or `app/(payload)`.
- [ ] **Step 5: Run tests, lint, tsc; expect PASS.**
- [ ] **Step 6: Commit** — `git commit -m "Give links, redirects and Stripe returns the visitor's language"`

---

### Task 5: Language switcher navigates

**Files:**
- Modify: `components/language-toggle.tsx`, `lib/i18n/actions.ts`
- Test: `tests/i18n-switch.test.ts`

**Interfaces:**
- Produces: `switchLocalePath(pathname: string, to: Locale): string` in `config.ts` — replaces an existing locale prefix or adds one (`/ar/cart` → `/en/cart`, `/cart` → `/fr/cart`, `/ar` → `/en`), keeping the rest.
- `language-toggle.tsx`: lists only `publishedLocales` (still a two-way toggle while that's en/ar; becomes a menu when more are published — render a menu whenever `publishedLocales.length > 2`). On choose: `await setLocale(next)` (cookie, unchanged), then `router.push(switchLocalePath(window.location.pathname, next) + window.location.search)`.

- [ ] **Step 1: Failing tests** for `switchLocalePath` (the four cases above, plus a query-free path with trailing slash `/ar/` → `/en`).
- [ ] **Step 2: Run, expect FAIL.**  - [ ] **Step 3: Implement.**  - [ ] **Step 4: Run, expect PASS.**
- [ ] **Step 5: Commit** — `git commit -m "Switch language by moving to the same page in the new language"`

---

### Task 6: hreflang, canonical and the sitemap

**Files:**
- Create: `lib/i18n/seo.ts`
- Modify: `app/(frontend)/layout.tsx` (`generateMetadata`), `app/sitemap.ts`
- Test: `tests/i18n-seo.test.ts`

**Interfaces:**
- Consumes: `getPathname()`, `publishedLocales`, `localePath`, `siteUrl()`.
- Produces: `alternatesFor(path: string, locale: Locale, base: string): { canonical: string; languages: Record<string, string> }` — canonical `${base}${localePath(locale, path)}`; `languages` has one entry per published locale plus `"x-default"` → the English URL.
- Layout `generateMetadata` adds `alternates: alternatesFor(await getPathname(), locale, siteUrl())`. Pages that set their own metadata keep it; Next merges `alternates` from the layout unless a page overrides it (none do today).
- Sitemap: one entry per page × published locale, each with `alternates: { languages }`; update the header comment (the language is no longer a cookie).

- [ ] **Step 1: Failing tests:** `alternatesFor("/collection","ar","https://darrida.net")` → canonical `https://darrida.net/ar/collection`, `languages.en` `https://darrida.net/en/collection`, `languages["x-default"]` equals `languages.en`, no `fr` key while unpublished; `"/"` → `…/ar` and `…/en`.
- [ ] **Step 2: Run, expect FAIL.**  - [ ] **Step 3: Implement.**  - [ ] **Step 4: Run, expect PASS.**
- [ ] **Step 5: Commit** — `git commit -m "Add hreflang, canonical URLs and a sitemap per language"`

---

### Task 7: Payload content in seven locales

**Files:**
- Modify: `payload.config.ts:70-77`
- Create: `cms/migrations/<timestamp>_seven_locales.ts` (+ `.json`, generated), `cms/migrations/index.ts` (generated entry)
- Modify: `cms/payload-types.ts` (regenerated)

**Interfaces:**
- Payload `localization.locales`: the seven codes with native labels from Task 1, `ar` with `rtl: true`; `defaultLocale: "en"`, `fallback: true` (so French pages show English design names until translated).

- [ ] **Step 1:** Update `payload.config.ts`. Import the locale list from `lib/i18n/config.ts` so the two never drift.
- [ ] **Step 2:** `pnpm payload migrate:create seven_locales` against the local database. Expected: a migration that adds the five values to the `_locales` enum. Read it: it must not drop or rewrite any table.
- [ ] **Step 3:** `pnpm payload migrate` locally, then `pnpm generate:types`; `pnpm exec tsc --noEmit` passes.
- [ ] **Step 4:** In the admin, open a design: the locale picker shows seven languages; English and Arabic values are intact.
- [ ] **Step 5: Commit** — `git commit -m "Add the five new languages to Payload's content locales"`

---

### Task 8: Browser verification and staging

- [ ] **Step 1:** `preview_start {name: "dev"}`. Check, in order: `/` → `/en`; `/collection` with an Arabic browser language → `/ar/collection`, page is RTL; switch language on a product page → same product in the other language, query kept; `/fr/faq` → `/en/faq`; with `ALL_LOCALES=1` in `.env` and a restart, `/fr/faq` shows English text with `lang="fr"`; add to bag and reach Stripe Checkout, cancel → back on `/ar/cart`; sign-in redirect lands in the right language; `/atelier`, `/print/orders/:id` (signed in), `/media/…`, `/robots.txt`, `/sitemap.xml` (contains `/en/` and `/ar/` URLs with alternates) all work. View source on a page: `<link rel="alternate" hreflang="ar">` and `x-default` present. No console errors.
- [ ] **Step 2:** `pnpm lint && pnpm exec vitest run && pnpm exec tsc --noEmit`, all PASS.
- [ ] **Step 3:** Ask the owner before pushing. With their OK: push, deploy staging (never while production builds), then repeat Step 1's redirect, RTL, cart-cancel and admin checks on `https://staging.darrida.net`. The staging migration runs on container start; confirm in the container logs that `seven_locales` applied.
