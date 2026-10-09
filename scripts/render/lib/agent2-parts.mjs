// agent2 helper kit: arches (round / pointed / cusped), extruded wall panels with real openings, glazing with
// interior-mapped glass, classical columns, balustrades, pediments, jali screens, corbels, chhatri, street context.
// Units: metres. +X right, +Y up, +Z towards the camera (houses face +Z, front face at z = 0).
import * as THREE from 'three';
import { boxAt, cyl, ground, T } from './arch.mjs';
import { rng } from './textures.mjs';
import { tree, palm, bush, hedge } from './nature.mjs';
export { THREE, T };

const V2 = (x, y) => new THREE.Vector2(x, y);

/* ------------------------------------------------------------------ generic geometry helpers */
export function wuv(geo, tile = 1) {
  const pos = geo.attributes.position, nor = geo.attributes.normal, uv = geo.attributes.uv;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i), nx = Math.abs(nor.getX(i)), ny = Math.abs(nor.getY(i)), nz = Math.abs(nor.getZ(i));
    if (nx >= ny && nx >= nz) uv.setXY(i, z / tile, y / tile);
    else if (ny >= nx && ny >= nz) uv.setXY(i, x / tile, z / tile);
    else uv.setXY(i, x / tile, y / tile);
  }
  uv.needsUpdate = true;
}
export function add(geo, mat, parent, { cast = true, receive = true, uv = true } = {}) {
  if (uv) wuv(geo, mat.userData.tileM || 1);
  const m = new THREE.Mesh(geo, mat); m.castShadow = cast; m.receiveShadow = receive; parent?.add(m); return m;
}
/** Box rotated about Z (sloped members), centred at cx,cy,cz. */
export function slab(len, h, d, cx, cy, cz, angle, mat, parent, o) {
  const g = new THREE.BoxGeometry(len, h, d); g.rotateZ(angle); g.translate(cx, cy, cz); return add(g, mat, parent, o);
}
export function lathe(profile, x, y, z, mat, parent, { seg = 40, o } = {}) {
  const g = new THREE.LatheGeometry(profile.map(([r, yy]) => V2(r, yy)), seg); g.translate(x, y, z); return add(g, mat, parent, o);
}
export function sphere(x, y, z, r, mat, parent, { sx = 1, sy = 1, sz = 1, seg = 20 } = {}) {
  const g = new THREE.SphereGeometry(r, seg, seg / 2 | 0); g.scale(sx, sy, sz); g.translate(x, y, z); return add(g, mat, parent);
}
export function lightPoint(scene, color, intensity, dist, x, y, z, decay = 1.8) { const l = new THREE.PointLight(color, intensity, dist, decay); l.position.set(x, y, z); scene.add(l); return l; }
export function lightSpot(scene, color, intensity, dist, angle, [x, y, z], [tx, ty, tz], pen = 0.7, decay = 1.6) {
  const l = new THREE.SpotLight(color, intensity, dist, angle, pen, decay); l.position.set(x, y, z); l.target.position.set(tx, ty, tz); scene.add(l, l.target); return l;
}

/* ------------------------------------------------------------------ arches / opening outlines */
/** Points of an arch curve from left spring to right spring. kinds: round | segmental | pointed | foil */
export function archCurve(kind, cx, ys, hw, rise, n = 28, foils = 9) {
  const pts = [];
  if (kind === 'segmental' && rise < hw) {
    const R = (hw * hw + rise * rise) / (2 * rise), cyc = ys + rise - R, a0 = Math.asin(hw / R);
    for (let i = 0; i <= n; i++) { const p = -a0 + (2 * a0 * i) / n; pts.push(V2(cx + R * Math.sin(p), cyc + R * Math.cos(p))); }
  } else if ((kind === 'pointed' || kind === 'foil') && rise > hw) {
    const c = (rise * rise - hw * hw) / (2 * hw), R = hw + c;
    const base = [];
    const thL = Math.atan2(rise, -c), thR = Math.atan2(rise, c), m = kind === 'foil' ? 90 : n;
    for (let i = 0; i <= m; i++) { const th = Math.PI - (Math.PI - thL) * (i / m); base.push(V2(cx + c + R * Math.cos(th), ys + R * Math.sin(th))); }
    for (let i = 1; i <= m; i++) { const th = thR - thR * (i / m); base.push(V2(cx - c + R * Math.cos(th), ys + R * Math.sin(th))); }
    if (kind === 'pointed') return base;
    // cusped: resample to equal arc length and add outward lobes
    const L = [0]; for (let i = 1; i < base.length; i++) L.push(L[i - 1] + base[i].distanceTo(base[i - 1]));
    const tot = L[L.length - 1], S = [];
    for (let k = 0; k <= foils; k++) { const s = (tot * k) / foils; let i = 1; while (i < L.length - 1 && L[i] < s) i++; const t = (s - L[i - 1]) / (L[i] - L[i - 1] || 1); S.push(base[i - 1].clone().lerp(base[i], t)); }
    pts.push(S[0]);
    for (let k = 0; k < foils; k++) {
      const A = S[k], B = S[k + 1], mid = A.clone().add(B).multiplyScalar(0.5), len = A.distanceTo(B), d = B.clone().sub(A).normalize(), nrm = V2(-d.y, d.x), bulge = len * 0.5 * 0.95;
      for (let t = 1; t <= 8; t++) { const a = (Math.PI * t) / 8; pts.push(mid.clone().addScaledVector(A.clone().sub(mid), Math.cos(a)).addScaledVector(nrm, bulge * Math.sin(a))); }
    }
  } else {
    for (let i = 0; i <= n; i++) { const th = Math.PI - (Math.PI * i) / n; pts.push(V2(cx + hw * Math.cos(th), ys + rise * Math.sin(th))); }
  }
  return pts;
}
/** Opening outline (closed polygon; bottom-left -> up -> over -> bottom-right). `inset` shrinks it uniformly. */
export function openingPts({ kind = 'rect', x, y, w, h, rise, inset = 0, foils = 9, n = 28 }) {
  const rr = rise ?? (kind === 'rect' ? 0 : w * 0.5), X = x + inset, Y = y + inset, W = w - 2 * inset, H = h - 2 * inset;
  if (kind === 'rect') return [V2(X, Y), V2(X, Y + H), V2(X + W, Y + H), V2(X + W, Y)];
  const R = rr * (W / w), ys = Y + H - R;
  return [V2(X, Y), ...archCurve(kind, X + W / 2, ys, W / 2, R, n, foils), V2(X + W, Y)];
}
function topAt(pts, x) { let best = -1e9; for (let i = 0; i < pts.length; i++) { const a = pts[i], b = pts[(i + 1) % pts.length]; if ((a.x - x) * (b.x - x) <= 0 && a.x !== b.x) { const t = (x - a.x) / (b.x - a.x); best = Math.max(best, a.y + (b.y - a.y) * t); } } return best; }

