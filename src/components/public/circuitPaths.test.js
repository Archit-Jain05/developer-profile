import { describe, expect, it } from "vitest";
import { circuitPaths } from "./circuitPaths.js";

describe("circuitPaths", () => {
  it("draws the requested number of traces", () => {
    expect(circuitPaths({ count: 7 })).toHaveLength(7);
  });

  it("is deterministic for a given seed", () => {
    const a = circuitPaths({ seed: 3 });
    const b = circuitPaths({ seed: 3 });
    const c = circuitPaths({ seed: 4 });
    expect(a).toEqual(b);
    expect(a).not.toEqual(c);
  });

  it("emits valid path data that starts at a move command", () => {
    for (const trace of circuitPaths({ count: 5 })) {
      expect(trace.d).toMatch(/^M -?[\d.]+ -?[\d.]+( L -?[\d.]+ -?[\d.]+)+$/);
    }
  });

  it("runs each trace off the edge of the box", () => {
    const width = 160;
    const height = 100;
    for (const trace of circuitPaths({ width, height, count: 6 })) {
      const points = [...trace.d.matchAll(/(-?[\d.]+) (-?[\d.]+)/g)].map(([, x, y]) => ({
        x: Number(x),
        y: Number(y),
      }));
      const last = points[points.length - 1];
      const outside = last.x <= 0 || last.x >= width || last.y <= 0 || last.y >= height;
      expect(outside).toBe(true);
    }
  });

  it("puts pads only where a trace turns", () => {
    for (const trace of circuitPaths({ count: 5 })) {
      expect(trace.pads.length).toBeLessThan(trace.d.split(" L ").length);
    }
  });
});
