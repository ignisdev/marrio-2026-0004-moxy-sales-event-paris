import type { Locale } from "@/config/locales";

export type { Locale };

export type EventStatus = "draft" | "active" | "closed";
export type ScanSource = "qr" | "manual" | "staff_test";
export type AssetType = "image" | "video" | "poster" | "fallback";

export interface ArtworkQrPayload {
  scheme: "mgq";
  version: 1;
  eventSlug: string;
  qrToken: string;
}

export interface GalleryProgress {
  uid: string;
  collected: number;
  required: number;
  isComplete: boolean;
  collectedArtworkSlugs: string[];
}

export interface PublicProgress {
  eventTitle: string;
  uid: string;
  displayName: string | null;
  collected: number;
  required: number;
  isComplete: boolean;
  artworks: PublicArtworkProgress[];
}

export interface PublicArtworkProgress {
  title: string;
  slug: string;
  isCollected: boolean;
  publicImageUrl: string | null;
}