/** Wall slab (XY plane) with arbitrary polygon holes, extruded t in +z from z0. Holes are shrunk 2 mm inside the panel. */
export function wallPanel({ x0, x1, y0, y1, z0, t, holes = [], mat, parent, cast = true }) {
  const s = new THREE.Shape([V2(x0, y0), V2(x1, y0), V2(x1, y1), V2(x0, y1)]), e = 0.002;
  for (const h of holes) s.holes.push(new THREE.Path(h.map((p) => V2(Math.min(x1 - e, Math.max(x0 + e, p.x)), Math.min(y1 - e, Math.max(y0 + e, p.y))))));
  const g = new THREE.ExtrudeGeometry(s, { depth: t, bevelEnabled: false, curveSegments: 1 }); g.translate(0, 0, z0);
  return add(g, mat, parent, { cast });
}
/** Extruded ring between outer and inner outlines. z = back face, extends `depth` toward +z. */
export function ring(outer, inner, z, depth, mat, parent, o) {
  const s = new THREE.Shape(outer); s.holes.push(new THREE.Path(inner));
  const g = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: false, curveSegments: 1 }); g.translate(0, 0, z); return add(g, mat, parent, o);
}
export function polyPlane(pts, z, mat, parent, { cast = false } = {}) {
  const g = new THREE.ShapeGeometry(new THREE.Shape(pts), 1); g.translate(0, 0, z);
  const p = g.attributes.position, uv = g.attributes.uv; let a = 1e9, b = 1e9, c = -1e9, d = -1e9;
  for (let i = 0; i < p.count; i++) { a = Math.min(a, p.getX(i)); b = Math.min(b, p.getY(i)); c = Math.max(c, p.getX(i)); d = Math.max(d, p.getY(i)); }
  for (let i = 0; i < p.count; i++) uv.setXY(i, (p.getX(i) - a) / (c - a), (p.getY(i) - b) / (d - b));
  const m = new THREE.Mesh(g, mat); m.castShadow = cast; m.receiveShadow = true; parent?.add(m); return m;
}
export function extrudePoly(pts, z0, depth, mat, parent, o) {
  const g = new THREE.ExtrudeGeometry(new THREE.Shape(pts), { depth, bevelEnabled: false, curveSegments: 1 }); g.translate(0, 0, z0); return add(g, mat, parent, o);
}

/* ------------------------------------------------------------------ glass with an interior painted on it */
const glassCache = new Map();
function paintInterior(seed, mode) {
  const S = 256, c = document.createElement('canvas'); c.width = S; c.height = Math.round(S * 1.0); const x = c.getContext('2d'), r = rng(seed * 7 + 3), night = mode === 'night';
  const wall = night ? [236, 196, 140] : [188, 168, 140];
  x.fillStyle = `rgb(${wall})`; x.fillRect(0, 0, S, S);
  const g = x.createLinearGradient(0, 0, 0, S); g.addColorStop(0, night ? 'rgba(255,225,170,0.9)' : 'rgba(230,220,200,0.8)'); g.addColorStop(0.18, 'rgba(0,0,0,0)'); g.addColorStop(0.8, 'rgba(0,0,0,0.0)'); g.addColorStop(1, 'rgba(40,25,10,0.55)');
  x.fillStyle = g; x.fillRect(0, 0, S, S);
  x.fillStyle = night ? 'rgb(150,100,60)' : 'rgb(96,70,48)'; x.fillRect(0, S * 0.84, S, S * 0.16);   // floor
  x.filter = 'blur(2px)';
  // furniture silhouettes
  const nf = 2 + Math.floor(r() * 3);
  for (let i = 0; i < nf; i++) { const w = S * (0.18 + r() * 0.2), px = r() * (S - w), hh = S * (0.12 + r() * 0.16); x.fillStyle = `rgba(${40 + r() * 50},${30 + r() * 40},${28 + r() * 30},0.85)`; x.fillRect(px, S * 0.85 - hh, w, hh); }
  // wall art / shelves
  for (let i = 0; i < 2; i++) { x.fillStyle = `rgba(${90 + r() * 120},${70 + r() * 90},${50 + r() * 60},0.7)`; x.fillRect(S * (0.1 + r() * 0.7), S * (0.28 + r() * 0.15), S * (0.1 + r() * 0.12), S * (0.14 + r() * 0.1)); }
  // pendant / downlights
  const nl = 1 + Math.floor(r() * 3);
  for (let i = 0; i < nl; i++) { const px = S * (0.2 + 0.6 * ((i + r() * 0.5) / nl)), py = S * (0.1 + r() * 0.08); const rg = x.createRadialGradient(px, py, 1, px, py, S * 0.18); rg.addColorStop(0, night ? 'rgba(255,250,225,1)' : 'rgba(255,245,220,0.95)'); rg.addColorStop(1, 'rgba(255,230,180,0)'); x.fillStyle = rg; x.fillRect(px - S * 0.2, py - S * 0.2, S * 0.4, S * 0.4); }
  x.filter = 'none';
  // curtains
  if (r() > 0.25) {
    const cw = S * (0.1 + r() * 0.09), col = night ? [240, 214, 170] : [226, 214, 196];
    for (const side of [0, 1]) for (let i = 0; i < cw; i += 3) { const k = 0.8 + 0.2 * Math.sin(i * 0.9 + side); x.fillStyle = `rgb(${col[0] * k},${col[1] * k},${col[2] * k})`; x.fillRect(side ? S - cw + i : i, 0, 3, S * 0.9); }
  }
  // soft room-corner darkening
  const vg = x.createRadialGradient(S / 2, S * 0.55, S * 0.2, S / 2, S * 0.55, S * 0.78); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.45)'); x.fillStyle = vg; x.fillRect(0, 0, S, S);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
}
/** Glass: interior shows as an emissive picture; sky reflection through clearcoat + specular. */
export function glass({ mode = 'day', seed = 1, env = 2.0, emis, tint = 0x0b121a, rough = 0.06 } = {}) {
  const key = `${mode}/${seed}/${env}/${emis}/${tint}/${rough}`;
  if (glassCache.has(key)) return glassCache.get(key);
  const tx = paintInterior(seed, mode);
  const m = new THREE.MeshPhysicalMaterial({ color: tint, roughness: rough, metalness: 0, emissive: 0xffffff, emissiveMap: tx, emissiveIntensity: emis ?? (mode === 'night' ? 2.2 : 0.42), clearcoat: 1, clearcoatRoughness: 0.03, envMapIntensity: env, reflectivity: 0.9 });
  m.userData.tileM = 1; glassCache.set(key, m); return m;
}
const alu = (color, rough = 0.5) => T.solid(color, { roughness: rough, metalness: 0.55 });

/**
 * Window/door unit set into an opening of a wall whose front face is at z. Opening outline may be rect/round/pointed/foil/segmental.
 * Returns the group. `bars` makes thin colonial muntins; `cols/rows` split with the frame bars.
 */
