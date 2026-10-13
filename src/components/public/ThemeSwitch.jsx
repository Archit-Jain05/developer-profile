import { FiMoon, FiSun } from "react-icons/fi";
import { setTheme, useTheme } from "../../hooks/useTheme.js";

/**
 * The day/night switch in the nav: a knob that slides between the sun and the
 * moon. Where the browser supports View Transitions, the new theme opens out
 * of the switch as a growing circle; otherwise, and under reduced motion, it
 * swaps at once.
 */
export default function ThemeSwitch() {
  const night = useTheme() === "dark";

  const toggle = (event) => {
    const next = night ? "light" : "dark";
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!document.startViewTransition || calm) {
      setTheme(next);
      return;
    }
    const box = event.currentTarget.getBoundingClientRect();
    const x = box.left + box.width / 2;
    const y = box.top + box.height / 2;
    const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
    document
      .startViewTransition(() => setTheme(next))
      .ready.then(() =>
        document.documentElement.animate(
          { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
          { duration: 700, easing: "cubic-bezier(0.16, 1, 0.3, 1)", pseudoElement: "::view-transition-new(root)" },
        ),
      )
      .catch(() => {});
  };

  return (
    <button type="button" role="switch" aria-checked={night} aria-label="Night mode" className="theme-switch" onClick={toggle}>
      <span className="theme-switch__knob" aria-hidden="true" />
      <FiSun aria-hidden="true" />
      <FiMoon aria-hidden="true" />
    </button>
  );
}
