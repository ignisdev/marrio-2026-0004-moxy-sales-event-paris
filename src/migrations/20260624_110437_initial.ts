import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."_locales" AS ENUM('en', 'fr');
  CREATE TYPE "public"."enum_media_asset_type" AS ENUM('image', 'video', 'poster', 'fallback');
  CREATE TYPE "public"."enum_events_supported_locales_locale" AS ENUM('en', 'fr');
  CREATE TYPE "public"."enum_events_status" AS ENUM('draft', 'active', 'closed');
  CREATE TYPE "public"."enum_events_default_locale" AS ENUM('en', 'fr');
  CREATE TYPE "public"."enum_participants_preferred_locale" AS ENUM('en', 'fr');
  CREATE TYPE "public"."enum_scan_events_locale" AS ENUM('en', 'fr');
  CREATE TYPE "public"."enum_scan_events_source" AS ENUM('qr', 'manual', 'staff_test');
  CREATE TABLE "admin_users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "admin_users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"asset_type" "enum_media_asset_type" DEFAULT 'image' NOT NULL,
  	"event_id" integer,
  	"artwork_id" integer,
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
  	"caption" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "events_supported_locales" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"locale" "enum_events_supported_locales_locale"
  );
  
  CREATE TABLE "events" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar NOT NULL,
  	"event_date" timestamp(3) with time zone NOT NULL,
  	"status" "enum_events_status" DEFAULT 'draft' NOT NULL,
  	"default_locale" "enum_events_default_locale" DEFAULT 'en' NOT NULL,
  	"total_required_artworks" numeric DEFAULT 5 NOT NULL,
  	"public_progress_enabled" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "events_locales" (
  	"title" varchar NOT NULL,
  	"venue_name" varchar NOT NULL,
  	"city" varchar NOT NULL,
  	"intro_copy" varchar,
  	"instructions_copy" varchar,
  	"completion_copy" varchar,
  	"prize_copy" varchar,
  	"bonvoy_copy" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "artworks" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar NOT NULL,
  	"event_id" integer NOT NULL,
  	"display_order" numeric DEFAULT 0 NOT NULL,
  	"locked_image_id" integer,
  	"revealed_image_id" integer,
  	"video_asset_id" integer,
  	"poster_image_id" integer,
  	"is_active" boolean DEFAULT true,
  	"is_bonvoy_bonus" boolean DEFAULT false,
  	"qr_path" varchar,
  	"qr_token" varchar NOT NULL,
  	"qr_label" varchar,
  	"qr_is_active" boolean DEFAULT true,
  	"qr_dynamic_slug" varchar,
  	"qr_dynamic_url" varchar,
  	"qr_dynamic_destination" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "artworks_locales" (
  	"title" varchar NOT NULL,
  	"theme" varchar,
  	"location_label" varchar,
  	"clue_text" varchar,
  	"brand_story" varchar,
  	"completion_message" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "participants" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"uid" varchar NOT NULL,
  	"event_id" integer NOT NULL,
  	"first_name" varchar NOT NULL,
  	"last_name" varchar,
  	"display_name" varchar NOT NULL,
  	"email" varchar,
  	"company" varchar,
  	"preferred_locale" "enum_participants_preferred_locale" DEFAULT 'en',
  	"is_bonvoy_member" boolean DEFAULT false,
  	"marketing_consent" boolean DEFAULT false,
  	"terms_accepted" boolean DEFAULT false NOT NULL,
  	"registered_at" timestamp(3) with time zone NOT NULL,
  	"last_active_at" timestamp(3) with time zone,
  	"completed_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "scan_events" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"event_id" integer NOT NULL,
  	"participant_id" integer NOT NULL,
  	"artwork_id" integer NOT NULL,
  	"scanned_at" timestamp(3) with time zone NOT NULL,
  	"locale" "enum_scan_events_locale" DEFAULT 'en',
  	"user_agent" varchar,
  	"ip_hash" varchar,
  	"source" "enum_scan_events_source" DEFAULT 'qr' NOT NULL,
  	"is_first_scan_for_artwork" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "reward_entries" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"event_id" integer NOT NULL,
  	"participant_id" integer NOT NULL,
  	"is_complete" boolean DEFAULT false,
  	"completed_at" timestamp(3) with time zone,
  	"standard_reward_eligible" boolean DEFAULT false,
  	"bonvoy_reward_eligible" boolean DEFAULT false,
  	"prize_draw_entries" numeric DEFAULT 0,
  	"reward_claimed" boolean DEFAULT false,
  	"claimed_at" timestamp(3) with time zone,
  	"staff_notes" varchar,
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
  	"admin_users_id" integer,
  	"media_id" integer,
  	"events_id" integer,
  	"artworks_id" integer,
  	"participants_id" integer,
  	"scan_events_id" integer,
  	"reward_entries_id" integer
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
  	"admin_users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "site_copy" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "site_copy_locales" (
  	"heading_art_hunter" varchar DEFAULT 'THE
  ART
  HUNTER',
  	"heading_how_to_play" varchar DEFAULT 'HOW
  TO
  PLAY',
  	"heading_pixel_perfect" varchar DEFAULT 'PIXEL
  PERFECT!',
  	"heading_register" varchar DEFAULT 'You''re
  SO
  MOXY',
  	"landing_intro" varchar DEFAULT 'Can you hunt down all 5
  pixelated artworks
  hidden around the Moxy?',
  	"landing_play_on" varchar DEFAULT 'Play On',
  	"landing_register_cta" varchar DEFAULT 'Register',
  	"step1" varchar DEFAULT 'Register your name',
  	"step2" varchar DEFAULT 'Locate the artworks',
  	"step3" varchar DEFAULT 'Scan the QR codes to
  reveal the unexpected',
  	"step4" varchar DEFAULT 'Complete the Moxy
  Gallery to receive
  your reward!',
  	"register_prompt" varchar DEFAULT 'Register your name',
  	"register_name_placeholder" varchar DEFAULT 'Name',
  	"register_phone_placeholder" varchar DEFAULT 'Phone number',
  	"register_email_placeholder" varchar DEFAULT 'Email',
  	"register_terms" varchar DEFAULT 'I agree to and understand the terms & conditions',
  	"register_terms_link" varchar DEFAULT 'Terms & Conditions',
  	"register_submit" varchar DEFAULT 'Submit',
  	"register_error" varchar DEFAULT 'Registration failed. Please check your details and try again.',
  	"gallery_title" varchar DEFAULT 'The Gallery',
  	"gallery_you_have_found" varchar DEFAULT 'YOU HAVE FOUND',
  	"gallery_scan_artwork" varchar DEFAULT 'Scan Artwork',
  	"gallery_tap_to_open" varchar DEFAULT 'Tap to open camera',
  	"complete_congrats" varchar DEFAULT 'Congratulations!',
  	"complete_gallery" varchar DEFAULT 'You''ve completed
  the gallery!',
  	"complete_claim" varchar DEFAULT 'Locate your Moxy brand ambassador
  to claim your reward.',
  	"complete_back" varchar DEFAULT 'Back to gallery',
  	"nav_your_gallery" varchar DEFAULT 'Your gallery',
  	"nav_account" varchar DEFAULT 'Account',
  	"nav_register" varchar DEFAULT 'Register',
  	"nav_sign_in" varchar DEFAULT 'Sign in',
  	"scanner_start_label" varchar DEFAULT 'Start scanning',
  	"scanner_found" varchar DEFAULT 'Found an artwork?
  Scan the QR code and
  reveal the unexpected',
  	"scanner_go_to_gallery" varchar DEFAULT 'Go to gallery',
  	"scanner_unlocked" varchar DEFAULT 'Artwork unlocked',
  	"scanner_opening" varchar DEFAULT 'Opening artwork…',
  	"scanner_stop" varchar DEFAULT 'Stop',
  	"scanner_saving" varchar DEFAULT 'Saving scan…',
  	"scanner_camera_denied" varchar DEFAULT 'Camera permission denied.',
  	"reveal_play" varchar DEFAULT 'Play',
  	"reveal_tap_for_sound" varchar DEFAULT 'Tap for sound',
  	"login_heading" varchar DEFAULT 'Welcome
  BACK',
  	"login_prompt" varchar DEFAULT 'Enter your email to continue',
  	"login_email_placeholder" varchar DEFAULT 'Email',
  	"login_continue" varchar DEFAULT 'Continue',
  	"login_new_here" varchar DEFAULT 'New here?',
  	"login_register_link" varchar DEFAULT 'Register',
  	"login_not_found" varchar DEFAULT 'No registration found. Please register first.',
  	"share_copied" varchar DEFAULT 'Copied!',
  	"share_copy_hint" varchar DEFAULT 'Tap to copy your link',
  	"network_error" varchar DEFAULT 'Network error. Please check your connection.',
  	"locked_artwork_alt" varchar DEFAULT 'Locked artwork',
  	"reward_eligible" varchar DEFAULT 'Reward eligible',
  	"complete_title" varchar DEFAULT 'Gallery complete',
  	"complete_verify_note" varchar DEFAULT 'Completion and reward eligibility will be verified server-side from scan data.',
  	"complete_view_gallery" varchar DEFAULT 'View gallery',
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "admin_users_sessions" ADD CONSTRAINT "admin_users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."admin_users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "media" ADD CONSTRAINT "media_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "media" ADD CONSTRAINT "media_artwork_id_artworks_id_fk" FOREIGN KEY ("artwork_id") REFERENCES "public"."artworks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "media_locales" ADD CONSTRAINT "media_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "events_supported_locales" ADD CONSTRAINT "events_supported_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "events_locales" ADD CONSTRAINT "events_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "artworks" ADD CONSTRAINT "artworks_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "artworks" ADD CONSTRAINT "artworks_locked_image_id_media_id_fk" FOREIGN KEY ("locked_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "artworks" ADD CONSTRAINT "artworks_revealed_image_id_media_id_fk" FOREIGN KEY ("revealed_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "artworks" ADD CONSTRAINT "artworks_video_asset_id_media_id_fk" FOREIGN KEY ("video_asset_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "artworks" ADD CONSTRAINT "artworks_poster_image_id_media_id_fk" FOREIGN KEY ("poster_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "artworks_locales" ADD CONSTRAINT "artworks_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."artworks"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "participants" ADD CONSTRAINT "participants_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "scan_events" ADD CONSTRAINT "scan_events_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "scan_events" ADD CONSTRAINT "scan_events_participant_id_participants_id_fk" FOREIGN KEY ("participant_id") REFERENCES "public"."participants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "scan_events" ADD CONSTRAINT "scan_events_artwork_id_artworks_id_fk" FOREIGN KEY ("artwork_id") REFERENCES "public"."artworks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "reward_entries" ADD CONSTRAINT "reward_entries_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "reward_entries" ADD CONSTRAINT "reward_entries_participant_id_participants_id_fk" FOREIGN KEY ("participant_id") REFERENCES "public"."participants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_admin_users_fk" FOREIGN KEY ("admin_users_id") REFERENCES "public"."admin_users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_events_fk" FOREIGN KEY ("events_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_artworks_fk" FOREIGN KEY ("artworks_id") REFERENCES "public"."artworks"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_participants_fk" FOREIGN KEY ("participants_id") REFERENCES "public"."participants"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_scan_events_fk" FOREIGN KEY ("scan_events_id") REFERENCES "public"."scan_events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_reward_entries_fk" FOREIGN KEY ("reward_entries_id") REFERENCES "public"."reward_entries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_admin_users_fk" FOREIGN KEY ("admin_users_id") REFERENCES "public"."admin_users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_copy_locales" ADD CONSTRAINT "site_copy_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_copy"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "admin_users_sessions_order_idx" ON "admin_users_sessions" USING btree ("_order");
  CREATE INDEX "admin_users_sessions_parent_id_idx" ON "admin_users_sessions" USING btree ("_parent_id");
  CREATE INDEX "admin_users_updated_at_idx" ON "admin_users" USING btree ("updated_at");
  CREATE INDEX "admin_users_created_at_idx" ON "admin_users" USING btree ("created_at");
  CREATE UNIQUE INDEX "admin_users_email_idx" ON "admin_users" USING btree ("email");
  CREATE INDEX "media_event_idx" ON "media" USING btree ("event_id");
  CREATE INDEX "media_artwork_idx" ON "media" USING btree ("artwork_id");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE UNIQUE INDEX "media_locales_locale_parent_id_unique" ON "media_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "events_supported_locales_order_idx" ON "events_supported_locales" USING btree ("_order");
  CREATE INDEX "events_supported_locales_parent_id_idx" ON "events_supported_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "events_slug_idx" ON "events" USING btree ("slug");
  CREATE INDEX "events_updated_at_idx" ON "events" USING btree ("updated_at");
  CREATE INDEX "events_created_at_idx" ON "events" USING btree ("created_at");
  CREATE UNIQUE INDEX "events_locales_locale_parent_id_unique" ON "events_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "artworks_slug_idx" ON "artworks" USING btree ("slug");
  CREATE INDEX "artworks_event_idx" ON "artworks" USING btree ("event_id");
  CREATE INDEX "artworks_locked_image_idx" ON "artworks" USING btree ("locked_image_id");
  CREATE INDEX "artworks_revealed_image_idx" ON "artworks" USING btree ("revealed_image_id");
  CREATE INDEX "artworks_video_asset_idx" ON "artworks" USING btree ("video_asset_id");
  CREATE INDEX "artworks_poster_image_idx" ON "artworks" USING btree ("poster_image_id");
  CREATE UNIQUE INDEX "artworks_qr_token_idx" ON "artworks" USING btree ("qr_token");
  CREATE UNIQUE INDEX "artworks_qr_dynamic_slug_idx" ON "artworks" USING btree ("qr_dynamic_slug");
  CREATE INDEX "artworks_updated_at_idx" ON "artworks" USING btree ("updated_at");
  CREATE INDEX "artworks_created_at_idx" ON "artworks" USING btree ("created_at");
  CREATE UNIQUE INDEX "artworks_locales_locale_parent_id_unique" ON "artworks_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "participants_uid_idx" ON "participants" USING btree ("uid");
  CREATE INDEX "participants_event_idx" ON "participants" USING btree ("event_id");
  CREATE INDEX "participants_updated_at_idx" ON "participants" USING btree ("updated_at");
  CREATE INDEX "participants_created_at_idx" ON "participants" USING btree ("created_at");
  CREATE INDEX "scan_events_event_idx" ON "scan_events" USING btree ("event_id");
  CREATE INDEX "scan_events_participant_idx" ON "scan_events" USING btree ("participant_id");
  CREATE INDEX "scan_events_artwork_idx" ON "scan_events" USING btree ("artwork_id");
  CREATE INDEX "scan_events_updated_at_idx" ON "scan_events" USING btree ("updated_at");
  CREATE INDEX "scan_events_created_at_idx" ON "scan_events" USING btree ("created_at");
  CREATE INDEX "reward_entries_event_idx" ON "reward_entries" USING btree ("event_id");
  CREATE INDEX "reward_entries_participant_idx" ON "reward_entries" USING btree ("participant_id");
  CREATE INDEX "reward_entries_updated_at_idx" ON "reward_entries" USING btree ("updated_at");
  CREATE INDEX "reward_entries_created_at_idx" ON "reward_entries" USING btree ("created_at");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_admin_users_id_idx" ON "payload_locked_documents_rels" USING btree ("admin_users_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_events_id_idx" ON "payload_locked_documents_rels" USING btree ("events_id");
  CREATE INDEX "payload_locked_documents_rels_artworks_id_idx" ON "payload_locked_documents_rels" USING btree ("artworks_id");
  CREATE INDEX "payload_locked_documents_rels_participants_id_idx" ON "payload_locked_documents_rels" USING btree ("participants_id");
  CREATE INDEX "payload_locked_documents_rels_scan_events_id_idx" ON "payload_locked_documents_rels" USING btree ("scan_events_id");
  CREATE INDEX "payload_locked_documents_rels_reward_entries_id_idx" ON "payload_locked_documents_rels" USING btree ("reward_entries_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_admin_users_id_idx" ON "payload_preferences_rels" USING btree ("admin_users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE UNIQUE INDEX "site_copy_locales_locale_parent_id_unique" ON "site_copy_locales" USING btree ("_locale","_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "admin_users_sessions" CASCADE;
  DROP TABLE "admin_users" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "media_locales" CASCADE;
  DROP TABLE "events_supported_locales" CASCADE;
  DROP TABLE "events" CASCADE;
  DROP TABLE "events_locales" CASCADE;
  DROP TABLE "artworks" CASCADE;
  DROP TABLE "artworks_locales" CASCADE;
  DROP TABLE "participants" CASCADE;
  DROP TABLE "scan_events" CASCADE;
  DROP TABLE "reward_entries" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "site_copy" CASCADE;
  DROP TABLE "site_copy_locales" CASCADE;
  DROP TYPE "public"."_locales";
  DROP TYPE "public"."enum_media_asset_type";
  DROP TYPE "public"."enum_events_supported_locales_locale";
  DROP TYPE "public"."enum_events_status";
  DROP TYPE "public"."enum_events_default_locale";
  DROP TYPE "public"."enum_participants_preferred_locale";
  DROP TYPE "public"."enum_scan_events_locale";
  DROP TYPE "public"."enum_scan_events_source";`)
}
