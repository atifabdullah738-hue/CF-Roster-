// Architectural building blocks. Units are METRES. +X = right, +Y = up, +Z = towards the camera/street
// (so a house front faces +Z). Textures are mapped in world space, so adjacent pieces stay seamless.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import * as T from './textures.mjs';

export { THREE, T };

function worldUV(geo, tile) {
  const pos = geo.attributes.position, nor = geo.attributes.normal, uv = geo.attributes.uv;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i), nx = Math.abs(nor.getX(i)), ny = Math.abs(nor.getY(i)), nz = Math.abs(nor.getZ(i));
    if (nx >= ny && nx >= nz) uv.setXY(i, z / tile, y / tile);
    else if (ny >= nx && ny >= nz) uv.setXY(i, x / tile, z / tile);
    else uv.setXY(i, x / tile, y / tile);
  }
  uv.needsUpdate = true;
}

/** Axis-aligned box between corners. Adds to `parent` (optional) and returns the mesh. */
export function boxAt(x0, y0, z0, x1, y1, z1, mat, parent, { cast = true, receive = true } = {}) {
  const w = Math.abs(x1 - x0), h = Math.abs(y1 - y0), d = Math.abs(z1 - z0);
  const geo = new THREE.BoxGeometry(w, h, d);
  geo.translate((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
  worldUV(geo, mat.userData.tileM || 1);
  const m = new THREE.Mesh(geo, mat); m.castShadow = cast; m.receiveShadow = receive;
  parent?.add(m); return m;
}

/** Rounded box centred at (cx,cy,cz). */
export function roundBox(cx, cy, cz, w, h, d, r, mat, parent, { cast = true, receive = true, seg = 3 } = {}) {
  const geo = new RoundedBoxGeometry(w, h, d, seg, Math.min(r, w / 2 - 1e-3, h / 2 - 1e-3, d / 2 - 1e-3));
  geo.translate(cx, cy, cz); worldUV(geo, mat.userData.tileM || 1);
  const m = new THREE.Mesh(geo, mat); m.castShadow = cast; m.receiveShadow = receive; parent?.add(m); return m;
}

export function cyl(cx, cy, cz, rTop, rBot, h, mat, parent, { seg = 24, cast = true } = {}) {
  const g = new THREE.CylinderGeometry(rTop, rBot, h, seg); g.translate(cx, cy, cz);
  const m = new THREE.Mesh(g, mat); m.castShadow = cast; m.receiveShadow = true; parent?.add(m); return m;
}

/** Horizontal ground plane at y with world-mapped texture. */
export function ground(x0, z0, x1, z1, y, mat, parent) {
  const g = new THREE.PlaneGeometry(Math.abs(x1 - x0), Math.abs(z1 - z0)); g.rotateX(-Math.PI / 2); g.translate((x0 + x1) / 2, y, (z0 + z1) / 2);
  worldUV(g, mat.userData.tileM || 1);
  const m = new THREE.Mesh(g, mat); m.receiveShadow = true; parent?.add(m); return m;
}

/**
 * Wall panel in the XY plane between x0..x1, y0..y1, thickness t from z0 (front face at z0+t... back at z0),
 * with rectangular openings [{x,y,w,h}] (x,y = bottom-left corner in wall coordinates, world units).
 */
export function wallWithOpenings(x0, x1, y0, y1, z0, t, openings, mat, parent) {
  const xs = new Set([x0, x1]), ys = new Set([y0, y1]);
  for (const o of openings) { xs.add(o.x); xs.add(o.x + o.w); ys.add(o.y); ys.add(o.y + o.h); }
  const X = [...xs].filter((v) => v >= x0 && v <= x1).sort((a, b) => a - b), Y = [...ys].filter((v) => v >= y0 && v <= y1).sort((a, b) => a - b);
  const g = new THREE.Group();
  for (let i = 0; i < X.length - 1; i++) for (let j = 0; j < Y.length - 1; j++) {
    const cx = (X[i] + X[i + 1]) / 2, cy = (Y[j] + Y[j + 1]) / 2;
    if (openings.some((o) => cx > o.x && cx < o.x + o.w && cy > o.y && cy < o.y + o.h)) continue;
    boxAt(X[i], Y[j], z0, X[i + 1], Y[j + 1], z0 + t, mat, g);
  }
  parent?.add(g); return g;
}

/**
 * Window placed into a wall opening (opening rect x,y,w,h in world coords, wall front face at z).
 * glass reflects the sky; `glow` adds a warm interior panel (dusk/night), `curtain` a sheer curtain tone.
 */
export function windowUnit({ x, y, w, h, z, frame = 0x24282e, frameT = 0.06, depth = 0.1, cols = 1, rows = 1, glow = null, curtain = null, glassMat, sill = null, reveal = 0.12 }, parent) {
  const g = new THREE.Group();
  const fm = T.metal(frame, { roughness: 0.45 }), gl = glassMat || T.glass();
  const zf = z - reveal; // recessed plane
  // glass pane
  const pane = boxAt(x + frameT, y + frameT, zf - 0.01, x + w - frameT, y + h - frameT, zf + 0.01, gl, g, { cast: false });
  void pane;
  // interior backdrop: dark room by default, warm when `glow`
  const back = glow
    ? new THREE.MeshStandardMaterial({ color: 0x1b1008, emissive: glow, emissiveIntensity: 1.7, roughness: 1 })
    : new THREE.MeshStandardMaterial({ color: curtain ?? 0x2a2f36, roughness: 1 });
  boxAt(x + frameT, y + frameT, zf - reveal - 0.05, x + w - frameT, y + h - frameT, zf - reveal - 0.04, back, g, { cast: false });
  // frame
  boxAt(x, y, zf - depth / 2, x + w, y + frameT, zf + depth / 2, fm, g);
  boxAt(x, y + h - frameT, zf - depth / 2, x + w, y + h, zf + depth / 2, fm, g);
  boxAt(x, y, zf - depth / 2, x + frameT, y + h, zf + depth / 2, fm, g);
  boxAt(x + w - frameT, y, zf - depth / 2, x + w, y + h, zf + depth / 2, fm, g);
  for (let i = 1; i < cols; i++) { const xx = x + (w * i) / cols; boxAt(xx - frameT / 2, y, zf - depth / 2, xx + frameT / 2, y + h, zf + depth / 2, fm, g); }
  for (let j = 1; j < rows; j++) { const yy = y + (h * j) / rows; boxAt(x, yy - frameT / 2, zf - depth / 2, x + w, yy + frameT / 2, zf + depth / 2, fm, g); }
  if (sill) boxAt(x - 0.04, y - 0.05, z - 0.02, x + w + 0.04, y, z + 0.1, sill, g);
  // reveal liners so the recess has depth
  const rv = T.plaster(0xe4e0d6, { tileM: 2 });
  boxAt(x, y + h, zf, x + w, y + h + 0.001, z, rv, g, { cast: false });
  boxAt(x, y - 0.001, zf, x + w, y, z, rv, g, { cast: false });
  boxAt(x - 0.001, y, zf, x, y + h, z, rv, g, { cast: false });
  boxAt(x + w, y, zf, x + w + 0.001, y + h, z, rv, g, { cast: false });
  parent?.add(g); return g;
}

/** Panel door (flat) with frame & handle. */
export function doorUnit({ x, y = 0, w = 1.1, h = 2.2, z, mat, handle = 0xb7a06a, frame = 0x2b2f36, recess = 0.1 }, parent) {
  const g = new THREE.Group(); const zf = z - recess;
  boxAt(x, y, zf - 0.05, x + w, y + h, zf, mat, g);
  const fm = T.metal(frame, { roughness: 0.5 });
  boxAt(x - 0.05, y, zf - 0.06, x, y + h + 0.05, zf + 0.02, fm, g); boxAt(x + w, y, zf - 0.06, x + w + 0.05, y + h + 0.05, zf + 0.02, fm, g); boxAt(x - 0.05, y + h, zf - 0.06, x + w + 0.05, y + h + 0.05, zf + 0.02, fm, g);
  const hm = T.metal(handle, { roughness: 0.25 });
  boxAt(x + w - 0.16, y + 1.0, zf, x + w - 0.13, y + 1.35, zf + 0.05, hm, g);
  parent?.add(g); return g;
}

/** Sliding / swing gate made of horizontal slats between two pillars. */
export function slatGate({ x0, x1, y0 = 0, y1 = 2.0, z, slat = 0.09, gap = 0.04, mat, frame, parent }) {
  const g = new THREE.Group(); const fm = frame || T.metal(0x23272d);
  for (let y = y0 + 0.1; y + slat < y1; y += slat + gap) boxAt(x0, y, z - 0.03, x1, y + slat, z + 0.03, mat, g);
  boxAt(x0, y0, z - 0.05, x0 + 0.06, y1, z + 0.05, fm, g); boxAt(x1 - 0.06, y0, z - 0.05, x1, y1, z + 0.05, fm, g);
  boxAt(x0, y1 - 0.06, z - 0.05, x1, y1, z + 0.05, fm, g); boxAt(x0, y0, z - 0.05, x1, y0 + 0.06, z + 0.05, fm, g);
  parent?.add(g); return g;
}

/** Vertical-bar metal gate. */
export function barGate({ x0, x1, y0 = 0, y1 = 1.9, z, bar = 0.035, pitch = 0.14, mat, parent }) {
  const g = new THREE.Group();
  for (let x = x0 + 0.05; x < x1; x += pitch) boxAt(x, y0 + 0.1, z - bar / 2, x + bar, y1, z + bar / 2, mat, g);
  boxAt(x0, y0 + 0.1, z - 0.03, x1, y0 + 0.16, z + 0.03, mat, g); boxAt(x0, y1 - 0.06, z - 0.03, x1, y1, z + 0.03, mat, g);
  boxAt(x0, y0 + 0.9, z - 0.025, x1, y0 + 0.94, z + 0.025, mat, g);
  parent?.add(g); return g;
}

/** Glass balcony / terrace railing with steel cap. */
export function glassRailing({ x0, x1, y, z0, z1, h = 1.05, parent, post = 0.05 }) {
  const g = new THREE.Group(), gl = T.glass({ tint: 0x9fb7c4, env: 1.2 }), st = T.metal(0x8d9298, { roughness: 0.3 });
  gl.transparent = true; gl.opacity = 0.35;
  if (Math.abs(z1 - z0) < 1e-3) { boxAt(x0, y + 0.08, z0 - 0.01, x1, y + h, z0 + 0.01, gl, g, { cast: false }); boxAt(x0, y + h, z0 - 0.025, x1, y + h + 0.04, z0 + 0.025, st, g); boxAt(x0, y + 0.03, z0 - 0.03, x1, y + 0.08, z0 + 0.03, st, g); }
  else { boxAt(x0 - 0.01, y + 0.08, z0, x0 + 0.01, y + h, z1, gl, g, { cast: false }); boxAt(x0 - 0.025, y + h, z0, x0 + 0.025, y + h + 0.04, z1, st, g); }
  void post; parent?.add(g); return g;
}

/** Roof-edge parapet cap & optional rooftop water tank + solar panels. */
export function waterTank(x, y, z, parent, { r = 0.55, h = 1.1 } = {}) {
  const g = new THREE.Group(), m = T.solid(0x1d1f22, { roughness: 0.55 });
  cyl(x, y + h / 2, z, r, r, h, m, g, { seg: 32 }); cyl(x, y + h + 0.05, z, r * 0.7, r, 0.14, m, g); cyl(x, y + h + 0.17, z, r * 0.18, r * 0.2, 0.1, m, g);
  boxAt(x - r * 0.8, y - 0.35, z - r * 0.8, x + r * 0.8, y, z + r * 0.8, T.concrete(0x8e8e8a, { tileM: 2 }), g);
  parent?.add(g); return g;
}
export function solarPanels(x0, z0, cols, rows, y, parent, { w = 1.0, d = 1.7, tilt = 0.45 } = {}) {
  const g = new THREE.Group(), pm = new THREE.MeshPhysicalMaterial({ color: 0x0f1d33, roughness: 0.12, metalness: 0.6, clearcoat: 1, envMapIntensity: 1.4 });
  for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) {
    const p = new THREE.Mesh(new THREE.BoxGeometry(w - 0.04, 0.04, d - 0.04), pm); p.position.set(x0 + i * w + w / 2, y + 0.25, z0 + j * (d + 0.4)); p.rotation.x = -tilt; p.castShadow = true; g.add(p);
  }
  parent?.add(g); return g;
}
export function acUnit(x, y, z, parent) {
  const g = new THREE.Group(); boxAt(x, y, z, x + 0.9, y + 0.65, z + 0.35, T.solid(0xe8e6e1, { roughness: 0.5 }), g);
  cyl(x + 0.45, y + 0.33, z + 0.36, 0.26, 0.26, 0.02, T.solid(0x2b2b2b), g).rotation.x = Math.PI / 2; parent?.add(g); return g;
}
/** Wall-mounted lamp pair on pillar tops (emissive). */
export function pillarLamp(x, y, z, parent, { color = 0xffe2b0, intensity = 5 } = {}) {
  const g = new THREE.Group(); boxAt(x - 0.12, y, z - 0.12, x + 0.12, y + 0.26, z + 0.12, T.emissive(color, intensity), g, { cast: false });
  boxAt(x - 0.15, y + 0.26, z - 0.15, x + 0.15, y + 0.3, z + 0.15, T.metal(0x2b2f36), g); parent?.add(g); return g;
}
export function planter(x0, z0, x1, z1, y0, h, mat, parent, { soil = 0x2d2118 } = {}) {
  const g = new THREE.Group(); boxAt(x0, y0, z0, x1, y0 + h, z1, mat, g); boxAt(x0 + 0.04, y0 + h - 0.02, z0 + 0.04, x1 - 0.04, y0 + h + 0.001, z1 - 0.04, T.solid(soil, { roughness: 1 }), g, { cast: false });
  parent?.add(g); return g;
}

/** Street furniture: road surface strip with kerb, footpath and a dashed centre line. z0..z1 = road extent (z1 > z0). */
export function street({ z0 = 13.5, z1 = 30, x0 = -90, x1 = 90, wet = false, kerbH = 0.15, parent }) {
  const g = new THREE.Group(), road = T.asphalt({ wet }), curb = T.concrete(0xb9b8b2, { tileM: 2, seed: 17 });
  ground(x0, z0, x1, z1, 0.0, road, g); boxAt(x0, 0, z0 - 0.2, x1, kerbH, z0, curb, g);
  const paint = T.solid(0xe9e7df, { roughness: 0.7 });
  for (let x = x0; x < x1; x += 6) boxAt(x, 0.004, (z0 + z1) / 2 - 0.08, x + 3, 0.012, (z0 + z1) / 2 + 0.08, paint, g, { cast: false });
  boxAt(x0, 0.004, z0 + 0.35, x1, 0.012, z0 + 0.45, paint, g, { cast: false });
  parent?.add(g); return g;
}
