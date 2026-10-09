// progress-finishing: plastered / half-painted house, scaffolding with ladder, windows being fitted, paint, tile boxes, tools
import { THREE, T, boxAt, wallWithOpenings, windowUnit, doorUnit, waterTank } from '../lib/arch.mjs';
import { archCamera } from '../lib/env.mjs';
import { tree, palm, bush, hedge } from '../lib/nature.mjs';
import * as M from '../lib/agent4-mat.mjs';
import * as G from '../lib/agent4-geo.mjs';
import * as S from '../lib/agent4-struct.mjs';
import * as L from '../lib/agent4-site.mjs';
import * as R from '../lib/agent4-trade.mjs';
import { hazeEnvironment } from '../lib/agent4-env.mjs';

export default async function build({ renderer, w, h }) {
  const scene = new THREE.Scene();
  hazeEnvironment({ renderer, scene, sunElevation: 36, sunAzimuth: 52, sunIntensity: 6.0, envIntensity: 0.42, shadowExtent: 30, shadowCenter: [4, 0, -2], horizon: [1.0, 0.9, 0.78], zenith: [0.36, 0.55, 0.9], haze: 0.3, glow: 0.4, fogDensity: 0.008, cloud: 0.55 });
  const rr = G.rng(7);
  const soilM = () => M.detailize(M.soil({ color: 0xc2b08f, dark: 0x9a876a }).clone(), { scale: 1.1, strength: 0.7, key: 'soilD' });
  G.terrain({ x0: -34, z0: -30, x1: 44, z1: 36, y: 0, mat: soilM(), parent: scene, res: 0.45, amp: 0.03, seed: 5 });
  { const far = new THREE.Mesh(new THREE.PlaneGeometry(1600, 1600), soilM()); far.rotation.x = -Math.PI / 2; far.position.y = -0.06; far.receiveShadow = true; const p = far.geometry.attributes.position, uv = far.geometry.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, p.getX(i) / 10, -p.getY(i) / 10); scene.add(far); }

  // materials
  const paintA = M.detailize(M.paintWall(0xe6cfa3, { seed: 8, tileM: 3 }).clone(), { scale: 0.9, strength: 0.25, dustH: 0.5, dustColor: 0xa89878, dustAmt: 0.4, key: 'pA' });
  const paintB = M.paintWall(0xdcc59a, { seed: 9, tileM: 3 });
  const accent = M.paintWall(0xa8573f, { seed: 10, tileM: 3 });
  const plinth = M.paintWall(0x5d5a55, { seed: 11, tileM: 2 });
  const fresh = M.detailize(M.freshPlaster({ color: 0x9a968b, seed: 12, tileM: 2.5 }).clone(), { scale: 1.2, strength: 0.4, key: 'fp' });
  const freshWet = M.freshPlaster({ color: 0xa39f94, seed: 14, tileM: 2.5, wet: 1 });
  const cap = T.concrete(0xb5b3ad, { tileM: 2, seed: 8 });
  const sillStone = T.stone({ color: 0xb8b2a6, tileM: 1.4, seed: 4, rows: 3 });
  const timber = M.timber({ color: 0x7a5538, seed: 33, weather: 0.3 });
  const glassM = T.glass({ tint: 0x16222c, env: 2.6 });

  const W = 10.4, D = 12, yP = 0.5, yS1 = 3.85, yS2 = 7.2, PAR = 1.0;
  const H = new THREE.Group(); scene.add(H);
  const facade = (x0, x1, y0, y1, ops, mat, zBack = -0.23, t = 0.23) => { wallWithOpenings(x0, x1, y0, y1, zBack, t, ops.filter((o) => o.x >= x0 - 1e-6 && o.x + o.w <= x1 + 1e-6), mat, H); };
  // plinth band
  boxAt(0, 0, -D, W, yP, 0.02, plinth, H); boxAt(-0.0, yP, -D, W, yP + 0.06, 0.04, cap, H);
  // front wall: ground floor
  const opsG = [{ x: 1.1, y: yP, w: 1.1, h: 2.2 }, { x: 3.3, y: yP + 0.95, w: 1.6, h: 1.4 }, { x: 5.6, y: yP + 0.95, w: 1.6, h: 1.4 }, { x: 8.2, y: yP + 0.95, w: 1.6, h: 1.4 }];
  facade(0, 6.2, yP + 0.06, yS1, opsG, paintA); facade(6.2, W, yP + 0.06, yS1, opsG, paintA);
  const opsU = [{ x: 1.2, y: yS1 + 0.9, w: 1.6, h: 1.5 }, { x: 4.0, y: yS1 + 0.9, w: 1.6, h: 1.5 }, { x: 7.4, y: yS1 + 0.9, w: 1.6, h: 1.5 }, { x: 9.0, y: yS1 + 0.2, w: 1.0, h: 2.2 }];
  void opsU;
  facade(0, 6.2, yS1, yS2, opsU, paintB); facade(6.2, W, yS1, yS2, opsU.filter((o) => o.x >= 6.2), fresh);
  boxAt(0, yP + 0.06, -D, W, yS2, -0.23, paintA, H);
  // fascia bands (accent paint ground slab, plaster upper)
  boxAt(-0.06, yS1 - 0.02, -D, W + 0.06, yS1 + 0.28, 0.1, accent, H); boxAt(-0.06, yS2 - 0.02, -D, W + 0.06, yS2 + 0.3, 0.1, freshWet, H);
  // parapet + roof slab
  boxAt(0, yS2 + 0.28, -D, W, yS2 + PAR, -D + 0.2, fresh, H); boxAt(0, yS2 + 0.28, -0.2, W, yS2 + PAR, 0, fresh, H); boxAt(0, yS2 + 0.28, -D, 0.2, yS2 + PAR, 0, fresh, H); boxAt(W - 0.2, yS2 + 0.28, -D, W, yS2 + PAR, 0, fresh, H); boxAt(0, yS2 - 0.0, -D, W, yS2 + 0.3, 0, cap, H);
  boxAt(-0.05, yS2 + PAR, -D - 0.05, W + 0.05, yS2 + PAR + 0.06, 0.05, cap, H);
  waterTank(8.0, yS2 + 0.3, -6, H, { r: 0.6, h: 1.2 }); waterTank(6.4, yS2 + 0.3, -6.4, H, { r: 0.6, h: 1.2 });
  // left side wall (x=0): painted, windows fitted — built in a rotated group (local x = world z)
  { const g = new THREE.Group(); const so = [-2.4, -6.0, -9.4];
    wallWithOpenings(-D, 0, yP + 0.06, yS1, -0.23, 0.23, so.map((z) => ({ x: z, y: yP + 0.95, w: 1.5, h: 1.4 })), paintA, g); wallWithOpenings(-D, 0, yS1, yS2, -0.23, 0.23, so.map((z) => ({ x: z, y: yS1 + 0.9, w: 1.5, h: 1.5 })), paintB, g);
    for (const z of so) { windowUnit({ x: z, y: yP + 0.95, w: 1.5, h: 1.4, z: 0, frame: 0x3a2f27, cols: 2, glassMat: glassM, sill: sillStone, reveal: 0.1, curtain: 0x8c8272 }, g); windowUnit({ x: z, y: yS1 + 0.9, w: 1.5, h: 1.5, z: 0, frame: 0x3a2f27, cols: 2, glassMat: glassM, sill: sillStone, reveal: 0.1, curtain: 0x7a7468 }, g); }
    boxAt(-D, yS1 - 0.02, -0.0, 0, yS1 + 0.28, 0.1, accent, g); boxAt(-D, yS2 - 0.02, 0, 0, yS2 + 0.3, 0.1, accent, g);
    g.rotation.y = -Math.PI / 2; H.add(g); }
  // windows (fitted, with glass) on the front; empty frames in plaster zone
  const frame = 0x3a2f27;
  windowUnit({ x: 3.3, y: yP + 0.95, w: 1.6, h: 1.4, z: 0, frame, cols: 2, rows: 1, glassMat: glassM, sill: sillStone, reveal: 0.1, curtain: 0x8c8272 }, H);
  windowUnit({ x: 5.6, y: yP + 0.95, w: 1.6, h: 1.4, z: 0, frame, cols: 2, rows: 1, glassMat: glassM, sill: sillStone, reveal: 0.1, curtain: 0x7a7468 }, H);
  windowUnit({ x: 1.2, y: yS1 + 0.9, w: 1.6, h: 1.5, z: 0, frame, cols: 2, rows: 1, glassMat: glassM, sill: sillStone, reveal: 0.1, curtain: 0x8c8272 }, H);
  windowUnit({ x: 4.0, y: yS1 + 0.9, w: 1.6, h: 1.5, z: 0, frame, cols: 2, rows: 1, glassMat: glassM, sill: sillStone, reveal: 0.1, curtain: 0x7a7468 }, H);
  // door (timber) and empty openings with timber frames
  doorUnit({ x: 1.1, y: yP, w: 1.1, h: 2.2, z: 0, mat: timber, recess: 0.12, frame: 0x4a3a2c }, H);
  for (const o of [{ x: 8.2, y: yP + 0.95, w: 1.6, h: 1.4 }, { x: 7.4, y: yS1 + 0.9, w: 1.6, h: 1.5 }]) { const m = new G.Mesher(), t = 0.07; m.box(o.x + t / 2, o.y + o.h / 2, -0.12, t, o.h, 0.16, { tile: 2.5 }); m.box(o.x + o.w - t / 2, o.y + o.h / 2, -0.12, t, o.h, 0.16, { tile: 2.5 }); m.box(o.x + o.w / 2, o.y + o.h - t / 2, -0.12, o.w, t, 0.16, { tile: 2.5 }); m.box(o.x + o.w / 2, o.y + t / 2, -0.12, o.w, t, 0.16, { tile: 2.5 }); m.box(o.x + o.w / 2, o.y + o.h / 2, -0.12, 0.05, o.h, 0.14, { tile: 2.5 }); m.mesh(timber, H); }
  boxAt(9.0, yS1 + 0.0, -0.23, 10.0, yS1 + 0.2, 0.0, sillStone, H);
  // a window sheet of glass leaning against the wall, with a protective tape cross
  { const gl = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.3, 0.01), new THREE.MeshPhysicalMaterial({ color: 0x9fb8c0, roughness: 0.03, metalness: 0, transparent: true, opacity: 0.45, envMapIntensity: 2.5, clearcoat: 1 })); gl.position.set(9.0, 0.78, 0.4); gl.rotation.x = -0.12; gl.castShadow = false; scene.add(gl); const fr = new G.Mesher(); fr.box(9.0, 0.06, 0.45, 1.6, 0.08, 0.2, { tile: 2.5 }); fr.mesh(M.timber({ color: 0x9a7b55, seed: 9 }), scene); }

  // scaffolding: steel on the plastered right half + ladder, bamboo on a stretch
  const sm = S.scaffoldMeshers(); S.steelScaffold({ x0: 5.9, x1: 10.9, z: 1.55, depth: 1.2, height: 7.4, lift: 2.0, bay: 2.5, boards: [1, 2, 3], sm, seed: 3, y0: 0.04, ladderBay: 1, wallZ: 0.0 }); S.flushScaffold(sm, scene);
  const bm = S.scaffoldMeshers(); S.bambooScaffold({ x0: -0.2, x1: 3.6, z: 1.5, depth: 1.25, height: 4.9, levels: [4.6], sm: bm, seed: 5, wallZ: 0.0, bay: 1.9 }); S.flushScaffold(bm, scene);
  R.ladder({ foot: [4.4, 0.0, 2.6], top: [4.6, 4.7, 0.9], width: 0.45, rungs: 16, type: 'alu', parent: scene });
  R.ladder({ foot: [12.6, 0.0, 2.0], top: [10.9, 4.4, 1.0], width: 0.45, rungs: 14, type: 'wood', parent: scene, seed: 2 });

  // site: neat compound
  const pav = T.paving({ color: 0xaaa293, tileM: 2, n: 8, seed: 7 }); { const p = new THREE.Mesh(new THREE.PlaneGeometry(18, 9), pav); p.rotation.x = -Math.PI / 2; p.position.set(2.6, 0.012, 4.5); p.receiveShadow = true; scene.add(p); const uv = p.geometry.attributes.uv, pp = p.geometry.attributes.position; for (let i = 0; i < uv.count; i++) uv.setXY(i, (pp.getX(i) + 2.6) / 2, (pp.getY(i) + 4.5) / 2); }
  const CAM = [-3.0, 11.5], TGT = [4.5, -2.0], fl = Math.hypot(TGT[0] - CAM[0], TGT[1] - CAM[1]), fw = [(TGT[0] - CAM[0]) / fl, (TGT[1] - CAM[1]) / fl], rt = [-fw[1], fw[0]], cp = (F, Rr) => [CAM[0] + F * fw[0] + Rr * rt[0], CAM[1] + F * fw[1] + Rr * rt[1]];
  { const p = cp(8.5, 0.3); R.tileBoxes({ x: p[0], z: p[1], cols: 3, rows: 2, layers: 4, seed: 2, parent: scene, ry: 0.5 }); const q = cp(7.5, 3.6); R.tileBoxes({ x: q[0], z: q[1], cols: 2, rows: 2, layers: 2, seed: 3, parent: scene, ry: 0.3 }); }
  const paintCols = [0xe6cfa3, 0xa8573f, 0xdcc59a, 0x5d6b78];
  paintCols.forEach((c, i) => { const p = cp(4.8 + (i % 2) * 0.35, -0.9 + i * 0.36); L.paintTin({ x: p[0], z: p[1], y: 0.012, rad: 0.12, h: 0.22, color: c, band: [0x2b6cb0, 0x1f7a4d, 0xb33a2a, 0x2b6cb0][i], parent: scene, ry: i, open: i === 0 || i === 3, lidOff: i === 0, seed: i + 1 }); });
  { const p = cp(5.6, -2.0); L.bucket({ x: p[0], z: p[1], y: 0.012, rad: 0.17, h: 0.34, color: 0xd9d4c8, fillColor: 0xe6cfa3, parent: scene, seed: 3 }); const q = cp(5.0, -2.6); L.bucket({ x: q[0], z: q[1], y: 0.012, rad: 0.17, h: 0.34, color: 0xc7842a, parent: scene, seed: 4 });
    const t = cp(4.4, 1.2); R.rollerTray({ x: t[0], y: 0.012, z: t[1], ry: 0.4, parent: scene }); R.paintRoller({ x: t[0] + 0.2, y: 0.012, z: t[1] + 0.5, ry: -0.5, parent: scene });
    const tb = cp(3.8, -1.6); R.toolbox({ x: tb[0], y: 0.012, z: tb[1], ry: 0.5, parent: scene }); const sl = cp(3.2, 0.2); R.spiritLevel({ x: sl[0], y: 0.012, z: sl[1], ry: 0.2, len: 1.0, parent: scene }); const tr = cp(3.6, 1.6); R.trowel({ x: tr[0], y: 0.012, z: tr[1], ry: 0.8, parent: scene }); const pk = cp(3.4, 0.9); R.puttyKnife({ x: pk[0], y: 0.012, z: pk[1], ry: 1.2, parent: scene }); }
  L.wheelbarrow({ x: 11.2, z: 5.4, ry: 2.4, color: 0x2f5fa8, parent: scene, seed: 3, load: 0 }); L.plankStack({ x: 13.8, z: 3.0, ry: 0.05, n: 5, layers: 3, seed: 5, parent: scene }); L.cementStack({ x: 13.4, z: 7.6, ry: 0.2, layers: 5, nx: 2, nz: 2, seed: 4, parent: scene, scheme: 2 });
  L.ghamela({ x: 9.8, z: 4.2, fill: 0.55, parent: scene, seed: 2 });
  const sandM = M.detailize(M.sand({ color: 0xa8956f }).clone(), { scale: 3, strength: 0.4, key: 'sandD' }); G.heap({ x: 15.5, z: 4.5, rx: 1.6, rz: 1.3, h: 0.8, seed: 6, mat: sandM, parent: scene, y0: -0.03 });
  L.dryGrass({ x0: -14, z0: 8, x1: 30, z1: 20, count: 250, scale: [0.12, 0.3], seed: 9, parent: scene });
  // boundary wall + gate pillars (plastered, painted) behind camera side left
  { const bwm = M.paintWall(0xe1d6ba, { seed: 15, tileM: 3 }); boxAt(-14, 0, 15.9, 20, 1.6, 16.15, bwm, scene); for (const px of [-1, 5.5]) { boxAt(px - 0.25, 0, 15.75, px + 0.25, 2.0, 16.3, paintB, scene); boxAt(px - 0.3, 2.0, 15.7, px + 0.3, 2.08, 16.35, cap, scene); } }
  // neighbours, trees, haze
  L.neighbourHouse({ x: -24, z: -4, w: 11, d: 13, floors: 2, color: 0xe3d7bd, seed: 2, parent: scene, trim: 0x938a7a });
  L.neighbourHouse({ x: -14, z: -9, w: 8.5, d: 13, floors: 2, color: 0xcdb89a, seed: 3, parent: scene, trim: 0x7d7467, accent: 0xa89a82 });
  L.neighbourHouse({ x: 15, z: -5, w: 10, d: 13, floors: 3, color: 0xe8e0cd, seed: 4, parent: scene, trim: 0x8a7f6d });
  L.neighbourHouse({ x: 30, z: -9, w: 11, d: 14, floors: 2, color: 0xd9cdb2, seed: 5, parent: scene, trim: 0x8f8573 });
  L.neighbourHouse({ x: 2, z: -26, w: 12, d: 12, floors: 3, color: 0xdcd2bb, seed: 6, parent: scene, trim: 0x8a8070, gate: false }); L.neighbourHouse({ x: -18, z: -30, w: 11, d: 12, floors: 2, color: 0xcfc3ab, seed: 7, parent: scene, trim: 0x877c6a, gate: false });
  tree(-6, -15, { h: 10, crown: 4.2, seed: 2, color: 0x5a7a3a }, scene); tree(21, -14, { h: 11, crown: 4.6, seed: 5, color: 0x5d7d3b }, scene); tree(-16, 6, { h: 8.5, crown: 3.6, seed: 12, color: 0x5b7b3a }, scene); palm(24, 10, { h: 9, seed: 5, lean: 0.3 }, scene);
  hedge(-2, 14.8, 4, 14.8, { h: 0.6, w: 0.5, density: 60, seed: 3, color: 0x5a7f3a }, scene);
  const camera = archCamera({ pos: [-3.0, 1.7, 11.5], target: [4.5, 1.7, -2.0], focal: 23, shift: 0.05, w, h });
  return { scene, camera, exposure: 0.62, aoRadius: 0.7, aoStrength: 1.0, grade: { contrast: 1.12, saturation: 1.1, vignette: 0.28, grain: 0.02, warm: 0.03 } };
}
