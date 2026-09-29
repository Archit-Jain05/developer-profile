import { useEffect } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";

/**
 * Inertial smooth scrolling for the public pages. It scrolls the real window,
 * so sticky elements and the CSS scroll-driven animations keep working, and it
 * stays off for anyone who asks for reduced motion. Anything that needs its own
 * native scrolling (dialogs, horizontal strips) opts out with
 * data-lenis-prevent.
 */
export function useSmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({ lerp: 0.1, anchors: { offset: -96 } });
    let frame = requestAnimationFrame(function tick(time) {
      lenis.raf(time);
      frame = requestAnimationFrame(tick);
    });
    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
    };
  }, []);
}
