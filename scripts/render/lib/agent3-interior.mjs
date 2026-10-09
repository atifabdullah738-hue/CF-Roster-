// Interior visualisation helpers (agent3). Units: METRES. +X right, +Y up, +Z towards camera.
// Room shell (floor/walls/ceiling tray + cove, windows, doors, skirting), fake-GI room environment,
// procedural materials (marble, walnut, fabrics, rugs, art...) and furniture / fixture builders.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { mergeVertices, mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
import { T, boxAt } from './arch.mjs';
import { rng, noiseArr } from './textures.mjs';

export { THREE, T, boxAt, rng };
const TAU = Math.PI * 2;
const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
const sstep = (a, b, x) => { const t = clamp01((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const lerp = (a, b, t) => a + (b - a) * t;
const cache = new Map();
const once = (k, f) => { if (!cache.has(k)) cache.set(k, f()); return cache.get(k); };

/* ------------------------------------------------------------------ canvas helpers */
function mkCanvas(w, h = w) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
function ctex(c, { srgb = true, aniso = 8, repeat = true } = {}) {
  const t = new THREE.CanvasTexture(c);
  if (repeat) t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace; t.anisotropy = aniso; return t;
}
/** paint(w,h,(x,y,out)=>{out[0..2]=0..255}) */
function paint(w, h, fn, srgb = true, opts = {}) {
  const c = mkCanvas(w, h), ctx = c.getContext('2d'), img = ctx.createImageData(w, h), d = img.data, o = [0, 0, 0];
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    fn(x, y, o); const k = (y * w + x) * 4;
    d[k] = o[0] < 0 ? 0 : o[0] > 255 ? 255 : o[0]; d[k + 1] = o[1] < 0 ? 0 : o[1] > 255 ? 255 : o[1]; d[k + 2] = o[2] < 0 ? 0 : o[2] > 255 ? 255 : o[2]; d[k + 3] = 255;
  }
  ctx.putImageData(img, 0, 0); return ctex(c, { srgb, ...opts });
}
const rgb = (c) => { const k = new THREE.Color(c); return [k.r * 255, k.g * 255, k.b * 255]; }; // linear->bytes (approx; used only for relative tints)
const srgbBytes = (hex) => [(hex >> 16) & 255, (hex >> 8) & 255, hex & 255];
void rgb;

/* ------------------------------------------------------------------ materials */
/** Polished marble / stone slabs. `slab` = metres per slab, n x n distinct slabs per texture tile. */
export function marbleMat({ base = 0xeeeae2, vein = 0x8a857c, veinAlt = null, slab = 0.8, n = 3, seed = 3, rough = 0.12, contrast = 1, freq = 1, grout = 0x9b968c, clearcoat = 0.7, cloud = 0.06, groutPx = 1.4, veinPow = 20 } = {}) {
  const key = `marble|${base}|${vein}|${veinAlt}|${n}|${seed}|${freq}|${contrast}|${cloud}|${veinPow}`;
  const map = once(key, () => {
    const S = 1024, cell = S / n, f1 = noiseArr(seed, S, 6, 3), f2 = noiseArr(seed + 11, S, 5, 4), f3 = noiseArr(seed + 23, S, 4, 3), f4 = noiseArr(seed + 37, S, 3, 6);
    const r = rng(seed * 7 + 1), b = srgbBytes(base), v = srgbBytes(vein), va = srgbBytes(veinAlt ?? vein), gr = srgbBytes(grout);
    const slabs = Array.from({ length: n * n }, () => ({ ox: (r() * S) | 0, oy: (r() * S) | 0, th: r() * Math.PI, th2: r() * Math.PI, tone: (r() - 0.5) * 0.05, fr: (2.0 + r() * 1.6) * freq, fr2: (5 + r() * 3) * freq }));
    return paint(S, S, (x, y, o) => {
      const si = Math.floor(x / cell), sj = Math.floor(y / cell), s = slabs[sj * n + si], lx = x - si * cell, ly = y - sj * cell;
      const edge = Math.min(lx, ly, cell - 1 - lx, cell - 1 - ly);
      if (edge < groutPx) { o[0] = gr[0]; o[1] = gr[1]; o[2] = gr[2]; return; }
      const i = ((y + s.oy) % S) * S + ((x + s.ox) % S);
      const w1 = f1[i] - 0.5, w2 = f2[i] - 0.5, c = Math.cos(s.th), sn = Math.sin(s.th);
      const q = ((lx * c + ly * sn) / cell) * s.fr + w1 * 5.0 + w2 * 2.0;
      const l1 = Math.pow(1 - Math.abs(Math.sin(q * Math.PI)), veinPow) * sstep(0.35, 0.7, f3[i]);
      const c2 = Math.cos(s.th2), s2 = Math.sin(s.th2);
      const q2 = ((lx * c2 + ly * s2) / cell) * s.fr2 + w1 * 7.0 + w2 * 3.0;
      const l2 = Math.pow(1 - Math.abs(Math.sin(q2 * Math.PI)), veinPow * 1.4) * sstep(0.45, 0.8, f4[i]) * 0.55;
      const halo = Math.pow(1 - Math.abs(Math.sin(q * Math.PI)), 3.5) * 0.10 * sstep(0.3, 0.65, f3[i]);
      const a = clamp01((l1 * 0.85 + l2) * contrast);
      const t = 1 + s.tone + (f3[i] - 0.5) * cloud + (f2[i] - 0.5) * cloud * 0.8;
      let R = b[0] * t, G = b[1] * t, B = b[2] * t;
      R = lerp(R, v[0], halo * contrast); G = lerp(G, v[1], halo * contrast); B = lerp(B, v[2], halo * contrast);
      const mixAlt = sstep(0.4, 0.6, f4[i]);
      const vr = lerp(v[0], va[0], mixAlt), vg = lerp(v[1], va[1], mixAlt), vb = lerp(v[2], va[2], mixAlt);
      o[0] = lerp(R, vr, a); o[1] = lerp(G, vg, a); o[2] = lerp(B, vb, a);
    });
  });
  const m = new THREE.MeshPhysicalMaterial({ map, roughness: rough, metalness: 0, clearcoat, clearcoatRoughness: 0.08, color: 0xffffff });
  m.userData.tileM = slab * n; return m;
}

/** Wood veneer / planks. grain runs along texture-V (vertical on walls, along Z on floors). */
export function woodMat({ kind = 'walnut', tileM = 1.2, planks = 4, seed = 21, rough = 0.42, clearcoat = 0.25, horizontal = false, gap = true, tone = 1 } = {}) {
  const pal = {
    walnut: [[58, 36, 24], [118, 78, 50]], dark: [[34, 24, 18], [76, 54, 38]], oak: [[150, 112, 74], [214, 176, 128]], teak: [[104, 66, 36], [174, 120, 70]], ash: [[176, 150, 118], [226, 208, 178]], smoke: [[62, 50, 42], [112, 94, 80]],
  }[kind] || [[58, 36, 24], [118, 78, 50]];
  const map0 = once(`wood|${kind}|${planks}|${seed}|${gap}`, () => {
    const S = 1024, f = noiseArr(seed, S, 5, 3), g = noiseArr(seed + 5, S, 4, 8), p = noiseArr(seed + 9, S, 3, 3), r = rng(seed);
    const off = Array.from({ length: planks }, () => ({ o: (r() * S) | 0, t: (r() - 0.5) * 0.16, ph: r() * 30 }));
    const [d, l] = pal;
    return paint(S, S, (x, y, o) => {
      const pi = Math.min(planks - 1, Math.floor((x / S) * planks)), pu = (x / S) * planks - pi, pl = off[pi];
      const px = ((x * planks) % S);               // local-plank x stretched to full tile width
      const idx = (((y * 1) % S) * S) + ((px + pl.o) % S);
      const warp = (f[idx] - 0.5) * 22 + (p[((y >> 1) % S) * S + ((px * 3 + pl.o) % S)] - 0.5) * 6;
      const grain = 0.5 + 0.5 * Math.sin(px * 0.19 + warp + pl.ph);
      const fine = 0.5 + 0.5 * Math.sin(px * 1.9 + warp * 3.2);
      const pore = g[((y * 1) % S) * S + (((px * 6) | 0) + pl.o) % S] > 0.64 ? 0.12 : 0;
      let t = 0.42 + 0.34 * grain + 0.10 * fine + (f[idx] - 0.5) * 0.35 + pl.t - pore + (Math.random() - 0.5) * 0.03; t = clamp01(t * tone);
      o[0] = lerp(d[0], l[0], t); o[1] = lerp(d[1], l[1], t); o[2] = lerp(d[2], l[2], t);
      if (gap && (pu < 0.006 || pu > 0.994)) { o[0] *= 0.25; o[1] *= 0.25; o[2] *= 0.25; }
    });
  });
  const bump0 = once(`woodB|${planks}|${seed}|${gap}`, () => {
    const S = 512, f = noiseArr(seed + 1, S, 4, 10), r = rng(seed + 3);
    return paint(S, S, (x, y, o) => { const pu = (x / S) * planks % 1; const k = 150 + (f[(y % S) * S + ((x * 5) % S)] - 0.5) * 120 + Math.sin(x * 2.6 + r() * 0.2) * 10; o[0] = o[1] = o[2] = gap && (pu < 0.012 || pu > 0.988) ? 0 : k; }, false);
  });
  const map = map0.clone(), bump = bump0.clone(); map.needsUpdate = bump.needsUpdate = true;
  if (horizontal) { for (const t of [map, bump]) { t.center.set(0.5, 0.5); t.rotation = Math.PI / 2; } }
  const m = new THREE.MeshPhysicalMaterial({ map, bumpMap: bump, bumpScale: 0.35, roughness: rough, clearcoat, clearcoatRoughness: 0.35, color: 0xffffff });
  m.userData.tileM = tileM; return m;
}

/** Woven / velvet / boucle upholstery. */
export function fabricMat({ color = 0xcfc6b6, kind = 'linen', tileM = 0.4, sheen = 0.6, seed = 4, rough = 0.95 } = {}) {
  const map = once(`fab|${kind}|${seed}`, () => {
    const S = 512, f = noiseArr(seed, S, 5, 6), r = rng(seed), rows = new Float32Array(S), cols = new Float32Array(S);
    for (let i = 0; i < S; i++) { rows[i] = r(); cols[i] = r(); }
    if (kind === 'boucle') {
      const c = mkCanvas(S), ctx = c.getContext('2d'); ctx.fillStyle = '#c9c9c9'; ctx.fillRect(0, 0, S, S);
      for (let i = 0; i < 9000; i++) { const x = r() * S, y = r() * S, a = r() * TAU, k = 150 + r() * 105 | 0; ctx.strokeStyle = `rgba(${k},${k},${k},0.55)`; ctx.lineWidth = 1.6 + r() * 2.2; ctx.beginPath(); ctx.arc(x, y, 2 + r() * 4, a, a + 3.4 + r() * 2); ctx.stroke(); }
      return ctex(c);
    }
    return paint(S, S, (x, y, o) => {
      let v;
      if (kind === 'velvet') v = 0.9 + (f[y * S + x] - 0.5) * 0.12 + (Math.random() - 0.5) * 0.04;
      else { const wv = (Math.sin(x * 1.57) * Math.sin(y * 1.57)) * 0.035; v = 0.88 + (rows[y] - 0.5) * 0.09 + (cols[x] - 0.5) * 0.09 + wv + (f[y * S + x] - 0.5) * 0.08 + (Math.random() - 0.5) * 0.02; }
      o[0] = o[1] = o[2] = v * 255;
    });
  });
  const bump = once(`fabB|${kind}|${seed}`, () => {
    const S = 512, c = mkCanvas(S), ctx = c.getContext('2d'), r = rng(seed + 2);
    if (kind === 'boucle') { ctx.fillStyle = '#777'; ctx.fillRect(0, 0, S, S); for (let i = 0; i < 9000; i++) { const x = r() * S, y = r() * S, a = r() * TAU; ctx.strokeStyle = `rgba(255,255,255,0.5)`; ctx.lineWidth = 1.8 + r() * 2; ctx.beginPath(); ctx.arc(x, y, 2 + r() * 4, a, a + 3.4 + r() * 2); ctx.stroke(); } return ctex(c, { srgb: false }); }
    return paint(S, S, (x, y, o) => { o[0] = o[1] = o[2] = kind === 'velvet' ? 128 + (Math.random() - 0.5) * 30 : 128 + Math.sin(x * 1.57) * Math.sin(y * 1.57) * 60 + (Math.random() - 0.5) * 22; }, false);
  });
  const m = new THREE.MeshPhysicalMaterial({ color, map, bumpMap: bump, bumpScale: kind === 'boucle' ? 0.7 : 0.45, roughness: kind === 'velvet' ? 0.82 : rough, sheen, sheenRoughness: 0.55, sheenColor: new THREE.Color(color).lerp(new THREE.Color(0xffffff), 0.55) });
  m.userData.tileM = tileM; return m;
}

export function leatherMat({ color = 0x6b4630, tileM = 0.5, seed = 8, rough = 0.5 } = {}) {
  const bump = once(`leatherB|${seed}`, () => {
    const S = 512, N = 26, r = rng(seed), pts = Array.from({ length: N * N }, (_, k) => [(k % N + 0.15 + r() * 0.7) / N * S, (Math.floor(k / N) + 0.15 + r() * 0.7) / N * S]);
    return paint(S, S, (x, y, o) => {
      const ci = Math.floor(x / S * N), cj = Math.floor(y / S * N); let d1 = 1e9, d2 = 1e9;
      for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) { const ii = (ci + di + N) % N, jj = (cj + dj + N) % N, p = pts[jj * N + ii]; let dx = Math.abs(p[0] - x), dy = Math.abs(p[1] - y); if (dx > S / 2) dx = S - dx; if (dy > S / 2) dy = S - dy; const dd = Math.hypot(dx, dy); if (dd < d1) { d2 = d1; d1 = dd; } else if (dd < d2) d2 = dd; }
      const e = clamp01((d2 - d1) / 7); o[0] = o[1] = o[2] = 70 + e * 185;
    }, false);
  });
  const m = new THREE.MeshPhysicalMaterial({ color, bumpMap: bump, bumpScale: 0.6, roughness: rough, clearcoat: 0.25, clearcoatRoughness: 0.4, sheen: 0.2 });
  m.userData.tileM = tileM; return m;
}

/** Painted wall (smooth plaster, very low bump). */
export function paintMat(color, { tileM = 3, seed = 3, rough = 0.93, bump = 0.04 } = {}) { const m = T.plaster(color, { tileM, seed, roughness: rough }); m.bumpScale = bump; return m; }
export const brassMat = (c = 0xc9a24d, rough = 0.26) => T.metal(c, { roughness: rough });
export const blackMetal = (c = 0x16181b, rough = 0.42) => T.metal(c, { roughness: rough });
export const steelMat = (c = 0xb9bdc2, rough = 0.32) => T.metal(c, { roughness: rough });
export function ceramicMat(color = 0xf4f2ee, rough = 0.12) { const m = new THREE.MeshPhysicalMaterial({ color, roughness: rough, clearcoat: 0.8, clearcoatRoughness: 0.05 }); m.userData.tileM = 1; return m; }
export function glassMat({ tint = 0xdbe9ee, opacity = 0.12, rough = 0.02 } = {}) { const m = new THREE.MeshPhysicalMaterial({ color: tint, roughness: rough, metalness: 0, transparent: true, opacity, clearcoat: 1, clearcoatRoughness: 0.02, depthWrite: false, side: THREE.DoubleSide }); m.userData.tileM = 1; return m; }
export function mirrorMat(tint = 0xc9d3d8) { const m = new THREE.MeshStandardMaterial({ color: tint, roughness: 0.04, metalness: 1 }); m.userData.tileM = 1; return m; }
export function lightMat(color = 0xffd9a0, intensity = 4) { return T.emissive(color, intensity); }

/** Subway / brick-bond / stack tiles. */
export function subwayMat({ color = 0xf0eee9, grout = 0xb8b3a8, w = 0.3, h = 0.1, cols = 2, rows = 6, bond = 0.5, seed = 6, rough = 0.1, tileM = null, jitter = 0.03 } = {}) {
  const key = `subway|${color}|${grout}|${cols}|${rows}|${bond}|${seed}|${jitter}`;
  const S = 1024, bw = S / cols, bh = S / rows, gp = 3;
  const map = once(key, () => {
    const r = rng(seed), gcol = srgbBytes(grout), bc = srgbBytes(color), jit = []; for (let i = 0; i < (rows + 1) * (cols + 2); i++) jit.push((r() - 0.5) * jitter * 2);
    return paint(S, S, (x, y, o) => {
      const j = Math.floor(y / bh), xo = (j % 2) * bw * bond, xx = (x + S - xo) % S, i = Math.floor(xx / bw);
      const lx = xx - i * bw, ly = y - j * bh, e = Math.min(lx, ly, bw - lx, bh - ly);
      if (e < gp) { o[0] = gcol[0]; o[1] = gcol[1]; o[2] = gcol[2]; return; }
      const k = 1 + jit[j * (cols + 2) + i] + sstep(gp, gp + 7, e) * 0 - (1 - sstep(gp, gp + 9, e)) * 0.05;
      o[0] = bc[0] * k; o[1] = bc[1] * k; o[2] = bc[2] * k;
    });
  });
  const bump = once(`subwayB|${cols}|${rows}|${bond}`, () => paint(S, S, (x, y, o) => {
    const j = Math.floor(y / bh), xo = (j % 2) * bw * bond, xx = (x + S - xo) % S, i = Math.floor(xx / bw), lx = xx - i * bw, ly = y - j * bh, e = Math.min(lx, ly, bw - lx, bh - ly);
    o[0] = o[1] = o[2] = e < gp ? 0 : 130 + sstep(gp, gp + 8, e) * 120;
  }, false));
  const m = new THREE.MeshPhysicalMaterial({ map, bumpMap: bump, bumpScale: 0.8, roughness: rough, clearcoat: 0.5, clearcoatRoughness: 0.1, color: 0xffffff });
  m.userData.tileM = tileM ?? Math.max(w * cols, h * rows); return m;
}
/** Square large-format porcelain with fine grout, subtle cloudy variation. */
export function porcelainMat({ color = 0xd9d5cc, grout = 0xa8a398, slab = 0.6, n = 3, seed = 9, rough = 0.22, cloud = 0.06, matte = false } = {}) {
  const m = marbleMat({ base: color, vein: 0x9b968c, slab, n, seed, rough: matte ? 0.55 : rough, contrast: 0.12, cloud, grout, clearcoat: matte ? 0 : 0.4, groutPx: 1.8 });
  return m;
}

/** Terrazzo / speckled stone. */
export function speckleMat({ base = 0xe9e4da, chips = [0x8c8478, 0xc9bfa9, 0x4b463f, 0xb7a88d], tileM = 1.2, seed = 12, rough = 0.2 } = {}) {
  const map = once(`speckle|${base}|${seed}`, () => {
    const S = 1024, c = mkCanvas(S), ctx = c.getContext('2d'), r = rng(seed), b = srgbBytes(base);
    ctx.fillStyle = `rgb(${b[0]},${b[1]},${b[2]})`; ctx.fillRect(0, 0, S, S);
    for (let i = 0; i < 1600; i++) { const x = r() * S, y = r() * S, rr = 1.5 + r() * r() * 9, k = chips[(r() * chips.length) | 0], cc = srgbBytes(k); ctx.fillStyle = `rgb(${cc[0]},${cc[1]},${cc[2]})`; ctx.beginPath(); ctx.ellipse(x, y, rr, rr * (0.55 + r() * 0.4), r() * TAU, 0, TAU); ctx.fill(); }
    return ctex(c);
  });
  const m = new THREE.MeshPhysicalMaterial({ map, roughness: rough, clearcoat: 0.5, clearcoatRoughness: 0.15 }); m.userData.tileM = tileM; return m;
}

/* ------------------------------------------------------------------ rugs / art (object-UV textures) */
export function rugMat({ kind = 'persian', w = 3, d = 2, pal = {}, seed = 5, pile = true } = {}) {
  const P = Object.assign({ field: 0x1f2c47, red: 0x9b3b2c, ivory: 0xe6dcc4, gold: 0xc6a05a, teal: 0x2f6c70, dark: 0x141b2d }, pal);
  const map = once(`rug|${kind}|${w}|${d}|${seed}|${JSON.stringify(pal)}`, () => {
    const pxm = 560, W = Math.round(w * pxm), H = Math.round(d * pxm), c = mkCanvas(W, H), x = c.getContext('2d'), r = rng(seed);
    const hex = (h) => '#' + h.toString(16).padStart(6, '0');
    x.fillStyle = hex(P.field); x.fillRect(0, 0, W, H);
    if (kind === 'persian') {
      const bw = 0.34 * pxm, ln = (m, col, lw) => { x.strokeStyle = hex(col); x.lineWidth = lw; x.strokeRect(m, m, W - 2 * m, H - 2 * m); };
      // border band
      x.fillStyle = hex(P.red); x.fillRect(0.045 * pxm, 0.045 * pxm, W - 0.09 * pxm, H - 0.09 * pxm);
      x.fillStyle = hex(P.field); x.fillRect(bw, bw, W - 2 * bw, H - 2 * bw);
      ln(0.03 * pxm, P.ivory, 5); ln(0.06 * pxm, P.gold, 3); ln(bw, P.ivory, 4); ln(bw - 0.03 * pxm, P.gold, 2);
      // border motifs
      const motif = (cx, cy, s, rot) => { x.save(); x.translate(cx, cy); x.rotate(rot); x.fillStyle = hex(P.ivory); x.beginPath(); x.moveTo(0, -s); x.lineTo(s * 0.7, 0); x.lineTo(0, s); x.lineTo(-s * 0.7, 0); x.closePath(); x.fill(); x.fillStyle = hex(P.field); x.beginPath(); x.arc(0, 0, s * 0.32, 0, TAU); x.fill(); x.fillStyle = hex(P.gold); x.beginPath(); x.arc(0, 0, s * 0.14, 0, TAU); x.fill(); x.restore(); };
      const stepM = 0.2 * pxm, mid = (bw + 0.06 * pxm) / 2 + 0.01 * pxm;
      for (let px = bw; px < W - bw; px += stepM) { motif(px + stepM / 2, mid, 0.075 * pxm, 0); motif(px + stepM / 2, H - mid, 0.075 * pxm, 0); }
      for (let py = bw; py < H - bw; py += stepM) { motif(mid, py + stepM / 2, 0.075 * pxm, 0); motif(W - mid, py + stepM / 2, 0.075 * pxm, 0); }
      // field lattice
      x.strokeStyle = hex(P.teal); x.lineWidth = 2; const gx = 0.26 * pxm;
      for (let i = -H; i < W + H; i += gx) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i + H, H); x.stroke(); x.beginPath(); x.moveTo(i, H); x.lineTo(i + H, 0); x.stroke(); }
      x.fillStyle = hex(P.field); x.globalAlpha = 0.0; x.globalAlpha = 1;
      for (let py = bw + gx / 2; py < H - bw; py += gx) for (let px = bw + gx / 2; px < W - bw; px += gx) { x.fillStyle = hex(r() > 0.5 ? P.red : P.gold); x.globalAlpha = 0.85; x.beginPath(); x.arc(px, py, 0.016 * pxm, 0, TAU); x.fill(); }
      x.globalAlpha = 1;
      // medallion
      const cx = W / 2, cy = H / 2, R = Math.min(W, H) * 0.235;
      const star = (rad, n, inner, col, lw, fill) => { x.beginPath(); for (let i = 0; i < n * 2; i++) { const a = (i / (n * 2)) * TAU - Math.PI / 2, rr = i % 2 ? rad * inner : rad; x[i ? 'lineTo' : 'moveTo'](cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); } x.closePath(); if (fill) { x.fillStyle = hex(fill); x.fill(); } if (col) { x.strokeStyle = hex(col); x.lineWidth = lw; x.stroke(); } };
      star(R * 1.25, 12, 0.74, P.gold, 4, P.dark); star(R * 1.05, 12, 0.72, P.ivory, 3, P.red); star(R * 0.82, 8, 0.66, P.gold, 3, P.field); star(R * 0.58, 8, 0.6, P.ivory, 2, P.teal); star(R * 0.34, 8, 0.55, P.gold, 2, P.red);
      x.fillStyle = hex(P.ivory); x.beginPath(); x.arc(cx, cy, R * 0.12, 0, TAU); x.fill();
      // pendants
      for (const s of [-1, 1]) { x.save(); x.translate(cx + s * W * 0.275, cy); x.fillStyle = hex(P.red); x.strokeStyle = hex(P.gold); x.lineWidth = 3; x.beginPath(); x.moveTo(0, -R * 0.55); x.quadraticCurveTo(s * R * 0.5, 0, 0, R * 0.55); x.quadraticCurveTo(-s * R * 0.5, 0, 0, -R * 0.55); x.fill(); x.stroke(); x.fillStyle = hex(P.ivory); x.beginPath(); x.arc(0, 0, R * 0.12, 0, TAU); x.fill(); x.restore(); }
    } else if (kind === 'geo') {
      // modern tonal rug: soft blocks + fine linework
      x.fillStyle = hex(P.field); x.fillRect(0, 0, W, H);
      for (let i = 0; i < 9; i++) { x.fillStyle = hex([P.red, P.ivory, P.gold, P.teal][i % 4]); x.globalAlpha = 0.5; x.beginPath(); x.ellipse(r() * W, r() * H, 0.35 * pxm + r() * 0.5 * pxm, 0.25 * pxm + r() * 0.4 * pxm, r() * 3, 0, TAU); x.fill(); }
      x.globalAlpha = 1; x.strokeStyle = hex(P.ivory); x.lineWidth = 3;
      for (let i = 0; i < 34; i++) { x.globalAlpha = 0.25 + r() * 0.3; x.beginPath(); const y0 = r() * H; x.moveTo(0, y0); x.bezierCurveTo(W * 0.3, y0 + (r() - 0.5) * 200, W * 0.6, y0 + (r() - 0.5) * 200, W, y0 + (r() - 0.5) * 120); x.stroke(); }
      x.globalAlpha = 1; x.strokeStyle = hex(P.gold); x.lineWidth = 6; x.strokeRect(0.12 * pxm, 0.12 * pxm, W - 0.24 * pxm, H - 0.24 * pxm);
    } else if (kind === 'stripes') {
      x.fillStyle = hex(P.field); x.fillRect(0, 0, W, H); x.fillStyle = hex(P.ivory);
      for (let px = 0; px < W; px += 0.17 * pxm) { x.globalAlpha = 0.15 + r() * 0.1; x.fillRect(px, 0, 0.06 * pxm, H); } x.globalAlpha = 1;
      x.strokeStyle = hex(P.red); x.lineWidth = 8; x.strokeRect(0.16 * pxm, 0.16 * pxm, W - 0.32 * pxm, H - 0.32 * pxm);
    }
    // wool pile + wear
    const id = x.getImageData(0, 0, W, H), dd = id.data, fz = noiseArr(seed + 3, 512, 5, 6);
    for (let yy = 0; yy < H; yy++) for (let xx = 0; xx < W; xx++) {
      const k = (yy * W + xx) * 4, wear = 0.9 + (fz[((yy * 512 / H) | 0) * 512 + ((xx * 512 / W) | 0)] - 0.5) * 0.28, nz = wear + (Math.random() - 0.5) * 0.13 + (Math.sin(yy * 1.7) * 0.015);
      dd[k] = dd[k] * nz; dd[k + 1] = dd[k + 1] * nz; dd[k + 2] = dd[k + 2] * nz;
    }
    x.putImageData(id, 0, 0);
    return ctex(c, { repeat: false });
  });
  const bump = once('rugBump', () => paint(256, 256, (xx, yy, o) => { o[0] = o[1] = o[2] = 110 + Math.random() * 90; }, false));
  const bt = bump.clone(); bt.repeat.set(w * 9, d * 9); bt.needsUpdate = true;
  const m = new THREE.MeshStandardMaterial({ map, bumpMap: pile ? bt : null, bumpScale: 0.6, roughness: 1 }); m.userData.tileM = 1; return m;
}

