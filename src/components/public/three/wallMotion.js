import { MathUtils } from "three";

export const LOOP = 5; // radius of the circle the panels gather into
const LOW = -1.8; // height of the front of the circle (the back is as high above the middle)
const LEAD = 17; // length of the straight lane in, and out: well past the screen edges
const CIRCLE = Math.PI * 2 * LOOP;

/*
 * The choreography of the project wall, as one conveyor. Every panel follows
 * the same path: a straight lane in from the left across the front, once round
 * the circle, and a straight lane out to the right. Panels travel nose to tail:
 *
 *   1. They file in from the left one by one, each wrapping onto the circle
 *      behind the one before and stopping in its place. Because they are an even
 *      distance apart and all stop together, the last one arrives just as the
 *      circle is full.
 *   2. The full circle keeps turning.
 *   3. The panel that went in first reaches the front again first, and leaves
 *      along the lane to the right, the rest following one by one.
 *
 * Writes the panel's pose into `out`: x, y, z, rotation about y, opacity and
 * `near` (0 back of the circle, 1 front), and whether it is on stage.
 */
export function panelPose(i, count, progress, out = {}) {
  const gap = CIRCLE / count;
  const filled = LEAD + (count - 1) * gap; // the head's travel when the circle is full
  const total = filled + CIRCLE + LEAD; // ... and when the last panel has left
  const head = progress * total;
  const slot = LEAD + (count - 1 - i) * gap; // where panel i stops on the circle
  const s = Math.min(head - i * gap, slot) + Math.max(0, head - filled);

  out.visible = s > -gap && s < LEAD + CIRCLE + LEAD - 1e-6;
  const a = MathUtils.clamp((s - LEAD) / LOOP, 0, Math.PI * 2); // angle round the circle
  const lane = s < LEAD ? s - LEAD : s > LEAD + CIRCLE ? s - LEAD - CIRCLE : 0;
  out.x = LOOP * Math.sin(a) + lane;
  out.y = LOW * Math.cos(a);
  out.z = LOOP * Math.cos(a);
  out.rotY = a;
  out.onCircle = s >= LEAD - 1e-6 && s <= LEAD + CIRCLE + 1e-6 ? 1 : 0;
  out.opacity = MathUtils.smoothstep(s, -gap, 0) * (1 - MathUtils.smoothstep(s, LEAD + CIRCLE + LEAD - 6, LEAD + CIRCLE + LEAD));
  out.near = MathUtils.clamp((out.z + LOOP) / (2 * LOOP), 0, 1);
  return out;
}

/** The scroll progress at which the circle is exactly full. */
export function fullAt(count) {
  const gap = CIRCLE / count;
  const filled = LEAD + (count - 1) * gap;
  return filled / (filled + CIRCLE + LEAD);
}