export function glazed({ kind = 'rect', x, y, w, h, rise, z, reveal = 0.14, frame = 0x2a2d31, frameW = 0.055, depth = 0.07, cols = 1, rows = 1, bars = 0, barW = 0.022, glassMat, mode = 'day', seed = 1,
  foils = 9, sill = null, frameMat = null, parent, transomAt = null } = {}) {
  const g = new THREE.Group(), fm = frameMat || alu(frame, 0.45), zf = z - reveal;
  const outer = openingPts({ kind, x, y, w, h, rise, foils, inset: 0 }), inner = openingPts({ kind, x, y, w, h, rise, foils, inset: frameW });
  ring(outer, inner, zf - depth / 2, depth, fm, g);
  polyPlane(inner, zf + 0.005, glassMat || glass({ mode, seed }), g);
  const yTop = (xx) => topAt(inner, xx) - 0.0;
  const vbar = (xx, bw) => boxAt(xx - bw / 2, y + frameW * 0.5, zf - depth / 2, xx + bw / 2, Math.min(yTop(xx) + 0.002, y + h), zf + depth / 2, fm, g);
  for (let i = 1; i < cols; i++) vbar(x + (w * i) / cols, frameW * 0.8);
  for (let j = 1; j < rows; j++) { const yy = y + (h * j) / rows; boxAt(x + frameW * 0.5, yy - frameW * 0.4, zf - depth / 2, x + w - frameW * 0.5, yy + frameW * 0.4, zf + depth / 2, fm, g); }
  if (transomAt != null) boxAt(x + frameW * 0.5, y + transomAt - frameW * 0.4, zf - depth / 2, x + w - frameW * 0.5, y + transomAt + frameW * 0.4, zf + depth / 2, fm, g);
  if (bars) {
    const nb = bars; for (let i = 1; i < nb * cols; i++) if (i % nb) vbar(x + (w * i) / (nb * cols), barW);
    for (let j = 1; j < nb * rows; j++) if (j % nb) { const yy = y + (h * j) / (nb * rows); boxAt(x + frameW, yy - barW / 2, zf + 0.01, x + w - frameW, yy + barW / 2, zf + 0.04, fm, g, { cast: false }); }
  }
  if (sill) boxAt(x - 0.06, y - 0.06, z - 0.02, x + w + 0.06, y, z + 0.1, sill, g);
  parent?.add(g); return g;
}

/** Tall panelled / glazed double door in an opening; kind may be arched. */
export function doorLeaf({ kind = 'rect', x, y = 0, w, h, rise, z, reveal = 0.18, mat, frameMat, parent, panels = true, handleMat, foils = 9, glassArch = false, mode = 'day', seed = 3 }) {
  const g = new THREE.Group(), zf = z - reveal, o = openingPts({ kind, x, y, w, h, rise, foils }), i = openingPts({ kind, x, y, w, h, rise, foils, inset: 0.06 });
  ring(o, i, zf - 0.05, 0.1, frameMat || mat, g);
  const lw = (w - 0.12) / 2;
  extrudePoly(openingPts({ kind, x, y, w, h, rise, foils, inset: 0.065 }), zf - 0.02, 0.04, mat, g);
  if (glassArch && kind !== 'rect') polyPlane(openingPts({ kind, x, y, w, h, rise, foils, inset: 0.3 }), zf + 0.025, glass({ mode, seed, env: 2 }), g);
  // centre split + raised panels
  boxAt(x + w / 2 - 0.012, y + 0.02, zf + 0.02, x + w / 2 + 0.012, y + h - (kind === 'rect' ? 0.06 : rise * 0.9), zf + 0.06, frameMat || mat, g);
  if (panels) for (let s = 0; s < 2; s++) { const px = x + 0.1 + s * (lw + 0.02); for (const [py, ph] of [[y + 0.2, 0.7], [y + 1.05, h * 0.38]]) boxAt(px + 0.06, py, zf + 0.02, px + lw - 0.06, py + ph, zf + 0.05, frameMat || mat, g); }
  const hm = handleMat || T.metal(0xb89a5a, { roughness: 0.28 });
  for (const hx of [x + w / 2 - 0.1, x + w / 2 + 0.07]) boxAt(hx, y + 1.0, zf + 0.04, hx + 0.03, y + 1.3, zf + 0.09, hm, g);
  parent?.add(g); return g;
}

