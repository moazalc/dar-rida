# Payload + Stripe foundation and the Rida collection

Stage 2 of 3 of the Dar Rida storefront plan: (1) light redesign, done and merged; (2) this; (3) the builder rebuild with 2D line drawings.

## Intent

Dar Rida sells made-to-measure abayas worldwide. Today the shop runs on the Shopify Storefront API (`lib/shopify/*`), but Shopify doesn't suit this business:

- **Cost.** Shopify charges a monthly fee.
- **Product model.** Every piece is made to one customer's measurements, and the builder produces open-ended configurations. Shopify expects fixed variants, so that information ends up squeezed into line-item attributes.

This stage replaces Shopify with:

- **Payload CMS v3**, running inside this Next.js app with an admin area at `/admin`, storing data in Postgres.
- **Stripe Checkout** for payment.
- **Email notifications.**

The owners are the user (moazalc) and their mother. The mother drives the visual taste and will use the admin. They must be able to run the shop end to end on their own: edit the Rida designs and prices, see orders with every measurement, and move orders through production.

**Success:** a customer anywhere can put several pieces in a bag, each with its own measurements, and pay in full. The order then appears in `/admin` with everything the workshop needs. The owners get an email and the customer gets a confirmation.

## Goals

1. Run Payload v3 in this repo, served at `/admin` and backed by Postgres. It holds:
   - the Rida designs
   - prices
   - the price of a custom abaya
   - orders
   - admin users
2. Rebuild the collection on Payload data:
   - `/collection` lists the designs.
   - `/collection/[slug]` shows one design, a measurements form and Add to bag.
3. Build our own bag:
   - It holds several lines, mixing collection designs and builder designs.
   - Each line has its own measurements and notes.
   - The bag is kept server-side and identified by a cookie.
4. Check out through Stripe Checkout:
   - Pay in full.
   - Charge in USD, with Stripe showing each customer their local currency.
   - Collect a shipping address.
5. Record orders reliably:
   - A Stripe webhook marks the order paid. This must be idempotent and verified.
   - The order snapshot keeps prices, choices and measurements exactly as bought.
6. Send email through nodemailer (SMTP):
   - A new-order email to the owners, in English for the workshop.
   - A confirmation to the customer, in their language (EN or AR).
7. Keep the existing `/design` configurator working by pointing its Add to bag at the new bag. Its options stay hard-coded until stage 3.
8. Remove standard sizes everywhere. Every piece is made to measure.
9. Remove `lib/shopify` and the Shopify environment variables.

## Non-goals (for this stage)

- **Shipping charges.** The owners decided to add them later as an extra charge. For now, Stripe collects the address and charges no shipping.
- **Taxes and duties.** No Stripe Tax for now.
- **Customer accounts.** Checkout is guest-only.
- **Builder options in Payload.** Moving fabrics, sleeves and the rest into Payload, with per-option extra prices and the owner turning combinations on and off, is stage 3. Here the builder only needs one base price, which the owners set in Payload.
- **The 2D builder drawings.** These are stage 3.
- **A currency picker on the site.** Prices on the site are shown in USD. Stripe Adaptive Pricing shows the local currency at checkout, and the customer can switch back to USD there. *(My call; see Calls made.)*
- **Status-change emails to customers** (for example "your abaya has shipped"). This can come later.
- **Discount codes, gift cards and refunds from our admin.** Refunds are done in the Stripe dashboard.
- **The home page carousel.** It keeps its copy in the dictionaries for now and doesn't read from Payload. *(My call.)*

## Anti-goals (it fails if…)

- **Trusting prices from the browser.** Every amount sent to Stripe is recomputed on the server from Payload data.
- **Missing or doubled orders.** A paid order must never be lost or recorded twice. The webhook is the source of truth, not the success-page redirect.
- **Losing measurements.** An order without its measurements is useless to the workshop.
- **Standard sizes (XS–XXL) coming back** anywhere in the buying flow.
- **Changing anything on the `hetzner` VPS that isn't ours.** See Constraints.
- **The site getting slower or less polished.** The redesign's quality bar holds, in both EN and AR (RTL).

## Constraints

