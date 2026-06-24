"use client";

import { useMemo, useSyncExternalStore } from "react";

import { useCopy } from "@/components/guest/CopyProvider";
import { FadeImage } from "@/components/guest/FadeImage";
import { ProgressRing } from "@/components/guest/ProgressRing";
import { Reveal } from "@/components/guest/Reveal";
import { ShareableUid } from "@/components/guest/ShareableUid";
import {
  getCollectedArtworkSlugsServerSnapshot,
  getCollectedArtworkSlugsSnapshot,
  subscribeCollectedArtworkSlugs,
} from "@/config/storage";
import { placeholderImage } from "@/lib/media";
import type { PublicProgressData } from "@/lib/publicProgress";

type PublicProgressViewProps = {
  data: PublicProgressData;
};

/**
 * Renders public progress, merging the server-recorded scans with this device's
 * local progress so the owner's view matches the gallery immediately (offline
 * first), while other viewers still see authoritative server state.
 */
export function PublicProgressView({ data }: PublicProgressViewProps) {
  const copy = useCopy();
  const localSlugs = useSyncExternalStore(
    subscribeCollectedArtworkSlugs,
    getCollectedArtworkSlugsSnapshot,
    getCollectedArtworkSlugsServerSnapshot,
  );
  const localSet = useMemo(() => new Set(localSlugs), [localSlugs]);

  const artworks = data.artworks.map((artwork) => ({
    ...artwork,
    isCollected: artwork.serverCollected || localSet.has(artwork.slug),
  }));
  const collectedCount = artworks.filter((artwork) => artwork.isCollected).length;

  return (
    <section className="flex flex-1 flex-col gap-10">
      <Reveal className="flex flex-col items-center gap-4 pt-4 text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-[var(--accent)]">
          {data.eventTitle}
        </p>
        <ProgressRing collected={collectedCount} required={data.required} />
        <ShareableUid displayName={data.displayName} uid={data.uid} />
      </Reveal>

      <div className="-mx-5 flex items-center gap-3 overflow-x-auto px-5 pb-2">
        {artworks.map((artwork, index) => {
          const imageUrl = artwork.isCollected
            ? artwork.revealedImageUrl || placeholderImage
            : artwork.lockedImageUrl || placeholderImage;

          return (
            <Reveal className="shrink-0" delay={120 + index * 80} key={artwork.slug}>
              <FadeImage
                alt={artwork.isCollected ? artwork.title : copy.lockedArtworkAlt}
                className="h-44 w-auto rounded-lg border border-[var(--border)]"
                dimmed={!artwork.isCollected}
                src={imageUrl}
              />
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
