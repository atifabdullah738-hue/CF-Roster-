// agent1 helper kit: facades with real interiors behind glass, timber screens, boundary/gate/street/context builders,
// cars, decals/stains.  Units = metres, +X right, +Y up, +Z toward camera (house front face at z = 0).
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { T, boxAt, roundBox, cyl, ground, wallWithOpenings } from './arch.mjs';
import { hedge, bush, tree, palm } from './nature.mjs';
import { rng } from './textures.mjs';
import { archCamera } from './env.mjs';

export { THREE, T, boxAt, roundBox, cyl, ground, wallWithOpenings, hedge, bush, tree, palm, rng };

// ------------------------------------------------------------------------------------------------ basics
function canvasTex(w, h, draw, { srgb = true, repeat = true } = {}) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace; t.anisotropy = 8;
  if (repeat) t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
}
const lm = (m, tile) => { if (tile) m.userData.tileM = tile; return m; };

/** Box with world-mapped UVs; `swap` rotates the texture 90deg (grain along X on faces), `jit` offsets UVs randomly. */
export function bx(x0, y0, z0, x1, y1, z1, mat, parent, { swap = false, jit = 0, cast = true, receive = true, rnd = Math.random } = {}) {
  const geo = new THREE.BoxGeometry(Math.abs(x1 - x0), Math.abs(y1 - y0), Math.abs(z1 - z0)); geo.translate((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
  const tile = mat.userData.tileM || 1, pos = geo.attributes.position, nor = geo.attributes.normal, uv = geo.attributes.uv, ou = jit ? rnd() * jit : 0, ov = jit ? rnd() * jit : 0;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i), nx = Math.abs(nor.getX(i)), ny = Math.abs(nor.getY(i)), nz = Math.abs(nor.getZ(i));
    let u, v;
    if (nx >= ny && nx >= nz) { u = z; v = y; } else if (ny >= nx && ny >= nz) { u = x; v = z; } else { u = x; v = y; }
    if (swap) [u, v] = [v, u];
    uv.setXY(i, u / tile + ou, v / tile + ov);
  }
  const m = new THREE.Mesh(geo, mat); m.castShadow = cast; m.receiveShadow = receive; parent?.add(m); return m;
}

export const coat = (color, { roughness = 0.42, metalness = 0.35 } = {}) => T.solid(color, { roughness, metalness });

let _glass;
export function glass({ tint = 0x16242e, opacity = 0.6, env = 2.6, roughness = 0.03 } = {}) {
  const m = new THREE.MeshPhysicalMaterial({ color: tint, roughness, metalness: 0.15, transparent: true, opacity, envMapIntensity: env, clearcoat: 1, clearcoatRoughness: 0.02, depthWrite: false });
  m.userData.tileM = 1; return m;
}
export const defaultGlass = () => (_glass ||= glass());

// ------------------------------------------------------------------------------------------------ decals / stains
export function grunge({ x0, z0, x1, z1, y = 0.004, seed = 1, n = 60, alpha = 0.12, light = false, streak = 0, parent }) {
  const r = rng(seed), W = x1 - x0, D = z1 - z0;
  const map = canvasTex(1024, Math.max(128, Math.min(1024, Math.round(1024 * D / W))), (c, w, h) => {
    c.clearRect(0, 0, w, h);
    for (let i = 0; i < n; i++) {
      const px = r() * w, py = r() * h, rad = 14 + r() * 60, a = alpha * (0.3 + r() * 0.9), sx = streak ? 1 + streak * (0.5 + r()) : 1;
      c.save(); c.translate(px, py); c.scale(sx, 1);
      const g = c.createRadialGradient(0, 0, 0, 0, 0, rad); const col = light ? '235,230,220' : '8,8,9';
      g.addColorStop(0, `rgba(${col},${a})`); g.addColorStop(1, `rgba(${col},0)`); c.fillStyle = g; c.beginPath(); c.arc(0, 0, rad, 0, 6.3); c.fill(); c.restore();
    }
  }, { repeat: false });
  const m = new THREE.MeshStandardMaterial({ map, transparent: true, depthWrite: false, roughness: 0.9, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
  const g = new THREE.PlaneGeometry(W, D); g.rotateX(-Math.PI / 2); g.translate((x0 + x1) / 2, y, (z0 + z1) / 2);
  const mesh = new THREE.Mesh(g, m); mesh.receiveShadow = true; mesh.renderOrder = 1; parent?.add(mesh); return mesh;
}

/** Vertical weathering streaks hanging from the top of a wall panel (plane facing +Z at z). */
export function wallStain({ x0, x1, y0, y1, z, seed = 1, alpha = 0.16, n = 14, parent, tint = '40,34,28' }) {
  const r = rng(seed), W = x1 - x0, H = y1 - y0;
  const map = canvasTex(512, 512, (c, w, h) => {
    c.clearRect(0, 0, w, h);
    for (let i = 0; i < n; i++) {
      const px = r() * w, len = h * (0.15 + r() * 0.6), wd = 4 + r() * 22, a = alpha * (0.4 + r() * 0.8);
      const g = c.createLinearGradient(0, 0, 0, len); g.addColorStop(0, `rgba(${tint},${a})`); g.addColorStop(0.55, `rgba(${tint},${a * 0.45})`); g.addColorStop(1, `rgba(${tint},0)`);
      c.fillStyle = g; c.fillRect(px - wd / 2, 0, wd, len);
    }
    const g2 = c.createLinearGradient(0, 0, 0, h * 0.12); g2.addColorStop(0, `rgba(${tint},${alpha * 0.9})`); g2.addColorStop(1, `rgba(${tint},0)`); c.fillStyle = g2; c.fillRect(0, 0, w, h * 0.12);
  }, { repeat: false });
  const m = new THREE.MeshStandardMaterial({ map, transparent: true, depthWrite: false, roughness: 1, polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -3 });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(W, H), m); mesh.position.set((x0 + x1) / 2, (y0 + y1) / 2, z + 0.003); mesh.renderOrder = 1; parent?.add(mesh); return mesh;
}

// pebbles / gravel bed
let _peb;
export function pebbles({ tileM = 1.2, color = 0xcfc6b6 } = {}) {
  if (!_peb) {
    _peb = canvasTex(1024, 1024, (c, w, h) => {
      const r = rng(77); c.fillStyle = '#6d675f'; c.fillRect(0, 0, w, h);
      for (let i = 0; i < 5200; i++) { const x = r() * w, y = r() * h, rr = 7 + r() * 13, k = 150 + r() * 95; c.fillStyle = `rgb(${k},${k * 0.97 | 0},${k * 0.92 | 0})`; c.beginPath(); c.ellipse(x, y, rr, rr * (0.65 + r() * 0.3), r() * 3, 0, 6.3); c.fill(); c.strokeStyle = 'rgba(30,26,22,.55)'; c.lineWidth = 1.3; c.stroke(); }
    });
  }
  const m = new THREE.MeshStandardMaterial({ map: _peb, bumpMap: _peb, bumpScale: 3.0, roughness: 0.95, color }); m.userData.tileM = tileM; return m;
}

// ------------------------------------------------------------------------------------------------ structure
/** Hollow wall box around a volume (no front wall - build that with facade()). Includes floor + roof slab. */
export function shell({ x0, x1, y0, y1, zF, zB, t = 0.25, side, back, roofMat, floorMat, roofT = 0.22, parent, sideR }) {
  boxAt(x0, y0, zB, x0 + t, y1, zF, side, parent); boxAt(x1 - t, y0, zB, x1, y1, zF, sideR || side, parent);
  boxAt(x0 + t, y0, zB, x1 - t, y1, zB + t, back || side, parent);
  if (roofMat) boxAt(x0, y1 - roofT, zB, x1, y1, zF, roofMat, parent);
  if (floorMat) boxAt(x0 + t, y0 - 0.001, zB + t, x1 - t, y0 + 0.12, zF, floorMat, parent);
}

/** Front wall panel with real openings. Front face at z, thickness t. */
export function facade({ x0, x1, y0, y1, z, t = 0.3, mat, openings = [], parent }) {
  return wallWithOpenings(x0, x1, y0, y1, z - t, t, openings, mat, parent);
}

/** Glazing system (thin dark frame, mullions, transparent reflective pane) sitting `reveal` behind the wall face z. */
export function glazing({ x, y, w, h, z, cols = 1, rows = 1, frame = 0x17191c, ft = 0.055, fd = 0.1, reveal = 0.1, glassMat, parent, colW = null, rowH = null, handle = true, sill = null, transom = 0 }) {
  const g = new THREE.Group(), fm = coat(frame), gl = glassMat || defaultGlass(), zf = z - reveal;
  bx(x + ft * 0.5, y + ft * 0.5, zf - 0.006, x + w - ft * 0.5, y + h - ft * 0.5, zf + 0.006, gl, g, { cast: false, receive: false });
  bx(x, y, zf - fd / 2, x + w, y + ft, zf + fd / 2, fm, g); bx(x, y + h - ft, zf - fd / 2, x + w, y + h, zf + fd / 2, fm, g);
  bx(x, y, zf - fd / 2, x + ft, y + h, zf + fd / 2, fm, g); bx(x + w - ft, y, zf - fd / 2, x + w, y + h, zf + fd / 2, fm, g);
  const mf = ft * 0.75;
  for (let i = 1; i < cols; i++) { const xx = colW ? x + colW.slice(0, i).reduce((a, b) => a + b, 0) * w : x + (w * i) / cols; bx(xx - mf / 2, y, zf - fd / 2, xx + mf / 2, y + h, zf + fd / 2, fm, g); }
  for (let j = 1; j < rows; j++) { const yy = rowH ? y + rowH.slice(0, j).reduce((a, b) => a + b, 0) * h : y + (h * j) / rows; bx(x, yy - mf / 2, zf - fd / 2, x + w, yy + mf / 2, zf + fd / 2, fm, g); }
  if (transom) bx(x, y + h - transom - mf / 2, zf - fd / 2, x + w, y + h - transom + mf / 2, zf + fd / 2, fm, g);
  if (handle && cols >= 2) { const xx = x + w / 2; bx(xx - 0.05, y + h * 0.45, zf + fd / 2, xx - 0.035, y + h * 0.45 + 0.28, zf + fd / 2 + 0.03, coat(0xb9bcc0, { roughness: 0.25, metalness: 0.9 }), g); }
  if (sill) bx(x - 0.05, y - 0.06, z - 0.12, x + w + 0.05, y, z + 0.06, sill, g);
  parent?.add(g); return g;
}

/** Raised surround frame around an opening (slab-like architrave) for depth. */
export function surround({ x, y, w, h, z, mat, t = 0.16, proj = 0.12, parent }) {
  const g = new THREE.Group();
  bx(x - t, y + h, z, x + w + t, y + h + t, z + proj, mat, g); bx(x - t, y - t, z, x + w + t, y, z + proj, mat, g);
  bx(x - t, y, z, x, y + h, z + proj, mat, g); bx(x + w, y, z, x + w + t, y + h, z + proj, mat, g);
  parent?.add(g); return g;
}

export function parapet({ x0, x1, zF, zB, y, h = 1.0, t = 0.2, mat, cap, capOver = 0.045, capH = 0.07, front = true, back = true, left = true, right = true, parent }) {
  const g = new THREE.Group();
  if (front) { bx(x0, y, zF - t, x1, y + h, zF, mat, g); bx(x0 - capOver, y + h, zF - t - capOver, x1 + capOver, y + h + capH, zF + capOver, cap, g); }
  if (back) { bx(x0, y, zB, x1, y + h, zB + t, mat, g); bx(x0 - capOver, y + h, zB - capOver, x1 + capOver, y + h + capH, zB + t + capOver, cap, g); }
  if (left) { bx(x0, y, zB + t, x0 + t, y + h, zF - t, mat, g); bx(x0 - capOver, y + h, zB + t, x0 + t + capOver, y + h + capH, zF - t, cap, g); }
  if (right) { bx(x1 - t, y, zB + t, x1, y + h, zF - t, mat, g); bx(x1 - t - capOver, y + h, zB + t, x1 + capOver, y + h + capH, zF - t, cap, g); }
  parent?.add(g); return g;
}

/** Vertical (or horizontal) timber screen. */
export function slatScreen({ x0, x1, y0, y1, z, w = 0.05, d = 0.1, pitch = 0.15, mats, horizontal = false, seed = 1, parent, back = null, backZ = null }) {
  const g = new THREE.Group(), r = rng(seed); mats = Array.isArray(mats) ? mats : [mats];
  if (back) bx(x0, y0, backZ ?? z - 0.03, x1, y1, (backZ ?? z - 0.03) + 0.02, back, g);
  if (!horizontal) for (let x = x0 + pitch / 2 - w / 2; x + w <= x1 + 1e-6; x += pitch) bx(x, y0, z, x + w, y1, z + d, mats[Math.floor(r() * mats.length)], g, { jit: 3, rnd: r });
  else for (let y = y0 + pitch / 2 - w / 2; y + w <= y1 + 1e-6; y += pitch) bx(x0, y, z, x1, y + w, z + d, mats[Math.floor(r() * mats.length)], g, { swap: true, jit: 3, rnd: r });
  parent?.add(g); return g;
}

export function downlights(list, { y, color = 0xfff0d2, intensity = 9, r = 0.075, parent }) {
  const m = T.emissive(color, intensity), trim = coat(0xe8e6e0, { roughness: 0.5, metalness: 0.1 });
  for (const [x, z] of list) {
    const d = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 0.012, 20), m); d.position.set(x, y - 0.006, z); parent?.add(d);
    const t = new THREE.Mesh(new THREE.CylinderGeometry(r + 0.022, r + 0.022, 0.01, 20), trim); t.position.set(x, y - 0.002, z); parent?.add(t);
  }
}
export function pointLight(scene, color, intensity, x, y, z, dist = 8, decay = 1.7) { const l = new THREE.PointLight(color, intensity, dist, decay); l.position.set(x, y, z); scene.add(l); return l; }

