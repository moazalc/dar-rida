# Foundation A: Design System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Lock the Dar Rida design system in code: contrast-safe tokens, type and motion scales, a reusable component set, and a private `/styleguide` page that shows every token and component in every state, LTR and RTL.

**Architecture:** Tokens live in `app/(frontend)/globals.css` (Tailwind v4 `@theme`), checked by a unit test that computes WCAG contrast from the CSS file itself. Components live in `components/ui/` (primitives, on Base UI where a behaviour is needed) and `components/commerce/` (shop-specific, presentational only). Component tests render to static HTML with `react-dom/server` in the existing node Vitest setup, so no new test dependencies. The style guide is an admin-only page under the shop layout.

**Tech Stack:** Next 16.4 (App Router), React 19.3, Tailwind 4, Base UI 1.9, class-variance-authority, Vitest 5, Payload 3.93 (admin auth only).

**Spec:** `docs/superpowers/specs/2026-11-23-redesign-blueprint-design.md` (sections 3, 4, 9-Phase 1).

**Companion plan:** `docs/superpowers/plans/2026-11-23-foundation-locale-routing.md` (language in the URL). Independent of this one; either can land first.

## Global Constraints

- Light theme only. No dark-mode tokens.
- Palette (spec 3.2): ivory #f7f2e9, card #fbf8f2, linen #e6dccb, espresso #1a1715, charcoal #24211f, taupe **#6b645c**, champagne #c7b49a (decorative lines only), gold #9a7f57 (never text), gold-soft #dcc69d, destructive #9b2c2c, line-strong **#857a6e** (input borders; ≥3:1 on ivory, card and linen).
- Contrast: text ≥ 4.5:1, UI edges and large text ≥ 3:1 (WCAG 2.2 AA).
- Focus ring: 2 px solid charcoal, 2 px offset; on dark grounds (`data-ground="dark"`) 2 px solid ivory.
- Touch targets ≥ 44 px (`h-11`).
- Radius 6 px (`--radius: 0.375rem`) on controls; images square.
- Spacing on Tailwind's 4 px base; no custom spacing scale.
- Type scale (fluid, mobile→desktop px): display 40→72, h1 32→48, h2 26→36, h3 20→24, body 16→17, small 14, caption 12.
- Arabic: no letter-spacing, no italic (existing CSS rules stay), line-height +10%.
- Motion: CSS only in this phase, 200–600 ms ease-out; `prefers-reduced-motion: reduce` removes all animation and transition.
- Every font used must cover Latin Extended and Cyrillic (Latin faces) or Arabic (Arabic faces).
- Copy rule: plain words, active voice; button labels say what happens.
- Local checks before every commit: `pnpm lint`, `pnpm exec vitest run`, `pnpm exec tsc --noEmit`.

## Review Focus

1. **Long labels.** A German or Russian label twice the English length in a Button or Badge must wrap to two lines, never clip or overflow. → Task 3 test `button wraps long labels` (asserts no `whitespace-nowrap`/`truncate` class).
2. **RTL.** Icons that point (arrows, chevrons) and spacing must mirror under `dir="rtl"`; components must use logical properties (`ps-`, `me-`, `start-`), never `pl-`/`mr-`/`left-`. → Task 3 test `no physical direction classes` scanning `components/ui` and `components/commerce` sources.
3. **Keyboard focus on dark sections.** A charcoal ring vanishes on espresso. → Task 1 test asserts the `data-ground="dark"` focus rule exists and ivory/espresso ≥ 3:1.
4. **Errors reach screen readers.** A Field with an error must link it with `aria-describedby` and set `aria-invalid`. → Task 4 test `field error is described and invalid`.
5. **Price in a market without a price.** Price given `null` must render the "not available" text, not "$0". → Task 5 test `price null shows unavailable`.

---

### Task 1: Tokens, contrast fixes, focus and motion rules

**Files:**
- Create: `lib/contrast.ts`
- Modify: `app/(frontend)/globals.css`
- Test: `tests/tokens.test.ts`

