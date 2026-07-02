import { readPendingScans, removePendingScan } from "@/config/storage";

/**
 * Retry any scans that previously failed to reach the server (offline or a
 * transient network error). Without this, a dropped request silently caps a
 * participant's server-side progress below what their device shows as
 * "collected" — they'd never cross the required count, so completion
 * (reward-entries) would never fire even though the UI says they're done.
 */
export async function drainPendingScans(): Promise<void> {
  for (const pending of readPendingScans()) {
    try {
      const response = await fetch("/api/scan", {
        body: JSON.stringify({
          locale: pending.locale,
          qrPayload: pending.qrPayload,
          uid: pending.uid,
        }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });

      if (response.ok || response.status === 400 || response.status === 404) {
        // Either recorded, or permanently invalid (bad/stale payload) —
        // either way, retrying it again won't help, so drop it.
        removePendingScan(pending);
      }
    } catch {
      // Still offline — leave it queued for the next attempt.
    }
  }
}
