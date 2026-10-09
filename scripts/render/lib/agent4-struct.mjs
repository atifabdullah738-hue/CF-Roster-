// agent4: structural builders — real running/English-bond brick walls, RCC members, rebar, shuttering, scaffolding.
import * as THREE from 'three';
import { Mesher, tintVar, lin, rng } from './agent4-geo.mjs';
import * as M from './agent4-mat.mjs';
import { boxAt } from './arch.mjs';
export { THREE };

export const BRICK = { L: 0.229, H: 0.0755, W: 0.114, J: 0.0105, CH: 0.086 };

/**
 * Brick wall in LOCAL space: runs along +x (0..len), up +y (0..hgt); front face on z=0, back face on z=-t.
 * Real bricks (merged geometry) with per-brick tint, jitter, mortar core. Returns THREE.Group; position/rotate it.
 *  opts: len,hgt,t(0.23|0.115|0.345), bond('english'|'stretcher'), back(bool: also brick the back face), openings[{u0,u1,v0,v1}],
 *  ranges(j,nCourses)->[[a,b],...] (racking / partial heights), seed, palette({base,dark,light}), topBed, clay/mortar materials.
 */
export function brickWall({ len, hgt, t = 0.23, bond = 'english', back = false, openings = [], ranges = null, seed = 1, palette = {}, topBed = true, mortarMat, clayMat, parent, startHalf = false, skew = 1 }) {
  const r = rng(seed), g = new THREE.Group(), B = new Mesher(), Mo = new Mesher(), { L, H, W, J, CH } = BRICK;
  const base = palette.base ?? 0x9b5640, dark = palette.dark ?? 0x6c4338, light = palette.light ?? 0xb97a58, pDark = palette.pDark ?? 0.06, pLight = palette.pLight ?? 0.12;
  const nC = Math.floor((hgt + J) / CH), colorOf = () => { const k = r(); return k < pDark ? tintVar(dark, r, 0.08, 0.1) : k < pDark + pLight ? tintVar(light, r, 0.08, 0.08) : tintVar(base, r, 0.1, 0.08); };
  const sub = (a, b, v0, v1) => { // subtract openings
    let pieces = [[a, b]];
    for (const o of openings) { if (v1 <= o.v0 || v0 >= o.v1) continue; const next = []; for (const [x, y] of pieces) { if (y <= o.u0 || x >= o.u1) { next.push([x, y]); continue; } if (o.u0 - x > 0.045) next.push([x, o.u0 - 0.004]); if (y - o.u1 > 0.045) next.push([o.u1 + 0.004, y]); } pieces = next; }
    return pieces;
  };
  const courses = [];
  for (let j = 0; j < nC; j++) {
    const v0 = j * CH, rg = ranges ? ranges(j, nC) : [[0, len]], header = bond === 'english' && j % 2 === 1;
    const items = [];
    for (const [ra, rb] of rg) {
      let u = ra; const first = [];
      if (header) first.push(0.057); else if (bond === 'stretcher' && (j + (startHalf ? 1 : 0)) % 2 === 1) first.push(0.1145);
      let k = 0;
      while (u < rb - 0.03) { const w = k < first.length ? first[k] : (header ? W : L); k++; const b = Math.min(rb, u + w); if (b - u < 0.035) break; for (const p of sub(u, b, v0, v0 + H)) items.push({ a: p[0], b: p[1], hd: header }); u = b + J; }
    }
    courses.push({ v0, items, rg });
  }
  const inRanges = (j, u) => { if (j >= nC) return false; return courses[j].rg.some(([a, b]) => u >= a - 0.01 && u <= b + 0.01) && !openings.some((o) => u > o.u0 - 0.01 && u < o.u1 + 0.01 && (j * CH) < o.v1 && (j * CH + H) > o.v0); };
  const q = new THREE.Quaternion(), e = new THREE.Euler();
  const addBrick = (a, b, v0, z0, depth, hd, flip) => {
    const w = b - a, cx = (a + b) / 2 + (r() - 0.5) * 0.003, cy = v0 + H / 2 + (r() - 0.5) * 0.0024, zj = (r() - 0.35) * 0.0065 * skew, col = colorOf();
    e.set(0, (r() - 0.5) * 0.012 * skew, (r() - 0.5) * 0.010 * skew, 'YXZ'); q.setFromEuler(e);
    const cz = flip ? -t + zj * -1 + depth / 2 : zj - depth / 2;
    B.box(cx, cy, cz, w - 0.001, H - (r() * 0.002), depth, { q: q.clone(), tile: 0.34, uv: [r(), r()], color: col, skip: [] });
  };
  for (let j = 0; j < nC; j++) {
    const c = courses[j], v0 = c.v0, hd = c.items[0]?.hd;
    for (const it of c.items) {
      const dF = hd ? Math.min(L, t) : Math.min(W, t);
      addBrick(it.a, it.b, v0, 0, dF, hd, false);
      if (back && !(hd && t <= L + 0.01)) { const off = bond === 'english' ? 0 : 0; void off; addBrick(it.a, it.b, v0, 0, Math.min(W, t), hd, true); }
    }
    // mortar runs
    const items = c.items.slice().sort((a, b) => a.a - b.a); let run = null; const runs = [];
    for (const it of items) { if (run && it.a - run[1] < 0.02) run[1] = it.b; else { run = [it.a, it.b]; runs.push(run); } }
    for (const [a, b] of runs) {
      const mid = (a + b) / 2, covered = inRanges(j + 1, mid) || inRanges(j + 1, a + 0.05) || inRanges(j + 1, b - 0.05);
      const top = covered ? v0 + CH : v0 + H + (topBed ? 0.0045 : -0.0005), bot = v0 - (j === 0 ? 0 : J * 0.5);
      Mo.box((a + b) / 2, (top + bot) / 2, -t / 2, b - a - 0.004, top - bot, t - 0.014, { tile: 0.7, uv: [r(), r()] });
    }
  }
  B.mesh(clayMat || M.clay(), g); Mo.mesh(mortarMat || M.mortar(), g);
  g.userData = { len, hgt, nC, bricks: B.n / 24 };
  parent?.add(g); return g;
}
/** helper: racked (toothed) end — returns ranges fn for brickWall. side: 'left'|'right'|'both' ; maxC = number of courses at full length. */
export function racked({ len, from = 'right', step = 0.12, maxC = 20, a0 = 0, topC = null }) {
  return (j, nC) => { const lim = topC ?? nC; if (j >= lim) return []; const d = Math.max(0, (j - (maxC - 1)) * -1) * 0; void d; const back = Math.max(0, (lim - 1 - j)) * step; return from === 'right' ? [[a0, Math.max(a0 + 0.3, len - back)]] : from === 'left' ? [[Math.min(len - 0.3, a0 + back), len]] : [[a0 + back * 0.5, len - back * 0.5]]; };
}
/** helper: place a local-space object (group) at world pos with yaw (radians). */
export function place(obj, x, y, z, ry = 0, parent) { obj.position.set(x, y, z); obj.rotation.y = ry; parent?.add(obj); return obj; }