/* ------------------------------------------------------------------ classical elements */
function fluted(r0, r1, h, flutes, fd, seg, rings, entasis) {
  const pos = [], idx = [];
  for (let i = 0; i <= rings; i++) { const t = i / rings, rr = r0 + (r1 - r0) * t + entasis * Math.sin(Math.PI * t) ** 0.8;
    for (let j = 0; j <= seg; j++) { const th = (2 * Math.PI * j) / seg, gg = flutes ? Math.abs(Math.sin((flutes * th) / 2)) : 1, rad = rr * (1 - (flutes ? fd * Math.pow(gg, 0.55) * (i === 0 || i === rings ? 0.6 : 1) : 0)); pos.push(Math.cos(th) * rad, t * h, Math.sin(th) * rad); } }
  for (let i = 0; i < rings; i++) for (let j = 0; j < seg; j++) { const a = i * (seg + 1) + j, b = a + 1, c = a + seg + 1, d = c + 1; idx.push(a, c, b, b, c, d); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
  g.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array((pos.length / 3) * 2), 2)); return g;
}
/** Classical column (base, fluted shaft with entasis, capital). order: tuscan | ionic | corinthian */
export function column({ x, z, y0 = 0, h = 3.2, r = 0.22, mat, parent, order = 'ionic', flutes = 20 }) {
  const g = new THREE.Group(), bh = r * 0.9, ch = r * 1.7, sh = h - bh - ch;
  boxAt(x - r * 1.45, y0, z - r * 1.45, x + r * 1.45, y0 + bh * 0.4, z + r * 1.45, mat, g);
  lathe([[r * 1.3, 0], [r * 1.3, bh * 0.25], [r * 1.15, bh * 0.4], [r * 1.12, bh * 0.52], [r * 1.18, bh * 0.62], [r * 1.0, bh * 0.75], [r * 0.94, bh * 0.85]].map(([a, b]) => [a, b + 0 * bh]), x, y0 + bh * 0.4, z, mat, g, { seg: 40 });
  const sg = fluted(r * 0.93, r * 0.8, sh, flutes, 0.06, flutes ? flutes * 3 : 40, 10, r * 0.025); sg.translate(x, y0 + bh, z); g.add(Object.assign(new THREE.Mesh(sg, mat), { castShadow: true, receiveShadow: true }));
  const cy = y0 + bh + sh;
  if (order === 'tuscan') { lathe([[r * 0.8, 0], [r * 0.9, ch * 0.1], [r * 1.0, ch * 0.3], [r * 1.25, ch * 0.5], [r * 1.35, ch * 0.62]], x, cy, z, mat, g); boxAt(x - r * 1.45, cy + ch * 0.62, z - r * 1.45, x + r * 1.45, cy + ch, z + r * 1.45, mat, g); }
  else if (order === 'ionic') {
    lathe([[r * 0.8, 0], [r * 0.86, ch * 0.08], [r * 1.0, ch * 0.2], [r * 1.1, ch * 0.3], [r * 1.0, ch * 0.36]], x, cy, z, mat, g);
    boxAt(x - r * 1.5, cy + ch * 0.3, z - r * 0.82, x + r * 1.5, cy + ch * 0.58, z + r * 0.82, mat, g);                // volute cushion
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) { const tor = new THREE.TorusGeometry(r * 0.3, r * 0.1, 8, 20); tor.translate(x + sx * r * 1.18, cy + ch * 0.44, z + sz * r * 0.84); add(tor, mat, g); const t2 = new THREE.TorusGeometry(r * 0.15, r * 0.07, 8, 16); t2.translate(x + sx * r * 1.18, cy + ch * 0.44, z + sz * r * 0.88); add(t2, mat, g); }
    boxAt(x - r * 1.65, cy + ch * 0.58, z - r * 1.65, x + r * 1.65, cy + ch, z + r * 1.65, mat, g);
  } else {
    const bell = new THREE.LatheGeometry([[r * 0.8, 0], [r * 0.95, ch * 0.18], [r * 1.12, ch * 0.4], [r * 1.25, ch * 0.62], [r * 1.35, ch * 0.78]].map(([a, b]) => V2(a, b)), 48), p = bell.attributes.position;
    for (let i = 0; i < p.count; i++) { const px = p.getX(i), pz = p.getZ(i), yy = p.getY(i), th = Math.atan2(pz, px), k = 1 + (yy < ch * 0.5 ? 0.07 * Math.cos(th * 8) : 0.045 * Math.cos(th * 16)); p.setX(i, px * k); p.setZ(i, pz * k); }
    bell.computeVertexNormals(); bell.translate(x, cy, z); add(bell, mat, g);
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) { const s = new THREE.SphereGeometry(r * 0.22, 10, 8); s.scale(1, 1.3, 1); s.translate(x + sx * r * 1.28, cy + ch * 0.72, z + sz * r * 1.28); add(s, mat, g); }
    boxAt(x - r * 1.6, cy + ch * 0.78, z - r * 1.6, x + r * 1.6, cy + ch, z + r * 1.6, mat, g);
  }
  parent?.add(g); return g;
}
/** Balustrade along X (axis 'x') or Z. Baluster profile instanced between rails. */
export function balustrade({ a, b, fixed, y, h = 0.95, pitch = 0.18, mat, parent, axis = 'x', pierEvery = 9, rail = 0.14 }) {
  const g = new THREE.Group(), len = Math.abs(b - a), n = Math.max(2, Math.round(len / pitch)), lo = Math.min(a, b);
  const prof = [[0.0, 0], [0.05, 0.0], [0.05, 0.03], [0.034, 0.06], [0.034, 0.09], [0.058, 0.16], [0.062, 0.24], [0.04, 0.32], [0.028, 0.4], [0.03, 0.5], [0.05, 0.58], [0.058, 0.62], [0.04, 0.68], [0.034, 0.7], [0.0, 0.7]];
  const geo = new THREE.LatheGeometry(prof.map(([r, yy]) => V2(r, yy * ((h - 2 * rail) / 0.7))), 14), im = new THREE.InstancedMesh(geo, mat, n + 1), d = new THREE.Object3D();
  for (let i = 0; i <= n; i++) { const t = lo + (len * i) / n; d.position.set(axis === 'x' ? t : fixed, y + rail, axis === 'x' ? fixed : t); d.updateMatrix(); im.setMatrixAt(i, d.matrix); }
  im.castShadow = im.receiveShadow = true; g.add(im);
  const r2 = rail * 0.5;
  if (axis === 'x') { boxAt(lo, y, fixed - 0.11, lo + len, y + rail, fixed + 0.11, mat, g); boxAt(lo, y + h - rail, fixed - 0.1, lo + len, y + h - rail + rail * 0.55, fixed + 0.1, mat, g); boxAt(lo - 0.02, y + h - r2 * 0.9, fixed - 0.14, lo + len + 0.02, y + h, fixed + 0.14, mat, g); }
  else { boxAt(fixed - 0.11, y, lo, fixed + 0.11, y + rail, lo + len, mat, g); boxAt(fixed - 0.1, y + h - rail, lo, fixed + 0.1, y + h - rail * 0.45, lo + len, mat, g); boxAt(fixed - 0.14, y + h - r2 * 0.9, lo - 0.02, fixed + 0.14, y + h, lo + len + 0.02, mat, g); }
  const piers = []; for (let i = 0; i <= n; i += pierEvery) piers.push(i); if (!piers.includes(n)) piers.push(n);
  for (const i of piers) { const t = lo + (len * i) / n, px = axis === 'x' ? t : fixed, pz = axis === 'x' ? fixed : t; boxAt(px - 0.14, y, pz - 0.14, px + 0.14, y + h, pz + 0.14, mat, g); boxAt(px - 0.18, y + h, pz - 0.18, px + 0.18, y + h + 0.06, pz + 0.18, mat, g); boxAt(px - 0.12, y + h + 0.06, pz - 0.12, px + 0.12, y + h + 0.16, pz + 0.12, mat, g); }
  parent?.add(g); return g;
}
/** Stack of projecting bands = cornice. Along X at depth z (front face), going backward. layers: [[projection, height], ...] bottom to top. */
export function cornice({ x0, x1, y, z, layers, mat, parent, sides = false, zBack = -6, dentils = false }) {
  let yy = y; const g = new THREE.Group();
  for (const [p, h] of layers) {
    boxAt(x0 - (sides ? p : 0), yy, zBack, x1 + (sides ? p : 0), yy + h, z + p, mat, g); yy += h;
  }
  if (dentils) { const p0 = layers[0][0], dh = layers[0][1]; for (let x = x0; x < x1; x += 0.13) boxAt(x, y - 0.1, z + p0 * 0.2, x + 0.07, y, z + p0 + 0.02, mat, g); void dh; }
  parent?.add(g); return g;
}
/** Triangular pediment with raking cornice, recessed tympanum and rosette. Front face of columns line at z. */
export function pediment({ x0, x1, y, z, depth = 0.5, rise = 1.4, mat, tymp, parent, band = 0.22, sideDepth = 0 }) {
  const g = new THREE.Group(), cx = (x0 + x1) / 2, hw = (x1 - x0) / 2, ang = Math.atan2(rise, hw), len = Math.hypot(hw, rise);
  extrudePoly([V2(x0 + 0.05, y), V2(x1 - 0.05, y), V2(cx, y + rise - 0.02)], z - depth, depth * 0.7, tymp || mat, g);
  for (const s of [-1, 1]) {
    const a = s * ang * -1; // left side rises to the right (+), right side falls
    const mx = cx + s * hw * 0.5, my = y + rise * 0.5;
    slab(len + 0.3, band, depth + 0.1, mx, my + band * 0.55, z - depth / 2 + 0.05, s === -1 ? ang : -ang, mat, g);
    slab(len + 0.3, band * 0.55, depth + 0.28, mx - s * 0.0, my + band * 0.1 + 0.02, z - depth / 2 + 0.12, s === -1 ? ang : -ang, mat, g);
    void a;
  }
  boxAt(x0 - 0.18, y - band * 0.9, z - depth - 0.1, x1 + 0.18, y, z + 0.12, mat, g);
  boxAt(x0 - 0.3, y - band * 0.9 - 0.08, z - depth - 0.1, x1 + 0.3, y - band * 0.9, z + 0.22, mat, g);
  for (let x = x0; x < x1; x += 0.15) boxAt(x, y - band * 1.3, z + 0.02, x + 0.08, y - band * 0.9 - 0.08, z + 0.2, mat, g);
  // rosette
  const rs = new THREE.CylinderGeometry(0.34, 0.34, 0.06, 32); rs.rotateX(Math.PI / 2); rs.translate(cx, y + rise * 0.38, z - depth * 0.28); add(rs, mat, g);
  const rs2 = new THREE.CylinderGeometry(0.22, 0.22, 0.09, 32); rs2.rotateX(Math.PI / 2); rs2.translate(cx, y + rise * 0.38, z - depth * 0.28); add(rs2, mat, g);
  parent?.add(g); return g;
}
/** Quoins: alternating long/short blocks on a vertical corner x (side = +1/-1 which way they stick into the face). */
export function quoins({ x, y0, y1, z, mat, parent, w = 0.5, h = 0.3, side = 1, proj = 0.04 }) {
  let i = 0; for (let y = y0; y < y1 - 0.01; y += h, i++) { const ww = i % 2 ? w : w * 1.45; boxAt(side > 0 ? x : x - ww, y + 0.012, z - 0.03, side > 0 ? x + ww : x, Math.min(y + h - 0.012, y1), z + proj, mat, parent); }
}
/** S-curved bracket (corbel) projecting along +z from a wall face at z0. */
export function corbel({ x, y, z0, w = 0.16, h = 0.5, proj = 0.35, mat, parent }) {
  const s = new THREE.Shape(); s.moveTo(0, 0); s.lineTo(proj, 0); s.lineTo(proj, -h * 0.12); s.quadraticCurveTo(proj * 0.9, -h * 0.5, proj * 0.35, -h * 0.72); s.quadraticCurveTo(proj * 0.12, -h * 0.9, 0, -h); s.lineTo(0, 0);
  const g = new THREE.ExtrudeGeometry(s, { depth: w, bevelEnabled: false, curveSegments: 10 }); g.rotateY(-Math.PI / 2); g.translate(x + w, y, z0); return add(g, mat, parent);
}

