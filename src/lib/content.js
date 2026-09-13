import { supabase } from "./supabase.js";

export const LIST_TABLES = ["skills", "experience", "education", "projects"];

function unwrap({ data, error }) {
  if (error) throw error;
  return data;
}

/** Load all public content in parallel. Throws if any query fails. */
export async function fetchContent(client = supabase) {
  if (!client) throw new Error("Supabase is not configured");
  const [profile, ...lists] = await Promise.all([
    client.from("profile").select("*").eq("id", 1).single().then(unwrap),
    ...LIST_TABLES.map((table) =>
      client.from(table).select("*").order("sort_order", { ascending: true }).then(unwrap),
    ),
  ]);
  return {
    profile,
    ...Object.fromEntries(LIST_TABLES.map((table, i) => [table, lists[i]])),
  };
}

/** Resolve with the loader result, or reject after `ms` milliseconds. */
export function withTimeout(promise, ms) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(`Timed out after ${ms}ms`)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

/**
 * Decide which content the site shows. Never rejects: any failure
 * (not configured, network error, timeout) yields the fallback content.
 */
export async function loadContent({ loader, fallback, timeoutMs = 8000, configured = true }) {
  if (!configured) return { status: "fallback", content: fallback, reason: "not-configured" };
  try {
    const content = await withTimeout(loader(), timeoutMs);
    return { status: "ready", content };
  } catch (error) {
    console.warn("[content] Falling back to bundled content:", error?.message ?? error);
    return { status: "fallback", content: fallback, reason: error?.message ?? "error" };
  }
}
