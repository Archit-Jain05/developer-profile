import { useSyncExternalStore } from "react";

/*
 * The site's two themes: "light" (the default) and "dark" (night). The theme
 * lives on <html data-theme>, set before the first paint by the script in
 * index.html, so the CSS tokens, the 3D scenes and this hook all read one value.
 */
const root = () => document.documentElement;

export const getTheme = () => (root().dataset.theme === "dark" ? "dark" : "light");

/** The visitor's own choice, or light if they have not made one. */
export function storedTheme() {
  try {
    return localStorage.getItem("theme") === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
}

/** Shows a theme without remembering it (the admin holds itself at night this way). */
export function applyTheme(theme) {
  root().dataset.theme = theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", theme === "dark" ? "#000000" : "#f6f0f1");
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