/** Linear LED strip (emissive thin box). */
export function ledStrip(x0, y0, z0, x1, y1, z1, { color = 0xffd9a0, intensity = 8, parent }) { return bx(x0, y0, z0, x1, y1, z1, T.emissive(color, intensity), parent, { cast: false }); }

// ------------------------------------------------------------------------------------------------ interiors
function washMap() {
  return canvasTex(256, 256, (c, w, h) => {
    const g = c.createRadialGradient(w / 2, h * 0.05, 4, w / 2, h * 0.3, h * 0.95); g.addColorStop(0, '#ffffff'); g.addColorStop(0.5, '#a89a86'); g.addColorStop(1, '#4a423a'); c.fillStyle = g; c.fillRect(0, 0, w, h);
  }, { repeat: false });
}
let _wash; const wash = () => (_wash ||= washMap());
let _curtain;
function curtainMat(color) {
  _curtain ||= canvasTex(256, 128, (c, w, h) => { for (let x = 0; x < w; x++) { const k = 0.78 + 0.22 * Math.sin(x * 0.55) ** 2; c.fillStyle = `rgb(${255 * k},${255 * k},${255 * k})`; c.fillRect(x, 0, 1, h); } });
  const m = new THREE.MeshStandardMaterial({ map: _curtain, color, roughness: 1, side: THREE.DoubleSide }); m.userData.tileM = 1; return m;
}

/**
 * A furnished room visible behind glazing. Spans x0..x1, floor at floorY to ceiling ceilY, from wall back face zF going back `depth`.
 * glow = 0..1.5 how lit it is (0.12 = daylight interior, 1+ = evening).
 */
