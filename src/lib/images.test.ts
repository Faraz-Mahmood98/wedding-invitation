import { describe, expect, it } from "vitest";
import { DEFAULT_OPENING_IMAGE, OPENING_IMAGE_PRESETS } from "./images";

describe("opening image presets", () => {
  it("has unique ids and urls", () => {
    expect(new Set(OPENING_IMAGE_PRESETS.map((p) => p.id)).size).toBe(
      OPENING_IMAGE_PRESETS.length,
    );
    expect(new Set(OPENING_IMAGE_PRESETS.map((p) => p.url)).size).toBe(
      OPENING_IMAGE_PRESETS.length,
    );
  });

  it("uses https URLs so next/image allows them", () => {
    for (const preset of OPENING_IMAGE_PRESETS) {
      expect(preset.url.startsWith("https://images.unsplash.com/")).toBe(true);
      expect(preset.url).toContain("auto=format");
    }
  });

  it("defaults to the first preset", () => {
    expect(DEFAULT_OPENING_IMAGE).toBe(OPENING_IMAGE_PRESETS[0].url);
  });
});
