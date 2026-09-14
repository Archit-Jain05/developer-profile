import { useCallback, useRef } from "react";

const canTilt = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
  !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * 3D tilt that follows the pointer. Writes CSS variables on the element:
 * --rx/--ry (degrees) and --mx/--my (sheen position, %).
 */
export function useTilt(maxDeg = 8) {
  const frame = useRef(0);

  const onPointerMove = useCallback(
    (e) => {
      if (!canTilt()) return;
      const el = e.currentTarget;
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      cancelAnimationFrame(frame.current);
      frame.current = requestAnimationFrame(() => {
        el.style.setProperty("--ry", `${(x - 0.5) * 2 * maxDeg}deg`);
        el.style.setProperty("--rx", `${(0.5 - y) * 2 * maxDeg}deg`);
        el.style.setProperty("--mx", `${x * 100}%`);
        el.style.setProperty("--my", `${y * 100}%`);
      });
    },
    [maxDeg],
  );

  const onPointerLeave = useCallback((e) => {
    cancelAnimationFrame(frame.current);
    const el = e.currentTarget;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
  }, []);

  return { onPointerMove, onPointerLeave };
}
