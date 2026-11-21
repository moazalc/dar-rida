# Dar Rida QA checklist

Target: https://staging.darrida.net (behind the site password). Started 2026-11-21.
Out of scope for this pass, by the owner's choice: email OTP sign-in, Google sign-in, Stripe checkout and its webhook.

**How it was tested**
- **Code:** reviewed the routes in `app/(frontend)`, the Payload collections and globals, the Server Actions, the endpoints and `proxy.ts`.
- **Server:** a crawl from inside `dar-rida-staging` fetched every linked page in English and Arabic, plus edge-case URLs and the public API.
- **Browser:** the built-in browser at 375px and desktop, in EN and AR. The pane can't answer the site-password prompt, so it went through a local tunnel that adds the password header (the value was never printed).
- **Local checks:** `pnpm lint` passes. `npx vitest run` passes (80 tests). `tsc --noEmit` fails on stale files in `.next/types` (F-15).

Status key: ✅ passed · ❌ finding (see the findings table) · ⏳ not tested yet · ⛔ out of scope or blocked

## Checklist

### Homepage
| Check | Status |
|---|---|
| Loads in EN and AR (200, one h1, correct `lang`/`dir`) | ✅ |
| Page title and description translated | ❌ F-05 |
| Hero video plays muted inline (2.5 MB), poster shows, reduced motion respected | ✅ |
| Paths, Rida collection carousel, invitation, detail and how-it-works sections render; no broken images | ✅ |
| Header becomes solid after the hero on scroll | ✅ |

### Collection and product pages
| Check | Status |
|---|---|
| /collection lists the active designs in sort order | ✅ |
| Each product page loads in EN and AR, with an h1 and Product JSON-LD | ✅ |
| Unknown or invalid slug gives a 404 | ✅ (title turns English after load, F-06) |
| Gallery shows the line drawing when there are no photos | ✅ (no photos uploaded, F-11) |
| Measurements panel: step-by-step and all-at-once, Save stays off until complete, in/cm conversion with review | ✅ / ❌ F-17 |
| Add to bag: disabled until complete, success message, badge updates, HTML in notes shown as text | ✅ |
| Server re-checks slug, measurements and notes (Server Action) | ✅ code review |
| "Complete the look" shows up to 4 other pieces | ✅ |
| UAE visitor can buy (an AED price exists) | ❌ F-10 |
| 2D builder / Design your own | ⛔ shown as "Coming soon", and /design is a 404 on purpose |
| Fabric and size choices | ⛔ there are none on collection designs; they belong to the future builder |

### Search
| Check | Status |
|---|---|
| Plain GET form, works without JS, marked noindex | ✅ |
| Matches code, name, description and cut in both languages | ✅ |
| Script tags in the query are escaped | ✅ |
| Empty and no-result states | ✅ |

### Bag
| Check | Status |
|---|---|
| Empty state | ✅ |
| Lines show the drawing, measurements, notes and price; quantity +/- works | ✅ / ❌ F-18, F-20 |
| Quantity limits (1–10, 0 removes, at most 20 lines) enforced on the server | ✅ code review |
| Bag cookie is httpOnly, sameSite=lax, secure | ✅ code review |
| Country switch reprices the bag (AED for UAE, USD elsewhere) | ✅ / ❌ F-10, F-19 |
| Shipping fee and free-over threshold | ❌ F-09 |
| Checkout button | ⛔ Stripe is out of scope (no `STRIPE_SECRET_KEY` on staging, so it shows an error) |

### Checkout (Stripe test mode)
⛔ Out of scope for this pass. The code review found no issues: prices are recomputed on the server, there is one open session per bag, and the order is marked paid only by the webhook.

