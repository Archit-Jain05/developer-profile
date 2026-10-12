/**
 * How far a tall, pinned section has scrolled through its pin, from 0 (its
 * top meets the top of the screen) to 1 (its bottom meets the bottom). A
 * section that is not taller than the screen reports 1.
 */
export function scrollProgress(section) {
  if (!section) return 1;
  const box = section.getBoundingClientRect();
  const span = box.height - window.innerHeight;
  return span > 0 ? Math.min(1, Math.max(0, -box.top / span)) : 1;
}
