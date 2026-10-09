// svc-painting-waterproofing: half-painted wall with clean roller edge, paint tins, swatch fan; foreground roof-slab section with waterproofing layers and water beads
import { THREE, T, boxAt, ground, windowUnit } from '../lib/arch.mjs';
import { archCamera } from '../lib/env.mjs';
import { tree } from '../lib/nature.mjs';
import * as M from '../lib/agent4-mat.mjs';
import * as G from '../lib/agent4-geo.mjs';
import * as L from '../lib/agent4-site.mjs';
import * as R from '../lib/agent4-trade.mjs';
import { hazeEnvironment } from '../lib/agent4-env.mjs';

export default async function build({ renderer, w, h }) {
  const scene = new THREE.Scene();
  hazeEnvironment({ renderer, scene, sunElevation: 30, sunAzimuth: 58, sunIntensity: 5.4, sunColor: 0xffe2b8, envIntensity: 0.5, shadowExtent: 14, shadowCenter: [2.5, 0.5, 2], horizon: [1.05, 0.9, 0.74], zenith: [0.4, 0.57, 0.9], haze: 0.35, glow: 0.4, fogDensity: 0.008, cloud: 0.6, shadowRadius: 5 });
  const rr = G.rng(6);
  // terrace floor
  const floorM = M.detailize(M.rcc({ seed: 41, color: 0x9d9a92, stain: 0.6 }).clone(), { scale: 1.6, strength: 0.5, key: 'fl' });
  ground(-30, -1, 30, 22, 0, floorM, scene);
  // wall: left half painted (sage), right half primed plaster
  const WL = 30.0, WH = 3.2, XB = 3.1;
  const paintM = M.detailize(M.paintWall(0xa9bda8, { seed: 51, tileM: 2.4, roller: 1.6, roughness: 0.82 }).clone(), { scale: 1.2, strength: 0.22, key: 'pm' });
  const bare0 = M.detailize(M.freshPlaster({ color: 0xb9b5aa, seed: 52, tileM: 3.5 }).clone(), { scale: 1.4, strength: 0.35, key: 'bp' });
  const bare = bare0; bare.bumpScale = 0.3;
  const win = { x: 4.4, y: 0.95, w: 1.5, h: 1.5 };
  boxAt(-0.0, 0, -0.5, XB, WH, 0.0, paintM, scene);
  // plaster area with window opening
  { const g = new THREE.Group(); import('../lib/arch.mjs').then(() => {}); void g; }
  boxAt(XB, 0, -0.5, win.x, WH, 0, bare, scene); boxAt(win.x + win.w, 0, -0.5, WL, WH, 0, bare, scene); boxAt(win.x, 0, -0.5, win.x + win.w, win.y, 0, bare, scene); boxAt(win.x, win.y + win.h, -0.5, win.x + win.w, WH, 0, bare, scene);
  windowUnit({ x: win.x, y: win.y, w: win.w, h: win.h, z: 0, frame: 0x4a3a2c, cols: 2, glassMat: T.glass({ tint: 0x25302c, env: 2 }), sill: T.stone({ color: 0xa59f90, tileM: 1.4, seed: 4, rows: 3 }), reveal: 0.1, curtain: 0x706a5c }, scene);
  // wet roller edge ridge + masking tape strip at the base + skirting
  boxAt(XB - 0.012, 0.18, 0.0, XB + 0.004, WH, 0.003, M.solidMat(0xa9bda8, { roughness: 0.3 }), scene);
  boxAt(-40, 0, 0, WL, 0.16, 0.025, M.paintWall(0x5d5a55, { seed: 3, tileM: 2 }), scene);
  { const tp = new THREE.Mesh(new THREE.PlaneGeometry(WL + 40, 0.048), M.solidMat(0xd8cf9a, { roughness: 0.55 })); tp.position.set((WL - 40) / 2, 0.188, 0.004); scene.add(tp); }
  boxAt(-40.2, WH, -0.5, WL + 0.2, WH + 0.3, 0.12, T.concrete(0xb5b3ad, { tileM: 2, seed: 8 }), scene);
  // roller marks: faint roller-width bands near the edge (slightly different sheen) via extra thin boxes
  for (let k = 0; k < 3; k++) boxAt(XB - 0.5 - k * 0.55, 0.3, 0.0, XB - 0.46 - k * 0.55, 2.6, 0.0015, M.solidMat(0xa3b7a2, { roughness: 0.55, transparent: true, opacity: 0.35 }), scene);
  // drop sheet and trays at the wall base
  { const sh = L.tarpSheet({ x0: 0.2, z0: 0.1, x1: 3.6, z1: 1.4, y: 0.0, color: 0xcfd2cc, seed: 4, parent: scene, sag: 0.012, res: 0.1 }); void sh; }
  R.rollerTray({ x: 2.7, y: 0.014, z: 0.75, ry: 0.15, color: 0xa9bda8, parent: scene }); R.paintRoller({ x: 2.2, y: 0.014, z: 1.0, ry: 0.9, color: 0xa9bda8, parent: scene });
  const tins = [[0.5, 0.7, 0xa9bda8, 0x2b6cb0, true], [0.85, 0.5, 0xe9e4d6, 0x1f7a4d, false], [1.15, 0.85, 0xc98a5c, 0xb33a2a, false], [1.5, 0.55, 0x6d8aa3, 0x2b6cb0, false]];
  tins.forEach((t, i) => L.paintTin({ x: t[0], y: 0.012, z: t[1], rad: 0.12, h: 0.22, color: t[2], band: t[3], parent: scene, ry: i * 0.8, open: t[4], lidOff: t[4], seed: i + 1 }));
  L.paintTin({ x: 1.0, y: 0.012 + 0.22, z: 0.7, rad: 0.12, h: 0.22, color: 0xe9e4d6, band: 0x2b6cb0, parent: scene, seed: 9 });
  L.bucket({ x: 3.7, y: 0.012, z: 0.6, rad: 0.17, h: 0.34, color: 0xd9d4c8, fillColor: 0xa9bda8, fill: 0.75, parent: scene, seed: 3 });
  R.swatchFan({ x: 1.6, y: 0.012 + 0.012, z: 1.4, ry: -0.5, colors: [0xa9bda8, 0xcfd9c6, 0xe9e4d6, 0xe8d3a8, 0xc98a5c, 0xa8573f, 0x8da3b8, 0x6d8aa3, 0x4f6377, 0x3b3f45], parent: scene, len: 0.22, w: 0.045 });
  R.puttyKnife({ x: 3.1, y: 0.012, z: 1.5, ry: 0.7, parent: scene }); R.spiritLevel({ x: 4.6, y: 0.0, z: 0.5, ry: 0.05, len: 0.9, parent: scene });
  // ---------- roof-slab cross-section sample in the foreground (layers bottom -> top)
  const Bx = 2.6, Bz = 3.0, BW = 1.5, BD = 0.9, sec = new THREE.Group(); sec.position.set(Bx, 0.0, Bz); sec.rotation.y = 0.0; sec.scale.setScalar(1.45); scene.add(sec);
  const rccM = M.detailize(M.rcc({ seed: 44, color: 0xa5a39b, stain: 0.2 }).clone(), { scale: 2.0, strength: 0.4, key: 'rs' });
  const lime = M.detailize(M.mortar(0xb9b3a0, 6).clone(), { scale: 3, strength: 0.4, key: 'lm' });
  const screedM = M.detailize(M.freshPlaster({ color: 0xb7b3a8, seed: 61, tileM: 1.2 }).clone(), { scale: 2, strength: 0.3, key: 'sc' });
  const bit = T.asphalt({ wet: false }).clone(); bit.color = new THREE.Color(0x77777a); bit.userData.tileM = 0.8; bit.roughness = 0.62;
  const bitCap = M.solidMat(0x2b2d2c, { roughness: 0.5, metalness: 0.0 });
  const hS = 0.16, hC = 0.1, hSc = 0.04, hM = 0.008, y0 = 0.0;
  const frontS = BD / 2, frontC = BD / 2 - 0.1, frontSc = BD / 2 - 0.2, frontM = BD / 2 - 0.06;
  boxAt(-BW / 2, y0, -BD / 2, BW / 2, y0 + hS, frontS, rccM, sec);
  boxAt(-BW / 2, y0 + hS, -BD / 2, BW / 2, y0 + hS + hC, frontC, lime, sec);
  boxAt(-BW / 2, y0 + hS + hC, -BD / 2, BW / 2, y0 + hS + hC + hSc, frontSc, screedM, sec);
  // brick bats in the coba layer: front face + exposed top strip
  { const bm = new G.Mesher(), cl = M.clay(); let x = -BW / 2 + 0.02; const cols = ['#a'], _ = cols; void _; for (let row = 0; row < 2; row++) { x = -BW / 2 + 0.02 - rr() * 0.04; while (x < BW / 2 - 0.03) { const bwid = 0.05 + rr() * 0.07, bh = 0.036 + rr() * 0.02; bm.box(x + bwid / 2, y0 + hS + 0.012 + row * 0.047 + bh / 2, frontC + 0.004, bwid - 0.006, bh, 0.012, { tile: 0.34, uv: [rr(), rr()], color: G.tintVar(0x9a5a44, rr, 0.12, 0.08), rz: (rr() - 0.5) * 0.2 }); x += bwid; } }
    for (let i = 0; i < 26; i++) { const bx = -BW / 2 + 0.05 + rr() * (BW - 0.1), bz = frontSc + 0.02 + rr() * (frontC - frontSc - 0.05); bm.box(bx, y0 + hS + hC + 0.003, bz, 0.05 + rr() * 0.06, 0.012, 0.04 + rr() * 0.04, { tile: 0.34, uv: [rr(), rr()], ry: rr() * 3, color: G.tintVar(0x9a5a44, rr, 0.12, 0.08) }); }
    bm.mesh(cl, sec); }
  // rebar section dots on the slab front face + a couple of upstand bars
  { const rm = new G.Mesher(); for (let i = 0; i < 9; i++) { const x = -BW / 2 + 0.09 + i * ((BW - 0.18) / 8); rm.tube([x, y0 + 0.035, frontS - 0.02], [x, y0 + 0.035, frontS + 0.012], 0.0075, { sides: 8, color: G.lin(0x7a4a30) }); rm.tube([x + 0.04, y0 + hS - 0.035, frontS - 0.02], [x + 0.04, y0 + hS - 0.035, frontS + 0.008], 0.005, { sides: 8, color: G.lin(0x7a4a30) }); } rm.mesh(M.solidMat(0xffffff, { roughness: 0.6, metalness: 0.6, vertexColors: true }), sec); }
  // bitumen membrane: base sheet + cap sheet with overlap seam, front edge curled up in a roll
  const yM = y0 + hS + hC + hSc;
  boxAt(-BW / 2, yM, -BD / 2, BW / 2, yM + hM, frontM, bit, sec); boxAt(-BW / 2, yM + hM, -BD / 2, BW * 0.1, yM + hM * 2, frontM - 0.03, bitCap, sec); boxAt(-BW * 0.12, yM + hM, -BD / 2, BW / 2, yM + hM * 2, frontM - 0.03, bitCap, sec);
  { const roll = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, BW * 0.92, 24), bitCap); roll.rotation.z = Math.PI / 2; roll.position.set(0, yM + hM * 2 + 0.03, frontM - 0.03); roll.castShadow = true; sec.add(roll); const seam = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.002, BD * 0.9), M.solidMat(0x121312, { roughness: 0.7 })); seam.position.set(BW * 0.0, yM + hM * 2 + 0.0015, -0.02); sec.add(seam); }
  // protective top: a few clay mosaic tiles rows at the back
  { const tm = new G.Mesher(); for (let i = 0; i < 6; i++) for (let j = 0; j < 3; j++) tm.box(-BW / 2 + 0.1 + i * 0.12, yM + hM * 2 + 0.01, -BD / 2 + 0.08 + j * 0.12, 0.1, 0.02, 0.1, { tile: 0.5, color: G.tintVar(0xb26a45, rr, 0.12, 0.06), uv: [rr(), rr()] }); tm.mesh(M.solidMat(0xffffff, { roughness: 0.4, vertexColors: true }), sec); }
  // water droplets beading on the membrane + a pool at the seam
  R.droplets({ x0: -BW * 0.45, z0: -BD * 0.35, x1: BW * 0.45, z1: frontM - 0.07, y: yM + hM * 2, count: 140, parent: sec, seed: 3, rad: [0.003, 0.011] });
  { const pool = new THREE.Mesh(new THREE.CircleGeometry(0.06, 24), new THREE.MeshPhysicalMaterial({ color: 0x0c0d0d, roughness: 0.02, metalness: 0, clearcoat: 1, envMapIntensity: 3, transparent: true, opacity: 0.8 })); pool.rotation.x = -Math.PI / 2; pool.scale.set(1.6, 1, 1); pool.position.set(-0.35, yM + hM * 2 + 0.003, 0.1); sec.add(pool); }
  // loose membrane roll + torch + bricks bats nearby
  { const g = new THREE.Group(), r1 = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 1.0, 28), bitCap); r1.rotation.z = Math.PI / 2; r1.position.y = 0.14; r1.castShadow = true; g.add(r1); const core = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 1.02, 14), M.solidMat(0xb99a6a, { roughness: 0.8 })); core.rotation.z = Math.PI / 2; core.position.y = 0.14; g.add(core); g.position.set(5.2, 0.0, 2.7); g.rotation.y = 0.35; scene.add(g); }
  L.brickPile({ x: 1.0, z: 3.8, rad: 0.5, h: 0.1, count: 14, seed: 2, parent: scene, broken: 0.5 }); L.bucket({ x: 4.8, y: 0.0, z: 3.6, rad: 0.2, h: 0.3, color: 0x2a2a2a, parent: scene, seed: 6, metal: true, fillColor: 0x1b1b1b, fill: 0.8, drips: false });
  L.ghamela({ x: 5.7, z: 3.3, fill: 0.5, parent: scene, seed: 3, rad: 0.28 });
  // background roofs & trees
  L.neighbourHouse({ x: -22, z: -26, w: 12, d: 12, floors: 3, color: 0xdcd2bb, seed: 3, parent: scene, trim: 0x8a8070, gate: false }); L.neighbourHouse({ x: 4, z: -30, w: 12, d: 12, floors: 3, color: 0xd6cbb2, seed: 5, parent: scene, trim: 0x877c6a, gate: false });
  L.neighbourHouse({ x: 24, z: -26, w: 11, d: 12, floors: 4, color: 0xe3d8c0, seed: 4, parent: scene, trim: 0x8a7f6d, gate: false });
  tree(-8, -12, { h: 9, crown: 4, seed: 4, color: 0x5a7a3a }, scene); tree(14, -14, { h: 10, crown: 4.4, seed: 7, color: 0x587838 }, scene);
  const camera = archCamera({ pos: [0.9, 0.95, 5.6], target: [2.9, 0.75, 1.2], focal: 28, shift: 0.0, w, h });
  return { scene, camera, exposure: 0.62, aoRadius: 0.35, aoStrength: 1.1, grade: { contrast: 1.12, saturation: 1.1, vignette: 0.28, grain: 0.02, warm: 0.035 } };
}