- **Stack:**
  - Next.js 16.4.3 (App Router, React 19.3).
  - Tailwind v4 and the existing design tokens.
  - pnpm.
  - **Read `node_modules/next/dist/docs/` before writing Next code** (AGENTS.md). This Next version has breaking changes.
- **Payload versions:**
  - Payload 3.93.0. `@payloadcms/next` declares support for `next >=16.3.3 <17`, so 16.4.3 is supported.
  - Use `@payloadcms/db-postgres` and `@payloadcms/email-nodemailer`, both on the same version as Payload.
- **Postgres** in every environment:
  - Development: local Docker Postgres (Docker is installed).
  - Production: the owners' VPS.
- **Hosting:**
  - Self-hosted on a VPS the user is still getting: `next start` behind a reverse proxy, with Postgres on the same machine.
  - Uploaded media is stored on local disk, in a directory outside the build output, configured by an environment variable.
- **Testing on `ssh hetzner`:**
  - It's allowed for testing only, and the machine hosts other projects. Use your own directory, your own Postgres database and role, and a free port.
  - Reach it through an SSH tunnel.
  - Don't edit shared configuration (nginx, systemd units of other services, global packages, other databases).
  - If something shared seems necessary, stop and ask.
- **Stripe:**
  - The owners don't have a Stripe account yet. A Stripe account can be created and used in **test mode** before the business bank account exists. The user will create one and provide test keys.
  - Until then, build against the Stripe SDK with the webhook handler covered by tests. Do the full checkout test once test keys arrive.
- **Bilingual EN/AR:**
  - The site follows the existing i18n setup (`lib/i18n`).
  - Customer-facing Payload text (design name, description, cut) uses **Payload localization** with locales `en` (default) and `ar`.
- **Server Actions are public.** Re-validate every input on the server, as `app/design/actions.ts` already does.

## How it works

### Payload in the app

- Add Payload to this app in the standard v3 layout:
  - `payload.config.ts` at the root.
  - A `(payload)` route group for `/admin` and Payload's API routes.
  - A `(frontend)` route group that takes over the existing site routes and their root layout.
- Moving `app/*` into `app/(frontend)/` is expected. URLs don't change.
- Database: `postgresAdapter` with `DATABASE_URL`.
- Schema changes go through `payload migrate`, with migrations committed. Use push mode only in development.
- The admin UI can stay in English. Content localization (EN/AR fields) is separate from the admin language.

### Collections and globals

**Users** (admin login only):
- Email and password.
- Only admins exist. No customer accounts.

**Media** (uploads):
- Images for designs, with alt text, localized.

**Designs** (the Rida collection):

| Field | Type | Notes |
|---|---|---|
| `code` | text | e.g. "RIDA 01" |
| `slug` | text, unique | Used in `/collection/[slug]` |
| `name` | text, localized | e.g. "Cascade" |
| `description` | rich text or textarea, localized | |
| `cut` | text, localized | The cut line shown in the carousel today |
| `price` | number | USD, in whole cents, required |
| `images` | array of Media | |
| `drawing` | select | Which `RidaDrawing` to show when there are no photos (`rida01`–`rida04`) |
| `leadTime` | text, localized | Optional |
| `active` | checkbox | Hides the design without deleting it |
| `sortOrder` | number | |

- Seed the four existing designs (Cascade, Architectural Line, Cluster, Secrets of the Pleats), using the text already in the dictionaries (`home.collectionRow.models`).
- Seed prices are placeholders. The owners set the real prices.

**Carts** (server-side bag):
- `id` is a random token, also stored in an httpOnly, SameSite=Lax cookie.
- `lines` is an array. Each line has:
  - `kind`: `design` or `custom`
  - `design`: a relationship to Designs when `kind` is `design`
  - `config`: JSON with the builder choices when `kind` is `custom`, validated against `lib/configurator/options.ts`
  - `measurements`
  - `notes`: up to 500 characters (the existing `NOTES_MAX`)
  - `quantity`
- `updatedAt` is used to prune carts untouched for 30 days.
- Hidden from the admin navigation or read-only. Owners don't manage carts.

