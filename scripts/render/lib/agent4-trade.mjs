// agent4: trades props — ladders, hand tools, paint kit, toolbox, tile boxes, pipes/fittings/taps, conduit & wiring, boards, membranes, swatches, droplets.
import * as THREE from 'three';
import { Mesher, lin, rng, tintVar, makeNoise } from './agent4-geo.mjs';
import * as M from './agent4-mat.mjs';
export { THREE };
const mesh = (geo, mat, parent, o = {}) => { const m = new THREE.Mesh(geo, mat); m.castShadow = o.cast ?? true; m.receiveShadow = true; parent?.add(m); return m; };
const lathe = (pts, seg = 28) => new THREE.LatheGeometry(pts.map((p) => new THREE.Vector2(p[0], p[1])), seg);
const metalVC = () => M.memo('metalVC', () => M.solidMat(0xffffff, { roughness: 0.4, metalness: 0.85, vertexColors: true }));
const plasVC = () => M.memo('plasVC', () => M.solidMat(0xffffff, { roughness: 0.45, metalness: 0.0, vertexColors: true }));

/** ladder from foot (x,y,z) to top (x,y,z). type alu | wood */
export function ladder({ foot, top, width = 0.42, rungs = 11, type = 'alu', parent, seed = 1 }) {
  const m = new Mesher(), r = rng(seed), f = new THREE.Vector3(...foot), t = new THREE.Vector3(...top), d = new THREE.Vector3().subVectors(t, f), len = d.length(), dir = d.clone().normalize(), side = new THREE.Vector3(0, 1, 0).cross(dir).normalize().multiplyScalar(width / 2);
  const col = type === 'alu' ? lin(0xb4b8ba) : tintVar(0xb08a55, r, 0.06, 0.04), q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
  for (const sgn of [-1, 1]) { const c = f.clone().addScaledVector(d, 0.5).addScaledVector(side, sgn); m.box(c.x, c.y, c.z, 0.04, len, 0.07, { q, color: col, tile: 1 }); }
  const q2 = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(1, 0, 0), side.clone().normalize());
  for (let i = 0; i < rungs; i++) { const c = f.clone().addScaledVector(d, (i + 0.8) / (rungs + 0.4)); if (type === 'alu') m.box(c.x, c.y, c.z, width, 0.028, 0.035, { q: q2, color: lin(0xa6aaac) }); else m.tube(c.clone().addScaledVector(side, -1), c.clone().addScaledVector(side, 1), 0.017, { sides: 6, color: col }); }
  const g = new THREE.Group(); m.mesh(type === 'alu' ? metalVC() : M.timber({ color: 0xffffff, seed: 3 }) && M.solidMat(0xffffff, { roughness: 0.7, vertexColors: true }), g); parent?.add(g); return g;
}
export function trowel({ x, y = 0, z, ry = 0, rz = 0, parent, seed = 1, mortar = true }) {
  const g = new THREE.Group(), sh = new THREE.Shape(); sh.moveTo(0, 0); sh.lineTo(0.075, 0.04); sh.lineTo(0.075, 0.2); sh.lineTo(-0.075, 0.2); sh.lineTo(-0.075, 0.04); sh.closePath();
  const geo = new THREE.ExtrudeGeometry(sh, { depth: 0.0012, bevelEnabled: false }); geo.rotateX(-Math.PI / 2); const bl = mesh(geo, M.steel(0xc9ccce, { roughness: 0.22, rust: 0.0 }), g); bl.position.set(0, 0.03, 0);
  mesh(new THREE.CylinderGeometry(0.0035, 0.0035, 0.05, 6), M.steel(0x9a9ea0), g).position.set(0, 0.045, 0.22); g.children[1].rotation.x = Math.PI / 2 - 0.5;
  const hd = mesh(new THREE.CylinderGeometry(0.018, 0.014, 0.12, 10), M.solidMat(0x2a2a2a, { roughness: 0.6 }), g); hd.rotation.x = Math.PI / 2; hd.position.set(0, 0.065, 0.3);
  if (mortar) { const mm = mesh(new THREE.SphereGeometry(0.05, 12, 6), M.mortar(0x938e83, 5), g); mm.scale.set(1.1, 0.3, 1.5); mm.position.set(0, 0.04, 0.1); }
  g.rotation.set(0, ry, rz); g.position.set(x, y, z); g.scale.setScalar(1.0); const outer = new THREE.Group(); outer.add(g); g.rotation.x = 0; g.rotation.y = 0; outer.position.set(x, y, z); g.position.set(0, 0, 0); outer.rotation.y = ry; outer.rotation.z = rz; parent?.add(outer); void seed; return outer;
}
export function puttyKnife({ x, y = 0, z, ry = 0, parent, w = 0.1, len = 0.14 }) {
  const g = new THREE.Group(); mesh(new THREE.BoxGeometry(w, 0.0012, len), M.steel(0xc4c7c9, { roughness: 0.25 }), g).position.set(0, 0.0006, -len / 2 - 0.04);
  mesh(new THREE.BoxGeometry(0.035, 0.03, 0.12), M.solidMat(0xe2a31a, { roughness: 0.55 }), g).position.set(0, 0.015, 0.02); mesh(new THREE.BoxGeometry(0.02, 0.0012, 0.03), M.steel(0xaaaaaa), g).position.set(0, 0.0006, -0.03);
  g.position.set(x, y, z); g.rotation.y = ry; parent?.add(g); return g;
}
export function spiritLevel({ x, y = 0, z, ry = 0, len = 0.8, parent }) {
  const g = new THREE.Group(), ym = M.solidMat(0xe5a617, { roughness: 0.5, metalness: 0.3 }); mesh(new THREE.BoxGeometry(len, 0.07, 0.03), ym, g).position.y = 0.035;
  mesh(new THREE.BoxGeometry(len * 0.985, 0.06, 0.032), M.solidMat(0x222222, { roughness: 0.6 }), g, { cast: false }).position.y = 0.035; g.children[1].scale.set(1, 0.98, 0.9); g.remove(g.children[1]);
  const vm = M.solidMat(0xd8e8a0, { roughness: 0.1, transparent: true, opacity: 0.85 }); for (const dx of [-0.25 * len, 0, 0.25 * len]) { const v = mesh(new THREE.CylinderGeometry(0.011, 0.011, 0.07, 10), vm, g, { cast: false }); v.rotation.x = Math.PI / 2; v.position.set(dx, 0.04, 0.0); v.scale.set(1, 1, 0.75); if (dx !== 0) v.rotation.z = Math.PI / 2, v.rotation.x = 0, v.rotation.y = 0, v.scale.set(1, 1, 1), v.rotation.set(0, 0, Math.PI / 2), v.scale.set(1, 1.9, 1), v.geometry = new THREE.CylinderGeometry(0.009, 0.009, 0.06, 10); }
  for (const dx of [-len / 2 + 0.01, len / 2 - 0.01]) mesh(new THREE.BoxGeometry(0.02, 0.072, 0.034), M.solidMat(0x1d1d1d, { roughness: 0.6 }), g).position.set(dx, 0.035, 0);
  g.position.set(x, y, z); g.rotation.y = ry; parent?.add(g); return g;
}
export function paintRoller({ x, y = 0, z, ry = 0, parent, color = 0xe9e4d6, wet = true, rz = 0 }) {
  const g = new THREE.Group(), fm = M.steel(0x9fa3a5, { roughness: 0.4 }), cv = M.memo('rollerCover', () => { const c = document.createElement('canvas'); c.width = 128; c.height = 128; const x2 = c.getContext('2d'), q = rng(3); x2.fillStyle = '#e8e6e1'; x2.fillRect(0, 0, 128, 128); for (let i = 0; i < 3000; i++) { const v = 170 + q() * 85; x2.fillStyle = `rgb(${v},${v},${v - 6})`; x2.fillRect(q() * 128, q() * 128, 2, 2); } const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; });
  const cm = new THREE.MeshStandardMaterial({ map: cv, roughness: 1, color: wet ? color : 0xf2f0ea }); mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.23, 20), cm, g).rotation.z = Math.PI / 2;
  const mh = new Mesher(); const c = lin(0x9fa3a5); mh.tube([0, 0, 0], [0, 0.0, 0.1], 0.0025, { sides: 5, color: c }); mh.path([[0.12, 0, 0], [0.13, 0, 0.0], [0.13, 0, 0.06], [0.0, 0, 0.1], [-0.13, 0, 0.06], [-0.13, 0, 0.0], [-0.12, 0, 0]], 0.0025, { sides: 5, color: c }); mh.path([[0, 0, 0.1], [0, 0, 0.2], [0, 0.0, 0.3]], 0.0035, { sides: 5, color: c }); mh.mesh(metalVC(), g);
  const hd = mesh(new THREE.CylinderGeometry(0.017, 0.017, 0.14, 10), M.solidMat(0xd23c1e, { roughness: 0.5 }), g); hd.rotation.x = Math.PI / 2; hd.position.set(0, 0, 0.33); void fm;
  g.position.set(x, y + 0.035, z); g.rotation.set(0, ry, rz); parent?.add(g); return g;
}
export function rollerTray({ x, y = 0, z, ry = 0, color = 0xe9e4d6, parent }) {
  const g = new THREE.Group(), pm = M.solidMat(0xd8d8d2, { roughness: 0.5 }), m = new Mesher(); const V = (a, b, c) => new THREE.Vector3(a, b, c);
  m.quad(V(-0.16, 0.0, 0.17), V(0.16, 0.0, 0.17), V(0.16, 0.05, -0.17), V(-0.16, 0.05, -0.17)); const geo = m.geometry(); const t = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: 0xcfcfc8, roughness: 0.5, side: THREE.DoubleSide })); t.castShadow = true; g.add(t); void pm;
  const wet = new THREE.Mesh(new THREE.PlaneGeometry(0.28, 0.12), M.solidMat(color, { roughness: 0.25 })); wet.rotation.x = -Math.PI / 2; wet.position.set(0, 0.012, 0.1); wet.rotation.x = -Math.PI / 2 + 0.0; g.add(wet);
  for (const sx of [-1, 1]) mesh(new THREE.BoxGeometry(0.012, 0.06, 0.36), pm, g).position.set(sx * 0.16, 0.03, 0);
  mesh(new THREE.BoxGeometry(0.32, 0.06, 0.012), pm, g).position.set(0, 0.03, -0.18);
  g.position.set(x, y, z); g.rotation.y = ry; parent?.add(g); return g;
}
export function toolbox({ x, y = 0, z, ry = 0, color = 0xb3261e, parent, open = true }) {
  const g = new THREE.Group(), pm = M.paintedSteel(color, { seed: 8, wear: 0.7, splatter: 0.3 }), W = 0.5, D = 0.24, H = 0.2;
  const wm = [[0, 0.003, 0, W, 0.006, D], [0, H / 2, D / 2, W, H, 0.006], [0, H / 2, -D / 2, W, H, 0.006], [W / 2, H / 2, 0, 0.006, H, D], [-W / 2, H / 2, 0, 0.006, H, D]]; for (const a of wm) mesh(new THREE.BoxGeometry(a[3], a[4], a[5]), pm, g).position.set(a[0], a[1], a[2]);
  const lid = new THREE.Group(); mesh(new THREE.BoxGeometry(W, 0.006, D), pm, lid).position.set(0, 0, D / 2); mesh(new THREE.BoxGeometry(W, 0.04, 0.006), pm, lid).position.set(0, -0.02, D); lid.position.set(0, H, -D / 2); lid.rotation.x = open ? -1.9 : 0; g.add(lid);
  const sm = M.steel(0xaaaaaa, { roughness: 0.3 }); for (const sx of [-0.15, 0.15]) mesh(new THREE.BoxGeometry(0.01, 0.01, 0.01), sm, g).position.set(sx, H + 0.003, D / 2);
  const hammer = new Mesher(); hammer.tube([-0.2, 0.05, 0.03], [0.18, 0.05, 0.03], 0.012, { sides: 8, color: lin(0xb9955f) }); hammer.box(0.2, 0.05, 0.03, 0.04, 0.035, 0.035, { color: lin(0x8a8d90) }); hammer.mesh(metalVC(), g);
  mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.2, 8), M.solidMat(0x2a2a2a), g).position.set(0.05, 0.04, -0.04); g.children[g.children.length - 1].rotation.z = Math.PI / 2;
  g.position.set(x, y, z); g.rotation.y = ry; parent?.add(g); return g;
}
/** cardboard tile boxes (stacked) with a printed band, no text */
export function tileBoxes({ x, z, y = 0, ry = 0, cols = 3, rows = 2, layers = 3, seed = 1, parent, size = [0.62, 0.14, 0.62], colour = 0xb08a5a }) {
  const r = rng(seed), g = new THREE.Group(), m = new Mesher(), tex = M.memo(`tbox${colour}`, () => { const c = document.createElement('canvas'); c.width = 256; c.height = 256; const q = c.getContext('2d'); q.fillStyle = '#b79562'; q.fillRect(0, 0, 256, 256); for (let i = 0; i < 1500; i++) { q.fillStyle = `rgba(${r() < 0.5 ? 255 : 80},${r() < 0.5 ? 240 : 70},60,0.04)`; q.fillRect(r() * 256, r() * 256, 4, 1); } q.fillStyle = '#d9d2c4'; q.fillRect(30, 90, 196, 76); q.fillStyle = '#2d4a63'; q.fillRect(30, 90, 196, 14); q.fillStyle = '#8c7a62'; for (let i = 0; i < 4; i++) q.fillRect(44, 116 + i * 10, 120 - i * 14, 3); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; });
  const mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.92 });
  for (let l = 0; l < layers; l++) for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) { m.box((i - (cols - 1) / 2) * (size[0] + 0.01) + (r() - 0.5) * 0.015, size[1] / 2 + l * size[1], (j - (rows - 1) / 2) * (size[2] + 0.01) + (r() - 0.5) * 0.015, size[0], size[1], size[2], { ry: (r() - 0.5) * 0.06, tile: [size[0] * 1.2, size[2] * 1.2], uv: [0, 0] }); }
  m.mesh(mat, g); g.position.set(x, y, z); g.rotation.y = ry; parent?.add(g); return g;
}
/** colour swatch fan (paint chips) fanning from a pivot. colours = hex list. */
export function swatchFan({ x, y, z, ry = 0, colors, parent, spread = 1.3, len = 0.19, w = 0.04 }) {
  const g = new THREE.Group(), n = colors.length; colors.forEach((c, i) => { const a = (i / (n - 1) - 0.5) * spread; const chip = new THREE.Group(); const plate = mesh(new THREE.BoxGeometry(w, 0.002, len), M.solidMat(c, { roughness: 0.85 }), chip); plate.position.z = -len / 2 + 0.01; plate.position.y = i * 0.0021; mesh(new THREE.BoxGeometry(w, 0.0015, 0.04), M.solidMat(0xf1efe8, { roughness: 0.9 }), chip, { cast: false }).position.set(0, i * 0.0021 + 0.0005, -len + 0.03); chip.rotation.y = a; g.add(chip); });
  mesh(new THREE.CylinderGeometry(0.008, 0.008, n * 0.0022 + 0.006, 10), M.steel(0x8a8a8a), g).position.y = n * 0.0011; g.position.set(x, y, z); g.rotation.y = ry; parent?.add(g); return g;
}