export function artMat({ kind = 'abstract', pal = [0xe9dfcf, 0xb5543c, 0x2b4a57, 0xc9a24d, 0x1c1c1e], seed = 3, aspect = 0.75 } = {}) {
  const map = once(`art|${kind}|${seed}|${pal.join(',')}`, () => {
    const W = 768, H = Math.round(W / aspect), c = mkCanvas(W, H), x = c.getContext('2d'), r = rng(seed);
    const hex = (h) => '#' + h.toString(16).padStart(6, '0');
    x.fillStyle = hex(pal[0]); x.fillRect(0, 0, W, H);
    if (kind === 'abstract') {
      x.filter = 'blur(2px)';
      for (let i = 0; i < 7; i++) { x.fillStyle = hex(pal[1 + (i % (pal.length - 1))]); x.globalAlpha = 0.75; const w = W * (0.25 + r() * 0.5), h = H * (0.15 + r() * 0.35), px = r() * (W - w), py = r() * (H - h); x.beginPath(); if (i % 2) x.ellipse(px + w / 2, py + h / 2, w / 2, h / 2, r(), 0, TAU); else x.roundRect(px, py, w, h, 18); x.fill(); }
      x.filter = 'none'; x.globalAlpha = 1; x.strokeStyle = hex(pal[3]); x.lineWidth = 4;
      for (let i = 0; i < 5; i++) { x.beginPath(); x.moveTo(r() * W, r() * H); x.bezierCurveTo(r() * W, r() * H, r() * W, r() * H, r() * W, r() * H); x.stroke(); }
    } else if (kind === 'arches') {
      const n = 3; for (let i = 0; i < n; i++) { const w = W * 0.26, px = W * (0.12 + i * 0.29), h = H * (0.35 + 0.1 * ((i + 1) % 3)); x.fillStyle = hex(pal[1 + i % (pal.length - 1)]); x.beginPath(); x.moveTo(px, H * 0.82); x.lineTo(px, H * 0.82 - h + w / 2); x.arc(px + w / 2, H * 0.82 - h + w / 2, w / 2, Math.PI, 0); x.lineTo(px + w, H * 0.82); x.closePath(); x.fill(); }
      x.fillStyle = hex(pal[3]); x.beginPath(); x.arc(W * 0.7, H * 0.2, W * 0.07, 0, TAU); x.fill();
    } else if (kind === 'landscape') {
      const g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, hex(pal[0])); g.addColorStop(0.6, hex(pal[3])); g.addColorStop(1, hex(pal[1])); x.fillStyle = g; x.fillRect(0, 0, W, H);
      for (let i = 0; i < 4; i++) { x.fillStyle = hex(pal[2 + (i % 2) * 2]); x.globalAlpha = 0.35 + i * 0.18; x.beginPath(); x.moveTo(0, H * (0.55 + i * 0.1)); for (let s = 0; s <= 8; s++) x.lineTo(s / 8 * W, H * (0.5 + i * 0.1) - r() * H * 0.1); x.lineTo(W, H); x.lineTo(0, H); x.closePath(); x.fill(); } x.globalAlpha = 1;
    } else if (kind === 'botanical') {
      x.strokeStyle = hex(pal[4]); x.fillStyle = hex(pal[2]); x.lineWidth = 3;
      for (let k = 0; k < 3; k++) { const bx = W * (0.25 + k * 0.25); x.beginPath(); x.moveTo(bx, H); x.bezierCurveTo(bx - 30, H * 0.6, bx + 40, H * 0.35, bx + (k - 1) * 40, H * 0.12); x.stroke(); for (let i = 0; i < 9; i++) { const t = i / 9, yy = H * (0.95 - t * 0.8), s = i % 2 ? 1 : -1; x.save(); x.translate(bx + s * 6 + (k - 1) * 40 * t, yy); x.rotate(s * 0.9 - 0.3); x.globalAlpha = 0.85; x.beginPath(); x.ellipse(s * 38, 0, 40, 13, 0, 0, TAU); x.fill(); x.restore(); } }
    }
    x.globalAlpha = 1;
    const id = x.getImageData(0, 0, W, H), dd = id.data;
    for (let yy = 0; yy < H; yy++) for (let xx = 0; xx < W; xx++) { const k = (yy * W + xx) * 4, n = 1 + (Math.random() - 0.5) * 0.06 + Math.sin(xx * 2.2) * Math.sin(yy * 2.2) * 0.012; dd[k] *= n; dd[k + 1] *= n; dd[k + 2] *= n; }
    x.putImageData(id, 0, 0); return ctex(c, { repeat: false });
  });
  const m = new THREE.MeshStandardMaterial({ map, roughness: 0.65 }); m.userData.tileM = 1; return m;
}

/* ------------------------------------------------------------------ geometry helpers */
/** tri-planar world UVs (by dominant normal), tile in metres */
export function triUV(geo, tile = 1) {
  const pos = geo.attributes.position, nor = geo.attributes.normal, uv = geo.attributes.uv || new THREE.BufferAttribute(new Float32Array(pos.count * 2), 2);
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i), nx = Math.abs(nor.getX(i)), ny = Math.abs(nor.getY(i)), nz = Math.abs(nor.getZ(i));
    if (nx >= ny && nx >= nz) uv.setXY(i, z / tile, y / tile); else if (ny >= nx && ny >= nz) uv.setXY(i, x / tile, z / tile); else uv.setXY(i, x / tile, y / tile);
  }
  geo.setAttribute('uv', uv); uv.needsUpdate = true; return geo;
}
function meshOf(geo, mat, parent, { cast = true, receive = true } = {}) { const m = new THREE.Mesh(geo, mat); m.castShadow = cast; m.receiveShadow = receive; parent?.add(m); return m; }
/** hidden from the GTAO normal pass (it hides Line objects) but renders normally */
export function noAO(mesh) { mesh.isLine = true; return mesh; }

