// agent5 kit: higher-fidelity building details (windows with real interiors, glass, railings, AC units, decals, lamps ...).
// Everything here is additive: it only imports the shared libs, it never changes them. Units: metres.
import * as THREE from 'three';
import { boxAt, roundBox, cyl, ground, T } from './arch.mjs';
import { rng, noiseArr } from './textures.mjs';

export { THREE, T, boxAt, roundBox, cyl, ground, rng, noiseArr };

// ------------------------------------------------------------------ canvas / texture helpers
export const cv = (w, h = w) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
export function ctex(c, { srgb = true, repeat = false, aniso = 8 } = {}) {
  const t = new THREE.CanvasTexture(c); t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace; t.anisotropy = aniso;
  if (repeat) t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
}
const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
export const smooth = (a, b, v) => { const t = clamp01((v - a) / (b - a)); return t * t * (3 - 2 * t); };
export const hex = (c) => '#' + new THREE.Color(c).getHexString();
export const mix = (a, b, t) => new THREE.Color(a).lerp(new THREE.Color(b), t);

// ------------------------------------------------------------------ environment binding (metals + glass need an explicit envMap:
// shared-lib materials ignore material.envMapIntensity when scene.environment is used)
let ENV = null;
export function bindEnv(env) { ENV = env; }
export function finish(scene, k = 1.5) {
  scene.traverse((o) => {
    const m = o.material; if (!m) return;
    for (const mm of Array.isArray(m) ? m : [m]) if (mm.isMeshStandardMaterial && mm.metalness > 0.25 && !mm.envMap && ENV) { mm.envMap = ENV; mm.envMapIntensity = k; mm.needsUpdate = true; }
  });
}
export function metalPro(color, { roughness = 0.35, metalness = 1, k = 1.6 } = {}) {
  const m = new THREE.MeshStandardMaterial({ color, roughness, metalness, envMap: ENV, envMapIntensity: k }); m.userData.tileM = 1; return m;
}
export function solid(color, o = {}) { return T.solid(color, o); }

// ------------------------------------------------------------------ plane helpers (UV 0..1 over the face unless tile given)
function wuv(geo, tile) {
  const pos = geo.attributes.position, nor = geo.attributes.normal, uv = geo.attributes.uv;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i), nx = Math.abs(nor.getX(i)), ny = Math.abs(nor.getY(i)), nz = Math.abs(nor.getZ(i));
    if (nx >= ny && nx >= nz) uv.setXY(i, z / tile, y / tile); else if (ny >= nx && ny >= nz) uv.setXY(i, x / tile, z / tile); else uv.setXY(i, x / tile, y / tile);
  }
  uv.needsUpdate = true;
}
/** Plane facing +Z (dir=1) or -Z (dir=-1) spanning x0..x1, y0..y1 at depth z. */
export function planeZ(x0, y0, x1, y1, z, mat, parent, { dir = 1, cast = false, receive = true, world = false } = {}) {
  const g = new THREE.PlaneGeometry(Math.abs(x1 - x0), Math.abs(y1 - y0)); if (dir < 0) g.rotateY(Math.PI); g.translate((x0 + x1) / 2, (y0 + y1) / 2, z);
  if (world) wuv(g, mat.userData.tileM || 1);
  const m = new THREE.Mesh(g, mat); m.castShadow = cast; m.receiveShadow = receive; parent?.add(m); return m;
}
/** Plane facing +X (dir=1) or -X spanning z0..z1, y0..y1 at x. */
export function planeX(x, y0, y1, z0, z1, mat, parent, { dir = 1, cast = false, receive = true, world = false } = {}) {
  const g = new THREE.PlaneGeometry(Math.abs(z1 - z0), Math.abs(y1 - y0)); g.rotateY(dir > 0 ? Math.PI / 2 : -Math.PI / 2); g.translate(x, (y0 + y1) / 2, (z0 + z1) / 2);
  if (world) wuv(g, mat.userData.tileM || 1);
  const m = new THREE.Mesh(g, mat); m.castShadow = cast; m.receiveShadow = receive; parent?.add(m); return m;
}
/** Horizontal plane facing up (dir=1) or down. */
export function planeY(y, x0, z0, x1, z1, mat, parent, { dir = 1, cast = false, receive = true, world = true } = {}) {
  const g = new THREE.PlaneGeometry(Math.abs(x1 - x0), Math.abs(z1 - z0)); g.rotateX(dir > 0 ? -Math.PI / 2 : Math.PI / 2); g.translate((x0 + x1) / 2, y, (z0 + z1) / 2);
  if (world) wuv(g, mat.userData.tileM || 1);
  const m = new THREE.Mesh(g, mat); m.castShadow = cast; m.receiveShadow = receive; parent?.add(m); return m;
}