export function room({ x0, x1, floorY, ceilY, zF, depth = 4.5, style = 'living', glow = 0.2, warm = 0xffc684, wallColor = 0xe3d8c6, accent = 0x6b7a5a, wood = 0x8a5a34, seed = 1, curtains = true, parent, anchor = null, curtainColor = 0xefe6d6 }) {
  const g = new THREE.Group(), r = rng(seed), zb = zF - depth, W = x1 - x0, ax = anchor ?? (x0 + x1) / 2, H = ceilY - floorY, wc = new THREE.Color(warm);
  const lit = (color, k = 1, map = null) => { const m = new THREE.MeshStandardMaterial({ color, roughness: 0.85, emissive: wc, emissiveIntensity: glow * k, emissiveMap: map || null }); m.userData.tileM = 2; return m; };
  const wallM = lit(wallColor, 0.55, wash()), wallS = lit(wallColor, 0.45, wash()), ceilM = lit(0xf1eadc, 0.5);
  bx(x0, floorY - 0.12, zb, x1, ceilY + 0.12, zb - 0.1, wallM, g, { cast: false }); // back wall
  bx(x0 - 0.1, floorY - 0.12, zb, x0, ceilY + 0.12, zF, wallS, g, { cast: false }); bx(x1, floorY - 0.12, zb, x1 + 0.1, ceilY + 0.12, zF, wallS, g, { cast: false });
  bx(x0, ceilY, zb, x1, ceilY + 0.1, zF, ceilM, g, { cast: false });
  const floorM = new THREE.MeshStandardMaterial({ color: 0xcfc4b2, roughness: 0.35, emissive: wc, emissiveIntensity: glow * 0.18, map: T.tiles({ color: 0xffffff, n: 3, tileM: 3.2 }).map }); floorM.userData.tileM = 3.2;
  bx(x0, floorY - 0.12, zb, x1, floorY, zF, floorM, g, { cast: false });
  // cove light + downlights
  ledStrip(x0 + 0.05, ceilY - 0.05, zb + 0.02, x1 - 0.05, ceilY - 0.02, zb + 0.14, { color: warm, intensity: 3 + glow * 9, parent: g });
  const nDl = Math.max(2, Math.round(W / 1.4));
  for (let i = 0; i < nDl; i++) for (let j = 0; j < 2; j++) downlights([[x0 + (W * (i + 0.5)) / nDl, zF - depth * (0.28 + 0.4 * j)]], { y: ceilY, intensity: 0.8 + glow * 14, r: 0.06, color: warm, parent: g });
  const mat = (c, rough = 0.8) => lit(c, 0.16) && Object.assign(lit(c, 0.2), { roughness: rough });
  const fab1 = mat(0x7d7a70), fab2 = mat(accent), woodM = (() => { const m = T.wood({ color: wood, tileM: 1.4, planks: 3, seed: 40 }); m.emissive = wc; m.emissiveIntensity = glow * 0.12; return m; })(), dark = mat(0x2b2a29, 0.5), cream = mat(0xe4dccb);
  const rug = mat(0xb9ad98, 1), bulbC = new THREE.Color(warm).lerp(new THREE.Color(0xffffff), 0.45), whiteL = new THREE.MeshStandardMaterial({ color: 0xd9d0bf, roughness: 0.6, emissive: bulbC, emissiveIntensity: Math.max(0, glow - 0.2) * 6 });
  const rb = (cx, y0, cz, w, h, d, m, rad = 0.05) => roundBox(cx, y0 + h / 2, cz, w, h, d, rad, m, g, { cast: false });
  const pendant = (cx, cz, drop = 0.9, s = 0.32) => { bx(cx - 0.01, ceilY - drop, cz - 0.01, cx + 0.01, ceilY, cz + 0.01, dark, g, { cast: false }); const sp = new THREE.Mesh(new THREE.SphereGeometry(s * 0.55, 20, 14), whiteL); sp.position.set(cx, ceilY - drop - s * 0.3, cz); g.add(sp); };
  const plant = (cx, cz, h = 1.4) => { cyl(cx, floorY + 0.25, cz, 0.22, 0.17, 0.5, mat(0xd7d1c6), g, { cast: false }); bush(cx, floorY + 0.45, cz, h * 0.28, g, { seed: Math.floor(r() * 99), color: 0x3d6b2d }); };
  const art = (cx, y0, w, h, c) => bx(cx - w / 2, y0, zb + 0.005, cx + w / 2, y0 + h, zb + 0.03, new THREE.MeshStandardMaterial({ color: c, roughness: 0.9, emissive: c, emissiveIntensity: glow * 0.25 }), g, { cast: false });
  const front = zF - 0.6;
  if (style === 'living' || style === 'lounge') {
    const sw = Math.min(3.2, W * 0.55);
    rb(ax, floorY, zb + 1.5, Math.min(W - 0.4, sw + 2.2), 0.015, 3.0, rug, 0.0);
    rb(ax, floorY + 0.0, zb + 0.55, sw, 0.42, 0.95, fab1); rb(ax, floorY + 0.4, zb + 0.18, sw, 0.5, 0.25, fab1);
    for (let i = -1; i <= 1; i += 2) rb(ax + i * sw * 0.2, floorY + 0.42, zb + 0.55, sw * 0.4, 0.14, 0.7, i > 0 ? fab2 : cream, 0.04);
    rb(ax, floorY, zb + 1.8, 1.1, 0.38, 0.7, woodM, 0.03); rb(ax - sw * 0.62, floorY, zb + 1.7, 0.8, 0.7, 0.8, fab2, 0.08); rb(ax + sw * 0.62, floorY, zb + 1.7, 0.8, 0.7, 0.8, fab2, 0.08);
    art(ax, floorY + 1.1, Math.min(2.2, W * 0.4), 1.2, 0x7a8a78); pendant(ax, zb + 1.8, Math.max(0.7, H - 2.2), 0.28); plant(x1 - 0.7, zb + 0.7, 1.7);
  } else if (style === 'dining') {
    rb(ax, floorY + 0.7, zb + 1.8, Math.min(2.6, W * 0.6), 0.06, 1.0, woodM, 0.02);
    for (const sx of [-0.9, 0, 0.9]) for (const sz of [-0.75, 0.75]) { rb(ax + sx, floorY, zb + 1.8 + sz, 0.45, 0.45, 0.45, fab1, 0.06); rb(ax + sx, floorY + 0.4, zb + 1.8 + sz + Math.sign(sz) * 0.2, 0.45, 0.45, 0.05, fab1, 0.02); }
    rb(ax, floorY, zb + 1.8, 0.12, 0.7, 0.12, dark, 0.01); pendant(ax - 0.5, zb + 1.8, 1.0, 0.2); pendant(ax + 0.5, zb + 1.8, 1.0, 0.2);
    rb(ax, floorY, zb + 0.3, Math.min(2.8, W * 0.6), 0.9, 0.5, woodM, 0.02); art(ax, floorY + 1.3, 1.4, 0.9, 0xc09a60); plant(x0 + 0.6, zb + 0.6, 1.5);
  } else if (style === 'bed') {
    rb(ax, floorY, zb + 1.2, 2.0, 0.42, 2.1, cream, 0.05); rb(ax, floorY + 0.42, zb + 1.5, 1.95, 0.15, 1.7, fab2, 0.05); rb(ax, floorY, zb + 0.15, 2.4, 1.2, 0.18, woodM, 0.03);
    for (const s of [-1, 1]) { rb(ax + s * 1.45, floorY, zb + 0.4, 0.5, 0.5, 0.45, woodM, 0.03); const lp = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.14, 0.26, 16), whiteL); lp.position.set(ax + s * 1.45, floorY + 0.65, zb + 0.4); g.add(lp); }
    art(ax, floorY + 1.45, 1.6, 0.7, 0xb59a7a);
  } else if (style === 'void') {
    // double-height: big pendant, feature wall, stair slab silhouette
    rb(ax + W * 0.28, floorY + 1.1, zb + 1.2, 1.1, 0.12, 2.4, woodM, 0.01); rb(ax + W * 0.28, floorY + 2.0, zb + 1.2, 1.1, 0.12, 2.4, woodM, 0.01);
    for (let k = 0; k < 8; k++) rb(ax + W * 0.12 - k * 0.0, floorY + 0.18 * (k + 1), zb + 0.6 + k * 0.22, 1.1, 0.06, 0.34, woodM, 0.01);
    for (let k = 0; k < 6; k++) { const sp = new THREE.Mesh(new THREE.SphereGeometry(0.17, 16, 10), whiteL); sp.position.set(ax - 0.6 + (k % 3) * 0.6, ceilY - 1.2 - (k % 2) * 0.8, zb + 2.0 + (k % 2) * 0.4); g.add(sp); bx(sp.position.x - 0.005, sp.position.y, sp.position.z - 0.005, sp.position.x + 0.005, ceilY, sp.position.z + 0.005, dark, g, { cast: false }); }
    art(ax - W * 0.2, floorY + 1.4, 2.0, 2.4, 0x8a6e4a); plant(x0 + 0.7, zb + 0.9, 2.2);
  } else if (style === 'lib') {
    rb(x0 + 0.1 + 0.2, floorY, zb + 0.2, W - 0.6, H - 0.2, 0.3, woodM, 0.01); for (let k = 0; k < 28; k++) art(x0 + 0.45 + (W - 0.9) * (k / 28) + 0.1, floorY + 0.3 + (k % 5) * 0.45, 0.07 + r() * 0.1, 0.34, [0xc9b27a, 0x7a4b3a, 0x3d5a63, 0xd9d0bd][k % 4]);
    rb(ax, floorY, zb + 1.7, 1.6, 0.74, 0.8, dark, 0.02); rb(ax, floorY, zb + 2.5, 0.55, 0.9, 0.55, fab2, 0.1);
  }
  // sheer curtains at window plane
  if (curtains && W > 1.2) { const cm = curtainMat(curtainColor); const cw = Math.min(0.9, W * 0.2); bx(x0 + 0.1, floorY, zF - 0.28, x0 + 0.1 + cw, ceilY - 0.1, zF - 0.24, cm, g, { cast: false }); bx(x1 - 0.1 - cw, floorY, zF - 0.28, x1 - 0.1, ceilY - 0.1, zF - 0.24, cm, g, { cast: false }); }
  parent?.add(g); return g;
}