/** Rounded box centred at (x,y,z) in parent space, UVs in parent space (seamless with neighbours). */
export function rbox(parent, w, h, d, r, mat, x = 0, y = 0, z = 0, { seg = 3, cast = true, receive = true } = {}) {
  const geo = new RoundedBoxGeometry(w, h, d, seg, Math.max(0.0005, Math.min(r, w / 2 - 1e-3, h / 2 - 1e-3, d / 2 - 1e-3)));
  geo.translate(x, y, z); triUV(geo, mat.userData.tileM || 1); return meshOf(geo, mat, parent, { cast, receive });
}
/** Box between two corners with world-space UVs. */
export const bx = (parent, x0, y0, z0, x1, y1, z1, mat, opt) => boxAt(x0, y0, z0, x1, y1, z1, mat, parent, opt);
/** Centred-box convenience: bc(parent, cx,cy,cz, w,h,d, mat) */
export const bc = (parent, cx, cy, cz, w, h, d, mat, opt) => boxAt(cx - w / 2, cy - h / 2, cz - d / 2, cx + w / 2, cy + h / 2, cz + d / 2, mat, parent, opt);
export function cylY(parent, x, y0, z, rTop, rBot, h, mat, { seg = 28, cast = true, open = false } = {}) {
  const g = new THREE.CylinderGeometry(rTop, rBot, h, seg, 1, open); g.translate(x, y0 + h / 2, z); triUV(g, mat.userData.tileM || 1); return meshOf(g, mat, parent, { cast });
}
/** Lathe solid from [[r,y],...] profile */
export function lathe(parent, pts, mat, x = 0, y = 0, z = 0, { seg = 40, cast = true } = {}) {
  const g = new THREE.LatheGeometry(pts.map(([r, yy]) => new THREE.Vector2(r, yy)), seg); g.translate(x, y, z); triUV(g, mat.userData.tileM || 1); return meshOf(g, mat, parent, { cast });
}
export function torus(parent, R, tube, mat, x, y, z, { rx = Math.PI / 2, ry = 0, seg = 48, tseg = 12, cast = true } = {}) {
  const g = new THREE.TorusGeometry(R, tube, tseg, seg); const m = meshOf(g, mat, parent, { cast }); m.position.set(x, y, z); m.rotation.set(rx, ry, 0); return m;
}
/** Cylinder between two points */
export function rod(parent, a, b, rad, mat, { seg = 12, cast = true } = {}) {
  const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b), len = A.distanceTo(B), g = new THREE.CylinderGeometry(rad, rad, len, seg), m = meshOf(g, mat, parent, { cast });
  m.position.copy(A).add(B).multiplyScalar(0.5); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), B.clone().sub(A).normalize()); return m;
}

/**
 * Plump soft box (cushions, pillows, duvets, ottomans): subdivided box rounded by radius r,
 * with optional puffy `bulge` {x,y,z}, `wrinkle` noise on top, `sag` (belly droop in corners) and `pinch` at seams.
 * Centred at (x,y,z).
 */
export function softBox(parent, w, h, d, mat, x = 0, y = 0, z = 0, { r = 0.04, seg = [18, 8, 18], bulge = {}, wrinkle = 0, wfreq = 5, seed = 1, rotX = 0, rotY = 0, rotZ = 0, tile = null, cast = true, taper = 0 } = {}) {
  let g = new THREE.BoxGeometry(w, h, d, seg[0], seg[1], seg[2]);
  g.deleteAttribute('normal'); g.deleteAttribute('uv'); g = mergeVertices(g, 1e-5);
  const pos = g.attributes.position, hw = w / 2, hh = h / 2, hd = d / 2, rr = Math.min(r, hw * 0.95, hh * 0.95, hd * 0.95), iw = hw - rr, ih = hh - rr, id = hd - rr;
  const warp = (s) => Math.sign(s) * (1 - Math.pow(Math.max(0, 1 - Math.abs(s)), 1.55));
  const rn = rng(seed * 31 + 7), ph = [rn() * 6, rn() * 6, rn() * 6, rn() * 6];
  const nrm = new Float32Array(pos.count * 3);
  for (let i = 0; i < pos.count; i++) {
    let px = warp(pos.getX(i) / hw) * hw, py = warp(pos.getY(i) / hh) * hh, pz = warp(pos.getZ(i) / hd) * hd;
    const cx = Math.max(-iw, Math.min(iw, px)), cy = Math.max(-ih, Math.min(ih, py)), cz = Math.max(-id, Math.min(id, pz));
    let dx = px - cx, dy = py - cy, dz = pz - cz; const L = Math.hypot(dx, dy, dz) || 1;
    dx /= L; dy /= L; dz /= L; px = cx + dx * rr; py = cy + dy * rr; pz = cz + dz * rr; nrm[i * 3] = dx; nrm[i * 3 + 1] = dy; nrm[i * 3 + 2] = dz;
    const ux = px / hw, uy = py / hh, uz = pz / hd;
    if (bulge.y) { const f = (1 - ux * ux) * (1 - uz * uz); py += Math.sign(dy) * Math.max(0, Math.abs(dy) - 0.2) * bulge.y * f * 1.25; }
    if (bulge.z) { const f = (1 - ux * ux) * (1 - uy * uy); pz += Math.sign(dz) * Math.max(0, Math.abs(dz) - 0.2) * bulge.z * f * 1.25; }
    if (bulge.x) { const f = (1 - uz * uz) * (1 - uy * uy); px += Math.sign(dx) * Math.max(0, Math.abs(dx) - 0.2) * bulge.x * f * 1.25; }
    if (wrinkle && dy > 0.4) {
      const wv = Math.sin(px * wfreq + ph[0] + Math.sin(pz * wfreq * 0.7 + ph[1]) * 1.3) * 0.5 + Math.sin(pz * wfreq * 1.3 + ph[2] + px * wfreq * 0.4) * 0.35 + Math.sin((px + pz) * wfreq * 2.3 + ph[3]) * 0.15;
      py += wv * wrinkle * (1 - Math.pow(Math.abs(ux), 6)) * (1 - Math.pow(Math.abs(uz), 6)) * dy;
    }
    if (taper) { const k = 1 - taper * (py / hh * 0.5 + 0.5); px *= k; pz *= k; }
    pos.setXYZ(i, px, py, pz);
  }
  g.setAttribute('normal', new THREE.BufferAttribute(nrm, 3));
  if (bulge.x || bulge.y || bulge.z || wrinkle || taper) g.computeVertexNormals();
  triUV(g, tile ?? (mat.userData.tileM || 0.5));
  if (rotX || rotY || rotZ) { g.applyMatrix4(new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(rotX, rotY, rotZ))); }
  g.translate(x, y, z);
  return meshOf(g, mat, parent, { cast });
}
/** Pillow: soft box bulging on both faces (local z = thickness), rotate with rotX/rotY/rotZ. */
export function pillow(parent, w, h, mat, x, y, z, { thick = 0.14, rotX = 0, rotY = 0, rotZ = 0, seed = 1, r = null } = {}) {
  return softBox(parent, w, h, thick, mat, x, y, z, { r: r ?? thick * 0.42, seg: [18, 18, 6], bulge: { z: thick * 0.75 }, wrinkle: 0, seed, rotX, rotY, rotZ, tile: 0.4 });
}

/* ------------------------------------------------------------------ lights / glow */
export function point(parent, x, y, z, color, intensity, distance = 0, decay = 2) { const l = new THREE.PointLight(color, intensity, distance, decay); l.position.set(x, y, z); parent?.add(l); return l; }
export function spot(parent, from, to, { color = 0xffe2b8, intensity = 20, angle = 0.8, penumbra = 0.8, distance = 0, decay = 2, shadow = false } = {}) {
  const l = new THREE.SpotLight(color, intensity, distance, angle, penumbra, decay); l.position.set(...from); l.target.position.set(...to); parent?.add(l, l.target);
  if (shadow) { l.castShadow = true; l.shadow.mapSize.set(1024, 1024); l.shadow.bias = -0.0004; l.shadow.normalBias = 0.02; l.shadow.radius = 4; } return l;
}
let areaInit = false;
/** soft rectangular emitter (window / panel light). faces local -Z by default; use lookAt. */
export function areaLight(parent, pos, lookAt, w, h, color, intensity) {
  if (!areaInit) { RectAreaLightUniformsLib.init(); areaInit = true; }
  const l = new THREE.RectAreaLight(color, intensity, w, h); l.position.set(...pos); l.lookAt(...lookAt); parent?.add(l); return l;
}
/** gradient sprite textures for glow decals */
function glowTex(kind) {
  return once(`glow|${kind}`, () => {
    const S = 256, c = mkCanvas(S), x = c.getContext('2d');
    if (kind === 'radial') { const g = x.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.25, 'rgba(255,255,255,0.55)'); g.addColorStop(0.6, 'rgba(255,255,255,0.14)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, S, S); }
    else if (kind === 'down') { const g = x.createLinearGradient(0, 0, 0, S); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.35, 'rgba(255,255,255,0.4)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, S, S); const m = x.createLinearGradient(0, 0, S, 0); m.addColorStop(0, 'rgba(0,0,0,0.0)'); x.globalCompositeOperation = 'destination-in'; const e = x.createLinearGradient(0, 0, S, 0); e.addColorStop(0, 'rgba(255,255,255,0)'); e.addColorStop(0.08, 'rgba(255,255,255,1)'); e.addColorStop(0.92, 'rgba(255,255,255,1)'); e.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = e; x.fillRect(0, 0, S, S); }
    else if (kind === 'scallop') { const g = x.createLinearGradient(0, 0, 0, S); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.5, 'rgba(255,255,255,0.35)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, S, S); x.globalCompositeOperation = 'destination-in'; const e = x.createRadialGradient(S / 2, 0, 0, S / 2, 0, S * 0.62); e.addColorStop(0, 'rgba(255,255,255,1)'); e.addColorStop(0.55, 'rgba(255,255,255,0.7)'); e.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = e; x.fillRect(0, 0, S, S); }
    else if (kind === 'shadow') { const g = x.createRadialGradient(S / 2, S / 2, S * 0.15, S / 2, S / 2, S / 2); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.55, 'rgba(255,255,255,0.55)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, S, S); }
    else if (kind === 'edge') { const g = x.createLinearGradient(0, 0, 0, S); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, S, S); }
    return ctex(c, { repeat: false });
  });
}
/** Additive light decal (wall washes, scallops, halos, floor window reflections). Plane faces +Z by default; use rotation. */
export function glow(parent, { kind = 'radial', w = 1, h = 1, color = 0xffd9a0, intensity = 1, pos = [0, 0, 0], rot = [0, 0, 0], order = 3 } = {}) {
  const map = glowTex(kind), mat = new THREE.MeshBasicMaterial({ map, color: new THREE.Color(color).multiplyScalar(intensity), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat); m.position.set(...pos); m.rotation.set(...rot); m.renderOrder = order; noAO(m); parent?.add(m); return m;
}
/** multiplicative-ish soft dark contact shadow decal on the floor (normal blending, black). */
export function contactShadow(parent, { x, z, w, d, y = 0.003, opacity = 0.5, rot = 0 }) {
  const mat = new THREE.MeshBasicMaterial({ map: glowTex('shadow'), color: 0x000000, transparent: true, opacity, depthWrite: false });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), mat); m.rotation.set(-Math.PI / 2, 0, rot); m.position.set(x, y, z); m.renderOrder = 2; noAO(m); parent?.add(m); return m;
}

/* ------------------------------------------------------------------ fake-GI room environment */
/**
 * Replaces scene.environment with a small synthetic room (walls, windows, lamps) so reflections and ambient fill
 * look like an interior. All coordinates relative to the room centre (x,z) with y=0 at the floor.
 */
export function interiorEnvironment({ renderer, scene, W = 7, H = 3, D = 6, eye = 1.4, wall = 0xe9e3d8, floor = 0x8a7a68, ceil = 0xf2ede2, wallLum = 0.55, floorLum = 0.4, ceilLum = 0.75, windows = [], lamps = [], intensity = 1, sigma = 0.035 }) {
  const s = new THREE.Scene();
  const mk = (c, lum) => new THREE.MeshBasicMaterial({ color: new THREE.Color(c).multiplyScalar(lum), side: THREE.DoubleSide });
  const plane = (w, h, mat, pos, rot) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat); m.position.set(...pos); m.rotation.set(...rot); s.add(m); return m; };
  const y0 = -eye;
  plane(W, D, mk(floor, floorLum), [0, y0, 0], [-Math.PI / 2, 0, 0]);
  plane(W, D, mk(ceil, ceilLum), [0, y0 + H, 0], [Math.PI / 2, 0, 0]);
  const wm = mk(wall, wallLum);
  plane(W, H, wm, [0, y0 + H / 2, -D / 2], [0, 0, 0]); plane(W, H, wm, [0, y0 + H / 2, D / 2], [0, Math.PI, 0]);
  plane(D, H, wm, [-W / 2, y0 + H / 2, 0], [0, Math.PI / 2, 0]); plane(D, H, wm, [W / 2, y0 + H / 2, 0], [0, -Math.PI / 2, 0]);
  for (const wi of windows) {
    const { side = '+x', c = 0, w = 2, yb = 0.9, yt = 2.6, color = 0xdcebff, lum = 7 } = wi, m = mk(color, lum), hh = yt - yb, yc = y0 + (yb + yt) / 2;
    if (side === '+x') plane(w, hh, m, [W / 2 - 0.02, yc, c], [0, -Math.PI / 2, 0]); else if (side === '-x') plane(w, hh, m, [-W / 2 + 0.02, yc, c], [0, Math.PI / 2, 0]);
    else if (side === '-z') plane(w, hh, m, [c, yc, -D / 2 + 0.02], [0, 0, 0]); else plane(w, hh, m, [c, yc, D / 2 - 0.02], [0, Math.PI, 0]);
  }
  for (const l of lamps) { const { pos = [0, 2.5, 0], size = 0.6, color = 0xffd7a0, lum = 10 } = l; const m = new THREE.Mesh(new THREE.SphereGeometry(size / 2, 12, 8), mk(color, lum)); m.position.set(pos[0], pos[1] + y0, pos[2]); s.add(m); }
  const pm = new THREE.PMREMGenerator(renderer), env = pm.fromScene(s, sigma, 0.05, 40).texture;
  scene.environment = env; scene.environmentIntensity = intensity; return env;
}

/* ------------------------------------------------------------------ room shell */
import { hedge, bush, tree, palm } from './nature.mjs';
export { hedge, bush, tree, palm };

/** orientation helper: put a Group at (x,z) rotated about Y */
export function place(g, x, z, rotY = 0, y = 0) { g.position.set(x, y, z); g.rotation.y = rotY; return g; }

/**
 * Room shell. Interior volume x0..x1, z0..z1, floor y=0, ceiling y=H. Walls are real slabs of thickness t on the OUTSIDE.
 * o.openings = { back|left|right|front: [{ c (world coord along wall), w, y, h, type:'window'|'slider'|'door', panels, frame, sill }] }
 * Wall-local frames (room.wall[side]): x = distance along wall (u), y up, z = distance into the room.
 */
