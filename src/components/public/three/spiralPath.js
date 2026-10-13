import { CatmullRomCurve3, Vector3 } from "three";

export const LOOP = 5; // radius of the loop each panel makes
const LOW = -1.8; // height of the front of the loop and of the way in and out; the back is as high above the middle

/*
 * The path every panel on the project wall follows. It comes in from the left
 * along the bottom of the screen, makes one full loop round the line in the
 * middle (across the front, up the right, over the back, down the left, across
 * the front again) and leaves to the right. The loop is tilted, front low and
 * back high, so the line sits inside it. Measured by arc length, so panels
 * travel at an even pace.
 */
const points = [new Vector3(-17, LOW, -1), new Vector3(-9, LOW, 2.4)];
for (let k = 0; k <= 8; k++) {
  const angle = (k / 8) * Math.PI * 2; // 0 at the front, a quarter turn at the right
  points.push(new Vector3(LOOP * Math.sin(angle), LOW * Math.cos(angle), LOOP * Math.cos(angle)));
}
points.push(new Vector3(9, LOW, 2.4), new Vector3(17, LOW, -1));

export const PATH = new CatmullRomCurve3(points, false, "centripetal");
PATH.arcLengthDivisions = 1200; // 100 per segment, so point k is lengths[k * 100]

/*
 * Panels follow one another a fixed share of the path apart. The loop, from
 * point 2 to point 10 where the path crosses itself at the front, is four and
 * a half gaps long, so the panel finishing the loop and the one starting it
 * pass the front half a gap apart. A whole number of gaps would put them on
 * the same spot at the same moment.
 */
const lengths = PATH.getLengths();
export const SPACING = (lengths[1000] - lengths[200]) / lengths[1200] / 4.5;

/**
 * Where panel i is along the path (0 entering, 1 leaving) when the section is
 * `progress` of the way scrolled. The first panel enters at the start and the
 * last leaves at the end, so a longer list travels a little faster.
 */
export function pathPosition(i, progress, count) {
  return progress * (1 + (count - 1) * SPACING) - i * SPACING;
}
