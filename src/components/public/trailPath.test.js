import { describe, expect, it } from "vitest";
import { lengthAtY, trailPath } from "./trailPath.js";

describe("trailPath", () => {
  it("returns an empty path without waypoints", () => {
    expect(trailPath([], { startX: 50, endX: 50, height: 100 })).toBe("");
  });

  it("joins waypoints with vertical tangents and ends at the bottom", () => {
    const d = trailPath(
      [
        { x: 40, y: 100 },
        { x: 60, y: 300 },
      ],
      { startX: 50, endX: 50, height: 400 },
    );
    expect(d).toBe(
      "M 50 0 C 50 50, 40 50, 40 100 C 40 200, 60 200, 60 300 C 60 350, 50 350, 50 400",
    );
  });
});

describe("lengthAtY", () => {
  const samples = [
    { y: 0, length: 0 },
    { y: 100, length: 120 },
    { y: 200, length: 260 },
  ];

  it("interpolates between samples", () => {
    expect(lengthAtY(samples, 50)).toBe(60);
    expect(lengthAtY(samples, 150)).toBe(190);
  });

  it("clamps outside the sampled range", () => {
    expect(lengthAtY(samples, -40)).toBe(0);
    expect(lengthAtY(samples, 999)).toBe(260);
    expect(lengthAtY([], 10)).toBe(0);
  });
});
