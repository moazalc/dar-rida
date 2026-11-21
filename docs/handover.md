# Dar Rida — where things stand (21 Nov 2026)

Read this first when picking the work up on another machine. The full QA record,
with every finding and its status, is in [qa-checklist.md](qa-checklist.md).

## The plan

1. **QA first** (backend and frontend: UX, validation, security, gaps). Mostly done; see below.
2. **Admin panel work**: order export (next step).
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
The browser prompt for the site password doesn't stick in the Claude browser pane.
What worked: an ssh tunnel to the staging port (`ssh -N -L 4051:127.0.0.1:3050 hetzner`)
and a small local Node proxy on port 4050 that adds the `Authorization` header (built
from `SITE_USERNAME`/`SITE_PASSWORD` read from the staging container, never typed).
For `/api/` requests the proxy must also rewrite `Origin` to `https://staging.darrida.net`,
or Payload's CSRF check rejects admin actions with "Not allowed". The proxy script was
a throwaway in a temp folder, so write it again if needed.

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

## Next step: admin work

1. **Order export**
   - A PDF tailor sheet for a single order: one page per piece, with the design code and
     drawing, measurements in both cm and inches, quantity, notes and the ready-by date.
   - A CSV/Excel export of the order list that follows the current tab or filter.
2. **Order screen tidy-ups (F-25)**: show prices as money (it shows "40000" for $400),
   remove the Save button that does nothing, add an internal team notes field.
3. **Uploads (F-04)**: set image sizes so uploads are resized.

Undecided, for later: hreflang/language URLs (the language is a cookie today), a real
server-side contact form instead of mailto.

## Test data on staging

- Order **DR-QA1** (id 1), inserted with psql, status Shipped. Kept for building the
  order export. It adds $800 to the dashboard's sales figures. Delete it when done.
- A test bag with one RIDA 01 line.