// ---------------------------------------------------------------- plumbing
export const MAT = { copper: () => M.memo('copper', () => M.solidMat(0xc27a4a, { roughness: 0.3, metalness: 1.0 })), copperOld: () => M.memo('copperOld', () => M.solidMat(0xa86b44, { roughness: 0.45, metalness: 1.0 })), brass: () => M.memo('brass', () => M.solidMat(0xd0a63e, { roughness: 0.28, metalness: 1.0 })), chrome: () => M.memo('chrome', () => M.solidMat(0xd8dce0, { roughness: 0.1, metalness: 1.0 })), pvcGrey: () => M.memo('pvcG', () => M.solidMat(0x8e949a, { roughness: 0.42 })), pvcWhite: () => M.memo('pvcW', () => M.solidMat(0xe6e4dc, { roughness: 0.38 })), pvcBlue: () => M.memo('pvcB', () => M.solidMat(0x2f6fb0, { roughness: 0.4 })) };
/** straight pipe with optional collars; returns group. a,b arrays. */
export function pipe({ a, b, r = 0.011, mat, parent, collars = [], collarMat = null, cr = null }) {
  const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b), d = new THREE.Vector3().subVectors(B, A), len = d.length(), g = new THREE.Group();
  const m = mesh(new THREE.CylinderGeometry(r, r, len, 20), mat, g); m.position.copy(A).addScaledVector(d, 0.5); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.clone().normalize());
  for (const t of collars) { const c = mesh(new THREE.CylinderGeometry(cr ?? r * 1.35, cr ?? r * 1.35, 0.03, 20), collarMat || mat, g); c.position.copy(A).addScaledVector(d, t); c.quaternion.copy(m.quaternion); }
  parent?.add(g); return g;
}
export function elbow({ p, from, to, r = 0.011, mat, parent, collarMat }) { // p corner, from/to unit-ish direction arrays: bend radius torus section
  const g = new THREE.Group(), P = new THREE.Vector3(...p), u = new THREE.Vector3(...from).normalize(), v = new THREE.Vector3(...to).normalize(), br = r * 2.2;
  const c1 = P.clone().addScaledVector(u, br), c2 = P.clone().addScaledVector(v, br), curve = new THREE.QuadraticBezierCurve3(c1, P, c2), m = mesh(new THREE.TubeGeometry(curve, 14, r * 1.02, 16), mat, g);
  for (const [c, dir] of [[c1, u], [c2, v]]) { const cl = mesh(new THREE.CylinderGeometry(r * 1.3, r * 1.3, 0.028, 18), collarMat || mat, g); cl.position.copy(c).addScaledVector(dir, 0.01); cl.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir); }
  void m; parent?.add(g); return g;
}
export function tee({ p, axis = [1, 0, 0], branch = [0, 0, 1], r = 0.011, len = 0.1, mat, parent, collarMat }) {
  const g = new THREE.Group(), P = new THREE.Vector3(...p), ax = new THREE.Vector3(...axis).normalize(), br = new THREE.Vector3(...branch).normalize();
  const body = mesh(new THREE.CylinderGeometry(r * 1.25, r * 1.25, len, 20), mat, g); body.position.copy(P); body.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), ax);
  const arm = mesh(new THREE.CylinderGeometry(r * 1.25, r * 1.25, len * 0.5, 20), mat, g); arm.position.copy(P).addScaledVector(br, len * 0.25); arm.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), br);
  for (const s of [-1, 1]) { const c = mesh(new THREE.CylinderGeometry(r * 1.4, r * 1.4, 0.012, 20), collarMat || mat, g); c.position.copy(P).addScaledVector(ax, s * len * 0.5); c.quaternion.copy(body.quaternion); }
  parent?.add(g); return g;
}
/** wall tap (bib cock): body + spout + handle. origin at wall point pointing +z (out of wall) */
export function tap({ x, y, z, ry = 0, parent, mat = MAT.chrome(), r = 0.011 }) {
  const g = new THREE.Group(), flange = mesh(new THREE.CylinderGeometry(0.03, 0.032, 0.012, 24), mat, g); flange.rotation.x = Math.PI / 2; flange.position.z = 0.006;
  const body = mesh(new THREE.CylinderGeometry(r * 1.4, r * 1.4, 0.07, 20), mat, g); body.rotation.x = Math.PI / 2; body.position.z = 0.04;
  const sp = mesh(new THREE.CylinderGeometry(r * 0.9, r * 0.9, 0.07, 18), mat, g); sp.position.set(0, -0.035, 0.065); const sp2 = mesh(new THREE.CylinderGeometry(r * 0.7, r * 0.7, 0.03, 18), mat, g); sp2.position.set(0, -0.085, 0.065);
  const st = mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.04, 12), mat, g); st.position.set(0, 0.03, 0.04);
  const hd = mesh(new THREE.BoxGeometry(0.075, 0.014, 0.018), mat, g); hd.position.set(0, 0.055, 0.04); mesh(new THREE.SphereGeometry(0.012, 12, 8), mat, g).position.set(0, 0.058, 0.04);
  g.position.set(x, y, z); g.rotation.y = ry; parent?.add(g); return g;
}
export function valve({ x, y, z, parent, axis = [1, 0, 0], mat = MAT.brass(), r = 0.012 }) { const g = new THREE.Group(), ax = new THREE.Vector3(...axis).normalize(); const b = mesh(new THREE.SphereGeometry(r * 2.1, 18, 12), mat, g); b.scale.set(1, 1, 1.0); const n1 = mesh(new THREE.CylinderGeometry(r * 1.45, r * 1.45, r * 5.5, 6), mat, g); n1.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), ax); const h = mesh(new THREE.BoxGeometry(r * 7, r * 0.8, r * 1.5), M.solidMat(0xc0301f, { roughness: 0.4, metalness: 0.3 }), g); h.position.y = r * 2.6; mesh(new THREE.CylinderGeometry(r * 0.7, r * 0.7, r * 3, 10), mat, g).position.y = r * 1.6; g.position.set(x, y, z); parent?.add(g); return g; }
/** pipe clamp / saddle against a wall */
export function clip({ p, dir = [0, 0, 1], r = 0.011, parent }) { const g = new THREE.Group(), m = mesh(new THREE.TorusGeometry(r * 1.2, 0.0035, 6, 14, Math.PI), M.steel(0xbfc2c4, { roughness: 0.3 }), g); m.position.set(...p); m.rotation.z = Math.PI; void dir; mesh(new THREE.BoxGeometry(0.03, 0.004, 0.01), M.steel(0xbfc2c4), g).position.set(p[0], p[1] + r * 1.1, p[2] - r); parent?.add(g); return g; }

