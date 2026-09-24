/**
 * Genera los relieves de fondo por vista (public/textures/topo-<vista>.svg).
 * Curvas de nivel sobre ruido fractal con semilla fija: cada vista tiene su
 * propio terreno y el resultado es reproducible. La portada y Territorio usan
 * el mapa real (mapa-topografico-fondo.png); esto es para el resto.
 *
 * Uso: node scripts/gen-topo.mjs
 */
import fs from 'node:fs';

const W = 1440;
const H = 1080;
const STEP = 8;

// Cada vista: semilla, escala del ruido, distorsión y cantidad de curvas.
const VIEWS = {
  proyecto: { seed: 11, scale: 0.0021, warp: 90, levels: 20, ridge: 0.35 },
  equipo: { seed: 23, scale: 0.0032, warp: 55, levels: 16, ridge: 0.0 },
  cuaderno: { seed: 37, scale: 0.0017, warp: 140, levels: 22, ridge: 0.55 },
  archivo: { seed: 41, scale: 0.0026, warp: 70, levels: 18, ridge: 0.2 },
  publicaciones: { seed: 53, scale: 0.0014, warp: 110, levels: 24, ridge: 0.7 },
  productos: { seed: 67, scale: 0.0029, warp: 80, levels: 17, ridge: 0.45 },
  contacto: { seed: 79, scale: 0.0019, warp: 100, levels: 19, ridge: 0.1 },
};

function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makeNoise(seed) {
  const rand = rng(seed);
  const perm = new Uint8Array(512);
  const p = [...Array(256).keys()];
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [p[i], p[j]] = [p[j], p[i]];
  }
  for (let i = 0; i < 512; i++) perm[i] = p[i & 255];
  const grad = (h, x, y) => {
    const g = h & 7;
    const u = g < 4 ? x : y;
    const v = g < 4 ? y : x;
    return (g & 1 ? -u : u) + (g & 2 ? -2 * v : 2 * v);
  };
  const fade = (t) => t * t * t * (t * (t * 6 - 15) + 10);
  const lerp = (a, b, t) => a + (b - a) * t;
  return (x, y) => {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    const xf = x - Math.floor(x);
    const yf = y - Math.floor(y);
    const u = fade(xf);
    const v = fade(yf);
    const aa = perm[perm[X] + Y];
    const ab = perm[perm[X] + Y + 1];
    const ba = perm[perm[X + 1] + Y];
    const bb = perm[perm[X + 1] + Y + 1];
    return lerp(
      lerp(grad(aa, xf, yf), grad(ba, xf - 1, yf), u),
      lerp(grad(ab, xf, yf - 1), grad(bb, xf - 1, yf - 1), u),
      v,
    ) / 2.2;
  };
}

function field({ seed, scale, warp, ridge }) {
  const n = makeNoise(seed);
  const n2 = makeNoise(seed + 1000);
  const fbm = (x, y) => {
    let sum = 0;
    let amp = 1;
    let freq = 1;
    let norm = 0;
    for (let o = 0; o < 5; o++) {
      let v = n(x * freq, y * freq);
      // Crestas: pliega el ruido para dar cordones montañosos.
      v = (1 - ridge) * v + ridge * (1 - Math.abs(v) * 2);
      sum += v * amp;
      norm += amp;
      amp *= 0.5;
      freq *= 2.03;
    }
    return sum / norm;
  };
  const cols = Math.ceil(W / STEP) + 1;
  const rows = Math.ceil(H / STEP) + 1;
  const g = new Float32Array(cols * rows);
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const x = i * STEP;
      const y = j * STEP;
      const wx = x + warp * n2(x * scale * 0.7, y * scale * 0.7);
      const wy = y + warp * n2(x * scale * 0.7 + 31.7, y * scale * 0.7 + 17.3);
      g[j * cols + i] = fbm(wx * scale, wy * scale);
    }
  }
  return { g, cols, rows };
}