// ------------------------------------------------------------------------------------------------ site: boundary / gate / lamps
export function pillar({ x, z, w = 0.46, h = 1.95, mat, cap, lamp = true, lampColor = 0xffe0b0, lampI = 5, parent, y = 0, capOver = 0.05 }) {
  const g = new THREE.Group(); bx(x - w / 2, y, z - w / 2, x + w / 2, y + h, z + w / 2, mat, g);
  bx(x - w / 2 - capOver, y + h, z - w / 2 - capOver, x + w / 2 + capOver, y + h + 0.07, z + w / 2 + capOver, cap, g);
  if (lamp) { const lm_ = T.emissive(lampColor, lampI); bx(x - 0.14, y + h + 0.07, z - 0.14, x + 0.14, y + h + 0.36, z + 0.14, lm_, g, { cast: false }); bx(x - 0.18, y + h + 0.36, z - 0.18, x + 0.18, y + h + 0.41, z + 0.18, coat(0x1b1d20), g); const bk = coat(0x1b1d20); for (const sx of [-1, 1]) for (const sz of [-1, 1]) bx(x + sx * 0.14 - 0.012, y + h + 0.07, z + sz * 0.14 - 0.012, x + sx * 0.14 + 0.012, y + h + 0.36, z + sz * 0.14 + 0.012, bk, g); }
  parent?.add(g); return g;
}
/** Slatted gate (horizontal or vertical slats) in a black frame, plus a small opening gap detail. */
export function gate({ x0, x1, y0 = 0.0, y1 = 2.0, z, mats, frame = 0x1c1f23, slat = 0.085, gap = 0.035, vertical = false, seed = 3, parent, leaves = 2 }) {
  const g = new THREE.Group(), r = rng(seed), fm = coat(frame, { roughness: 0.5 }); mats = Array.isArray(mats) ? mats : [mats];
  bx(x0, y0 + 0.08, z - 0.035, x1, y1, z + 0.0, coat(0x16181b), g);
  if (!vertical) for (let y = y0 + 0.14; y + slat <= y1 - 0.08; y += slat + gap) bx(x0 + 0.05, y, z, x1 - 0.05, y + slat, z + 0.045, mats[Math.floor(r() * mats.length)], g, { swap: true, jit: 4, rnd: r });
  else for (let x = x0 + 0.1; x + slat <= x1 - 0.08; x += slat + gap) bx(x, y0 + 0.14, z, x + slat, y1 - 0.08, z + 0.045, mats[Math.floor(r() * mats.length)], g, { jit: 4, rnd: r });
  bx(x0, y0 + 0.06, z - 0.045, x0 + 0.07, y1, z + 0.07, fm, g); bx(x1 - 0.07, y0 + 0.06, z - 0.045, x1, y1, z + 0.07, fm, g);
  bx(x0, y1 - 0.07, z - 0.045, x1, y1, z + 0.07, fm, g); bx(x0, y0 + 0.06, z - 0.045, x1, y0 + 0.14, z + 0.07, fm, g);
  if (leaves === 2) bx((x0 + x1) / 2 - 0.012, y0 + 0.06, z - 0.045, (x0 + x1) / 2 + 0.012, y1, z + 0.075, fm, g);
  parent?.add(g); return g;
}

export function numberPlate({ x, y, z, w = 0.34, h = 0.22, parent, mat }) { return bx(x - w / 2, y - h / 2, z, x + w / 2, y + h / 2, z + 0.02, mat || T.solid(0x232323, { roughness: 0.5 }), parent, { cast: false }); }

export function streetLamp({ x, z, h = 7.5, arm = 1.6, dir = 1, lit = false, parent, intensity = 14 }) {
  const g = new THREE.Group(), m = coat(0x5d6165, { roughness: 0.5, metalness: 0.7 });
  cyl(x, h / 2, z, 0.05, 0.085, h, m, g, { seg: 12 }); cyl(x, 0.3, z, 0.14, 0.17, 0.6, m, g, { seg: 12 });
  const a = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.04, arm, 8), m); a.rotation.z = Math.PI / 2 * dir + 0.08 * dir; a.position.set(x + dir * arm / 2, h + 0.05, z); a.castShadow = true; g.add(a);
  const head = bx(x + dir * arm - 0.35, h - 0.06, z - 0.14, x + dir * arm + 0.35, h + 0.04, z + 0.14, m, g);
  const lamp = bx(x + dir * arm - 0.3, h - 0.075, z - 0.11, x + dir * arm + 0.3, h - 0.06, z + 0.11, T.emissive(0xffe3b4, lit ? intensity : 1.5), g, { cast: false }); void head; void lamp;
  parent?.add(g); return g;
}

/** Concrete utility pole with cross-arm and sagging wires toward another pole (xs). */
export function utilityPole({ x, z, h = 9, parent, wireTo = null, seed = 1 }) {
  const g = new THREE.Group(), m = T.concrete(0x9c9a94, { tileM: 2, seed: 18 }), mm = coat(0x3a3c3f, { roughness: 0.6, metalness: 0.6 });
  const p = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.17, h, 14), m); p.position.set(x, h / 2, z); p.castShadow = true; g.add(p);
  const ca = bx(x - 1.0, h - 0.7, z - 0.05, x + 1.0, h - 0.62, z + 0.05, mm, g); void ca; bx(x - 1.1, h - 1.5, z - 0.05, x + 1.1, h - 1.42, z + 0.05, mm, g);
  for (const dx of [-0.9, -0.3, 0.3, 0.9]) bx(x + dx - 0.03, h - 0.62, z - 0.03, x + dx + 0.03, h - 0.45, z + 0.03, T.solid(0x8d8f93, { roughness: 0.4 }), g, { cast: false });
  const wireMat = T.solid(0x0c0c0d, { roughness: 0.6 });
  if (wireTo) for (const dy of [-0.5, -0.5, -0.5, -0.5]) void dy;
  if (wireTo) for (const [dx, hy] of [[-0.9, h - 0.45], [-0.3, h - 0.45], [0.3, h - 0.45], [0.9, h - 0.45], [-1.0, h - 1.4], [1.0, h - 1.4]]) {
    const a = new THREE.Vector3(x + dx, hy, z), b = new THREE.Vector3(wireTo.x + dx, hy, wireTo.z), n = 16, pts = [];
    for (let i = 0; i <= n; i++) { const t = i / n, v = a.clone().lerp(b, t); v.y -= Math.sin(t * Math.PI) * 0.7; pts.push(v); }
    const tube = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 40, 0.012, 4), wireMat); g.add(tube);
  }
  // transformer-ish junction box
  parent?.add(g); return g;
}

// ------------------------------------------------------------------------------------------------ street
/**
 * Straight kerbed street running along X. Near kerb edge at z0 (towards the plot), far kerb at z1. Footpath between zPath and z0 is built by caller.
 * Returns group. Adds drain grates, manholes, wear patches, lane paint.
 */
export function roadX({ x0 = -90, x1 = 90, zN, zF, wet = false, kerbH = 0.15, seed = 5, parent, tint = null, centerLine = true, patchy = true }) {
  const g = new THREE.Group(), road = T.asphalt({ wet }); if (tint) road.color.set(tint);
  const curb = T.concrete(0xb8b6af, { tileM: 1.5, seed: 17 }), gut = T.concrete(0x8f8d88, { tileM: 2, seed: 19 });
  ground(x0, zN, x1, zF, 0, road, g);
  bx(x0, 0, zN - 0.22, x1, kerbH, zN, curb, g); bx(x0, 0, zF, x1, kerbH, zF + 0.22, curb, g);
  ground(x0, zN - 0.02, x1, zN + 0.42, 0.003, gut, g);
  const paint = T.solid(0xe9e7de, { roughness: 0.75 }); const mid = (zN + zF) / 2;
  if (centerLine) for (let x = x0; x < x1; x += 6) bx(x, 0.004, mid - 0.07, x + 3, 0.011, mid + 0.07, paint, g, { cast: false });
  // kerb joints
  const joint = T.solid(0x55524c, { roughness: 1 }); for (let x = x0; x < x1; x += 1.0) bx(x, 0.001, zN - 0.22, x + 0.012, kerbH + 0.001, zN - 0.2, joint, g, { cast: false });
  const r = rng(seed);
  for (let i = 0; i < 6; i++) { const x = x0 + 8 + r() * (x1 - x0 - 16); bx(x, 0.005, zN + 0.05, x + 0.7, 0.012, zN + 0.38, T.solid(0x1a1a1b, { roughness: 0.6, metalness: 0.5 }), g, { cast: false }); for (let k = 0; k < 6; k++) bx(x + 0.04 + k * 0.11, 0.0125, zN + 0.07, x + 0.08 + k * 0.11, 0.014, zN + 0.36, T.solid(0x050505), g, { cast: false }); }
  for (let i = 0; i < 2; i++) { const x = x0 + 12 + r() * (x1 - x0 - 24), z = mid + (r() - 0.5) * 2; cyl(x, 0.008, z, 0.34, 0.34, 0.012, T.solid(0x2d2d2d, { roughness: 0.5, metalness: 0.7 }), g, { seg: 28, cast: false }); }
  if (patchy) { grunge({ x0, z0: zN, x1, z1: zF, y: 0.006, seed, n: 70, alpha: 0.10, streak: 3, parent: g }); grunge({ x0, z0: zN, x1, z1: zF, y: 0.0065, seed: seed + 4, n: 40, alpha: 0.05, light: true, streak: 5, parent: g }); }
  parent?.add(g); return g;
}

/** Footpath of pavers between z0 and z1 along X, with seams. */
export function footpath({ x0 = -90, x1 = 90, z0, z1, y = 0.15, mat, parent, edge = null }) {
  const g = new THREE.Group(); bx(x0, 0, z0, x1, y, z1, mat, g); if (edge) { bx(x0, y, z0, x1, y + 0.005, z0 + 0.02, edge, g, { cast: false }); }
  parent?.add(g); return g;
}

