import { supabase } from "./supabase.js";

export const BUCKET = "media";

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/svg+xml"];
const LIMITS = {
  image: { types: IMAGE_TYPES, maxBytes: 5 * 1024 * 1024, label: "JPG, PNG, WebP, AVIF or SVG up to 5 MB" },
  pdf: { types: ["application/pdf"], maxBytes: 10 * 1024 * 1024, label: "PDF up to 10 MB" },
};

/** Returns an error message, or null when the file is acceptable. */
export function validateFile(file, kind = "image") {
  const rule = LIMITS[kind];
  if (!file) return "Choose a file.";
  if (!rule.types.includes(file.type)) return `Unsupported file type. Use ${rule.label}.`;
  if (file.size > rule.maxBytes) return `File is too large. Use ${rule.label}.`;
  return null;
}

export function acceptFor(kind = "image") {
  return LIMITS[kind].types.join(",");
}

export function safeFileName(name) {
  const dot = name.lastIndexOf(".");
  const base = (dot > 0 ? name.slice(0, dot) : name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50);
  const ext = dot > 0 ? name.slice(dot + 1).toLowerCase().replace(/[^a-z0-9]/g, "") : "";
  return `${base || "file"}${ext ? `.${ext}` : ""}`;
}

/** Upload a file to the media bucket and return its public URL. */
export async function uploadMedia(file, folder, kind = "image") {
  const problem = validateFile(file, kind);
  if (problem) throw new Error(problem);
  const path = `${folder}/${crypto.randomUUID()}-${safeFileName(file.name)}`;
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw error;
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

/** Object path inside the media bucket for a public URL, or null for other URLs. */
export function storagePathFromUrl(url) {
  if (!url) return null;
  const marker = `/storage/v1/object/public/${BUCKET}/`;
  const i = url.indexOf(marker);
  return i === -1 ? null : decodeURIComponent(url.slice(i + marker.length).split("?")[0]);
}

/** Best-effort removal of an uploaded file. Never throws. */
export async function deleteMediaByUrl(url) {
  const path = storagePathFromUrl(url);
  if (!path || !supabase) return;
  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  if (error) console.warn("[storage] Could not delete old file:", path, error.message);
}
