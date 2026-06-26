import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

import { sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "artworks" DROP CONSTRAINT "artworks_video_asset_id_media_id_fk";

  ALTER TABLE "artworks" DROP CONSTRAINT "artworks_poster_image_id_media_id_fk";

  DROP INDEX "artworks_video_asset_idx";
  DROP INDEX "artworks_poster_image_idx";
  ALTER TABLE "artworks_locales" ADD COLUMN "video_asset_id" integer;
  ALTER TABLE "artworks_locales" ADD COLUMN "poster_image_id" integer;
  ALTER TABLE "artworks_locales" ADD CONSTRAINT "artworks_locales_video_asset_id_media_id_fk" FOREIGN KEY ("video_asset_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "artworks_locales" ADD CONSTRAINT "artworks_locales_poster_image_id_media_id_fk" FOREIGN KEY ("poster_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "artworks_video_asset_idx" ON "artworks_locales" USING btree ("video_asset_id","_locale");
  CREATE INDEX "artworks_poster_image_idx" ON "artworks_locales" USING btree ("poster_image_id","_locale");

  -- Preserve existing (non-localized) associations by copying them into the
  -- default locale before the source columns are dropped.
  UPDATE "artworks_locales" "al"
  SET "video_asset_id" = "a"."video_asset_id",
      "poster_image_id" = "a"."poster_image_id"
  FROM "artworks" "a"
  WHERE "al"."_parent_id" = "a"."id" AND "al"."_locale" = 'en';

  ALTER TABLE "artworks" DROP COLUMN "video_asset_id";
  ALTER TABLE "artworks" DROP COLUMN "poster_image_id";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "artworks_locales" DROP CONSTRAINT "artworks_locales_video_asset_id_media_id_fk";
  
  ALTER TABLE "artworks_locales" DROP CONSTRAINT "artworks_locales_poster_image_id_media_id_fk";
  
  DROP INDEX "artworks_video_asset_idx";
  DROP INDEX "artworks_poster_image_idx";
  ALTER TABLE "artworks" ADD COLUMN "video_asset_id" integer;
  ALTER TABLE "artworks" ADD COLUMN "poster_image_id" integer;
  ALTER TABLE "artworks" ADD CONSTRAINT "artworks_video_asset_id_media_id_fk" FOREIGN KEY ("video_asset_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "artworks" ADD CONSTRAINT "artworks_poster_image_id_media_id_fk" FOREIGN KEY ("poster_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "artworks_video_asset_idx" ON "artworks" USING btree ("video_asset_id");
  CREATE INDEX "artworks_poster_image_idx" ON "artworks" USING btree ("poster_image_id");

  -- Restore the default-locale associations back onto the base table.
  UPDATE "artworks" "a"
  SET "video_asset_id" = "al"."video_asset_id",
      "poster_image_id" = "al"."poster_image_id"
  FROM "artworks_locales" "al"
  WHERE "al"."_parent_id" = "a"."id" AND "al"."_locale" = 'en';

  ALTER TABLE "artworks_locales" DROP COLUMN "video_asset_id";
  ALTER TABLE "artworks_locales" DROP COLUMN "poster_image_id";`)
}