// ------------------------------------------------------------------ decals (alpha-blended grime / seams / stains laid 4 mm off the surface)
export function decalMat(canvas, { opacity = 1, color = 0xffffff, order = 0 } = {}) {
  const m = new THREE.MeshStandardMaterial({ map: ctex(canvas), color, transparent: true, opacity, depthWrite: false, roughness: 1, metalness: 0, polygonOffset: true, polygonOffsetFactor: -2 - order, polygonOffsetUnits: -2 - order });
  m.userData.tileM = 1; return m;
}
/** Rain streaks / dirt running down a wall face (front facing +Z at depth z). */
export function wallStreaks({ x0, x1, y0, y1, z, seed = 1, alpha = 0.35, count = 60, color = '60,48,36', dir = 1 }, parent) {
  const W = 1024, H = Math.round(1024 * (y1 - y0) / (x1 - x0)) || 512, c = cv(W, Math.max(256, Math.min(2048, H))), x = c.getContext('2d'), r = rng(seed);
  x.clearRect(0, 0, c.width, c.height);
  for (let i = 0; i < count; i++) {
    const px = r() * c.width, len = c.height * (0.25 + r() * 0.75), w = 2 + r() * 14, a = alpha * (0.25 + r() * 0.75);
    const g = x.createLinearGradient(0, 0, 0, len); g.addColorStop(0, `rgba(${color},${a})`); g.addColorStop(0.55, `rgba(${color},${a * 0.5})`); g.addColorStop(1, `rgba(${color},0)`);
    x.fillStyle = g; x.beginPath(); x.moveTo(px, 0); x.lineTo(px + w, 0); x.lineTo(px + w * (0.3 + r() * 0.5), len); x.lineTo(px + w * 0.2, len); x.fill();
  }
  const g2 = x.createLinearGradient(0, 0, 0, c.height * 0.12); g2.addColorStop(0, `rgba(${color},${alpha * 0.9})`); g2.addColorStop(1, `rgba(${color},0)`); x.fillStyle = g2; x.fillRect(0, 0, c.width, c.height * 0.12);
  return planeZ(x0, y0, x1, y1, z + 0.004 * dir, decalMat(c), parent, { dir });
}
/** Dirt/splash band along the foot of a wall. */
export function wallFoot({ x0, x1, z, h = 0.5, seed = 2, alpha = 0.5, color = '70,58,44', dir = 1, y0 = 0 }, parent) {
  const c = cv(1024, 128), x = c.getContext('2d'), r = rng(seed), n = noiseArr(seed + 3, 1024, 5, 12); x.clearRect(0, 0, 1024, 128);
  const img = x.getImageData(0, 0, 1024, 128), d = img.data; const [cr, cg, cb] = color.split(',').map(Number);
  for (let j = 0; j < 128; j++) for (let i = 0; i < 1024; i++) { const t = j / 127, base = Math.pow(t, 1.4), nn = n[(j * 8 % 1024) * 1024 + (i % 1024)]; const a = alpha * base * (0.45 + nn * 0.9) * (0.7 + r() * 0.5); const k = (j * 1024 + i) * 4; d[k] = cr; d[k + 1] = cg; d[k + 2] = cb; d[k + 3] = Math.min(255, a * 255); }
  x.putImageData(img, 0, 0);
  return planeZ(x0, y0, x1, y0 + h, z + 0.004 * dir, decalMat(c), parent, { dir });
}
/** Irregular dirt / dust / stain blotches on the ground (horizontal decal). */
export function groundGrime({ x0, z0, x1, z1, y = 0.004, seed = 3, alpha = 0.35, color = [74, 62, 48], scale = 8, cutoff = 0.5, res = 1024, noiseM = 12, order = 1 }, parent) {
  // world-scale noise: one noise tile = noiseM metres (so patches are isotropic regardless of plane aspect)
  const W = x1 - x0, Hh = z1 - z0, rw = Math.min(4096, Math.max(64, Math.round(res * Math.min(1, W / Math.max(W, Hh))) || res)), rh = Math.min(4096, Math.max(64, Math.round(res * Math.min(1, Hh / Math.max(W, Hh))) || res));
  const cw = Math.max(rw, Math.round(res * W / Math.max(W, Hh))), ch = Math.max(rh, Math.round(res * Hh / Math.max(W, Hh)));
  const c = cv(Math.min(4096, cw), Math.min(4096, ch)), x = c.getContext('2d'), n = noiseArr(seed, 1024, 6, scale), img = x.createImageData(c.width, c.height), d = img.data;
  for (let j = 0; j < c.height; j++) for (let i = 0; i < c.width; i++) {
    const wx = (i / c.width) * W + x0, wz = (j / c.height) * Hh + z0, u = ((wx / noiseM) % 1 + 1) % 1, v = ((wz / noiseM) % 1 + 1) % 1;
    const val = n[((v * 1024) | 0) * 1024 + ((u * 1024) | 0)], a = smooth(cutoff, cutoff + 0.22, val) * alpha; const k = (j * c.width + i) * 4; d[k] = color[0]; d[k + 1] = color[1]; d[k + 2] = color[2]; d[k + 3] = a * 255;
  }
  x.putImageData(img, 0, 0);
  const m = decalMat(c, { order }); const g = new THREE.PlaneGeometry(W, Hh); g.rotateX(-Math.PI / 2); g.translate((x0 + x1) / 2, y, (z0 + z1) / 2);
  const me = new THREE.Mesh(g, m); me.receiveShadow = true; parent?.add(me); return me;
}

// ------------------------------------------------------------------ glass: tint layer + additive Fresnel reflection of the sky env
const _gc = new Map();
export function glassPair({ tint = 0x2a3c46, opacity = 0.34, refl = 1.6 } = {}) {
  const key = `${tint}/${opacity}/${refl}`; if (_gc.has(key)) return _gc.get(key);
  const t = new THREE.MeshStandardMaterial({ color: tint, transparent: true, opacity, roughness: 0.1, metalness: 0, depthWrite: false }); t.userData.tileM = 1;
  const r = new THREE.MeshPhysicalMaterial({ color: 0x000000, roughness: 0.03, metalness: 0, ior: 1.75, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, envMap: ENV, envMapIntensity: refl }); r.userData.tileM = 1;
  const p = { tint: t, refl: r }; _gc.set(key, p); return p;
}
export function glassPane(x0, y0, x1, y1, z, parent, opt = {}) {
  const { tint, refl } = glassPair(opt);
  planeZ(x0, y0, x1, y1, z, tint, parent); planeZ(x0, y0, x1, y1, z + 0.002, refl, parent);
}

