/**
 * Backfill reward-entries (and participants.completedAt) for participants who
 * already collected all required artworks before the reward-entries logic
 * existed in /api/scan. The live route only creates a reward-entries row at
 * the moment a scan newly completes the set — anyone who completed earlier
 * never got one, so this recomputes completion from existing scan-events and
 * fills in whatever's missing. Safe to re-run: skips participants who already
 * have a reward-entries row for their event.
 *
 *   npx tsx --env-file=.env.local scripts/backfill-reward-entries.ts
 *
 *   # production DB
 *   DATABASE_URI='postgresql://...neon.tech/neondb?sslmode=require' \
 *     npx tsx --env-file=.env.local scripts/backfill-reward-entries.ts
 */
import { getPayload } from "payload";

import config from "../payload.config.ts";
import { calculateProgress } from "../src/lib/progress.ts";

async function main() {
  const payload = await getPayload({ config });

  const events = await payload.find({ collection: "events", limit: 1000 });
  let created = 0;
  let skipped = 0;

  for (const event of events.docs) {
    const participants = await payload.find({
      collection: "participants",
      limit: 1000,
      where: { event: { equals: event.id } },
    });

    for (const participant of participants.docs) {
      const scanResult = await payload.find({
        collection: "scan-events",
        depth: 1,
        limit: 1000,
        where: { participant: { equals: participant.id } },
      });
      const collectedArtworkSlugs = scanResult.docs
        .map((scan) => scan.artwork)
        .map((artwork) => (typeof artwork === "number" ? null : artwork.slug))
        .filter((slug): slug is string => Boolean(slug));

      const progress = calculateProgress({
        collectedArtworkSlugs,
        required: event.totalRequiredArtworks,
        uid: participant.uid,
      });

      if (!progress.isComplete) {
        continue;
      }

      const existingRewardEntry = await payload.find({
        collection: "reward-entries",
        limit: 1,
        where: {
          and: [
            { participant: { equals: participant.id } },
            { event: { equals: event.id } },
          ],
        },
      });

      if (existingRewardEntry.totalDocs > 0) {
        skipped += 1;
        continue;
      }

      const completedAt = participant.completedAt || new Date().toISOString();

      if (!participant.completedAt) {
        await payload.update({
          collection: "participants",
          id: participant.id,
          data: { completedAt },
        });
      }

      await payload.create({
        collection: "reward-entries",
        data: {
          bonvoyRewardEligible: Boolean(participant.isBonvoyMember),
          completedAt,
          event: event.id,
          isComplete: true,
          participant: participant.id,
          prizeDrawEntries: 1,
          standardRewardEligible: true,
        },
      });

      created += 1;
      console.log(`Created reward entry for ${participant.displayName} (${participant.uid})`);
    }
  }

  console.log(`Done. Created ${created}, skipped ${skipped} (already had an entry).`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