// ------------------------------------------------------------------------------------------------ neighbours / context
/** A plain-but-credible neighbour house front: facade with windows, parapet, tank. */
export function neighbour({ x0, x1, zF = 0, depth = 12, floors = 2, storeyH = 3.2, wall = 0xd5cfc2, accent = 0x6b6258, seed = 1, parent, windows = 'punched', glow = 0, glassMat, roof = 'flat', boundary = true, zWall = 6, wallH = 1.6, tank = true, frameCol = 0x2a2c2f }) {
  const g = new THREE.Group(), r = rng(seed), W = x1 - x0, H = floors * storeyH;
  const pm = T.plaster(wall, { tileM: 3, seed: 20 + seed }), acc = T.plaster(accent, { tileM: 3, seed: 30 + seed, roughness: 0.8 }), cap = T.concrete(0xa9a69f, { tileM: 2, seed: 40 + seed });
  const ops = [];
  for (let f = 0; f < floors; f++) {
    const n = Math.max(1, Math.round(W / 3.4)), ww = Math.min(2.0, W / n * 0.55);
    for (let i = 0; i < n; i++) { const cx = x0 + (W * (i + 0.5)) / n + (f % 2 ? 0.2 : 0); ops.push({ x: cx - ww / 2, y: f * storeyH + 0.9, w: ww, h: 1.5 + (r() > 0.5 ? 0.3 : 0), f }); }
  }
  const clean = ops.map(({ x, y, w, h }) => ({ x, y, w, h }));
  facade({ x0, x1, y0: 0, y1: H, z: zF, t: 0.3, mat: pm, openings: clean, parent: g });
  shell({ x0, x1, y0: 0, y1: H, zF: zF - 0.3, zB: zF - depth, side: pm, roofMat: cap, parent: g });
  ops.forEach((o, i) => { glazing({ x: o.x, y: o.y, w: o.w, h: o.h, z: zF, cols: o.w > 1.5 ? 2 : 1, frame: frameCol, glassMat, parent: g }); if (glow) room({ x0: o.x - 0.3, x1: o.x + o.w + 0.3, floorY: o.f * storeyH, ceilY: (o.f + 1) * storeyH - 0.2, zF: zF - 0.3, depth: 3.5, glow, style: i % 2 ? 'bed' : 'living', seed: seed * 10 + i, parent: g }); else bx(o.x + 0.05, o.y + 0.05, zF - 0.5, o.x + o.w - 0.05, o.y + o.h - 0.05, zF - 0.45, T.solid(0x2a2e33, { roughness: 1 }), g, { cast: false }); });
  for (let f = 1; f < floors; f++) bx(x0 - 0.04, f * storeyH - 0.1, zF - 0.04, x1 + 0.04, f * storeyH + 0.1, zF + 0.06, acc, g);
  parapet({ x0, x1, zF: zF + 0.0, zB: zF - depth, y: H, h: 0.9, t: 0.2, mat: pm, cap, parent: g });
  if (tank) waterTankLite(x0 + W * (0.2 + r() * 0.6), H, zF - depth * 0.6, g);
  if (boundary) {
    bx(x0, 0, zWall - 0.1, x1, wallH, zWall + 0.1, pm, g); bx(x0 - 0.03, wallH, zWall - 0.14, x1 + 0.03, wallH + 0.06, zWall + 0.14, cap, g);
    if (r() > 0.4) { const gx = x0 + W * (0.15 + r() * 0.4); bx(gx, 0.05, zWall - 0.03, gx + 3.0, 1.9, zWall + 0.05, T.solid(0x2a2c30, { roughness: 0.5, metalness: 0.6 }), g); }
    ground(x0, zF, x1, zWall, 0.012, T.paving({ color: 0xaaa69a, tileM: 2.4, n: 6, seed: 60 + seed }), g);
  }
  parent?.add(g); return g;
}
export function waterTankLite(x, y, z, parent, { r = 0.55, h = 1.1 } = {}) {
  const g = new THREE.Group(), m = T.solid(0x1d1f22, { roughness: 0.5 }), plinth = T.concrete(0x8e8e8a, { tileM: 2 });
  cyl(x, y + 0.25 + h / 2, z, r, r, h, m, g, { seg: 32 }); cyl(x, y + 0.25 + h + 0.05, z, r * 0.7, r, 0.14, m, g); cyl(x, y + 0.25 + h + 0.17, z, r * 0.18, r * 0.2, 0.1, m, g);
  bx(x - r * 0.8, y, z - r * 0.8, x + r * 0.8, y + 0.25, z + r * 0.8, plinth, g); parent?.add(g); return g;
}
export function acCondenser(x, y, z, parent, { rot = 0 } = {}) {
  const g = new THREE.Group(); bx(-0.45, 0, -0.17, 0.45, 0.65, 0.17, T.solid(0xe3e1dc, { roughness: 0.5 }), g);
  const fan = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.02, 24), T.solid(0x232323, { roughness: 0.6 })); fan.rotation.x = Math.PI / 2; fan.position.set(0, 0.33, 0.175); g.add(fan);
  bx(-0.4, 0.7, -0.1, -0.38, 0.72, 0.1, T.solid(0x222), g, { cast: false }); g.position.set(x, y, z); g.rotation.y = rot; parent?.add(g); return g;
}

/** Row of background trees across depth with varied size/colour. */
export function treeRow(list, parent) { for (const t of list) tree(t.x, t.z, { h: t.h ?? 8, crown: t.crown ?? 3.4, color: t.color ?? 0x4a7f35, seed: t.seed ?? 3, lean: t.lean ?? 0, trunkR: t.trunkR ?? 0.2 }, parent); }

// ------------------------------------------------------------------------------------------------ cars (lofted bodies)
function interp(tbl, x) { // piecewise smooth (smoothstep between control points) table [[x, v], ...]
  if (x <= tbl[0][0]) return tbl[0][1]; if (x >= tbl[tbl.length - 1][0]) return tbl[tbl.length - 1][1];
  for (let i = 0; i < tbl.length - 1; i++) if (x <= tbl[i + 1][0]) { const t = (x - tbl[i][0]) / (tbl[i + 1][0] - tbl[i][0]), k = t * t * (3 - 2 * t); return tbl[i][1] + (tbl[i + 1][1] - tbl[i][1]) * (0.6 * k + 0.4 * t); }
}
function loft(xs, loopAt, matAt, mats) {
  const pos = [], idx = [], groups = []; let M = 0;
  xs.forEach((x) => { const loop = loopAt(x); M = loop.length; for (const [z, y] of loop) pos.push(x, y, z); });
  const quads = []; for (let i = 0; i < xs.length - 1; i++) for (let j = 0; j < M; j++) { const j2 = (j + 1) % M, a = i * M + j, b = i * M + j2, c = (i + 1) * M + j2, d = (i + 1) * M + j; quads.push({ a, b, c, d, m: matAt((xs[i] + xs[i + 1]) / 2, j, M) }); }
  for (let mi = 0; mi < mats.length; mi++) { const start = idx.length; for (const q of quads) if (q.m === mi) idx.push(q.a, q.b, q.c, q.a, q.c, q.d); if (idx.length > start) groups.push({ start, count: idx.length - start, mi }); }
  // end caps (fan)
  const capStart = idx.length; const c0 = pos.length / 3; let cy = 0, cz = 0; for (let j = 0; j < M; j++) { cz += pos[j * 3 + 2]; cy += pos[j * 3 + 1]; } pos.push(xs[0], cy / M, cz / M);
  for (let j = 0; j < M; j++) idx.push(c0, (j + 1) % M, j);
  const c1 = pos.length / 3, o = (xs.length - 1) * M; cy = 0; cz = 0; for (let j = 0; j < M; j++) { cz += pos[(o + j) * 3 + 2]; cy += pos[(o + j) * 3 + 1]; } pos.push(xs[xs.length - 1], cy / M, cz / M);
  for (let j = 0; j < M; j++) idx.push(c1, o + j, o + (j + 1) % M);
  groups.push({ start: capStart, count: idx.length - capStart, mi: 0 });
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
  for (const gr of groups) g.addGroup(gr.start, gr.count, gr.mi);
  return g;
}
function rrect(hw, y0, y1, rb, rt, n = 4) { // rounded rectangle loop in (z,y), counter-clockwise starting bottom-left
  const pts = []; const arc = (cz, cy, r, a0, a1) => { for (let i = 0; i <= n; i++) { const a = a0 + (a1 - a0) * (i / n); pts.push([cz + Math.cos(a) * r, cy + Math.sin(a) * r]); } };
  rb = Math.min(rb, hw * 0.9, (y1 - y0) * 0.45); rt = Math.min(rt, hw * 0.9, (y1 - y0) * 0.45);
  arc(-hw + rb, y0 + rb, rb, Math.PI * 1.0, Math.PI * 1.5); arc(hw - rb, y0 + rb, rb, Math.PI * 1.5, Math.PI * 2.0); arc(hw - rt, y1 - rt, rt, 0, Math.PI * 0.5); arc(-hw + rt, y1 - rt, rt, Math.PI * 0.5, Math.PI);
  return pts;
}

