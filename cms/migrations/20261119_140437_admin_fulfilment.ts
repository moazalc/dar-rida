import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_orders_history_status" AS ENUM('pending_payment', 'paid', 'in_production', 'shipped', 'completed', 'cancelled');
  CREATE TYPE "public"."enum_orders_carrier" AS ENUM('aramex', 'dhl', 'fedex', 'ups', 'emirates_post', 'other');
  CREATE TABLE "orders_history" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"status" "enum_orders_history_status" NOT NULL,
  	"at" timestamp(3) with time zone NOT NULL,
  	"by" varchar
  );
  
  ALTER TABLE "orders" ADD COLUMN "ready_by" timestamp(3) with time zone;
  ALTER TABLE "orders" ADD COLUMN "production_started_at" timestamp(3) with time zone;
  ALTER TABLE "orders" ADD COLUMN "carrier" "enum_orders_carrier";
  ALTER TABLE "orders" ADD COLUMN "tracking_number" varchar;
  ALTER TABLE "orders" ADD COLUMN "tracking_url" varchar;
  ALTER TABLE "orders" ADD COLUMN "shipped_at" timestamp(3) with time zone;
  ALTER TABLE "orders" ADD COLUMN "expected_delivery" timestamp(3) with time zone;
  ALTER TABLE "orders" ADD COLUMN "delivered_at" timestamp(3) with time zone;
  ALTER TABLE "orders" ADD COLUMN "cancelled_at" timestamp(3) with time zone;
  ALTER TABLE "orders" ADD COLUMN "cancel_reason" varchar;
  ALTER TABLE "orders" ADD COLUMN "shipped_email_sent_at" timestamp(3) with time zone;
  ALTER TABLE "designs" ADD COLUMN "making_days" numeric;
  ALTER TABLE "store_settings" ADD COLUMN "default_making_days" numeric DEFAULT 14;
  ALTER TABLE "shipping_zones" ADD COLUMN "delivery_days" numeric;
  ALTER TABLE "shipping" ADD COLUMN "uae_delivery_days" numeric;
  ALTER TABLE "shipping" ADD COLUMN "rest_of_world_delivery_days" numeric;
  ALTER TABLE "orders_history" ADD CONSTRAINT "orders_history_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "orders_history_order_idx" ON "orders_history" USING btree ("_order");
  CREATE INDEX "orders_history_parent_id_idx" ON "orders_history" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "orders_history" CASCADE;
  ALTER TABLE "orders" DROP COLUMN "ready_by";
  ALTER TABLE "orders" DROP COLUMN "production_started_at";
  ALTER TABLE "orders" DROP COLUMN "carrier";
  ALTER TABLE "orders" DROP COLUMN "tracking_number";
  ALTER TABLE "orders" DROP COLUMN "tracking_url";
  ALTER TABLE "orders" DROP COLUMN "shipped_at";
  ALTER TABLE "orders" DROP COLUMN "expected_delivery";
  ALTER TABLE "orders" DROP COLUMN "delivered_at";
  ALTER TABLE "orders" DROP COLUMN "cancelled_at";
  ALTER TABLE "orders" DROP COLUMN "cancel_reason";
  ALTER TABLE "orders" DROP COLUMN "shipped_email_sent_at";
  ALTER TABLE "designs" DROP COLUMN "making_days";
  ALTER TABLE "store_settings" DROP COLUMN "default_making_days";
  ALTER TABLE "shipping_zones" DROP COLUMN "delivery_days";
  ALTER TABLE "shipping" DROP COLUMN "uae_delivery_days";
  ALTER TABLE "shipping" DROP COLUMN "rest_of_world_delivery_days";
  DROP TYPE "public"."enum_orders_history_status";
  DROP TYPE "public"."enum_orders_carrier";`)
}
