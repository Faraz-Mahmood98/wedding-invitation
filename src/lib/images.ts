/**
 * Curated background imagery for the opening (tap-to-open) gate.
 *
 * These are stable Unsplash CDN URLs, allow-listed in `next.config.ts`. Weddings
 * may override the choice with any URL or local path from admin → Settings.
 */

const U = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1600&q=80`;

export interface ImagePreset {
  id: string;
  label: string;
  url: string;
}

export const OPENING_IMAGE_PRESETS: ImagePreset[] = [
  { id: "garden-arch", label: "Garden arch", url: U("photo-1738025277440-5415dcfadd51") },
  { id: "floral-stage", label: "Floral stage", url: U("photo-1787555267973-b359645be0c4") },
  { id: "peonies", label: "Soft peonies", url: U("photo-1746928864359-fa8f6387c34a") },
  { id: "rose-garden", label: "Rose garden", url: U("photo-1780764813439-1e9a3b4751fb") },
];

/** Background used when a wedding has not chosen its own image. */
export const DEFAULT_OPENING_IMAGE = OPENING_IMAGE_PRESETS[0].url;
