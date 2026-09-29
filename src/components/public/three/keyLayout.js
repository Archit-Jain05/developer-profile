/**
 * Lays out `count` one-unit keys plus a final wide key in rows, offset per row
 * like a real keyboard. Returns positions centred on the origin, in key units.
 */
export function layoutKeys(count, { rowUnits = 4, wideUnits = 2, stagger = [0, 0.25, 0.5, 0.75] } = {}) {
  const widths = [...Array(count).fill(1), wideUnits];
  const placed = [];
  let row = 0;
  let col = 0;
  for (const w of widths) {
    if (col + w > rowUnits) {
      row += 1;
      col = 0;
    }
    placed.push({ row, x: col + stagger[row % stagger.length] + w / 2, w });
    col += w;
  }

  const rows = row + 1;
  const width = Math.max(...placed.map((k) => k.x + k.w / 2));
  return {
    rows,
    width,
    keys: placed.map((k) => ({ w: k.w, row: k.row, x: k.x - width / 2, z: k.row - (rows - 1) / 2 })),
  };
}