/* ------------------------------------------------------------------ jali (pierced screen) */
export function jali({ x, y, w, h, z, t = 0.07, cell = 0.15, mat, back, parent, border = 0.1 }) {
  const g = new THREE.Group(), s = new THREE.Shape([V2(x, y), V2(x + w, y), V2(x + w, y + h), V2(x, y + h)]);
  const nx = Math.floor((w - 2 * border) / cell), ny = Math.floor((h - 2 * border) / cell), ox = x + (w - nx * cell) / 2, oy = y + (h - ny * cell) / 2;
  const R = cell * 0.46, k = R * Math.tan(Math.PI / 8);
  for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) {
    const cx = ox + (i + 0.5) * cell, cy = oy + (j + 0.5) * cell, p = [];
    for (let a = 0; a < 8; a++) { const th = (a * Math.PI) / 4 + Math.PI / 8; p.push(V2(cx + (R / Math.cos(Math.PI / 8)) * 0.98 * Math.cos(th), cy + (R / Math.cos(Math.PI / 8)) * 0.98 * Math.sin(th))); }
    s.holes.push(new THREE.Path(p));
  }
  void k;
  const sq = cell * 0.17;
  for (let i = 1; i < nx; i++) for (let j = 1; j < ny; j++) { const cx = ox + i * cell, cy = oy + j * cell; s.holes.push(new THREE.Path([V2(cx - sq, cy), V2(cx, cy + sq), V2(cx + sq, cy), V2(cx, cy - sq)])); }
  const geo = new THREE.ExtrudeGeometry(s, { depth: t, bevelEnabled: false, curveSegments: 1 }); geo.translate(0, 0, z - t); add(geo, mat, g);
  if (back) boxAt(x + 0.005, y + 0.005, z - t - 0.03, x + w - 0.005, y + h - 0.005, z - t - 0.02, back, g, { cast: false });
  parent?.add(g); return g;
}

/* ------------------------------------------------------------------ chhatri / dome */
export function dome({ x, y, z, r = 0.9, mat, parent, onion = true, finial = null, lift = 0.0 }) {
  const prof = onion
    ? [[0, 0], [r * 1.02, 0], [r * 1.1, r * 0.18], [r * 1.12, r * 0.34], [r * 1.02, r * 0.6], [r * 0.82, r * 0.85], [r * 0.55, r * 1.1], [r * 0.3, r * 1.35], [r * 0.12, r * 1.6], [r * 0.05, r * 1.8], [0, r * 1.84]]
    : Array.from({ length: 14 }, (_, i) => { const a = (i / 13) * (Math.PI / 2); return [r * Math.cos(a), r * Math.sin(a) * 0.82]; });
  const g = new THREE.Group(); lathe(prof, x, y + lift, z, mat, g, { seg: 40 });
  if (finial) { const top = (onion ? r * 1.84 : r * 0.82) + lift; lathe([[0.0, 0], [0.07, 0.0], [0.06, 0.05], [0.1, 0.14], [0.045, 0.22], [0.05, 0.3], [0.02, 0.5], [0, 0.56]], x, y + top - 0.04, z, finial, g, { seg: 14 }); }
  parent?.add(g); return g;
}
export function chhatri({ x, y, z, s = 2.6, h = 2.5, stone, white, dark, parent, seed = 1 }) {
  const g = new THREE.Group(), half = s / 2;
  boxAt(x - half - 0.15, y, z - half - 0.15, x + half + 0.15, y + 0.12, z + half + 0.15, stone, g);
  boxAt(x - half - 0.05, y + 0.12, z - half - 0.05, x + half + 0.05, y + 0.2, z + half + 0.05, stone, g);
  const pr = 0.095, pos = [-half + 0.14, 0, half - 0.14];
  const bay = (half - 0.14);
  const colsXZ = []; for (const px of pos) for (const pz of pos) if (!(px === 0 && pz === 0)) colsXZ.push([px, pz]);
  for (const [px, pz] of colsXZ) {
    boxAt(x + px - 0.16, y + 0.2, z + pz - 0.16, x + px + 0.16, y + 0.32, z + pz + 0.16, stone, g);
    const sg = fluted(pr, pr * 0.85, h - 0.7, 0, 0, 20, 4, 0.01); sg.translate(x + px, y + 0.32, z + pz); g.add(Object.assign(new THREE.Mesh(sg, stone), { castShadow: true, receiveShadow: true }));
    lathe([[0.1, 0], [0.16, 0.06], [0.13, 0.12], [0.17, 0.2], [0.2, 0.3]], x + px, y + h - 0.38, z + pz, stone, g, { seg: 20 });
  }
  // cusped arch fascias on four sides (two bays each)
  const span = bay, aw = span - 0.28, ah = h - 0.9 - 0.32 + 0.0;
  for (const side of [0, 1, 2, 3]) for (const c of [-bay / 2, bay / 2]) {
    const o = new THREE.Group(), hole = openingPts({ kind: 'foil', x: c - aw / 2, y: y + 0.32, w: aw, h: ah, rise: aw * 0.72, foils: 7 });
    wallPanel({ x0: c - span / 2 - 0.0, x1: c + span / 2, y0: y + 0.32, y1: y + h - 0.12, z0: -0.06, t: 0.12, holes: [hole], mat: stone, parent: o });
    o.rotation.y = (side * Math.PI) / 2; o.position.set(0, 0, 0); const holder = new THREE.Group(); holder.add(o); holder.position.set(x, 0, z);
    // push panel to the edge of the square
    o.position.z = half - 0.14; g.add(holder);
  }
  // eave slab, brackets, parapet
  boxAt(x - half - 0.42, y + h - 0.14, z - half - 0.42, x + half + 0.42, y + h + 0.1, z + half + 0.42, stone, g);
  boxAt(x - half - 0.5, y + h + 0.1, z - half - 0.5, x + half + 0.5, y + h + 0.2, z + half + 0.5, stone, g);
  for (let i = -3; i <= 3; i++) { const t = (i / 3) * (half + 0.3); for (const [dx, dz] of [[1, 0], [0, 1]]) { for (const sg of [-1, 1]) boxAt(x + (dx ? t : sg * (half + 0.3)) - 0.05, y + h - 0.3, z + (dz ? t : sg * (half + 0.3)) - 0.05, x + (dx ? t : sg * (half + 0.3)) + 0.05, y + h - 0.14, z + (dz ? t : sg * (half + 0.3)) + 0.05, stone, g); } }
  const dr = new THREE.CylinderGeometry(half * 0.58, half * 0.62, 0.34, 16); dr.translate(x, y + h + 0.37, z); add(dr, white, g);
  dome({ x, y: y + h + 0.54, z, r: half * 0.66, mat: white, finial: T.metal(0xc8a24a, { roughness: 0.25 }), parent: g });
  parent?.add(g); void dark; void seed; return g;
}

