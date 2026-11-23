# Dar Rida redesign blueprint

Date: 23 Nov 2026. Status: draft for the owner's review.

This is the single reference for the redesign. Every page, component and flow
built from here on must match it. A change to the system is made here first,
then in code. Each build phase below gets its own implementation plan.

## 1. Intent

**Goal.** Anyone who lands on Dar Rida understands it in seconds: abayas made to
her measurements, what it costs (one price, everything included), how long it
takes, and what to do next. It must feel like a luxury house, not a template.

**Who.** Women in the UAE, Libya and worldwide buying a made-to-measure abaya
(around $800). Many shop on a phone, many in Arabic.

**Success looks like**
- A first-time visitor can say what Dar Rida is, and reach a product, within 10 seconds.
- Measuring and checkout are completed without contacting the house.
- Every page passes WCAG 2.2 AA (keyboard, focus, contrast, screen reader).
- No page is built without an entry in the page inventory (section 5).

**Decided (owner, 23 Nov 2026)**
- Direction: a blend. Quiet-luxury restraint for shopping pages (The Row, Khaite,
  Totême); couture-style storytelling of the making around them.
- Main reference: Chi-Ka (chikacollection.com, Dubai), the closest model:
  made-to-measure abayas, Dubai-based.
- Made to order only. No ready-made pieces, no stock.
- Three market views: UAE, Libya, Global.
- One price. The customer pays one figure that already includes shipping,
  duties and taxes. Nothing is added at checkout.
- Full payment upfront. No deposits.
- Languages: English, Arabic, French, Russian, Turkish, German, Spanish.
- Alterations policy: deferred. Pages keep a placeholder.
- Late orders: handled by hand, no automatic emails.
- LYD prices: entered by the owner per design, never converted.
- Discount codes: the owner controls them (market, designs, dates, limits).
- Reviews: asked for on delivery, owner approves each one.
- Review format for this work: published artifacts.

**Out of scope here:** ready-made pieces, the Libyan payment gateway, the 3D
builder itself (its "Coming soon" place stays), alterations rules, loyalty, AI
try-on, an About/atelier page (later).

## 2. What we take from the references

| From | Take | Avoid |
|---|---|---|
| Chi-Ka | Returns by how the piece was made; a trust bar (shipping, concierge); WhatsApp help; UAE home/hotel fitting; clear "how long it takes" | English only; contradictory size chart; measurements checked only by WhatsApp; conflicting delivery promises; undocumented alterations |
| The Row, Khaite, Totême | Space, large imagery, few words, quiet product pages, small type for UI | Hiding prices or key facts for the sake of minimalism |
| Couture houses (Elie Saab, Valentino) | One story told in sequence (fabric → cut → hand) | Heavy motion on shopping screens, slow pages |
| Ounass | Gulf currencies, Arabic quality, clear delivery dates | Marketplace density |
| Aesop | Calm, consistent components; helpful copy | — |

## 3. Design system

### 3.1 Principles
1. **Say it plainly.** Every screen answers: what is this, what does it cost, how long, what next.
2. **One action per screen.** One primary button; everything else is secondary or a link.
3. **Quiet shopping, rich story.** Motion and storytelling live on Home and How it works. Shopping and checkout stay still and fast.
4. **Same in every language.** Layouts hold in Arabic (RTL), German (long words) and Russian (Cyrillic).
5. **Accessible by default.** Nothing ships that fails the checks in 3.9.

### 3.2 Colour
Keep the warm palette, refined for contrast.

| Token | Value | Use |
|---|---|---|
| ivory | #f7f2e9 | Page ground |
| card | #fbf8f2 | Raised surfaces |
| linen | #e6dccb | Alternate section ground |
| espresso | #1a1715 | Dark sections, footer |
| charcoal | #24211f | Text, primary button (14.4:1 on ivory) |
| taupe | **#6b645c** (was #766f67, 4.44:1, fails small text) | Secondary text on ivory (5.2:1) |
| champagne | #c7b49a | Decorative lines only (1.8:1). Never input borders or text |
| line-strong | #8f857a or darker, checked to 3:1 | Input borders, focus-adjacent edges |
| gold | #9a7f57 | Measuring lines, ornament. Never text (3.4:1) |
| gold-soft | #dcc69d | Gold on espresso (10.7:1) |
| destructive | #9b2c2c | Errors |

