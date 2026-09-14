// Motherboard-style traces: right angles with the occasional 45° jog, and a
// solder pad wherever a trace turns. Generated from a fixed seed so every visit
// draws the same board.

const STEP = 6;

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const round = (n) => Math.round(n * 10) / 10;

/** One trace walking outward from (x, y) until it leaves the box. */
function walk(random, x, y, width, height) {
  // Head away from the middle so traces fan out rather than cross the centre.
  let dx = x < width / 2 ? -1 : 1;
  let dy = 0;
  let d = `M ${round(x)} ${round(y)}`;
  const pads = [];
  let guard = 0;

  while (x > -STEP && x < width + STEP && y > -STEP && y < height + STEP && guard < 24) {
    guard += 1;
    const run = STEP * (1 + Math.floor(random() * 4));
    x += dx * run;
    y += dy * run;
    d += ` L ${round(x)} ${round(y)}`;

    const turn = random();
    if (turn < 0.22) {
      // A 45° jog, the giveaway of a real board.
      const jog = STEP * (1 + Math.floor(random() * 2));
      const nx = x + (dx !== 0 ? dx * jog : (random() < 0.5 ? -jog : jog));
      const ny = y + (dy !== 0 ? dy * jog : (random() < 0.5 ? -jog : jog));
      x = nx;
      y = ny;
      d += ` L ${round(x)} ${round(y)}`;
    } else if (turn < 0.75) {
      pads.push({ x: round(x), y: round(y) });
      if (dx !== 0) {
        dy = random() < 0.5 ? -1 : 1;
        dx = 0;
      } else {
        dx = random() < 0.5 ? -1 : 1;
        dy = 0;
      }
    }
  }

  return { d, pads };
}

/**
 * A set of traces spreading from the middle of a `width` × `height` box.
 * Returns SVG path data plus the pads to draw on top of it.
 */
export function circuitPaths({ width = 160, height = 100, count = 18, seed = 11 } = {}) {
  const random = mulberry32(seed);
  const traces = [];

  for (let i = 0; i < count; i++) {
    const startX = width / 2 + (random() - 0.5) * width * 0.5;
    const startY = height / 2 + (random() - 0.5) * height * 0.7;
    traces.push(walk(random, startX, startY, width, height));
  }

  return traces;
}
