import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

import { sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "artworks_qr_external_urls" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"url" varchar NOT NULL
  );
  
  ALTER TABLE "artworks_qr_external_urls" ADD CONSTRAINT "artworks_qr_external_urls_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."artworks"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "artworks_qr_external_urls_order_idx" ON "artworks_qr_external_urls" USING btree ("_order");
  CREATE INDEX "artworks_qr_external_urls_parent_id_idx" ON "artworks_qr_external_urls" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "artworks_qr_external_urls" CASCADE;`)
}
