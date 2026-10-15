import type { CSSProperties } from "react";

/** Parses a `k:v;k2:v2` declaration string into a React style object. */
export function styleFromCssVars(vars: string): CSSProperties {
  const style: Record<string, string> = {};
  for (const decl of vars.split(";")) {
    const idx = decl.indexOf(":");
    if (idx === -1) continue;
    const key = decl.slice(0, idx).trim();
    const value = decl.slice(idx + 1).trim();
    if (key) style[key] = value;
  }
  return style as CSSProperties;
}