**Interfaces:**
- Produces: `contrastRatio(foreground: string, background: string): number` (hex `#rrggbb` in, ratio rounded to 2 decimals out), used by Task 6's style guide to print live ratios. `readCssColors(css: string): Record<string, string>` returns every `--name: #rrggbb` declaration in the file (name without `--`).
- Produces Tailwind utilities later tasks use: `text-display`, `text-h1`, `text-h2`, `text-h3`, `text-body`, `text-small`, `text-caption`; colour `line-strong` (`border-line-strong`); `ease-soft`; `duration-fast` (200ms), `duration-slow` (600ms).

- [ ] **Step 1: Write the failing test** `tests/tokens.test.ts`

```ts
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { contrastRatio, readCssColors } from "@/lib/contrast";

const css = readFileSync("app/(frontend)/globals.css", "utf8");
const c = readCssColors(css);

describe("design tokens", () => {
  it("computes WCAG contrast", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBe(21);
    expect(contrastRatio("#24211f", "#f7f2e9")).toBeCloseTo(14.35, 1);
  });
  it("uses the spec values", () => {
    expect(c.taupe).toBe("#6b645c");
    expect(c["line-strong"]).toBe("#857a6e");
  });
  it.each([
    ["charcoal", "ivory", 4.5], ["taupe", "ivory", 4.5], ["taupe", "card", 4.5],
    ["destructive", "ivory", 4.5], ["ivory", "espresso", 4.5], ["gold-soft", "espresso", 4.5],
    ["line-strong", "ivory", 3], ["line-strong", "card", 3], ["line-strong", "linen", 3],
  ])("%s on %s ≥ %s:1", (fg, bg, min) => {
    expect(contrastRatio(c[fg], c[bg])).toBeGreaterThanOrEqual(min);
  });
  it("has a focus rule for dark grounds and a reduced-motion rule", () => {
    expect(css).toMatch(/\[data-ground="dark"\][^{]*:focus-visible/);
    expect(css).toMatch(/prefers-reduced-motion:\s*reduce[\s\S]*transition-duration/);
  });
});
```

- [ ] **Step 2: Run it, expect FAIL** (`Cannot find module '@/lib/contrast'`)

Run: `pnpm exec vitest run tests/tokens.test.ts`

- [ ] **Step 3: Implement `lib/contrast.ts`** — WCAG 2.x relative luminance (sRGB channel ≤ 0.03928 → /12.92, else ((v+0.055)/1.055)^2.4; L = 0.2126R + 0.7152G + 0.0722B), ratio = (Lmax+0.05)/(Lmin+0.05), `Math.round(x*100)/100`. `readCssColors` = regex `/--([a-z0-9-]+):\s*(#[0-9a-fA-F]{6})\b/g`, lowercase values; later declarations overwrite earlier.

- [ ] **Step 4: Update `globals.css`**
  - `:root`: `--taupe: #6b645c`; add `--line-strong: #857a6e`; `--input: var(--line-strong)`; `--ring: var(--charcoal)`; add `--destructive` stays `#9b2c2c` but must be a literal hex (not a var) so the test can read it.
  - `@theme inline`: `--color-line-strong: var(--line-strong)`.
  - `@theme`: type scale with paired line-heights — `--text-display: clamp(2.5rem, 1.75rem + 3.2vw, 4.5rem)` / `--text-display--line-height: 1.02`; `--text-h1: clamp(2rem, 1.6rem + 1.6vw, 3rem)` / `1.08`; `--text-h2: clamp(1.625rem, 1.35rem + 1.1vw, 2.25rem)` / `1.15`; `--text-h3: clamp(1.25rem, 1.15rem + 0.4vw, 1.5rem)` / `1.25`; `--text-body: clamp(1rem, 0.97rem + 0.1vw, 1.0625rem)` / `1.6`; `--text-small: 0.875rem` / `1.5`; `--text-caption: 0.75rem` / `1.4`. Motion: `--ease-soft: cubic-bezier(0.22, 1, 0.36, 1)`; durations as plain custom properties `--duration-fast: 200ms`, `--duration-slow: 600ms` plus `@utility duration-fast`/`duration-slow` setting `transition-duration`.
  - `@layer base`: `:focus-visible { outline: 2px solid var(--charcoal); outline-offset: 2px; }` and `[data-ground="dark"] :focus-visible { outline-color: var(--ivory); }`; `body:lang(ar) { line-height: 1.76; }`.
  - Unlayered: `@media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; scroll-behavior: auto !important; } }`. Keep the existing builder-frame reduced-motion block.