/* ------------------------------------------------------------------ roof furniture / street context */
export function parapetCap({ x0, x1, z0, z1, y, h = 1.0, t = 0.2, mat, cap, parent, front = true, sides = true, back = true }) {
  if (front) { boxAt(x0, y, z1 - t, x1, y + h, z1, mat, parent); boxAt(x0 - 0.05, y + h, z1 - t - 0.05, x1 + 0.05, y + h + 0.08, z1 + 0.05, cap || mat, parent); }
  if (sides) for (const [a, b] of [[x0, x0 + t], [x1 - t, x1]]) { boxAt(a, y, z0, b, y + h, z1 - t, mat, parent); boxAt(a - (a === x0 ? 0.05 : 0), y + h, z0, b + (b === x1 ? 0.05 : 0), y + h + 0.08, z1 - t, cap || mat, parent); }
  if (back) boxAt(x0, y, z0, x1, y + h, z0 + t, mat, parent);
}
export function streetLamp(x, z, scene, { h = 7.2, on = false, lean = 0, arm = 1.6, dir = -1 } = {}) {
  const g = new THREE.Group(), pole = T.metal(0x3b4046, { roughness: 0.5 });
  lathe([[0.14, 0], [0.14, 0.35], [0.08, 0.5], [0.075, h]], x, 0, z, pole, g, { seg: 14 });
  boxAt(x - 0.04 + (dir * arm) / 2, h - 0.12, z - 0.04, x + 0.04 + (dir * arm) / 2 + 0.0, h - 0.04, z + 0.04, pole, g);
  boxAt(x + dir * arm - 0.35, h - 0.2, z - 0.15, x + dir * arm + 0.35, h - 0.1, z + 0.15, pole, g);
  boxAt(x + dir * arm - 0.3, h - 0.23, z - 0.12, x + dir * arm + 0.3, h - 0.2, z + 0.12, T.emissive(0xffd9a0, on ? 14 : 0.5), g, { cast: false });
  scene.add(g); void lean; return g;
}
/** Neighbouring house block seen at the side: boxes with windows and a parapet (simple but not flat). */
export function neighbour({ x0, x1, z = 0, depth = 12, floors = 2, mat, trim, seed = 1, scene, mode = 'day', glassTint = 0, storey = 3.2, wallZ = 8.2, wallMat, tank = true, winCols = 2 }) {
  const r = rng(seed), g = new THREE.Group(), H = floors * storey, w = x1 - x0;
  const nw = Math.max(1, Math.floor(w / 4.2)), gw = w / nw;
  for (let f = 0; f < floors; f++) {
    const y0 = f * storey, holes = [];
    for (let i = 0; i < nw; i++) { const ww = 1.2 + r() * 1.0, cx = x0 + gw * (i + 0.5); holes.push(openingPts({ x: cx - ww / 2, y: y0 + 0.9, w: ww, h: 1.4 + r() * 0.2 })); }
    wallPanel({ x0, x1, y0, y1: y0 + storey, z0: z - 0.25, t: 0.25, holes, mat, parent: g });
    boxAt(x0 - 0.04, y0, z - depth, x1 + 0.04, y0 + 0.02, z, trim || mat, g);
    holes.forEach((hp, i) => { const ww = hp[3].x - hp[0].x, yy = hp[0].y, hh = hp[1].y - hp[0].y; glazed({ x: hp[0].x, y: yy, w: ww, h: hh, z, cols: winCols, mode, seed: seed * 10 + f * 3 + i, frame: 0x7a6a5a, parent: g, sill: trim || mat, reveal: 0.12 }); });
    boxAt(x0 - 0.06, y0 + storey - 0.12, z - 0.05, x1 + 0.06, y0 + storey, z + 0.3 + 0, trim || mat, g);
  }
  boxAt(x0, 0, z - depth, x1, H, z - 0.25, mat, g);
  parapetCap({ x0: x0 - 0.05, x1: x1 + 0.05, z0: z - depth, z1: z + 0.05, y: H, h: 1.0, mat, cap: trim || mat, parent: g });
  if (tank) { for (let i = 0; i < 2; i++) { const px = x0 + w * (0.25 + 0.4 * i + r() * 0.1), tm = T.solid(0x242628, { roughness: 0.6 }); cyl(px, H + 0.55, z - depth * 0.55, 0.55, 0.55, 1.1, tm, g, { seg: 24 }); cyl(px, H + 1.2, z - depth * 0.55, 0.38, 0.55, 0.16, tm, g); boxAt(px - 0.45, H, z - depth * 0.55 - 0.45, px + 0.45, H + 0.0, z - depth * 0.55 + 0.45, mat, g); } }
  void wallZ; void wallMat; void glassTint;
  scene?.add(g); return g;
}
export function boundaryWall({ x0, x1, z, h = 1.5, t = 0.22, mat, cap, parent, pillarEvery = 0 }) {
  boxAt(x0, 0, z - t / 2, x1, h, z + t / 2, mat, parent); boxAt(x0, h, z - t / 2 - 0.04, x1, h + 0.07, z + t / 2 + 0.04, cap || mat, parent);
  if (pillarEvery) for (let x = x0; x <= x1 + 0.01; x += pillarEvery) { boxAt(x - 0.2, 0, z - 0.2, x + 0.2, h + 0.18, z + 0.2, mat, parent); boxAt(x - 0.26, h + 0.18, z - 0.26, x + 0.26, h + 0.25, z + 0.26, cap || mat, parent); }
}
/** Leaf tint helper: lifts foliage out of black shade. */
export function leafy(obj, { emissive = 0x33521a, k = 0.8 } = {}) {
  obj.traverse((o) => { if (o.isInstancedMesh && o.material) { o.material.emissive = new THREE.Color(emissive); o.material.emissiveMap = o.material.map; o.material.emissiveIntensity = k; } });
  return obj;
}
export { tree, palm, bush, hedge, boxAt, cyl, ground, rng };