export function buildRoom(scene, o) {
  const { x0, x1, z0, z1, H = 3.0, t = 0.25 } = o;
  const root = new THREE.Group(); scene.add(root);
  const frames = { back: { A: [x0, z0], d: [1, 0], n: [0, 1], L: x1 - x0 }, right: { A: [x1, z0], d: [0, 1], n: [-1, 0], L: z1 - z0 }, front: { A: [x1, z1], d: [-1, 0], n: [0, -1], L: x1 - x0 }, left: { A: [x0, z1], d: [0, -1], n: [1, 0], L: z1 - z0 } };
  const M = Object.assign({ floor: paintMat(0xcccccc), ceil: paintMat(0xf6f3ec, { seed: 14 }), back: null, left: null, right: null, front: null, skirt: null, frame: blackMetal(0x1b1d20), sill: marbleMat({ base: 0xf2eee6, slab: 0.6, n: 1, seed: 17 }), door: null }, o.mats || {});
  const wallDefault = M.wall || paintMat(0xe9e3d8, { seed: 3 });
  const room = { root, H, t, bounds: { x0, x1, z0, z1 }, wall: {}, frames, M, ceilingY: H, dropY: H, trayBand: 0, openings: {} };
  const uOf = (side, c) => { const f = frames[side]; return (side === 'back' || side === 'front') ? (c - f.A[0]) * f.d[0] : (c - f.A[1]) * f.d[1]; };
  room.uOf = uOf;
  room.toWorld = (side, u, y, w) => { const f = frames[side]; return new THREE.Vector3(f.A[0] + u * f.d[0] + w * f.n[0], y, f.A[1] + u * f.d[1] + w * f.n[1]); };
  const glassM = glassMat({ opacity: 0.10 });
  const yBot = -0.7;
  { const e = o.ceilEmissive ?? 0.16; if (e) for (const m of [M.ceil, M.band]) if (m && m.emissive) { m.emissive = new THREE.Color(o.ceilEmissiveColor ?? 0xfff0dc); m.emissiveIntensity = e; } }

  for (const side of ['back', 'right', 'front', 'left']) {
    const f = frames[side], g = new THREE.Group(), ext = (side === 'back' || side === 'front') ? t : 0;
    const m4 = new THREE.Matrix4().makeBasis(new THREE.Vector3(f.d[0], 0, f.d[1]), new THREE.Vector3(0, 1, 0), new THREE.Vector3(f.n[0], 0, f.n[1])); m4.setPosition(f.A[0], 0, f.A[1]);
    m4.decompose(g.position, g.quaternion, g.scale); root.add(g); room.wall[side] = g;
    const wm = M[side] || wallDefault;
    const ops = (o.openings?.[side] || []).map((op) => ({ ...op, u: uOf(side, op.c) - op.w / 2, type: op.type || 'window' })).sort((a, b) => a.u - b.u);
    room.openings[side] = ops;
    const us = new Set([-ext, f.L + ext]), ys = new Set([yBot, H]);
    for (const op of ops) { us.add(op.u); us.add(op.u + op.w); ys.add(op.y); ys.add(op.y + op.h); }
    const U = [...us].sort((a, b) => a - b), Y = [...ys].sort((a, b) => a - b);
    for (let i = 0; i < U.length - 1; i++) for (let j = 0; j < Y.length - 1; j++) {
      const cu = (U[i] + U[i + 1]) / 2, cy = (Y[j] + Y[j + 1]) / 2;
      if (ops.some((op) => cu > op.u && cu < op.u + op.w && cy > op.y && cy < op.y + op.h)) continue;
      boxAt(U[i], Y[j], -t, U[i + 1], Y[j + 1], 0, wm, g);
    }
    // openings: frames, glass, sills, doors
    const fm = M.frame;
    for (const op of ops) {
      const u0 = op.u, u1 = op.u + op.w, y0 = op.y, y1 = op.y + op.h, uc = (u0 + u1) / 2, zc = -t * 0.55, ft = op.ft ?? 0.05, fd = 0.07, fmat = op.frameMat || fm;
      if (op.type === 'window' || op.type === 'slider') {
        boxAt(u0, y0, zc - fd / 2, u1, y0 + ft, zc + fd / 2, fmat, g); boxAt(u0, y1 - ft, zc - fd / 2, u1, y1, zc + fd / 2, fmat, g);
        boxAt(u0, y0, zc - fd / 2, u0 + ft, y1, zc + fd / 2, fmat, g); boxAt(u1 - ft, y0, zc - fd / 2, u1, y1, zc + fd / 2, fmat, g);
        const np = op.panels ?? Math.max(1, Math.round(op.w / 1.1));
        for (let i = 1; i < np; i++) { const uu = u0 + (op.w * i) / np; boxAt(uu - 0.03, y0, zc - 0.04, uu + 0.03, y1, zc + 0.005, fmat, g); boxAt(uu - 0.03, y0, zc - 0.005, uu + 0.03, y1, zc + 0.04, fmat, g); }
        if (op.transom) boxAt(u0, y1 - op.transom - 0.02, zc - 0.035, u1, y1 - op.transom + 0.02, zc + 0.035, fmat, g);
        if (op.mullions) for (let k = 1; k <= op.mullions; k++) { const yy = y0 + (op.h * k) / (op.mullions + 1); boxAt(u0, yy - 0.012, zc - 0.03, u1, yy + 0.012, zc + 0.03, fmat, g); }
        const gl = new THREE.Mesh(new THREE.PlaneGeometry(op.w - 2 * ft, op.h - 2 * ft), glassM); gl.position.set(uc, (y0 + y1) / 2, zc); noAO(gl); gl.renderOrder = 1; g.add(gl);
        if (op.sill !== false && y0 > 0.2) { boxAt(u0 - 0.05, y0 - 0.035, -t, u1 + 0.05, y0, 0.07, M.sill, g); }
        if (op.type === 'slider') boxAt(u0, 0, zc - 0.05, u1, 0.012, zc + 0.05, M.sill, g);
      } else if (op.type === 'door') {
        const lm = op.leafMat || M.door || woodMat({ kind: 'walnut', tileM: 1.2, planks: 1, seed: 33 });
        boxAt(u0, 0, -0.09, u1, y1, -0.05, lm, g);
        const hm = brassMat(); boxAt(u1 - 0.17, 0.98, -0.05, u1 - 0.07, 1.0, 0.0, hm, g); boxAt(u1 - 0.14, 0.96, 0.0, u1 - 0.12, 1.0, 0.02, hm, g);
        const aw = 0.085, am = op.architrave || M.trim || paintMat(0xf4f1ea, { seed: 31 });
        boxAt(u0 - aw, 0, 0, u0, y1 + aw, 0.018, am, g); boxAt(u1, 0, 0, u1 + aw, y1 + aw, 0.018, am, g); boxAt(u0 - aw, y1, 0, u1 + aw, y1 + aw, 0.018, am, g);
      }
    }
    // skirting
    if (M.skirt !== false) {
      const sk = M.skirt || paintMat(0xf6f3ec, { seed: 31 }), sh = o.skirtH ?? 0.11;
      const cuts = ops.filter((op) => op.y < sh && (op.type === 'door' || op.type === 'slider')).map((op) => [op.u, op.u + op.w]);
      let a = 0; const segs = []; for (const [c0, c1] of cuts) { if (c0 > a) segs.push([a, c0]); a = c1; } if (a < f.L) segs.push([a, f.L]);
      for (const [a0, a1] of segs) { boxAt(a0, 0, 0, a1, sh, 0.02, sk, g); boxAt(a0, sh, 0, a1, sh + 0.008, 0.012, sk, g); }
    }
  }
  // floor
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0, z1 - z0), M.floor); fl.geometry.rotateX(-Math.PI / 2); fl.geometry.translate((x0 + x1) / 2, 0, (z0 + z1) / 2);
  triUV(fl.geometry, M.floor.userData.tileM || 1); fl.receiveShadow = true; root.add(fl); room.floor = fl;
  // ceiling slab + tray
  const cs = o.ceiling || {};
  boxAt(x0 - t, H, z0 - t, x1 + t, H + 0.35, z1 + t, M.ceil, root);
  if (cs.tray !== false && cs.tray !== undefined && cs.tray !== null) {
    const band = cs.band ?? 0.8, drop = cs.drop ?? 0.2, bm = M.band || M.ceil;
    boxAt(x0, H - drop, z0, x1, H, z0 + band, bm, root); boxAt(x0, H - drop, z1 - band, x1, H, z1, bm, root);
    boxAt(x0, H - drop, z0 + band, x0 + band, H, z1 - band, bm, root); boxAt(x1 - band, H - drop, z0 + band, x1, H, z1 - band, bm, root);
    // thin shadow-gap lip along the tray edge
    const lip = paintMat(0xfbf8f2, { seed: 15 });
    boxAt(x0 + band, H - drop - 0.012, z0 + band, x1 - band, H - drop, z0 + band + 0.018, lip, root); boxAt(x0 + band, H - drop - 0.012, z1 - band - 0.018, x1 - band, H - drop, z1 - band, lip, root);
    boxAt(x0 + band, H - drop - 0.012, z0 + band, x0 + band + 0.018, H - drop, z1 - band, lip, root); boxAt(x1 - band - 0.018, H - drop - 0.012, z0 + band, x1 - band, H - drop, z1 - band, lip, root);
    room.trayBand = band; room.dropY = H - drop;
    if (cs.led !== false) {
      const col = cs.ledColor ?? 0xffd9a8, it = cs.ledIntensity ?? 1.4, gw = cs.glowW ?? 1.0, y = H - 0.004, tw = x1 - x0 - 2 * band, td = z1 - z0 - 2 * band;
      const fl2 = (x, z, w, h, rotY) => { const m = glow(root, { kind: 'edge', w, h, color: col, intensity: it, pos: [x, y, z], rot: [0, 0, 0] }); m.rotation.order = 'YXZ'; m.rotation.set(Math.PI / 2, rotY, 0); return m; };
      fl2((x0 + x1) / 2, z0 + band + gw / 2, tw, gw, Math.PI);             // bright toward -z (back edge)
      fl2((x0 + x1) / 2, z1 - band - gw / 2, tw, gw, 0);                    // bright toward +z (front edge)
      fl2(x0 + band + gw / 2, (z0 + z1) / 2, td, gw, -Math.PI / 2);           // bright toward -x
      fl2(x1 - band - gw / 2, (z0 + z1) / 2, td, gw, Math.PI / 2);            // bright toward +x
      // visible LED line glow on lip's inner face (a thin emissive strip just above the lip hidden from low cameras)
      const sm = T.emissive(col, 3.2), sy = H - drop + 0.012;
      boxAt(x0 + band + 0.04, sy, z0 + band + 0.04, x1 - band - 0.04, sy + 0.012, z0 + band + 0.06, sm, root, { cast: false }); boxAt(x0 + band + 0.04, sy, z1 - band - 0.06, x1 - band - 0.04, sy + 0.012, z1 - band - 0.04, sm, root, { cast: false });
      boxAt(x0 + band + 0.04, sy, z0 + band + 0.04, x0 + band + 0.06, sy + 0.012, z1 - band - 0.04, sm, root, { cast: false }); boxAt(x1 - band - 0.06, sy, z0 + band + 0.04, x1 - band - 0.04, sy + 0.012, z1 - band - 0.04, sm, root, { cast: false });
    }
  } else if (cs.cornice !== false) {
    const cm = paintMat(0xf8f5ee, { seed: 16 }), c1 = 0.1;
    boxAt(x0, H - c1, z0, x1, H, z0 + c1, cm, root); boxAt(x0, H - c1, z1 - c1, x1, H, z1, cm, root); boxAt(x0, H - c1, z0, x0 + c1, H, z1, cm, root); boxAt(x1 - c1, H - c1, z0, x1, H, z1, cm, root);
    boxAt(x0, H - c1 - 0.03, z0, x1, H - c1, z0 + 0.04, cm, root); boxAt(x0, H - c1 - 0.03, z1 - 0.04, x1, H - c1, z1, cm, root); boxAt(x0, H - c1 - 0.03, z0, x0 + 0.04, H - c1, z1, cm, root); boxAt(x1 - 0.04, H - c1 - 0.03, z0, x1, H - c1, z1, cm, root);
    room.dropY = H - c1;
  }
  /** recessed downlights on a ceiling plane at y */
  room.downlights = (pts, { y = room.dropY, color = 0xfff0d6, lum = 12, r = 0.045, trim = 0xf3f1ec } = {}) => {
    const em = T.emissive(color, lum), tm = ceramicMat(trim, 0.4);
    for (const [x, z] of pts) { const d = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 0.006, 20), em); d.position.set(x, y - 0.003, z); noAO(d); root.add(d); const tr = new THREE.Mesh(new THREE.TorusGeometry(r + 0.006, 0.006, 6, 24), tm); tr.rotation.x = Math.PI / 2; tr.position.set(x, y - 0.004, z); root.add(tr); }
  };
  return room;
}

/** Garden / street backdrop seen through a window wall. Built in the wall's local frame (z negative = outside). */
export function gardenView(room, side, { pave = 0xc8c2b6, lawn = 0x4b7a34, dim = 0.62, depthWall = 9.5, seed = 1, trees = true, neighbour = true, extent = 40, terrace = 3.0, tone = 0x56873b, wallColor = 0xe3dccb, treeSpec = null } = {}) {
  const g = room.wall[side], t = room.t, u0 = -extent, u1 = room.frames[side].L + extent;
  const dm = (c) => new THREE.Color(c).multiplyScalar(dim).getHex();
  const grass = T.grass({ color: dm(lawn), tileM: 4, seed: 61 + seed });
  const gp = new THREE.Mesh(new THREE.PlaneGeometry(u1 - u0, 90), grass); gp.geometry.rotateX(-Math.PI / 2); gp.geometry.translate((u0 + u1) / 2, -0.3, -50); triUV(gp.geometry, 4); gp.receiveShadow = true; g.add(gp);
  const pv = T.paving({ color: dm(pave), tileM: 2.4, n: 5, seed: 41 + seed }); boxAt(u0 + 28, -0.3, -t, u1 - 28, -0.02, -t - terrace, pv, g);
  boxAt(-extent, -0.3, -t - terrace, u1, -0.02, -t - terrace - 0.12, T.concrete(dm(0xb4b0a6), { tileM: 2, seed: 5 }), g);
  // boundary wall
  const wl = T.plaster(dm(wallColor), { tileM: 3, seed: 18 + seed }); boxAt(u0, -0.3, -depthWall - 0.25, u1, 2.1, -depthWall, wl, g); boxAt(u0, 2.1, -depthWall - 0.32, u1, 2.18, -depthWall + 0.07, T.concrete(dm(0xc4bfb4), { tileM: 2, seed: 8 }), g);
  hedge(-6, -depthWall + 1.1, room.frames[side].L + 6, -depthWall + 1.1, { h: 1.4, w: 0.9, density: 55, seed: 11 + seed, color: dm(tone) }, g);
  for (let k = 0; k < 7; k++) bush(-3 + k * ((room.frames[side].L + 6) / 6.2), 0, -t - terrace - 0.9 - (k % 2) * 0.6, 0.55 + (k % 3) * 0.12, g, { seed: 20 + k + seed, color: dm(tone) });
  if (trees) {
    const L = room.frames[side].L;
    for (const [uu, ww, hh, cc, sd] of treeSpec ?? [[L * 0.1, -depthWall - 2.4, 9, 0x4a7f35, 2], [-L * 0.3, -depthWall - 3.0, 8.5, 0x4f8438, 14], [-L * 0.75, -depthWall - 3.4, 10, 0x558a3a, 5]]) tree(uu, ww, { h: hh, crown: hh * 0.38, seed: sd + seed, color: dm(cc) }, g);
    palm(L * 0.3, -t - terrace - 2.2, { h: 4.8, seed: 3 + seed, lean: 0.3 }, g);
  }
  if (neighbour) {
    const nb = T.plaster(dm(0xdcd3c1), { tileM: 3.5, seed: 12 + seed }); boxAt(u0, -0.3, -depthWall - 17, u1 - 8, 9.5, -depthWall - 15, nb, g);
    const wnd = T.solid(0x2a3138, { roughness: 0.2, metalness: 0.5 }); for (let k = 0; k < 7; k++) for (let r = 0; r < 2; r++) boxAt(-10 + k * 4.2, 1.4 + r * 3.2, -depthWall - 14.95, -8.6 + k * 4.2, 2.8 + r * 3.2, -depthWall - 14.9, wnd, g, { cast: false });
  }
  return g;
}

/* ------------------------------------------------------------------ curtains / blinds */
export function sheerMat(color = 0xf6f1e6, opacity = 0.6) { const m = new THREE.MeshStandardMaterial({ color, roughness: 1, transparent: true, opacity, side: THREE.DoubleSide, depthWrite: false }); m.userData.tileM = 1; return m; }
/** hanging cloth panel in a wall-local frame (x = u, y up, z = out of the wall into the room) */
export function curtainPanel(parent, { u0, u1, y0, y1, zOff = 0.14, folds = null, amp = 0.045, mat, seed = 1, tile = 0.4, noaoFlag = false, lean = 0 }) {
  const W = u1 - u0, Hh = y1 - y0, nf = folds ?? Math.max(2, Math.round(W / 0.2)), geo = new THREE.PlaneGeometry(W, Hh, nf * 10, 12), pos = geo.attributes.position, uv = geo.attributes.uv, r = rng(seed), ph = r() * 6, ph2 = r() * 6;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i), s = (x + W / 2) / W, v = (y + Hh / 2) / Hh;
    const a = amp * (0.85 + 0.25 * Math.sin(s * 17 + ph2)) * (0.78 + 0.22 * (1 - v));
    pos.setZ(i, zOff + a * Math.sin(s * TAU * nf + ph + 0.35 * Math.sin(v * 3 + s * 5)) + lean * (1 - v));
    pos.setX(i, x + 0.012 * Math.sin(v * 5 + s * 9) * (1 - v));
    uv.setXY(i, (x + W / 2) / tile, (y + Hh / 2) / tile);
  }
  geo.computeVertexNormals(); geo.translate((u0 + u1) / 2, (y0 + y1) / 2, 0);
  const m = new THREE.Mesh(geo, mat); m.castShadow = !mat.transparent; m.receiveShadow = true; if (mat.transparent || noaoFlag) noAO(m); m.renderOrder = mat.transparent ? 4 : 0; parent.add(m); return m;
}
/** full window dressing: sheer + side drapes + rod, all in wall-local frame */
export function curtainSet(parent, { u0, u1, yTop = 2.75, yBot = 0.02, zOff = 0.16, drape = null, sheer = 0xf4efe4, sheerOpacity = 0.6, stack = 0.75, rodMat = null, track = false, seed = 1, drapeFolds = null, extra = 0.2, closed = 0 }) {
  const g = new THREE.Group(); parent.add(g);
  if (sheer !== null) curtainPanel(g, { u0: u0 - extra, u1: u1 + extra, y0: yBot, y1: yTop - 0.05, zOff, amp: 0.05, mat: sheerMat(sheer, sheerOpacity), seed, tile: 1 });
  if (drape) {
    const dz = zOff + 0.1;
    curtainPanel(g, { u0: u0 - extra - stack + 0.1, u1: u0 - extra + 0.1 + closed, y0: yBot, y1: yTop - 0.04, zOff: dz, amp: 0.075, folds: drapeFolds ?? Math.round(stack / 0.17), mat: drape, seed: seed + 1 });
    curtainPanel(g, { u0: u1 + extra - 0.1 - closed, u1: u1 + extra + stack - 0.1, y0: yBot, y1: yTop - 0.04, zOff: dz, amp: 0.075, folds: drapeFolds ?? Math.round(stack / 0.17), mat: drape, seed: seed + 2 });
  }
  const rm = rodMat || blackMetal(0x1a1a1a, 0.4), L0 = u0 - extra - stack - 0.15, L1 = u1 + extra + stack + 0.15;
  if (track) { boxAt(L0, yTop, zOff - 0.04, L1, yTop + 0.03, zOff + 0.14, rm, g); }
  else { const r = new THREE.Mesh(new THREE.CylinderGeometry(0.0125, 0.0125, L1 - L0, 14), rm); r.rotation.z = Math.PI / 2; r.position.set((L0 + L1) / 2, yTop + 0.03, zOff + 0.04); r.castShadow = true; g.add(r);
    for (const u of [L0, L1]) { const f = new THREE.Mesh(new THREE.SphereGeometry(0.03, 14, 10), rm); f.position.set(u, yTop + 0.03, zOff + 0.04); g.add(f); } }
  return g;
}

