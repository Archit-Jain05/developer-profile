import { useEffect } from "react";

export const SPOTLIGHT_SELECTOR = ".section-title, .contact__title, .contact-page__title, .hero__name";

/**
 * Tracks the pointer over the page headings and records where it sits inside
 * each one, so CSS can light up only that part of the text. One listener for
 * every heading; skipped on touch, where there is no hover to follow.
 */
export function useSpotlightTitles(selector = SPOTLIGHT_SELECTOR) {
  useEffect(() => {
    if (!window.matchMedia("(hover: hover)").matches) return;

    const onMove = (event) => {
      const title = event.target.closest?.(selector);
      if (!title) return;
      const box = title.getBoundingClientRect();
      title.style.setProperty("--mx", `${event.clientX - box.left}px`);
      title.style.setProperty("--my", `${event.clientY - box.top}px`);
    };

    document.addEventListener("pointermove", onMove, { passive: true });
    return () => document.removeEventListener("pointermove", onMove);
  }, [selector]);
}
