// svc-renovation: facade mid-renovation — left half old weathered plaster with cracks/wiring, right half fresh modern finish; bamboo scaffold
import { THREE, T, boxAt, wallWithOpenings, windowUnit, doorUnit, acUnit, street, ground } from '../lib/arch.mjs';
import { archCamera } from '../lib/env.mjs';
import { tree } from '../lib/nature.mjs';
import * as M from '../lib/agent4-mat.mjs';
import * as G from '../lib/agent4-geo.mjs';
import * as S from '../lib/agent4-struct.mjs';
import * as L from '../lib/agent4-site.mjs';
import * as R from '../lib/agent4-trade.mjs';
import { hazeEnvironment } from '../lib/agent4-env.mjs';

export default async function build({ renderer, w, h }) {
  const scene = new THREE.Scene();
  hazeEnvironment({ renderer, scene, sunElevation: 40, sunAzimuth: 24, sunIntensity: 5.6, envIntensity: 0.45, shadowExtent: 24, shadowCenter: [5, 3, 0], horizon: [1.0, 0.9, 0.78], zenith: [0.38, 0.56, 0.9], haze: 0.3, glow: 0.35, fogDensity: 0.007, cloud: 0.6 });
  const rr = G.rng(3);
  // street + footpath
  ground(-120, -40, 120, 9, 0, M.detailize(M.soil({ color: 0xbca98a }).clone(), { scale: 1.1, strength: 0.6, key: 'sD' }), scene);
  street({ z0: 12.5, z1: 30, x0: -120, x1: 120, parent: scene });
  const foot = T.paving({ color: 0xa9a294, tileM: 2.2, n: 6, seed: 9 }); ground(-120, 9, 120, 12.5, 0.02, foot, scene);
  const old = M.detailize(M.weatheredPlaster({ base: 0xd8c9a0, under: 0xb1ab9f, seed: 3, size: 2048, tileM: 8, damp: 0.75, peel: 0.65, brickShow: 0.6, grime: 0.9, cracks: 9, moss: 0.6, dampLine: 0.9,
    crackPts: [{ u: 0.18, v: 0.5, ang: 1.5, len: 2.2, w: 0.018 }, { u: 0.3, v: 0.6, ang: 1.1, len: 1.6, w: 0.012 }, { u: 0.45, v: 0.46, ang: 1.9, len: 1.5, w: 0.014 }, { u: 0.1, v: 0.85, ang: 0.3, len: 1.8, w: 0.012 }],
    rust: [{ u: 0.18, v: 0.3, len: 1.6 }, { u: 0.4, v: 0.32, len: 1.4 }, { u: 0.1, v: 0.7, len: 1.2 }] }).clone(), { scale: 0.7, strength: 0.3, key: 'oldD' });
  const oldUp = M.detailize(M.weatheredPlaster({ base: 0xd4c598, under: 0xaaa497, seed: 6, size: 2048, tileM: 8, damp: 0.5, peel: 0.55, brickShow: 0.4, grime: 1.0, cracks: 8, moss: 0.3, dampLine: 0.3, rust: [{ u: 0.3, v: 0.62, len: 1.0 }] }).clone(), { scale: 0.7, strength: 0.3, key: 'oldU' });
  const fresh = M.detailize(M.paintWall(0xdedad0, { seed: 20, tileM: 3 }).clone(), { scale: 0.9, strength: 0.18, key: 'newP' });
  const dark = M.paintWall(0x3b3f45, { seed: 21, tileM: 3 }), warm = M.paintWall(0xb5896a, { seed: 22, tileM: 3 });
  const slats = T.wood({ color: 0xb98a55, tileM: 1.4, planks: 9, seed: 5 }), cap = T.concrete(0xb9b7b0, { tileM: 2, seed: 8 }), conc = T.concrete(0xa8a59e, { tileM: 2, seed: 4 });
  const gl = T.glass({ tint: 0x1a2a38, env: 3 }), glDirty = T.glass({ tint: 0x2d3a36, env: 1.2 });
  const W = 10.4, D = 11, F1 = 3.6, F2 = 7.2, XS = 5.2;
  const H = new THREE.Group(); scene.add(H);
  // neighbours flush on both sides
  { const nl = T.plaster(0xd8cfba, { tileM: 3, seed: 31 }), nr = T.plaster(0xc9d0c8, { tileM: 3, seed: 32 }); boxAt(-3.2, 0, -D, 0, 8.4, 0, nl, H); boxAt(W, 0, -D, W + 3.2, 6.6, 0, nr, H); boxAt(-2.4, 1.0, 0, -0.9, 2.4, 0.05, T.plaster(0x2a2d31, { tileM: 2, seed: 3 }), H); boxAt(W + 0.9, 4.0, 0, W + 2.3, 5.4, 0.05, T.plaster(0x2a2d31, { tileM: 2, seed: 3 }), H); boxAt(W + 0.9, 0.9, 0, W + 2.3, 2.3, 0.05, T.plaster(0x2a2d31, { tileM: 2, seed: 3 }), H); }
  // ---- left half (old)
  const opsO1 = [{ x: 0.8, y: 0, w: 1.1, h: 2.2 }, { x: 2.8, y: 0.95, w: 1.5, h: 1.4 }], opsO2 = [{ x: 0.7, y: F1 + 0.9, w: 1.5, h: 1.5 }, { x: 2.9, y: F1 + 0.9, w: 1.5, h: 1.5 }];
  wallWithOpenings(0, XS, 0, F1, -0.23, 0.23, opsO1, old, H); wallWithOpenings(0, XS, F1, F2, -0.23, 0.23, opsO2, oldUp, H); boxAt(0, 0, -D, XS, F2, -0.23, old, H);
  boxAt(-0.04, F1 - 0.12, -D, XS, F1 + 0.18, 0.08, oldUp, H); boxAt(-0.04, F2 - 0.1, -D, XS, F2 + 0.2, 0.08, oldUp, H);
  boxAt(0, F2 + 0.2, -D, XS, F2 + 1.05, -D + 0.2, old, H); boxAt(0, F2 + 0.2, -0.2, XS, F2 + 1.05, 0, oldUp, H); boxAt(0, F2 + 0.2, -D, 0.2, F2 + 1.05, 0, old, H);
  const rustFrame = 0x4b3a2a;
  for (const o of opsO1.slice(1).concat(opsO2)) { windowUnit({ x: o.x, y: o.y, w: o.w, h: o.h, z: 0, frame: rustFrame, cols: 2, rows: 1, glassMat: glDirty, sill: T.stone({ color: 0x8e887a, tileM: 1.4, seed: 4, rows: 3 }), reveal: 0.1, curtain: 0x5a5246 }, H);
    // old steel grille
    const gm = new G.Mesher(), gc = G.lin(0x3d2f26); for (let k = 0; k <= 7; k++) gm.box(o.x + 0.04 + k * ((o.w - 0.08) / 7), o.y + o.h / 2, 0.03, 0.014, o.h - 0.04, 0.014, { color: gc }); for (let k = 0; k <= 3; k++) gm.box(o.x + o.w / 2, o.y + 0.05 + k * ((o.h - 0.1) / 3), 0.03, o.w - 0.04, 0.014, 0.014, { color: gc }); gm.mesh(M.solidMat(0xffffff, { roughness: 0.75, metalness: 0.6, vertexColors: true }), H); }
  doorUnit({ x: 0.8, y: 0, w: 1.1, h: 2.2, z: 0, mat: M.timber({ color: 0x5d4631, seed: 36, weather: 1 }), recess: 0.1, frame: 0x3b2c20 }, H);
  acUnit(3.0, 4.0 + 1.5, 0.0, H); acUnit(1.0, 0.4 + 0.1, 0, H).visible = false;
  // exposed wiring + old fittings on the left facade
  const cableCols = [0x1a1a1a, 0xb3281c, 0x2d2d2d, 0xd6d1c0, 0x1c3d7a];
  for (let k = 0; k < 7; k++) { const x0 = 0.3 + rr() * 4.5, y0 = 2.7 + rr() * 3.5, dx = (rr() - 0.5) * 1.8, pts = []; for (let i = 0; i <= 14; i++) { const t = i / 14; pts.push([x0 + dx * t + Math.sin(t * 6 + k) * 0.03, y0 - Math.sin(t * Math.PI) * 0.35 - t * 0.5, 0.045 + Math.sin(t * 8 + k) * 0.006]); } R.wirePath({ pts, r: 0.006 + rr() * 0.004, color: cableCols[k % 5], parent: H }); }
  R.junctionBox({ x: 2.2, y: 3.05, z: 0.03, w: 0.18, h: 0.2, d: 0.06, color: 0x8d8a80, parent: H }); R.junctionBox({ x: 4.5, y: 2.6, z: 0.03, w: 0.3, h: 0.4, d: 0.08, color: 0x7a7a72, parent: H });
  R.conduit({ pts: [[4.5, 2.8, 0.05], [4.5, 3.4, 0.05], [4.45, 4.9, 0.05], [3.9, 5.2, 0.05], [3.0, 5.25, 0.05]], r: 0.012, color: 0xb9b6a8, parent: H });
  R.conduit({ pts: [[0.35, 0.2, 0.05], [0.35, 4.6, 0.05], [0.6, 5.0, 0.05]], r: 0.04, color: 0x7e8a80, parent: H }); // old downpipe
  for (let y = 0.6; y < 4.5; y += 1.2) boxAt(0.3, y, 0.0, 0.4, y + 0.04, 0.09, M.solidMat(0x5a4a3a), H);
  // ---- right half (renovated)
  const opsN1 = [{ x: 6.0, y: 0.5, w: 2.4, h: 1.9 }, { x: 9.0, y: 0.0, w: 1.0, h: 2.3 }], opsN2 = [{ x: 5.8, y: F1 + 0.8, w: 1.9, h: 1.7 }, { x: 8.4, y: F1 + 0.8, w: 1.7, h: 1.7 }];
  wallWithOpenings(XS, W, 0.0, F1, -0.23, 0.23, opsN1, fresh, H); wallWithOpenings(XS, W, F1, F2, -0.23, 0.23, opsN2, fresh, H); boxAt(XS, 0, -D, W, F2, -0.23, fresh, H);
  boxAt(XS, 0, -0.0, W, 0.18, 0.06, dark, H); boxAt(XS, F1 - 0.12, -D, W + 0.04, F1 + 0.16, 0.1, dark, H); boxAt(XS, F2 - 0.1, -D, W + 0.04, F2 + 0.22, 0.14, dark, H);
  boxAt(XS, F2 + 0.22, -D, W, F2 + 1.0, -D + 0.2, fresh, H); boxAt(XS, F2 + 0.22, -0.2, W, F2 + 1.0, 0, fresh, H); boxAt(W - 0.2, F2 + 0.22, -D, W, F2 + 1.0, 0, fresh, H); boxAt(XS - 0.02, F2 + 1.0, -D, W + 0.04, F2 + 1.07, 0.06, dark, H);
  for (const o of [opsN1[0], ...opsN2]) windowUnit({ x: o.x, y: o.y, w: o.w, h: o.h, z: 0, frame: 0x22262b, frameT: 0.05, cols: o === opsN1[0] ? 3 : 2, rows: 1, glassMat: gl, sill: cap, reveal: 0.14, curtain: 0xc9c3b4 }, H);
  doorUnit({ x: 9.0, y: 0, w: 1.0, h: 2.3, z: 0, mat: slats, recess: 0.14, frame: 0x22262b }, H);
  // timber slat feature + glass balustrade at the first floor
  for (let x = 5.4; x < 5.75; x += 0.07) boxAt(x, 0.2, 0.0, x + 0.05, F1 - 0.15, 0.1, slats, H);
  boxAt(8.9, F1 - 0.0, -0.0, 10.4, F1 + 0.06, 0.0 + 0.0, dark, H);
  for (let k = 0; k < 4; k++) { const sp = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.1), M.solidMat(0xfff2cf, { roughness: 0.4, emissive: 0xfff2cf, emissiveIntensity: 0.5 })); void sp; }
  const lamp = M.solidMat(0x111111, { roughness: 0.4, metalness: 0.5 }); for (const lx of [5.5, 8.5]) { const l = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.22, 12), lamp); l.position.set(lx, 2.6, 0.1); l.castShadow = true; scene.add(l); }
  // transition: raised fresh plaster edge
  boxAt(XS - 0.02, 0.0, -0.01, XS + 0.02, F2, 0.012, M.freshPlaster({ color: 0xb2ada1, seed: 18, tileM: 1.5, wet: 1 }), H);
  // scaffold (bamboo) across the transition, steel to the right
  const bm = S.scaffoldMeshers(); S.bambooScaffold({ x0: 5.0, x1: 11.0, z: 1.5, depth: 1.25, height: 7.9, levels: [2.3, 4.4, 6.5], sm: bm, seed: 5, wallZ: 0.0, bay: 1.85 }); S.flushScaffold(bm, scene);
  R.ladder({ foot: [1.4, 0, 2.6], top: [1.6, 4.9, 0.2], width: 0.42, rungs: 17, type: 'wood', parent: scene, seed: 2 });
  // ground kit
  const pk = [[4.0, 4.0, 0xe9dfd0, 0x2b6cb0], [4.4, 4.2, 0xdedad0, 0x1f7a4d], [4.8, 3.9, 0x3b3f45, 0xb33a2a], [5.2, 4.3, 0xdedad0, 0x2b6cb0]];
  pk.forEach((p, i) => L.paintTin({ x: p[0], z: p[1], rad: 0.12, h: 0.22, color: p[2], band: p[3], parent: scene, ry: i, open: i === 1, lidOff: i === 1, seed: i + 1 })); L.bucket({ x: 3.4, z: 4.6, rad: 0.17, h: 0.34, color: 0xd9d4c8, fillColor: 0xdedad0, parent: scene, seed: 3 });
  R.rollerTray({ x: 5.9, z: 4.0, ry: 0.3, color: 0xdedad0, parent: scene }); R.paintRoller({ x: 6.2, z: 4.5, ry: 1.0, parent: scene });
  L.wheelbarrow({ x: 8.8, z: 5.2, ry: 0.6, color: 0x2f5fa8, parent: scene, seed: 3, load: 0.5 }); L.cementStack({ x: 11.6, z: 3.4, ry: 0.2, layers: 4, nx: 2, nz: 2, seed: 4, parent: scene, scheme: 0 });
  L.brickPile({ x: 0.6, z: 3.6, rad: 0.8, h: 0.2, count: 40, seed: 3, parent: scene }); L.debris({ x0: -1, z0: 2, x1: 12, z1: 8, count: 40, seed: 5, parent: scene, avoid: (x, z) => z < 0.5 });
  // context
  tree(-4, 18, { h: 7, crown: 3.2, seed: 4, color: 0x5f8040 }, scene); tree(17, 8.5, { h: 7, crown: 3.4, seed: 8, color: 0x5d7d3b }, scene);
  L.neighbourHouse({ x: -17, z: -6, w: 12, d: 12, floors: 3, color: 0xdcd2bb, seed: 3, parent: scene, trim: 0x8a8070 }); L.neighbourHouse({ x: 16, z: -4, w: 12, d: 12, floors: 3, color: 0xcdd4cc, seed: 4, parent: scene, trim: 0x7d8078 });
  L.neighbourHouse({ x: -10, z: -34, w: 13, d: 12, floors: 3, color: 0xdcd2bb, seed: 6, parent: scene, trim: 0x877c6a, gate: false });
  const camera = archCamera({ pos: [5.0, 1.7, 11.6], target: [5.0, 1.7, 0], focal: 21, shift: 0.14, w, h });
  return { scene, camera, exposure: 0.6, aoRadius: 0.5, aoStrength: 1.0, grade: { contrast: 1.12, saturation: 1.08, vignette: 0.3, grain: 0.02, warm: 0.03 } };
}