/* ------------------------------------------------------------------ viewer + billboards */
const haloList = [];
/** additive soft halo around a light source; call finishScene(scene, camera) at the end so halos face the camera */
export function halo(parent, pos, size, color = 0xffd9a0, intensity = 0.8) {
  const m = glow(parent, { kind: 'radial', w: size, h: size, color, intensity, order: 5, pos }); haloList.push(m); return m;
}
export function finishScene(scene, camera) {
  scene.updateMatrixWorld(true); const cp = camera.position.clone();
  for (const m of haloList) m.lookAt(cp);
  haloList.length = 0;
}

/* ------------------------------------------------------------------ plants */
function leafTex(kind) {
  return once(`leaf|${kind}`, () => {
    const W = 256, Hh = kind === 'snake' ? 512 : kind === 'frond' ? 256 : 384, c = mkCanvas(W, Hh), x = c.getContext('2d'), r = rng(kind.length * 17 + 3);
    x.clearRect(0, 0, W, Hh);
    const shape = (hw, len) => { x.beginPath(); x.moveTo(W / 2, Hh * 0.98); x.bezierCurveTo(W / 2 - hw * 1.3, Hh * 0.8, W / 2 - hw * 1.2, Hh * 0.25, W / 2, Hh * 0.02); x.bezierCurveTo(W / 2 + hw * 1.2, Hh * 0.25, W / 2 + hw * 1.3, Hh * 0.8, W / 2, Hh * 0.98); x.closePath(); void len; };
    if (kind === 'ficus' || kind === 'rubber') {
      const base = kind === 'rubber' ? [26, 58, 30] : [46, 98, 40]; shape(W * 0.38, Hh); const g = x.createLinearGradient(0, 0, W, 0); g.addColorStop(0, `rgb(${base[0] * 0.8},${base[1] * 0.85},${base[2] * 0.8})`); g.addColorStop(0.5, `rgb(${base[0] * 1.25},${base[1] * 1.25},${base[2] * 1.2})`); g.addColorStop(1, `rgb(${base[0] * 0.85},${base[1] * 0.9},${base[2] * 0.85})`); x.fillStyle = g; x.fill();
      x.save(); shape(W * 0.38, Hh); x.clip(); x.strokeStyle = 'rgba(190,215,140,0.55)'; x.lineWidth = 3; x.beginPath(); x.moveTo(W / 2, Hh); x.lineTo(W / 2, 0); x.stroke(); x.lineWidth = 1.4; x.strokeStyle = 'rgba(190,215,140,0.4)';
      for (let i = 1; i < 11; i++) { const yy = Hh * (0.95 - i * 0.085); for (const s of [-1, 1]) { x.beginPath(); x.moveTo(W / 2, yy); x.quadraticCurveTo(W / 2 + s * W * 0.2, yy - 14, W / 2 + s * W * 0.42, yy - 46); x.stroke(); } }
      x.restore();
    } else if (kind === 'monstera') {
      x.fillStyle = '#245a2c'; x.beginPath(); x.moveTo(W / 2, Hh * 0.98); x.bezierCurveTo(W * 0.02, Hh * 0.8, -W * 0.05, Hh * 0.28, W / 2, Hh * 0.04); x.bezierCurveTo(W * 1.05, Hh * 0.28, W * 0.98, Hh * 0.8, W / 2, Hh * 0.98); x.fill();
      x.globalCompositeOperation = 'destination-out'; for (const s of [-1, 1]) for (let i = 0; i < 5; i++) { const yy = Hh * (0.22 + i * 0.14); x.beginPath(); x.moveTo(W / 2 + s * 8, yy + 18); x.quadraticCurveTo(W / 2 + s * W * 0.25, yy - 8, W / 2 + s * W * 0.62, yy - 4 + (i % 2) * 8); x.lineTo(W / 2 + s * W * 0.62, yy + 22); x.quadraticCurveTo(W / 2 + s * W * 0.25, yy + 16, W / 2 + s * 8, yy + 26); x.closePath(); x.fill(); }
      x.globalCompositeOperation = 'source-over'; x.strokeStyle = 'rgba(170,205,120,0.6)'; x.lineWidth = 3; x.beginPath(); x.moveTo(W / 2, Hh * 0.98); x.lineTo(W / 2, Hh * 0.05); x.stroke();
    } else if (kind === 'snake') {
      shape(W * 0.3, Hh); const g = x.createLinearGradient(0, 0, W, 0); g.addColorStop(0, '#b9c05a'); g.addColorStop(0.18, '#2f5a2e'); g.addColorStop(0.5, '#26502a'); g.addColorStop(0.82, '#2f5a2e'); g.addColorStop(1, '#b9c05a'); x.fillStyle = g; x.fill();
      x.save(); shape(W * 0.3, Hh); x.clip(); x.strokeStyle = 'rgba(120,160,90,0.45)'; x.lineWidth = 5; for (let i = 0; i < 26; i++) { const yy = Hh * (0.05 + i * 0.037 + r() * 0.01); x.beginPath(); x.moveTo(W * 0.2, yy); x.lineTo(W * 0.8, yy + (r() - 0.5) * 8); x.stroke(); } x.restore();
    } else if (kind === 'frond') {
      x.strokeStyle = '#4b6b2a'; x.lineWidth = 4; x.beginPath(); x.moveTo(W / 2, Hh); x.lineTo(W / 2, 0); x.stroke();
      for (let i = 0; i < 26; i++) { const yy = Hh * (0.97 - i * 0.036), len = W * 0.47 * Math.sin(Math.min(1, 0.25 + i / 22) * Math.PI * 0.78) ** 0.7 + 12; for (const s of [-1, 1]) { x.strokeStyle = `hsl(${100 + r() * 14},${44 + r() * 10}%,${24 + r() * 10}%)`; x.lineWidth = 7.5; x.lineCap = 'round'; x.beginPath(); x.moveTo(W / 2, yy); x.quadraticCurveTo(W / 2 + s * len * 0.55, yy - 22, W / 2 + s * len, yy - 4 + 24); x.stroke(); } }
    }
    const t = ctex(c, { repeat: false }); return t;
  });
}
function leafMat(kind) { return once(`leafMat|${kind}`, () => { const m = new THREE.MeshStandardMaterial({ map: leafTex(kind), alphaTest: 0.45, side: THREE.DoubleSide, roughness: kind === 'rubber' ? 0.35 : 0.55, vertexColors: true }); m.userData.tileM = 1; return m; }); }
function leafGeo(len, wid, { bend = 0.25, cup = 0.15, seg = 6 } = {}) {
  const g = new THREE.PlaneGeometry(wid, len, 4, seg), p = g.attributes.position;
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), v = (p.getY(i) + len / 2) / len, y = p.getY(i) + len / 2; p.setXYZ(i, x, y, -bend * len * v * v + cup * (x / (wid / 2)) ** 2 * wid * 0.25); }
  g.computeVertexNormals(); return g;
}
/** merge leaves given as [{kind,len,wid,pos,rotY,tilt,roll,bend,shade}] into one mesh per kind */
function leavesMesh(parent, list, kind, baseColor = new THREE.Color(1, 1, 1)) {
  const geos = [];
  for (const L of list) {
    const g = leafGeo(L.len, L.wid, { bend: L.bend ?? 0.25, cup: L.cup ?? 0.15 }); const m = new THREE.Matrix4();
    const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(L.tilt ?? 0.6, L.rotY ?? 0, L.roll ?? 0, 'YXZ')); m.compose(new THREE.Vector3(...L.pos), q, new THREE.Vector3(1, 1, 1)); g.applyMatrix4(m);
    const n = g.attributes.position.count, cols = new Float32Array(n * 3), s = L.shade ?? 1; for (let i = 0; i < n; i++) { cols[i * 3] = baseColor.r * s; cols[i * 3 + 1] = baseColor.g * s; cols[i * 3 + 2] = baseColor.b * s; }
    g.setAttribute('color', new THREE.BufferAttribute(cols, 3)); geos.push(g);
  }
  if (!geos.length) return null;
  const mesh = new THREE.Mesh(mergeGeometries(geos), leafMat(kind)); mesh.castShadow = true; mesh.receiveShadow = true; parent.add(mesh); return mesh;
}
const soilMat = () => once('soil', () => T.solid(0x2a1f17, { roughness: 1 }));
export function pot(parent, x, z, { r = 0.2, h = 0.4, mat, y = 0, soil = true, lip = 0.015, profile = 'taper' } = {}) {
  const m = mat || ceramicMat(0xe8e3d9, 0.4), pts = profile === 'round' ? [[0.001, 0], [r * 0.7, 0.003], [r * 0.95, h * 0.2], [r * 1.0, h * 0.55], [r * 0.9, h * 0.95], [r * 0.95, h], [r * 0.86, h]] : [[0.001, 0], [r * 0.72, 0.003], [r * 0.82, h * 0.1], [r, h - 0.01], [r * 1.03, h], [r * 0.9, h]];
  lathe(parent, pts, m, x, y, z, { seg: 40 }); if (soil) { const s = new THREE.Mesh(new THREE.CircleGeometry(r * 0.86, 24), soilMat()); s.rotation.x = -Math.PI / 2; s.position.set(x, y + h - 0.03, z); s.receiveShadow = true; parent.add(s); } void lip;
  return y + h;
}
/** fiddle-leaf fig / rubber plant on a trunk */
export function treePlant(parent, x, z, { h = 1.7, kind = 'ficus', leaves = 34, seed = 1, y0 = 0, spread = 0.5, leafLen = 0.3, lean = 0.05 } = {}) {
  const r = rng(seed), g = new THREE.Group(); g.position.set(x, y0, z); parent.add(g);
  const bark = T.solid(0x6b5a46, { roughness: 0.9 }); const segs = 8; let px = 0, pz = 0, py = 0; const lx = (r() - 0.5) * lean * 2, lz = (r() - 0.5) * lean * 2;
  for (let i = 0; i < segs; i++) { const t0 = i / segs, t1 = (i + 1) / segs, nx = lx * t1 * t1 * h, nz = lz * t1 * t1 * h, ny = h * t1; rod(g, [px, py, pz], [nx, ny, nz], 0.022 * (1 - t0 * 0.6), bark, { seg: 8 }); px = nx; py = ny; pz = nz; }
  const list = [];
  for (let i = 0; i < leaves; i++) { const t = 0.42 + 0.58 * (i / leaves) ** 0.85, a = i * 2.4 + r() * 0.5, rad = 0.02 + spread * (0.45 + 0.55 * Math.sin(t * 2.2)) * (0.5 + r() * 0.5), ll = leafLen * (0.75 + r() * 0.5) * (1.1 - t * 0.3), cx = lx * t * t * h, cz = lz * t * t * h;
    list.push({ pos: [cx + Math.cos(a) * 0.02, h * t, cz + Math.sin(a) * 0.02], len: ll, wid: ll * 0.62, rotY: -a + Math.PI / 2, tilt: 0.55 + r() * 0.5 - (1 - t) * 0.1, roll: (r() - 0.5) * 0.4, bend: 0.3 + r() * 0.25, cup: 0.35, shade: 0.8 + r() * 0.4 });
    void rad; }
  leavesMesh(g, list, kind); return g;
}
export function snakePlant(parent, x, z, { n = 16, h = 0.9, seed = 2, y0 = 0, r0 = 0.13 } = {}) {
  const r = rng(seed), g = new THREE.Group(); g.position.set(x, y0, z); parent.add(g), list0();
  function list0() {}
  const list = []; for (let i = 0; i < n; i++) { const a = r() * TAU, d = r() * r0, hh = h * (0.45 + r() * 0.55); list.push({ pos: [Math.cos(a) * d, 0, Math.sin(a) * d], len: hh, wid: 0.075 + r() * 0.03, rotY: -a + Math.PI / 2, tilt: 0.04 + r() * 0.22 + d * 1.2, roll: (r() - 0.5) * 0.3, bend: 0.12 + r() * 0.1, cup: 0.5, shade: 0.75 + r() * 0.45 }); }
  leavesMesh(g, list, 'snake'); return g;
}
export function monstera(parent, x, z, { n = 9, h = 0.9, seed = 3, y0 = 0, leafLen = 0.42 } = {}) {
  const r = rng(seed), g = new THREE.Group(); g.position.set(x, y0, z); parent.add(g); const list = [], stem = T.solid(0x4a7a3a, { roughness: 0.6 });
  for (let i = 0; i < n; i++) { const a = (i / n) * TAU + r() * 0.5, d = 0.04, sh = h * (0.45 + r() * 0.55), out = 0.18 + r() * 0.4, ex = Math.cos(a) * out, ez = Math.sin(a) * out;
    rod(g, [Math.cos(a) * d, 0, Math.sin(a) * d], [ex, sh, ez], 0.008, stem, { seg: 6 }); const ll = leafLen * (0.75 + r() * 0.5);
    list.push({ pos: [ex, sh, ez], len: ll, wid: ll * 0.9, rotY: -a + Math.PI / 2 + (r() - 0.5) * 0.5, tilt: 1.1 + r() * 0.5, roll: (r() - 0.5) * 0.4, bend: 0.2, cup: 0.4, shade: 0.8 + r() * 0.45 }); }
  leavesMesh(g, list, 'monstera'); return g;
}
export function palmPlant(parent, x, z, { n = 11, h = 1.3, seed = 4, y0 = 0 } = {}) {
  const r = rng(seed), g = new THREE.Group(); g.position.set(x, y0, z); parent.add(g); const list = [], stem = T.solid(0x6a7a3a, { roughness: 0.6 });
  for (let i = 0; i < n; i++) { const a = (i / n) * TAU + r() * 0.6, hh = h * (0.7 + r() * 0.5), out = 0.25 + r() * 0.35; rod(g, [0, 0, 0], [Math.cos(a) * out * 0.35, hh * 0.55, Math.sin(a) * out * 0.35], 0.007, stem, { seg: 5 });
    list.push({ pos: [Math.cos(a) * out * 0.35, hh * 0.55, Math.sin(a) * out * 0.35], len: hh * 0.95, wid: 0.5 + r() * 0.15, rotY: -a + Math.PI / 2, tilt: 0.35 + r() * 0.25, roll: 0, bend: 0.55 + r() * 0.3, cup: 0, shade: 0.8 + r() * 0.4 }); }
  leavesMesh(g, list, 'frond'); return g;
}

