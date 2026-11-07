# Dar Rida

The Dar Rida storefront: made-to-measure abayas, in English and Arabic.

- **Next.js 16** (App Router) for the shop, in `app/(frontend)`.
- **Payload CMS 3** for the admin at `/admin`, in `app/(payload)`, configured in
  `payload.config.ts` and `cms/`. Its data lives in **Postgres**.
- **Stripe Checkout** for payment. An order is only marked paid by Stripe's
  webhook (`app/api/stripe/webhook`).
- **Email** through any SMTP server (nodemailer): a new-order notice to the
  owners and a confirmation to the customer.

The design notes for this setup are in `docs/superpowers/specs/`.

## Running it locally

You need Node 22+, pnpm and Docker.

1. Start Postgres:

   ```bash
   docker run -d --name dar-rida-pg -e POSTGRES_USER=darrida -e POSTGRES_PASSWORD=darrida -e POSTGRES_DB=darrida -p 127.0.0.1:5433:5432 -v dar-rida-pg:/var/lib/postgresql/data postgres:17-alpine
   ```

2. Copy `.env.example` to `.env`, set `PAYLOAD_SECRET`, and install:

   ```bash
   pnpm install
   ```

3. Add the four Rida designs and the starting store settings (set
   `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD` first to also create an admin):

   ```bash
   pnpm seed
   ```

4. Run the site at http://localhost:3000 and the admin at http://localhost:3000/admin:

   ```bash
   pnpm dev
   ```

In development the database schema follows the code automatically. Without
SMTP settings, emails are printed in the terminal.

## Stripe

1. Create a Stripe account. Test mode works straight away, before the business
   bank account is connected.
2. Put the test secret key in `STRIPE_SECRET_KEY`.
3. In development, forward webhooks with the Stripe CLI and put the secret it
   prints in `STRIPE_WEBHOOK_SECRET`:

   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```

4. In production, add a webhook endpoint in the Stripe dashboard pointing at
   `https://<your domain>/api/stripe/webhook` with these events:
   `checkout.session.completed`, `checkout.session.async_payment_succeeded`,
   `checkout.session.expired`.
5. Turn on **Adaptive Pricing** (Settings → Payments → Adaptive Pricing) so
   customers see prices in their own currency at checkout. Prices are set and
   charged in US dollars.

Test card: `4242 4242 4242 4242`, any future date, any CVC.

## Changing the database schema

After changing a collection in `cms/`, create a migration and commit it.
Production applies new migrations when the server starts.

```bash
pnpm payload migrate:create <name>
```

Then regenerate the types (`pnpm generate:types`) and, if you added admin
components, the import map (`pnpm generate:importmap`).

## Deploying to a VPS

1. Install Node 22+, pnpm and Postgres, and create a database and user for the shop.
2. Set the production `.env`: a real `PAYLOAD_SECRET`, `NEXT_PUBLIC_SITE_URL`
   set to the domain, `MEDIA_DIR` set to a folder outside the app (for example
   `/var/lib/dar-rida/media`), the Stripe keys and the SMTP settings.
3. Build and start:

   ```bash
   pnpm install --frozen-lockfile && pnpm build && pnpm start
   ```

4. Run it under a process manager (systemd or pm2) behind a reverse proxy
   (nginx or Caddy) with HTTPS.
5. Sign in at `/admin` to set the real prices, the new-order email addresses
   and the lead time in **Store settings**.

## Checks

```bash
pnpm lint
pnpm test
pnpm build
```
