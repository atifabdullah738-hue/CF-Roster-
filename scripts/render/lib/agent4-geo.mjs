// agent4: geometry helpers — merged mesh builder (boxes / tubes / paths), noise, heaps, displaced ground.
import * as THREE from 'three';
import { rng } from './textures.mjs';
export { THREE };

export function worldUV(geo, tile = 1) {
  const pos = geo.attributes.position, nor = geo.attributes.normal; if (!geo.attributes.uv) geo.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(pos.count * 2), 2)); const uv = geo.attributes.uv;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i), nx = Math.abs(nor.getX(i)), ny = Math.abs(nor.getY(i)), nz = Math.abs(nor.getZ(i));
    if (nx >= ny && nx >= nz) uv.setXY(i, z / tile, y / tile); else if (ny >= nx && ny >= nz) uv.setXY(i, x / tile, z / tile); else uv.setXY(i, x / tile, y / tile);
  }
  uv.needsUpdate = true; return geo;
}

// ---- value noise (non tileable, smooth) for geometry
export function makeNoise(seed = 1) {
  const h = (ix, iy) => { let n = (ix * 374761393 + iy * 668265263 + seed * 2147483647) | 0; n = Math.imul(n ^ (n >>> 13), 1274126177); n ^= n >>> 16; return (n >>> 0) / 4294967296; };
  return (x, y) => { const ix = Math.floor(x), iy = Math.floor(y), fx = x - ix, fy = y - iy, sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy), a = h(ix, iy), b = h(ix + 1, iy), c = h(ix, iy + 1), d = h(ix + 1, iy + 1); return a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy; };
}
export function fbm(n, x, y, oct = 4, lac = 2, gain = 0.5) { let a = 0.5, s = 0, t = 0; for (let i = 0; i < oct; i++) { s += n(x, y) * a; t += a; x *= lac; y *= lac; a *= gain; } return s / t; }

const FACES = [
  { n: [1, 0, 0], v: [[1, -1, 1], [1, -1, -1], [1, 1, -1], [1, 1, 1]], d: 'zy' }, { n: [-1, 0, 0], v: [[-1, -1, -1], [-1, -1, 1], [-1, 1, 1], [-1, 1, -1]], d: 'zy' },
  { n: [0, 1, 0], v: [[-1, 1, 1], [1, 1, 1], [1, 1, -1], [-1, 1, -1]], d: 'xz' }, { n: [0, -1, 0], v: [[-1, -1, -1], [1, -1, -1], [1, -1, 1], [-1, -1, 1]], d: 'xz' },
  { n: [0, 0, 1], v: [[-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]], d: 'xy' }, { n: [0, 0, -1], v: [[1, -1, -1], [-1, -1, -1], [-1, 1, -1], [1, 1, -1]], d: 'xy' },
];
const UVC = [[0, 0], [1, 0], [1, 1], [0, 1]];
const _q = new THREE.Quaternion(), _v = new THREE.Vector3(), _e = new THREE.Euler(), _a = new THREE.Vector3(), _b = new THREE.Vector3(), _t = new THREE.Vector3(), _n = new THREE.Vector3(), _bn = new THREE.Vector3(), _up = new THREE.Vector3(0, 1, 0);