// ------------------------------------------------------------------ room interiors behind a window (so windows have depth)
const _rm = new Map();
function rmat(key, f) { if (!_rm.has(key)) _rm.set(key, f()); return _rm.get(key); }
function glowTex() {
  return rmat('glowTex', () => { const c = cv(256), x = c.getContext('2d'); const g = x.createRadialGradient(128, 90, 8, 128, 128, 190); g.addColorStop(0, '#fff'); g.addColorStop(0.45, '#c9c9c9'); g.addColorStop(1, '#4a4a4a'); x.fillStyle = g; x.fillRect(0, 0, 256, 256); return ctex(c); });
}
function artTex(seed) {
  return rmat('art' + seed, () => { const c = cv(128, 96), x = c.getContext('2d'), r = rng(seed); x.fillStyle = '#d9cdb8'; x.fillRect(0, 0, 128, 96); for (let i = 0; i < 4; i++) { x.fillStyle = `hsl(${r() * 360},${30 + r() * 30}%,${35 + r() * 30}%)`; x.fillRect(r() * 90, r() * 60, 20 + r() * 60, 15 + r() * 40); } return ctex(c); });
}
export function room({ x, y, w, h, z, floorY = null, ceilY = null, depth = 4.4, side = 1.6, wall = 0xdad0bd, floor = 0x6f5238, ceil = 0xeeeae0, glow = 0, warm = 0xffc27a, seed = 1, furn = true, dim = 0.28, curtainSide = 0 }, parent) {
  const g = new THREE.Group(), r = rng(seed * 31 + 7), fy = floorY ?? y - 0.15, cy = ceilY ?? y + h + 0.35, zb = z - depth;
  const kd = glow ? 1 : dim, wc = new THREE.Color(wall).multiplyScalar(kd), fc = new THREE.Color(floor).multiplyScalar(kd), cc = new THREE.Color(ceil).multiplyScalar(kd);
  const wcol = new THREE.Color(wc).offsetHSL((r() - 0.5) * 0.03, 0, (r() - 0.5) * 0.06);
  const em = (k) => (glow ? { emissive: new THREE.Color(warm), emissiveMap: glowTex(), emissiveIntensity: glow * k } : {});
  const mWall = new THREE.MeshStandardMaterial({ color: wcol, roughness: 0.95, ...em(1.0) }), mSide = new THREE.MeshStandardMaterial({ color: wcol, roughness: 0.95, ...em(0.55) });
  const mFloor = new THREE.MeshStandardMaterial({ color: fc, roughness: 0.5, ...em(0.32) }), mCeil = new THREE.MeshStandardMaterial({ color: cc, roughness: 0.95, ...em(0.55) });
  const xa = x - side, xb = x + w + side;
  planeZ(xa, fy, xb, cy, zb, mWall, g); planeX(xa, fy, cy, zb, z, mSide, g, { dir: 1 }); planeX(xb, fy, cy, zb, z, mSide, g, { dir: -1 }); planeY(fy, xa, zb, xb, z, mFloor, g, { dir: 1, world: false }); planeY(cy, xa, zb, xb, z, mCeil, g, { dir: -1, world: false });
  if (furn) {
    const dark = new THREE.MeshStandardMaterial({ color: new THREE.Color(glow ? 0x2a2018 : 0x2c2924).multiplyScalar(glow ? 1 : kd + 0.3), roughness: 0.9 });
    const cloth = new THREE.MeshStandardMaterial({ color: new THREE.Color(r() > 0.5 ? 0x7d6a58 : 0x58626b).multiplyScalar(kd + 0.15), roughness: 0.95 });
    const sx = x + w * (0.2 + r() * 0.5);
    if (w > 1.0) {
      boxAt(sx - 0.9, fy, zb + 0.15, sx + 0.9, fy + 0.42, zb + 0.95, cloth, g, { cast: false }); boxAt(sx - 0.9, fy + 0.42, zb + 0.12, sx + 0.9, fy + 0.85, zb + 0.32, cloth, g, { cast: false });
      boxAt(sx - 0.4, fy, zb + 1.35, sx + 0.4, fy + 0.34, zb + 1.85, dark, g, { cast: false });
      const art = new THREE.MeshStandardMaterial({ map: artTex(seed + 3), roughness: 0.8, emissive: glow ? 0xffffff : 0x000000, emissiveMap: glow ? artTex(seed + 3) : null, emissiveIntensity: glow ? glow * 0.25 : 0 }); art.color.multiplyScalar(kd + 0.2);
      planeZ(sx - 0.55, fy + 1.15, sx + 0.55, fy + 1.9, zb + 0.015, art, g);
    }
    if (glow) { // pendant + floor lamp glow
      const lampM = new THREE.MeshStandardMaterial({ color: 0x222222, emissive: new THREE.Color(0xffe3b0), emissiveIntensity: 5, roughness: 0.6 });
      const px = x + w * (0.3 + r() * 0.4);
      cyl(px, cy - 0.55, z - depth * 0.45, 0.09, 0.22, 0.34, lampM, g, { seg: 14, cast: false }); cyl(px, cy - 0.2, z - depth * 0.45, 0.005, 0.005, 0.4, dark, g, { seg: 4, cast: false });
      cyl(xb - 0.5, fy + 1.45, zb + 0.7, 0.14, 0.2, 0.3, lampM, g, { seg: 14, cast: false }); cyl(xb - 0.5, fy + 0.7, zb + 0.7, 0.012, 0.012, 1.4, dark, g, { seg: 5, cast: false });
    }
  }
  parent?.add(g); return g;
}

