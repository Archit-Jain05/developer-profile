import { describe, expect, it } from "vitest";
import { githubUsername, languageShares, summarise, toCalendar } from "./github.js";
import { timeAgo } from "./format.js";

describe("githubUsername", () => {
  it("extracts the user from profile URLs", () => {
    expect(githubUsername("https://github.com/Archit-Jain05")).toBe("Archit-Jain05");
    expect(githubUsername("https://www.github.com/Archit-Jain05/")).toBe("Archit-Jain05");
  });

  it("rejects non-profile URLs", () => {
    expect(githubUsername("https://github.com/Archit-Jain05/Velora")).toBeNull();
    expect(githubUsername("https://gitlab.com/someone")).toBeNull();
    expect(githubUsername("")).toBeNull();
  });
});

describe("languageShares", () => {
  it("weights by repo size, sorts, and groups the tail as Other", () => {
    const repos = [
      { language: "TypeScript", size: 600 },
      { language: "Liquid", size: 300 },
      { language: "Dart", size: 100 },
      { language: null, size: 999 },
    ];
    const shares = languageShares(repos, 2);
    expect(shares.map((s) => s.name)).toEqual(["TypeScript", "Liquid", "Other"]);
    expect(shares[0].share).toBeCloseTo(0.6);
    expect(shares[2].share).toBeCloseTo(0.1);
  });

  it("returns nothing when no repo has a language", () => {
    expect(languageShares([{ language: null, size: 10 }])).toEqual([]);
  });
});

describe("summarise", () => {
  it("skips forks and the profile README repo, totals stars and lists the most recently pushed repos", () => {
    const user = { login: "a", html_url: "https://github.com/a", public_repos: 3, followers: 7 };
    const repos = [
      { name: "old", fork: false, stargazers_count: 2, pushed_at: "2025-01-01T00:00:00Z", language: "Dart", size: 1, html_url: "u1" },
      { name: "new", fork: false, stargazers_count: 1, pushed_at: "2026-09-01T00:00:00Z", language: "TypeScript", size: 1, html_url: "u2" },
      { name: "a", fork: false, stargazers_count: 0, pushed_at: "2026-09-12T00:00:00Z", language: null, size: 1, html_url: "u4" },
      { name: "forked", fork: true, stargazers_count: 50, pushed_at: "2026-09-10T00:00:00Z", language: "C", size: 1, html_url: "u3" },
    ];
    const s = summarise(user, repos);
    expect(s.stars).toBe(3);
    expect(s.recent.map((r) => r.name)).toEqual(["new", "old"]);
    expect(s.publicRepos).toBe(3);
  });
});

describe("timeAgo", () => {
  const now = new Date("2026-09-14T12:00:00Z").getTime();
  it("picks the largest whole unit", () => {
    expect(timeAgo("2026-09-14T11:59:30Z", now)).toBe("just now");
    expect(timeAgo("2026-09-14T11:00:00Z", now)).toBe("1 hour ago");
    expect(timeAgo("2026-09-11T12:00:00Z", now)).toBe("3 days ago");
    expect(timeAgo("2026-08-01T12:00:00Z", now)).toBe("1 month ago");
  });
});

describe("toCalendar", () => {
  const day = (date, count = 0) => ({ date, count, level: 0 });

  it("returns nothing for an empty year", () => {
    expect(toCalendar([])).toEqual({ weeks: [], months: [] });
  });

  it("pads the first week so each column holds seven days", () => {
    // 2024-01-03 is a Wednesday, so the first column needs three empty slots.
    const days = ["2024-01-03", "2024-01-04", "2024-01-05"].map((d) => day(d));
    const { weeks } = toCalendar(days);
    expect(weeks).toHaveLength(1);
    expect(weeks[0].slice(0, 3)).toEqual([null, null, null]);
    expect(weeks[0][3].date).toBe("2024-01-03");
    expect(weeks[0]).toHaveLength(7);
  });

  it("labels each column that starts a new month", () => {
    const days = [];
    for (let i = 0; i < 70; i++) {
      const d = new Date(Date.UTC(2024, 0, 7 + i));
      days.push(day(d.toISOString().slice(0, 10)));
    }
    const { months } = toCalendar(days);
    expect(months.map((m) => m.label)).toEqual(["Jan", "Feb", "Mar"]);
  });
});