/** Accumulates many primitives into ONE BufferGeometry (positions/normals/uv/vertex colours). */
export class Mesher {
  constructor() { this.P = []; this.N = []; this.U = []; this.C = []; this.I = []; this.n = 0; this.hasColor = false; }
  get verts() { return this.n; }
  /** Box centred at (cx,cy,cz), size sx,sy,sz. o: q | {rx,ry,rz} | tile (num | [tu,tv]) | uv:[ou,ov] | color:[r,g,b] (linear) | skip:[faceIdx] */
  box(cx, cy, cz, sx, sy, sz, o = {}) {
    let q = o.q; if (!q) { if (o.rx || o.ry || o.rz) { _e.set(o.rx || 0, o.ry || 0, o.rz || 0, 'YXZ'); q = _q.setFromEuler(_e); } }
    const tile = o.tile ?? 1, tu = Array.isArray(tile) ? tile[0] : tile, tv = Array.isArray(tile) ? tile[1] : tile, ou = o.uv ? o.uv[0] : 0, ov = o.uv ? o.uv[1] : 0, col = o.color;
    if (col) this.hasColor = true;
    for (let fi = 0; fi < 6; fi++) {
      if (o.skip && o.skip.includes(fi)) continue; const F = FACES[fi];
      const da = F.d === 'zy' ? sz : sx, db = F.d === 'xz' ? sz : sy; _n.set(...F.n); if (q) _n.applyQuaternion(q);
      for (let k = 0; k < 4; k++) {
        _v.set(F.v[k][0] * sx / 2, F.v[k][1] * sy / 2, F.v[k][2] * sz / 2); if (q) _v.applyQuaternion(q);
        this.P.push(_v.x + cx, _v.y + cy, _v.z + cz); this.N.push(_n.x, _n.y, _n.z); this.U.push(ou + UVC[k][0] * da / tu, ov + UVC[k][1] * db / tv); if (col) this.C.push(col[0], col[1], col[2]); else this.C.push(1, 1, 1);
      }
      const b = this.n; this.I.push(b, b + 1, b + 2, b, b + 2, b + 3); this.n += 4;
    }
    return this;
  }
  /** Tube along a polyline (array of THREE.Vector3 | [x,y,z]); radius r or fn(i,t)->r. closed => loop. */
  path(pts, r, { sides = 8, closed = false, color = null, colorFn = null, tileV = 0.1, uOff = 0, caps = true } = {}) {
    const P = pts.map((p) => (Array.isArray(p) ? new THREE.Vector3(...p) : p.clone())), nP = P.length; if (nP < 2) return this;
    const rf = typeof r === 'function' ? r : () => r; this.hasColor = this.hasColor || !!color || !!colorFn;
    const tans = P.map((p, i) => { const a = P[(i - 1 + nP) % nP], c = P[(i + 1) % nP]; const t = new THREE.Vector3(); if (!closed && i === 0) t.subVectors(P[1], P[0]); else if (!closed && i === nP - 1) t.subVectors(P[nP - 1], P[nP - 2]); else { const t1 = new THREE.Vector3().subVectors(p, a).normalize(), t2 = new THREE.Vector3().subVectors(c, p).normalize(); t.addVectors(t1, t2); if (t.lengthSq() < 1e-8) t.copy(t2); } return t.normalize(); });
    let N0 = new THREE.Vector3(1, 0, 0); if (Math.abs(tans[0].x) > 0.9) N0.set(0, 0, 1); N0.addScaledVector(tans[0], -N0.dot(tans[0])).normalize();
    let acc = 0; const base = this.n;
    for (let i = 0; i < nP; i++) {
      const T = tans[i]; if (i > 0) acc += P[i].distanceTo(P[i - 1]);
      N0.addScaledVector(T, -N0.dot(T)).normalize(); const B = new THREE.Vector3().crossVectors(T, N0);
      let rad = rf(i, i / (nP - 1)); if (i > 0 && i < nP - 1 || closed) { const t1 = new THREE.Vector3().subVectors(P[i], P[(i - 1 + nP) % nP]).normalize(); rad /= Math.max(0.6, Math.abs(t1.dot(T))); }
      const c = colorFn ? colorFn(i, i / (nP - 1)) : color;
      for (let s = 0; s <= sides; s++) {
        const a = (s / sides) * Math.PI * 2, cs = Math.cos(a), sn = Math.sin(a); const nx = N0.x * cs + B.x * sn, ny = N0.y * cs + B.y * sn, nz = N0.z * cs + B.z * sn;
        this.P.push(P[i].x + nx * rad, P[i].y + ny * rad, P[i].z + nz * rad); this.N.push(nx, ny, nz); this.U.push(uOff + s / sides, acc / tileV); if (c) this.C.push(c[0], c[1], c[2]); else this.C.push(1, 1, 1);
      }
      this.n += sides + 1;
    }
    const segs = closed ? nP : nP - 1;
    for (let i = 0; i < segs; i++) { const a = base + i * (sides + 1), b = base + ((i + 1) % nP) * (sides + 1); for (let s = 0; s < sides; s++) this.I.push(a + s, a + s + 1, b + s, a + s + 1, b + s + 1, b + s); }
    if (caps && !closed) for (const end of [0, nP - 1]) {
      const T = tans[end], c0 = this.n, cp = P[end], c = colorFn ? colorFn(end, end / (nP - 1)) : color; this.P.push(cp.x, cp.y, cp.z); this.N.push(T.x * (end ? 1 : -1), T.y * (end ? 1 : -1), T.z * (end ? 1 : -1)); this.U.push(0.5, 0.5); if (c) this.C.push(c[0], c[1], c[2]); else this.C.push(1, 1, 1); this.n++;
      const ring = base + end * (sides + 1); for (let s = 0; s < sides; s++) { if (end) this.I.push(c0, ring + s, ring + s + 1); else this.I.push(c0, ring + s + 1, ring + s); }
    }
    return this;
  }
  tube(a, b, r, o = {}) { return this.path([a, b], r, o); }
  /** arbitrary triangle strip/quad: 4 corners CCW (a,b,c,d) with uv */
  quad(a, b, c, d, { color = null, uv = [[0, 0], [1, 0], [1, 1], [0, 1]] } = {}) {
    _t.subVectors(b, a); _n.subVectors(d, a); const nn = new THREE.Vector3().crossVectors(_t, _n).normalize(); if (color) this.hasColor = true;
    [a, b, c, d].forEach((p, k) => { this.P.push(p.x, p.y, p.z); this.N.push(nn.x, nn.y, nn.z); this.U.push(uv[k][0], uv[k][1]); this.C.push(...(color || [1, 1, 1])); });
    const bb = this.n; this.I.push(bb, bb + 1, bb + 2, bb, bb + 2, bb + 3); this.n += 4; return this;
  }
  geometry() {
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(this.P, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(this.N, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(this.U, 2));
    if (this.hasColor) g.setAttribute('color', new THREE.Float32BufferAttribute(this.C, 3)); g.setIndex(this.n > 65535 ? new THREE.Uint32BufferAttribute(this.I, 1) : new THREE.Uint16BufferAttribute(this.I, 1)); g.computeBoundingSphere(); g.computeBoundingBox(); return g;
  }
  mesh(mat, parent, { cast = true, receive = true } = {}) { if (!this.n) return null; const m = new THREE.Mesh(this.geometry(), mat); m.castShadow = cast; m.receiveShadow = receive; parent?.add(m); return m; }
}

export const lin = (hex) => { const c = new THREE.Color(hex); return [c.r, c.g, c.b]; };
export function tintVar(base, r, amt = 0.1, sat = 0.06) { const c = new THREE.Color(base); const hsl = {}; c.getHSL(hsl); c.setHSL(hsl.h + (r() - 0.5) * sat * 0.5, Math.min(1, Math.max(0, hsl.s + (r() - 0.5) * sat)), Math.min(1, Math.max(0, hsl.l + (r() - 0.5) * amt))); return [c.r, c.g, c.b]; }

const smoothstep01 = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
/** Heap (cone-ish, noisy). Returns {mesh, heightAt(x,z)} in WORLD coords; base y0. */
export function heap({ x, z, rx = 2, rz = 1.6, h = 1.2, y0 = 0, seed = 1, rot = 0, mat, parent, rough = 0.05, gullies = 0.07, rings = 70, seg = 150, tile = 2, p = 1.25, flat = 0, scoop = null, lump = 0.22 }) {
  const nz = makeNoise(seed), nz2 = makeNoise(seed + 77), pos = [], idx = [], uv = [];
  const cs = Math.cos(rot), sn = Math.sin(rot);
  const outline = (a) => 1 + 0.16 * (nz(Math.cos(a) * 1.4 + 5, Math.sin(a) * 1.4 + 5) - 0.5) * 2 + 0.07 * (nz(Math.cos(a) * 4 + 9, Math.sin(a) * 4 + 9) - 0.5) * 2;
  const hf = (rr, a, wx, wz) => { // rr normalised radius 0..1+
    const base = Math.max(0, 1 - rr), shape = Math.pow(base, p) * (1 + 0.25 * Math.pow(1 - rr, 3));
    let y = h * shape * (1 + lump * (fbm(nz2, wx * 0.9 + 17, wz * 0.9 + 3, 3) - 0.5) * 2 * Math.min(1, base * 2.5)); const t = Math.min(1, base * 4);
    if (scoop) { let da = Math.abs(a - scoop.a); da = Math.min(da, Math.PI * 2 - da); const k = Math.exp(-((da / (scoop.w ?? 0.55)) ** 2)) * smoothstep01(0.08, 0.35, rr) * (1 - smoothstep01(0.6, 0.95, rr)); y -= k * h * (scoop.depth ?? 0.4) * (0.7 + 0.3 * Math.sin(rr * 18)); }
    y += rough * h * (fbm(nz, wx * 3.2, wz * 3.2, 4) - 0.5) * 2 * t; y += gullies * h * (nz2(Math.cos(a) * 3.5 + 3, Math.sin(a) * 3.5 + 3) - 0.5) * 2 * Math.sin(Math.min(1, rr) * Math.PI) * 1.4 * (rr < 1 ? 1 : 0);
    if (flat) y = Math.min(y, h * (1 - flat)) + (y > h * (1 - flat) ? (y - h * (1 - flat)) * 0.25 : 0); return Math.max(0, y);
  };
  pos.push(0, hf(0, 0, 0, 0) + y0, 0); uv.push(0, 0);
  for (let k = 1; k <= rings; k++) for (let j = 0; j < seg; j++) {
    const a = (j / seg) * Math.PI * 2, t = k / rings, R = outline(a), rr = t * 1.0, lx = Math.cos(a) * rx * R * t, lz = Math.sin(a) * rz * R * t;
    const wx = x + lx * cs - lz * sn, wz = z + lx * sn + lz * cs, y = hf(rr, a, wx, wz) - (k === rings ? 0.03 : 0);
    pos.push(wx - x, y + y0, wz - z); uv.push(wx / tile, wz / tile);
  }
  for (let j = 0; j < seg; j++) idx.push(0, 1 + ((j + 1) % seg), 1 + j);
  for (let k = 1; k < rings; k++) for (let j = 0; j < seg; j++) { const a = 1 + (k - 1) * seg + j, b = 1 + (k - 1) * seg + ((j + 1) % seg), c = 1 + k * seg + j, d = 1 + k * seg + ((j + 1) % seg); idx.push(a, b, c, b, d, c); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals();
  const m = new THREE.Mesh(g, mat); m.position.set(x, 0, z); m.castShadow = true; m.receiveShadow = true; parent?.add(m);
  const heightAt = (wx, wz) => { const dx = wx - x, dz = wz - z, lx = dx * cs + dz * sn, lz = -dx * sn + dz * cs, a = Math.atan2(lz / rz, lx / rx), rr = Math.hypot(lx / rx, lz / rz) / outline(a); return rr >= 1 ? y0 : hf(rr, a, wx, wz) + y0; };
  return { mesh: m, heightAt, outline, x, z, rx, rz, rot };
}

/** Scatter instanced stones on a heap. */
export function stonesOnHeap(hp, { count = 4000, size = [0.02, 0.045], mat, parent, seed = 3, colors = [0x8c867a, 0xa39a88, 0x6e6a62, 0xb4aa94, 0x7a7266], maxR = 0.96 }) {
  const r = rng(seed), geo = new THREE.IcosahedronGeometry(1, 0), p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) { const k = 0.72 + ((Math.sin(i * 12.9 + 4.1) * 43758.5453) % 1 + 1) % 1 * 0.5; p.setXYZ(i, p.getX(i) * k, p.getY(i) * k * 0.78, p.getZ(i) * (0.9 + 0.2 * (((Math.sin(i * 7.7) * 91.3) % 1 + 1) % 1))); } geo.computeVertexNormals();
  const im = new THREE.InstancedMesh(geo, mat, count), d = new THREE.Object3D(), c = new THREE.Color(); let n = 0;
  for (let i = 0; i < count; i++) {
    const a = r() * 6.283, rr = Math.sqrt(r()) * maxR, lx = Math.cos(a) * hp.rx * rr * hp.outline(a), lz = Math.sin(a) * hp.rz * rr * hp.outline(a), cs = Math.cos(hp.rot), sn = Math.sin(hp.rot);
    const wx = hp.x + lx * cs - lz * sn, wz = hp.z + lx * sn + lz * cs, y = hp.heightAt(wx, wz), s = size[0] + r() * (size[1] - size[0]);
    d.position.set(wx, y - s * 0.15, wz); d.rotation.set(r() * 6.28, r() * 6.28, r() * 6.28); d.scale.set(s * (0.8 + r() * 0.5), s * (0.8 + r() * 0.5), s * (0.8 + r() * 0.5)); d.updateMatrix(); im.setMatrixAt(n, d.matrix);
    c.set(colors[Math.floor(r() * colors.length)]).multiplyScalar(0.8 + r() * 0.45); im.setColorAt(n, c); n++;
  }
  im.castShadow = true; im.receiveShadow = true; parent?.add(im); return im;
}

/** Displaced ground plane (noise relief, optional ruts) — world UV. heightFn(x,z) optional extra. */
export function terrain({ x0, z0, x1, z1, y = 0, mat, parent, res = 1.0, amp = 0.06, seed = 5, tile = 10, heightFn = null, scale = 0.35, colorFn = null }) {
  const nx = Math.max(2, Math.round((x1 - x0) / res)), nzz = Math.max(2, Math.round((z1 - z0) / res)), g = new THREE.PlaneGeometry(x1 - x0, z1 - z0, nx, nzz); g.rotateX(-Math.PI / 2); g.translate((x0 + x1) / 2, y, (z0 + z1) / 2);
  const n = makeNoise(seed), p = g.attributes.position;
  for (let i = 0; i < p.count; i++) { const wx = p.getX(i), wz = p.getZ(i); let h = (fbm(n, wx * scale, wz * scale, 4) - 0.5) * 2 * amp; if (heightFn) h += heightFn(wx, wz); p.setY(i, y + h); }
  g.computeVertexNormals(); worldUV(g, tile);
  if (colorFn) { const col = new Float32Array(p.count * 3); for (let i = 0; i < p.count; i++) { const c = colorFn(p.getX(i), p.getZ(i), p.getY(i)); col[i * 3] = c[0]; col[i * 3 + 1] = c[1]; col[i * 3 + 2] = c[2]; } g.setAttribute('color', new THREE.BufferAttribute(col, 3)); mat.vertexColors = true; mat.needsUpdate = true; }
  const m = new THREE.Mesh(g, mat); m.receiveShadow = true; parent?.add(m); return m;
}
export { rng };
