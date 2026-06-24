/**
 * Create (or update the password of) an admin user via Payload's Local API.
 *
 * Boots Payload, so it needs DATABASE_URI + PAYLOAD_SECRET in the environment.
 * Use Node's --env-file to load them; point DATABASE_URI at the DB you want to
 * write to (localhost for local, the Neon string for production).
 *
 *   # local DB (whatever DATABASE_URI in .env.local points to)
 *   npx tsx --env-file=.env.local scripts/create-admin.ts you@example.com 'StrongPassw0rd!'
 *
 *   # production DB (override DATABASE_URI inline)
 *   DATABASE_URI='postgresql://...neon.tech/neondb?sslmode=require' \
 *     npx tsx --env-file=.env.local scripts/create-admin.ts you@example.com 'StrongPassw0rd!'
 *
 * If the email already exists, its password is reset instead of erroring.
 */
import { getPayload } from "payload";

import config from "../payload.config.ts";

const [email, password] = process.argv.slice(2);

if (!email || !password) {
  console.error("Usage: create-admin.ts <email> <password>");
  process.exit(1);
}

const payload = await getPayload({ config });

const existing = await payload.find({
  collection: "admin-users",
  where: { email: { equals: email } },
  limit: 1,
});

if (existing.docs.length > 0) {
  await payload.update({
    collection: "admin-users",
    id: existing.docs[0].id,
    data: { password },
  });
  console.log(`Reset password for existing admin user: ${email}`);
} else {
  await payload.create({
    collection: "admin-users",
    data: { email, password },
  });
  console.log(`Created admin user: ${email}`);
}

process.exit(0);