Rules: secondary text on linen uses charcoal (taupe on linen is 3.65:1). One
ground colour per section. Light theme only.

### 3.3 Typography
Keep Cormorant Garamond + Jost (Latin, Cyrillic) and El Messiri + Almarai
(Arabic) as the default. The style guide shows 2–3 alternative pairings side by
side for the owner to compare. Every candidate must cover Latin Extended
(Turkish ğ ş ı) and Cyrillic (Russian); verify each font's subsets before use.

Candidates to compare: Playfair Display or Noto Serif Display (display),
Manrope (body), IBM Plex Sans Arabic or Noto Kufi Arabic (Arabic body).

Scale (fluid, mobile → desktop): display 40→72, h1 32→48, h2 26→36, h3 20→24,
body 16→17, small 14, caption 12 (uppercase only in Latin scripts, tracked).
Arabic: no letter-spacing, no italic (already enforced in CSS), line-height +10%.

### 3.4 Space, grid, shape
- Spacing on a 4 px base: 4, 8, 12, 16, 24, 32, 48, 64, 96, 128.
- Grid: 4 columns on mobile (16 px margin), 8 on tablet, 12 on desktop (max 1440, 48 px margin).
- Radius small (6 px) for inputs and buttons; images square-cornered.
- Section rhythm: 96–128 px between sections on desktop, 64 on mobile.

### 3.5 Imagery
- Photos: current photos and line drawings until the shoot is ready. Every image slot has a fixed aspect ratio (product 4:5, editorial 3:2, hero 16:9 desktop / 4:5 mobile) so new photos drop in without layout changes.
- The line drawings stay as a brand device (size guide, signature moment, emails).
- Brand assets (new logo, monogram, pattern) are coming; the system reserves places for a monogram in the header, footer, favicon and emails.

### 3.6 Motion
- Default: CSS fades and slow reveals (200–600 ms, ease-out).
- GSAP only in three places: the Home story, the How it works sequence, the signature moment.
- Never on collection, product purchase controls, bag, checkout or account.
- `prefers-reduced-motion` turns every animation off and shows the final state.

### 3.7 Signature moment: "Made for you"
When she saves her measurements, the abaya line drawing redraws to her
proportions with her name and numbers labelled, like a tailor's sheet. The same
drawing appears on her bag line, order page and confirmation email. Shown, not
told: the made-to-measure promise.

### 3.8 Components
Each component is built once, shown in the style guide with every state, and
works in LTR and RTL.

- **Foundations:** Button (primary, secondary, link; default, hover, focus, disabled, loading), Icon button, Input, Select, Checkbox, Radio, Textarea, Field (label, hint, error), Badge, Divider, Skeleton, Toast, Dialog, Drawer, Accordion, Tabs.
- **Commerce:** Price (market-aware, "everything included" note, optional "or 4 payments" line for Tabby in the UAE), Product card, Product gallery, Measurement panel, Measurement summary, Bag line, Bag summary, Discount code field, Gift options, Order timeline, Status badge, Review stars + review card, Wishlist heart.
- **Navigation:** Header (desktop, mobile drawer), Trust bar, Market + language picker, First-visit market note, Footer, Breadcrumb, Skip link.
- **Content:** Page intro, Editorial block (image + text), Step sequence (How it works), Hero (video with still poster), Info section, Empty state, Status page (404, error).

### 3.9 Accessibility
WCAG 2.2 AA: 4.5:1 text, 3:1 UI edges and large text, visible focus ring
(2 px charcoal + ivory offset) on every interactive element, full keyboard path
through the menu, measurement panel, bag and checkout, 44 px touch targets,
labels on every field, errors announced, images with alt text in the page's
language, video with no sound and a pause control.