// ------------------------------------------------------------------------------------------------ RCC pieces
export function rcBox(x0, y0, z0, x1, y1, z1, mat, parent) { return boxAt(x0, y0, z0, x1, y1, z1, mat, parent); }
/** column with kicker (small) + construction-joint lip. Returns mesh group */
export function column({ x, z, w = 0.23, d = 0.35, y0 = 0, y1, mat, parent, rot = 0 }) {
  const g = new THREE.Group();
  boxAt(-w / 2, y0, -d / 2, w / 2, y1, d / 2, mat, g);
  g.position.set(x, 0, z); g.rotation.y = rot; parent?.add(g); return g;
}

// ------------------------------------------------------------------------------------------------ REBAR
const RC = { fresh: lin(0x3b3e42), rustL: lin(0x9a5a30), rustD: lin(0x6d3d25), dust: lin(0x8b7660), orange: lin(0xb4693a) };
const mixc = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
export class Rebar {
  constructor(seed = 1, rust = 0.6) { this.m = new Mesher(); this.ties = new Mesher(); this.r = rng(seed); this.rust = rust; }
  color(rustAmt = this.rust) { const r = this.r, k = Math.min(1, Math.max(0, rustAmt + (r() - 0.5) * 0.5)); let c = mixc(RC.fresh, r() < 0.5 ? RC.rustD : RC.rustL, smoothS(k)); if (r() < 0.25) c = mixc(c, RC.orange, 0.5); return mixc(c, RC.dust, 0.15 * r()); }
  bar(a, b, dia = 0.016, rust) { const c = this.color(rust); this.m.path([a, b], dia / 2, { sides: 6, color: c, tileV: 0.12, uOff: this.r() }); }
  poly(pts, dia, { closed = false, sides = 6, rust } = {}) { this.m.path(pts, dia / 2, { sides, closed, color: this.color(rust), tileV: 0.12 }); }
  /** closed rectangular stirrup in plane at height y (axis y), centred cx,cz with outer size w x d */
  stirrup(cx, y, cz, w, d, dia = 0.008, rust, rot = 0) {
    const rc = 0.02, pts = [], pr = (x, z) => { const c = Math.cos(rot), s = Math.sin(rot); return [cx + x * c - z * s, y, cz + x * s + z * c]; };
    const hw = w / 2, hd = d / 2, corner = (sx, sz) => { const px = sx * (hw - rc), pz = sz * (hd - rc); const ang0 = sx > 0 ? (sz > 0 ? 0 : -Math.PI / 2) : (sz > 0 ? Math.PI / 2 : Math.PI); for (let k = 0; k <= 3; k++) { const a = ang0 + (k / 3) * (Math.PI / 2); pts.push(pr(px + Math.cos(a) * rc, pz + Math.sin(a) * rc)); } };
    // order: (+,+) -> (-,+) -> (-,-) -> (+,-)
    const seq = [[1, 1], [-1, 1], [-1, -1], [1, -1]]; for (const [sx, sz] of seq) { const ang0 = (sx > 0 && sz > 0) ? 0 : (sx < 0 && sz > 0) ? Math.PI / 2 : (sx < 0 && sz < 0) ? Math.PI : -Math.PI / 2; const px = sx * (hw - rc), pz = sz * (hd - rc); for (let k = 0; k <= 3; k++) { const a = ang0 + (k / 3) * (Math.PI / 2); pts.push(pr(px + Math.cos(a) * rc, pz + Math.sin(a) * rc)); } }
    void corner; this.m.path(pts, dia / 2, { sides: 5, closed: true, color: this.color(rust), tileV: 0.1 });
  }
  /** column cage: vertical bars from y0..y1 (+ext), stirrups pitch. nx x nz bars on perimeter. */
  column({ x, z, w = 0.23, d = 0.35, y0, y1, ext = 0, nx = 2, nz = 3, dia = 0.016, sd = 0.008, pitch = 0.15, cover = 0.035, rust, bend = 0, rot = 0 }) {
    const hw = w / 2 - cover, hd = d / 2 - cover, c = Math.cos(rot), s = Math.sin(rot), P = (px, pz) => [x + px * c - pz * s, x === 0 ? 0 : 0, z + px * s + pz * c];
    const bars = []; for (let i = 0; i < nx; i++) for (let j = 0; j < nz; j++) { if (i > 0 && i < nx - 1 && j > 0 && j < nz - 1) continue; bars.push([-hw + (2 * hw * i) / Math.max(1, nx - 1), -hd + (2 * hd * j) / Math.max(1, nz - 1)]); }
    for (const [px, pz] of bars) { const q = P(px, pz), top = y1 + ext * (0.85 + this.r() * 0.3); if (bend && this.r() < 0.5) { const dx = (this.r() - 0.5) * bend, dz = (this.r() - 0.5) * bend; this.poly([[q[0], y0, q[2]], [q[0], y1 + ext * 0.5, q[2]], [q[0] + dx * 0.5, y1 + ext * 0.75, q[2] + dz * 0.5], [q[0] + dx, top, q[2] + dz]], dia, { rust }); } else this.bar([q[0], y0, q[2]], [q[0], top, q[2]], dia, rust); }
    for (let y = y0 + 0.05; y <= y1 + ext * 0.5 + 0.01; y += pitch * (y > y1 - 0.4 && y < y1 + 0.3 ? 0.8 : 1) * (0.93 + this.r() * 0.14)) this.stirrup(x, y, z, w - cover * 1.4, d - cover * 1.4, sd, rust, rot);
  }
  /** Two-way mat at height y covering x0..x1 / z0..z1; holes [[x0,z0,x1,z1]] left open. */
  mat({ x0, z0, x1, z1, y, pitchX = 0.15, pitchZ = 0.15, dia = 0.012, dia2 = null, holes = [], rust, tieEvery = 2, lap = 0 }) {
    dia2 = dia2 ?? dia; const inHole = (x, z) => holes.some((h) => x > h[0] && x < h[2] && z > h[1] && z < h[3]);
    const nz = Math.round((z1 - z0) / pitchZ), nx = Math.round((x1 - x0) / pitchX);
    for (let j = 0; j <= nz; j++) { const z = z0 + (j * (z1 - z0)) / nz + (this.r() - 0.5) * 0.006; let s = null; const nsegs = 24; for (let k = 0; k <= nsegs; k++) { const x = x0 + ((x1 - x0) * k) / nsegs, ok = !inHole(x, z); if (ok && s === null) s = x; if ((!ok || k === nsegs) && s !== null) { this.bar([s - lap * 0, y + dia / 2 + dia2 / 2 + 0.0005, z], [ok ? x : x - (x1 - x0) / nsegs, y + dia / 2 + dia2 / 2 + 0.0005, z], dia, rust); s = null; } } }
    for (let i = 0; i <= nx; i++) { const x = x0 + (i * (x1 - x0)) / nx + (this.r() - 0.5) * 0.006; let s = null; const nsegs = 24; for (let k = 0; k <= nsegs; k++) { const z = z0 + ((z1 - z0) * k) / nsegs, ok = !inHole(x, z); if (ok && s === null) s = z; if ((!ok || k === nsegs) && s !== null) { this.bar([x, y, s], [x, y, ok ? z : z - (z1 - z0) / nsegs], dia2, rust); s = null; } } }
    // binding wire at crossings
    for (let j = 0; j <= nz; j++) for (let i = 0; i <= nx; i++) { if ((i + j) % tieEvery) continue; const x = x0 + (i * (x1 - x0)) / nx, z = z0 + (j * (z1 - z0)) / nz; if (inHole(x, z)) continue; this.ties.box(x, y + dia / 2 + dia2 / 2 + dia * 0.4, z, 0.02, 0.012, 0.02, { color: lin(0x242424), ry: this.r() * 3 }); }
  }
  /** concrete cover blocks / chairs under a mat */
  chairs({ x0, z0, x1, z1, y, h = 0.04, pitch = 0.75, holes = [], mat }) {
    const m = new Mesher(); const nx = Math.round((x1 - x0) / pitch), nz = Math.round((z1 - z0) / pitch);
    for (let i = 0; i <= nx; i++) for (let j = 0; j <= nz; j++) { const x = x0 + ((x1 - x0) * i) / nx + (this.r() - 0.5) * 0.1, z = z0 + ((z1 - z0) * j) / nz + (this.r() - 0.5) * 0.1; if (holes.some((hh) => x > hh[0] && x < hh[2] && z > hh[1] && z < hh[3])) continue; m.box(x, y - h / 2, z, 0.05, h, 0.05, { tile: 0.5, uv: [this.r(), this.r()], ry: this.r() * 3 }); }
    return m;
  }
  mesh(parent) { const a = this.m.mesh(M.rebar(), parent), b = this.ties.mesh(M.solidMat(0xffffff, { roughness: 0.7, metalness: 0.4, vertexColors: true }), parent); return [a, b]; }
}
const smoothS = (t) => t * t * (3 - 2 * t);

