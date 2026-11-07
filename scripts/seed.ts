/**
 * Fill an empty database with the four Rida designs and starting store
 * settings. Safe to run again: anything that already exists is left alone.
 *
 *   pnpm seed
 *
 * Set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD to also create a first admin
 * (otherwise create one at /admin). Prices are placeholders for the owners to set.
 */
import config from "@payload-config";
import { getPayload } from "payload";
import ar from "../lib/i18n/dictionaries/ar";
import en from "../lib/i18n/dictionaries/en";
import { ridaModels } from "../components/drawings/rida-drawings";

const PLACEHOLDER_PRICE = 400;
const PLACEHOLDER_CUSTOM_PRICE = 350;

const payload = await getPayload({ config });

const email = process.env.SEED_ADMIN_EMAIL;
const password = process.env.SEED_ADMIN_PASSWORD;
if (email && password) {
  const { totalDocs } = await payload.count({ collection: "users", where: { email: { equals: email } } });
  if (!totalDocs) {
    await payload.create({ collection: "users", data: { email, password, name: "Admin" } });
    payload.logger.info(`Created admin ${email}`);
  }
}

for (const [i, drawing] of ridaModels.entries()) {
  const m = en.home.collectionRow.models[i];
  const a = ar.home.collectionRow.models[i];
  const slug = drawing; // "rida-01"
  const { totalDocs } = await payload.count({ collection: "designs", where: { slug: { equals: slug } } });
  if (totalDocs) continue;

  const doc = await payload.create({
    collection: "designs",
    locale: "en",
    data: {
      code: m.code.toUpperCase(),
      slug,
      name: m.name,
      description: m.body,
      cut: m.cut,
      price: PLACEHOLDER_PRICE,
      drawing,
      active: true,
      sortOrder: i + 1,
    },
  });
  await payload.update({
    collection: "designs",
    id: doc.id,
    locale: "ar",
    data: { name: a.name, description: a.body, cut: a.cut },
  });
  payload.logger.info(`Created ${m.code}`);
}

const settings = await payload.findGlobal({ slug: "store-settings" });
if (!settings.customAbayaPrice) {
  await payload.updateGlobal({
    slug: "store-settings",
    locale: "en",
    data: {
      customAbayaPrice: PLACEHOLDER_CUSTOM_PRICE,
      defaultLeadTime: "Made for you in 3–4 weeks",
      orderNotificationEmails: process.env.SEED_NOTIFY_EMAIL ? [{ email: process.env.SEED_NOTIFY_EMAIL }] : [],
    },
  });
  await payload.updateGlobal({ slug: "store-settings", locale: "ar", data: { defaultLeadTime: "تُصنع لكِ خلال ٣–٤ أسابيع" } });
  payload.logger.info("Set store settings");
}

process.exit(0);