- [ ] **Step 5: Run the test, expect PASS**; then `pnpm lint && pnpm exec tsc --noEmit`.

- [ ] **Step 6: Commit** — `git add lib/contrast.ts tests/tokens.test.ts "app/(frontend)/globals.css" && git commit -m "Fix token contrast, add type and motion scales and focus rules"`

---

### Task 2: Font subsets and the comparison pairings

**Files:**
- Modify: `lib/fonts.ts`
- Create: `app/(frontend)/styleguide/candidate-fonts.ts`
- Test: `tests/fonts.test.ts`

**Interfaces:**
- Produces: `fontPairings: FontPairing[]` from `candidate-fonts.ts`, where `type FontPairing = { id: "current" | "playfair" | "noto"; label: string; style: React.CSSProperties /* sets --font-display and --font-body */ }`. Consumed by Task 6.
- Produces: `fontSubsets: Record<string, string[]>` exported from `lib/fonts.ts` (family → subsets requested) so the test can check coverage without running next/font.

- [ ] **Step 1: Write the failing test** `tests/fonts.test.ts` — import `fontSubsets` from `@/lib/fonts` (mock `next/font/google` with `vi.mock` returning `{ style: { fontFamily: "'X', fallback" } }` per call). Assert `fontSubsets["Cormorant Garamond"]` and `fontSubsets["Jost"]` each contain `"latin-ext"` and `"cyrillic"`; `fontSubsets["El Messiri"]` and `fontSubsets["Almarai"]` contain `"arabic"`.

- [ ] **Step 2: Run, expect FAIL** (`fontSubsets` undefined).

- [ ] **Step 3: Implement** — in `lib/fonts.ts` declare the subsets once in `fontSubsets`, pass `fontSubsets[family]` into each loader (Cormorant and Jost: `["latin", "latin-ext", "cyrillic"]`; El Messiri, Almarai: `["arabic"]`). In `candidate-fonts.ts` (no `"server-only"`, imported only by the style guide page) load: Playfair Display (400/500, latin+latin-ext+cyrillic), Noto Serif Display (400/500, same), Manrope (400/500, same), IBM Plex Sans Arabic (400/500, arabic), Noto Kufi Arabic (400/500, arabic). Pairings: `current` = Cormorant+Jost / El Messiri+Almarai; `playfair` = Playfair+Manrope / El Messiri+IBM Plex Sans Arabic; `noto` = Noto Serif Display+Manrope / Noto Kufi Arabic+IBM Plex Sans Arabic. Build each `style` with the same `fontStack` approach as `lib/fonts.ts` (export `fontStack` from there and reuse it).

- [ ] **Step 4: Run test, expect PASS**; `pnpm exec tsc --noEmit`.

- [ ] **Step 5: Commit** — `git commit -m "Load Latin Extended and Cyrillic, add font pairings to compare"`

---

### Task 3: Button and the component test harness

**Files:**
- Modify: `vitest.config.mts`, `components/ui/button.tsx`, `components/status-page.tsx`, `components/ui/sheet.tsx` (only if it uses a removed variant/size)
- Create: `tests/render.tsx`
- Test: `tests/components/button.test.tsx`, `tests/components/logical-props.test.ts`

**Interfaces:**
- Produces: `render(node: React.ReactElement): string` in `tests/render.tsx` (wraps `renderToStaticMarkup`), used by every later component test.
- Produces: `Button` props `variant?: "primary" | "secondary" | "quiet"` (default `"primary"`), `size?: "md" | "lg" | "icon"` (default `"md"`), `loading?: boolean`, `loadingLabel?: string` (required when `loading` is used; sr-only text), plus all Base UI Button props. `buttonVariants({ variant, size })` stays exported for links styled as buttons.