/** A bundle of long bars (hex packing) on timber sleepers. */
export function barBundle({ x, y = 0, z, len = 12, dia = 0.016, rows = 4, ry = 0, rust = 0.5, seed = 3, parent, sleepers = 4, tilt = 0 }) {
  const rb = new Rebar(seed, rust), g = new THREE.Group(), n0 = rows; const ph = dia * 1.02;
  const h = (n0 - 1) * ph * 0.866 + 0.25; void h;
  // sleepers
  const sm = new Mesher(); for (let k = 0; k < sleepers; k++) { const sx = -len / 2 + 0.6 + (k * (len - 1.2)) / (sleepers - 1); sm.box(sx, 0.04, 0, 0.09, 0.08, ((n0 + 2) * ph) + 0.12, { tile: 2.5, uv: [rb.r(), rb.r()] }); }
  sm.mesh(M.timber({ color: 0x8a6e4a, seed: 9, weather: 1 }), g);
  for (let rr = 0; rr < n0; rr++) { const cnt = n0 * 1 + 1 - rr; for (let k = 0; k < cnt; k++) { const px = (k - (cnt - 1) / 2) * ph + (rb.r() - 0.5) * 0.002, py = 0.08 + dia / 2 + rr * ph * 0.866, ln = len * (0.985 + rb.r() * 0.015), sh = (rb.r() - 0.5) * 0.06; rb.bar([-ln / 2 + sh, py, px], [ln / 2 + sh, py, px], dia, rust); } }
  // tie wires
  for (const tx of [-len / 2 + 1.2, 0, len / 2 - 1.2]) { const pts = []; const hh = (n0 - 1) * ph * 0.866, rad = (n0 * ph) * 0.55; for (let a = 0; a <= 12; a++) { const th = (a / 12) * Math.PI * 2; pts.push([tx + 0.01 * Math.sin(th * 3), 0.08 + hh / 2 + dia / 2 + Math.sin(th) * (hh / 2 + dia * 0.9) , Math.cos(th) * (rad)]); } rb.ties.path(pts, 0.0022, { sides: 4, color: lin(0x303030), closed: true }); }
  rb.mesh(g); g.position.set(x, y, z); g.rotation.y = ry; parent?.add(g); return g;
}

