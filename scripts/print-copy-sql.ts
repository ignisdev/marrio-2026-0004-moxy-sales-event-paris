/**
 * Print SQL that seeds the `site_copy` global (parent + en/fr locale rows) from
 * DEFAULT_COPY. Pure — imports only the framework-free copy module, so it runs
 * under plain `tsx` without booting Payload:
 *
 *   npx tsx scripts/print-copy-sql.ts | docker exec -i <pg> psql -U postgres -d <db>
 *
 * Idempotent: it truncates site_copy (cascading to site_copy_locales) first.
 */
import { COPY_KEYS, DEFAULT_COPY, type SiteCopy } from "../src/lib/copy.ts";

const snake = (key: string) => key.replace(/([A-Z])/g, "_$1").toLowerCase();
const sql = (value: string) => `'${value.replace(/'/g, "''")}'`;

const columns = COPY_KEYS.map(snake);

function valuesFor(locale: "en" | "fr", copy: SiteCopy): string {
  const cells = COPY_KEYS.map((key) => sql(copy[key]));
  return `SELECT id, '${locale}'::_locales, ${cells.join(", ")} FROM parent`;
}

const out = `BEGIN;
TRUNCATE site_copy RESTART IDENTITY CASCADE;
WITH parent AS (
  INSERT INTO site_copy (updated_at, created_at) VALUES (now(), now()) RETURNING id
)
INSERT INTO site_copy_locales (_parent_id, _locale, ${columns.join(", ")})
${valuesFor("en", DEFAULT_COPY.en)}
UNION ALL
${valuesFor("fr", DEFAULT_COPY.fr)};
COMMIT;
`;

process.stdout.write(out);
