import { describe, expect, it } from "vitest";
import { layoutKeys } from "./keyLayout.js";

describe("layoutKeys", () => {
  it("places every skill plus the wide key, without overlaps in a row", () => {
    const { keys, rows } = layoutKeys(9);
    expect(keys).toHaveLength(10);
    expect(keys.at(-1).w).toBe(2);
    expect(rows).toBe(3);

    for (let r = 0; r < rows; r++) {
      const row = keys.filter((k) => k.row === r).sort((a, b) => a.x - b.x);
      for (let i = 1; i < row.length; i++) {
        expect(row[i - 1].x + row[i - 1].w / 2).toBeLessThanOrEqual(row[i].x - row[i].w / 2 + 1e-9);
      }
    }
  });

  it("centres the board on the origin", () => {
    const { keys, width } = layoutKeys(9);
    const left = Math.min(...keys.map((k) => k.x - k.w / 2));
    const right = Math.max(...keys.map((k) => k.x + k.w / 2));
    expect(left).toBeCloseTo(-width / 2);
    expect(right).toBeCloseTo(width / 2);
  });

  it("wraps the wide key onto a new row when it will not fit", () => {
    const { keys } = layoutKeys(3);
    expect(keys.at(-1).row).toBe(1);
  });
});
