/**
 * Theme tokens. Each wedding stores its own palette + font selection in
 * `Wedding.theme` (Json). Defaults below match the blush/rose/gold palette.
 *
 * Colours are emitted as runtime CSS variables (`--palette-*`) so a single
 * codebase can serve many weddings; Tailwind maps its colour utilities to
 * those variables with `@theme inline` in globals.css.
 */

export type PaletteKey =
  | "blush"
  | "cream"
  | "rose"
  | "deepRose"
  | "gold"
  | "ink";

export type ThemePalette = Record<PaletteKey, string>;

/** Font roles. Values are CSS font-family stacks. */
export type ThemeFontRole = "display" | "body" | "arabic" | "urdu";

export type ThemeFonts = Record<ThemeFontRole, string>;

export interface WeddingTheme {
  palette: ThemePalette;
  fonts: ThemeFonts;
}

export const DEFAULT_PALETTE: ThemePalette = {
  blush: "#f6e2dc",
  cream: "#fff8f3",
  rose: "#d98e8e",
  deepRose: "#a8505a",
  gold: "#c9a35b",
  ink: "#4a2c2f",
};

export const DEFAULT_FONTS: ThemeFonts = {
  display: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif",
  body: "var(--font-body), ui-sans-serif, system-ui, sans-serif",
  arabic: "var(--font-amiri), 'Amiri', serif",
  urdu: "var(--font-nastaliq), 'Noto Nastaliq Urdu', serif",
};

export const DEFAULT_THEME: WeddingTheme = {
  palette: DEFAULT_PALETTE,
  fonts: DEFAULT_FONTS,
};

/** Maps a palette key to its CSS custom-property name. */
export function paletteVarName(key: PaletteKey): string {
  return `--theme-palette-${key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)}`;
}

/** Maps a font role to its CSS custom-property name. */
export function fontVarName(role: ThemeFontRole): string {
  return `--theme-font-${role}`;
}

const HEX_RE = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

export function isHexColor(value: unknown): value is string {
  return typeof value === "string" && HEX_RE.test(value.trim());
}

/** Narrows an arbitrary JSON blob into a complete, valid WeddingTheme. */
export function normalizeTheme(input: unknown): WeddingTheme {
  const raw = (input ?? {}) as Partial<WeddingTheme>;
  const rawPalette = (raw.palette ?? {}) as Partial<ThemePalette>;
  const rawFonts = (raw.fonts ?? {}) as Partial<ThemeFonts>;

  const palette = { ...DEFAULT_PALETTE };
  (Object.keys(DEFAULT_PALETTE) as PaletteKey[]).forEach((key) => {
    const value = rawPalette[key];
    if (isHexColor(value)) palette[key] = value.trim().toLowerCase();
  });

  const fonts = { ...DEFAULT_FONTS };
  (Object.keys(DEFAULT_FONTS) as ThemeFontRole[]).forEach((role) => {
    const value = rawFonts[role];
    if (typeof value === "string" && value.trim()) fonts[role] = value.trim();
  });

  return { palette, fonts };
}

/** Serialises a theme into an inline `style` value of CSS variables. */
export function themeToCssVars(theme: WeddingTheme): string {
  const parts: string[] = [];
  (Object.keys(theme.palette) as PaletteKey[]).forEach((key) => {
    parts.push(`${paletteVarName(key)}:${theme.palette[key]}`);
  });
  (Object.keys(theme.fonts) as ThemeFontRole[]).forEach((role) => {
    parts.push(`${fontVarName(role)}:${theme.fonts[role]}`);
  });
  return parts.join(";");
}

/** Primary colour used for `<meta name="theme-color">`. */
export function themeColor(theme: WeddingTheme): string {
  return theme.palette.deepRose;
}