/* ------------------------------------------------------------------ decor */
export function vase(parent, x, y, z, { h = 0.3, r = 0.08, type = 'round', mat = null, stems = null, seed = 1 } = {}) {
  const m = mat || ceramicMat(0xe3dccd, 0.25);
  const prof = { round: [[0.001, 0], [r * 0.6, 0.002], [r, h * 0.38], [r * 0.95, h * 0.62], [r * 0.38, h * 0.88], [r * 0.4, h], [r * 0.34, h]], bottle: [[0.001, 0], [r * 0.9, 0.002], [r, h * 0.05], [r, h * 0.55], [r * 0.4, h * 0.72], [r * 0.3, h * 0.85], [r * 0.32, h], [r * 0.26, h]], cyl: [[0.001, 0], [r, 0.002], [r, h], [r * 0.92, h]], gourd: [[0.001, 0], [r * 0.5, 0.002], [r * 0.9, h * 0.22], [r * 0.55, h * 0.5], [r * 0.7, h * 0.72], [r * 0.3, h * 0.92], [r * 0.34, h], [r * 0.28, h]] }[type];
  lathe(parent, prof, m, x, y, z, { seg: 36 });
  if (stems) { const rr = rng(seed), lm = once('twig', () => T.solid(0x6d5a43, { roughness: 0.8 })), list = [];
    for (let i = 0; i < (stems.n ?? 7); i++) { const a = rr() * TAU, lean = 0.1 + rr() * 0.4, len = (stems.h ?? 0.5) * (0.6 + rr() * 0.6), ex = x + Math.cos(a) * lean * len, ez = z + Math.sin(a) * lean * len, ey = y + h + len * 0.9;
      rod(parent, [x, y + h * 0.8, z], [ex, ey, ez], 0.003, lm, { seg: 4 });
      if (stems.leaf) for (let k = 0; k < 6; k++) { const t = 0.3 + k * 0.13; list.push({ pos: [x + (ex - x) * t + (rr() - 0.5) * 0.02, y + h + len * 0.9 * t, z + (ez - z) * t], len: 0.07, wid: 0.045, rotY: rr() * TAU, tilt: 0.5 + rr(), roll: rr(), bend: 0.2, cup: 0.2, shade: 0.7 + rr() * 0.5 }); }
      else { const tuft = new THREE.Mesh(new THREE.SphereGeometry(0.02 + rr() * 0.015, 8, 6), once('tuft', () => T.solid(stems.color ?? 0xd9cdb0, { roughness: 1 }))); tuft.scale.set(1, 2.4, 1); tuft.position.set(ex, ey, ez); parent.add(tuft); } }
    if (stems.leaf) leavesMesh(parent, list, 'ficus', new THREE.Color(0.8, 0.9, 0.8)); }
}
export function books(parent, x, y, z, { n = 4, w = 0.26, d = 0.19, rot = 0, seed = 1, colors = [0xd8c7a8, 0x6a7a74, 0x9b4e3a, 0x2d3a4a, 0xe9e2d3] } = {}) {
  const r = rng(seed); let yy = y; const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = rot; parent.add(g);
  for (let i = 0; i < n; i++) { const th = 0.025 + r() * 0.03, m = T.solid(colors[(r() * colors.length) | 0], { roughness: 0.7 }); const ww = w * (0.85 + r() * 0.25), dd = d * (0.9 + r() * 0.15); rbox(g, ww, th, dd, 0.004, m, (r() - 0.5) * 0.02, yy + th / 2, (r() - 0.5) * 0.015, { seg: 1 }); const pg = T.solid(0xf0ebe0, { roughness: 0.9 }); void pg; yy += th; }
  return yy;
}
export function tray(parent, x, y, z, { w = 0.4, d = 0.26, mat = null, rot = 0 } = {}) { const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = rot; parent.add(g); const m = mat || brassMat(0xb89a52, 0.3); bx(g, -w / 2, 0, -d / 2, w / 2, 0.012, d / 2, m); bx(g, -w / 2, 0, -d / 2, w / 2, 0.03, -d / 2 + 0.008, m); bx(g, -w / 2, 0, d / 2 - 0.008, w / 2, 0.03, d / 2, m); bx(g, -w / 2, 0, -d / 2, -w / 2 + 0.008, 0.03, d / 2, m); bx(g, w / 2 - 0.008, 0, -d / 2, w / 2, 0.03, d / 2, m); return g; }
export function bowl(parent, x, y, z, { r = 0.12, h = 0.06, mat = null } = {}) { const m = mat || ceramicMat(0xd9cfbf, 0.3); lathe(parent, [[0.001, 0], [r * 0.45, 0.002], [r * 0.9, h * 0.8], [r, h], [r * 0.93, h], [r * 0.82, h * 0.78], [r * 0.4, h * 0.12], [0.001, h * 0.1]], m, x, y, z, { seg: 36 }); }
export function candle(parent, x, y, z, { h = 0.1, r = 0.02, color = 0xf1e8d6 } = {}) { cylY(parent, x, y, z, r, r, h, T.solid(color, { roughness: 0.6 }), { seg: 14 }); const f = new THREE.Mesh(new THREE.SphereGeometry(0.007, 8, 6), T.emissive(0xffcf80, 12)); f.scale.set(1, 1.8, 1); f.position.set(x, y + h + 0.01, z); noAO(f); parent.add(f); }
/** abstract brass ring sculpture */
export function ringSculpture(parent, x, y, z, { s = 0.2, seed = 1 } = {}) { const bm = brassMat(0xc9a24d, 0.22); torus(parent, s, s * 0.06, bm, x, y + s * 1.05, z, { rx: 0, ry: 0 }); torus(parent, s * 0.72, s * 0.05, bm, x + s * 0.2, y + s * 0.9, z, { rx: 0, ry: Math.PI / 2.6 }); cylY(parent, x, y, z, s * 0.35, s * 0.4, s * 0.12, blackMetal(0x141414, 0.3)); void seed; }
/** framed art / canvas / mirror panel on a wall. Faces +Z; set rot for other walls. */
export function artPanel(parent, { x, y, z, w, h, mat, frame = 'brass', ft = 0.02, depth = 0.035, rotY = 0, gallery = false }) {
  const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = rotY; parent.add(g);
  const fm = frame === 'brass' ? brassMat(0xc2a050, 0.3) : frame === 'black' ? blackMetal(0x121212, 0.5) : frame === 'wood' ? woodMat({ kind: 'oak', tileM: 0.6, planks: 1, seed: 40, gap: false }) : frame === 'white' ? paintMat(0xf4f1ea) : null;
  const geo = new THREE.BoxGeometry(w - (fm ? 2 * ft : 0), h - (fm ? 2 * ft : 0), 0.012), fm2 = new THREE.Mesh(geo, [mat, mat, mat, mat, mat, mat]); fm2.position.set(0, 0, depth / 2 - 0.004); fm2.castShadow = false; fm2.receiveShadow = true;
  // only the front (+z) should show the picture; sides = dark
  const side = T.solid(0x1b1b1b, { roughness: 0.8 }); fm2.material = [side, side, side, side, mat, side]; g.add(fm2);
  if (fm) { const f = ft; bx(g, -w / 2, -h / 2, 0, w / 2, -h / 2 + f, depth, fm); bx(g, -w / 2, h / 2 - f, 0, w / 2, h / 2, depth, fm); bx(g, -w / 2, -h / 2, 0, -w / 2 + f, h / 2, depth, fm); bx(g, w / 2 - f, -h / 2, 0, w / 2, h / 2, depth, fm); }
  void gallery; return g;
}

/* ------------------------------------------------------------------ fixtures */
export function pendantDome(parent, { x, z, y, drop = 0.8, r = 0.22, shell = null, inner = 0xffd9a0, lum = 8, cord = true, light = true, ceilY = null, flatTop = false, h = 0.2 }) {
  const g = new THREE.Group(); g.position.set(x, y, z); parent.add(g);
  const sm = shell || brassMat(0xc2a050, 0.3), prof = [[0.001, 0.0], [r * 0.28, 0.0], [r * 0.9, h * 0.35], [r, h * 0.75], [r * 0.96, h], [r * 0.94, h]];
  const geo = new THREE.LatheGeometry(prof.map(([a, b]) => new THREE.Vector2(a, b)), 40); const shellMesh = new THREE.Mesh(geo, sm); shellMesh.castShadow = true; shellMesh.position.y = -drop; sm.side = THREE.DoubleSide; g.add(shellMesh);
  const em = new THREE.Mesh(new THREE.CircleGeometry(r * 0.9, 28), T.emissive(inner, lum)); em.rotation.x = Math.PI / 2; em.position.y = -drop + 0.004; noAO(em); g.add(em);
  if (cord) rod(g, [0, -drop + h, 0], [0, ceilY != null ? ceilY - y : 0, 0], 0.004, blackMetal(0x111111, 0.6), { seg: 6 });
  if (light) point(g, 0, -drop - 0.25, 0, inner, lum * 0.9, 6, 1.6);
  void flatTop; return g;
}
export function chandelierRings(parent, { x, z, y, rings = [0.55, 0.38, 0.22], gap = 0.2, tube = 0.012, mat = null, bulbs = 12, lum = 14, light = true, drop = 0.0, ceilY = null, color = 0xffdca8 }) {
  const g = new THREE.Group(); g.position.set(x, y, z); parent.add(g); const bm = mat || brassMat(0xc7a252, 0.22), em = T.emissive(color, lum);
  rings.forEach((R, i) => { const yy = -drop - i * gap; torus(g, R, tube, bm, 0, yy, 0, { rx: Math.PI / 2, seg: 64, tseg: 10 });
    const nb = Math.max(6, Math.round(bulbs * R / rings[0]));
    for (let k = 0; k < nb; k++) { const a = (k / nb) * TAU; const b = new THREE.Mesh(new THREE.SphereGeometry(0.03, 14, 10), em); b.position.set(Math.cos(a) * R, yy - 0.0, Math.sin(a) * R); noAO(b); g.add(b); const gl = new THREE.Mesh(new THREE.SphereGeometry(0.055, 14, 10), glassMat({ tint: 0xfff3dc, opacity: 0.22, rough: 0.05 })); gl.position.copy(b.position); noAO(gl); g.add(gl); } });
  const top = ceilY != null ? ceilY - y : 0.6; for (let k = 0; k < 4; k++) { const a = (k / 4) * TAU + 0.4; rod(g, [Math.cos(a) * rings[0], -drop, Math.sin(a) * rings[0]], [0, top, 0], 0.004, bm, { seg: 5 }); }
  cylY(g, 0, top - 0.02, 0, 0.09, 0.09, 0.04, bm); halo(g, [0, -drop - rings.length * gap * 0.4, 0], rings[0] * 3.2, color, 0.55);
  if (light) { point(g, 0, -drop - 0.3, 0, color, lum * 0.5, 9, 1.8); }
  return g;
}

/* ------------------------------------------------------------------ lounge furniture */
const taperLeg = (g, x, z, h, rTop, rBot, mat, y0 = 0) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(rTop, rBot, h, 14), mat); m.position.set(x, y0 + h / 2, z); m.castShadow = true; m.receiveShadow = true; g.add(m); return m; };

/** L-shaped sofa facing +Z. Back at z=-depth/2. chaise extends forward (+z) on `side` ('r' = +x). */
export function sofaL({ len = 3.0, depth = 0.98, chaise = 1.6, cw = 1.0, side = 'r', fabric, legMat = null, cushionMat = null, pillows = [], seed = 1, seatN = 2, noChaise = false, chaiseArm = false } = {}) {
  const g = new THREE.Group(), lg = legMat || brassMat(0xb89a52, 0.28), cm = cushionMat || fabric, sgn = side === 'r' ? 1 : -1, x0 = -len / 2, x1 = len / 2, zb = -depth / 2, zf = depth / 2;
  const by0 = 0.13, bh = 0.17, bTop = by0 + bh, seatTop = bTop + 0.18;
  const cz = noChaise ? 0 : chaise;
  for (const [x, z] of [[x0 + 0.1, zb + 0.1], [x1 - 0.1, zb + 0.1], [x0 + 0.1, zf - 0.1], [x1 - 0.1, zf - 0.1], [0, zb + 0.1]]) taperLeg(g, x, z, by0, 0.017, 0.011, lg);
  rbox(g, len, bh, depth, 0.05, fabric, 0, by0 + bh / 2, 0);
  if (!noChaise) { rbox(g, cw, bh, cz, 0.05, fabric, sgn * (len / 2 - cw / 2), by0 + bh / 2, zf + cz / 2 - 0.02); for (const dx of [0.1, cw - 0.1]) taperLeg(g, sgn * (len / 2 - dx), zf + cz - 0.1, by0, 0.017, 0.011, lg); }
  rbox(g, len, 0.5, 0.2, 0.09, fabric, 0, bTop + 0.25 - 0.02, zb + 0.1);                                         // back frame
  const armL = -sgn * (len / 2 - 0.11);
  rbox(g, 0.22, 0.34, depth, 0.1, fabric, armL, bTop + 0.15, 0);                                                  // free arm
  const armR = sgn * (len / 2 - 0.11);
  if (noChaise || chaiseArm) rbox(g, 0.22, 0.34, depth + cz, 0.1, fabric, armR, bTop + 0.15, (zb + zf + cz) / 2);   // chaise-side arm (optional)
  // seat cushions
  const xa = sgn > 0 ? -len / 2 + 0.22 : (noChaise ? -len / 2 + 0.22 : -len / 2 + cw), xb = sgn > 0 ? (noChaise ? len / 2 - 0.22 : len / 2 - cw) : len / 2 - 0.22;
  const nc = seatN, cwid = (xb - xa) / nc, cd = depth - 0.2;
  for (let i = 0; i < nc; i++) {
    const cx = xa + cwid * (i + 0.5);
    softBox(g, cwid - 0.012, 0.18, cd, cm, cx, bTop + 0.09, zb + 0.2 + cd / 2, { r: 0.06, bulge: { y: 0.05 }, seed: seed + i, seg: [16, 6, 16] });
    softBox(g, cwid - 0.02, 0.5, 0.22, cm, cx, seatTop + 0.22, zb + 0.34, { r: 0.08, bulge: { z: 0.06, y: 0.02 }, rotX: -0.2, seed: seed + 10 + i, seg: [16, 8, 6] });
  }
  if (!noChaise) {
    const ri = chaiseArm ? 0.22 : 0.05, cwd = cw - ri, ccx = sgn * (len / 2 - (cw + ri) / 2), cdz = depth - 0.2 + cz;
    softBox(g, cwd - 0.01, 0.18, cdz, cm, ccx, bTop + 0.09, zb + 0.2 + cdz / 2, { r: 0.06, bulge: { y: 0.05 }, seed: seed + 20, seg: [14, 6, 30] });
    softBox(g, cwd - 0.02, 0.5, 0.22, cm, ccx, seatTop + 0.22, zb + 0.34, { r: 0.08, bulge: { z: 0.06, y: 0.02 }, rotX: -0.2, seed: seed + 21, seg: [14, 8, 6] });
  }
  pillows.forEach((p, i) => pillow(g, p.w ?? 0.5, p.h ?? 0.5, p.mat, p.x, p.y ?? seatTop + 0.27, p.z ?? zb + 0.5, { thick: p.thick ?? 0.15, rotX: p.rotX ?? -0.25, rotY: p.rotY ?? 0, rotZ: p.rotZ ?? 0, seed: seed + 40 + i }));
  g.userData.dims = { seatTop, depth, len, chaise: cz };
  return g;
}
export function sofaStraight({ len = 2.2, depth = 0.95, fabric, legMat = null, pillows = [], seed = 1, seatN = 3 } = {}) { return sofaL({ len, depth, fabric, legMat, pillows, seed, seatN, noChaise: true, side: 'r' }); }

export function armchair({ fabric, wood = null, w = 0.8, d = 0.84, seed = 1, pillow: pl = null, swivel = false } = {}) {
  const g = new THREE.Group(), wd = wood || woodMat({ kind: 'walnut', tileM: 0.5, planks: 1, seed: 52, gap: false });
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) rod(g, [sx * (w / 2 - 0.08), 0.0, sz * (d / 2 - 0.08)], [sx * (w / 2 - 0.13), 0.3, sz * (d / 2 - 0.15)], 0.02, wd, { seg: 10 });
  rbox(g, w - 0.06, 0.08, d - 0.1, 0.03, wd, 0, 0.32, 0);
  softBox(g, w - 0.14, 0.15, d - 0.2, fabric, 0, 0.43, 0.05, { r: 0.05, bulge: { y: 0.03 }, seed, seg: [12, 5, 12] });
  softBox(g, w - 0.06, 0.52, 0.15, fabric, 0, 0.66, -d / 2 + 0.14, { r: 0.07, bulge: { z: 0.05 }, rotX: -0.3, seed: seed + 1, seg: [14, 8, 5] });
  for (const sx of [-1, 1]) { softBox(g, 0.11, 0.12, d - 0.16, fabric, sx * (w / 2 - 0.06), 0.62, 0.02, { r: 0.045, bulge: { y: 0.02 }, seed: seed + 2, seg: [5, 5, 12] }); rod(g, [sx * (w / 2 - 0.06), 0.3, d / 2 - 0.12], [sx * (w / 2 - 0.06), 0.57, d / 2 - 0.12], 0.014, wd, { seg: 8 }); }
  if (pl) pillow(g, 0.42, 0.42, pl, 0, 0.62, -d / 2 + 0.3, { thick: 0.13, rotX: -0.3, rotZ: 0.15, seed: seed + 5 });
  void swivel; return g;
}
export function pouf({ r = 0.32, h = 0.4, fabric, seed = 1, y = 0 } = {}) { const g = new THREE.Group(); const m = softBox(g, r * 2, h, r * 2, fabric, 0, h / 2 + y, 0, { r: Math.min(r, h / 2) * 0.7, bulge: { y: 0.04 }, seed, seg: [14, 8, 14], tile: 0.4 }); void m; return g; }

export function roundTable({ r = 0.5, h = 0.38, top, legMat = null, shelf = null, thick = 0.035 } = {}) {
  const g = new THREE.Group(), lm = legMat || brassMat(0xc2a050, 0.25);
  cylY(g, 0, h - thick, 0, r, r, thick, top, { seg: 64 });
  const bevel = new THREE.Mesh(new THREE.TorusGeometry(r - 0.002, 0.004, 6, 64), top); bevel.rotation.x = Math.PI / 2; bevel.position.y = h - thick * 0.5; g.add(bevel);
  const n = 3; for (let i = 0; i < n; i++) { const a = (i / n) * TAU + 0.5; rod(g, [Math.cos(a) * r * 0.78, 0, Math.sin(a) * r * 0.78], [Math.cos(a) * r * 0.78, h - thick, Math.sin(a) * r * 0.78], 0.012, lm, { seg: 10 }); }
  torus(g, r * 0.78, 0.008, lm, 0, h * 0.27, 0, { rx: Math.PI / 2, seg: 48, tseg: 8 });
  if (shelf) cylY(g, 0, h * 0.25, 0, r * 0.76, r * 0.76, 0.02, shelf, { seg: 48 });
  return g;
}
export function rectTable({ w = 1.2, d = 0.6, h = 0.4, top, legMat = null, thick = 0.04, style = 'frame' } = {}) {
  const g = new THREE.Group(), lm = legMat || brassMat(0xc2a050, 0.25);
  rbox(g, w, thick, d, 0.006, top, 0, h - thick / 2, 0, { seg: 2 });
  if (style === 'frame') { for (const sx of [-1, 1]) for (const sz of [-1, 1]) bx(g, sx * (w / 2 - 0.06) - 0.012, 0, sz * (d / 2 - 0.06) - 0.012, sx * (w / 2 - 0.06) + 0.012, h - thick, sz * (d / 2 - 0.06) + 0.012, lm); bx(g, -w / 2 + 0.05, h * 0.3, -d / 2 + 0.05, w / 2 - 0.05, h * 0.3 + 0.012, -d / 2 + 0.07, lm); bx(g, -w / 2 + 0.05, h * 0.3, d / 2 - 0.07, w / 2 - 0.05, h * 0.3 + 0.012, d / 2 - 0.05, lm); }
  return g;
}

