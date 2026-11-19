import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_orders_lines_measurements_unit" AS ENUM('in', 'cm', 'legacy');
  CREATE TYPE "public"."enum_users_measurement_unit" AS ENUM('entered', 'in', 'cm');
  CREATE TYPE "public"."enum_carts_lines_measurements_unit" AS ENUM('in', 'cm', 'legacy');
  ALTER TABLE "orders_lines" ADD COLUMN "measurements_unit" "enum_orders_lines_measurements_unit" DEFAULT 'legacy' NOT NULL;
  ALTER TABLE "designs_locales" ADD COLUMN "composition" varchar;
  ALTER TABLE "designs_locales" ADD COLUMN "care" varchar;
  ALTER TABLE "designs_locales" ADD COLUMN "origin" varchar;
  ALTER TABLE "designs_rels" ADD COLUMN "designs_id" integer;
  ALTER TABLE "users" ADD COLUMN "measurement_unit" "enum_users_measurement_unit" DEFAULT 'entered' NOT NULL;
  ALTER TABLE "carts_lines" ADD COLUMN "measurements_unit" "enum_carts_lines_measurements_unit" DEFAULT 'legacy' NOT NULL;
  ALTER TABLE "designs_rels" ADD CONSTRAINT "designs_rels_designs_fk" FOREIGN KEY ("designs_id") REFERENCES "public"."designs"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "designs_rels_designs_id_idx" ON "designs_rels" USING btree ("designs_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "designs_rels" DROP CONSTRAINT "designs_rels_designs_fk";
  
  DROP INDEX "designs_rels_designs_id_idx";
  ALTER TABLE "orders_lines" DROP COLUMN "measurements_unit";
  ALTER TABLE "designs_locales" DROP COLUMN "composition";
  ALTER TABLE "designs_locales" DROP COLUMN "care";
  ALTER TABLE "designs_locales" DROP COLUMN "origin";
  ALTER TABLE "designs_rels" DROP COLUMN "designs_id";
  ALTER TABLE "users" DROP COLUMN "measurement_unit";
  ALTER TABLE "carts_lines" DROP COLUMN "measurements_unit";
  DROP TYPE "public"."enum_orders_lines_measurements_unit";
  DROP TYPE "public"."enum_users_measurement_unit";
  DROP TYPE "public"."enum_carts_lines_measurements_unit";`)
}
