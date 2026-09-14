const round = (n) => Math.round(n * 10) / 10;

/**
 * SVG path data running from (startX, 0) through each waypoint to (endX, height).
 * Every segment leaves and enters vertically, so waypoints on alternating
 * sides join into a continuous S-shaped curve.
 */
export function trailPath(waypoints, { startX, endX, height }) {
  if (waypoints.length === 0) return "";
  let prev = { x: startX, y: 0 };
  let d = `M ${round(prev.x)} 0`;
  for (const point of [...waypoints, { x: endX, y: height }]) {
    const bend = (point.y - prev.y) / 2;
    d += ` C ${round(prev.x)} ${round(prev.y + bend)}, ${round(point.x)} ${round(point.y - bend)}, ${round(point.x)} ${round(point.y)}`;
    prev = point;
  }
  return d;
}

/**
 * Length along the path at height `y`, from samples of `{ y, length }`
 * sorted by y. Clamps outside the sampled range.
 */
export function lengthAtY(samples, y) {
  if (samples.length === 0) return 0;
  if (y <= samples[0].y) return samples[0].length;
  const last = samples[samples.length - 1];
  if (y >= last.y) return last.length;

  let lo = 0;
  let hi = samples.length - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (samples[mid].y <= y) lo = mid;
    else hi = mid;
  }
  const a = samples[lo];
  const b = samples[hi];
  const t = b.y === a.y ? 0 : (y - a.y) / (b.y - a.y);
  return a.length + t * (b.length - a.length);
}