export function car({ x = 0, z = 0, rot = 0, color = 0xe9e9ea, type = 'sedan', parent, y = 0, lit = false }) {
  const g = new THREE.Group(), suv = type === 'suv', L = suv ? 4.8 : 4.6, hl = L / 2, Wd = suv ? 1.92 : 1.8, hw = Wd / 2;
  const paint = new THREE.MeshPhysicalMaterial({ color, metalness: 0.25, roughness: 0.38, clearcoat: 0.8, clearcoatRoughness: 0.08, envMapIntensity: 1.3 }); paint.userData.tileM = 1;
  const gl = new THREE.MeshPhysicalMaterial({ color: 0x0c1218, roughness: 0.05, metalness: 0.4, clearcoat: 1, envMapIntensity: 2.2 }), blk = T.solid(0x0b0b0c, { roughness: 0.65 }), rubber = T.solid(0x131314, { roughness: 0.9 }), rim = coat(0x7b7e83, { roughness: 0.4, metalness: 0.8 });
  const belt = suv ? 1.08 : 0.97, roofH = suv ? 1.78 : 1.46, sill = suv ? 0.3 : 0.24;
  const tTop = suv ? [[-hl, 0.62], [-hl + 0.08, 0.95], [-hl + 0.3, 1.04], [-1.2, belt + 0.02], [1.0, belt], [1.55, belt - 0.0], [2.05, belt - 0.12], [hl - 0.12, belt - 0.32], [hl, 0.62]]
    : [[-hl, 0.56], [-hl + 0.07, 0.8], [-hl + 0.32, 0.95], [-1.3, belt], [0.95, belt - 0.0], [1.55, belt - 0.08], [2.05, belt - 0.2], [hl - 0.1, belt - 0.4], [hl, 0.58]];
  const tBot = [[-hl, 0.46], [-hl + 0.2, sill + 0.06], [-hl + 0.6, sill], [hl - 0.6, sill], [hl - 0.2, sill + 0.06], [hl, 0.44]];
  const tW = [[-hl, hw * 0.78], [-hl + 0.15, hw * 0.93], [-hl + 0.5, hw], [hl - 0.5, hw], [hl - 0.15, hw * 0.94], [hl, hw * 0.8]];
  const xs = []; for (let i = 0; i <= 70; i++) xs.push(-hl + (L * i) / 70);
  const lower = new THREE.Mesh(loft(xs, (xx) => rrect(interp(tW, xx), interp(tBot, xx), interp(tTop, xx), 0.1, 0.16 + 0.05 * Math.min(1, Math.abs(xx) / hl), 4), () => 0, [paint]), paint); lower.castShadow = lower.receiveShadow = true; g.add(lower);
  // greenhouse
  const cx0 = suv ? -2.08 : -1.62, cx1 = suv ? 0.95 : 0.98, rA = suv ? 0.62 : 0.2, rB = suv ? -1.65 : -0.95; // roof start/end
  const cxs = []; for (let i = 0; i <= 50; i++) cxs.push(cx0 + ((cx1 - cx0) * i) / 50);
  const yr = (xx) => { const front = interp([[rA - (suv ? 0.8 : 0.85), roofH], [rA, roofH], [cx1, belt - 0.01]], xx); if (xx > rA) return interp([[rA, roofH], [cx1, belt + 0.0]], xx); if (xx < rB) return interp([[rB, roofH], [cx0, suv ? belt + 0.1 : belt - 0.02]], xx); return roofH; void front; };
  const cabMat = (xx, j, M) => { const side = j <= 1 || (j >= 6 && j < 8); if (side) { const bPillar = xx > (suv ? -0.95 : -0.5) && xx < (suv ? -0.8 : -0.37), aPil = xx > cx1 - 0.15, cPil = xx < (suv ? -1.95 : -1.5) + 0.0; return bPillar || aPil || cPil ? 0 : 1; } if (j >= 8) return 0; return (xx > rA + 0.03 || xx < rB - 0.03) ? 1 : 0; };
  const cabin = new THREE.Mesh(loft(cxs, (xx) => { const yy = yr(xx), wBot = hw - 0.07, wTop = hw - (suv ? 0.2 : 0.26), by = interp(tTop, xx) - 0.02; return [[-wBot, by], [-wTop - 0.04, (by + yy) / 2 + 0.05], [-wTop, yy - 0.05], [-wTop * 0.55, yy - 0.012], [0, yy], [wTop * 0.55, yy - 0.012], [wTop, yy - 0.05], [wTop + 0.04, (by + yy) / 2 + 0.05], [wBot, by]]; }, cabMat, [paint, gl]), [paint, gl]); cabin.castShadow = true; g.add(cabin);
  for (const s of [-1, 1]) {
    // wheels, arches
    for (const wx of [hl - 0.98, -hl + 0.95]) {
      const arch = new THREE.Mesh(new THREE.CylinderGeometry(suv ? 0.47 : 0.43, suv ? 0.47 : 0.43, 0.03, 28), blk); arch.rotation.x = Math.PI / 2; arch.position.set(wx, 0.34, s * (hw + 0.0)); g.add(arch);
      const tyre = new THREE.Mesh(new THREE.CylinderGeometry(suv ? 0.375 : 0.33, suv ? 0.375 : 0.33, 0.24, 30), rubber); tyre.rotation.x = Math.PI / 2; tyre.position.set(wx, suv ? 0.375 : 0.33, s * (hw - 0.07)); tyre.castShadow = true; g.add(tyre);
      const rm = new THREE.Mesh(new THREE.CylinderGeometry(suv ? 0.25 : 0.225, suv ? 0.25 : 0.225, 0.02, 24), rim); rm.rotation.x = Math.PI / 2; rm.position.set(wx, suv ? 0.375 : 0.33, s * (hw + 0.05)); g.add(rm);
      const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.02, 12), blk); hub.rotation.x = Math.PI / 2; hub.position.set(wx, suv ? 0.375 : 0.33, s * (hw + 0.065)); g.add(hub);
    }
    // door shut lines, handles, mirrors
    for (const dx of [-0.35, suv ? -1.5 : -1.3, 0.85]) bx(dx - 0.006, sill + 0.08, s * (hw + 0.002) - 0.004, dx + 0.006, belt - 0.03, s * (hw + 0.002) + 0.004, blk, g, { cast: false });
    for (const dx of [0.0, suv ? -1.2 : -1.0]) bx(dx - 0.1, belt - 0.14, s * (hw + 0.005) - 0.01, dx + 0.1, belt - 0.11, s * (hw + 0.005) + 0.01, coat(0x9a9da1), g, { cast: false });
    bx(cx1 - 0.35, belt - 0.0, s * (hw + 0.02) - 0.09, cx1 - 0.1, belt + 0.14, s * (hw + 0.02) + 0.09, paint, g);
    // head/tail lights
    bx(hl - 0.12, belt - 0.5, s * 0.62 - 0.17, hl - 0.0, belt - 0.4, s * 0.62 + 0.17, T.emissive(lit ? 0xfff0d6 : 0xcfd6de, lit ? 14 : 0.6), g, { cast: false });
    bx(-hl + 0.0, belt - 0.46, s * 0.64 - 0.2, -hl + 0.1, belt - 0.36, s * 0.64 + 0.2, T.emissive(0xc01810, lit ? 6 : 0.5), g, { cast: false });
  }
  // grille, bumpers, plates, lower valance
  bx(hl - 0.14, 0.38, -0.5, hl + 0.01, 0.62, 0.5, blk, g, { cast: false });
  bx(hl - 0.35, sill - 0.04, -hw * 0.82, hl - 0.0, sill + 0.14, hw * 0.82, blk, g, { cast: false }); bx(-hl + 0.0, sill - 0.04, -hw * 0.82, -hl + 0.35, sill + 0.14, hw * 0.82, blk, g, { cast: false });
  const pl = T.solid(0xefefea, { roughness: 0.4 }); bx(-hl - 0.015, 0.5, -0.26, -hl + 0.02, 0.62, 0.26, pl, g, { cast: false }); bx(hl - 0.01, 0.3, -0.26, hl + 0.03, 0.42, 0.26, pl, g, { cast: false });
  bx(-hl + 0.5, sill - 0.05, -hw + 0.1, hl - 0.5, sill + 0.05, hw - 0.1, blk, g, { cast: false });
  g.position.set(x, y, z); g.rotation.y = rot; parent?.add(g); return g;
}

// ------------------------------------------------------------------------------------------------ misc greenery
export function planterBed({ x0, z0, x1, z1, h = 0.5, mat, y = 0, plants = 'mixed', seed = 1, parent, soil = 0x2e2118, bushes = 3, edge = null, grass = false }) {
  const g = new THREE.Group(), r = rng(seed); bx(x0, y, z0, x1, y + h, z1, mat, g); const sm = T.solid(soil, { roughness: 1 }); bx(x0 + 0.05, y + h - 0.03, z0 + 0.05, x1 - 0.05, y + h + 0.002, z1 - 0.05, sm, g, { cast: false });
  const W = x1 - x0, D = z1 - z0;
  if (plants === 'hedge') hedge(x0 + 0.1, (z0 + z1) / 2, x1 - 0.1, (z0 + z1) / 2, { h: 0.55, w: Math.min(0.5, D - 0.2), y: y + h, density: 70, seed, color: 0x45803a }, g);
  else for (let i = 0; i < bushes; i++) bush(x0 + 0.2 + r() * (W - 0.4), y + h - 0.05, z0 + 0.2 + r() * (D - 0.4), 0.28 + r() * 0.25, g, { seed: seed + i * 7, color: [0x3d7733, 0x4b8a3b, 0x58903f][i % 3] });
  void edge; void grass; parent?.add(g); return g;
}
export function sky(sk, { coverage = 0.18, density = 0.35, scale = 0.0003, elevation = 0.55 } = {}) {
  const u = sk.material.uniforms; if (u.cloudCoverage) { u.cloudCoverage.value = coverage; u.cloudDensity.value = density; u.cloudScale.value = scale; u.cloudElevation.value = elevation; }
}

