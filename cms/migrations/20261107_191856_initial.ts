import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."_locales" AS ENUM('en', 'ar');
  CREATE TYPE "public"."enum_orders_lines_kind" AS ENUM('design', 'custom');
  CREATE TYPE "public"."enum_orders_status" AS ENUM('pending_payment', 'paid', 'in_production', 'shipped', 'completed', 'cancelled');
  CREATE TYPE "public"."enum_orders_locale" AS ENUM('en', 'ar');
  CREATE TYPE "public"."enum_designs_drawing" AS ENUM('rida-01', 'rida-02', 'rida-03', 'rida-04');
  CREATE TYPE "public"."enum_carts_lines_kind" AS ENUM('design', 'custom');
  CREATE TABLE "orders_lines_choices" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"value" varchar
  );
  
  CREATE TABLE "orders_lines" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"kind" "enum_orders_lines_kind" NOT NULL,
  	"name" varchar NOT NULL,
  	"name_ar" varchar,
  	"quantity" numeric NOT NULL,
  	"unit_price" numeric NOT NULL,
  	"design_id" integer,
  	"config" jsonb,
  	"measurements_length" numeric NOT NULL,
  	"measurements_bust" numeric NOT NULL,
  	"measurements_shoulder" numeric NOT NULL,
  	"measurements_sleeve" numeric NOT NULL,
  	"measurements_hips" numeric NOT NULL,
  	"measurements_height" numeric NOT NULL,
  	"notes" varchar
  );
  
  CREATE TABLE "orders" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"number" varchar,
  	"status" "enum_orders_status" DEFAULT 'pending_payment' NOT NULL,
  	"subtotal" numeric NOT NULL,
  	"total" numeric NOT NULL,
  	"currency" varchar DEFAULT 'usd',
  	"presentment_amount" numeric,
  	"presentment_currency" varchar,
  	"customer_name" varchar,
  	"customer_email" varchar,
  	"customer_phone" varchar,
  	"shipping_address_line1" varchar,
  	"shipping_address_line2" varchar,
  	"shipping_address_city" varchar,
  	"shipping_address_state" varchar,
  	"shipping_address_postal_code" varchar,
  	"shipping_address_country" varchar,
  	"locale" "enum_orders_locale" DEFAULT 'en',
  	"stripe_checkout_session_id" varchar,
  	"stripe_payment_intent_id" varchar,
  	"paid_at" timestamp(3) with time zone,
  	"owner_notified_at" timestamp(3) with time zone,
  	"customer_notified_at" timestamp(3) with time zone,
  	"cart_token" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "designs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"code" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"price" numeric NOT NULL,
  	"drawing" "enum_designs_drawing" NOT NULL,
  	"active" boolean DEFAULT true,
  	"sort_order" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "designs_locales" (
  	"name" varchar NOT NULL,
  	"description" varchar NOT NULL,
  	"cut" varchar,
  	"lead_time" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "designs_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric
  );
  
  CREATE TABLE "media_locales" (
  	"alt" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"reset_password_requested_at" timestamp(3) with time zone,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "carts_lines" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"kind" "enum_carts_lines_kind" NOT NULL,
  	"design_id" integer,
  	"config" jsonb,
  	"measurements_length" numeric NOT NULL,
  	"measurements_bust" numeric NOT NULL,
  	"measurements_shoulder" numeric NOT NULL,
  	"measurements_sleeve" numeric NOT NULL,
  	"measurements_hips" numeric NOT NULL,
  	"measurements_height" numeric NOT NULL,
  	"notes" varchar,
  	"quantity" numeric DEFAULT 1 NOT NULL
  );
  
  CREATE TABLE "carts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"token" varchar NOT NULL,
  	"pending_order_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"orders_id" integer,
  	"designs_id" integer,
  	"media_id" integer,
  	"users_id" integer,
  	"carts_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "store_settings_order_notification_emails" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"email" varchar NOT NULL
  );
  
  CREATE TABLE "store_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"custom_abaya_price" numeric DEFAULT 0 NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "store_settings_locales" (
  	"default_lead_time" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "orders_lines_choices" ADD CONSTRAINT "orders_lines_choices_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."orders_lines"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "orders_lines" ADD CONSTRAINT "orders_lines_design_id_designs_id_fk" FOREIGN KEY ("design_id") REFERENCES "public"."designs"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "orders_lines" ADD CONSTRAINT "orders_lines_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "designs_locales" ADD CONSTRAINT "designs_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."designs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "designs_rels" ADD CONSTRAINT "designs_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."designs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "designs_rels" ADD CONSTRAINT "designs_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "media_locales" ADD CONSTRAINT "media_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "carts_lines" ADD CONSTRAINT "carts_lines_design_id_designs_id_fk" FOREIGN KEY ("design_id") REFERENCES "public"."designs"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "carts_lines" ADD CONSTRAINT "carts_lines_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."carts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "carts" ADD CONSTRAINT "carts_pending_order_id_orders_id_fk" FOREIGN KEY ("pending_order_id") REFERENCES "public"."orders"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_orders_fk" FOREIGN KEY ("orders_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_designs_fk" FOREIGN KEY ("designs_id") REFERENCES "public"."designs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_carts_fk" FOREIGN KEY ("carts_id") REFERENCES "public"."carts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "store_settings_order_notification_emails" ADD CONSTRAINT "store_settings_order_notification_emails_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."store_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "store_settings_locales" ADD CONSTRAINT "store_settings_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."store_settings"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "orders_lines_choices_order_idx" ON "orders_lines_choices" USING btree ("_order");
  CREATE INDEX "orders_lines_choices_parent_id_idx" ON "orders_lines_choices" USING btree ("_parent_id");
  CREATE INDEX "orders_lines_order_idx" ON "orders_lines" USING btree ("_order");
  CREATE INDEX "orders_lines_parent_id_idx" ON "orders_lines" USING btree ("_parent_id");
  CREATE INDEX "orders_lines_design_idx" ON "orders_lines" USING btree ("design_id");
  CREATE UNIQUE INDEX "orders_number_idx" ON "orders" USING btree ("number");
  CREATE INDEX "orders_status_idx" ON "orders" USING btree ("status");
  CREATE UNIQUE INDEX "orders_stripe_checkout_session_id_idx" ON "orders" USING btree ("stripe_checkout_session_id");
  CREATE INDEX "orders_updated_at_idx" ON "orders" USING btree ("updated_at");
  CREATE INDEX "orders_created_at_idx" ON "orders" USING btree ("created_at");
  CREATE UNIQUE INDEX "designs_slug_idx" ON "designs" USING btree ("slug");
  CREATE INDEX "designs_updated_at_idx" ON "designs" USING btree ("updated_at");
  CREATE INDEX "designs_created_at_idx" ON "designs" USING btree ("created_at");
  CREATE UNIQUE INDEX "designs_locales_locale_parent_id_unique" ON "designs_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "designs_locales_parent_id_idx" ON "designs_locales" USING btree ("_parent_id");
  CREATE INDEX "designs_rels_order_idx" ON "designs_rels" USING btree ("order");
  CREATE INDEX "designs_rels_parent_idx" ON "designs_rels" USING btree ("parent_id");
  CREATE INDEX "designs_rels_path_idx" ON "designs_rels" USING btree ("path");
  CREATE INDEX "designs_rels_media_id_idx" ON "designs_rels" USING btree ("media_id");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE UNIQUE INDEX "media_locales_locale_parent_id_unique" ON "media_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "media_locales_parent_id_idx" ON "media_locales" USING btree ("_parent_id");
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE INDEX "carts_lines_order_idx" ON "carts_lines" USING btree ("_order");
  CREATE INDEX "carts_lines_parent_id_idx" ON "carts_lines" USING btree ("_parent_id");
  CREATE INDEX "carts_lines_design_idx" ON "carts_lines" USING btree ("design_id");
  CREATE UNIQUE INDEX "carts_token_idx" ON "carts" USING btree ("token");
  CREATE INDEX "carts_pending_order_idx" ON "carts" USING btree ("pending_order_id");
  CREATE INDEX "carts_updated_at_idx" ON "carts" USING btree ("updated_at");
  CREATE INDEX "carts_created_at_idx" ON "carts" USING btree ("created_at");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_orders_id_idx" ON "payload_locked_documents_rels" USING btree ("orders_id");
  CREATE INDEX "payload_locked_documents_rels_designs_id_idx" ON "payload_locked_documents_rels" USING btree ("designs_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_carts_id_idx" ON "payload_locked_documents_rels" USING btree ("carts_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE INDEX "store_settings_order_notification_emails_order_idx" ON "store_settings_order_notification_emails" USING btree ("_order");
  CREATE INDEX "store_settings_order_notification_emails_parent_id_idx" ON "store_settings_order_notification_emails" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "store_settings_locales_locale_parent_id_unique" ON "store_settings_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "store_settings_locales_parent_id_idx" ON "store_settings_locales" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "orders_lines_choices" CASCADE;
  DROP TABLE "orders_lines" CASCADE;
  DROP TABLE "orders" CASCADE;
  DROP TABLE "designs" CASCADE;
  DROP TABLE "designs_locales" CASCADE;
  DROP TABLE "designs_rels" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "media_locales" CASCADE;
  DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "carts_lines" CASCADE;
  DROP TABLE "carts" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "store_settings_order_notification_emails" CASCADE;
  DROP TABLE "store_settings" CASCADE;
  DROP TABLE "store_settings_locales" CASCADE;
  DROP TYPE "public"."_locales";
  DROP TYPE "public"."enum_orders_lines_kind";
  DROP TYPE "public"."enum_orders_status";
  DROP TYPE "public"."enum_orders_locale";
  DROP TYPE "public"."enum_designs_drawing";
  DROP TYPE "public"."enum_carts_lines_kind";`)
}
