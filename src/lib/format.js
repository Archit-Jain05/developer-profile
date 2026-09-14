const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "2023-08-01" → "Aug 2023". Returns "" for empty input. */
export function formatMonth(isoDate) {
  if (!isoDate) return "";
  const [year, month] = isoDate.split("-").map(Number);
  if (!year || !month) return "";
  return `${MONTHS[month - 1]} ${year}`;
}

/** Date range for experience; a missing end date means the role is ongoing. */
export function formatDateRange(start, end) {
  return `${formatMonth(start)} – ${end ? formatMonth(end) : "Present"}`;
}

export function formatYearRange(start, end) {
  if (start && end) return `${start} – ${end}`;
  return String(start || end || "");
}

/** Split text into paragraphs on blank lines, dropping empty ones. */
export function toParagraphs(text) {
  if (!text) return [];
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

const RELATIVE_UNITS = [
  ["year", 365 * 24 * 3600],
  ["month", 30 * 24 * 3600],
  ["week", 7 * 24 * 3600],
  ["day", 24 * 3600],
  ["hour", 3600],
  ["minute", 60],
];

/** "3 days ago", "just now". `now` is injectable for tests. */
export function timeAgo(isoDate, now = Date.now()) {
  const seconds = Math.round((now - new Date(isoDate).getTime()) / 1000);
  if (!Number.isFinite(seconds)) return "";
  if (seconds < 60) return "just now";
  for (const [unit, size] of RELATIVE_UNITS) {
    const value = Math.floor(seconds / size);
    if (value >= 1) return `${value} ${unit}${value === 1 ? "" : "s"} ago`;
  }
  return "just now";
}

export function firstName(fullName) {
  return (fullName || "").trim().split(/\s+/)[0] || "";
}

export function bySortOrder(a, b) {
  return (a.sort_order ?? 0) - (b.sort_order ?? 0);
}

/**
 * Swap an item with its neighbour. Returns the two rows whose sort_order
 * changed, or null when the move is out of bounds.
 */
export function swapOrder(items, index, direction) {
  const target = index + direction;
  if (target < 0 || target >= items.length) return null;
  const a = items[index];
  const b = items[target];
  // Guarantee distinct values even if sort_order values were equal.
  const aOrder = b.sort_order === a.sort_order ? a.sort_order + direction : b.sort_order;
  return [
    { ...a, sort_order: aOrder },
    { ...b, sort_order: a.sort_order },
  ];
}