// ------------------------------------------------------------------------------------------------ custom sky dome (background only; lighting still comes from env.mjs' physical sky)
export function skyDome(scene, { zenith = 0x5f93cf, horizon = 0xdfe9f2, ground = 0xcfd6dc, sunElevation = 35, sunAzimuth = 300, sunColor = 0xfff2dc, glow = 0.35, disc = 0, cloudCover = 0.45, cloudScale = 2.2, cloudBright = 1.0, cloudShadow = 0xa7b4c4, cloudTint = 0xffffff, scale = 1.0, seed = 3, horizonBand = 0.22, haze = 0.0, gain = 3.2 } = {}) {
  const sunDir = new THREE.Vector3(); sunDir.setFromSphericalCoords(1, THREE.MathUtils.degToRad(90 - sunElevation), THREE.MathUtils.degToRad(sunAzimuth));
  const col = (c) => new THREE.Color(c);
  const m = new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { zenith: { value: col(zenith) }, horizon: { value: col(horizon) }, gcol: { value: col(ground) }, sunDir: { value: sunDir }, sunCol: { value: col(sunColor) }, glow: { value: glow }, disc: { value: disc }, cover: { value: cloudCover }, cscale: { value: cloudScale }, cbright: { value: cloudBright }, cshadow: { value: col(cloudShadow) }, ctint: { value: col(cloudTint) }, scale: { value: scale }, seed: { value: seed }, band: { value: horizonBand }, haze: { value: haze }, gain: { value: gain } },
    vertexShader: 'varying vec3 vDir; void main(){ vDir = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: `varying vec3 vDir; uniform vec3 zenith, horizon, gcol, sunDir, sunCol, cshadow, ctint; uniform float glow, disc, cover, cscale, cbright, scale, seed, band, haze, gain;
      float h21(vec2 p){ p = fract(p*vec2(123.34, 456.21) + seed); p += dot(p, p+45.32); return fract(p.x*p.y); }
      float vn(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f); return mix(mix(h21(i),h21(i+vec2(1,0)),f.x), mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),f.x), f.y); }
      float fbm(vec2 p){ float a=.5, s=0.; for(int i=0;i<6;i++){ s+=a*vn(p); p=p*2.03+vec2(17.1,9.3); a*=.5; } return s; }
      void main(){
        vec3 d = normalize(vDir); float y = d.y;
        float t = pow(clamp(y,0.,1.), 0.4);
        vec3 col = mix(horizon, zenith, smoothstep(0.0, 1.0, t*(1.0+band)-band*0.6));
        float s = max(dot(d, sunDir), 0.0);
        col += sunCol * glow * (pow(s, 4.0)*0.25 + pow(s, 24.0)*0.55 + pow(s, 220.0)*1.4);
        col += sunCol * disc * smoothstep(0.99985, 0.9999, s) ;
        // clouds
        if (y > 0.0) {
          vec2 uv = d.xz / (y*0.55 + 0.22) * cscale * 0.35 * scale;
          float n = fbm(uv + vec2(3.0, 1.0)); float n2 = fbm(uv*2.3 + 7.0);
          float cl = smoothstep(1.0 - cover - 0.1, 1.0 - cover + 0.32, n*0.8 + n2*0.28);
          cl *= smoothstep(0.0, 0.14, y);
          float light = clamp(0.55 + 0.9*(fbm(uv*1.15 + sunDir.xz*0.25) - n)*3.0 + pow(s,3.0)*0.5, 0.0, 1.2);
          vec3 cc = mix(cshadow, ctint*cbright, clamp(light,0.0,1.0));
          cc += sunCol * pow(s, 10.0) * 0.35 * cl;
          col = mix(col, cc, cl * 0.92);
        }
        float hz = exp(-abs(y)*9.0); col = mix(col, horizon*(1.0+haze), hz*0.55*clamp(1.0,0.,1.));
        if (y < 0.0) col = mix(col, gcol, smoothstep(0.0, -0.08, y));
        gl_FragColor = vec4(col * gain, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  });
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(3000, 48, 24), m); mesh.renderOrder = -10; mesh.frustumCulled = false; scene.add(mesh); return mesh;
}

/** Hazy tree-line silhouette billboard to avoid a bare horizon. spans x0..x1 at depth z, base y, height hMax. */
export function treeline({ scene, x0 = -200, x1 = 200, z = -120, y = -1, hMax = 26, color = '#7d9279', haze = '#c9d6dd', seed = 5, layers = 2, hMin = 9, bright = 3.0 }) {
  for (let L = 0; L < layers; L++) {
    const r = rng(seed + L * 11), cw = 2048, ch = 256;
    const map = canvasTex(ch * 0 + cw, ch, (c, w, h) => {
      c.clearRect(0, 0, w, h);
      let x = 0; while (x < w) {
        const rad = 22 + r() * 46, top = h * (0.18 + r() * 0.5) * (1 - L * 0.15), cy = top + rad;
        const g = c.createRadialGradient(x, cy - rad * 0.3, rad * 0.1, x, cy, rad * 1.1);
        const a = L === 0 ? 0.0 : 0.0; void a;
        g.addColorStop(0, L ? color : color); g.addColorStop(1, color);
        c.fillStyle = color; c.beginPath(); c.ellipse(x, cy, rad, rad * 1.0, 0, 0, 6.3); c.fill();
        c.fillRect(x - rad * 0.12, cy, rad * 0.24, h - cy);
        x += rad * (0.7 + r() * 0.6);
      }
      c.fillStyle = color; c.fillRect(0, h * 0.78, w, h * 0.22);
      c.globalCompositeOperation = 'source-atop'; const hz = c.createLinearGradient(0, 0, 0, h); hz.addColorStop(0, haze + 'cc'); hz.addColorStop(0.7, haze + '55'); hz.addColorStop(1, haze + '00'); c.fillStyle = hz; c.fillRect(0, 0, w, h);
    }, { repeat: false });
    const mat = new THREE.MeshBasicMaterial({ map, transparent: true, depthWrite: false, fog: false }); mat.color.setScalar(bright);
    const hh = hMax * (1 - L * 0.28), p = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0, hh), mat); p.position.set((x0 + x1) / 2, y + hh / 2, z - L * 30); scene.add(p); void hMin;
  }
}

/** archCamera wrapper: env.mjs sets the focal length before the aspect is known, so `focal` there is off by the aspect ratio. Here `focal` = true 35mm-equivalent HORIZONTAL focal length. */
export function cam({ pos, target, focal = 28, shift = 0, shiftX = 0, w, h, keepLevel = true }) { return archCamera({ pos, target, focal: focal * (w / h), shift, shiftX, w, h, keepLevel }); }