/** Sheer curtain just behind the glass: vertical pleats, cream, translucent. */
const _cu = new Map();
function curtainMat(seed, tone) {
  const key = seed + '/' + tone; if (_cu.has(key)) return _cu.get(key);
  const c = cv(256, 64), x = c.getContext('2d'), r = rng(seed + 11); x.clearRect(0, 0, 256, 64);
  for (let i = 0; i < 256; i += 3) { const k = 0.5 + 0.5 * Math.sin(i * 0.33 + r() * 0.4); x.fillStyle = `rgba(${230 * (0.75 + 0.25 * k) | 0},${222 * (0.75 + 0.25 * k) | 0},${205 * (0.75 + 0.25 * k) | 0},${0.55 + 0.35 * k})`; x.fillRect(i, 0, 3, 64); }
  const m = new THREE.MeshStandardMaterial({ map: ctex(c), transparent: true, roughness: 1, depthWrite: false, color: new THREE.Color(tone) }); m.userData.tileM = 1; _cu.set(key, m); return m;
}

/**
 * Window in a wall opening. (x,y,w,h) opening rect; z = wall front face; sashes recessed by `reveal`.
 * `glow` (0 = day) lights the room behind; `curtain` 0..1 = how much of the width a sheer covers.
 */
export function win({ x, y, w, h, z, cols = 2, rows = 1, transom = 0, frame = 0x2a2d31, fw = 0.05, reveal = 0.13, sill = true, sillMat = null, lintel = false, glow = 0, curtain = 0.5, floorY = null, ceilY = null, seed = 1, grille = false, tint = 0x2c3d45, refl = 0.8, roomOpts = {}, interior = true, wallTone = 0xe7e1d4 }, parent) {
  const g = new THREE.Group(), zf = z - reveal, fm = T.solid(frame, { roughness: 0.5, metalness: 0.35 }), rv = T.plaster(wallTone, { tileM: 2, seed: 2 });
  // reveal liners
  boxAt(x, y + h - 0.02, zf, x + w, y + h, z, rv, g, { cast: false }); boxAt(x, y, zf, x + w, y + 0.02, z, rv, g, { cast: false });
  boxAt(x, y, zf, x + 0.02, y + h, z, rv, g, { cast: false }); boxAt(x + w - 0.02, y, zf, x + w, y + h, z, rv, g, { cast: false });
  // outer frame
  const d2 = 0.045;
  boxAt(x + 0.02, y + 0.02, zf - d2, x + w - 0.02, y + 0.02 + fw, zf + d2, fm, g); boxAt(x + 0.02, y + h - 0.02 - fw, zf - d2, x + w - 0.02, y + h - 0.02, zf + d2, fm, g);
  boxAt(x + 0.02, y + 0.02, zf - d2, x + 0.02 + fw, y + h - 0.02, zf + d2, fm, g); boxAt(x + w - 0.02 - fw, y + 0.02, zf - d2, x + w - 0.02, y + h - 0.02, zf + d2, fm, g);
  const ix0 = x + 0.02 + fw, ix1 = x + w - 0.02 - fw, iy0 = y + 0.02 + fw, iy1 = y + h - 0.02 - fw, iw = ix1 - ix0;
  // transom (fixed top light)
  let sy1 = iy1; if (transom > 0) { sy1 = iy1 - transom; boxAt(ix0, sy1 - 0.025, zf - d2, ix1, sy1 + 0.025, zf + d2, fm, g); glassPane(ix0, sy1 + 0.025, ix1, iy1, zf, g, { tint, refl }); }
  // sashes
  const sw = iw / cols, st = 0.032;
  for (let i = 0; i < cols; i++) {
    const a = ix0 + i * sw, b = a + sw, zo = (i % 2 ? 0.026 : -0.026);
    if (cols > 1) { boxAt(a - 0.005, iy0, zf + zo - 0.02, a + st, sy1, zf + zo + 0.02, fm, g); boxAt(b - st, iy0, zf + zo - 0.02, b + 0.005, sy1, zf + zo + 0.02, fm, g); boxAt(a, iy0, zf + zo - 0.02, b, iy0 + st, zf + zo + 0.02, fm, g); boxAt(a, sy1 - st, zf + zo - 0.02, b, sy1, zf + zo + 0.02, fm, g); }
    for (let j = 1; j < rows; j++) { const yy = iy0 + ((sy1 - iy0) * j) / rows; boxAt(a, yy - 0.015, zf + zo - 0.015, b, yy + 0.015, zf + zo + 0.015, fm, g); }
    glassPane(a + (cols > 1 ? st : 0), iy0 + (cols > 1 ? st : 0), b - (cols > 1 ? st : 0), sy1 - (cols > 1 ? st : 0), zf + 0.004, g, { tint, refl });
  }
  if (cols > 1) boxAt(ix0 + sw - 0.04, iy0 + (sy1 - iy0) * 0.45, zf + 0.04, ix0 + sw - 0.025, iy0 + (sy1 - iy0) * 0.45 + 0.14, zf + 0.055, T.metal(0xb9bcc0, { roughness: 0.3 }), g, { cast: false });
  if (grille) { const gm = T.solid(0x202225, { roughness: 0.6, metalness: 0.2 }); for (let xx = ix0 + 0.12; xx < ix1; xx += 0.12) boxAt(xx, iy0, zf + 0.07, xx + 0.012, sy1, zf + 0.082, gm, g, { cast: false }); boxAt(ix0, (iy0 + sy1) / 2 - 0.01, zf + 0.065, ix1, (iy0 + sy1) / 2 + 0.01, zf + 0.09, gm, g, { cast: false }); }
  // sill + optional lintel drip
  if (sill) boxAt(x - 0.05, y - 0.045, z - 0.01, x + w + 0.05, y + 0.005, z + 0.07, sillMat || T.concrete(0xcfc9bc, { tileM: 1.5, seed: 8 }), g);
  if (lintel) boxAt(x - 0.04, y + h, z - 0.01, x + w + 0.04, y + h + 0.06, z + 0.05, sillMat || T.concrete(0xcfc9bc, { tileM: 1.5, seed: 8 }), g);
  // interior
  if (interior) {
    if (curtain > 0) {
      const cm = curtainMat(seed, glow ? 0xffe2b8 : 0xf3ece0), cw = w * curtain, side = (seed % 2 ? 0 : 1);
      const x0 = side ? x + w - cw : x; planeZ(x0 + 0.04, y + 0.05, x0 + cw - 0.04, y + h - 0.04, zf - 0.07, cm, g);
    }
    room({ x, y, w, h, z: zf - 0.1, floorY, ceilY, glow, seed, ...roomOpts }, g);
  }
  parent?.add(g); return g;
}

