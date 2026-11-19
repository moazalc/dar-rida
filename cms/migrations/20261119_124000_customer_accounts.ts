import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_customers_profiles_measurements_unit" AS ENUM('in', 'cm', 'legacy');
  CREATE TYPE "public"."enum_customers_addresses_country" AS ENUM('AF', 'AX', 'AL', 'DZ', 'AD', 'AO', 'AI', 'AQ', 'AG', 'AR', 'AM', 'AW', 'AC', 'AU', 'AT', 'AZ', 'BS', 'BH', 'BD', 'BB', 'BY', 'BE', 'BZ', 'BJ', 'BM', 'BT', 'BO', 'BA', 'BW', 'BV', 'BR', 'IO', 'VG', 'BN', 'BG', 'BF', 'BI', 'KH', 'CM', 'CA', 'CV', 'BQ', 'KY', 'CF', 'TD', 'CL', 'CN', 'CO', 'KM', 'CG', 'CD', 'CK', 'CR', 'CI', 'HR', 'CW', 'CY', 'CZ', 'DK', 'DJ', 'DM', 'DO', 'EC', 'EG', 'SV', 'GQ', 'ER', 'EE', 'SZ', 'ET', 'FK', 'FO', 'FJ', 'FI', 'FR', 'GF', 'PF', 'TF', 'GA', 'GM', 'GE', 'DE', 'GH', 'GI', 'GR', 'GL', 'GD', 'GP', 'GU', 'GT', 'GG', 'GN', 'GW', 'GY', 'HT', 'HN', 'HK', 'HU', 'IS', 'IN', 'ID', 'IQ', 'IE', 'IM', 'IL', 'IT', 'JM', 'JP', 'JE', 'JO', 'KZ', 'KE', 'KI', 'XK', 'KW', 'KG', 'LA', 'LV', 'LB', 'LS', 'LR', 'LY', 'LI', 'LT', 'LU', 'MO', 'MG', 'MW', 'MY', 'MV', 'ML', 'MT', 'MQ', 'MR', 'MU', 'YT', 'MX', 'MD', 'MC', 'MN', 'ME', 'MS', 'MA', 'MZ', 'MM', 'NA', 'NR', 'NP', 'NL', 'NC', 'NZ', 'NI', 'NE', 'NG', 'NU', 'MK', 'NO', 'OM', 'PK', 'PS', 'PA', 'PG', 'PY', 'PE', 'PH', 'PN', 'PL', 'PT', 'PR', 'QA', 'RE', 'RO', 'RU', 'RW', 'WS', 'SM', 'ST', 'SA', 'SN', 'RS', 'SC', 'SL', 'SG', 'SX', 'SK', 'SI', 'SB', 'SO', 'ZA', 'GS', 'KR', 'SS', 'ES', 'LK', 'BL', 'SH', 'KN', 'LC', 'MF', 'PM', 'VC', 'SD', 'SR', 'SJ', 'SE', 'CH', 'TW', 'TJ', 'TZ', 'TH', 'TL', 'TG', 'TK', 'TO', 'TT', 'TA', 'TN', 'TR', 'TM', 'TC', 'TV', 'UG', 'UA', 'AE', 'GB', 'US', 'UY', 'UZ', 'VU', 'VA', 'VE', 'VN', 'WF', 'EH', 'YE', 'ZM', 'ZW');
  CREATE TABLE "auth_user" (
  	"id" text PRIMARY KEY NOT NULL,
  	"name" text NOT NULL,
  	"email" text NOT NULL,
  	"email_verified" boolean DEFAULT false NOT NULL,
  	"image" text,
  	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  	CONSTRAINT "auth_user_email_unique" UNIQUE("email")
  );
  
  CREATE TABLE "auth_session" (
  	"id" text PRIMARY KEY NOT NULL,
  	"expires_at" timestamp with time zone NOT NULL,
  	"token" text NOT NULL,
  	"ip_address" text,
  	"user_agent" text,
  	"user_id" text NOT NULL,
  	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  	CONSTRAINT "auth_session_token_unique" UNIQUE("token")
  );
  
  CREATE TABLE "auth_account" (
  	"id" text PRIMARY KEY NOT NULL,
  	"account_id" text NOT NULL,
  	"provider_id" text NOT NULL,
  	"user_id" text NOT NULL,
  	"access_token" text,
  	"refresh_token" text,
  	"id_token" text,
  	"access_token_expires_at" timestamp with time zone,
  	"refresh_token_expires_at" timestamp with time zone,
  	"scope" text,
  	"password" text,
  	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "auth_verification" (
  	"id" text PRIMARY KEY NOT NULL,
  	"identifier" text NOT NULL,
  	"value" text NOT NULL,
  	"expires_at" timestamp with time zone NOT NULL,
  	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "auth_rate_limit" (
  	"id" text PRIMARY KEY NOT NULL,
  	"key" text NOT NULL,
  	"count" integer NOT NULL,
  	"last_request" bigint NOT NULL,
  	CONSTRAINT "auth_rate_limit_key_unique" UNIQUE("key")
  );
  
  CREATE TABLE "customers_profiles" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"measurements_unit" "enum_customers_profiles_measurements_unit" DEFAULT 'legacy' NOT NULL,
  	"measurements_height" numeric NOT NULL,
  	"measurements_length" numeric NOT NULL,
  	"measurements_shoulder" numeric NOT NULL,
  	"measurements_bust" numeric NOT NULL,
  	"measurements_sleeve" numeric NOT NULL,
  	"measurements_hips" numeric NOT NULL
  );
  
  CREATE TABLE "customers_addresses" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"phone" varchar,
  	"is_default" boolean DEFAULT false,
  	"line1" varchar NOT NULL,
  	"line2" varchar,
  	"city" varchar NOT NULL,
  	"state" varchar,
  	"postal_code" varchar,
  	"country" "enum_customers_addresses_country" NOT NULL
  );
  
  CREATE TABLE "customers" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"email" varchar NOT NULL,
  	"name" varchar,
  	"phone" varchar,
  	"auth_user_id" varchar,
  	"stripe_customer_id" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "orders" ADD COLUMN "customer_id" integer;
  ALTER TABLE "carts" ADD COLUMN "customer_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "customers_id" integer;
  ALTER TABLE "auth_session" ADD CONSTRAINT "auth_session_user_id_auth_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."auth_user"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "auth_account" ADD CONSTRAINT "auth_account_user_id_auth_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."auth_user"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "customers_profiles" ADD CONSTRAINT "customers_profiles_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "customers_addresses" ADD CONSTRAINT "customers_addresses_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "auth_session_user_idx" ON "auth_session" USING btree ("user_id");
  CREATE INDEX "auth_account_user_idx" ON "auth_account" USING btree ("user_id");
  CREATE INDEX "auth_verification_identifier_idx" ON "auth_verification" USING btree ("identifier");
  CREATE INDEX "customers_profiles_order_idx" ON "customers_profiles" USING btree ("_order");
  CREATE INDEX "customers_profiles_parent_id_idx" ON "customers_profiles" USING btree ("_parent_id");
  CREATE INDEX "customers_addresses_order_idx" ON "customers_addresses" USING btree ("_order");
  CREATE INDEX "customers_addresses_parent_id_idx" ON "customers_addresses" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "customers_email_idx" ON "customers" USING btree ("email");
  CREATE UNIQUE INDEX "customers_auth_user_id_idx" ON "customers" USING btree ("auth_user_id");
  CREATE INDEX "customers_updated_at_idx" ON "customers" USING btree ("updated_at");
  CREATE INDEX "customers_created_at_idx" ON "customers" USING btree ("created_at");
  ALTER TABLE "orders" ADD CONSTRAINT "orders_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "carts" ADD CONSTRAINT "carts_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_customers_fk" FOREIGN KEY ("customers_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "orders_customer_email_idx" ON "orders" USING btree ("customer_email");
  CREATE INDEX "orders_customer_idx" ON "orders" USING btree ("customer_id");
  CREATE UNIQUE INDEX "carts_customer_idx" ON "carts" USING btree ("customer_id");
  CREATE INDEX "payload_locked_documents_rels_customers_id_idx" ON "payload_locked_documents_rels" USING btree ("customers_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "auth_user" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "auth_session" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "auth_account" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "auth_verification" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "auth_rate_limit" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "customers_profiles" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "customers_addresses" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "customers" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "auth_user" CASCADE;
  DROP TABLE "auth_session" CASCADE;
  DROP TABLE "auth_account" CASCADE;
  DROP TABLE "auth_verification" CASCADE;
  DROP TABLE "auth_rate_limit" CASCADE;
  DROP TABLE "customers_profiles" CASCADE;
  DROP TABLE "customers_addresses" CASCADE;
  DROP TABLE "customers" CASCADE;
  ALTER TABLE "orders" DROP CONSTRAINT "orders_customer_id_customers_id_fk";
  
  ALTER TABLE "carts" DROP CONSTRAINT "carts_customer_id_customers_id_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_customers_fk";
  
  DROP INDEX "orders_customer_email_idx";
  DROP INDEX "orders_customer_idx";
  DROP INDEX "carts_customer_idx";
  DROP INDEX "payload_locked_documents_rels_customers_id_idx";
  ALTER TABLE "orders" DROP COLUMN "customer_id";
  ALTER TABLE "carts" DROP COLUMN "customer_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "customers_id";
  DROP TYPE "public"."enum_customers_profiles_measurements_unit";
  DROP TYPE "public"."enum_customers_addresses_country";`)
}
