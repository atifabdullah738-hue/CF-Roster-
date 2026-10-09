// Procedural PBR-ish textures + materials, generated on a canvas in the browser (fast typed-array noise,
// one cached texture per surface type; colour comes from material.color so everything can be tinted).
// Every material records `userData.tileM` = metres covered by one texture tile (arch.mjs maps UVs in world units).
import * as THREE from 'three';

export function rng(seed = 1) {
  let a = seed >>> 0;
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const cache = new Map();
const memo = (k, f) => { if (!cache.has(k)) cache.set(k, f()); return cache.get(k); };
const clamp = (v) => (v < 0 ? 0 : v > 255 ? 255 : v);
const SIZE = 1024;

/** Tileable fractal value noise as Float32Array(size*size) in 0..1. */
export function noiseArr(seed, size = SIZE, octaves = 5, base = 4) {
  return memo(`n${seed}/${size}/${octaves}/${base}`, () => {
    const out = new Float32Array(size * size), r = rng(seed); let amp = 0.5, tot = 0;
    for (let o = 0; o < octaves; o++) {
      const cells = base * 2 ** o, g = new Float32Array(cells * cells); for (let i = 0; i < g.length; i++) g[i] = r();
      const x0 = new Int32Array(size), x1 = new Int32Array(size), tx = new Float32Array(size);
      for (let x = 0; x < size; x++) { const fx = (x / size) * cells, i0 = Math.floor(fx), t = fx - i0; x0[x] = i0 % cells; x1[x] = (i0 + 1) % cells; tx[x] = t * t * (3 - 2 * t); }
      for (let y = 0; y < size; y++) {
        const fy = (y / size) * cells, j0 = Math.floor(fy), t = fy - j0, ty = t * t * (3 - 2 * t), r0 = (j0 % cells) * cells, r1 = ((j0 + 1) % cells) * cells;
        for (let x = 0; x < size; x++) { const a = g[r0 + x0[x]], b = g[r0 + x1[x]], c = g[r1 + x0[x]], d = g[r1 + x1[x]]; out[y * size + x] += (a + (b - a) * tx[x] + (c - a) * ty + (a - b - c + d) * tx[x] * ty) * amp; }
      }
      tot += amp; amp *= 0.5;
    }
    for (let i = 0; i < out.length; i++) out[i] /= tot; return out;
  });
}

function canvasOf(size) { const c = document.createElement('canvas'); c.width = c.height = size; return c; }
function tex(c, srgb = true) {
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace; t.anisotropy = 8; return t;
}
/** paint(size, (i, x, y, out)=>…) with out=[r,g,b] 0..255 */
function paintTex(size, fn, srgb = true) {
  const c = canvasOf(size), ctx = c.getContext('2d'), img = ctx.createImageData(size, size), d = img.data, o = [0, 0, 0];
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) { fn(y * size + x, x, y, o); const k = (y * size + x) * 4; d[k] = clamp(o[0]); d[k + 1] = clamp(o[1]); d[k + 2] = clamp(o[2]); d[k + 3] = 255; }
  ctx.putImageData(img, 0, 0); return tex(c, srgb);
}
function bumpFrom(arr, size = SIZE, gain = 255, grit = 0) {
  return paintTex(size, (i, x, y, o) => { const k = arr[i] * gain + (grit ? Math.random() * grit : 0); o[0] = o[1] = o[2] = k; }, false);
}
function std(map, bump, { tileM, roughness = 0.9, metalness = 0, bumpScale = 1, color = 0xffffff, ...rest } = {}) {
  const m = new THREE.MeshStandardMaterial({ map, bumpMap: bump, bumpScale, roughness, metalness, color, ...rest }); m.userData.tileM = tileM; return m;
}