// ------------------------------------------------------------------ instanced bars / railings
export function instBoxes(list, mat, parent, { cast = true } = {}) {
  const geo = new THREE.BoxGeometry(1, 1, 1), im = new THREE.InstancedMesh(geo, mat, list.length), d = new THREE.Object3D();
  list.forEach(([x0, y0, z0, x1, y1, z1, ry = 0], i) => { d.position.set((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2); d.rotation.set(0, ry, 0); d.scale.set(Math.abs(x1 - x0), Math.abs(y1 - y0), Math.abs(z1 - z0)); d.updateMatrix(); im.setMatrixAt(i, d.matrix); });
  im.castShadow = cast; im.receiveShadow = true; parent?.add(im); return im;
}
/** Railing along an XZ segment p0->p1. kind: 'bars' | 'glass' | 'solid' | 'hbars'. */
export function railRun(parent, p0, p1, { y = 0, h = 1.05, kind = 'bars', pitch = 0.115, bar = 0.018, mat = null, cap = null, rail = 0.045, glassOpt = {} } = {}) {
  const dx = p1[0] - p0[0], dz = p1[1] - p0[1], L = Math.hypot(dx, dz), ang = Math.atan2(-dz, dx), cx = (p0[0] + p1[0]) / 2, cz = (p0[1] + p1[1]) / 2;
  const g = new THREE.Group(); g.position.set(cx, y, cz); g.rotation.y = ang;
  const m = mat || T.solid(0x2a2d31, { roughness: 0.45, metalness: 0.5 }), cm = cap || m;
  if (kind === 'bars' || kind === 'hbars') {
    const list = [];
    if (kind === 'bars') for (let t = pitch / 2; t < L; t += pitch) list.push([t - L / 2 - bar / 2, 0.1, -bar / 2, t - L / 2 + bar / 2, h - rail, bar / 2]);
    else for (let yy = 0.12; yy < h - 0.1; yy += 0.17) list.push([-L / 2, yy, -0.012, L / 2, yy + 0.022, 0.012]);
    instBoxes(list, m, g); boxAt(-L / 2, h - rail, -rail / 2 - 0.004, L / 2, h, rail / 2 + 0.004, cm, g); boxAt(-L / 2, 0.06, -0.02, L / 2, 0.14, 0.02, m, g);
    for (const s of [-L / 2, L / 2 - 0.04]) boxAt(s, 0, -0.025, s + 0.04, h - rail, 0.025, m, g);
  } else if (kind === 'glass') {
    const { tint, refl } = glassPair({ tint: 0x6f8a92, opacity: 0.2, refl: 1.4, ...glassOpt });
    const a = new THREE.Mesh(new THREE.PlaneGeometry(L, h - 0.12), tint), b = new THREE.Mesh(new THREE.PlaneGeometry(L, h - 0.12), refl); a.position.y = b.position.y = 0.1 + (h - 0.12) / 2; b.position.z = 0.002; g.add(a, b);
    boxAt(-L / 2, h - 0.04, -0.03, L / 2, h, 0.03, T.metal(0x9aa0a6, { roughness: 0.3 }), g); boxAt(-L / 2, 0.04, -0.035, L / 2, 0.1, 0.035, T.metal(0x9aa0a6, { roughness: 0.3 }), g);
  } else { // solid parapet wall with cap
    boxAt(-L / 2, 0, -0.1, L / 2, h - 0.05, 0.1, m, g); boxAt(-L / 2 - 0.03, h - 0.05, -0.14, L / 2 + 0.03, h, 0.14, cm, g);
  }
  parent?.add(g); return g;
}

// ------------------------------------------------------------------ AC condenser (outdoor unit) with fan grille texture
let _acTex;
function acFront() {
  if (_acTex) return _acTex;
  const c = cv(256), x = c.getContext('2d'); x.fillStyle = '#e4e2dc'; x.fillRect(0, 0, 256, 256);
  x.fillStyle = '#c9c7c0'; x.fillRect(0, 0, 256, 10); x.fillRect(0, 246, 256, 10); x.fillRect(0, 0, 10, 256); x.fillRect(246, 0, 10, 256);
  const cx = 110, cy = 128; x.fillStyle = '#242628'; x.beginPath(); x.arc(cx, cy, 98, 0, 7); x.fill();
  x.strokeStyle = '#bdbbb4'; x.lineWidth = 3; for (let r = 14; r < 98; r += 14) { x.beginPath(); x.arc(cx, cy, r, 0, 7); x.stroke(); }
  for (let a = 0; a < 6.28; a += 0.4) { x.beginPath(); x.moveTo(cx, cy); x.lineTo(cx + Math.cos(a) * 98, cy + Math.sin(a) * 98); x.stroke(); }
  x.fillStyle = '#9a9890'; x.beginPath(); x.arc(cx, cy, 16, 0, 7); x.fill();
  x.fillStyle = '#b8b6af'; for (let i = 0; i < 12; i++) x.fillRect(214, 22 + i * 18, 26, 8);
  _acTex = ctex(c); return _acTex;
}
export function ac(x, y, z, parent, { w = 0.86, h = 0.62, d = 0.34, dir = 1, tone = 0xdedcd6, bracket = true } = {}) {
  const g = new THREE.Group(), body = T.solid(tone, { roughness: 0.55 }), front = new THREE.MeshStandardMaterial({ map: acFront(), roughness: 0.5, color: new THREE.Color(tone).multiplyScalar(1.05) });
  const zf = dir > 0 ? z + d : z - d;
  boxAt(x, y, Math.min(z, zf), x + w, y + h, Math.max(z, zf), body, g);
  planeZ(x + 0.01, y + 0.01, x + w - 0.01, y + h - 0.01, zf + 0.002 * dir, front, g, { dir, cast: false });
  if (bracket) { const bm = T.solid(0x4a4d52, { roughness: 0.5, metalness: 0.6 }); for (const bx of [x + 0.1, x + w - 0.14]) boxAt(bx, y - 0.045, Math.min(z, zf), bx + 0.04, y, Math.max(z, zf), bm, g, { cast: false }); }
  parent?.add(g); return g;
}

// ------------------------------------------------------------------ roof furniture (Pakistani flat-roof details)
export function tank(x, y, z, parent, { r = 0.6, h = 1.15, color = 0x1d2023, base = true, seed = 1 } = {}) {
  const g = new THREE.Group(), m = T.solid(color, { roughness: 0.42, metalness: 0.05 }), lid = T.solid(0x2a2e33, { roughness: 0.5 });
  if (base) { boxAt(x - r * 0.95, y, z - r * 0.95, x + r * 0.95, y + 0.3, z + r * 0.95, T.concrete(0x8c8a84, { tileM: 2, seed: 4 }), g); y += 0.3; }
  cyl(x, y + h / 2, z, r, r * 1.02, h, m, g, { seg: 40 });
  for (const k of [0.25, 0.5, 0.75]) { const t = new THREE.Mesh(new THREE.TorusGeometry(r * 1.01, 0.018, 6, 40), m); t.rotation.x = Math.PI / 2; t.position.set(x, y + h * k, z); t.castShadow = true; g.add(t); }
  cyl(x, y + h + 0.08, z, r * 0.62, r * 0.98, 0.16, m, g, { seg: 40 }); cyl(x, y + h + 0.19, z, r * 0.2, r * 0.22, 0.07, lid, g, { seg: 18 });
  cyl(x + r * 0.35, y + h + 0.14, z + r * 0.1, 0.055, 0.055, 0.04, lid, g, { seg: 12 });
  parent?.add(g); return g;
}
export function dish(x, y, z, parent, { r = 0.3, rot = 0.6 } = {}) {
  const g = new THREE.Group(), m = T.solid(0xd9d7d0, { roughness: 0.5 }); const s = new THREE.Mesh(new THREE.SphereGeometry(r, 20, 12, 0, Math.PI * 2, 0, Math.PI * 0.32), m); s.material = m; s.rotation.x = Math.PI / 2 + rot; s.scale.set(1, 1, 1); s.position.set(x, y + 0.5, z); s.castShadow = true; g.add(s);
  cyl(x, y + 0.25, z - 0.05, 0.02, 0.02, 0.5, T.metal(0x777), g, { seg: 6 }); parent?.add(g); return g;
}

// ------------------------------------------------------------------ lights
export function wallLamp(x, y, z, parent, { color = 0xffd9a0, intensity = 6, dir = 1, light = 0, dist = 5, w = 0.1 } = {}) {
  const g = new THREE.Group(); boxAt(x - w, y, z, x + w, y + 0.22, z + 0.1 * dir, T.solid(0x2c2c2e, { roughness: 0.5, metalness: 0.6 }), g, { cast: false });
  boxAt(x - w * 0.8, y + 0.02, z + 0.1 * dir, x + w * 0.8, y + 0.2, z + 0.13 * dir, T.emissive(color, intensity), g, { cast: false });
  if (light) { const pl = new THREE.PointLight(color, light, dist, 1.8); pl.position.set(x, y + 0.1, z + 0.4 * dir); g.add(pl); }
  parent?.add(g); return g;
}
export function downlight(x, y, z, parent, { color = 0xfff0cc, intensity = 14, r = 0.065 } = {}) {
  const d = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 0.015, 18), T.emissive(color, intensity)); d.position.set(x, y - 0.008, z); parent?.add(d); return d;
}
/** A soft additive light-spill gradient laid on a surface (fake light pool), horizontal. */
export function lightPool({ x0, z0, x1, z1, y = 0.012, color = 0xffc27a, intensity = 0.5, ellipse = true, falloff = 1.6 }, parent) {
  const c = cv(256), x = c.getContext('2d'), g = x.createRadialGradient(128, 128, 0, 128, 128, 128);
  g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.35, 'rgba(255,255,255,0.45)'); g.addColorStop(0.7, 'rgba(255,255,255,0.12)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 256, 256); void ellipse; void falloff;
  const m = new THREE.MeshBasicMaterial({ map: ctex(c), color: new THREE.Color(color).multiplyScalar(intensity), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -3 });
  const pg = new THREE.PlaneGeometry(x1 - x0, z1 - z0); pg.rotateX(-Math.PI / 2); pg.translate((x0 + x1) / 2, y, (z0 + z1) / 2); const me = new THREE.Mesh(pg, m); parent?.add(me); return me;
}
/** Vertical additive glow quad (light spill on a wall) facing +Z. */
export function lightWall({ x0, y0, x1, y1, z, color = 0xffc27a, intensity = 0.5 }, parent) {
  const c = cv(256), x = c.getContext('2d'), g = x.createRadialGradient(128, 40, 0, 128, 90, 140);
  g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.4, 'rgba(255,255,255,0.4)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 256, 256);
  const m = new THREE.MeshBasicMaterial({ map: ctex(c), color: new THREE.Color(color).multiplyScalar(intensity), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -3 });
  return planeZ(x0, y0, x1, y1, z + 0.006, m, parent);
}

