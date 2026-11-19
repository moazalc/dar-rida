import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_orders_market" AS ENUM('uae', 'global');
  CREATE TYPE "public"."enum_shipping_zones_countries" AS ENUM('AF', 'AX', 'AL', 'DZ', 'AD', 'AO', 'AI', 'AQ', 'AG', 'AR', 'AM', 'AW', 'AC', 'AU', 'AT', 'AZ', 'BS', 'BH', 'BD', 'BB', 'BY', 'BE', 'BZ', 'BJ', 'BM', 'BT', 'BO', 'BA', 'BW', 'BV', 'BR', 'IO', 'VG', 'BN', 'BG', 'BF', 'BI', 'KH', 'CM', 'CA', 'CV', 'BQ', 'KY', 'CF', 'TD', 'CL', 'CN', 'CO', 'KM', 'CG', 'CD', 'CK', 'CR', 'CI', 'HR', 'CW', 'CY', 'CZ', 'DK', 'DJ', 'DM', 'DO', 'EC', 'EG', 'SV', 'GQ', 'ER', 'EE', 'SZ', 'ET', 'FK', 'FO', 'FJ', 'FI', 'FR', 'GF', 'PF', 'TF', 'GA', 'GM', 'GE', 'DE', 'GH', 'GI', 'GR', 'GL', 'GD', 'GP', 'GU', 'GT', 'GG', 'GN', 'GW', 'GY', 'HT', 'HN', 'HK', 'HU', 'IS', 'IN', 'ID', 'IQ', 'IE', 'IM', 'IL', 'IT', 'JM', 'JP', 'JE', 'JO', 'KZ', 'KE', 'KI', 'XK', 'KW', 'KG', 'LA', 'LV', 'LB', 'LS', 'LR', 'LY', 'LI', 'LT', 'LU', 'MO', 'MG', 'MW', 'MY', 'MV', 'ML', 'MT', 'MQ', 'MR', 'MU', 'YT', 'MX', 'MD', 'MC', 'MN', 'ME', 'MS', 'MA', 'MZ', 'MM', 'NA', 'NR', 'NP', 'NL', 'NC', 'NZ', 'NI', 'NE', 'NG', 'NU', 'MK', 'NO', 'OM', 'PK', 'PS', 'PA', 'PG', 'PY', 'PE', 'PH', 'PN', 'PL', 'PT', 'PR', 'QA', 'RE', 'RO', 'RU', 'RW', 'WS', 'SM', 'ST', 'SA', 'SN', 'RS', 'SC', 'SL', 'SG', 'SX', 'SK', 'SI', 'SB', 'SO', 'ZA', 'GS', 'KR', 'SS', 'ES', 'LK', 'BL', 'SH', 'KN', 'LC', 'MF', 'PM', 'VC', 'SD', 'SR', 'SJ', 'SE', 'CH', 'TW', 'TJ', 'TZ', 'TH', 'TL', 'TG', 'TK', 'TO', 'TT', 'TA', 'TN', 'TR', 'TM', 'TC', 'TV', 'UG', 'UA', 'GB', 'US', 'UY', 'UZ', 'VU', 'VA', 'VE', 'VN', 'WF', 'EH', 'YE', 'ZM', 'ZW');
  CREATE TABLE "shipping_zones_countries" (
  	"order" integer NOT NULL,
  	"parent_id" varchar NOT NULL,
  	"value" "enum_shipping_zones_countries",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "shipping_zones" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"fee" numeric DEFAULT 0 NOT NULL,
  	"free_over" numeric
  );
  
  CREATE TABLE "shipping" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"uae_fee" numeric DEFAULT 0 NOT NULL,
  	"uae_free_over" numeric,
  	"rest_of_world_fee" numeric DEFAULT 0 NOT NULL,
  	"rest_of_world_free_over" numeric,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "orders" ADD COLUMN "market" "enum_orders_market" DEFAULT 'global';
  ALTER TABLE "orders" ADD COLUMN "shipping_country" varchar;
  ALTER TABLE "orders" ADD COLUMN "shipping" numeric DEFAULT 0;
  ALTER TABLE "orders" ADD COLUMN "shipping_zone" varchar;
  ALTER TABLE "designs" ADD COLUMN "price_aed" numeric;
  ALTER TABLE "store_settings" ADD COLUMN "custom_abaya_price_aed" numeric;
  ALTER TABLE "shipping_zones_countries" ADD CONSTRAINT "shipping_zones_countries_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."shipping_zones"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "shipping_zones" ADD CONSTRAINT "shipping_zones_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."shipping"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "shipping_zones_countries_order_idx" ON "shipping_zones_countries" USING btree ("order");
  CREATE INDEX "shipping_zones_countries_parent_idx" ON "shipping_zones_countries" USING btree ("parent_id");
  CREATE INDEX "shipping_zones_order_idx" ON "shipping_zones" USING btree ("_order");
  CREATE INDEX "shipping_zones_parent_id_idx" ON "shipping_zones" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "shipping_zones_countries" CASCADE;
  DROP TABLE "shipping_zones" CASCADE;
  DROP TABLE "shipping" CASCADE;
  ALTER TABLE "orders" DROP COLUMN "market";
  ALTER TABLE "orders" DROP COLUMN "shipping_country";
  ALTER TABLE "orders" DROP COLUMN "shipping";
  ALTER TABLE "orders" DROP COLUMN "shipping_zone";
  ALTER TABLE "designs" DROP COLUMN "price_aed";
  ALTER TABLE "store_settings" DROP COLUMN "custom_abaya_price_aed";
  DROP TYPE "public"."enum_orders_market";
  DROP TYPE "public"."enum_shipping_zones_countries";`)
}