- [ ] **Step 1: Test harness** — `vitest.config.mts`: `include: ["tests/**/*.test.{ts,tsx}"]`, `esbuild: { jsx: "automatic" }`. Create `tests/render.tsx`.

- [ ] **Step 2: Write failing tests** `tests/components/button.test.tsx`:
  - `primary is charcoal on ivory and 44px tall`: html contains `bg-primary` and `h-11`.
  - `loading disables and announces`: `render(<Button loading loadingLabel="Adding to bag">Add to bag</Button>)` contains `aria-busy="true"`, `disabled`, and `Adding to bag` inside an element with `sr-only`.
  - `button wraps long labels`: html for `<Button>Zur Einkaufstasche hinzufügen und weiter</Button>` does not contain `whitespace-nowrap` or `truncate`.
  - `secondary uses the strong line`: contains `border-line-strong`.

  `tests/components/logical-props.test.ts`: read every `.tsx` under `components/ui` and `components/commerce` (skip if the folder doesn't exist yet), assert none match `/\b(pl|pr|ml|mr|left|right)-[\w[]/` and none contain `text-left`/`text-right`.

- [ ] **Step 3: Run, expect FAIL.**

- [ ] **Step 4: Rewrite `components/ui/button.tsx`** — base: `inline-flex items-center justify-center gap-2 rounded-md text-small font-medium tracking-[0.04em] transition-colors duration-fast ease-soft disabled:pointer-events-none disabled:opacity-50 text-center`; variants: primary `bg-primary text-primary-foreground hover:bg-primary/90`, secondary `border border-line-strong bg-transparent hover:bg-muted`, quiet `underline underline-offset-4 decoration-champagne hover:decoration-current h-auto px-0`; sizes: md `min-h-11 px-6 py-2`, lg `min-h-12 px-8 py-3 text-body`, icon `size-11`. `loading` → `disabled`, `aria-busy`, a small CSS spinner span (`animate-spin`, `aria-hidden`) and `<span className="sr-only">{loadingLabel}</span>`. Use `min-h-*` + vertical padding (not fixed `h-*`) so long labels wrap. Drop the old shadcn `dark:` classes. Update `components/status-page.tsx` to `buttonVariants({ variant: "primary", size: "lg" })` / `"secondary"`; fix any `sheet.tsx` reference.

- [ ] **Step 5: Run tests, expect PASS**; lint + tsc.

- [ ] **Step 6: Commit** — `git commit -m "Rebuild Button with loading state, 44px targets and wrapping labels"`

---

### Task 4: Form primitives

**Files:**
- Create: `components/ui/field.tsx`, `components/ui/input.tsx`, `components/ui/textarea.tsx`, `components/ui/select.tsx`, `components/ui/checkbox.tsx`, `components/ui/radio.tsx`
- Test: `tests/components/field.test.tsx`

**Interfaces:**
- Produces: `Field({ label, hint?, error?, children, id? })` — `children` is a render function `(control: { id: string; "aria-describedby"?: string; "aria-invalid"?: true }) => ReactNode`, so any control gets wired. Ids from `useId()` unless `id` given; hint id `${id}-hint`, error id `${id}-error`; error rendered with `role="alert"` in `text-destructive`.
- Produces: `Input`, `Textarea` (forward native props; `min-h-11`, `border-line-strong`, `rounded-md`, `bg-card`, `aria-invalid:border-destructive`), `Select` (styled native `<select>`, chevron positioned with `end-3`), `Checkbox` and `Radio` (native inputs, 20 px box inside a ≥44 px label row, `accent-[var(--charcoal)]`).

- [ ] **Step 1: Write failing tests:**
  - `field links label, hint and control`: `render(<Field label="Bust" hint="Around the fullest part" id="bust">{(p) => <Input {...p} />}</Field>)` contains `for="bust"`, `id="bust"`, `aria-describedby="bust-hint"`.
  - `field error is described and invalid`: with `error="Enter a number between 76 and 140"` contains `aria-invalid="true"`, `aria-describedby="bust-hint bust-error"`, `role="alert"`.
  - `checkbox row is a 44px target`: `render(<Checkbox label="This is a gift" />)` contains `min-h-11`.

- [ ] **Step 2: Run, expect FAIL.**  - [ ] **Step 3: Implement the six files.**  - [ ] **Step 4: Run, expect PASS** (plus the logical-props test).

- [ ] **Step 5: Commit** — `git commit -m "Add Field, Input, Textarea, Select, Checkbox and Radio"`

---

### Task 5: Feedback, layout and commerce primitives

**Files:**
- Create: `components/ui/badge.tsx`, `components/ui/skeleton.tsx`, `components/ui/divider.tsx`, `components/ui/empty-state.tsx`, `components/commerce/price.tsx`, `components/commerce/trust-bar.tsx`, `components/commerce/market-note.tsx`, `components/commerce/rating.tsx`
- Modify: `lib/i18n/dictionaries/en.ts`, `lib/i18n/dictionaries/ar.ts` (new keys below)
- Test: `tests/components/commerce.test.tsx`

**Interfaces:**
- Consumes: `formatMoney(minor: number, currency: Currency)` and `MarketId` from `lib/markets.ts`.
- Produces:
  - `Badge({ tone?: "neutral" | "gold" | "success" | "danger", children })` — `text-caption uppercase tracking-[0.14em]`, wraps.
  - `Skeleton({ className })` — `animate-pulse bg-muted`, `aria-hidden`.
  - `Divider({ ornament?: boolean })` — champagne hairline; ornament = small gold diamond centred.
  - `EmptyState({ title, body?, action?: ReactNode })`.
  - `Price({ minor: number | null, currency: Currency, market: MarketId, labels: { included: string; includedGlobal: string; unavailable: string; tabby?: string } , showTabby?: boolean })` — renders `<bdi>` amount; under it `labels.includedGlobal` when `market === "global"`, else `labels.included`; `minor === null` → `labels.unavailable` only; `showTabby && market === "uae" && labels.tabby` → tabby line with `{amount}` replaced by `formatMoney(Math.ceil(minor / 4), currency)`.
  - `TrustBar({ items: string[] })` — one line, items separated by a gold dot, horizontally scrollable on phones (`overflow-x-auto`, no wrap), `role="list"`.
  - `trustItems(market: MarketId, dict: Dictionary): string[]` exported from `trust-bar.tsx` — UAE: madeInDubai, everythingIncluded, bookFitting; Libya: madeInDubai, everythingIncluded, whatsappHelp; Global: madeInDubai, deliveredWorldwide, whatsappHelp. (Libya is a market id added by the locale/market phase; until `MarketId` includes `"libya"`, type the parameter as `MarketId | "libya"`.)
  - `MarketNote({ countryName, onChange, onDismiss, labels: { question: string; change: string; dismiss: string } })` — client component, `role="region"` with `aria-label`, two buttons.
  - `Rating({ value: number /* 0–5, halves allowed */, label: string })` — five stars, `role="img"` with `aria-label={label}`.
- Dictionary keys (en / ar), under a new `price` and `trust` group:
  - `price.included`: "Everything included" / "شامل كل شيء"
  - `price.includedGlobal`: "Shipping, duties and taxes included" / "شامل الشحن والرسوم والضرائب"
  - `price.unavailable`: "Not available in your country" / "غير متوفر في بلدك"
  - `price.tabby`: "or 4 payments of {amount}" / "أو 4 دفعات بقيمة {amount}"
  - `trust.madeInDubai`: "Made to measure in Dubai" / "تُفصَّل على مقاسك في دبي"
  - `trust.everythingIncluded`: "Everything included" / "شامل كل شيء"
  - `trust.deliveredWorldwide`: "Delivered worldwide, duties included" / "توصيل لكل العالم، شامل الرسوم"
  - `trust.bookFitting`: "Book a fitting" / "احجزي موعد قياس"
  - `trust.whatsappHelp`: "Help on WhatsApp" / "مساعدة عبر واتساب"
  - `market.question`: "Shipping to {country}?" / "الشحن إلى {country}؟"; `market.change`: "Change" / "تغيير"; `market.dismiss`: "Yes, continue" / "نعم، متابعة"

- [ ] **Step 1: Write failing tests** `tests/components/commerce.test.tsx`:
  - `price shows everything included in the UAE`: `Price minor={290000} currency="aed" market="uae"` → contains `AED 2,900` and `Everything included`.
  - `price shows duties line for global`: market global → `Shipping, duties and taxes included`.
  - `price null shows unavailable`: contains `Not available in your country`, does not contain `$0`.
  - `tabby line only in the UAE`: `showTabby` with uae → `or 4 payments of AED 725`; with global → no `4 payments`.
  - `trust items per market`: `trustItems("uae", en)` equals `["Made to measure in Dubai","Everything included","Book a fitting"]`; `trustItems("global", en)[1]` is `"Delivered worldwide, duties included"`.
  - `rating has a text alternative`: `Rating value={4.5} label="4.5 out of 5"` contains `role="img"` and `aria-label="4.5 out of 5"`.

- [ ] **Step 2: Run, expect FAIL.**  - [ ] **Step 3: Implement files and dictionary keys** (the `Dictionary` type comes from `en.ts`, so `ar.ts` fails tsc until it has the same keys).  - [ ] **Step 4: Run tests, lint, tsc; expect PASS.**

- [ ] **Step 5: Commit** — `git commit -m "Add Badge, Skeleton, Divider, EmptyState, Price, TrustBar, MarketNote and Rating"`

---

### Task 6: Overlay primitives

**Files:**
- Create: `components/ui/dialog.tsx`, `components/ui/tabs.tsx`, `components/ui/toast.tsx`
- Modify: `components/ui/sheet.tsx` (restyle as the Drawer: ivory ground, `border-line-strong`, close button = `Button variant="quiet" size="icon"` with a translated `aria-label` prop), `components/accordion.tsx` (title uses `text-caption`, logical props only)
- Test: `tests/components/overlays.test.tsx`

**Interfaces:**
- Produces: `Dialog`, `DialogTrigger`, `DialogContent({ title, description?, closeLabel, children })`, built on `@base-ui/react/dialog` the same way `sheet.tsx` is; `Tabs`, `TabsList`, `TabsTrigger`, `TabsPanel` on `@base-ui/react/tabs`; `ToastProvider` + `useToast(): { show(message: string): void }` on `@base-ui/react/toast` (polite live region, auto-dismiss 5 s, no motion under reduced motion via Task 1's global rule).

- [ ] **Step 1: Failing tests** — render `<Tabs defaultValue="cm"><TabsList><TabsTrigger value="cm">cm</TabsTrigger><TabsTrigger value="in">in</TabsTrigger></TabsList></Tabs>` → contains `role="tablist"` and `aria-selected="true"`; render `DialogContent` inside an open `Dialog` (`defaultOpen`) → contains `role="dialog"` and the `closeLabel` as `aria-label`. If Base UI does not render portals during static rendering, assert on the trigger markup instead (`aria-haspopup="dialog"`) and note it in the test name.
- [ ] **Step 2: Run, expect FAIL.**  - [ ] **Step 3: Implement.**  - [ ] **Step 4: Run, expect PASS.**
- [ ] **Step 5: Commit** — `git commit -m "Add Dialog, Tabs and Toast; restyle Drawer and Accordion"`

---

### Task 7: The private style guide page

**Files:**
- Create: `app/(frontend)/styleguide/page.tsx`, `app/(frontend)/styleguide/sections.tsx` (client: the LTR/RTL toggle and the font-pairing switcher), `lib/admin-session.ts`
- Modify: `app/(print)/print-access.ts` (reuse the new helper), `app/robots.ts` (disallow `/styleguide`)
- Test: `tests/admin-session.test.ts`

**Interfaces:**
- Consumes: `contrastRatio`, `readCssColors` (Task 1), `fontPairings` (Task 2), every component from Tasks 3–6, `trustItems`.
- Produces: `adminUser(): Promise<{ id: number | string } | null>` in `lib/admin-session.ts` — the signed-in Payload admin (`collection === "users"`), else null; `printContext()` calls it.

- [ ] **Step 1: Failing test** `tests/admin-session.test.ts` — mock `@/lib/payload` so `payloadClient().auth()` returns `{ user: { id: 1, collection: "customers" } }` → `adminUser()` resolves `null`; returns `{ id: 2, collection: "users" }` → resolves that user; `auth` rejects → `null`. (Mock `next/headers` `headers()` to return `new Headers()`.)
- [ ] **Step 2: Run, expect FAIL.**  - [ ] **Step 3: Implement `adminUser`, switch `printContext` to it, run, expect PASS.**

- [ ] **Step 4: Build the page.** `page.tsx`: `if (!(await adminUser())) notFound();` `export const metadata = { robots: { index: false, follow: false }, title: "Style guide" }`. Read `globals.css` with `fs` at request time for live swatches. Sections, in order, each with an `id` for in-page links:
  1. Colour — every token swatch, hex, and its ratio on ivory (and on espresso for light tokens), marked pass/fail against 4.5 (text) or 3 (lines).
  2. Type — every scale step in English, Arabic (`lang="ar" dir="rtl"`), Russian and Turkish sample lines; then the font pairing switcher (3 pairings from Task 2, applied to a sample block via the pairing's `style`).
  3. Spacing and radius — the 10 spacing steps as bars; radius sample.
  4. Buttons — 3 variants × (default, disabled, loading) × (md, lg), plus a German long-label example.
  5. Fields — Input/Select/Textarea/Checkbox/Radio in default, with hint, with error.
  6. Feedback — Badges (4 tones), Skeleton, Divider (plain, ornament), EmptyState, Toast trigger, Dialog, Drawer, Tabs, Accordion.
  7. Commerce — Price for UAE (with Tabby), Libya, Global, and unavailable; TrustBar for all three markets; MarketNote; Rating.
  8. Dark ground — a `data-ground="dark"` espresso block with a primary button and a link to check the ivory focus ring.
  The client `sections.tsx` provides a sticky toggle that flips `dir` on the preview container between `ltr` and `rtl` (sections 4–7), so every component can be checked mirrored.

- [ ] **Step 5: Verify in the browser.** `preview_start {name: "dev"}`, sign in at `/atelier`, open `/styleguide`. Check: no console errors; signed out (new private window or after logout) → 404; Tab through sections 4–8 — every control shows a ring, ivory on the dark block; RTL toggle mirrors spacing and chevrons; at 375 px nothing scrolls sideways except the TrustBar; reduced motion (emulate) stops the spinner and pulse. Screenshot desktop + 375 px for the owner.

- [ ] **Step 6: Run** `pnpm lint && pnpm exec vitest run && pnpm exec tsc --noEmit`, **expect all PASS.**

- [ ] **Step 7: Commit** — `git commit -m "Add the private style guide page"`

---

### Task 8: Ship to staging

- [ ] **Step 1:** Ask the owner before pushing. With their OK: `git push`, then `ssh hetzner 'cd ~/projects/dar-rida-staging && git pull --ff-only && cd deploy && docker compose -f docker-compose.staging.yml up -d --build'` — never while production is building.
- [ ] **Step 2:** Open `https://staging.darrida.net/styleguide` signed in to `/atelier`; confirm it renders and the shop pages still look as before apart from taupe text, input borders and focus rings.
- [ ] **Step 3:** Send the owner the screenshots and the font-pairing section for a pick. The chosen pairing becomes the default in `lib/fonts.ts` in Phase 2.

## Not in this plan (built in the phase that first uses them)

Header and footer redesign, product card, gallery, measurement panel and summary, bag line and summary, discount field, gift options, order timeline, wishlist heart, editorial block, step sequence, video hero. Each lands in its phase and is added to the style guide in the same change.
