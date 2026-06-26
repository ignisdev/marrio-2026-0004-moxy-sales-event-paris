-- Manual migration: localize Artworks.videoAsset and Artworks.posterImage
-- Target: PostgreSQL (Neon / local).
-- Moves video_asset_id / poster_image_id from "artworks" to "artworks_locales"
-- (per-locale), PRESERVING existing values by copying them into the 'en' locale
-- before dropping the source columns.
-- Mirrors src/migrations/20260625_151000_localize_video_poster.ts.
--
-- Run once per database. Guarded so re-running won't hard-error.

BEGIN;

-- 1. Drop old base-table constraints/indexes (no-op if already gone)
ALTER TABLE "artworks" DROP CONSTRAINT IF EXISTS "artworks_video_asset_id_media_id_fk";
ALTER TABLE "artworks" DROP CONSTRAINT IF EXISTS "artworks_poster_image_id_media_id_fk";
DROP INDEX IF EXISTS "artworks_video_asset_idx";
DROP INDEX IF EXISTS "artworks_poster_image_idx";

-- 2. Add the localized columns to the locales table
ALTER TABLE "artworks_locales" ADD COLUMN IF NOT EXISTS "video_asset_id" integer;
ALTER TABLE "artworks_locales" ADD COLUMN IF NOT EXISTS "poster_image_id" integer;

DO $$ BEGIN
  ALTER TABLE "artworks_locales" ADD CONSTRAINT "artworks_locales_video_asset_id_media_id_fk"
    FOREIGN KEY ("video_asset_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "artworks_locales" ADD CONSTRAINT "artworks_locales_poster_image_id_media_id_fk"
    FOREIGN KEY ("poster_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS "artworks_video_asset_idx"
  ON "artworks_locales" USING btree ("video_asset_id","_locale");
CREATE INDEX IF NOT EXISTS "artworks_poster_image_idx"
  ON "artworks_locales" USING btree ("poster_image_id","_locale");

-- 3. PRESERVE DATA: copy existing associations into the default ('en') locale.
--    Only runs while the source columns still exist on "artworks".
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'artworks' AND column_name = 'video_asset_id'
  ) THEN
    UPDATE "artworks_locales" "al"
    SET "video_asset_id" = "a"."video_asset_id",
        "poster_image_id" = "a"."poster_image_id"
    FROM "artworks" "a"
    WHERE "al"."_parent_id" = "a"."id" AND "al"."_locale" = 'en';
  END IF;
END $$;

-- 4. Drop the old base-table columns
ALTER TABLE "artworks" DROP COLUMN IF EXISTS "video_asset_id";
ALTER TABLE "artworks" DROP COLUMN IF EXISTS "poster_image_id";

-- 5. Record this migration as applied (skips if already recorded)
INSERT INTO "payload_migrations" ("name", "batch")
SELECT '20260625_151000_localize_video_poster', 1
WHERE NOT EXISTS (
  SELECT 1 FROM "payload_migrations"
  WHERE "name" = '20260625_151000_localize_video_poster'
);

COMMIT;
