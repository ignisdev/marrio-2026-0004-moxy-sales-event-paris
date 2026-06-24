import path from "node:path";
import { fileURLToPath } from "node:url";

import { postgresAdapter } from "@payloadcms/db-postgres";
import { s3Storage } from "@payloadcms/storage-s3";
import { buildConfig } from "payload";

import { AdminUsers } from "./src/collections/AdminUsers.ts";
import { Artworks } from "./src/collections/Artworks.ts";
import { Events } from "./src/collections/Events.ts";
import { Media } from "./src/collections/Media.ts";
import { Participants } from "./src/collections/Participants.ts";
import { RewardEntries } from "./src/collections/RewardEntries.ts";
import { ScanEvents } from "./src/collections/ScanEvents.ts";
import { SiteCopy } from "./src/globals/SiteCopy.ts";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

// Prefer our own DATABASE_URI, but fall back to the connection strings the
// Vercel Neon integration injects automatically (POSTGRES_URL / DATABASE_URL).
// Neon (and most hosted Postgres) require SSL, but a bare connection string
// won't enable it in node-postgres, so turn SSL on for any non-local host.
const dbConnectionString =
  process.env.DATABASE_URI ??
  process.env.POSTGRES_URL ??
  process.env.DATABASE_URL ??
  "";
const isLocalDb =
  dbConnectionString.includes("localhost") ||
  dbConnectionString.includes("127.0.0.1");

const s3Enabled = Boolean(
  process.env.AWS_S3_BUCKET &&
    process.env.AWS_ACCESS_KEY_ID &&
    process.env.AWS_SECRET_ACCESS_KEY,
);

export default buildConfig({
  admin: {
    user: AdminUsers.slug,
    importMap: {
      baseDir: path.resolve(dirname),
      importMapFile: path.resolve(
        dirname,
        "src/app/(admin)/admin/[[...segments]]/importMap.js",
      ),
    },
  },
  collections: [
    AdminUsers,
    Media,
    Events,
    Artworks,
    Participants,
    ScanEvents,
    RewardEntries,
  ],
  globals: [SiteCopy],
  db: postgresAdapter({
    pool: {
      connectionString: dbConnectionString,
      ssl: isLocalDb ? undefined : { rejectUnauthorized: false },
    },
  }),
  localization: {
    defaultLocale: "en",
    fallback: true,
    locales: [
      { code: "en", label: "English" },
      { code: "fr", label: "Francais" },
    ],
  },
  plugins: [
    s3Storage({
      bucket: process.env.AWS_S3_BUCKET || "moxy-gallery-quest",
      collections: {
        media: {
          disablePayloadAccessControl: true,
        },
      },
      config: {
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
        },
        endpoint: `https://s3.${process.env.AWS_REGION || "eu-west-2"}.amazonaws.com`,
        region: process.env.AWS_REGION || "eu-west-2",
      },
      enabled: s3Enabled,
    }),
  ],
  secret: process.env.PAYLOAD_SECRET || "development-payload-secret",
  serverURL: process.env.NEXT_PUBLIC_APP_URL?.trim() || "",
  cors: ["*"],
  // NOTE: csrf does an EXACT origin match (unlike cors, "*" is NOT a wildcard
  // here). A non-empty list that doesn't contain the request Origin causes
  // Payload to drop the auth cookie on mutating requests (e.g. media upload),
  // surfacing as "Unauthorized" even when logged in. An empty array disables
  // the allowlist (accept the cookie from any origin). To lock this down,
  // replace with explicit origins, e.g.
  // [process.env.NEXT_PUBLIC_APP_URL, "http://localhost:3000"].filter(Boolean).
  csrf: [],
  typescript: {

    outputFile: path.resolve(dirname, "src/types/payload-types.ts"),
  },
});
