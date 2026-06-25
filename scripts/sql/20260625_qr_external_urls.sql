-- Manual migration: Artworks.qrExternalUrls
-- Target: PostgreSQL (Neon / local). Idempotent — safe to paste into any
-- environment whether or not the table already exists.
-- Mirrors src/migrations/20260625_134347_qr_external_urls.ts and records the
-- migration in payload_migrations so `payload migrate` treats it as applied.

-- 1. Array-field table for Artworks.qrExternalUrls
CREATE TABLE IF NOT EXISTS "artworks_qr_external_urls" (
  "_order"     integer     NOT NULL,
  "_parent_id" integer     NOT NULL,
  "id"         varchar     PRIMARY KEY NOT NULL,
  "url"        varchar     NOT NULL
);

-- 2. Foreign key back to artworks (guarded so re-running won't error)
DO $$ BEGIN
  ALTER TABLE "artworks_qr_external_urls"
    ADD CONSTRAINT "artworks_qr_external_urls_parent_id_fk"
    FOREIGN KEY ("_parent_id") REFERENCES "public"."artworks"("id")
    ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 3. Indexes
CREATE INDEX IF NOT EXISTS "artworks_qr_external_urls_order_idx"
  ON "artworks_qr_external_urls" USING btree ("_order");
CREATE INDEX IF NOT EXISTS "artworks_qr_external_urls_parent_id_idx"
  ON "artworks_qr_external_urls" USING btree ("_parent_id");

-- 4. Record this migration as applied (skips if already recorded).
--    id/created_at/updated_at use table defaults.
INSERT INTO "payload_migrations" ("name", "batch")
SELECT '20260625_134347_qr_external_urls', 1
WHERE NOT EXISTS (
  SELECT 1 FROM "payload_migrations"
  WHERE "name" = '20260625_134347_qr_external_urls'
);

-- 5. OPTIONAL — only needed on databases whose payload_migrations table has no
--    record of the initial migration (e.g. local dev built via push). Lets
--    `payload migrate` run cleanly there without re-applying the initial schema.
-- INSERT INTO "payload_migrations" ("name", "batch")
-- SELECT '20260624_110437_initial', 1
-- WHERE NOT EXISTS (
--   SELECT 1 FROM "payload_migrations"
--   WHERE "name" = '20260624_110437_initial'
-- );
