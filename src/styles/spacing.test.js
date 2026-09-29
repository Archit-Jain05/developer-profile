import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

// The public site is on an 8-point spacing system: every margin, padding, gap
// and offset is a multiple of 8. This fails the build if one slips.
const DIRS = ["src/styles", "src/components/public"];
const SPACING = /^(margin|padding|gap|row-gap|column-gap|inset|top|right|bottom|left|scroll-padding)(-[a-z-]+)?$/;
const FLOW = /^(margin|padding|gap|row-gap|column-gap)/;

function violations(css) {
  const found = [];
  for (const [, prop, value] of css.matchAll(/^\s*([a-z-]+)\s*:\s*([^;{}]+);/gm)) {
    if (!SPACING.test(prop)) continue;
    for (const [, n] of value.matchAll(/(-?\d*\.?\d+)px\b/g)) {
      if (Number(n) % 8 !== 0) found.push(`${prop}: ${value.trim()}`);
    }
    for (const [, n] of value.matchAll(/(-?\d*\.?\d+)rem\b/g)) {
      if ((Number(n) * 16) % 8 !== 0) found.push(`${prop}: ${value.trim()}`);
    }
    // Fluid units and percentages drift off the grid between breakpoints.
    if (/\d(vw|vh|svh|dvh)\b/.test(value)) found.push(`${prop}: ${value.trim()}`);
    if (FLOW.test(prop) && /\d%/.test(value)) found.push(`${prop}: ${value.trim()}`);
  }
  return found;
}

describe("8-point spacing", () => {
  const files = DIRS.flatMap((dir) =>
    fs
      .readdirSync(dir)
      .filter((f) => f.endsWith(".css"))
      .map((f) => path.join(dir, f)),
  );

  it.each(files)("%s keeps every spacing value on the 8px grid", (file) => {
    expect(violations(fs.readFileSync(file, "utf8"))).toEqual([]);
  });

  it("catches values off the grid", () => {
    const css = ".a {\n  padding: 12px 16px;\n  gap: 1rem;\n  margin: 2vw;\n}";
    expect(violations(css)).toEqual(["padding: 12px 16px", "margin: 2vw"]);
  });
});