export function tvSet(parent, { x, y, z, w = 1.45, rotY = 0 }) {
  const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = rotY; parent.add(g); const h = w * 0.5625;
  const body = T.solid(0x0b0c0e, { roughness: 0.35, metalness: 0.5 });
  rbox(g, w + 0.014, h + 0.014, 0.034, 0.004, body, 0, 0, 0.0, { seg: 2 });
  const scr = new THREE.MeshPhysicalMaterial({ color: 0x020203, roughness: 0.06, metalness: 0.0, clearcoat: 1, clearcoatRoughness: 0.03, reflectivity: 0.6 });
  bx(g, -w / 2, -h / 2, 0.016, w / 2, h / 2, 0.019, scr, { cast: false });
  return g;
}
/** half-round vertical flutes on a wall (front faces +Z). z = wall face. */
export function flutedPanel(parent, { x0, x1, y0, y1, z, pitch = 0.05, mat, backMat = null, relief = null, horizontal = false }) {
  const rad = pitch / 2 * 0.94, n = Math.floor((horizontal ? (y1 - y0) : (x1 - x0)) / pitch), len = horizontal ? x1 - x0 : y1 - y0, geos = [];
  for (let i = 0; i < n; i++) {
    const g = new THREE.CylinderGeometry(rad, rad, len, 10, 1, false, -Math.PI / 2, Math.PI); // faces +z
    if (horizontal) { g.rotateZ(Math.PI / 2); g.translate((x0 + x1) / 2, y0 + pitch * (i + 0.5), z); } else g.translate(x0 + pitch * (i + 0.5), (y0 + y1) / 2, z);
    geos.push(g);
  }
  const mg = mergeGeometries(geos); triUV(mg, mat.userData.tileM || 1); const m = new THREE.Mesh(mg, mat); m.castShadow = true; m.receiveShadow = true; parent.add(m);
  if (backMat) bx(parent, x0, y0, z - 0.012, x1, y1, z, backMat);
  void relief; return m;
}
/** cabinet fronts grid with gaps; cols/rows are relative sizes. matFn(i,j)->material. Returns group */
export function frontGrid(parent, { x0, x1, y0, y1, z, t = 0.02, cols = [1], rows = [1], mat, matFn = null, gap = 0.004, carcass = null, depth = 0.5, slot = null, back = 'z+' }) {
  const g = new THREE.Group(); parent.add(g); const cs = cols.reduce((a, b) => a + b, 0), rs = rows.reduce((a, b) => a + b, 0), cm = carcass || T.solid(0x0f0f10, { roughness: 0.9 });
  bx(g, x0, y0, z - depth, x1, y1, z, cm);
  let cx = x0; cols.forEach((cwid, i) => { const w = ((x1 - x0) * cwid) / cs; let cy = y1; rows.forEach((rh, j) => { const hh = ((y1 - y0) * rh) / rs, m = matFn ? matFn(i, j) : mat; bx(g, cx + gap / 2, cy - hh + gap / 2, z, cx + w - gap / 2, cy - gap / 2, z + t, m); if (slot) bx(g, cx + gap / 2, cy - gap / 2 - 0.028, z + t - 0.004, cx + w - gap / 2, cy - gap / 2 - 0.014, z + t + 0.001, slot, { cast: false }); cy -= hh; }); cx += w; });
  void back; return g;
}
export function floorLampArc({ h = 2.0, reach = 0.95, baseMat = null, brass = null, shade = 0xf1e6d2, lum = 3.2 } = {}) {
  const g = new THREE.Group(), bm = baseMat || marbleMat({ base: 0xf0ece4, slab: 0.4, n: 1, seed: 71 }), br = brass || brassMat(0xc2a050, 0.25);
  cylY(g, 0, 0, 0, 0.19, 0.2, 0.05, bm, { seg: 40 }); cylY(g, 0, 0.05, 0, 0.012, 0.012, h * 0.62, br, { seg: 12 });
  const curve = new THREE.CatmullRomCurve3([new THREE.Vector3(0, h * 0.6, 0), new THREE.Vector3(reach * 0.05, h * 0.92, 0), new THREE.Vector3(reach * 0.45, h * 1.08, 0), new THREE.Vector3(reach * 0.95, h * 0.98, 0)]);
  const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 36, 0.011, 8), br); tube.castShadow = true; g.add(tube);
  const sx = reach * 0.95, sy = h * 0.98 - 0.0; const sm = new THREE.MeshStandardMaterial({ color: shade, emissive: 0xffd9a0, emissiveIntensity: lum * 0.35, roughness: 0.8, side: THREE.DoubleSide }); sm.userData.tileM = 1;
  const dome = new THREE.Mesh(new THREE.SphereGeometry(0.2, 32, 16, 0, TAU, 0, Math.PI * 0.55), sm); dome.position.set(sx, sy - 0.08, 0); dome.castShadow = false; g.add(dome);
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.035, 12, 8), T.emissive(0xffe2b0, 16)); bulb.position.set(sx, sy - 0.1, 0); noAO(bulb); g.add(bulb);
  point(g, sx, sy - 0.15, 0, 0xffd7a0, lum * 2.2, 7, 1.7); halo(g, [sx, sy - 0.18, 0], 0.8, 0xffd9a0, 0.45);
  return g;
}
export function tableLamp({ h = 0.5, baseMat = null, shadeW = 0.34, shadeH = 0.24, lum = 2.2, color = 0xffd7a0, shade = 0xf2e8d5, light = true, kind = 'gourd', brass = null } = {}) {
  const g = new THREE.Group(), bm = baseMat || ceramicMat(0xe8dfd0, 0.2), br = brass || brassMat(0xc2a050, 0.28), by = h - shadeH * 0.55;
  if (kind === 'gourd') lathe(g, [[0.001, 0], [0.07, 0.003], [0.095, by * 0.3], [0.085, by * 0.55], [0.03, by * 0.82], [0.016, by], [0.012, by]], bm, 0, 0, 0, { seg: 36 });
  else { cylY(g, 0, 0, 0, 0.07, 0.075, 0.025, br); cylY(g, 0, 0.025, 0, 0.012, 0.012, by - 0.025, br, { seg: 10 }); }
  const sm = new THREE.MeshStandardMaterial({ color: shade, emissive: color, emissiveIntensity: lum * 0.28, roughness: 0.85, side: THREE.DoubleSide }); sm.userData.tileM = 1;
  const sh = new THREE.Mesh(new THREE.CylinderGeometry(shadeW * 0.42, shadeW * 0.5, shadeH, 40, 1, true), sm); sh.position.y = by + shadeH * 0.5; sh.castShadow = false; g.add(sh);
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.03, 12, 8), T.emissive(color, 14)); bulb.position.y = by + shadeH * 0.45; noAO(bulb); g.add(bulb);
  if (light) point(g, 0, by + shadeH * 0.5, 0, color, lum * 2.0, 5, 1.8);
  halo(g, [0, by + shadeH * 0.5, 0], shadeW * 3.0, color, 0.4);
  return g;
}

/** wall sconce (faces +Z, local). up/down washes on the wall */
export function sconce(parent, { x, y, z, rotY = 0, color = 0xffd49a, lum = 5, up = true, down = true, wash = 0.7 }) {
  const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = rotY; parent.add(g); const br = brassMat(0xc2a050, 0.28);
  bx(g, -0.035, -0.11, 0, 0.035, 0.11, 0.014, br);
  const sm = new THREE.MeshStandardMaterial({ color: 0xf1e8d6, emissive: color, emissiveIntensity: lum * 0.3, roughness: 0.8, side: THREE.DoubleSide }); sm.userData.tileM = 1;
  const sh = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.2, 20, 1, true, -Math.PI / 2, Math.PI), sm); sh.position.set(0, 0, 0.05); g.add(sh); noAO(sh);
  bx(g, -0.05, 0.1, 0.0, 0.05, 0.108, 0.1, br); bx(g, -0.05, -0.108, 0.0, 0.05, -0.1, 0.1, br);
  if (down) glow(g, { kind: 'scallop', w: 0.8, h: 1.0, color, intensity: wash, pos: [0, -0.6, 0.006] });
  if (up) glow(g, { kind: 'scallop', w: 0.8, h: 1.0, color, intensity: wash, pos: [0, 0.6, 0.006], rot: [0, 0, Math.PI] });
  point(g, 0, 0, 0.25, color, lum * 0.25, 4, 1.8); return g;
}

/* ------------------------------------------------------------------ bedroom */
/** bed facing +Z (foot toward +Z), headboard at z = -l/2 */
export function bed({ w = 1.85, l = 2.1, wood, linen, duvet, band = null, throwMat = null, headFab, pillowMat, accent = [], seed = 1, led = 0xffc98a } = {}) {
  const g = new THREE.Group(), lm = duvet || linen;
  rbox(g, w + 0.24, 0.22, l + 0.12, 0.03, wood, 0, 0.17, 0.0);                               // platform
  bx(g, -(w + 0.2) / 2, 0.04, -l / 2, (w + 0.2) / 2, 0.06, l / 2 + 0.04, T.emissive(led, 2.2), { cast: false });
  glow(g, { kind: 'shadow', w: w + 1.1, h: l + 1.1, color: led, intensity: 0.55, pos: [0, 0.012, 0.0], rot: [-Math.PI / 2, 0, 0] });
  rbox(g, w, 0.26, l, 0.06, linen, 0, 0.41, 0.0);                                                // mattress
  const top = 0.54;
  softBox(g, w + 0.04, 0.14, l * 0.74, lm, 0, top + 0.05, l * 0.13 + 0.02, { r: 0.05, seg: [30, 6, 40], bulge: { y: 0.025 }, wrinkle: 0.012, wfreq: 7, seed, tile: 0.5 });
  for (const sx of [-1, 1]) softBox(g, 0.06, 0.34, l * 0.72, lm, sx * (w / 2 + 0.005), 0.42, l * 0.13 + 0.02, { r: 0.025, seg: [4, 10, 30], wrinkle: 0.0, seed: seed + 2, bulge: { x: 0.015 }, tile: 0.5 });
  softBox(g, w + 0.0, 0.05, 0.62, band || linen, 0, top + 0.115, -l / 2 + 0.78, { r: 0.02, seg: [24, 3, 12], bulge: { y: 0.01 }, wrinkle: 0.006, seed: seed + 1, tile: 0.5 });
  if (throwMat) softBox(g, w * 0.98, 0.05, 0.55, throwMat, 0, top + 0.13, l / 2 - 0.34, { r: 0.02, seg: [24, 3, 12], bulge: { y: 0.01 }, wrinkle: 0.01, seed: seed + 5, tile: 0.4 });
  // pillows
  const pw = w / 2 - 0.05;
  for (const sx of [-1, 1]) {
    pillow(g, 0.68, 0.46, pillowMat, sx * pw * 0.5, 0.84, -l / 2 + 0.3, { thick: 0.16, rotX: -1.15, rotZ: sx * 0.04, seed: seed + 10 });
    pillow(g, 0.62, 0.42, pillowMat, sx * pw * 0.5, 0.74, -l / 2 + 0.52, { thick: 0.15, rotX: -1.0, rotZ: -sx * 0.05, seed: seed + 11 });
  }
  accent.forEach((a, i) => pillow(g, a.w ?? 0.5, a.h ?? 0.3, a.mat, a.x ?? 0, a.y ?? 0.78, a.z ?? -l / 2 + 0.7, { thick: 0.12, rotX: a.rotX ?? -0.9, rotZ: a.rotZ ?? 0, seed: seed + 20 + i }));
  // upholstered headboard with vertical channels
  const hbW = w + 0.9, n = 9, cwid = hbW / n;
  bx(g, -hbW / 2 - 0.05, 0.1, -l / 2 - 0.12, hbW / 2 + 0.05, 1.75, -l / 2 - 0.06, wood);
  for (let i = 0; i < n; i++) softBox(g, cwid - 0.012, 1.15, 0.09, headFab, -hbW / 2 + cwid * (i + 0.5), 1.12, -l / 2 - 0.0, { r: 0.04, seg: [6, 18, 3], bulge: { z: 0.05 }, seed: seed + 30 + i, tile: 0.5 });
  return g;
}
export function nightstand({ wood, w = 0.5, d = 0.4, y = 0.3, h = 0.34, brass = null, stone = null } = {}) {
  const g = new THREE.Group(), bm = brass || brassMat(0xc2a050, 0.28);
  I_frontGrid(g, { x0: -w / 2, x1: w / 2, y0: y, y1: y + h, z: d / 2 - 0.02, t: 0.02, cols: [1], rows: [1, 1], mat: wood, depth: d - 0.04, carcass: wood, gap: 0.006 });
  bx(g, -w / 2 - 0.01, y + h, -d / 2, w / 2 + 0.01, y + h + 0.025, d / 2, stone || wood);
  for (const k of [0.25, 0.75]) bx(g, -0.07, y + h * (1 - k) - 0.003, d / 2, 0.07, y + h * (1 - k) + 0.003, d / 2 + 0.02, bm);
  return g;
}
function I_frontGrid(...a) { return frontGrid(...a); }
/** moulded wall panelling (shaker boxes) */
export function wallMoulding(parent, { x0, x1, y0, y1, z, cols = 3, gap = 0.12, t = 0.02, mat, face = '+z', rows = 1 }) {
  const cw = (x1 - x0 - gap * (cols + 1)) / cols, rh = (y1 - y0 - gap * (rows + 1)) / rows;
  for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) {
    const xa = x0 + gap + i * (cw + gap), ya = y0 + gap + j * (rh + gap), m = 0.03;
    bx(parent, xa, ya, z, xa + cw, ya + m, z + t, mat); bx(parent, xa, ya + rh - m, z, xa + cw, ya + rh, z + t, mat); bx(parent, xa, ya, z, xa + m, ya + rh, z + t, mat); bx(parent, xa + cw - m, ya, z, xa + cw, ya + rh, z + t, mat);
  }
}
/** floor-to-ceiling wardrobe wall. front plane at z, spans x0..x1 (faces +Z). */
export function wardrobeWall(parent, { x0, x1, y1, z, cols = 6, wood, fab = null, brass = null, depth = 0.6 }) {
  const bm = brass || brassMat(0xc2a050, 0.28), g = new THREE.Group(); parent.add(g);
  frontGrid(g, { x0, x1, y0: 0.0, y1, z, t: 0.022, cols: Array(cols).fill(1), rows: [1], matFn: (i) => (i % 3 === 1 && fab ? fab : wood), depth, carcass: T.solid(0x15110e, { roughness: 0.9 }), gap: 0.005 });
  const cw = (x1 - x0) / cols;
  for (let i = 0; i < cols; i++) { const xx = x0 + cw * i + (i % 2 ? 0.06 : cw - 0.06); bx(g, xx - 0.008, 0.9, z + 0.02, xx + 0.008, 1.5, z + 0.04, bm); }
  bx(g, x0, y1 - 0.02, z + 0.02, x1, y1, z + 0.03, T.emissive(0xffc98a, 2.5), { cast: false });
  return g;
}

