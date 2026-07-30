import fs from 'node:fs';

const src = fs.readFileSync('public/brand/logo-es-abierto.svg', 'utf8');
const paths = [...src.matchAll(/<path d="([^"]+)"/g)].map((m) => m[1]);
const markPaths = paths.slice(1);

function bboxOf(d) {
  const tokens = d.match(/[A-Za-z]|[+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?/g) || [];
  let i = 0;
  let cmd = '';
  let x = 0;
  let y = 0;
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  const pt = (px, py) => {
    minX = Math.min(minX, px);
    minY = Math.min(minY, py);
    maxX = Math.max(maxX, px);
    maxY = Math.max(maxY, py);
  };
  const n = () => Number(tokens[i++]);
  const hasNum = () => i < tokens.length && !/^[A-Za-z]$/.test(tokens[i]);

  while (i < tokens.length) {
    if (/^[A-Za-z]$/.test(tokens[i])) cmd = tokens[i++];
    const rel = cmd === cmd.toLowerCase();
    const C = cmd.toUpperCase();

    if (C === 'M' || C === 'L' || C === 'T') {
      let first = true;
      while (hasNum()) {
        const nx = n();
        const ny = n();
        x = rel ? x + nx : nx;
        y = rel ? y + ny : ny;
        pt(x, y);
        if (C === 'M' && first) {
          cmd = rel ? 'l' : 'L';
          first = false;
        }
      }
    } else if (C === 'H') {
      while (hasNum()) {
        x = rel ? x + n() : n();
        pt(x, y);
      }
    } else if (C === 'V') {
      while (hasNum()) {
        y = rel ? y + n() : n();
        pt(x, y);
      }
    } else if (C === 'C') {
      while (hasNum()) {
        const x1 = n();
        const y1 = n();
        const x2 = n();
        const y2 = n();
        const nx = n();
        const ny = n();
        pt(rel ? x + x1 : x1, rel ? y + y1 : y1);
        pt(rel ? x + x2 : x2, rel ? y + y2 : y2);
        x = rel ? x + nx : nx;
        y = rel ? y + ny : ny;
        pt(x, y);
      }
    } else if (C === 'S' || C === 'Q') {
      while (hasNum()) {
        const x1 = n();
        const y1 = n();
        const nx = n();
        const ny = n();
        pt(rel ? x + x1 : x1, rel ? y + y1 : y1);
        x = rel ? x + nx : nx;
        y = rel ? y + ny : ny;
        pt(x, y);
      }
    } else if (C === 'A') {
      while (hasNum()) {
        n();
        n();
        n();
        n();
        n();
        const nx = n();
        const ny = n();
        x = rel ? x + nx : nx;
        y = rel ? y + ny : ny;
        pt(x, y);
      }
    }
  }
  return { minX, minY, maxX, maxY };
}

let minX = Infinity;
let minY = Infinity;
let maxX = -Infinity;
let maxY = -Infinity;
for (const d of markPaths) {
  const b = bboxOf(d);
  minX = Math.min(minX, b.minX);
  minY = Math.min(minY, b.minY);
  maxX = Math.max(maxX, b.maxX);
  maxY = Math.max(maxY, b.maxY);
}

const pad = 10;
minX -= pad;
minY -= pad;
maxX += pad;
maxY += pad;
const side = Math.max(maxX - minX, maxY - minY);
const cx = (minX + maxX) / 2;
const cy = (minY + maxY) / 2;
const vbX = cx - side / 2;
const vbY = cy - side / 2;
const vb = `${vbX.toFixed(2)} ${vbY.toFixed(2)} ${side.toFixed(2)} ${side.toFixed(2)}`;
const body = markPaths.map((d) => `<path d="${d}"/>`).join('');

// Maskable mark (currentColor) — header / footer via CSS mask
fs.writeFileSync(
  'public/brand/logo-mark.svg',
  `<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="${vb}">${body}</svg>\n`,
);

// Favicon: solo la marca (sin anillo / sin disco naranja de fondo)
const fav = `<svg xmlns="http://www.w3.org/2000/svg" fill="#b6573e" viewBox="${vb}">${body}</svg>\n`;
fs.writeFileSync('public/favicon.svg', fav);

console.log('ok', { vb, side: side.toFixed(1) });