**Orders:**
- `number`: human-readable and sequential, e.g. `DR-1001`.
- `status`: `pending_payment`, `paid`, `in_production`, `shipped`, `completed` or `cancelled`. The owners change it after `paid`.
- `lines`: a snapshot copied from the cart at checkout. Each line has:
  - `kind`
  - the design code and name (English) at the time of purchase
  - the builder choices as readable English labels
  - measurements with units
  - notes
  - quantity
  - unit price in cents
- `subtotal` and `total` in cents, plus `currency` (`usd`).
- `presentmentAmount` and `presentmentCurrency`: what the customer actually paid in their own currency, when Stripe reports it.
- Customer details from Stripe: name, email, phone, shipping address.
- `locale`: `en` or `ar`, for the confirmation email.
- `stripeCheckoutSessionId` (unique) and `stripePaymentIntentId`.
- `ownerNotifiedAt` and `customerNotifiedAt`, so neither email is sent twice (see Checkout and payment).
- In the admin, show line measurements clearly. A custom field component or a readable layout is fine. Raw JSON alone is not.

**StoreSettings** (global):
- `customAbayaPrice`: USD cents, the builder base price for this stage.
- `orderNotificationEmails`: one or more addresses.
- `defaultLeadTime`: localized.

### Measurements

- **Fields:** use the ones the designer already takes, from `lib/configurator/options.ts`:

  | Measurement | Unit | Range | Step |
  |---|---|---|---|
  | Length | in | 50–62 | 1 |
  | Bust | in | 30–52 | 1 |
  | Shoulder | in | 13–19 | 0.5 |
  | Sleeve | in | 20–27 | 0.5 |
  | Hips | in | 34–58 | 1 |
  | Height | cm | 145–190 | 1 |

  All six are required for every line.
- **What to remove:**
  - the `standard` sizing mode
  - `standardSizes`
  - `sizeChart`
- **Code changes:**
  - `Sizing` becomes just the measurements.
  - Move the measurement definitions and their validation into a module shared by the collection form and the builder, so both use one list and one check.
- **Size guide page:** the `/size-guide` page currently shows the standard size chart. It becomes a "how to measure" page. Keep `lengthByHeight` as the help for customers who can't measure their length.
- **Copy:** update the dictionaries (EN and AR) to drop size wording.

### The bag and the pages

- **Bag:** server code in `lib/cart/` (or similar) wraps Payload's local API. It covers:
  - get, or create on first add
  - add a line
  - update quantity
  - remove a line
  - count, for the header badge, replacing `lib/shopify/cart-count.ts`
- **Line display:** each line shows:
  - the drawing or photo
  - the name, or "Custom abaya" with its choices
  - a compact list of the measurements
  - notes
  - quantity controls
  - the line price
- **Prices on the site:** formatted as USD with `Intl.NumberFormat` in the page locale.
- **`/collection`:** lists active Designs in `sortOrder` and keeps the existing "Design your own" tile.
- **`/collection/[slug]`:**
  - photos if present, otherwise the `RidaDrawing`
  - the localized text and the price
  - the measurements form and a notes field
  - Add to bag, which calls a Server Action that validates and adds the line
  - the existing structured data, kept, with the price from Payload
- **`/design`:** keep the configurator UI. Add to bag now adds a `custom` line priced from `StoreSettings.customAbayaPrice`.
- **`/search`:** today it calls Shopify's `searchProducts`. Rebuild it as a simple search over active Designs, matching code, name, description and cut in both EN and AR. Keep its place in the header.
- **`/cart`:** rebuild it on the new bag. Checkout is a button that calls a Server Action and redirects to Stripe.

### Checkout and payment

1. **Checkout Server Action:**
   - Load the cart.
   - Re-validate every line.
   - Recompute every price from Payload: the Design's `price`, or `customAbayaPrice`.
   - Create an Order with status `pending_payment` and the snapshot.
   - Create a Stripe Checkout Session:
     - `mode: payment`
     - line items built with `price_data`, so no Stripe products need to exist; currency `usd`
     - `shipping_address_collection` allowing every country Stripe supports
     - phone number collection on
     - `customer_email` left for Stripe to collect
     - `locale` set to the site locale
     - `metadata.orderId`
     - `success_url` set to `/checkout/success?session_id={CHECKOUT_SESSION_ID}`
     - `cancel_url` set to `/cart`
   - Save the session id on the Order and redirect.
   - **Adaptive Pricing** (local currency display) is turned on in the Stripe dashboard. Note it in the setup docs. Code doesn't need to change for it.