// ------------------------------------------------------------------------------------------------ better vegetation (leaf cards with baked variation, ragged crowns, sky gaps)
const _leafMats = {};
function leafMat(kind) {
  if (_leafMats[kind]) return _leafMats[kind];
  const pal = { neem: [[88, 40, 26], [100, 48, 40]], broad: [[82, 45, 30], [96, 55, 46]], euc: [[100, 22, 38], [112, 28, 52]], flower: [[330, 70, 48], [340, 80, 58]], flowerO: [[20, 85, 52], [30, 90, 60]], shrub: [[95, 45, 26], [106, 52, 40]], gul: [[96, 55, 32], [84, 60, 48]] }[kind] || [[88, 40, 26], [100, 48, 40]];
  const map = canvasTex(512, 512, (c, w, h) => {
    const r = rng(kind.length * 31 + 5); c.clearRect(0, 0, w, h);
    const n = kind === 'euc' ? 90 : 190;
    for (let i = 0; i < n; i++) {
      const px = 16 + r() * (w - 32), py = 16 + r() * (h - 32), len = (kind === 'euc' ? 74 : kind.startsWith('flower') ? 30 : 38) + r() * 24, wid = len * (kind === 'euc' ? 0.22 : 0.45), a = r() * 6.28;
      const k = r(), hh = pal[0][0] + (pal[1][0] - pal[0][0]) * k, ss = pal[0][1] + (pal[1][1] - pal[0][1]) * k, ll = pal[0][2] + (pal[1][2] - pal[0][2]) * r();
      c.save(); c.translate(px, py); c.rotate(a); c.fillStyle = `hsl(${hh},${ss}%,${ll}%)`; c.beginPath(); c.moveTo(-len / 2, 0); c.quadraticCurveTo(0, -wid, len / 2, 0); c.quadraticCurveTo(0, wid, -len / 2, 0); c.fill();
      if (!kind.startsWith('flower')) { c.strokeStyle = `hsl(${hh},${ss}%,${ll + 12}%)`; c.lineWidth = 1; c.beginPath(); c.moveTo(-len / 2, 0); c.lineTo(len / 2 * 0.9, 0); c.stroke(); }
      c.restore();
    }
  });
  const m = new THREE.MeshStandardMaterial({ map, alphaTest: 0.5, alphaToCoverage: true, side: THREE.DoubleSide, roughness: 0.78, metalness: 0 });
  return (_leafMats[kind] = m);
}
const _card = new THREE.PlaneGeometry(1, 1);
function scatter(parent, n, fn, { kind = 'broad', tint = 0xffffff } = {}) {
  const im = new THREE.InstancedMesh(_card, leafMat(kind).clone(), n), d = new THREE.Object3D(), col = new THREE.Color(), base = new THREE.Color(tint), up = new THREE.Vector3(0, 0, 1), q = new THREE.Quaternion(), r = rng(n * 7 + 3);
  let k = 0;
  for (let i = 0; i < n; i++) {
    const p = fn(i, r); if (!p) continue;
    d.position.copy(p.pos); const nn = p.out.clone().multiplyScalar(0.55).add(new THREE.Vector3(r() - 0.5, r() - 0.5, r() - 0.5).multiplyScalar(1.5)).normalize();
    q.setFromUnitVectors(up, nn); d.quaternion.copy(q); d.rotateZ(r() * 6.28); d.scale.setScalar(p.s); d.updateMatrix(); im.setMatrixAt(k, d.matrix);
    col.copy(base).multiplyScalar(p.shade); im.setColorAt(k, col); k++;
  }
  im.count = k; im.castShadow = true; im.receiveShadow = true; im.frustumCulled = false; parent?.add(im); return im;
}
/** Better broadleaf tree. kind: 'neem' (dense round), 'umbrella' (wide, flat gulmohar/shisham), 'tall' (eucalyptus-like narrow). */
export function crownTree(x, z, { h = 8, crown = 3, kind = 'neem', seed = 1, y = 0, tint = 0xffffff, trunkR = 0.2, lean = 0, size = 1 } = {}, parent) {
  const g = new THREE.Group(), r = rng(seed * 101 + 13), bark = new THREE.MeshStandardMaterial({ color: 0x5a4a3c, roughness: 1 }); bark.userData.tileM = 1;
  const th = h * (kind === 'tall' ? 0.5 : kind === 'umbrella' ? 0.42 : 0.4), leafKind = kind === 'tall' ? 'euc' : kind === 'umbrella' ? 'gul' : 'neem';
  const tx = (t) => x + lean * t * t;
  // trunk
  const tg = new THREE.CylinderGeometry(trunkR * 0.55, trunkR * 1.15, th, 10, 1); const trunk = new THREE.Mesh(tg, bark); trunk.position.set(tx(0.5), y + th / 2, z); trunk.rotation.z = -lean * 0.9 / th; trunk.castShadow = true; g.add(trunk);
  // limbs -> sub-crowns
  const nL = kind === 'tall' ? 5 : kind === 'umbrella' ? 6 : 7, lobes = [];
  for (let i = 0; i < nL; i++) {
    const a = (i / nL) * 6.28 + r() * 0.8, spread = crown * (kind === 'umbrella' ? 0.62 : kind === 'tall' ? 0.22 : 0.42) * (0.5 + r() * 0.7);
    const lh = kind === 'tall' ? th + (h - th) * (0.1 + 0.8 * (i / nL)) : th + (h - th) * (0.3 + r() * 0.55) * (kind === 'umbrella' ? 0.45 : 1) + (kind === 'umbrella' ? 0.2 * crown : 0);
    const rad = crown * (kind === 'tall' ? 0.42 : kind === 'umbrella' ? 0.5 : 0.52) * (0.75 + r() * 0.5);
    lobes.push({ cx: x + lean + Math.cos(a) * spread, cz: z + Math.sin(a) * spread, cy: y + lh, rad, ry: kind === 'umbrella' ? rad * 0.5 : kind === 'tall' ? rad * 1.5 : rad * 0.85 });
    const bl = Math.hypot(Math.cos(a) * spread, Math.sin(a) * spread, lh - th), br = new THREE.Mesh(new THREE.CylinderGeometry(trunkR * 0.14, trunkR * 0.36, bl, 6), bark);
    br.position.set(x + lean * 0.8 + Math.cos(a) * spread * 0.5, y + th + (lh - th) * 0.5, z + Math.sin(a) * spread * 0.5); br.lookAt(x + lean + Math.cos(a) * spread, y + lh, z + Math.sin(a) * spread); br.rotateX(Math.PI / 2); br.castShadow = true; g.add(br);
  }
  const leafTint = new THREE.Color(tint);
  for (const l of lobes) {
    const n = Math.round(1100 * (l.rad * l.rad) * size), center = new THREE.Vector3(l.cx, l.cy, l.cz);
    scatter(g, n, (i, rr) => {
      const u = rr() * 6.28, v = Math.acos(2 * rr() - 1), kk = Math.cbrt(0.28 + rr() * 0.72), o = new THREE.Vector3(Math.sin(v) * Math.cos(u), Math.cos(v), Math.sin(v) * Math.sin(u));
      const rough = 0.72 + 0.55 * Math.abs(Math.sin(u * 3.1 + l.cx) * Math.cos(v * 2.3 + l.cz)); const kr = kk * rough;
      if (kk < 0.62 && rr() < 0.35) return null; // hollow inside -> sky glints
      const pos = new THREE.Vector3(l.cx + o.x * l.rad * kr, l.cy + o.y * l.ry * kr, l.cz + o.z * l.rad * kr);
      const top = Math.max(0, o.y), shade = (0.38 + 0.85 * kk) * (0.62 + 0.55 * top) * (0.85 + rr() * 0.35);
      return { pos, out: o, s: (kind === 'tall' ? 0.5 : 0.42 + rr() * 0.22) * (0.9 + rr() * 0.4), shade };
    }, { kind: leafKind, tint: leafTint.getHex() });
    void center;
  }
  parent?.add(g); return g;
}
/** Flowering shrub / bougainvillea-style mass. flower: 'flower' (magenta) | 'flowerO' (orange) | 'shrub' (green). */
export function flowerMass({ x0, x1, y0, y1, z, depth = 0.35, kind = 'flower', seed = 1, density = 900, parent, mixGreen = 0.35 }) {
  const g = new THREE.Group(), r = rng(seed);
  const W = x1 - x0, Hh = y1 - y0, n = Math.round(W * Hh * density);
  scatter(g, n, (i, rr) => ({ pos: new THREE.Vector3(x0 + rr() * W, y0 + rr() * Hh, z + (rr() - 0.3) * depth), out: new THREE.Vector3(0, 0.2, 1), s: 0.22 + rr() * 0.2, shade: 0.8 + rr() * 0.35 }), { kind });
  scatter(g, Math.round(n * mixGreen), (i, rr) => ({ pos: new THREE.Vector3(x0 + rr() * W, y0 + rr() * Hh, z + (rr() - 0.5) * depth), out: new THREE.Vector3(0, 0.2, 1), s: 0.26 + rr() * 0.18, shade: 0.7 + rr() * 0.3 }), { kind: 'shrub' });
  void r; parent?.add(g); return g;
}
/** Dense clipped shrub mound (hedge ball). */
export function mound(x, y, z, rad = 0.6, parent, { kind = 'shrub', seed = 1, tint = 0xffffff, sy = 0.8 } = {}) {
  const g = new THREE.Group(), n = Math.round(1300 * rad * rad);
  scatter(g, n, (i, rr) => { const u = rr() * 6.28, v = Math.acos(rr()), k = Math.cbrt(0.4 + rr() * 0.6), o = new THREE.Vector3(Math.sin(v) * Math.cos(u), Math.cos(v), Math.sin(v) * Math.sin(u)); return { pos: new THREE.Vector3(x + o.x * rad * k, y + o.y * rad * sy * k + 0.05, z + o.z * rad * k), out: o, s: 0.2 + rr() * 0.12, shade: (0.55 + 0.5 * o.y + 0.25 * k) * (0.9 + rr() * 0.2) }; }, { kind, tint });
  parent?.add(g); return g;
}
/** Low clipped hedge / grass strip using cards. */
export function hedgeRow(x0, z0, x1, z1, { h = 0.7, w = 0.5, y = 0, kind = 'shrub', seed = 1, tint = 0xffffff, density = 2200 } = {}, parent) {
  const g = new THREE.Group(), len = Math.hypot(x1 - x0, z1 - z0), dx = (x1 - x0) / len, dz = (z1 - z0) / len, n = Math.round(len * h * density * 0.25);
  scatter(g, n, (i, rr) => { const t = rr() * len, hh = rr(), sd = (rr() - 0.5) * w; return { pos: new THREE.Vector3(x0 + dx * t - dz * sd, y + 0.05 + hh * h, z0 + dz * t + dx * sd), out: new THREE.Vector3(-dz * Math.sign(sd || 1), 0.4, dx * Math.sign(sd || 1)).normalize(), s: 0.18 + rr() * 0.12, shade: 0.55 + 0.5 * hh }; }, { kind, tint });
  parent?.add(g); return g;
}