/* ------------------------------------------------------------------ dining */
export function diningChair({ fabric, wood, brass = null, seed = 1 } = {}) {
  const g = new THREE.Group(), bm = brass || brassMat(0xc2a050, 0.28);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) { rod(g, [sx * 0.2, 0, sz * 0.2], [sx * 0.19, 0.44, sz * 0.19], 0.014, wood, { seg: 10 }); const c = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.012, 10), bm); c.position.set(sx * 0.2, 0.006, sz * 0.2); g.add(c); }
  rbox(g, 0.46, 0.035, 0.46, 0.012, wood, 0, 0.43, 0);
  softBox(g, 0.46, 0.07, 0.46, fabric, 0, 0.485, 0.0, { r: 0.03, bulge: { y: 0.02 }, seed, seg: [10, 4, 10] });
  for (const sx of [-1, 1]) rod(g, [sx * 0.2, 0.44, -0.2], [sx * 0.19, 0.88, -0.25], 0.013, wood, { seg: 8 });
  softBox(g, 0.46, 0.38, 0.06, fabric, 0, 0.7, -0.235, { r: 0.028, bulge: { z: 0.02 }, seed: seed + 1, rotX: -0.1, seg: [10, 8, 3] });
  return g;
}
export function diningTable({ w = 2.3, d = 1.05, h = 0.76, top, base, brass = null } = {}) {
  const g = new THREE.Group(), bm = brass || brassMat(0xc2a050, 0.28);
  rbox(g, w, 0.045, d, 0.012, top, 0, h - 0.0225, 0);
  for (const sx of [-1, 1]) { rbox(g, 0.1, h - 0.05, d * 0.72, 0.02, base, sx * (w / 2 - 0.55), (h - 0.05) / 2, 0); bx(g, sx * (w / 2 - 0.55) - 0.052, 0, -d * 0.36, sx * (w / 2 - 0.55) + 0.052, 0.012, d * 0.36, bm); }
  bx(g, -(w / 2 - 0.55), h * 0.45, -0.015, w / 2 - 0.55, h * 0.45 + 0.02, 0.015, base);
  return g;
}
export function chandelierGlobes({ x, z, y, n = 9, r = 0.55, ceilY, lum = 12, color = 0xffd9a8, globe = 0.08, light = true }) {
  const g = new THREE.Group(); g.position.set(x, y, z); const bm = brassMat(0xc7a252, 0.22), em = T.emissive(color, lum), gm = glassMat({ tint: 0xfff3dc, opacity: 0.25, rough: 0.05 });
  const top = ceilY - y; rod(g, [0, 0, 0], [0, top, 0], 0.01, bm, { seg: 8 }); cylY(g, 0, top - 0.02, 0, 0.1, 0.1, 0.04, bm);
  for (let i = 0; i < n; i++) { const a = (i / n) * TAU, rr = r * (0.55 + 0.45 * ((i * 7) % 3) / 2), yy = -0.15 - ((i * 5) % 4) * 0.12; const curve = new THREE.QuadraticBezierCurve3(new THREE.Vector3(0, 0, 0), new THREE.Vector3(Math.cos(a) * rr * 0.6, 0.12, Math.sin(a) * rr * 0.6), new THREE.Vector3(Math.cos(a) * rr, yy, Math.sin(a) * rr));
    const tb = new THREE.Mesh(new THREE.TubeGeometry(curve, 16, 0.006, 6), bm); tb.castShadow = true; g.add(tb);
    const b = new THREE.Mesh(new THREE.SphereGeometry(globe * 0.45, 12, 8), em); b.position.set(Math.cos(a) * rr, yy - 0.02, Math.sin(a) * rr); noAO(b); g.add(b);
    const gl = new THREE.Mesh(new THREE.SphereGeometry(globe, 20, 14), gm); gl.position.copy(b.position); noAO(gl); g.add(gl); }
  if (light) point(g, 0, -0.5, 0, color, lum * 0.5, 8, 1.8); halo(g, [0, -0.3, 0], r * 3.2, color, 0.5);
  return g;
}
export function displayCabinet({ w = 1.6, h = 2.2, d = 0.45, wood, glass = null, shelves = 4, seed = 1 } = {}) {
  const g = new THREE.Group(), gl = glass || glassMat({ opacity: 0.1 }), t = 0.03, inner = T.solid(0x2a211a, { roughness: 0.9 });
  bx(g, -w / 2, 0, -d, w / 2, 0.12, 0, wood); bx(g, -w / 2, h - 0.04, -d, w / 2, h, 0, wood); bx(g, -w / 2, 0.12, -d, -w / 2 + t, h - 0.04, 0, wood); bx(g, w / 2 - t, 0.12, -d, w / 2, h - 0.04, 0, wood); bx(g, -w / 2, 0.12, -d, w / 2, h - 0.04, -d + 0.02, inner);
  const lowH = 0.8; bx(g, -w / 2, 0.12, -d, w / 2, lowH, 0, wood); // lower cupboard doors
  frontGrid(g, { x0: -w / 2, x1: w / 2, y0: 0.12, y1: lowH, z: 0.0, t: 0.02, cols: [1, 1, 1], mat: wood, depth: 0.02, carcass: wood, gap: 0.005 });
  const rr = rng(seed), plateM = ceramicMat(0xf1eee6, 0.1), rimM = ceramicMat(0xc9a24d, 0.2), gm2 = glassMat({ tint: 0xeaf3f5, opacity: 0.3, rough: 0.03 });
  const top = h - 0.06, sh = (top - lowH) / shelves;
  for (let s = 0; s <= shelves; s++) { const yy = lowH + sh * s; if (s > 0 && s < shelves) bx(g, -w / 2 + t, yy, -d + 0.02, w / 2 - t, yy + 0.015, -0.03, gl.clone()); bx(g, -w / 2 + t, yy + 0.01, -d + 0.03, w / 2 - t, yy + 0.014, -d + 0.05, T.emissive(0xffd49a, 4), { cast: false });
    if (s < shelves) { const base = yy + (s > 0 ? 0.015 : 0.0);
      if (s % 2 === 0) for (let k = 0; k < 6; k++) { const px = -w / 2 + 0.2 + k * (w - 0.4) / 5; const pl = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.07, 0.012, 28), plateM); pl.rotation.x = -1.35; pl.position.set(px, base + 0.12, -d + 0.07); pl.castShadow = true; g.add(pl); const rm = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.004, 6, 28), rimM); rm.rotation.x = -1.35; rm.position.set(px, base + 0.12, -d + 0.073); g.add(rm); }
      else for (let k = 0; k < 7; k++) { const px = -w / 2 + 0.15 + k * (w - 0.3) / 6; lathe(g, [[0.001, 0], [0.03, 0.002], [0.032, 0.02], [0.012, 0.1], [0.012, 0.13], [0.04, 0.2], [0.043, 0.22], [0.037, 0.22]], k % 2 ? gm2 : ceramicMat(k % 3 ? 0xd9cdb6 : 0x2f5d62, 0.2), px, base, -d + 0.2 - rr() * 0.05, { seg: 20 }); } } }
  // glass doors
  bx(g, -w / 2 + t, lowH, -0.01, w / 2 - t, top, 0.0, gl, { cast: false });
  for (let k = 0; k <= 2; k++) bx(g, -w / 2 + t + k * (w - 2 * t) / 2 - 0.015, lowH, -0.02, -w / 2 + t + k * (w - 2 * t) / 2 + 0.015, top, 0.012, brassMat(0xc2a050, 0.3));
  return g;
}
/** wall with an arch-top recess (niche). faces +Z; front face at z. Returns group; shelf/back material given */
export function archNiche(parent, { x, y0, w, h, z, depth = 0.22, wallMat, backMat, wallX0, wallX1, wallY1, led = 0xffc98a }) {
  const g = new THREE.Group(); parent.add(g), r0();
  function r0() {}
  const sh = new THREE.Shape(); sh.moveTo(wallX0, 0); sh.lineTo(wallX1, 0); sh.lineTo(wallX1, wallY1); sh.lineTo(wallX0, wallY1); sh.lineTo(wallX0, 0);
  const hole = new THREE.Path(), x0 = x - w / 2, x1 = x + w / 2, rr = w / 2; hole.moveTo(x0, y0); hole.lineTo(x1, y0); hole.lineTo(x1, y0 + h - rr); hole.absarc(x, y0 + h - rr, rr, 0, Math.PI, false); hole.lineTo(x0, y0); sh.holes.push(hole);
  const geo = new THREE.ExtrudeGeometry(sh, { depth, bevelEnabled: false, curveSegments: 32 }); geo.translate(0, 0, z); triUV(geo, wallMat.userData.tileM || 3);
  const m = new THREE.Mesh(geo, wallMat); m.castShadow = true; m.receiveShadow = true; g.add(m);
  bx(g, x0, y0, z - 0.01, x1, y0 + h, z + 0.004, backMat);
  const arc = new THREE.Shape(); arc.absarc(x, y0 + h - rr, rr, 0, Math.PI, false); const ag = new THREE.ShapeGeometry(arc, 32); ag.translate(0, 0, z + 0.0045); const am = new THREE.Mesh(ag, backMat); g.add(am);
  const lm = T.emissive(led, 3.5); bx(g, x0 + 0.01, y0 + 0.02, z + 0.01, x1 - 0.01, y0 + 0.03, z + depth - 0.04, lm, { cast: false });
  glow(g, { kind: 'scallop', w: w * 1.1, h: h * 0.9, color: led, intensity: 0.7, pos: [x, y0 + h * 0.5 + 0.15, z + 0.007] });
  return g;
}

/* ------------------------------------------------------------------ kitchen */
export function baseCabinets(parent, { x0, x1, z, depth = 0.6, h = 0.86, toe = 0.1, mat, counter, cols = [1, 1, 1], rows = [1], thick = 0.03, over = 0.03, slot = 0.0, matFn = null, sideBack = false }) {
  const g = new THREE.Group(); parent.add(g), sideBack;
  const dark = T.solid(0x141414, { roughness: 0.8 });
  bx(g, x0 + 0.02, 0, z - depth + 0.04, x1 - 0.02, toe, z - 0.06, dark);
  frontGrid(g, { x0, x1, y0: toe, y1: h - thick, z: z - 0.02, t: 0.02, cols, rows, mat, matFn, gap: 0.005, carcass: mat, depth: depth - 0.02, slot: slot ? dark : null });
  bx(g, x0 - 0.0, h - thick, z - depth, x1, h, z + over, counter);
  return g;
}
export function hob(parent, { x, y, z, w = 0.6, d = 0.52 }) {
  const g = new THREE.Group(); g.position.set(x, y, z); parent.add(g);
  const glass = new THREE.MeshPhysicalMaterial({ color: 0x07080a, roughness: 0.08, clearcoat: 1, clearcoatRoughness: 0.05 }); glass.userData.tileM = 1;
  bx(g, -w / 2, 0, -d / 2, w / 2, 0.012, d / 2, glass); const ring = blackMetal(0x3a3b3d, 0.4);
  for (const [px, pz, r] of [[-w * 0.24, -d * 0.22, 0.09], [w * 0.24, -d * 0.22, 0.07], [-w * 0.24, d * 0.2, 0.07], [w * 0.24, d * 0.2, 0.1]]) { torus(g, r, 0.003, ring, px, 0.014, pz, { rx: Math.PI / 2, seg: 36, tseg: 6 }); torus(g, r * 0.55, 0.0025, ring, px, 0.014, pz, { rx: Math.PI / 2, seg: 28, tseg: 6 }); }
  return g;
}
export function chimneyHood(parent, { x, y, z, w = 0.9, d = 0.5, top = 2.95, mat }) {
  const g = new THREE.Group(); g.position.set(x, y, z); parent.add(g);
  const c = new THREE.CylinderGeometry(w * 0.2, w * 0.72, 0.34, 4, 1); c.rotateY(Math.PI / 4); c.scale(1, 1, d / w); const m = new THREE.Mesh(c, mat); m.position.y = 0.17; m.castShadow = true; g.add(m);
  bx(g, -0.17, 0.3, -0.15, 0.17, top - y, 0.15, mat);
  const led = T.emissive(0xfff0d0, 3); bx(g, -w * 0.3, 0.005, -d * 0.2, w * 0.3, 0.012, d * 0.2, led, { cast: false });
  return g;
}
export function tap(parent, { x, y, z, mat = null, h = 0.3, reach = 0.2 }) {
  const bm = mat || brassMat(0xc2a050, 0.22), g = new THREE.Group(); g.position.set(x, y, z); parent.add(g);
  cylY(g, 0, 0, 0, 0.022, 0.026, 0.05, bm);
  const curve = new THREE.CatmullRomCurve3([new THREE.Vector3(0, 0.05, 0), new THREE.Vector3(0, h * 0.8, 0), new THREE.Vector3(0, h, reach * 0.3), new THREE.Vector3(0, h * 0.92, reach)]);
  const t = new THREE.Mesh(new THREE.TubeGeometry(curve, 24, 0.011, 8), bm); t.castShadow = true; g.add(t); rod(g, [0.0, 0.05, 0.04], [0.04, 0.12, 0.04], 0.007, bm); return g;
}
export function barStool({ seat, legs, h = 0.68, r = 0.19 } = {}) {
  const g = new THREE.Group();
  softBox(g, r * 2, 0.07, r * 2, seat, 0, h, 0, { r: 0.034, seg: [10, 4, 10], bulge: { y: 0.015 } });
  for (let i = 0; i < 4; i++) { const a = (i / 4) * TAU + Math.PI / 4; rod(g, [Math.cos(a) * r * 0.8, 0, Math.sin(a) * r * 0.8], [Math.cos(a) * r * 0.55, h - 0.03, Math.sin(a) * r * 0.55], 0.013, legs, { seg: 8 }); }
  torus(g, r * 0.72, 0.008, legs, 0, h * 0.38, 0, { rx: Math.PI / 2, seg: 32, tseg: 6 }); return g;
}

/* ------------------------------------------------------------------ bathroom */
export function roundMirror(parent, { x, y, z, r = 0.38, rotY = 0, color = 0xffe4bc, lum = 4 }) {
  const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = rotY; parent.add(g);
  const md = new THREE.Mesh(new THREE.CircleGeometry(r, 64), mirrorMat(0xdfe6e8)); md.position.z = 0.02; md.receiveShadow = true; g.add(md);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(r + 0.012, 0.012, 8, 64), T.emissive(color, lum)); ring.position.z = 0.016; noAO(ring); g.add(ring);
  torus(g, r + 0.03, 0.008, blackMetal(0x151515, 0.4), 0, 0, 0.02, { rx: 0, seg: 64, tseg: 6 });
  glow(g, { kind: 'radial', w: r * 4.2, h: r * 4.2, color, intensity: 0.5, pos: [0, 0, 0.012] });
  return g;
}
export function vanity({ w = 1.2, d = 0.48, y = 0.45, h = 0.45, wood, top, basin = true, brass = null } = {}) {
  const g = new THREE.Group(), bm = brass || brassMat(0xc2a050, 0.25);
  frontGrid(g, { x0: -w / 2, x1: w / 2, y0: y, y1: y + h, z: d / 2 - 0.02, t: 0.02, cols: [1, 1], rows: [1, 1], mat: wood, depth: d - 0.02, carcass: wood, gap: 0.005 });
  bx(g, -w / 2 - 0.015, y + h, -d / 2, w / 2 + 0.015, y + h + 0.03, d / 2 + 0.01, top);
  bx(g, -w / 2 + 0.05, y - 0.02, -d / 2 + 0.03, w / 2 - 0.05, y, d / 2 - 0.1, T.emissive(0xffc98a, 3), { cast: false });
  glow(g, { kind: 'shadow', w: w + 0.8, h: d + 0.9, color: 0xffc98a, intensity: 0.4, pos: [0, 0.01, 0.1], rot: [-Math.PI / 2, 0, 0] });
  for (const k of [0.25, 0.75]) bx(g, -0.1 + (k - 0.5) * 0.0 + (k < 0.5 ? -w / 4 : w / 4) - 0.1, y + h * 0.5 + 0.18, d / 2, (k < 0.5 ? -w / 4 : w / 4) + 0.1, y + h * 0.5 + 0.185, d / 2 + 0.022, bm);
  if (basin) { const bsn = ceramicMat(0xf6f4f0, 0.08); lathe(g, [[0.001, 0], [0.12, 0.003], [0.17, 0.05], [0.2, 0.12], [0.195, 0.125], [0.17, 0.1], [0.1, 0.06], [0.001, 0.05]], bsn, 0, y + h + 0.03, 0.0, { seg: 40 }); }
  return g;
}
export function showerGlass(parent, { x0, x1, z0, z1, h = 2.1, frame = null }) {
  const g = new THREE.Group(); parent.add(g); const fm = frame || blackMetal(0x121212, 0.4), gl = glassMat({ opacity: 0.1 });
  const pane = (xa, za, xb, zb) => { const dx = xb - xa, dz = zb - za, len = Math.hypot(dx, dz), m = new THREE.Mesh(new THREE.PlaneGeometry(len, h), gl); m.position.set((xa + xb) / 2, h / 2, (za + zb) / 2); m.rotation.y = -Math.atan2(dz, dx); noAO(m); m.renderOrder = 1; g.add(m);
    bx(g, Math.min(xa, xb) - 0.012, 0, Math.min(za, zb) - 0.012, Math.max(xa, xb) + 0.012, 0.03, Math.max(za, zb) + 0.012, fm); bx(g, Math.min(xa, xb) - 0.012, h - 0.02, Math.min(za, zb) - 0.012, Math.max(xa, xb) + 0.012, h, Math.max(za, zb) + 0.012, fm); };
  pane(x0, z1, x1, z1); pane(x1, z1, x1, z0);
  for (const [xx, zz] of [[x0, z1], [x1, z1], [x1, z0]]) bx(g, xx - 0.012, 0, zz - 0.012, xx + 0.012, h, zz + 0.012, fm);
  bx(g, x0 + 0.3, 0.9, z1 - 0.012, x0 + 0.34, 1.0, z1 + 0.05, blackMetal(0x121212, 0.3));
  return g;
}
export function rainShower(parent, { x, y, z, wallZ, mat = null }) {
  const bm = mat || blackMetal(0x141414, 0.35), g = new THREE.Group(); g.position.set(x, y, z); parent.add(g);
  cylY(g, 0, -0.01, 0, 0.18, 0.18, 0.02, bm, { seg: 40 }); rod(g, [0, 0, 0], [0, 0.0, wallZ - z], 0.012, bm, { seg: 8 }); return g;
}
export function towelRail(parent, { x, y, z, h = 1.2, w = 0.5, mat = null, towel = null, rotY = 0 }) {
  const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = rotY; parent.add(g); const bm = mat || blackMetal(0x141414, 0.35);
  for (const sx of [-1, 1]) rod(g, [sx * w / 2, 0, 0.05], [sx * w / 2, h, 0.05], 0.012, bm, { seg: 8 });
  const n = Math.round(h / 0.16); for (let i = 0; i < n; i++) rod(g, [-w / 2, 0.1 + i * (h - 0.15) / (n - 1), 0.05], [w / 2, 0.1 + i * (h - 0.15) / (n - 1), 0.05], 0.008, bm, { seg: 6 });
  if (towel) { softBox(g, w * 0.9, 0.3, 0.05, towel, 0, h * 0.6, 0.085, { r: 0.02, seg: [14, 8, 3], wrinkle: 0.01, seed: 3, tile: 0.3 }); softBox(g, w * 0.9, 0.3, 0.05, towel, 0, h * 0.3, 0.085, { r: 0.02, seg: [14, 8, 3], wrinkle: 0.01, seed: 4, tile: 0.3 }); }
  return g;
}
export function toiletWall({ mat = null } = {}) {
  const g = new THREE.Group(), c = mat || ceramicMat(0xf7f5f1, 0.06);
  rbox(g, 0.37, 0.4, 0.44, 0.1, c, 0, 0.4, 0.2); rbox(g, 0.4, 0.04, 0.5, 0.02, ceramicMat(0xfbfaf8, 0.2), 0, 0.605, 0.22);
  rbox(g, 0.4, 1.0, 0.18, 0.03, c, 0, 0.7, -0.1); bx(g, -0.07, 0.95, -0.005, 0.07, 1.0, 0.005, brassMat(0xc2a050, 0.3)); return g;
}

// <<END-PART4>>