// ------------------------------------------------------------------------------------------------ SHUTTERING
/** adjustable steel prop (acrow) — vertical from y0 to y1 at x,z. merged into meshers {outer,inner,black}. */
export function steelProp(ms, x, z, y0, y1, r) {
  const H = y1 - y0, lo = y0 + 0.01, mid = y0 + H * (0.38 + r() * 0.1), nutY = mid;
  ms.outer.tube([x, lo, z], [x, nutY + 0.05, z], 0.0305, { sides: 10, tileV: 0.5, color: lin(r() < 0.5 ? 0xb5471f : 0xa83e1c) });
  ms.inner.tube([x, nutY - 0.1, z], [x, y1 - 0.045, z], 0.0245, { sides: 10, tileV: 0.5, color: lin(0x9ea1a2) });
  ms.black.box(x, nutY + 0.0, z, 0.1, 0.07, 0.1, { ry: r() * 3, color: lin(0x2a2a28) });
  ms.black.tube([x - 0.065, nutY, z], [x + 0.065, nutY, z], 0.009, { sides: 5, color: lin(0x2a2a28) });
  ms.black.box(x, y0 + 0.006, z, 0.14, 0.012, 0.14, { color: lin(0x6a4a38) }); ms.black.box(x, y1 - 0.03, z, 0.1, 0.03, 0.1, { color: lin(0x6a4a38) });
  // U head
  ms.black.box(x, y1 - 0.022, z, 0.12, 0.012, 0.075, { color: lin(0x76563f) });
}
/** eucalyptus "balli" round pole prop */
export function balliProp(ms, x, z, y0, y1, r, rad = 0.05) {
  const lean = (r() - 0.5) * 0.05; ms.pole.path([[x, y0, z], [x + lean * 0.4, (y0 + y1) / 2, z + lean * 0.2], [x + lean, y1, z]], (i, t) => rad * (1.1 - t * 0.28), { sides: 8, tileV: 1.0, color: tintVar(0x8a7352, r, 0.1, 0.04), uOff: r() });
}

