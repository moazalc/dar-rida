# Dar Rida — where things stand (21 Nov 2026)

Read this first when picking the work up on another machine. The full QA record,
with every finding and its status, is in [qa-checklist.md](qa-checklist.md).

## The plan

1. **QA first** (code and UI/UX only; anything the owner types into the admin is deferred). Mostly done; see below.
2. **Admin panel work**: order export and order screen done (on staging); image sizes next.
3. **Redesign the website** for a luxury feel (hero video, single-colour pages,
   every page). Not started. Keyboard, focus and contrast checks belong to this pass.

Email OTP, Google sign-in and Stripe were left out of the QA on purpose.

## Where everything runs

| | Production | Staging |
|---|---|---|
| URL | darrida.net (shows the coming-soon page, `COMING_SOON=1`) | staging.darrida.net (behind the site password) |
| Server folder | `~/projects/dar-rida` | `~/projects/dar-rida-staging` |
| Compose file | `deploy/docker-compose.prod.yml` | `deploy/docker-compose.staging.yml` |
| Containers | `dar-rida` | `dar-rida-staging`, `dar-rida-staging-db` (port 3050) |
| Admin | `/atelier` | `/atelier` (its database is a copy of production's) |

Both deploy from `main`. Server: `ssh hetzner`.

```bash
# staging
ssh hetzner 'cd ~/projects/dar-rida-staging && git pull --ff-only && cd deploy && docker compose -f docker-compose.staging.yml up -d --build'
# production (only after the owner says yes)
ssh hetzner 'cd ~/projects/dar-rida && git pull --ff-only && cd deploy && docker compose -f docker-compose.prod.yml up -d --build'
```

Rules:
- **Never build staging and production at the same time.** The server is low on memory.
- Test on staging first. Production only with the owner's explicit OK.
- Secrets live in the `.env` files on the server. Never print them.
- Inside a container, use `127.0.0.1:3000`, not `localhost` (that resolves to IPv6 and fails).

Local checks before a commit: `pnpm lint`, `pnpm exec vitest run`, `pnpm exec tsc --noEmit`.
If tsc complains about a missing `/design` page, delete the stale `.next/types` folder.

### Testing staging in a browser
Use the site password directly (the owner shares it in chat when needed; never commit it).
If the browser prompt doesn't stick in the Claude browser pane, a headless browser with
HTTP credentials set works.

## Done (all on staging and production as of commit becc1d5)

- **Security**: HSTS, X-Frame-Options, CSP `frame-ancestors`, nosniff, Referrer-Policy and
  Permissions-Policy on every page; no `X-Powered-By`. Uploads limited to JPEG, PNG, WebP
  and AVIF. `makingDays` is no longer in the public API.
- **SEO**: `robots.txt` (blocks everything while the site password or coming-soon is on),
  `sitemap.xml` (static pages and active designs), titles and descriptions in Arabic on
  Arabic pages, `metadataBase` set.
- **Measurements**: closing the panel without saving drops an unsaved unit conversion.
- **Bag**: totals show "—" when nothing can be bought in the chosen country; thumbnails
  have accessible names.
- **Caching**: `/media` (photos, hero video) cached for a day.
- **Admin dashboard**: warns while no one is set to receive new-order emails.
- **Contact**: email `info@darrida.net`; the form opens the visitor's email app (mailto).
- **Copy**: "Ships in 2 weeks", "we ship worldwide", no city shown anywhere.
- **Shipping page**: the table reads the admin's Shipping settings (fees, free-over,
  delivery days), so it always matches the bag.
- **Removed**: the "Our story" link (no story yet) and the newsletter form.
- **Mobile menu**: now also links Fabric library, Shipping, Returns, FAQ and Contact.

## Waiting on the owner

In the admin:
- **AED prices** on each design (UAE visitors can't buy anything until then).
- **UAE shipping fee** is 0, so the UAE ships free. Change it in Globals → Shipping if that's wrong.
- **Delivery days** per region (the shipping table's "Time" column shows "—" until set).
- **Default lead time** in Store settings still says "3–4 weeks"; should be 2 weeks.
- **New-order email recipients** in Store settings (the owner said these are set; check production).
- Product photos and details: later.

Answers still needed:
- Free alteration window after delivery (Returns and FAQ show "[X] days").
- Is "change or cancel within 24 hours" right? (shows "[24 hours]").
- WhatsApp and Instagram: not created yet. Add them to `lib/site.ts` when they exist.

On the server (owner runs it, needs sudo): hide the nginx version.
```bash
sudo sed -i 's/^\s*# server_tokens off;/\tserver_tokens off;/' /etc/nginx/nginx.conf
sudo nginx -t && sudo systemctl reload nginx
```

Also: the admin password was shared in a chat, so it should be changed.

## Admin work

Done (5e93ab6, on staging):
- **F-16 order export**: *Print tailor sheet* on each order (`/print/orders/:id`, app/(print),
  admins only, in the admin's language, A4) and *Export CSV* above the orders list
  (`GET /api/orders/export`, follows the list's tab, filters, search and sort, one row per piece).
- **F-25 order screen**: amounts shown as money, a *Team notes* field (migration
  `20261122_071203_team_notes`, printed as Workshop notes), never-paid checkouts hidden
  from the list and the export. Save stays (Ready by and Team notes are editable).

From the tailor's review (ca66ce1, on staging):
- **Height removed everywhere; waist (دوران الخصر) added**: 61–117 cm / 24–46 in, taken as
  length, shoulder, bust, waist, hips, sleeve. Migration `20261122_074311_waist_replaces_height`
  drops the height columns. Old orders show no waist; bags saved before ask the customer to
  measure again before checkout; saved measurement sets without a waist no longer appear.
- **Libya measures in cm only** (`METRIC_ONLY_COUNTRIES` in lib/measurements.ts): no unit switch
  on the product page, the panel or the size guide. The tailor (in Dubai) keeps cm + inches on the sheet.
- **Print tailor sheet** moved to the order's top bar, beside Save.

Next: **Uploads (F-04)**: set image sizes so uploads are resized.

Note for testing: Payload only accepts the admin cookie on a request that a browser marks
same-origin, so `curl` against the admin API needs `-H "Sec-Fetch-Site: same-origin"`.
The tailor sheet opens the print dialog by itself, which freezes the Claude browser pane;
check it in a headless browser with `window.print` stubbed instead.

Undecided, for later: hreflang/language URLs (the language is a cookie today), a real
server-side contact form instead of mailto.

## Test data on staging

- Order **DR-QA1** (id 1), inserted with psql, status Shipped, with a test team note. Used to test the
  order export. It adds $800 to the dashboard's sales figures. Delete it when done.
- A test bag with one RIDA 01 line.
