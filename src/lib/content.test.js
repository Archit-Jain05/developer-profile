import { afterEach, describe, expect, it, vi } from "vitest";
import { loadContent } from "./content.js";
import { validateContact } from "./validation.js";
import { safeFileName, storagePathFromUrl, validateFile } from "./storage.js";

const fallback = { profile: { full_name: "Fallback" } };

describe("loadContent", () => {
  afterEach(() => vi.restoreAllMocks());

  it("uses fallback immediately when Supabase is not configured", async () => {
    const loader = vi.fn();
    const result = await loadContent({ loader, fallback, configured: false });
    expect(result).toEqual({ status: "fallback", content: fallback, reason: "not-configured" });
    expect(loader).not.toHaveBeenCalled();
  });

  it("returns live content when the loader succeeds", async () => {
    const live = { profile: { full_name: "Live" } };
    const result = await loadContent({ loader: async () => live, fallback });
    expect(result).toEqual({ status: "ready", content: live });
  });

  it("falls back when the loader throws", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const result = await loadContent({
      loader: async () => {
        throw new Error("network down");
      },
      fallback,
    });
    expect(result.status).toBe("fallback");
    expect(result.content).toBe(fallback);
  });

  it("falls back when the loader is too slow", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const result = await loadContent({
      loader: () => new Promise((resolve) => setTimeout(() => resolve({}), 200)),
      fallback,
      timeoutMs: 20,
    });
    expect(result.status).toBe("fallback");
    expect(result.reason).toMatch(/Timed out/);
  });
});

describe("validateContact", () => {
  it("accepts valid input", () => {
    expect(validateContact({ name: "Asha", email: "asha@example.com", message: "Hello there, nice site!" })).toEqual({});
  });

  it("flags every missing field", () => {
    expect(Object.keys(validateContact({ name: "", email: "", message: "" }))).toEqual(["name", "email", "message"]);
  });

  it("rejects bad email and short or long messages", () => {
    expect(validateContact({ name: "A", email: "nope", message: "short" })).toMatchObject({
      email: expect.any(String),
      message: expect.stringMatching(/at least 10/),
    });
    expect(validateContact({ name: "A", email: "a@b.co", message: "x".repeat(2001) }).message).toMatch(/2000/);
  });
});

describe("storage helpers", () => {
  it("validates file type and size", () => {
    expect(validateFile({ type: "image/png", size: 1000 }, "image")).toBeNull();
    expect(validateFile({ type: "image/gif", size: 1000 }, "image")).toMatch(/Unsupported/);
    expect(validateFile({ type: "image/png", size: 6 * 1024 * 1024 }, "image")).toMatch(/too large/);
    expect(validateFile({ type: "application/pdf", size: 1000 }, "pdf")).toBeNull();
    expect(validateFile(null)).toMatch(/Choose/);
  });

  it("sanitises file names", () => {
    expect(safeFileName("My Résumé (Final).PDF")).toBe("my-r-sum-final.pdf");
    expect(safeFileName("???.png")).toBe("file.png");
  });

  it("extracts the bucket path only from media bucket URLs", () => {
    expect(storagePathFromUrl("https://x.supabase.co/storage/v1/object/public/media/logos/abc-logo.png")).toBe(
      "logos/abc-logo.png",
    );
    expect(storagePathFromUrl("/seed/zootechx.png")).toBeNull();
    expect(storagePathFromUrl(null)).toBeNull();
  });
});