### 3.10 Languages and direction
- Seven locales: en, ar, fr, ru, tr, de, es. Arabic is RTL; the rest LTR.
- The language moves into the web address (`/en/…`, `/ar/…`), replacing today's cookie. Old links redirect. Each page lists its other languages (hreflang).
- UI strings in dictionaries per locale; design content localized in Payload. A missing translation falls back to English, never to a blank.
- Prices and measurements are written with Western digits in every locale (as today).
- Layout test strings: the longest German label and the longest Arabic label for each button.

## 4. Market views

The shipping country picks the market (as today). Language is separate: each
market has a default language, and the visitor can change either.

| | UAE | Libya | Global |
|---|---|---|---|
| Currency shown | AED | LYD (owner's own prices) once switched on; USD until then | USD |
| Charged in | AED | USD (until the Libyan gateway exists) | USD |
| Default language | English | Arabic | English |
| Units | cm + inches | cm only | cm + inches |
| Price line | "Everything included" | "Everything included" | "Shipping, duties and taxes included" |
| Payment | Card, Apple Pay, Google Pay, Tabby (if approved) | Card, Apple Pay, Google Pay | Card, Apple Pay, Google Pay |
| Trust bar | Made to measure in Dubai · Everything included · Book a fitting | Made to measure in Dubai · Everything included · Help on WhatsApp | Made to measure in Dubai · Delivered worldwide, duties included · Help on WhatsApp |
| Appointments | WhatsApp check, video call, home/hotel fitting | WhatsApp check, video call | WhatsApp check, video call |
| Delivery promise | Per zone, from Shipping settings | Per zone | Per zone |

**One price.** Shipping and duties are inside each market's price. Bag and
checkout show no shipping or duty line, only "Included". The Shipping settings
keep delivery days per zone; the fee fields stop being charged to the customer.

**LYD.** A design shows LYD only when the owner has entered an LYD price. While
Libya still pays in USD, checkout states the USD amount being charged.

**First visit.** The market is detected from location, then a small note asks
"Shipping to the UAE? Change". Dismissed once, remembered.

## 5. Page inventory

Every page, its one job, its sections, and the states it must handle.
**New** = does not exist today.

| Page | Job | Sections | States |
|---|---|---|---|
| Home | Say what Dar Rida is and lead to the collection | Hero video, one-line promise, collection, How it works in 3 steps, the making (story, GSAP), reviews, appointments, trust | Video slow/failed (poster), reduced motion, no reviews yet (section hidden) |
| Collection | Show every design | Intro, grid (under 10 designs: large editorial cards, no filters), "Design your own: coming soon" tile | Design without a price in this market (hidden), empty collection |
| Product | Get her to a measured bag line | Gallery, name, price + "everything included", making time, measure (panel + signature moment), add to bag, wishlist, details (fabric, care, origin), reviews, complete the look | Not sold in her market, no photos (drawing), no reviews, measurements out of range, saved measurement sets (signed in) |
| How it works **New** | Explain made to measure | Steps: choose, measure, we make (2 weeks), delivered; what's included; help options | — |
| Size guide | Teach measuring | Figure, each measurement with how-to, units (cm only for Libya), accuracy note, help/appointments link | — |
| Fabrics | Show the cloth | Fabric cards with photo and composition | Missing photo |
| Appointments **New** | Book help | Three types (WhatsApp check, video call, UAE home/hotel fitting), request form (type, preferred times, contact, note) | Fitting hidden outside the UAE, WhatsApp hidden until the number exists, sent state |
| Search | Find a design | Field, results | No results (suggest the collection) |
| Wishlist **New** | Keep designs for later | Grid of saved designs | Empty, design removed or unavailable in market |
| Bag | Review before paying | Lines (design, measurement summary, signature drawing, gift options), discount code, total "everything included", checkout | Empty, line missing waist (re-measure), design removed, price changed, not buyable in this market, code invalid/expired |
| Checkout (Stripe) | Pay | Stripe Checkout, locked to the market's country | Cancelled (back to bag with a note), failed payment |
| Order confirmed | Reassure | Order number, signature drawing, what happens next with dates, change-measurements note, create-account prompt for guests | Payment still confirming (poll, then show) |
| Track order **New** | Guests see their order | Order number + email lookup, then the order page | Not found, wrong email |
| Account: overview | — | Orders, measurements, addresses, details, wishlist | Signed out (to sign in) |
| Account: order | Follow one order | Timeline, pieces, measurements (editable until production starts), address, help | Cancelled, shipped with tracking |
| Account: measurements | Saved sets | List, add, edit, delete, names (for herself or others) | Empty, sets missing waist |
| Account: addresses / details / sign in | — | As today, restyled | Code expired, Google error |
| Shipping | Delivery facts | Delivery days per zone, "everything included" | Days not set ("—") |
| Returns & alterations | Policy | Chi-Ka-style rules by how the piece was made; alterations: placeholder until decided | — |
| FAQ, Contact, Care guide **New**, Gifts **New** | Help | Contact shows only channels that exist | — |
| Privacy, Terms | Legal | As today, restyled | — |
| 404, Error, Coming soon | Recover | Message, links to collection and help | — |
| Style guide **New** (private) | Show the system | Every token and component, every state, LTR and RTL | — |

**Navigation.** Header: Collection · How it works · Size guide · Fabrics ·
Appointments; icons for search, wishlist, account, bag; market and language
picker. Footer: Help (Shipping, Returns & alterations, FAQ, Contact, Care
guide, Track order), Gifts, Account, Legal, monogram. Journal and About come later.

## 6. Flows

**F1 First visit.** Detect market → show the first-visit note → visitor confirms
or changes country/language → choice saved.

**F2 Buy.** Collection → product → measure (panel, or a saved set) → signature
moment → add to bag (optionally as a gift) → bag (optional code) → Stripe
Checkout (country locked, Apple/Google Pay, Tabby in the UAE if approved) →
order confirmed → confirmation email.

**F3 Change measurements after paying.** Order page (account or Track order) →
edit measurements → saved and the house is emailed. Allowed until the order is
moved to In production; after that the page shows "We have started cutting —
contact us".

**F4 Gift.** On the bag line: "This is a gift" → gift note, hide prices on the
packing slip, recipient name and address in the same country. The buyer
provides the measurements; if she doesn't know them, the panel links to
Appointments.

**F5 Appointment.** Appointments page or a help link → pick type → preferred
times + contact → request saved in the admin and emailed to the house → the
house confirms by hand (WhatsApp or email).

**F6 Order updates.** Email at confirmed and shipped (with tracking), as today.
WhatsApp copies of the same messages only if she ticked the consent box at
checkout and the WhatsApp Business number is live.

**F7 Review.** Order moved to Completed (delivered) → review request email → verified-buyer
form (stars, text, optional photo) → owner approves in the admin → shows on the
product page and Home.

**F8 Discount code.** Owner creates a code in the admin: percent or fixed amount
per currency, markets, designs, start/end, total uses, once per customer.
Customer enters it in the bag → checked on the server → shown as a line →
passed to Stripe. One code per order. Referral codes later reuse this.

**F9 Wishlist.** Heart on card and product → guests keep it in the browser;
signing in merges it into the account.

**F10 Switch market or language mid-visit.** Country change reprices the bag in
the new market; lines with no price there are marked "Not available in your
country". Language change keeps the same page.

**F11 Account.** Sign in by email code or Google (as today). Guest orders link
by email.

## 7. Edge cases

| Area | Case | Handling |
|---|---|---|
| Market | Location detected wrongly (VPN, travel) | First-visit note; picker always in the header |
| Market | Country switched with items in the bag | Reprice; unavailable lines flagged, checkout blocked until removed |
| Market | Design has no price in a market | Hidden from collection and search; direct link shows "Not available in your country" + change country |
| Market | Card from another country | Allowed; shipping country is what's locked |
| Market | Libya sees LYD but pays USD | Checkout and confirmation state the USD charge |
| Price | Price changed while in bag | Bag shows the new price with a note before checkout |
| Measurements | Value outside the allowed range | Inline error with the range in her unit |
| Measurements | Likely unit mix-up (cm entered as inches) | Warning with a one-tap convert |
| Measurements | Implausible combination (waist above hips by a lot, etc.) | Soft warning, can continue |
| Measurements | Old bag line or set without waist | Ask to re-measure before checkout (as today) |
| Measurements | Ordering for several people | Each bag line has its own named measurement set |
| Measurements | Edit after production started | Locked, contact link |
| Payment | Checkout abandoned | Bag kept; order stays hidden as awaiting payment (as today) |
| Payment | Paid, webhook late | Confirmation page polls, then shows; email when confirmed |
| Payment | Payment failed / 3-D Secure failed | Back to bag with a plain message |
| Payment | Paid twice | Detected by checkout session; refund in Stripe |
| Payment | Tabby declined | She can pay by card in the same checkout |
| Discount | Expired, wrong market, wrong design, used up | Specific message for each |
| Discount | Bag changes after applying | Rechecked on every change |
| Gift | Recipient in another country | Not allowed: gift ships within the market country; note shown |
| Order | Cancel or change request | Contact; owner handles by hand (alterations/cancel policy deferred) |
| Order | Address wrong after paying | Contact before shipping; owner edits in admin |
| Order | Late against ready-by date | Handled by hand (owner's choice) |
| Order | Courier returns the parcel | Owner contacts her; handled by hand |
| Content | Design deactivated while in bag or wishlist | Marked unavailable; can't check out |
| Content | No photo yet | Line drawing shown |
| Content | Missing translation | English fallback |
| Content | Long German or Russian labels | Buttons wrap to two lines, never truncate |
| Account | Guest order then signs up | Orders linked by email |
| Account | Email code expired | Resend |
| Email | Typo in email at checkout | Confirmation page shows the address and a Track order link |
| Reviews | Abusive or fake | Nothing shows without owner approval; verified buyers only |
| Tech | Slow network / video fails | Poster image; video only on fast connections |
| Tech | Reduced motion | All animation off |
| Tech | Old URLs without language | Redirect to the visitor's language |
| Tech | JavaScript fails | Collection, product info and help pages still render |

## 8. Ideas list (not in this build)

- **Tabby**: apply now (tabby.ai → merchant.tabby.ai, UAE trade licence). Fee negotiated, estimated 4–7% + ~AED 1. Integrate if approved before launch; the Price component already reserves the line.
- **WhatsApp updates**: needs a dedicated number, Meta Business verification, approved templates; about AED 0.06 per message. Consent box ships with checkout.
- AI try-on; loyalty; referral codes (on top of discount codes); Journal; About/atelier; gift cards; Tamara; alterations policy.

## 9. Build order

Each phase gets its own implementation plan and ships to staging before the next.

1. **Foundation**: tokens, contrast fixes, font comparison, every component in 3.8, private style guide page, language-in-URL routing with the seven locales.
2. **Shopping path**: collection, product with the signature moment, bag (gift options, discount codes), checkout, order confirmed, one-price display.
3. **After the order**: account restyle, order page with measurement edits, Track order, wishlist, reviews.
4. **Help**: How it works, Appointments, size guide, fabrics, shipping, returns, FAQ, contact, care, gifts, legal, 404/error.
5. **Home**: hero video, story with GSAP, reviews, trust.
6. **Translations**: French, Russian, Turkish, German, Spanish copy and design content.

## 10. Verification

- Style guide reviewed by the owner before Phase 2.
- Each phase: lint, unit tests, type check, then a browser pass on staging at 375 px and desktop, in English and Arabic (and one long-word locale from Phase 6), keyboard-only, with a contrast check.
