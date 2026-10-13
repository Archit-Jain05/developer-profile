import { describe, expect, it } from "vitest";
import { fullAt, panelPose } from "./wallMotion.js";

const poses = (count, p) => Array.from({ length: count }, (_, i) => ({ ...panelPose(i, count, p) }));

describe("project wall choreography", () => {
  it("starts with everything off stage to the left and ends with everything gone to the right", () => {
    for (const count of [8, 10, 12]) {
      expect(poses(count, 0).every((p) => p.x < -10 || !p.visible)).toBe(true);
      expect(poses(count, 1).every((p) => !p.visible)).toBe(true);
    }
  });

  it("files panels in one at a time, in a line, before the circle is full", () => {
    const count = 10;
    const early = poses(count, fullAt(count) * 0.5).filter((p) => p.visible && p.opacity > 0.05);
    expect(early.length).toBeGreaterThan(1);
    expect(early.length).toBeLessThan(count);
  });

  it("has every panel on the circle together when it is full, none stacked", () => {
    for (let count = 8; count <= 12; count++) {
      const all = poses(count, fullAt(count));
      expect(all.every((p) => p.visible && p.onCircle === 1)).toBe(true);
      let closest = Infinity;
      for (let a = 0; a < count; a++)
        for (let b = a + 1; b < count; b++) closest = Math.min(closest, Math.hypot(all[a].x - all[b].x, all[a].z - all[b].z));
      expect(closest).toBeGreaterThan(2.3);
    }
  });

  it("lets the first panel in leave first", () => {
    const count = 10;
    const p = fullAt(count) + (1 - fullAt(count)) * 0.55;
    const gone = poses(count, p).map((q) => q.x > 6);
    expect(gone[0]).toBe(true);
    expect(gone[count - 1]).toBe(false);
  });
});