// ------------------------------------------------------------------ misc surface materials
/** Rotate the texture of a (cloned) material by 90 degrees (e.g. horizontal timber boarding). */
export function rotated(mat, angle = Math.PI / 2) {
  const m = mat.clone(); m.userData.tileM = mat.userData.tileM;
  for (const k of ['map', 'bumpMap', 'roughnessMap']) if (m[k]) { m[k] = m[k].clone(); m[k].center.set(0.5, 0.5); m[k].rotation = angle; m[k].needsUpdate = true; }
  return m;
}
/** Interlocking paver texture: running bond 200x100 mm units with per-unit tint, grout lines and bump. */
const _pv = new Map();
export function pavers({ colors = [0xb9b3a7, 0xaaa498, 0xc4beb2, 0xa39d92], tileM = 1.6, seed = 5, grout = 0x6d6a63, across = 8, roughness = 0.88, bond = 0.5 } = {}) {
  const key = `${colors.join(',')}/${seed}/${across}`;
  if (!_pv.has(key)) {
    const S = 1024, c = cv(S), x = c.getContext('2d'), cb = cv(S), xb = cb.getContext('2d'), r = rng(seed), rows = across * 2, bh = S / rows, bw = S / across;
    x.fillStyle = hex(grout); x.fillRect(0, 0, S, S); xb.fillStyle = '#000'; xb.fillRect(0, 0, S, S);
    const gap = Math.max(2, bh * 0.07);
    for (let j = 0; j < rows; j++) for (let i = -1; i <= across; i++) {
      const px = i * bw + (j % 2) * bw * bond, py = j * bh, col = new THREE.Color(colors[Math.floor(r() * colors.length)]).offsetHSL(0, 0, (r() - 0.5) * 0.06);
      x.fillStyle = hex(col.convertLinearToSRGB()); x.fillRect(px + gap / 2, py + gap / 2, bw - gap, bh - gap);
      for (let s = 0; s < 8; s++) { x.fillStyle = `rgba(${r() > 0.5 ? 255 : 0},${r() > 0.5 ? 255 : 0},${r() > 0.5 ? 255 : 0},0.04)`; x.fillRect(px + r() * bw, py + r() * bh, 2 + r() * 5, 2 + r() * 4); }
      xb.fillStyle = `rgb(${190 + r() * 40},${190 + r() * 40},${190 + r() * 40})`; xb.fillRect(px + gap / 2, py + gap / 2, bw - gap, bh - gap);
    }
    const n = noiseArr(seed + 5, S, 6, 8), img = x.getImageData(0, 0, S, S), d = img.data; for (let i = 0; i < S * S; i++) { const k = 1 + (n[i] - 0.5) * 0.22 + (Math.random() - 0.5) * 0.06; d[i * 4] *= k; d[i * 4 + 1] *= k; d[i * 4 + 2] *= k; } x.putImageData(img, 0, 0);
    _pv.set(key, [ctex(c, { repeat: true }), ctex(cb, { srgb: false, repeat: true })]);
  }
  const [map, bump] = _pv.get(key); const m = new THREE.MeshStandardMaterial({ map, bumpMap: bump, bumpScale: 1.4, roughness, color: 0xffffff }); m.userData.tileM = tileM; return m;
}
/** Lawn overlay: turf-roll seams + patchy tone (so a lawn is not a flat green plane). */
export function lawnOverlay({ x0, z0, x1, z1, y = 0.006, rollW = 0.6, rollL = 1.5, seed = 4, seams = true, patch = 0.35 }, parent) {
  const W = Math.round((x1 - x0) * 40), Hh = Math.round((z1 - z0) * 40), sc = Math.min(1, 4096 / Math.max(W, Hh)), cw = Math.max(64, Math.round(W * sc)), ch = Math.max(64, Math.round(Hh * sc)), c = cv(cw, ch), x = c.getContext('2d'), r = rng(seed);
  x.clearRect(0, 0, cw, ch); const mx = cw / (x1 - x0), mz = ch / (z1 - z0);
  if (seams) for (let zz = 0, row = 0; zz < z1 - z0; zz += rollW, row++) { let xx = -(r() * rollL); for (; xx < x1 - x0; xx += rollL) { const tone = (r() - 0.5); x.fillStyle = tone > 0 ? `rgba(190,215,120,${tone * 0.2})` : `rgba(20,50,10,${-tone * 0.2})`; x.fillRect(xx * mx, zz * mz, rollL * mx, rollW * mz); x.fillStyle = 'rgba(70,60,30,0.34)'; x.fillRect(xx * mx, zz * mz, Math.max(1.5, 0.012 * mx), rollW * mz); } x.fillStyle = 'rgba(70,60,30,0.3)'; x.fillRect(0, zz * mz, cw, Math.max(1.5, 0.012 * mz)); }
  const n = noiseArr(seed + 9, 1024, 5, 4), img = x.getImageData(0, 0, cw, ch), d = img.data;
  for (let j = 0; j < ch; j++) for (let i = 0; i < cw; i++) { const v = n[((j * 1024 / ch) | 0) * 1024 + ((i * 1024 / cw) | 0)], k = (j * cw + i) * 4, a = smooth(0.52, 0.72, v) * patch; if (a > 0) { const pa = a * 255, aa = d[k + 3] / 255; const na = pa / 255 + aa * (1 - pa / 255); d[k] = (190 * pa / 255 + d[k] * aa * (1 - pa / 255)) / (na || 1); d[k + 1] = (170 * pa / 255 + d[k + 1] * aa * (1 - pa / 255)) / (na || 1); d[k + 2] = (80 * pa / 255 + d[k + 2] * aa * (1 - pa / 255)) / (na || 1); d[k + 3] = na * 255; } }
  x.putImageData(img, 0, 0);
  const m = decalMat(c, { order: 1 }); const g = new THREE.PlaneGeometry(x1 - x0, z1 - z0); g.rotateX(-Math.PI / 2); g.translate((x0 + x1) / 2, y, (z0 + z1) / 2); const me = new THREE.Mesh(g, m); me.receiveShadow = true; parent?.add(me); return me;
}
export const mats = {
  plasterWhite: (seed = 4, c = 0xece6da) => T.plaster(c, { tileM: 3.2, seed }),
};