/** Stars for night skies: dots on the upper dome. `scale` ~ w/1280 keeps them visible at final res. */
export function stars(scene, { count = 900, scale = 1, minEl = 0.12 } = {}) {
  const r = rng(77), pos = new Float32Array(count * 3), col = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const az = r() * 6.283, el = Math.asin(minEl + r() * (1 - minEl)), R = 3800; pos.set([R * Math.cos(el) * Math.cos(az), R * Math.sin(el), R * Math.cos(el) * Math.sin(az)], i * 3);
    const b = 0.35 + r() * r() * 0.8; col.set([b, b * (0.9 + r() * 0.1), b * (0.85 + r() * 0.2)], i * 3);
  }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const m = new THREE.PointsMaterial({ size: 1.8 * scale, sizeAttenuation: false, vertexColors: true, fog: false, depthWrite: false, transparent: true, opacity: 0.9 });
  const p = new THREE.Points(g, m); p.renderOrder = -1; scene.add(p); return p;
}
/** Planar-reflection fake for wet roads: mirrored clone of a group below y=0 (visible through a semi-transparent road). */
export function mirrorBelow(group, scene) {
  const c = group.clone(true); c.scale.y = -1; c.traverse((o) => { o.castShadow = false; }); scene.add(c); return c;
}

/** Vertical bar fence (instanced) between x0..x1, bars from y0..y1 at depth z, with top & bottom rails. */
export function barFence({ x0, x1, y0, y1, z, pitch = 0.12, bar = 0.022, mat, parent, rails = [0.0, 0.5, 1.0] }) {
  const n = Math.max(2, Math.round((x1 - x0) / pitch)), im = new THREE.InstancedMesh(new THREE.BoxGeometry(bar, y1 - y0, bar), mat, n + 1), d = new THREE.Object3D();
  for (let i = 0; i <= n; i++) { d.position.set(x0 + ((x1 - x0) * i) / n, (y0 + y1) / 2, z); d.updateMatrix(); im.setMatrixAt(i, d.matrix); }
  im.castShadow = im.receiveShadow = true; parent?.add(im);
  for (const t of rails) { const yy = y0 + (y1 - y0) * t; boxAt(x0, Math.min(yy, y1 - 0.045), z - 0.03, x1, Math.min(yy, y1 - 0.045) + 0.045, z + 0.03, mat, parent); }
  return im;
}
/** Instanced array of identical geometry along a line (battens, louvres, fins). */
export function batten({ x0, x1, y0, y1, z0, z1, pitch, w, mat, parent, axis = 'x' }) {
  const n = Math.max(1, Math.floor((axis === 'x' ? x1 - x0 : y1 - y0) / pitch)), g = new THREE.BoxGeometry(axis === 'x' ? w : x1 - x0, axis === 'x' ? y1 - y0 : w, z1 - z0);
  wuvBoxFix(g);
  const im = new THREE.InstancedMesh(g, mat, n), d = new THREE.Object3D();
  for (let i = 0; i < n; i++) { d.position.set(axis === 'x' ? x0 + pitch * (i + 0.5) : (x0 + x1) / 2, axis === 'x' ? (y0 + y1) / 2 : y0 + pitch * (i + 0.5), (z0 + z1) / 2); d.updateMatrix(); im.setMatrixAt(i, d.matrix); }
  im.castShadow = im.receiveShadow = true; parent?.add(im); return im;
}
function wuvBoxFix(g) { const uv = g.attributes.uv, pos = g.attributes.position; for (let i = 0; i < uv.count; i++) uv.setXY(i, pos.getZ(i) * 0.5 + pos.getX(i) * 0.5, pos.getY(i) * 0.6); }

/**
 * Street + footpath + kerb + drains. Plot ground is y = 0. Footpath (y 0) from zb to zk, road surface at y = -0.15 from zk.
 * Returns { road, zk, roadY }.
 */
export function streetscape({ scene, zb = 8, foot = 2.6, roadW = 14, x0 = -140, x1 = 140, wet = false, lawn = true, paveColor = 0xb4afa4, seed = 3, kerbColor = 0xbdbab2, plotMat = null, markings = true }) {
  const g = new THREE.Group(), zk = zb + foot, roadY = -0.15;
  const roadMat = T.asphalt({ wet }); if (wet) { roadMat.transparent = true; roadMat.opacity = 0.84; }
  ground(x0, zk, x1, zk + roadW, roadY, roadMat, g);
  ground(x0, zk + roadW, x1, zk + roadW + 60, roadY - 0.01, T.concrete(0x777770, { tileM: 4, seed: 12 }), g);
  const kerb = T.concrete(kerbColor, { tileM: 1.6, seed: 17 });
  boxAt(x0, roadY, zk - 0.02, x1, 0.0, zk + 0.18, kerb, g); boxAt(x0, -0.003, zk - 0.02, x1, 0.012, zk + 0.18, T.concrete(kerbColor, { tileM: 1.2, seed: 21 }), g, { cast: false });
  const pav = T.paving({ color: paveColor, tileM: 2.4, n: 6, seed: 40 + seed }); ground(x0, zb, x1, zk - 0.0, 0.004, pav, g);
  boxAt(x0, 0, zb - 0.0, x1, 0.035, zb + 0.12, T.concrete(0xaaa8a0, { tileM: 2, seed: 8 }), g, { cast: false });
  // drains + manholes + joints
  const dk = T.solid(0x16171a, { roughness: 0.7, metalness: 0.5 });
  for (let x = -50; x < 60; x += 17 + (x % 3)) { boxAt(x, roadY + 0.002, zk + 0.35, x + 0.8, roadY + 0.012, zk + 0.8, dk, g, { cast: false }); for (let i = 0; i < 6; i++) boxAt(x + 0.06 + i * 0.12, roadY + 0.012, zk + 0.37, x + 0.1 + i * 0.12, roadY + 0.02, zk + 0.78, T.metal(0x3b3d40), g, { cast: false }); }
  for (const [mx, mz] of [[-6, zk + roadW * 0.55], [13, zk + roadW * 0.4]]) { const c = new THREE.CylinderGeometry(0.4, 0.4, 0.02, 24); c.translate(mx, roadY + 0.01, mz); add(c, T.metal(0x2c2d2f, { roughness: 0.6 }), g, { cast: false }); }
  if (markings) { const paint = T.solid(0xe6e2d4, { roughness: 0.7 }), zc = zk + roadW / 2; for (let x = x0; x < x1; x += 7) boxAt(x, roadY + 0.004, zc - 0.07, x + 3.5, roadY + 0.01, zc + 0.07, paint, g, { cast: false }); }
  scene.add(g); return { group: g, zk, roadY, roadMat };
}

/** Condenser unit (own version: arch.mjs acUnit rotates the fan disc about the world origin). dir: +1 faces +z */
export function ac(x, y, z, parent, { w = 0.9, h = 0.65, d = 0.35 } = {}) {
  const g = new THREE.Group(); boxAt(x, y, z, x + w, y + h, z + d, T.solid(0xdedcd6, { roughness: 0.55 }), g);
  const fan = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.02, 24), T.solid(0x26282a, { roughness: 0.6 })); fan.rotation.x = Math.PI / 2; fan.position.set(x + w * 0.5, y + h * 0.52, z + d + 0.005); g.add(fan);
  for (let i = 0; i < 6; i++) boxAt(x + 0.05, y + 0.07 + i * 0.1, z + d, x + w - 0.05, y + 0.09 + i * 0.1, z + d + 0.01, T.solid(0x9a9a98), g, { cast: false });
  boxAt(x + 0.05, y - 0.06, z + 0.04, x + 0.12, y, z + d - 0.04, T.solid(0x333333), g); boxAt(x + w - 0.12, y - 0.06, z + 0.04, x + w - 0.05, y, z + d - 0.04, T.solid(0x333333), g);
  parent?.add(g); return g;
}