// Marching squares → segmentos → polilíneas encadenadas.
function contours({ g, cols, rows }, level) {
  const segs = [];
  const at = (i, j) => g[j * cols + i];
  const interp = (x1, y1, v1, x2, y2, v2) => {
    const t = (level - v1) / (v2 - v1);
    return [x1 + (x2 - x1) * t, y1 + (y2 - y1) * t];
  };
  for (let j = 0; j < rows - 1; j++) {
    for (let i = 0; i < cols - 1; i++) {
      const a = at(i, j), b = at(i + 1, j), c = at(i + 1, j + 1), d = at(i, j + 1);
      const x = i * STEP, y = j * STEP;
      const pts = [];
      if ((a < level) !== (b < level)) pts.push(interp(x, y, a, x + STEP, y, b));
      if ((b < level) !== (c < level)) pts.push(interp(x + STEP, y, b, x + STEP, y + STEP, c));
      if ((c < level) !== (d < level)) pts.push(interp(x + STEP, y + STEP, c, x, y + STEP, d));
      if ((d < level) !== (a < level)) pts.push(interp(x, y + STEP, d, x, y, a));
      if (pts.length === 2) segs.push(pts);
      else if (pts.length === 4) segs.push([pts[0], pts[1]], [pts[2], pts[3]]);
    }
  }
  const key = (p) => `${p[0].toFixed(2)},${p[1].toFixed(2)}`;
  const ends = new Map();
  segs.forEach((s, idx) => {
    for (const p of s) {
      const k = key(p);
      if (!ends.has(k)) ends.set(k, []);
      ends.get(k).push(idx);
    }
  });
  const used = new Uint8Array(segs.length);
  const lines = [];
  for (let s = 0; s < segs.length; s++) {
    if (used[s]) continue;
    used[s] = 1;
    const line = [...segs[s]];
    for (const dir of [1, 0]) {
      for (;;) {
        const tip = dir ? line[line.length - 1] : line[0];
        const next = (ends.get(key(tip)) || []).find((k) => !used[k]);
        if (next === undefined) break;
        used[next] = 1;
        const [p, q] = segs[next];
        const other = key(p) === key(tip) ? q : p;
        if (dir) line.push(other);
        else line.unshift(other);
      }
    }
    if (line.length > 3) lines.push(simplify(line, 0.9));
  }
  return lines;
}

function simplify(pts, tol) {
  if (pts.length < 3) return pts;
  const [a, b] = [pts[0], pts[pts.length - 1]];
  let max = 0, idx = 0;
  for (let i = 1; i < pts.length - 1; i++) {
    const p = pts[i];
    const dx = b[0] - a[0], dy = b[1] - a[1];
    const len = Math.hypot(dx, dy) || 1;
    const dist = Math.abs(dy * p[0] - dx * p[1] + b[0] * a[1] - b[1] * a[0]) / len;
    if (dist > max) { max = dist; idx = i; }
  }
  if (max <= tol) return [a, b];
  return [...simplify(pts.slice(0, idx + 1), tol).slice(0, -1), ...simplify(pts.slice(idx), tol)];
}

const f = (n) => Math.round(n * 10) / 10;

for (const [name, cfg] of Object.entries(VIEWS)) {
  const fld = field(cfg);
  let min = Infinity, max = -Infinity;
  for (const v of fld.g) { if (v < min) min = v; if (v > max) max = v; }
  const thin = [];
  const index = [];
  for (let l = 1; l < cfg.levels; l++) {
    const level = min + ((max - min) * l) / cfg.levels;
    const d = contours(fld, level)
      .map((line) => 'M' + line.map((p) => `${f(p[0])} ${f(p[1])}`).join('L'))
      .join('');
    // Cada quinta curva es maestra: más gruesa, como en la cartografía.
    (l % 5 === 0 ? index : thin).push(d);
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice"><g fill="none" stroke="#131416" stroke-linejoin="round" stroke-linecap="round"><path stroke-width="0.8" d="${thin.join('')}"/><path stroke-width="1.6" d="${index.join('')}"/></g></svg>\n`;
  fs.writeFileSync(`public/textures/topo-${name}.svg`, svg);
  console.log(name, Math.round(svg.length / 1024) + ' KB');
}