/** Wall panel (front face at zBack+t) with real openings, each filled by win(). wins: [{x,y,w,h,...winOpts}] */
export function facade({ x0, x1, y0, y1, zBack, t = 0.35, wins = [], mat, parent, z = null, solidBack = false, backMat = null }) {
  const xs = new Set([x0, x1]), ys = new Set([y0, y1]);
  for (const o of wins) { xs.add(o.x); xs.add(o.x + o.w); ys.add(o.y); ys.add(o.y + o.h); }
  const X = [...xs].filter((v) => v >= x0 && v <= x1).sort((a, b) => a - b), Y = [...ys].filter((v) => v >= y0 && v <= y1).sort((a, b) => a - b), g = new THREE.Group();
  for (let i = 0; i < X.length - 1; i++) for (let j = 0; j < Y.length - 1; j++) {
    const cx = (X[i] + X[i + 1]) / 2, cy = (Y[j] + Y[j + 1]) / 2; if (wins.some((o) => cx > o.x && cx < o.x + o.w && cy > o.y && cy < o.y + o.h)) continue;
    boxAt(X[i], Y[j], zBack, X[i + 1], Y[j + 1], zBack + t, mat, g);
  }
  if (solidBack) boxAt(x0, y0, zBack - 8, x1, y1, zBack, backMat || mat, g);
  const zf = z ?? zBack + t; for (const o of wins) win({ ...o, z: zf }, g);
  parent?.add(g); return g;
}