2. **Webhook at `POST /api/stripe/webhook`:**
   - Verify the signature with `STRIPE_WEBHOOK_SECRET` against the raw body.
   - On `checkout.session.completed` with `payment_status: paid`, and on `checkout.session.async_payment_succeeded`, find the Order by `metadata.orderId` (falling back to the session id).
   - If it's already past `pending_payment`, do nothing. That's how retries stay idempotent.
   - Otherwise set it to `paid` and store:
     - customer name, email, phone and shipping address
     - the presentment amount and currency
     - the payment intent
   - Empty that cart, then send both emails.
   - Emails are tracked separately from the status, with one marker per recipient: `ownerNotifiedAt` and `customerNotifiedAt` (these replace a single `notificationsSentAt`). Each email is sent only while its marker is empty, and the marker is set once that email goes out.
   - If email fails, the order still stays paid and the webhook still returns 200. Log the error and leave that marker empty.
   - The Order page in the admin gets a **Resend emails** button. It sends only the emails whose marker is empty, unless the owner chooses to resend one on purpose.
   - On `checkout.session.expired`, the order may be marked `cancelled`, or left alone.
3. **`/checkout/success`:**
   - Shows a thank-you with the order number, looked up by session id.
   - It must not mark anything paid.
   - If the webhook hasn't landed yet, say the confirmation is on its way by email.

### Emails

- Use `@payloadcms/email-nodemailer` as Payload's email adapter, configured from SMTP environment variables (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM`). The SMTP provider is the owners' choice later. Development can use a local catcher or log to the console.
- **Owner email:**
  - Subject: "New order DR-1001 — 2 pieces — $X".
  - Body: every line with its measurements and notes, the customer contact and address, and a link to the order in `/admin`. In English.
- **Customer email:**
  - Order number, lines, total, and that each piece is made to their measurements, with the lead time.
  - In the order's `locale`, laid out RTL for Arabic.
  - Plain, well-typeset HTML with a text fallback. No heavy templating framework is needed.

### Configuration

`.env.example` is rewritten. Shopify variables go, and these are added:
- `DATABASE_URL`
- `PAYLOAD_SECRET`
- `NEXT_PUBLIC_SITE_URL`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- the `SMTP_*` and `EMAIL_FROM` variables
- `MEDIA_DIR`

The README gets a short setup section covering:
- Docker Postgres for development
- running migrations
- creating the first admin
- Stripe test keys and the Stripe CLI webhook forward
- turning on Adaptive Pricing

## Left to the builder

- The exact folder layout under `lib/`, the component split, and how the admin renders line measurements (a custom component or a careful field layout).
- How the order number sequence is produced, as long as it's unique under concurrent checkouts.
- Whether `checkout.session.expired` cancels orders.
- Which test tooling to add. The repo has no tests today. At minimum, cover these:
  - price recomputation and input validation
  - webhook signature handling and idempotency (the same event twice gives one paid order and one set of emails)
  - measurement validation
- How carts older than 30 days are pruned: on access, or a small scheduled job.
- Small copy changes in the dictionaries. Keep the house voice in both languages.

## Calls made (not discussed with the owners)

- **Currency:** prices are stored and charged in USD. Local currency appears only on Stripe's checkout through Adaptive Pricing. The site has no currency picker.
- **Accounts:** guest checkout only, with no customer accounts.
- **Builder price:** the custom abaya has one base price in this stage. Option extras come in stage 3.
- **Home carousel:** it stays dictionary-driven this stage.
- **Size guide:** it becomes a measuring guide.
- **Admin language:** the admin UI is English only, while design content is EN and AR.
- **Customer emails:** sent on payment only, not on later status changes.
- **Refunds:** handled in the Stripe dashboard.
- **Search:** `/search` stays, rebuilt over the Rida designs.
- **Failed emails:** they are resent with a button on the order in the admin. Stripe's retries are not used for this.