// ---------------------------------------------------------------- electrical
/** conduit run (PVC, white/grey) as a smooth rounded polyline tube */
export function conduit({ pts, r = 0.0105, color = 0xe9e7df, parent, wires = null }) {
  const m = new Mesher(); m.path(pts, r, { sides: 12, color: lin(color), tileV: 1 }); const g = new THREE.Group(); m.mesh(plasVC(), g); parent?.add(g); return g;
}
export function wirePath({ pts, r = 0.0016, color = 0xc4291b, parent }) { const m = new Mesher(); m.path(pts, r, { sides: 5, color: lin(color) }); const g = new THREE.Group(); m.mesh(plasVC(), g); parent?.add(g); return g; }
export function junctionBox({ x, y, z, parent, w = 0.075, h = 0.075, d = 0.04, color = 0xcfccc3, ry = 0 }) { const g = new THREE.Group(); mesh(new THREE.BoxGeometry(w, h, d), M.solidMat(color, { roughness: 0.5 }), g); g.position.set(x, y, z); g.rotation.y = ry; parent?.add(g); return g; }
/** flush metal/PVC switch box with plate, optional switches (rockers) */
export function switchPlate({ x, y, z, ry = 0, gangs = 2, parent, color = 0xf1efe9 }) {
  const g = new THREE.Group(), w = 0.04 + gangs * 0.037, pm = M.solidMat(color, { roughness: 0.35 }); mesh(new THREE.BoxGeometry(w, 0.115, 0.01), pm, g).position.z = 0.005;
  for (let i = 0; i < gangs; i++) { const sx = (i - (gangs - 1) / 2) * 0.036; mesh(new THREE.BoxGeometry(0.026, 0.045, 0.006), M.solidMat(0xe5e3dc, { roughness: 0.3 }), g).position.set(sx, 0.012, 0.012); mesh(new THREE.BoxGeometry(0.022, 0.016, 0.003), M.solidMat(0xdad7d0, { roughness: 0.3 }), g).position.set(sx, -0.03, 0.0115); }
  for (const sy of [-0.052, 0.052]) { const sc = mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.003, 8), M.steel(0xa7a9ab), g); sc.position.set(0, sy, 0.0115); sc.rotation.x = Math.PI / 2; }
  g.position.set(x, y, z); g.rotation.y = ry; parent?.add(g); return g;
}
export function openBox({ x, y, z, ry = 0, w = 0.075, h = 0.075, d = 0.05, parent, color = 0x6c7276 }) { const g = new THREE.Group(), m = M.solidMat(color, { roughness: 0.45, metalness: 0.7 }); mesh(new THREE.BoxGeometry(w, h, 0.003), m, g).position.z = -d / 2; for (const [sx, sy, bw, bh] of [[0, h / 2, w, 0.003], [0, -h / 2, w, 0.003]]) mesh(new THREE.BoxGeometry(bw, bh, d), m, g).position.set(sx, sy, 0); for (const sx of [-w / 2, w / 2]) mesh(new THREE.BoxGeometry(0.003, h, d), m, g).position.set(sx, 0, 0); g.position.set(x, y, z); g.rotation.y = ry; parent?.add(g); return g; }
/** distribution board (DB) with MCB row, door open optional */
export function distributionBoard({ x, y, z, ry = 0, parent, rows = 2, mods = 8, door = true }) {
  const g = new THREE.Group(), W = 0.1 + mods * 0.018, H = 0.12 + rows * 0.11, D = 0.09, bm = M.solidMat(0xe9e7e0, { roughness: 0.4, metalness: 0.2 });
  const back = mesh(new THREE.BoxGeometry(W, H, 0.004), bm, g); back.position.z = 0.002; for (const sx of [-1, 1]) mesh(new THREE.BoxGeometry(0.006, H, D), bm, g).position.set(sx * (W / 2 - 0.003), 0, D / 2); for (const sy of [-1, 1]) mesh(new THREE.BoxGeometry(W, 0.006, D), bm, g).position.set(0, sy * (H / 2 - 0.003), D / 2);
  const blk = M.solidMat(0x25282b, { roughness: 0.45 }), org = M.solidMat(0xd8541c, { roughness: 0.5 }), wh = M.solidMat(0xeeeeea, { roughness: 0.4 }), cu = MAT.copper(), rail = M.steel(0xa5a8aa, { roughness: 0.4 });
  for (let rr = 0; rr < rows; rr++) { const yy = (rr - (rows - 1) / 2) * 0.11; mesh(new THREE.BoxGeometry(W - 0.06, 0.035, 0.004), rail, g).position.set(0, yy, 0.01);
    for (let i = 0; i < mods; i++) { const sx = (i - (mods - 1) / 2) * 0.0178; mesh(new THREE.BoxGeometry(0.0172, 0.075, 0.06), i % 4 === 0 ? wh : blk, g).position.set(sx, yy, 0.04); const tg = mesh(new THREE.BoxGeometry(0.009, 0.02, 0.014), i % 3 === 0 ? org : wh, g); tg.position.set(sx, yy + (i % 5 === 0 ? -0.012 : 0.012), 0.073); }
    mesh(new THREE.BoxGeometry(W - 0.06, 0.014, 0.012), cu, g).position.set(0, yy + 0.049, 0.02); mesh(new THREE.BoxGeometry(W - 0.06, 0.014, 0.012), M.solidMat(0x2e6fb5, { roughness: 0.4 }), g).position.set(0, yy - 0.049, 0.02); }
  if (door) { const dg = new THREE.Group(), dm = mesh(new THREE.BoxGeometry(W - 0.01, H - 0.01, 0.004), bm, dg); dm.position.set((W - 0.01) / 2, 0, 0); dg.position.set(-W / 2, 0, D); dg.rotation.y = -2.0; g.add(dg); }
  g.position.set(x, y, z); g.rotation.y = ry; parent?.add(g); return g;
}

// ---------------------------------------------------------------- roof / waterproofing
/** droplets on a horizontal surface (y) in rect; glassy spheres */
export function droplets({ x0, z0, x1, z1, y, count = 40, parent, seed = 1, rad = [0.004, 0.012], heightFn = null }) {
  const r = rng(seed), mat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.02, metalness: 0, transmission: 0.0, transparent: true, opacity: 0.55, clearcoat: 1, envMapIntensity: 2.5, ior: 1.33, reflectivity: 0.9 });
  const im = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 20, 12), mat, count), d = new THREE.Object3D();
  for (let i = 0; i < count; i++) { const rr = rad[0] + Math.pow(r(), 2) * (rad[1] - rad[0]), px = x0 + r() * (x1 - x0), pz = z0 + r() * (z1 - z0); d.position.set(px, (heightFn ? heightFn(px, pz) : y) + rr * 0.3, pz); d.scale.set(rr * (1 + r() * 0.3), rr * 0.55, rr * (1 + r() * 0.3)); d.rotation.y = r() * 6; d.updateMatrix(); im.setMatrixAt(i, d.matrix); }
  im.castShadow = false; im.receiveShadow = true; parent?.add(im); return im;
}