/** Dry-stacked ledge stone / coursed cladding: thin irregular courses, varied tones, deep joints, chamfered bump. */
const _ls = new Map();
export function ledgeStone({ colors = [0x8d857a, 0x9c9486, 0x7a7268, 0xa59c8c, 0x6f675d], tileM = 1.8, seed = 3, rowMin = 0.055, rowMax = 0.12, lenMin = 0.2, lenMax = 0.55, joint = 0x35312c, roughness = 0.92, bump = 3.2 } = {}) {
  const key = `${colors.join(',')}/${tileM}/${seed}/${rowMin}/${rowMax}`;
  if (!_ls.has(key)) {
    const S = 1024, px = S / tileM, c = cv(S), x = c.getContext('2d'), cb = cv(S), xb = cb.getContext('2d'), r = rng(seed);
    x.fillStyle = hex(new THREE.Color(joint).convertLinearToSRGB()); x.fillRect(0, 0, S, S); xb.fillStyle = '#000'; xb.fillRect(0, 0, S, S);
    xb.filter = 'blur(2.2px)';
    let y = 0;
    while (y < S) {
      const rh = (rowMin + r() * (rowMax - rowMin)) * px; let xx = -r() * lenMax * px;
      while (xx < S) {
        const len = (lenMin + r() * (lenMax - lenMin)) * px, col = new THREE.Color(colors[Math.floor(r() * colors.length)]), j = (r() - 0.5) * 0.14;
        col.offsetHSL((r() - 0.5) * 0.02, (r() - 0.5) * 0.06, j); const cs = col.clone().convertLinearToSRGB();
        const gx = 2.2, rx = xx + gx, ry = y + gx, rw = len - gx * 1.6, rhh = rh - gx * 1.6;
        const gr = x.createLinearGradient(0, ry, 0, ry + rhh); gr.addColorStop(0, hex(cs.clone().multiplyScalar(1.1))); gr.addColorStop(0.55, hex(cs)); gr.addColorStop(1, hex(cs.clone().multiplyScalar(0.8)));
        x.fillStyle = gr; x.beginPath(); x.roundRect(rx, ry, rw, rhh, 2 + r() * 4); x.fill();
        for (let k = 0; k < 14; k++) { x.fillStyle = `rgba(${r() > 0.5 ? 255 : 20},${r() > 0.5 ? 245 : 20},${r() > 0.5 ? 235 : 20},${0.04 + r() * 0.06})`; x.fillRect(rx + r() * rw, ry + r() * rhh, 3 + r() * 14, 2 + r() * 6); }
        const kb = 130 + r() * 100; xb.fillStyle = `rgb(${kb},${kb},${kb})`; xb.beginPath(); xb.roundRect(rx + 2, ry + 2, rw - 4, rhh - 4, 4); xb.fill();
        xx += len;
      }
      y += rh;
    }
    const n = noiseArr(seed + 4, S, 6, 10), img = x.getImageData(0, 0, S, S), d = img.data; for (let i = 0; i < S * S; i++) { const k = 1 + (n[i] - 0.5) * 0.34 + (Math.random() - 0.5) * 0.08; d[i * 4] *= k; d[i * 4 + 1] *= k; d[i * 4 + 2] *= k; } x.putImageData(img, 0, 0);
    _ls.set(key, [ctex(c, { repeat: true }), ctex(cb, { srgb: false, repeat: true })]);
  }
  const [map, bm] = _ls.get(key); const m = new THREE.MeshStandardMaterial({ map, bumpMap: bm, bumpScale: bump, roughness, color: 0xffffff }); m.userData.tileM = tileM; return m;
}
