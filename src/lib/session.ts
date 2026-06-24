import { cookies } from "next/headers";

import { storageKeys } from "@/config/storage";

/**
 * Read the participant session uid from the request cookie (server-side).
 * Returns null when no session cookie is present. Used by guest pages to make
 * flash-free redirect decisions before any HTML is rendered.
 */
export async function getServerSessionUid(): Promise<string | null> {
  const store = await cookies();

  return store.get(storageKeys.participantUid)?.value?.trim() || null;
}