export function shutterMeshers() { return { outer: new Mesher(), inner: new Mesher(), black: new Mesher(), pole: new Mesher(), timber: new Mesher(), ply: new Mesher(), plyRaw: new Mesher(), steel: new Mesher() }; }
export function flushShutter(ms, parent) {
  ms.outer.mesh(M.solidMat(0xffffff, { roughness: 0.55, metalness: 0.5, vertexColors: true }), parent); ms.inner.mesh(M.solidMat(0xffffff, { roughness: 0.38, metalness: 0.9, vertexColors: true }), parent);
  ms.black.mesh(M.solidMat(0xffffff, { roughness: 0.65, metalness: 0.3, vertexColors: true }), parent); ms.pole.mesh(M.timber({ color: 0xffffff, seed: 31, weather: 1 }) && polesMat(), parent);
  ms.timber.mesh(M.timber({ color: 0xc9b088, seed: 8, weather: 0.8, splatter: 0.3 }), parent); ms.ply.mesh(M.plywood({ film: true }), parent); ms.plyRaw.mesh(M.plywood({ film: false, seed: 16 }), parent); ms.steel.mesh(M.steel(0x6f7374, { roughness: 0.5, rust: 0.4 }), parent);
}
const polesMat = () => M.memo('polesMat', () => { const m = M.bamboo().clone(); m.userData.tileM = 2; return m; });

/** Slab soffit shuttering deck: props -> bearers -> joists -> ply sheets. All y are world heights. */
export function slabDeck({ x0, z0, x1, z1, yTop, yGround = 0, ms, seed = 1, propPitch = 1.2, balli = 0.25, holes = [] }) {
  const r = rng(seed), sheetW = 1.22, sheetL = 2.44, plyT = 0.018, joistH = 0.075, bearH = 0.1;
  const yBear0 = yTop - plyT - joistH - bearH, yJ0 = yTop - plyT - joistH, yPly0 = yTop - plyT;
  const inHole = (x, z) => holes.some((h) => x > h[0] - 0.05 && x < h[2] + 0.05 && z > h[1] - 0.05 && z < h[3] + 0.05);
  // ply sheets, staggered
  let row = 0; for (let z = z0; z < z1 - 0.01; z += sheetW, row++) { let x = x0 - (row % 2) * 0.9; while (x < x1 - 0.01) { const a = Math.max(x, x0), b = Math.min(x + sheetL, x1), zb = Math.min(z + sheetW, z1); if (b - a > 0.02 && !holes.some((h) => a >= h[0] - 0.01 && b <= h[2] + 0.01 && z >= h[1] - 0.01 && zb <= h[3] + 0.01)) { const raw = r() < 0.18; (raw ? ms.plyRaw : ms.ply).box((a + b) / 2, yPly0 + plyT / 2 + (r() - 0.5) * 0.0015, (z + zb) / 2, b - a - 0.004, plyT, zb - z - 0.004, { tile: [sheetL, sheetW], uv: [0, 0], ry: (r() - 0.5) * 0.004 }); } x += sheetL; } }
  // joists along z at 0.4 m, bearers along x at propPitch
  for (let x = x0 + 0.1; x < x1; x += 0.4) ms.timber.box(x, yJ0 + joistH / 2, (z0 + z1) / 2, 0.05, joistH, z1 - z0 - 0.03, { tile: 2.5, uv: [r(), r()], ry: (r() - 0.5) * 0.003 });
  const nB = Math.max(2, Math.round((z1 - z0) / propPitch) + 1);
  for (let k = 0; k < nB; k++) { const z = z0 + 0.15 + (k * (z1 - z0 - 0.3)) / (nB - 1); ms.timber.box((x0 + x1) / 2, yBear0 + bearH / 2, z, x1 - x0 - 0.04, bearH, 0.1, { tile: 2.5, uv: [r(), r()] });
    const nP = Math.max(2, Math.round((x1 - x0) / propPitch) + 1);
    for (let i = 0; i < nP; i++) { const x = x0 + 0.2 + (i * (x1 - x0 - 0.4)) / (nP - 1) + (r() - 0.5) * 0.03; if (inHole(x, z)) continue; if (r() < balli) balliProp(ms, x, z, yGround, yBear0, r); else steelProp(ms, x, z, yGround, yBear0, r); }
  }
  // diagonal braces (1x4 planks)
  for (let k = 0; k < 4; k++) { const z = z0 + 0.2 + r() * (z1 - z0 - 0.4), xa = x0 + 0.3 + r() * (x1 - x0 - 2.6), xb = xa + 1.2; const a = new THREE.Vector3(xa, yGround + 0.4, z + 0.07), b = new THREE.Vector3(xb, yBear0 - 0.2, z + 0.07), d = new THREE.Vector3().subVectors(b, a), qq = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(1, 0, 0), d.clone().normalize()); ms.timber.box((a.x + b.x) / 2, (a.y + b.y) / 2, z + 0.07, d.length(), 0.09, 0.022, { q: qq, tile: 2.5, uv: [r(), r()] }); }
}

