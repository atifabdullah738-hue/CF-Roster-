// progress-grey-structure: double-storey house at the grey-structure stage (RCC frame, half-done upper brickwork, scaffolding, material piles)
import { THREE, T, boxAt } from '../lib/arch.mjs';
import { archCamera } from '../lib/env.mjs';
import { tree, palm, bush } from '../lib/nature.mjs';
import * as M from '../lib/agent4-mat.mjs';
import * as G from '../lib/agent4-geo.mjs';
import * as S from '../lib/agent4-struct.mjs';
import * as L from '../lib/agent4-site.mjs';
import { hazeEnvironment } from '../lib/agent4-env.mjs';

export default async function build({ renderer, w, h }) {
  const scene = new THREE.Scene(); let _t = performance.now(); const lap = (n) => { window.__log.push(`  ${n}: ${Math.round(performance.now() - _t)}ms`); _t = performance.now(); };
  hazeEnvironment({ renderer, scene, sunElevation: 30, sunAzimuth: -52, sunIntensity: 6.6, envIntensity: 0.32, shadowExtent: 34, shadowCenter: [4, 0, -2], horizon: [1.0, 0.89, 0.74], zenith: [0.34, 0.52, 0.86], fogDensity: 0.0095, glow: 0.5, haze: 0.3 });
  lap('env');
  const r = G.rng(11);

  // ------------------------------------------------------------------ ground
  const soilM = () => { const m = M.soil().clone(); return M.detailize(m, { scale: 1.1, strength: 0.75, key: 'soilD' }); };
  const trackD = (x, z) => { const cx = 18 + (z - 28) * -0.28; return Math.min(Math.abs(x - (cx - 0.95)), Math.abs(x - (cx + 0.95))); };
  const ruts = (x, z) => (z > -2 && z < 38 ? Math.exp(-((trackD(x, z) / 0.28) ** 2)) : 0);
  const nzS = G.makeNoise(4);
  G.terrain({ x0: -34, z0: -30, x1: 46, z1: 40, y: 0, mat: soilM(), parent: scene, res: 0.32, amp: 0.045, seed: 7, tile: 10, scale: 0.4,
    heightFn: (x, z) => -0.06 * ruts(x, z) + 0.05 * Math.max(0, G.fbm(nzS, x * 0.12, z * 0.12, 3) - 0.55),
    colorFn: (x, z) => { const k = ruts(x, z), m = 1 - 0.16 * k, s = Math.exp(-(((x - 14.5) ** 2 + (z - 7.5) ** 2) / 18)) * 0.12; return [m * (1 + s), m * (1 + s * 0.95), m * (1 + s * 0.7)]; } });
  { const far = new THREE.Mesh(new THREE.PlaneGeometry(1600, 1600), soilM()); far.rotation.x = -Math.PI / 2; far.position.y = -0.06; far.receiveShadow = true; const p = far.geometry.attributes.position, uv = far.geometry.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, p.getX(i) / 10, -p.getY(i) / 10); scene.add(far); }

  lap('ground');
  // ------------------------------------------------------------------ materials
  const rccCol = M.detailize(M.rcc({ seed: 5, color: 0xa7a59e }).clone(), { scale: 1.6, strength: 0.45, dustH: 0.9, dustAmt: 0.5, key: 'rc1' });
  const rccBeam = M.detailize(M.rcc({ seed: 9, color: 0xa4a29b }).clone(), { scale: 1.4, strength: 0.45, dustH: 0, key: 'rc2' });
  const rccSlab = M.detailize(M.rcc({ seed: 13, color: 0x9d9b94, stain: 0.9 }).clone(), { scale: 1.3, strength: 0.5, key: 'rc3' });
  const plinthM = M.detailize(M.rcc({ seed: 17, color: 0xa09d95 }).clone(), { scale: 1.3, strength: 0.5, dustH: 0.5, key: 'rc4' });
  const clay = M.clay(); M.detailize(clay, { strength: 0.0, dustH: 0.75, dustColor: 0xa28b6e, dustAmt: 0.55, key: 'clayD' });
  const mortar = M.detailize(M.mortar(0x938e83, 3).clone(), { scale: 2.4, strength: 0.4, dustH: 0.6, key: 'mortD' });
  const timberM = M.timber({ color: 0x6d4f35, seed: 34, weather: 0.8 });

  lap('mats');
  // ------------------------------------------------------------------ structure
  const W = 10.4, D = 13.2, yP = 0.5, yb0 = 3.40, yt1 = 3.85, yb1 = 6.75, yt2 = 7.2, cs = 0.3;
  const GX = [0, 3.6, 7.0, 10.4], GZ = [0, -4.4, -8.8, -13.2];
  const House = new THREE.Group(); scene.add(House);
  // ground floor slab / hard-core inside
  boxAt(0, 0, -D, W, yP, 0, plinthM, House);
  // plinth brick course visible at edges (0..0.43) + plinth beam
  const plinthRuns = [['front', 0, W, 0], ['back', W, 0, -D], ['left', -D + 0, 0, 0], ['right', 0, -D, W]];
  void plinthRuns;
  boxAt(-0.0, 0.43, -D, W, yP, 0, plinthM, House);
  // columns
  const colRebar = new S.Rebar(21, 0.7);
  const colPos = []; for (const gx of GX) for (const gz of GZ) { const cx = Math.min(Math.max(gx, cs / 2), W - cs / 2), cz = Math.min(Math.max(gz, -D + cs / 2), -cs / 2); colPos.push([cx, cz]); }
  for (const [cx, cz] of colPos) {
    boxAt(cx - cs / 2, yP, cz - cs / 2, cx + cs / 2, yt1, cz + cs / 2, rccCol, House);
    boxAt(cx - cs / 2, yt1, cz - cs / 2, cx + cs / 2, yt2, cz + cs / 2, rccCol, House);
    boxAt(cx - cs / 2 - 0.012, yt2, cz - cs / 2 - 0.012, cx + cs / 2 + 0.012, yt2 + 0.18, cz + cs / 2 + 0.012, rccCol, House); // kicker (roof stub)
    colRebar.column({ x: cx, z: cz, w: cs, d: cs, y0: yt2 + 0.1, y1: yt2 + 0.4, ext: 1.15, nx: 2, nz: 3, dia: 0.016, pitch: 0.17, rust: 0.7, bend: 0.12 });
    boxAt(cx - cs / 2 - 0.03, yP - 0.0, cz - cs / 2 - 0.03, cx + cs / 2 + 0.03, yP + 0.0, cz + cs / 2 + 0.03, rccCol, House);
  }
  colRebar.mesh(House);
  // beams (both floors) and slabs
  const beam = (x0, z0, x1, z1, yb, yt, m = rccBeam) => boxAt(x0, yb, z0, x1, yt, z1, m, House);
  for (const [yb, yt] of [[yb0, yt1], [yb1, yt2]]) {
    for (const gz of GZ) { const z0 = gz === 0 ? -0.23 : gz === -D ? -D : gz - 0.115, z1 = gz === 0 ? 0 : gz === -D ? -D + 0.23 : gz + 0.115; beam(0, z0, W, z1, yb, yt - 0.0005); }
    for (const gx of GX) { const x0 = gx === 0 ? 0 : gx === W ? W - 0.23 : gx - 0.115, x1 = gx === 0 ? 0.23 : gx === W ? W : gx + 0.115; beam(x0, -D, x1, 0, yb, yt - 0.0005); }
    boxAt(0, yt - 0.127, -D, W, yt, 0, rccSlab, House);
  }
  // cantilever balcony slab (front-left) at first floor + edge upstand
  boxAt(0, yt1 - 0.15, 0, 3.6, yt1, 1.3, rccSlab, House); boxAt(-0.0, yt1 - 0.25, 1.15, 3.6, yt1 - 0.15, 1.3, rccSlab, House);
  boxAt(0, yt1 - 0.0, 1.17, 3.6, yt1 + 0.10, 1.3, rccBeam, House);
  // porch ceiling beam outline for balcony also on roof level front overhang (chajja)
  boxAt(0, yt2 - 0.1, 0, W, yt2, 0.55, rccSlab, House);
  boxAt(-0.02, yt2 - 0.18, 0.45, W + 0.02, yt2 - 0.1, 0.55, rccBeam, House);

  lap('structure');
  // ------------------------------------------------------------------ brickwork
  const bw = (side, a, b, y0, y1, opt = {}) => {
    const t = opt.t ?? 0.23, len = Math.abs(b - a), hgt = y1 - y0, ops = (opt.ops || []).map((o) => ({ u0: Math.abs(o.a - a), u1: Math.abs(o.b - a), v0: o.y0 - y0, v1: o.y1 - y0 })); const all = [];
    for (const o of opt.ops || []) { const u0 = Math.abs(Math.min(o.a, o.b) - a), u1 = Math.abs(Math.max(o.a, o.b) - a); const lo = Math.min(Math.abs(o.a - a), Math.abs(o.b - a)), hi = Math.max(Math.abs(o.a - a), Math.abs(o.b - a)); void u0; void u1; all.push({ u0: lo, u1: hi, v0: o.y0 - y0, v1: o.y1 - y0 }); if (o.lintel !== false) { all.push({ u0: lo - 0.15, u1: hi + 0.15, v0: o.y1 - y0, v1: o.y1 - y0 + 0.15 }); } if (o.sill !== false && o.y0 > y0 + 0.2) all.push({ u0: lo - 0.04, u1: hi + 0.04, v0: o.y0 - y0 - 0.075, v1: o.y0 - y0 }); }
    void ops;
    const g = S.brickWall({ len, hgt, t, bond: opt.bond ?? 'english', back: opt.back ?? false, openings: all, ranges: opt.ranges, seed: opt.seed ?? 1, clayMat: clay, mortarMat: mortar, startHalf: opt.half });
    if (side === 'front') S.place(g, a, y0, opt.face ?? 0, 0, House); else if (side === 'right') S.place(g, opt.face ?? W, y0, a, Math.PI / 2, House); else if (side === 'left') S.place(g, opt.face ?? 0, y0, a, -Math.PI / 2, House); else S.place(g, a, y0, opt.face ?? -D, Math.PI, House);
    // lintels / sills (concrete) in world space
    for (const o of opt.ops || []) {
      const lo = Math.min(o.a, o.b), hi = Math.max(o.a, o.b), f = opt.face ?? (side === 'front' ? 0 : side === 'back' ? -D : side === 'right' ? W : 0), sgn = side === 'front' || side === 'right' ? 1 : -1;
      const box = (x0, y0b, x1, y1b, m) => { if (side === 'front' || side === 'back') return boxAt(x0, y0b, sgn > 0 ? f - t : f, x1, y1b, sgn > 0 ? f : f + t, m, House); return boxAt(sgn > 0 ? f - t : f, y0b, x0, sgn > 0 ? f : f + t, y1b, x1, m, House); };
      if (o.lintel !== false) box(lo - 0.15, o.y1, hi + 0.15, o.y1 + 0.15, rccBeam);
      if (o.sill !== false && o.y0 > y0 + 0.2) { const proj = 0.04; if (side === 'front' || side === 'back') boxAt(lo - 0.05, o.y0 - 0.075, sgn > 0 ? f - t : f - proj, hi + 0.05, o.y0, sgn > 0 ? f + proj : f + t, rccBeam, House); else boxAt(sgn > 0 ? f - t : f - proj, o.y0 - 0.075, lo - 0.05, sgn > 0 ? f + proj : f + t, o.y0, hi + 0.05, rccBeam, House); }
    }
    return g;
  };
  const gfTop = yb0 - 0.01, ufTop = yb1 - 0.01;
  // ground floor — front
  bw('front', 3.75, 6.85, yP, gfTop, { seed: 1, ops: [{ a: 4.6, b: 6.0, y0: yP + 0.95, y1: yP + 2.15 }] });
  bw('front', 7.15, 10.4, yP, gfTop, { seed: 2, ops: [{ a: 7.45, b: 8.55, y0: yP, y1: yP + 2.1 }, { a: 9.1, b: 10.0, y0: yP + 0.95, y1: yP + 2.15 }] });
  // right side wall
  bw('right', -0.15, -4.25, yP, gfTop, { seed: 3, ops: [{ a: -1.2, b: -2.6, y0: yP + 0.95, y1: yP + 2.15 }] });
  bw('right', -4.55, -8.65, yP, gfTop, { seed: 4, ops: [{ a: -5.4, b: -6.8, y0: yP + 0.95, y1: yP + 2.15 }] });
  bw('right', -8.95, -13.05, yP, gfTop, { seed: 5, ops: [{ a: -10.4, b: -11.4, y0: yP + 1.5, y1: yP + 2.2 }] });
  // left side wall (porch is open)
  bw('left', -4.55, -8.65, yP, gfTop, { seed: 6, ops: [{ a: -5.8, b: -7.2, y0: yP + 0.95, y1: yP + 2.15 }] });
  bw('left', -8.95, -13.05, yP, gfTop, { seed: 7 });
  // back wall
  bw('back', 10.25, 7.15, -D, yP, gfTop, { seed: 8, face: -D, ops: [{ a: 9.0, b: 8.0, y0: yP + 0.95, y1: yP + 2.15 }] });
  bw('back', 6.85, 3.75, yP, gfTop, { seed: 9, face: -D, ops: [{ a: 5.6, b: 4.4, y0: yP + 0.95, y1: yP + 2.15 }] });
  bw('back', 3.45, 0.15, yP, gfTop, { seed: 10, face: -D });
  // porch: back wall of the porch at z=-4.4 line (x 0.15..3.45) to 2.2 m
  bw('front', 0.15, 3.45, yP, yP + 0.0, {});
  // ---- upper floor, front (half done)
  const uf = yt1;
  bw('front', 3.75, 6.85, uf, ufTop, { seed: 11, ops: [{ a: 4.7, b: 6.0, y0: uf + 0.9, y1: uf + 2.1 }] });
  bw('front', 7.15, 10.25, uf, uf + 1.55, { seed: 12, ranges: S.racked({ len: 3.1, from: 'right', step: 0.115, topC: 18, maxC: 18 }) });
  // balcony parapet beginnings
  bw('front', 0.15, 3.45, uf, uf + 0.5, { seed: 13, face: 1.3, t: 0.115, bond: 'stretcher', ranges: S.racked({ len: 3.3, from: 'left', step: 0.11, topC: 6, maxC: 6 }) });
  // upper right side
  bw('right', -0.15, -4.25, uf, uf + 1.9, { seed: 14, ranges: S.racked({ len: 4.1, from: 'right', step: 0.125, topC: 22, maxC: 22 }) });
  bw('right', -4.55, -8.65, uf, ufTop, { seed: 15, ops: [{ a: -5.4, b: -6.8, y0: uf + 0.9, y1: uf + 2.1 }] });
  bw('right', -8.95, -13.05, uf, uf + 0.45, { seed: 16 });
  // upper left side & back
  bw('left', -4.55, -8.65, uf, uf + 1.3, { seed: 17, ranges: S.racked({ len: 4.1, from: 'left', step: 0.1, topC: 15, maxC: 15 }) });
  bw('back', 10.25, 7.15, -D, uf, uf + 2.0, { seed: 18, face: -D, ranges: S.racked({ len: 3.1, from: 'left', step: 0.12, topC: 23, maxC: 23 }) });
  bw('back', 6.85, 3.75, -D, uf, ufTop, { seed: 19, face: -D, ops: [{ a: 5.6, b: 4.4, y0: uf + 0.9, y1: uf + 2.1 }] });
  // interior partitions (visible through openings)
  { const g = S.brickWall({ len: 8.5, hgt: 2.8, t: 0.115, bond: 'stretcher', seed: 31, clayMat: clay, mortarMat: mortar, openings: [{ u0: 2.6, u1: 3.6, v0: 0, v1: 2.05 }], ranges: S.racked({ len: 8.5, from: 'right', step: 0.12, topC: 31, maxC: 31 }) }); S.place(g, 3.6, yP, -4.4, Math.PI / 2, House); void g; }
  { const g = S.brickWall({ len: 6.8, hgt: 2.8, t: 0.115, bond: 'stretcher', seed: 32, clayMat: clay, mortarMat: mortar }); S.place(g, 0.4, yP, -8.8 + 0.057, 0, House); }
  // door frames (timber chowkhat) in door openings
  { const df = new G.Mesher(); const dx0 = 7.45, dx1 = 8.55, dh = yP + 2.1; df.box(dx0 + 0.04, (yP + dh) / 2, -0.12, 0.09, dh - yP, 0.2, { tile: 2.5 }); df.box(dx1 - 0.04, (yP + dh) / 2, -0.12, 0.09, dh - yP, 0.2, { tile: 2.5 }); df.box((dx0 + dx1) / 2, dh - 0.045, -0.12, dx1 - dx0, 0.09, 0.2, { tile: 2.5 }); df.box((dx0 + dx1) / 2, yP + 0.03, -0.12, dx1 - dx0 - 0.1, 0.05, 0.2, { tile: 2.5, uv: [0.3, 0.3] }); df.mesh(timberM, House); }
  // temporary diagonal braces (props) under porch beam, and propped timber at balcony
  { const ms = S.shutterMeshers(); const rr = G.rng(5); for (const [px, pz] of [[0.3, 1.05], [1.8, 1.05], [3.3, 1.05]]) S.steelProp(ms, px, pz, 0.02, yt1 - 0.16, rr); S.flushShutter(ms, House); }

  lap('brick');
  // ------------------------------------------------------------------ scaffolding
  const smF = S.scaffoldMeshers(); S.steelScaffold({ x0: 3.2, x1: 10.8, z: 1.5, depth: 1.2, height: 7.4, lift: 2.0, bay: 1.9, boards: [1, 2, 3], sm: smF, seed: 3, y0: 0.04, ladderBay: 3, wallZ: 0.0, tiesToWall: 1 }); S.flushScaffold(smF, scene);
  const smB = S.scaffoldMeshers(); S.bambooScaffold({ x0: 0.0, x1: 9.2, z: 1.3, depth: 1.25, height: 7.9, levels: [2.3, 4.5, 6.5], sm: smB, seed: 9, wallZ: 0.0, bay: 1.75 }); const bg = new THREE.Group(); S.flushScaffold(smB, bg); bg.position.set(W + 0.18, 0, -0.2); bg.rotation.y = Math.PI / 2; scene.add(bg);

  lap('scaff');
  // ------------------------------------------------------------------ piles & props (placed relative to the camera)
  const CAM = [12.5, 1.7, 10.5], TGT = [4.0, 1.7, -5.0], fw = (() => { const dx = TGT[0] - CAM[0], dz = TGT[2] - CAM[2], l = Math.hypot(dx, dz); return [dx / l, dz / l]; })(), rt = [-fw[1], fw[0]];
  const cp = (F, R) => [CAM[0] + F * fw[0] + R * rt[0], CAM[2] + F * fw[1] + R * rt[1]];
  const sandM = M.detailize(M.sand({ color: 0xa8956f }).clone(), { scale: 3, strength: 0.4, key: 'sandD' });
  const sandPos = cp(6.6, 3.2), hp1 = G.heap({ x: sandPos[0], z: sandPos[1], rx: 2.0, rz: 1.6, h: 1.25, seed: 4, mat: sandM, parent: scene, rot: 0.4, y0: -0.03, scoop: { a: 0.9, w: 0.4, depth: 0.15 }, lump: 0.25, p: 1.2 });
  const gravM = M.gravel({ color: 0x8a847a }); const gravel = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.95, vertexColors: false });
  const gp = cp(8.6, -3.6), hp2 = G.heap({ x: gp[0], z: gp[1], rx: 2.0, rz: 1.6, h: 1.1, seed: 9, mat: gravM, parent: scene, tile: 1.2, rot: -0.3, y0: -0.03 }); G.stonesOnHeap(hp2, { count: 9000, size: [0.022, 0.05], mat: gravel, parent: scene, seed: 5 });
  const hp3 = G.heap({ x: 1.2, z: 6.2, rx: 1.5, rz: 1.2, h: 0.8, seed: 14, mat: sandM, parent: scene, rot: 1.0, y0: -0.03 });
  { const sp = [sandPos[0] - 1.0, sandPos[1] + 0.6]; L.shovel({ x: sp[0], z: sp[1], y: hp1.heightAt(sp[0], sp[1]) - 0.05, ry: 2.4, lean: 0.4, parent: scene, seed: 2 }); }
  // steel bars lying in the foreground on sleepers
  { const b1 = cp(3.5, -0.8); S.barBundle({ x: b1[0], y: 0.02, z: b1[1], len: 6, dia: 0.016, rows: 5, ry: 0.5, parent: scene, seed: 3, rust: 0.6 }); const b2 = cp(4.5, -1.0); S.barBundle({ x: b2[0], y: 0.02, z: b2[1], len: 6, dia: 0.012, rows: 4, ry: 0.52, parent: scene, seed: 6, rust: 0.45 }); }
  { const gm = cp(5.0, 1.8); L.ghamela({ x: gm[0], z: gm[1], fill: 0.85, parent: scene, seed: 3 }); const gm2 = cp(5.6, 2.5); L.brickPile({ x: gm2[0], z: gm2[1], rad: 0.7, h: 0.25, count: 40, seed: 18, parent: scene }); }
  // brick stacks
  { const p1 = cp(10.5, 4.6), p2 = cp(12.5, 5.6), p3 = cp(7.5, 6.0); L.brickStack({ x: p1[0], z: p1[1], ry: 0.5, layers: 15, la: [5, 7], lb: [4, 9], seed: 3, parent: scene, missing: 0.4 }); L.brickStack({ x: p2[0], z: p2[1], ry: 0.5, layers: 12, la: [5, 7], lb: [4, 9], seed: 4, parent: scene, missing: 0.1 }); L.brickStack({ x: p3[0], z: p3[1], ry: 0.4, layers: 9, la: [5, 8], lb: [4, 10], seed: 6, parent: scene, missing: 0.7 }); }
  L.brickPile({ x: 8.2, z: 3.1, rad: 1.0, h: 0.45, count: 140, seed: 8, parent: scene });
  // cement bags
  L.cementStack({ x: 1.6, z: 3.2, ry: 0.15, layers: 8, nx: 2, nz: 2, seed: 2, parent: scene, scheme: 0 });
  L.cementStack({ x: 3.1, z: 3.6, ry: -0.1, layers: 5, nx: 2, nz: 2, seed: 3, parent: scene, scheme: 1 });
  L.looseBag({ x: 2.5, z: 5.0, ry: 0.5, parent: scene, seed: 3 });
  // plant
  L.mixer({ x: 8.8, z: 3.2, ry: -0.5, color: 0xd34a1a, parent: scene, seed: 2 });
  L.wheelbarrow({ x: 4.6, z: 3.8, ry: 0.4, color: 0x2f5fa8, parent: scene, seed: 2, load: 0.6 });
  L.ghamela({ x: 6.6, z: 2.9, fill: 0.5, parent: scene, seed: 4, ry: 1 });
  L.drum({ x: 16.0, z: -2.0, color: 0x2b5fb3, parent: scene, seed: 1 }); L.drum({ x: 16.7, z: -1.4, color: 0x2b5fb3, parent: scene, seed: 2 }); L.drum({ x: 16.2, z: -1.0, color: 0x8b5a3c, plasticDrum: false, parent: scene, seed: 3 });
  L.pe_tank({ x: 14.9, z: -5.6, r: 0.62, h: 1.5, parent: scene });
  L.plankStack({ x: 17.5, z: -8.0, ry: 0.1, n: 6, layers: 5, seed: 4, parent: scene });
  L.hoseCoil({ x: 6.0, z: 2.0, parent: scene });
  L.debris({ x0: -4, z0: -15, x1: 22, z1: 14, count: 140, seed: 7, parent: scene, avoid: (x, z) => (x > -0.5 && x < W + 0.5 && z < 0.8 && z > -D - 0.5) });
  L.dryGrass({ x0: -12, z0: -14, x1: 30, z1: 18, count: 900, scale: [0.1, 0.28], seed: 3, parent: scene, avoid: (x, z) => (x > -1 && x < W + 3 && z < 8 && z > -D - 1) || ruts(x, z) > 0.3 });

  lap('props');
  // ------------------------------------------------------------------ boundary wall (under construction) & neighbours
  const bwall = S.brickWall({ len: 9, hgt: 1.4, t: 0.23, bond: 'english', seed: 41, clayMat: clay, mortarMat: mortar, ranges: S.racked({ len: 9, from: 'right', step: 0.12, topC: 16, maxC: 16 }) }); S.place(bwall, -9, 0, 15.5, 0, scene);
  for (const px of [-9.0, 0.0]) { boxAt(px - 0.15, 0, 15.2, px + 0.15, 1.9, 15.6, rccCol, scene); }
  const rbPil = new S.Rebar(8, 0.7); rbPil.column({ x: 0.0, z: 15.4, w: 0.3, d: 0.4, y0: 1.9, y1: 2.0, ext: 0.7, nx: 2, nz: 2, dia: 0.012, pitch: 0.2 }); rbPil.mesh(scene);
  const nbWall = T.plaster(0xd9cfb8, { tileM: 3.4, seed: 70 });
  L.neighbourHouse({ x: -26, z: -2, w: 11, d: 14, floors: 2, color: 0xe3d7bd, seed: 2, parent: scene, trim: 0x938a7a, windowCols: 3 });
  L.neighbourHouse({ x: -11, z: -6, w: 9.5, d: 13, floors: 3, color: 0xc9bfaa, seed: 3, parent: scene, trim: 0x7d7467, windowCols: 3, accent: 0xa89a82 });
  L.neighbourHouse({ x: 22, z: -4, w: 10, d: 13, floors: 3, color: 0xe8e0cd, seed: 4, parent: scene, trim: 0x8a7f6d, windowCols: 3 });
  L.neighbourHouse({ x: 36, z: -8, w: 11, d: 14, floors: 2, color: 0xd6c9ae, seed: 5, parent: scene, trim: 0x8f8573, windowCols: 4 });
  L.neighbourHouse({ x: -2, z: -28, w: 12, d: 12, floors: 3, color: 0xdcd2bb, seed: 6, parent: scene, trim: 0x8a8070, windowCols: 4, accent: 0xb9a98b });
  L.neighbourHouse({ x: 16, z: -34, w: 10, d: 12, floors: 2, color: 0xcfc3ab, seed: 7, parent: scene, trim: 0x877c6a, windowCols: 3 });
  L.neighbourHouse({ x: -22, z: -36, w: 11, d: 12, floors: 3, color: 0xe1d6bf, seed: 8, parent: scene, trim: 0x8a8070, windowCols: 3 });
  L.neighbourHouse({ x: 36, z: -34, w: 11, d: 12, floors: 3, color: 0xd9ceb5, seed: 9, parent: scene, trim: 0x8a8070, windowCols: 3 });
  L.neighbourHouse({ x: 6, z: -27, w: 11, d: 12, floors: 2, color: 0xdad0b6, seed: 10, parent: scene, trim: 0x8a8070, windowCols: 3, gate: false });
  L.neighbourHouse({ x: 20, z: -31, w: 10, d: 12, floors: 3, color: 0xd2c7ad, seed: 11, parent: scene, trim: 0x877c6a, windowCols: 3, gate: false });
  void nbWall;
  tree(-4.5, -16, { h: 10, crown: 4.2, seed: 2, color: 0x5a7a3a }, scene); tree(24, -16, { h: 11, crown: 4.6, seed: 5, color: 0x5d7d3b }, scene); tree(30, 5, { h: 9, crown: 3.8, seed: 8, color: 0x58783a }, scene); tree(-17, -2, { h: 8.5, crown: 3.6, seed: 12, color: 0x5b7b3a }, scene);
  tree(8, -22, { h: 12, crown: 5.0, seed: 14, color: 0x546f36 }, scene); palm(31, 12, { h: 9, seed: 5, lean: 0.3 }, scene);
  bush(-5, 0, 13, 0.9, scene, { color: 0x6b7f3f, seed: 3 }); bush(23, 0, 14, 0.8, scene, { color: 0x6b7f3f, seed: 4 });
  L.utilityPole({ x: 27, z: 17, h: 9.5, parent: scene }); L.utilityPole({ x: -3, z: 18, h: 9.5, parent: scene });
  L.wire({ a: [27, 9.1, 17], b: [-3, 9.1, 18], sag: 0.9, parent: scene }); L.wire({ a: [27, 8.3, 17], b: [-3, 8.3, 18], sag: 0.95, parent: scene }); L.wire({ a: [27, 8.7, 17], b: [-3, 8.7, 18], sag: 0.92, parent: scene });

  lap('neighbours');
  const camera = archCamera({ pos: [12.5, 1.7, 10.5], target: [4.0, 1.7, -5.0], focal: 25, shift: 0.05, w, h });
  return { scene, camera, exposure: 0.6, aoRadius: 0.7, aoStrength: 1.0, grade: { contrast: 1.14, saturation: 1.14, vignette: 0.3, grain: 0.02, warm: 0.035 } };
}
