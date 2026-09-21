import { CanvasTexture, SRGBColorSpace } from "three";

const PLACEHOLDER = "/placeholder-project.svg";

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** Draw a stylised, wordless app screen for a project that has no real screenshot yet. */
function drawMockScreen(ctx, w, h, portrait) {
  const bg = ctx.createLinearGradient(0, 0, w, h);
  bg.addColorStop(0, "#1a1a1f");
  bg.addColorStop(0.55, "#121216");
  bg.addColorStop(1, "#18181c");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  const glow = ctx.createRadialGradient(w * 0.75, h * 0.2, 0, w * 0.75, h * 0.2, w * 0.7);
  glow.addColorStop(0, "rgba(214,216,222,0.3)");
  glow.addColorStop(1, "rgba(214,216,222,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);

  const pad = portrait ? w * 0.08 : w * 0.05;

  if (!portrait) {
    ["#d98276", "#5b5b63", "#7fa892"].forEach((c, i) => {
      ctx.fillStyle = c;
      ctx.beginPath();
      ctx.arc(pad + i * 26, pad, 8, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  // Masthead: a bright bar with a muted one under it, standing in for a title.
  const titleH = portrait ? h * 0.045 : h * 0.055;
  const title = ctx.createLinearGradient(pad, 0, pad + w * 0.5, 0);
  title.addColorStop(0, "rgba(240,240,244,0.92)");
  title.addColorStop(1, "rgba(255,255,255,0.8)");
  ctx.fillStyle = title;
  roundRect(ctx, pad, portrait ? h * 0.1 : h * 0.19, w * (portrait ? 0.62 : 0.34), titleH, titleH / 2);
  ctx.fill();

  ctx.fillStyle = "rgba(236,236,240,0.38)";
  roundRect(ctx, pad, portrait ? h * 0.165 : h * 0.28, w * (portrait ? 0.4 : 0.2), titleH * 0.5, titleH * 0.25);
  ctx.fill();

  // Content blocks
  const blockTop = portrait ? h * 0.28 : h * 0.44;
  const cols = portrait ? 1 : 3;
  const gap = pad * 0.6;
  const bw = (w - pad * 2 - gap * (cols - 1)) / cols;
  const bh = portrait ? h * 0.16 : h * 0.3;
  const rows = portrait ? 4 : 1;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = pad + c * (bw + gap);
      const y = blockTop + r * (bh + gap);
      const card = ctx.createLinearGradient(x, y, x + bw, y + bh);
      card.addColorStop(0, "rgba(255,255,255,0.14)");
      card.addColorStop(1, "rgba(255,255,255,0.04)");
      ctx.fillStyle = card;
      roundRect(ctx, x, y, bw, bh, 16);
      ctx.fill();
      ctx.fillStyle = (r + c) % 2 ? "rgba(150,152,160,0.75)" : "rgba(214,216,222,0.85)";
      roundRect(ctx, x + 18, y + 18, bw * 0.45, 12, 6);
      ctx.fill();
      ctx.fillStyle = "rgba(236,236,240,0.26)";
      roundRect(ctx, x + 18, y + 44, bw * 0.7, 9, 5);
      ctx.fill();
      roundRect(ctx, x + 18, y + 64, bw * 0.55, 9, 5);
      ctx.fill();
    }
  }
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Could not load ${src}`));
    img.src = src;
  });
}

/**
 * Build a screen texture for a project: its real screenshot when one has been
 * uploaded, otherwise a generated mock screen. Never rejects.
 */
export async function createScreenTexture(project, { portrait = false } = {}) {
  const w = portrait ? 512 : 1024;
  const h = portrait ? 1040 : 640;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");

  try {
    await document.fonts?.ready;
  } catch {
    // Fonts unavailable; the canvas falls back to system fonts.
  }

  const src = project?.image_url;
  let drewImage = false;
  if (src && !src.endsWith(PLACEHOLDER)) {
    try {
      const img = await loadImage(src);
      const scale = Math.max(w / img.width, h / img.height);
      const dw = img.width * scale;
      const dh = img.height * scale;
      ctx.drawImage(img, (w - dw) / 2, portrait ? 0 : (h - dh) / 2, dw, dh);
      drewImage = true;
    } catch {
      drewImage = false;
    }
  }
  if (!drewImage) drawMockScreen(ctx, w, h, portrait);

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

/** Radial glow used behind the devices so the glass has colour to refract. */
export function createGlowTexture() {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, "rgba(245,246,250,0.85)");
  g.addColorStop(0.35, "rgba(214,216,222,0.6)");
  g.addColorStop(0.7, "rgba(214,216,222,0.22)");
  g.addColorStop(1, "rgba(214,216,222,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}
