import { describe, expect, it } from "vitest";
import { normalizeTheme, DEFAULT_PALETTE, paletteVarName, themeColor } from "./theme";

describe("normalizeTheme", () => {
  it("returns defaults for empty input", () => {
    expect(normalizeTheme(undefined).palette).toEqual(DEFAULT_PALETTE);
  });

  it("applies valid overrides and keeps defaults for the rest", () => {
    const theme = normalizeTheme({ palette: { blush: "#ABCDEF" } });
    expect(theme.palette.blush).toBe("#abcdef");
    expect(theme.palette.gold).toBe(DEFAULT_PALETTE.gold);
  });

  it("ignores invalid colours", () => {
    const theme = normalizeTheme({ palette: { rose: "not-a-colour" } });
    expect(theme.palette.rose).toBe(DEFAULT_PALETTE.rose);
  });
});

describe("paletteVarName", () => {
  it("kebab-cases camelCase keys", () => {
    expect(paletteVarName("deepRose")).toBe("--theme-palette-deep-rose");
  });
});

describe("themeColor", () => {
  it("uses deep rose", () => {
    expect(themeColor(normalizeTheme(undefined))).toBe(DEFAULT_PALETTE.deepRose);
  });
});