### Customer account
| Check | Status |
|---|---|
| Signed-out visits to /account and /account/orders/* redirect to sign-in with `next` | ✅ |
| `next` cannot redirect to another site (`//evil.com`, `https://evil.com`) | ✅ |
| Account actions only change the signed-in customer's own record | ✅ code review |
| Order page is scoped to the signed-in customer's id or email, so one customer can't open another's order by number | ✅ code review |
| Profiles, addresses, details, order pages in the browser | ⛔ needs a sign-in, which is out of scope this pass |
| Email OTP, Google sign-in | ⛔ out of scope |

### Info pages
| Check | Status |
|---|---|
| privacy, terms, faq, shipping, returns, size-guide and fabrics load in EN and AR with title and description | ✅ |
| Our story | ❌ F-01 |
| Contact: channels and form | ❌ F-08 |
| FAQ JSON-LD | ✅ |

### Header and footer
| Check | Status |
|---|---|
| Every header and footer link resolves | ❌ F-01 |
| Newsletter sign-up | ❌ F-07 |
| Mobile menu opens and closes, on the correct side in RTL | ✅ / ❌ F-24 |
| Skip link | ✅ present / ⏳ keyboard check moves to the redesign pass |
| Bag count badge | ✅ |

### English and Arabic
| Check | Status |
|---|---|
| Dictionaries have identical keys, with nothing missing in AR | ✅ |
| `lang`/`dir` on every page | ✅ (except F-06, F-14) |
| Titles and descriptions translated | ❌ F-05 |
| RTL layout (bag, product, menu, sheet side, prices) | ✅ |

### Currency and units
| Check | Status |
|---|---|
| Country switcher sets the market (UAE → AED, other countries → USD) | ✅ |
| in/cm switch converts measurements | ✅ / ❌ F-17 |

### 404 and error pages
| Check | Status |
|---|---|
| Unknown URL → translated 404 with a 404 status | ✅ |
| 404 from inside a page (`notFound()`) | ✅ renders translated / ❌ F-06 title |
| /admin hidden behind a 404 | ✅ |
| Error boundary and global error | ✅ code review |

### Payload admin (ADMIN_PATH)
| Check | Status |
|---|---|
| Login works; lockout uses Payload's defaults (5 tries, then 10 min), not tested so the real account isn't locked | ✅ |
| Dashboard overview (orders to act on, sales, visitors) | ✅ (Umami not connected, known) |
| Design editor: fields, localized text, prices, making days | ✅ |
| Upload photos: alt text required; an SVG with a script is rejected, a plain SVG is accepted | ✅ / ❌ F-04 (low) |
| Orders list tabs, order page, measurements in/cm toggle, Start production (sets ready-by), Ship (validates courier and tracking, warns when the email fails), Resend buttons | ✅ with test order DR-QA1 / ❌ F-23, F-25 |
| Order emails | ⏳ partial: no email went out this pass (the SMTP relay rejects example.com addresses), so the rendered emails weren't looked at; their content is covered by `tests/emails.test.ts`. Staging sends real email, so a test with a real inbox would really be delivered |
| Deliver and Cancel steps | ⏳ Deliver is not clicked yet (DR-QA1 is Shipped). Cancel is only offered before shipping, and its code was reviewed |
| Export an order or orders to PDF or Excel for the tailor | ❌ F-16 (missing feature) |
| Store settings and shipping globals | ✅ screens / ❌ F-09, F-23 (empty data) |
| Customers | ⛔ the two staging customers came from sign-ins, which are out of scope |
| Public API is closed: orders, customers, users, carts and globals return 403 | ✅ |
| Public designs API shows only active designs | ✅ (leaks a field, F-12) |

### SEO basics
| Check | Status |
|---|---|
| Titles on every page | ✅ |
| Descriptions | ❌ F-05 |
| sitemap.xml, robots.txt | ❌ F-02 |
| `metadataBase`, Open Graph, `hreflang` | ❌ F-03 |
| noindex on search, bag, account and checkout | ✅ |

### Security
| Check | Status |
|---|---|
| Site password gate on every route except /media and the Stripe webhook | ✅ |
| Server Actions validate every input and never trust prices from the browser | ✅ |
| Open redirects | ✅ |
| Security headers (HSTS, frame-ancestors, nosniff, referrer policy), `x-powered-by` | ❌ F-13 |
| SVG uploads | ❌ F-04 (to confirm) |
| CSRF origins set for Payload | ✅ |
| Stripe webhook (the only public route): refuses every event while no secret is set, checks the signature against the raw body, and a replayed event can't mark an order paid twice | ✅ code review |

### Accessibility basics
| Check | Status |
|---|---|
| One h1 per page, labelled forms, sr-only labels on icon buttons, skip link | ✅ |
| Keyboard path through the measurements panel and mobile menu | ⏳ moved to the redesign pass, since those components will change |
| Focus visible, contrast | ⏳ next pass (belongs with the redesign) |

### Layout (375px and desktop)
| Check | Status |
|---|---|
| 15 pages at 375px in AR: no horizontal scroll, no images without alt | ✅ |

## Findings

Severity: **High** blocks buying or exposes data · **Medium** a broken journey or a real gap · **Low** polish

| ID | Sev | Area | Finding | Steps to reproduce | Status |
|---|---|---|---|---|---|
| F-01 | Medium | Footer | The footer's "Our story" link goes to `/our-story`, and there is no such page, so it returns a 404 in both languages. | Footer → House → Our story | Open: add the page, or drop the link until there is copy |
| F-02 | Medium | SEO | No `sitemap.xml` and no `robots.txt`; both return a 404. | GET /sitemap.xml, /robots.txt | Fixed: `app/robots.ts` (disallow everything while the site password or COMING_SOON is on; open outside the password) and `app/sitemap.ts` (pages + active designs, behind the password until launch) · ✅ verified on staging (67ed522) |
| F-03 | Low | SEO | No `metadataBase`, so Open Graph image URLs are relative. No `hreflang` alternates (the language lives in a cookie, so EN and AR share one URL). | View source | Fixed: `metadataBase` from NEXT_PUBLIC_SITE_URL. hreflang left: needs a decision on language URLs · ✅ verified on staging (67ed522) |
| F-04 | Low | Admin / uploads | The media collection accepts `image/*`. Payload rejected an SVG that contained a script (tested), but it accepts plain SVGs, which next/image can't optimise. There's no per-file size cap besides nginx's 20 MB, and no resized versions. | Admin → Photos → upload an .svg | Fixed: uploads limited to jpeg/png/webp/avif. Image sizes left for the admin work · ✅ verified on staging (67ed522) |
| F-05 | Low | i18n / SEO | The root metadata is hard-coded English: the homepage title "Dar Rida" and the default description "Made-to-order abayas…" appear on the Arabic home, search, bag, sign-in and checkout pages. Product and account titles end in "— Dar Rida" in Arabic too. | Arabic → any of those pages, view `<title>`/description | Fixed: root metadata built from the dictionary (title, description, Open Graph); product and account titles use the localized brand name · ✅ verified on staging (67ed522) |
| F-06 | Low | 404 | `/collection/<unknown>` renders the translated 404 correctly, but once the page loads its title becomes "Dar Rida", from the root metadata. Fixed together with F-05. | AR → /collection/nope → tab title | Fixed with F-05 · ✅ verified on staging (67ed522) |
| F-07 | Medium | Footer | The newsletter form saves nothing. It only says "coming soon", and its code comment still talks about Shopify. | Footer → enter an email → submit | Needs a decision: wire it up (store in Payload, or use a mailing tool) or hide it |
| F-08 | High (for launch) | Contact | `lib/site.ts` has no email, WhatsApp or Instagram, so the Contact page lists no channels and its form is disabled. The form is also only a `mailto:` link, with no server behind it. | /contact | Partly fixed: contact email set to info@darrida.net (the address already on the coming-soon page), so the Contact page shows it and the form opens the email app. WhatsApp/Instagram and a server-side form need the owner · ✅ verified on staging (67ed522) |
| F-09 | Medium | Shipping (data) | The Shipping global is empty on staging (and so on production, which staging copies): no UAE fee, no zones, no rest-of-world fee. Every country therefore shows **free shipping**. | Bag → summary shows "Free" | Needs the owner's shipping prices in the admin |
| F-10 | High (data) | Pricing | No design has an AED price, and the custom-abaya AED price is empty, so a UAE visitor sees "not available here" on every piece. | Country = UAE → any product | Needs AED prices in the admin |
| F-11 | Medium (data) | Catalogue | No photos are uploaded (`media` is empty), so every product shows the line drawing. Composition, care, origin and lead time are empty too. | /collection | Needs content |
| F-12 | Low | API | The public `/api/designs` returns `makingDays`, which the admin describes as "for the team only". | GET /api/designs | Fixed: `makingDays` is readable only by admins · ✅ verified on staging (67ed522) |
| F-13 | Medium | Security | Checked through the public URL, so through nginx: there are no security headers (HSTS, X-Frame-Options or CSP `frame-ancestors`, X-Content-Type-Options, Referrer-Policy, Permissions-Policy). Browsers receive `X-Powered-By: Next.js, Payload` and `Server: nginx/1.24.0 (Ubuntu)`. The staging config's `X-Robots-Tag: noindex` doesn't arrive either: it sits only in the port-80 block, not the HTTPS block certbot added. The production domain is the same. | `curl -sI https://staging.darrida.net/` | Fixed in Next: HSTS, X-Frame-Options, CSP frame-ancestors, nosniff, Referrer-Policy, Permissions-Policy; `poweredByHeader: false`. Still needs nginx (sudo): `server_tokens off` and the staging X-Robots-Tag in the HTTPS block · ✅ verified on staging (67ed522) |
| F-14 | Low | Coming soon | `/coming-soon` is always `lang="en"` with no `dir`, even for Arabic visitors. It matters in production while COMING_SOON=1. | Arabic cookie → /coming-soon | No change needed: the page is bilingual, English with the Arabic line marked `lang="ar" dir="rtl"` |
| F-15 | Low | Tooling | `tsc --noEmit` fails on stale files in `.next/types` that point at a removed `/design` page. The source code itself type-checks. | `npx tsc --noEmit` | Fixed locally: stale `.next/types` removed (build output, not in git) |
| F-16 | Feature | Admin | Orders can't be exported. The owner wants one order with all its measurements as a PDF (and Excel) to take to the tailor, plus a list export. | Admin → Orders | Planned (admin part) |
| F-17 | Low | Measurements | Pick CM, press Convert, then close the panel without saving: the switch shows **CM** but the summary and the bag still use the inches values. | Product → enter measurements in inches → CM → Convert → × | Fixed: closing the panel without saving drops the unsaved edits, so the switch, summary and bag agree · ✅ verified on staging (67ed522) |
| F-18 | High (copy) | Copy | The copy still has unfilled placeholders: "Ships in **[X]** weeks" on the homepage and in the bag; "[X] weeks", "[X] days" and "the atelier in **[city]**" on Shipping, Returns and FAQ; the shipping table "[1–2] working days", "[Free]", "[AED X]"; and FAQ "We ship to **[countries]**". The product page meanwhile says "3–4 weeks" (from Store settings), so the site contradicts itself. | Bag summary; /shipping; /returns; /faq | Needs the owner's numbers (making weeks, alteration days, city, delivery times, countries). The shipping table should come from the Shipping settings, not hard-coded copy |
| F-19 | Low | Bag | When nothing in the bag can be bought in the chosen country, the summary still shows "Subtotal AED 0 · Shipping Free · Total AED 0". | Bag → switch to UAE | Fixed: subtotal and total show a dash and shipping is hidden while any piece can't be bought in that country · ✅ verified on staging (67ed522) |
| F-20 | Low | Accessibility | In the bag, the thumbnail link has no accessible name when the line shows the line drawing rather than a photo. | Bag with a design that has no photo | Fixed: the thumbnail link is named after the piece · ✅ verified on staging (67ed522) |
| F-21 | Low | Performance | `/media` files (hero video, poster, photos) reach the browser through nginx with `Cache-Control: public, max-age=0`, so returning visitors revalidate the 2.5 MB hero video every time. | `curl -sI https://staging.darrida.net/media/hero-poster.jpg` | Fixed: `/media/*` cached for a day (stale-while-revalidate a week) · ✅ verified on staging (67ed522) |
| F-23 | High (config) | Orders | "Send new-order emails to" in Store settings is empty on staging, and so on production. When a paid order arrives, **nobody at Dar Rida gets an email**. | Admin → Store settings | Partly fixed: the admin dashboard now warns while no recipients are set. The addresses themselves need the owner · ✅ verified on staging (67ed522) |
| F-24 | Low | Navigation | The mobile menu has only Collection, Design your abaya (soon) and How to measure. Account, Contact, FAQ and Shipping are reachable only from the footer. | 375px → ☰ | Decide during the redesign |
| F-25 | Low | Admin UX | On an order: a Save button although every field is read-only; unit prices shown in minor units ("40000" for $400); no internal team notes field; the "Tracking number" label is not tied to its input. | Admin → any order | Planned with the admin work (price display, Save button, team notes). The tracking label was a test-tool artefact: the inputs sit inside their labels |

## Test data left on staging
- DR-QA1 counts in the admin dashboard's sales figures ($800) until it's deleted.
- Order **DR-QA1** (id 1), inserted straight into the staging database with psql (not through checkout or the admin), for "QA Test Customer <qa-test@example.com>", now marked Shipped. Kept to build and test the order export. Delete it from the admin when it's no longer needed.
- A bag with one RIDA 01 line, from the browser test.
- A test SVG upload was deleted again.