/** column box shutter (ply + wales) between y0..y1 */
export function columnForm({ x, z, w = 0.23, d = 0.35, y0, y1, ms, seed = 1, rot = 0 }) {
  const r = rng(seed), t = 0.018, q = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, rot, 0)), L = (px, pz) => new THREE.Vector3(px, 0, pz).applyQuaternion(q);
  const hw = w / 2 + t / 2, hd = d / 2 + t / 2, hgt = y1 - y0;
  const sides = [[0, hd, w + 2 * t, t], [0, -hd, w + 2 * t, t], [hw, 0, t, d], [-hw, 0, t, d]];
  for (const [px, pz, sx, sz] of sides) { const p = L(px, pz); ms.ply.box(x + p.x, (y0 + y1) / 2, z + p.z, sx, hgt, sz, { q, tile: [Math.max(sx, sz), hgt], uv: [0, 0] }); }
  for (let y = y0 + 0.25; y < y1 - 0.1; y += 0.55) { const wl = 0.05; const ww = w + 2 * t + 2 * wl, dd = d + 2 * t + 2 * wl;
    for (const [px, pz, sx, sz] of [[0, dd / 2 - wl / 2, ww, wl], [0, -dd / 2 + wl / 2, ww, wl], [ww / 2 - wl / 2, 0, wl, dd], [-ww / 2 + wl / 2, 0, wl, dd]]) { const p = L(px, pz); ms.timber.box(x + p.x, y, z + p.z, sx, 0.075, sz, { q, tile: 2.5, uv: [r(), r()] }); } }
}

// ------------------------------------------------------------------------------------------------ SCAFFOLDING
export function scaffoldMeshers() { return { tube: new Mesher(), clamp: new Mesher(), board: new Mesher(), boardB: new Mesher(), rope: new Mesher(), bamboo: new Mesher(), net: new Mesher() }; }
export function flushScaffold(sm, parent) {
  const galv = M.memo('galvTube', () => M.solidMat(0xffffff, { roughness: 0.42, metalness: 0.9, vertexColors: true }));
  sm.tube.mesh(galv, parent); sm.clamp.mesh(M.solidMat(0xffffff, { roughness: 0.5, metalness: 0.85, vertexColors: true }), parent);
  sm.board.mesh(M.timber({ color: 0xcdb48c, seed: 17, weather: 1, splatter: 0.6, knots: 7 }), parent); sm.boardB.mesh(M.timber({ color: 0xa88e68, seed: 19, weather: 1, splatter: 0.9, knots: 5 }), parent);
  sm.rope.mesh(M.rope(0x6e5f45), parent); sm.bamboo.mesh(M.bamboo(), parent);
  if (sm.net.n) sm.net.mesh(netMat(), parent, { cast: false });
}
const netMat = () => M.memo('netMat', () => { const m = new THREE.MeshStandardMaterial({ color: 0x3f6a45, roughness: 1, transparent: true, opacity: 0.38, side: THREE.DoubleSide, depthWrite: false }); m.userData.tileM = 1; return m; });