export function plaster(color = 0xe9e4da, { tileM = 3, seed = 3, roughness = 0.92 } = {}) {
  const f = noiseArr(seed, SIZE, 6, 6), g = noiseArr(seed + 9, SIZE, 3, 3);
  const map = memo(`plaster${seed}`, () => paintTex(SIZE, (i, x, y, o) => { const v = 0.93 + (f[i] - 0.5) * 0.12 + (g[i] - 0.5) * 0.1 + (Math.random() - 0.5) * 0.02; o[0] = o[1] = o[2] = v * 255; }));
  const bump = memo(`plasterB${seed}`, () => bumpFrom(f, SIZE, 230, 25));
  return std(map, bump, { tileM, roughness, bumpScale: 0.25, color });
}
export function concrete(color = 0x9a9a96, { tileM = 3, seed = 5, roughness = 0.95 } = {}) {
  const f = noiseArr(seed, SIZE, 6, 5), g = noiseArr(seed + 3, SIZE, 4, 14), r = rng(seed);
  const pits = Array.from({ length: 220 }, () => [r() * SIZE, r() * SIZE, 1.5 + r() * 4]);
  const map = memo(`conc${seed}`, () => { const m = new Float32Array(SIZE * SIZE); for (let i = 0; i < m.length; i++) m[i] = 0.82 + (f[i] - 0.5) * 0.3 + (g[i] - 0.5) * 0.1; for (const [px, py, pr] of pits) for (let dy = -pr; dy <= pr; dy++) for (let dx = -pr; dx <= pr; dx++) if (dx * dx + dy * dy < pr * pr) { const xx = (Math.floor(px + dx) + SIZE) % SIZE, yy = (Math.floor(py + dy) + SIZE) % SIZE; m[yy * SIZE + xx] -= 0.16; } return paintTex(SIZE, (i, x, y, o) => { const v = m[i] + (Math.random() - 0.5) * 0.04; o[0] = o[1] = o[2] = v * 255; }); });
  return std(map, memo(`concB${seed}`, () => bumpFrom(f, SIZE, 255, 60)), { tileM, roughness, bumpScale: 0.6, color });
}
export function brick({ color = 0xa24a35, mortar = 0xb9b2a4, tileM = 1.2, seed = 7, rows = 16, cols = 6, variation = 0.22, roughness = 0.9 } = {}) {
  const map = memo(`brick${color}/${seed}`, () => {
    const size = SIZE, c = canvasOf(size), ctx = c.getContext('2d'), r = rng(seed), base = new THREE.Color(color).convertLinearToSRGB(), mo = new THREE.Color(mortar).convertLinearToSRGB();
    ctx.fillStyle = `rgb(${mo.r * 255},${mo.g * 255},${mo.b * 255})`; ctx.fillRect(0, 0, size, size);
    const bh = size / rows, bw = size / cols, gap = bh * 0.13;
    for (let j = 0; j < rows; j++) for (let i = -1; i <= cols; i++) {
      const x = i * bw + (j % 2) * bw * 0.5, y = j * bh, k = (r() - 0.5) * variation;
      ctx.fillStyle = `rgb(${clamp((base.r + k) * 255)},${clamp((base.g + k * 0.8) * 255)},${clamp((base.b + k * 0.7) * 255)})`; ctx.fillRect(x + gap / 2, y + gap / 2, bw - gap, bh - gap);
      for (let s = 0; s < 14; s++) { ctx.fillStyle = `rgba(${r() > 0.5 ? 255 : 0},${r() > 0.5 ? 200 : 0},0,0.05)`; ctx.fillRect(x + r() * bw, y + r() * bh, 2 + r() * 4, 2 + r() * 3); }
    }
    const f = noiseArr(seed, size, 5, 4), img = ctx.getImageData(0, 0, size, size), d = img.data;
    for (let i = 0; i < size * size; i++) { const n = 1 + (f[i] - 0.5) * 0.3; d[i * 4] = clamp(d[i * 4] * n); d[i * 4 + 1] = clamp(d[i * 4 + 1] * n); d[i * 4 + 2] = clamp(d[i * 4 + 2] * n); }
    ctx.putImageData(img, 0, 0); return tex(c);
  });
  const bump = memo(`brickB${rows}/${cols}`, () => { const size = SIZE, c = canvasOf(size), ctx = c.getContext('2d'); ctx.fillStyle = '#202020'; ctx.fillRect(0, 0, size, size); const bh = size / rows, bw = size / cols, gap = bh * 0.13; ctx.fillStyle = '#fff'; for (let j = 0; j < rows; j++) for (let i = -1; i <= cols; i++) ctx.fillRect(i * bw + (j % 2) * bw * 0.5 + gap / 2, j * bh + gap / 2, bw - gap, bh - gap); return tex(c, false); });
  return std(map, bump, { tileM, roughness, bumpScale: 1.6 });
}
export function stone({ color = 0x8a847c, tileM = 2.4, seed = 11, rows = 14, roughness = 0.88 } = {}) {
  const map = memo(`stone${seed}`, () => {
    const size = SIZE, c = canvasOf(size), ctx = c.getContext('2d'), r = rng(seed), rowH = size / rows, gap = 4; ctx.fillStyle = '#4d4a46'; ctx.fillRect(0, 0, size, size);
    for (let j = 0; j < rows; j++) { let x = -r() * 100; const y = j * rowH; while (x < size) { const w = 80 + r() * 170, k = 0.78 + (r() - 0.5) * 0.3; ctx.fillStyle = `rgb(${k * 255},${k * 252},${k * 246})`; ctx.fillRect(x + gap, y + gap, w - gap, rowH - gap); x += w; } }
    const f = noiseArr(seed, size, 6, 6), img = ctx.getImageData(0, 0, size, size), d = img.data;
    for (let i = 0; i < size * size; i++) { const n = 1 + (f[i] - 0.5) * 0.4 + (Math.random() - 0.5) * 0.08; d[i * 4] = clamp(d[i * 4] * n); d[i * 4 + 1] = clamp(d[i * 4 + 1] * n); d[i * 4 + 2] = clamp(d[i * 4 + 2] * n); }
    ctx.putImageData(img, 0, 0); return tex(c);
  });
  const bump = memo(`stoneB${seed}`, () => { const size = SIZE, c = canvasOf(size), ctx = c.getContext('2d'), r = rng(seed), rowH = size / rows; ctx.fillStyle = '#101010'; ctx.fillRect(0, 0, size, size); for (let j = 0; j < rows; j++) { let x = -r() * 100; const y = j * rowH; while (x < size) { const w = 80 + r() * 170; r(); const k = 150 + r() * 90; ctx.fillStyle = `rgb(${k},${k},${k})`; ctx.fillRect(x + 4, y + 4, w - 4, rowH - 4); x += w; } } return tex(c, false); });
  return std(map, bump, { tileM, roughness, bumpScale: 2.2, color });
}
export function wood({ color = 0x9b6b3f, tileM = 1.0, seed = 21, planks = 6, roughness = 0.55, gap = true } = {}) {
  const f = noiseArr(seed, SIZE, 4, 3);
  const map = memo(`wood${seed}/${planks}/${gap}`, () => paintTex(SIZE, (i, x, y, o) => { const u = x / SIZE, v = y / SIZE, pi = Math.floor(u * planks), pu = u * planks - pi, grain = Math.sin((u * 260 + f[i] * 14 + pi * 3.1)) * 0.5 + 0.5, streak = f[((y * 0.5 | 0) * SIZE + ((x * 8) % SIZE))] ; const pk = ((pi * 2654435761 >>> 0) % 100) / 100 - 0.5; let n = 0.85 + (grain - 0.5) * 0.16 + (streak - 0.5) * 0.25 + pk * 0.18 + (Math.random() - 0.5) * 0.02; if (gap && (pu < 0.012 || pu > 0.988)) n *= 0.3; o[0] = o[1] = o[2] = n * 255; void v; }));
  const bump = memo(`woodB${seed}/${planks}/${gap}`, () => paintTex(SIZE, (i, x, y, o) => { const pu = (x / SIZE * planks) % 1; const k = gap && (pu < 0.012 || pu > 0.988) ? 0 : 150 + (Math.sin(x * 2.4) * 0.5 + 0.5) * 80; o[0] = o[1] = o[2] = k; }, false));
  return std(map, bump, { tileM, roughness, bumpScale: 0.5, color });
}
export function tiles({ color = 0xd9d6cf, grout = 0x8f8b84, tileM = 2.4, n = 4, seed = 31, roughness = 0.22, marble = true, variation = 0.05 } = {}) {
  const f = noiseArr(seed, SIZE, 6, 5), vein = noiseArr(seed + 77, SIZE, 4, 3), r = rng(seed), cell = SIZE / n, jit = Array.from({ length: n * n }, () => (r() - 0.5) * variation * 2);
  const gk = new THREE.Color(grout).convertLinearToSRGB().r / (new THREE.Color(color).convertLinearToSRGB().r || 1);
  const map = memo(`tiles${seed}/${n}/${marble}/${variation}/${Math.round(gk * 100)}`, () => paintTex(SIZE, (i, x, y, o) => { const cx = (x % cell) / cell, cy = (y % cell) / cell, edge = Math.min(cx, cy, 1 - cx, 1 - cy) * cell; if (edge < 3) { o[0] = o[1] = o[2] = 255 * Math.min(1, gk); return; } let v = 0.95 + (f[i] - 0.5) * 0.05 + jit[Math.floor(y / cell) * n + Math.floor(x / cell)]; if (marble) { const m = Math.abs(Math.sin((x / SIZE * 6 + vein[i] * 7) * 3.1)); v -= Math.pow(1 - m, 14) * 0.09; } o[0] = o[1] = o[2] = v * 255; }));
  const bump = memo(`tilesB${n}`, () => paintTex(SIZE, (i, x, y, o) => { const cx = (x % cell) / cell, cy = (y % cell) / cell; o[0] = o[1] = o[2] = Math.min(cx, cy, 1 - cx, 1 - cy) * cell < 2.5 ? 0 : 200; }, false));
  return std(map, bump, { tileM, roughness, bumpScale: 0.3, color });
}
export function paving({ color = 0xb4b0a6, tileM = 2, n = 8, seed = 41, roughness = 0.85 } = {}) { return tiles({ color, grout: 0x55524c, tileM, n, seed, roughness, marble: false, variation: 0.07 }); }
export function asphalt({ tileM = 6, seed = 51, wet = false } = {}) {
  const f = noiseArr(seed, SIZE, 6, 8);
  const map = memo('asphalt', () => paintTex(SIZE, (i, x, y, o) => { const k = 0.27 + (f[i] - 0.5) * 0.05 + (Math.random() - 0.5) * 0.1 + (Math.random() > 0.996 ? 0.2 : 0); o[0] = o[1] = o[2] = k * 255; }));
  return std(map, memo('asphaltB', () => bumpFrom(f, SIZE, 255, 90)), { tileM, roughness: wet ? 0.22 : 0.82, bumpScale: 0.9, envMapIntensity: wet ? 1.6 : 1 });
}
export function grass({ color = 0x4f7a32, tileM = 4, seed = 61 } = {}) {
  const f = noiseArr(seed, SIZE, 6, 8), g = noiseArr(seed + 5, SIZE, 5, 40), base = new THREE.Color(color).convertLinearToSRGB();
  const map = memo(`grass${color}`, () => paintTex(SIZE, (i, x, y, o) => { const n = (f[i] - 0.5) * 0.3 + (g[i] - 0.5) * 0.3 + (Math.random() - 0.5) * 0.14; o[0] = base.r * 255 * (1 + n * 1.2); o[1] = base.g * 255 * (1 + n); o[2] = base.b * 255 * (1 + n * 0.5); }));
  return std(map, memo('grassB', () => bumpFrom(g, SIZE, 255, 120)), { tileM, roughness: 1, bumpScale: 1.6 });
}
export function foliage({ color = 0x2f5a27, tileM = 1, seed = 71 } = {}) {
  const f = noiseArr(seed, 512, 6, 10);
  const map = memo('foliage', () => paintTex(512, (i, x, y, o) => { const n = 0.8 + (f[i] - 0.5) * 0.7 + (Math.random() - 0.5) * 0.3; o[0] = o[1] = o[2] = n * 255; }));
  return std(map, null, { tileM, roughness: 0.85, color });
}
export function solid(color, { roughness = 0.6, metalness = 0, tileM = 1, ...rest } = {}) { const m = new THREE.MeshStandardMaterial({ color, roughness, metalness, ...rest }); m.userData.tileM = tileM; return m; }
export function metal(color = 0x2b2f36, { roughness = 0.38, tileM = 1 } = {}) { return solid(color, { roughness, metalness: 0.9, tileM }); }
export function glass({ tint = 0x0d1a26, roughness = 0.02, env = 3.5 } = {}) { const m = new THREE.MeshPhysicalMaterial({ color: tint, roughness, metalness: 0.0, clearcoat: 1, clearcoatRoughness: 0.02, envMapIntensity: env, reflectivity: 0.9, ior: 1.52 }); m.userData.tileM = 1; return m; }
export function emissive(color = 0xffd9a0, intensity = 4) { const m = new THREE.MeshStandardMaterial({ color: 0x111111, emissive: color, emissiveIntensity: intensity, roughness: 0.6 }); m.userData.tileM = 1; return m; }
