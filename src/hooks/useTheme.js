import { useSyncExternalStore } from "react";

/*
 * The site's two themes: "light" (the default) and "dark" (night). The theme
 * lives on <html data-theme>, set before the first paint by the script in
 * index.html, so the CSS tokens, the 3D scenes and this hook all read one value.
 */
const root = () => document.documentElement;

export const getTheme = () => (root().dataset.theme === "dark" ? "dark" : "light");

const deviceQuery = () => window.matchMedia("(prefers-color-scheme: dark)");

/** The visitor's own choice, or else the device's setting. */
export function storedTheme() {
  try {
    const saved = localStorage.getItem("theme");
    if (saved === "dark" || saved === "light") return saved;
  } catch {
    // Storage can be refused; fall through to the device.
  }
  return deviceQuery().matches ? "dark" : "light";
}

/** True once the visitor has picked a theme with the switch. */
const hasChoice = () => {
  try {
    return ["dark", "light"].includes(localStorage.getItem("theme"));
  } catch {
    return false;
  }
};

// Follow the device live (e.g. the OS switching to dark at sunset) until the
// visitor has chosen. The admin holds itself at night and is left alone.
if (typeof window !== "undefined") {
  deviceQuery().addEventListener("change", () => {
    if (!hasChoice() && !location.pathname.startsWith("/admin")) applyTheme(storedTheme());
  });
}

/** Shows a theme without remembering it (the admin holds itself at night this way). */
export function applyTheme(theme) {
  root().dataset.theme = theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", theme === "dark" ? "#000000" : "#ffffff");
}

/** Shows a theme and remembers it for the visitor's next visit. */
export function setTheme(theme) {
  applyTheme(theme);
  try {
    localStorage.setItem("theme", theme);
  } catch {
    // Storage can be refused (private windows); the switch still works for this visit.
  }
}

/** Calls `callback` whenever the theme changes; returns the unsubscribe. */
export function subscribeTheme(callback) {
  const observer = new MutationObserver(callback);
  observer.observe(root(), { attributes: true, attributeFilter: ["data-theme"] });
  return () => observer.disconnect();
}

export const useTheme = () => useSyncExternalStore(subscribeTheme, getTheme);