const GALV = [lin(0x9ea2a4), lin(0xa9acad), lin(0x8d9193), lin(0x7c6b58)];
/** Tubular steel scaffold along +x at z (outer row) with `depth` towards -z. Boards at given lifts. */
export function steelScaffold({ x0, x1, z, depth = 1.2, height = 7, lift = 2.0, bay = 2.2, boards = [], sm, seed = 1, y0 = 0, braces = true, ladderBay = 0, tiesToWall = 0, toe = true, wallZ = null }) {
  const r = rng(seed), rad = 0.024, nBays = Math.max(1, Math.round((x1 - x0) / bay)), bw = (x1 - x0) / nBays, nL = Math.floor(height / lift) + 1;
  const tc = () => (r() < 0.12 ? GALV[3] : GALV[Math.floor(r() * 3)]), cl = lin(0x555a5c);
  const t = (a, b) => sm.tube.tube(a, b, rad, { sides: 8, tileV: 1, color: tc() });
  const cp = (x, y, zz) => sm.clamp.box(x, y, zz, 0.07, 0.07, 0.07, { color: cl, ry: r() * 3 });
  for (let i = 0; i <= nBays; i++) for (const zz of [z, z - depth]) { const x = x0 + i * bw, top = y0 + (nL - 1) * lift + 1.1 + (r() * 0.05); t([x, y0, zz], [x, top, zz]); sm.clamp.box(x, y0 + 0.01, zz, 0.15, 0.012, 0.15, { color: lin(0x5a5d5f) }); sm.board.box(x, y0 - 0.025, zz, 0.3, 0.05, 0.25, { tile: 2.5, uv: [r(), r()] }); }
  for (let l = 0; l < nL; l++) {
    const y = y0 + 0.2 + l * lift + (l ? 0 : 0.0);
    for (const zz of [z, z - depth]) { t([x0 - 0.1, y, zz], [x1 + 0.1, y, zz]); }
    for (let i = 0; i <= nBays; i++) { const x = x0 + i * bw; t([x, y + 0.075, z + 0.05], [x, y + 0.075, z - depth - 0.05]); for (const zz of [z, z - depth]) cp(x, y + 0.04, zz); }
    if (l > 0 || true) for (const yy of [y + 0.5, y + 1.0]) if (l < nL - 1 || boards.includes(l)) { if (boards.includes(l)) for (const zz of [z + 0.02]) t([x0 - 0.1, yy + 0.0, zz], [x1 + 0.1, yy, zz]); }
    if (boards.includes(l)) {
      const yb = y + 0.115, np = Math.round(depth / 0.235);
      for (let i = 0; i < nBays; i++) for (let k = 0; k < np; k++) { const zz = z + 0.03 - 0.11 - k * 0.235; const len = bw - 0.01 - r() * 0.02; (r() < 0.4 ? sm.boardB : sm.board).box(x0 + i * bw + bw / 2 + (r() - 0.5) * 0.02, yb + (r() - 0.5) * 0.003, zz, len, 0.038, 0.225, { tile: 2.5, uv: [r(), r()], ry: (r() - 0.5) * 0.01 }); }
      if (toe) for (let i = 0; i < nBays; i++) sm.board.box(x0 + i * bw + bw / 2, yb + 0.12, z + 0.045, bw - 0.02, 0.15, 0.025, { tile: 2.5, uv: [r(), r()] });
    }
  }
  if (braces) for (let i = 0; i < nBays; i++) { if (r() < 0.55) { const a = [x0 + i * bw, y0 + 0.2, z + 0.03], b = [x0 + (i + 1) * bw, y0 + 0.2 + Math.min(height, lift * 2), z + 0.03]; t(a, b); cp(a[0], a[1], z); cp(b[0], b[1], z); } }
  for (let i = 0; i <= nBays; i += 2) if (wallZ !== null) { for (let l = 1; l < nL; l += 2) { t([x0 + i * bw, y0 + 0.2 + l * lift, z - depth], [x0 + i * bw, y0 + 0.2 + l * lift, wallZ + 0.02]); } }
  // ladder tower bay
  if (ladderBay !== null && ladderBay >= 0) { const lx = x0 + (ladderBay + 0.5) * bw; for (let l = 0; l < nL - 1; l++) { if (!boards.includes(l)) continue; const ya = y0 + 0.2 + l * lift + 0.12, yb2 = ya + lift; t([lx - 0.2, ya, z - depth * 0.3 + 0.1], [lx - 0.2, yb2 + 1.0, z - depth * 0.3 - 0.35]); t([lx + 0.2, ya, z - depth * 0.3 + 0.1], [lx + 0.2, yb2 + 1.0, z - depth * 0.3 - 0.35]); for (let s = 0.2; s < lift + 0.9; s += 0.28) { const f = s / (lift + 1.0), yy = ya + (yb2 + 1.0 - ya) * f, zz = z - depth * 0.3 + 0.1 - 0.45 * f; t([lx - 0.2, yy, zz], [lx + 0.2, yy, zz]); } } }
  return { nBays, bw, nL };
}

/** Bamboo pole with nodes, taper, slight bow, rope-friendly. a,b = Vector3|array */
export function bambooPole(m, a, b, r, rad = 0.036, color = null) {
  const A = Array.isArray(a) ? new THREE.Vector3(...a) : a, B = Array.isArray(b) ? new THREE.Vector3(...b) : b, d = new THREE.Vector3().subVectors(B, A), len = d.length(), dir = d.clone().normalize();
  const perp = new THREE.Vector3(1, 0, 0).cross(dir); if (perp.lengthSq() < 1e-3) perp.set(0, 0, 1).cross(dir); perp.normalize(); const bow = (r() - 0.5) * 0.04 * Math.min(1, len / 4), c0 = color || tintVar([0xb59d62, 0xa38b58, 0x8d7b52, 0xbfa874, 0x9a8a60][Math.floor(r() * 5)], r, 0.06, 0.05);
  const nodes = []; let s = 0.15 + r() * 0.2; while (s < len - 0.1) { nodes.push(s); s += 0.32 + r() * 0.18; }
  const pts = [], rads = [], cols = []; const step = 0.09;
  for (let u = 0; u <= len + 1e-6; u += step) { const mm = [u]; for (const nd of nodes) if (Math.abs(nd - u) < step * 0.55) mm.push(nd); const pushed = new Set(); void pushed; pts.push([u, 1, 0]); }
  const list = []; for (let u = 0; u <= len + 1e-6; u += step) list.push(u); for (const nd of nodes) { list.push(nd - 0.012, nd, nd + 0.012); } list.sort((x, y) => x - y);
  const P = [], R = [], C = [];
  for (const u of list) { const t = u / len, bw = Math.sin(t * Math.PI) * bow; let rr = rad * (1.0 - 0.3 * t); let dk = 1; for (const nd of nodes) { const dd = Math.abs(nd - u); if (dd < 0.014) { rr *= 1.0 + 0.1 * (1 - dd / 0.014); dk = 0.62 + 0.38 * (dd / 0.014); } } P.push(A.clone().addScaledVector(dir, u).addScaledVector(perp, bw)); R.push(rr); C.push([c0[0] * dk, c0[1] * dk, c0[2] * dk]); }
  void pts; void rads; void cols;
  m.path(P, (i) => R[i], { sides: 8, color: null, colorFn: (i) => C[i], tileV: 2, uOff: r() }); return len;
}
/** rope collar around a pole at point p, axis dir */
export function ropeLash(m, p, dir, r) { const a = new THREE.Vector3(...(Array.isArray(p) ? p : [p.x, p.y, p.z])), d = dir.clone().normalize(); m.tube(a.clone().addScaledVector(d, -0.05), a.clone().addScaledVector(d, 0.05), 0.044, { sides: 6, color: lin(r() < 0.5 ? 0x5e5238 : 0x7a6a48), tileV: 0.1 }); }

