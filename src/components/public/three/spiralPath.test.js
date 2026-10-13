import { describe, expect, it } from "vitest";
import { PATH, pathPosition } from "./spiralPath.js";

describe("project wall spiral", () => {
  it("brings the first panel in at the start and the last out at the end", () => {
    for (const count of [8, 12, 16]) {
      expect(pathPosition(0, 0, count)).toBe(0);
      expect(pathPosition(count - 1, 1, count)).toBeCloseTo(1);
    }
  });

  it("never stacks two panels on one spot, whatever the number of projects", () => {
    for (let count = 8; count <= 16; count++) {
      let closest = Infinity;
      for (let p = 0; p <= 1; p += 0.002) {
        const spots = [];
        for (let i = 0; i < count; i++) {
          const u = pathPosition(i, p, count);
          if (u > 0 && u < 1) spots.push(PATH.getPointAt(u));
        }
        for (let a = 0; a < spots.length; a++)
          for (let b = a + 1; b < spots.length; b++) closest = Math.min(closest, spots[a].distanceTo(spots[b]));
      }
      expect(closest).toBeGreaterThan(2.3); // more than a panel's width apart
    }
  });
});
