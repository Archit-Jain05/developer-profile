import { describe, expect, it } from "vitest";
import { firstName, formatDateRange, formatMonth, formatYearRange, swapOrder, toParagraphs } from "./format.js";

describe("formatMonth", () => {
  it("formats ISO dates as short month + year", () => {
    expect(formatMonth("2023-08-01")).toBe("Aug 2023");
    expect(formatMonth("2026-12-15")).toBe("Dec 2026");
  });

  it("returns empty string for missing or malformed input", () => {
    expect(formatMonth(null)).toBe("");
    expect(formatMonth("")).toBe("");
    expect(formatMonth("garbage")).toBe("");
  });
});

describe("formatDateRange", () => {
  it("shows Present when there is no end date", () => {
    expect(formatDateRange("2026-08-01", null)).toBe("Aug 2026 – Present");
  });

  it("shows both months when ended", () => {
    expect(formatDateRange("2023-08-01", "2024-08-01")).toBe("Aug 2023 – Aug 2024");
  });
});

describe("formatYearRange", () => {
  it("handles full, partial and empty ranges", () => {
    expect(formatYearRange(2021, 2024)).toBe("2021 – 2024");
    expect(formatYearRange(2021, null)).toBe("2021");
    expect(formatYearRange(null, null)).toBe("");
  });
});

describe("toParagraphs", () => {
  it("splits on blank lines and trims", () => {
    expect(toParagraphs("One\nstill one\n\n  Two  \n \n\nThree")).toEqual(["One\nstill one", "Two", "Three"]);
  });

  it("returns an empty array for empty text", () => {
    expect(toParagraphs("")).toEqual([]);
    expect(toParagraphs(null)).toEqual([]);
  });
});

describe("firstName", () => {
  it("takes the first word", () => {
    expect(firstName("  Archit Jain ")).toBe("Archit");
    expect(firstName("")).toBe("");
  });
});

describe("swapOrder", () => {
  const items = [
    { id: "a", sort_order: 1 },
    { id: "b", sort_order: 2 },
    { id: "c", sort_order: 3 },
  ];

  it("swaps sort_order with the neighbour below", () => {
    expect(swapOrder(items, 0, 1)).toEqual([
      { id: "a", sort_order: 2 },
      { id: "b", sort_order: 1 },
    ]);
  });

  it("swaps sort_order with the neighbour above", () => {
    expect(swapOrder(items, 2, -1)).toEqual([
      { id: "c", sort_order: 2 },
      { id: "b", sort_order: 3 },
    ]);
  });

  it("returns null at the edges", () => {
    expect(swapOrder(items, 0, -1)).toBeNull();
    expect(swapOrder(items, 2, 1)).toBeNull();
  });

  it("still produces a change when both rows share a sort_order", () => {
    const [moved, other] = swapOrder([{ id: "x", sort_order: 0 }, { id: "y", sort_order: 0 }], 0, 1);
    expect(moved.sort_order).toBeGreaterThan(other.sort_order);
  });
});