/* ------------------------------------------------------------------ car (family SUV/sedan; front faces +z at rot=0) */
export function car({ x = 0, z = 0, rot = 0, color = 0xf1f0ec, parent, y = 0, s = 1, lights = false }) {
  const g = new THREE.Group(), P2 = (u, v) => V2(u, v);
  const paint = new THREE.MeshPhysicalMaterial({ color, roughness: 0.28, metalness: 0.55, clearcoat: 1, clearcoatRoughness: 0.05, envMapIntensity: 1.5 }); paint.userData.tileM = 1;
  const glassM = new THREE.MeshPhysicalMaterial({ color: 0x0a0e12, roughness: 0.05, metalness: 0.2, clearcoat: 1, envMapIntensity: 2.4 }); glassM.userData.tileM = 1;
  const tire = T.solid(0x141414, { roughness: 0.9 }), rim = T.metal(0xb9bcc0, { roughness: 0.25 }), black = T.solid(0x0d0d0e, { roughness: 0.5 }), chrome = T.metal(0xd0d3d6, { roughness: 0.2 });
  const extrude = (pts, width, bev, mat, cx = 0) => {
    const e = new THREE.ExtrudeGeometry(new THREE.Shape(pts), { depth: width - 2 * bev, bevelEnabled: bev > 0, bevelThickness: bev, bevelSize: bev * 0.8, bevelSegments: 4, curveSegments: 10 });
    e.translate(0, 0, -(width - 2 * bev) / 2); e.rotateY(-Math.PI / 2); e.translate(cx, 0, 0); return add(e, mat, g, { uv: false });
  };
  const arch = (cu, r, n = 10) => Array.from({ length: n + 1 }, (_, i) => { const a = Math.PI * (1 - i / n); return P2(cu + r * Math.cos(a), 0.34 + r * Math.sin(a) * 1.0); });
  const lower = [P2(-2.22, 0.3), P2(-2.3, 0.6), P2(-2.2, 0.98), P2(-1.0, 1.02), P2(0.8, 1.0), P2(2.0, 0.9), P2(2.28, 0.72), P2(2.3, 0.45), P2(2.2, 0.3), P2(1.88, 0.3), ...arch(1.42, 0.46).reverse().map((p) => p), P2(0.96, 0.3), P2(-0.96, 0.3), ...arch(-1.42, 0.46).reverse(), P2(-1.88, 0.3)];
  // fix ordering: arches generated left->right in angle; reverse so travelling front->rear (decreasing u)
  extrude(lower, 1.86, 0.1, paint);
  const cabin = [P2(-2.0, 0.98), P2(-1.86, 1.5), P2(-1.5, 1.6), P2(0.5, 1.6), P2(1.25, 1.0)];
  extrude(cabin, 1.62, 0.07, paint);
  const gl = [P2(-1.93, 1.02), P2(-1.8, 1.47), P2(-1.5, 1.55), P2(0.5, 1.55), P2(1.19, 1.04)];
  extrude(gl, 1.66, 0, glassM);
  for (const u of [-0.55, 0.55]) { boxAt(-0.9, 1.0, u - 0.04, 0.9, 1.57, u + 0.04, paint, g, { cast: true }); }  // pillars (rendered across width; glass sits under them) 
  // roof rails / mirrors
  for (const sx of [-1, 1]) { boxAt(sx * 0.93 - 0.06, 1.02, 0.75, sx * 0.93 + 0.06, 1.12, 0.95, black, g); boxAt(sx * 0.7 - 0.02, 1.6, -1.4, sx * 0.7 + 0.02, 1.64, 0.4, black, g); }
  // wheels
  for (const sx of [-1, 1]) for (const wz of [1.42, -1.42]) { const t = new THREE.CylinderGeometry(0.37, 0.37, 0.24, 28); t.rotateZ(Math.PI / 2); t.translate(sx * 0.82, 0.37, wz); add(t, tire, g, { uv: false }); const r = new THREE.CylinderGeometry(0.25, 0.25, 0.26, 24); r.rotateZ(Math.PI / 2); r.translate(sx * 0.82 + sx * 0.005, 0.37, wz); add(r, rim, g, { uv: false }); const hb = new THREE.CylinderGeometry(0.07, 0.07, 0.28, 12); hb.rotateZ(Math.PI / 2); hb.translate(sx * 0.82, 0.37, wz); add(hb, black, g, { uv: false }); }
  // wheel wells
  for (const wz of [1.42, -1.42]) boxAt(-0.76, 0.3, wz - 0.4, 0.76, 0.8, wz + 0.4, black, g, { cast: false });
  // front: grille, lamps, bumper; rear: lamps
  boxAt(-0.55, 0.5, 2.27, 0.55, 0.78, 2.33, black, g); boxAt(-0.55, 0.62, 2.325, 0.55, 0.66, 2.335, chrome, g);
  for (const sx of [-1, 1]) { boxAt(sx * 0.78 - 0.2, 0.74, 2.24, sx * 0.78 + 0.2, 0.86, 2.3, T.emissive(0xf4f6ff, lights ? 20 : 2.0), g, { cast: false }); boxAt(sx * 0.78 - 0.2, 0.88, 2.2, sx * 0.78 + 0.2, 0.9, 2.3, black, g); boxAt(sx * 0.78 - 0.18, 0.76, -2.33, sx * 0.78 + 0.18, 0.92, -2.28, T.emissive(0xff2a1a, lights ? 8 : 0.7), g, { cast: false }); }
  boxAt(-0.9, 0.3, 2.2, 0.9, 0.44, 2.3, black, g); boxAt(-0.95, 0.3, -2.32, 0.95, 0.42, -2.2, black, g);
  g.scale.setScalar(s); g.rotation.y = rot; g.position.set(x, y, z); parent?.add(g); return g;
}

/** Soft dirt / weathering gradient plane in front of a wall (z = wall face). Gives plinth dirt, parapet streaks. */
export function weather({ x0, x1, y0, y1, z, parent, alpha = 0.28, color = '70,56,42', dir = 'up', seed = 1, streaks = true }) {
  const c = document.createElement('canvas'); c.width = 256; c.height = 128; const x = c.getContext('2d'), r = rng(seed);
  const gr = x.createLinearGradient(0, dir === 'up' ? 128 : 0, 0, dir === 'up' ? 0 : 128); gr.addColorStop(0, `rgba(${color},${alpha})`); gr.addColorStop(0.55, `rgba(${color},${alpha * 0.25})`); gr.addColorStop(1, `rgba(${color},0)`); x.fillStyle = gr; x.fillRect(0, 0, 256, 128);
  if (streaks) for (let i = 0; i < 70; i++) { const px = r() * 256, ww = 1 + r() * 4, len = 30 + r() * 90, a = 0.05 + r() * 0.12; const g2 = x.createLinearGradient(0, dir === 'up' ? 128 : 0, 0, dir === 'up' ? 128 - len : len); g2.addColorStop(0, `rgba(${color},${a})`); g2.addColorStop(1, `rgba(${color},0)`); x.fillStyle = g2; x.fillRect(px, dir === 'up' ? 128 - len : 0, ww, len); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0, y1 - y0), new THREE.MeshBasicMaterial({ map: t, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -3, toneMapped: true }));
  m.position.set((x0 + x1) / 2, (y0 + y1) / 2, z + 0.004); m.renderOrder = 2; parent?.add(m); return m;
}
