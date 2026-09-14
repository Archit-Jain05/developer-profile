const API = "https://api.github.com";
const CACHE_MS = 30 * 60 * 1000;

/** "https://github.com/Archit-Jain05/" → "Archit-Jain05"; null if not a GitHub profile URL. */
export function githubUsername(url) {
  if (!url) return null;
  const match = String(url).match(/^https?:\/\/(?:www\.)?github\.com\/([A-Za-z0-9-]{1,39})\/?(?:[?#].*)?$/i);
  return match ? match[1] : null;
}

/** Share of each language across repos, weighted by repo size. Largest first. */
export function languageShares(repos, limit = 5) {
  const totals = new Map();
  for (const repo of repos) {
    if (!repo.language) continue;
    const weight = Math.max(repo.size || 0, 1);
    totals.set(repo.language, (totals.get(repo.language) || 0) + weight);
  }
  const sum = [...totals.values()].reduce((a, b) => a + b, 0);
  if (sum === 0) return [];
  const sorted = [...totals.entries()].sort((a, b) => b[1] - a[1]);
  const top = sorted.slice(0, limit).map(([name, value]) => ({ name, share: value / sum }));
  const rest = sorted.slice(limit).reduce((a, [, v]) => a + v, 0);
  if (rest > 0) top.push({ name: "Other", share: rest / sum });
  return top;
}

/** Summarise raw API responses into what the panel shows. */
export function summarise(user, repos) {
  // Skip forks, archived repos and the profile README repo (named after the user).
  const own = repos.filter(
    (r) => !r.fork && !r.archived && r.name.toLowerCase() !== String(user.login).toLowerCase(),
  );
  return {
    login: user.login,
    profileUrl: user.html_url,
    publicRepos: user.public_repos,
    followers: user.followers,
    stars: own.reduce((sum, r) => sum + (r.stargazers_count || 0), 0),
    languages: languageShares(own),
    recent: [...own]
      .sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at))
      .slice(0, 4)
      .map((r) => ({
        name: r.name,
        url: r.html_url,
        description: r.description,
        language: r.language,
        pushedAt: r.pushed_at,
        homepage: r.homepage || null,
      })),
  };
}

function readCache(key) {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    const { at, data } = JSON.parse(raw);
    return Date.now() - at < CACHE_MS ? data : null;
  } catch {
    return null;
  }
}

function writeCache(key, data) {
  try {
    sessionStorage.setItem(key, JSON.stringify({ at: Date.now(), data }));
  } catch {
    // Storage unavailable (private mode); fetching again next time is fine.
  }
}

async function getJson(path, signal) {
  const res = await fetch(`${API}${path}`, {
    signal,
    headers: { Accept: "application/vnd.github+json" },
  });
  if (!res.ok) {
    const limited = res.status === 403 && res.headers.get("x-ratelimit-remaining") === "0";
    throw new Error(limited ? "GitHub rate limit reached" : `GitHub responded ${res.status}`);
  }
  return res.json();
}

/** Fetch public GitHub activity for a user, cached for 30 minutes per browser session. */
export async function fetchGithubActivity(username, { signal } = {}) {
  const key = `gh-activity:${username.toLowerCase()}`;
  const cached = readCache(key);
  if (cached) return cached;
  const [user, repos] = await Promise.all([
    getJson(`/users/${encodeURIComponent(username)}`, signal),
    getJson(`/users/${encodeURIComponent(username)}/repos?per_page=100&sort=pushed`, signal),
  ]);
  const data = summarise(user, repos);
  writeCache(key, data);
  return data;
}

// Colours from GitHub's linguist palette for the languages likely to appear.
export const LANGUAGE_COLORS = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Dart: "#00b4ab",
  Liquid: "#67b8de",
  CSS: "#663399",
  HTML: "#e34c26",
  Python: "#3572a5",
  Java: "#b07219",
  Kotlin: "#a97bff",
  Swift: "#f05138",
  "C++": "#f34b7d",
  C: "#555555",
  PHP: "#4f5d95",
  Shell: "#89e051",
  Other: "#6b7a90",
};

export function languageColor(name) {
  return LANGUAGE_COLORS[name] ?? "#8aa4b3";
}

// GitHub has no public REST endpoint for the contribution graph (it lives in the
// GraphQL API, which needs a token), so the calendar comes from this read-only
// mirror of the same public data.
const CONTRIBUTIONS_API = "https://github-contributions-api.jogruber.de/v4";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/**
 * Lay days out the way GitHub does: one column per week, Sunday at the top,
 * with the first and last weeks padded so every column holds seven slots.
 */
export function toCalendar(days) {
  if (!days?.length) return { weeks: [], months: [] };

  const padStart = new Date(days[0].date).getUTCDay();
  const slots = [...Array(padStart).fill(null), ...days];
  while (slots.length % 7 !== 0) slots.push(null);

  const weeks = [];
  for (let i = 0; i < slots.length; i += 7) weeks.push(slots.slice(i, i + 7));

  // A month label sits above the first week that starts a new month.
  const months = [];
  weeks.forEach((week, index) => {
    const first = week.find(Boolean);
    if (!first) return;
    const month = new Date(first.date).getUTCMonth();
    if (months.length === 0 || months[months.length - 1].month !== month) {
      months.push({ month, label: MONTHS[month], index });
    }
  });
  // Drop a leading label that has too little room to read.
  if (months.length > 1 && months[1].index < 2) months.shift();

  return { weeks, months };
}

/** A year of contribution counts for a user, cached like the rest of the panel. */
export async function fetchContributions(username, { signal } = {}) {
  const key = `gh-contributions:${username.toLowerCase()}`;
  const cached = readCache(key);
  if (cached) return cached;

  const res = await fetch(`${CONTRIBUTIONS_API}/${encodeURIComponent(username)}?y=last`, { signal });
  if (!res.ok) throw new Error(`Contributions responded ${res.status}`);
  const body = await res.json();

  const days = (body.contributions ?? []).map((day) => ({
    date: day.date,
    count: day.count ?? 0,
    level: Math.min(Number(day.level ?? 0), 4),
  }));
  const data = {
    total: Object.values(body.total ?? {}).reduce((a, b) => a + b, 0) || days.reduce((a, d) => a + d.count, 0),
    days,
  };
  writeCache(key, data);
  return data;
}