/** Bamboo scaffold along +x at z (outer face), `depth` towards -z. working levels at heights lv. */
export function bambooScaffold({ x0, x1, z, depth = 1.25, height = 6.5, bay = 1.7, levels = [2.1, 4.0, 5.9], sm, seed = 1, wallZ = null, net = false }) {
  const r = rng(seed), nBays = Math.max(1, Math.round((x1 - x0) / bay)), bw = (x1 - x0) / nBays, m = sm.bamboo, dirY = new THREE.Vector3(0, 1, 0), dirX = new THREE.Vector3(1, 0, 0), dirZ = new THREE.Vector3(0, 0, 1);
  for (let i = 0; i <= nBays; i++) for (const zz of [z, z - depth]) { const x = x0 + i * bw + (r() - 0.5) * 0.04, top = height + (r() - 0.5) * 0.5; bambooPole(m, [x, -0.1, zz + (r() - 0.5) * 0.03], [x + (r() - 0.5) * 0.06, top, zz], r, 0.04 + r() * 0.008); }
  const allLv = [0.5, ...levels.map((l) => l - 0.9), ...levels]; const yl = [...new Set([...levels.map((l) => l - 1.2), ...levels, height - 0.4].filter((v) => v > 0.2).map((v) => +v.toFixed(3)))];
  for (const y of yl) for (const zz of [z, z - depth]) { bambooPole(m, [x0 - 0.25, y + (r() - 0.5) * 0.04, zz], [x1 + 0.35, y + (r() - 0.5) * 0.04, zz], r, 0.032 + r() * 0.006); for (let i = 0; i <= nBays; i++) ropeLash(sm.rope, [x0 + i * bw, y, zz], dirY, r); }
  for (const y of yl) for (let i = 0; i <= nBays; i++) { const x = x0 + i * bw; bambooPole(m, [x, y + 0.045, z + 0.25], [x, y + 0.045, z - depth - 0.45], r, 0.03 + r() * 0.006); }
  // diagonals
  for (let i = 0; i < nBays; i++) if (r() < 0.6) { const ya = yl[0], yb = yl[Math.min(yl.length - 1, 2)]; bambooPole(m, [x0 + i * bw, ya, z + 0.045], [x0 + (i + 1) * bw, yb, z + 0.045], r, 0.03); ropeLash(sm.rope, [x0 + i * bw, ya, z + 0.045], dirX, r); }
  // platforms: planks across transoms
  for (const lv of levels) { const y = lv - 0.03, np = Math.round((depth + 0.5) / 0.235); for (let i = 0; i < nBays; i++) for (let k = 0; k < np; k++) { const zz = z + 0.2 - k * 0.235, len = bw + (r() < 0.5 ? 0.35 : -0.02); (r() < 0.5 ? sm.board : sm.boardB).box(x0 + i * bw + bw / 2 + (r() - 0.5) * 0.04, y + (r() - 0.5) * 0.004 + 0.045, zz, len, 0.035, 0.22, { tile: 2.5, uv: [r(), r()], ry: (r() - 0.5) * 0.015 }); }
    bambooPole(m, [x0 - 0.25, lv + 0.95, z + 0.06], [x1 + 0.35, lv + 0.95, z + 0.06], r, 0.03);
  }
  for (let i = 0; i <= nBays; i++) if (wallZ !== null) for (const y of yl.filter((_, k) => k % 2 === 0)) { bambooPole(m, [x0 + i * bw, y, z - depth], [x0 + i * bw, y, wallZ + 0.02], r, 0.03); }
  if (net) { const top = height; for (let i = 0; i < 1; i++) sm.net.quad(new THREE.Vector3(x0 - 0.3, 0, z + 0.33), new THREE.Vector3(x1 + 0.3, 0, z + 0.33), new THREE.Vector3(x1 + 0.3, top, z + 0.33), new THREE.Vector3(x0 - 0.3, top, z + 0.33)); }
}
