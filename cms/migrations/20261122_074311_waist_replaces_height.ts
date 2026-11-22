import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "orders_lines" ALTER COLUMN "measurements_length" DROP NOT NULL;
  ALTER TABLE "orders_lines" ALTER COLUMN "measurements_shoulder" DROP NOT NULL;
  ALTER TABLE "orders_lines" ALTER COLUMN "measurements_bust" DROP NOT NULL;
  ALTER TABLE "orders_lines" ALTER COLUMN "measurements_sleeve" DROP NOT NULL;
  ALTER TABLE "orders_lines" ALTER COLUMN "measurements_hips" DROP NOT NULL;
  ALTER TABLE "customers_profiles" ALTER COLUMN "measurements_length" DROP NOT NULL;
  ALTER TABLE "customers_profiles" ALTER COLUMN "measurements_shoulder" DROP NOT NULL;
  ALTER TABLE "customers_profiles" ALTER COLUMN "measurements_bust" DROP NOT NULL;
  ALTER TABLE "customers_profiles" ALTER COLUMN "measurements_sleeve" DROP NOT NULL;
  ALTER TABLE "customers_profiles" ALTER COLUMN "measurements_hips" DROP NOT NULL;
  ALTER TABLE "carts_lines" ALTER COLUMN "measurements_length" DROP NOT NULL;
  ALTER TABLE "carts_lines" ALTER COLUMN "measurements_shoulder" DROP NOT NULL;
  ALTER TABLE "carts_lines" ALTER COLUMN "measurements_bust" DROP NOT NULL;
  ALTER TABLE "carts_lines" ALTER COLUMN "measurements_sleeve" DROP NOT NULL;
  ALTER TABLE "carts_lines" ALTER COLUMN "measurements_hips" DROP NOT NULL;
  ALTER TABLE "orders_lines" ADD COLUMN "measurements_waist" numeric;
  ALTER TABLE "customers_profiles" ADD COLUMN "measurements_waist" numeric;
  ALTER TABLE "carts_lines" ADD COLUMN "measurements_waist" numeric;
  ALTER TABLE "orders_lines" DROP COLUMN "measurements_height";
  ALTER TABLE "customers_profiles" DROP COLUMN "measurements_height";
  ALTER TABLE "carts_lines" DROP COLUMN "measurements_height";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "orders_lines" ALTER COLUMN "measurements_length" SET NOT NULL;
  ALTER TABLE "orders_lines" ALTER COLUMN "measurements_shoulder" SET NOT NULL;
  ALTER TABLE "orders_lines" ALTER COLUMN "measurements_bust" SET NOT NULL;
  ALTER TABLE "orders_lines" ALTER COLUMN "measurements_hips" SET NOT NULL;
  ALTER TABLE "orders_lines" ALTER COLUMN "measurements_sleeve" SET NOT NULL;
  ALTER TABLE "customers_profiles" ALTER COLUMN "measurements_length" SET NOT NULL;
  ALTER TABLE "customers_profiles" ALTER COLUMN "measurements_shoulder" SET NOT NULL;
  ALTER TABLE "customers_profiles" ALTER COLUMN "measurements_bust" SET NOT NULL;
  ALTER TABLE "customers_profiles" ALTER COLUMN "measurements_hips" SET NOT NULL;
  ALTER TABLE "customers_profiles" ALTER COLUMN "measurements_sleeve" SET NOT NULL;
  ALTER TABLE "carts_lines" ALTER COLUMN "measurements_length" SET NOT NULL;
  ALTER TABLE "carts_lines" ALTER COLUMN "measurements_shoulder" SET NOT NULL;
  ALTER TABLE "carts_lines" ALTER COLUMN "measurements_bust" SET NOT NULL;
  ALTER TABLE "carts_lines" ALTER COLUMN "measurements_hips" SET NOT NULL;
  ALTER TABLE "carts_lines" ALTER COLUMN "measurements_sleeve" SET NOT NULL;
  ALTER TABLE "orders_lines" ADD COLUMN "measurements_height" numeric;
  ALTER TABLE "customers_profiles" ADD COLUMN "measurements_height" numeric;
  ALTER TABLE "carts_lines" ADD COLUMN "measurements_height" numeric;
  ALTER TABLE "orders_lines" DROP COLUMN "measurements_waist";
  ALTER TABLE "customers_profiles" DROP COLUMN "measurements_waist";
  ALTER TABLE "carts_lines" DROP COLUMN "measurements_waist";`)
}
