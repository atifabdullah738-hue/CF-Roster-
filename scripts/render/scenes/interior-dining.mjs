import * as I from '../lib/agent3-interior.mjs';
const { THREE, T, bx, rbox, softBox, buildRoom, gardenView, curtainSet, interiorEnvironment, marbleMat, woodMat, fabricMat, paintMat, rugMat, artMat, glow, point, place, brassMat, blackMetal, ceramicMat, finishScene } = I;
import { setupEnvironment, archCamera } from '../lib/env.mjs';

export default async function build({ renderer, w, h }) {
  const scene = new THREE.Scene();
  const X0 = -3.3, X1 = 3.3, Z0 = -3.5, Z1 = 2.9, H = 3.0;
  const env = setupEnvironment({ renderer, scene, sunElevation: 14, sunAzimuth: 102, turbidity: 4, rayleigh: 1.6, sunIntensity: 10, sunColor: 0xffc690, envIntensity: 0.1, shadowExtent: 8, shadowCenter: [0, 1, -0.5] });
  env.light.shadow.radius = 5;
  interiorEnvironment({ renderer, scene, W: 6.6, H, D: 6.4, wall: 0xb9a98a, floor: 0x5f574d, ceil: 0xe9dfcd, wallLum: 0.4, floorLum: 0.15, ceilLum: 0.6, windows: [{ side: '+x', c: -0.4, w: 2.4, yb: 0.5, yt: 2.6, lum: 4, color: 0xffd6a8 }], lamps: [{ pos: [0, 2.2, -0.7], size: 0.9, lum: 5 }], intensity: 0.7 });

  const floor = marbleMat({ base: 0x8a8174, vein: 0xe0d7c4, veinAlt: 0xb59a62, slab: 0.9, n: 3, seed: 15, contrast: 1.25, freq: 1.0, veinPow: 26, cloud: 0.1, rough: 0.14 });
  const olive = paintMat(0x8a9470, { seed: 5 }), sand = paintMat(0xd9cbb2, { seed: 8 });
  const room = buildRoom(scene, { x0: X0, x1: X1, z0: Z0, z1: Z1, H, mats: { floor, wall: sand, back: olive }, openings: { right: [{ c: -0.4, w: 2.4, y: 0.5, h: 2.1, type: 'window', panels: 2 }] }, ceiling: { tray: true, band: 0.7, drop: 0.18, ledColor: 0xffc27a, ledIntensity: 2.0, glowW: 1.4 }, ceilEmissive: 0.12 });
  gardenView(room, 'right', { dim: 0.5, treeSpec: [[room.frames.right.L * 0.3, -12, 8, 0x4a7f35, 4], [room.frames.right.L * 1.1, -12.5, 9, 0x558a3a, 8]] });
  curtainSet(room.wall.right, { u0: room.uOf('right', -0.4 - 1.2), u1: room.uOf('right', -0.4 + 1.2), yTop: 2.8, zOff: 0.15, drape: fabricMat({ color: 0xd8c9ac, kind: 'linen', tileM: 0.5, seed: 6 }), sheerOpacity: 0.5, stack: 0.75, rodMat: brassMat(0xc2a050, 0.3), seed: 2 });

  const walnut = woodMat({ kind: 'walnut', tileM: 1.2, planks: 4, seed: 24, rough: 0.4 });
  const brassM = brassMat(0xc2a050, 0.26);
  // back wall: mouldings, display cabinet, arch niche
  I.wallMoulding(scene, { x0: -0.2, x1: 3.3, y0: 0.9, y1: 2.8, z: Z0, cols: 2, rows: 1, gap: 0.15, mat: paintMat(0x7a8564, { seed: 11 }), t: 0.025 });
  const dc = I.displayCabinet({ w: 1.7, h: 2.35, d: 0.46, wood: walnut, shelves: 4, seed: 3 }); place(dc, -2.35, Z0 + 0.46); scene.add(dc);
  I.archNiche(scene, { x: 1.3, y0: 0.95, w: 1.1, h: 1.9, z: Z0 + 0.0, depth: 0.2, wallMat: paintMat(0x9aa37f, { seed: 14 }), backMat: paintMat(0xcaa583, { seed: 13 }), wallX0: -0.5, wallX1: 3.3, wallY1: H });
  I.vase(scene, 1.3, 1.0, Z0 + 0.1, { h: 0.5, r: 0.12, type: 'bottle', mat: ceramicMat(0xe9dfcc, 0.25), stems: { n: 6, h: 0.6, leaf: false, color: 0xe5d9bd } });
  I.ringSculpture(scene, 1.0, 1.0, Z0 + 0.1, { s: 0.14 });
  const cons = new THREE.Group(); scene.add(cons);
  I.frontGrid(cons, { x0: 0.5, x1: 2.1, y0: 0.3, y1: 0.82, z: Z0 + 0.4, t: 0.02, cols: [1, 1], mat: walnut, depth: 0.4, carcass: walnut, slot: blackMetal(0x0c0c0c, 0.6) });
  bx(cons, 0.48, 0.82, Z0, 2.12, 0.85, Z0 + 0.43, marbleMat({ base: 0xefe9de, vein: 0x6e675d, slab: 1.0, n: 1, seed: 44, contrast: 1.2 }));
  glow(scene, { kind: 'edge', w: 1.6, h: 0.35, color: 0xffc27a, intensity: 1.0, pos: [1.3, 0.14, Z0 + 0.2], rot: [-Math.PI / 2, 0, 0] });
  I.sconce(scene, { x: 2.7, y: 1.9, z: Z0 + 0.01, lum: 3, wash: 0.35 }); I.sconce(scene, { x: -0.0, y: 1.9, z: Z0 + 0.01, lum: 3, wash: 0.35 });
  // rug, table, chairs
  const rug = rugMat({ kind: 'persian', w: 3.6, d: 2.6, pal: { field: 0x2b3a30, red: 0x8f3b2a, ivory: 0xe6dcc4, gold: 0xc6a05a, teal: 0x5d6a4e, dark: 0x17201a }, seed: 12 });
  const rg = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.014, 2.6), rug); rg.rotation.y = Math.PI / 2; rg.position.set(0, 0.007, -0.4); rg.receiveShadow = true; scene.add(rg);
  rg.scale.set(1, 1, 1);
  const tm = marbleMat({ base: 0xf0ebe0, vein: 0x7b746a, veinAlt: 0xb19552, slab: 1.2, n: 2, seed: 19, contrast: 1.2 });
  const dt = I.diningTable({ w: 2.4, d: 1.05, top: tm, base: walnut }); place(dt, 0, -0.4, Math.PI / 2); scene.add(dt);
  const cf = fabricMat({ color: 0xe6dfd0, kind: 'boucle', tileM: 0.4, seed: 22, sheen: 0.3 });
  const cw = woodMat({ kind: 'walnut', tileM: 0.5, planks: 1, seed: 52, gap: false });
  const seats = [[-0.78, -1.0, Math.PI / 2], [-0.78, -0.4, Math.PI / 2], [-0.78, 0.2, Math.PI / 2], [0.78, -1.0, -Math.PI / 2], [0.78, -0.4, -Math.PI / 2], [0.78, 0.2, -Math.PI / 2], [0, -1.78, 0], [0, 0.98, Math.PI]];
  seats.length = 6;
  seats.slice(0, 8).forEach(([x, z, r], i) => { if (i === 6) return; const c = I.diningChair({ fabric: cf, wood: cw, seed: i }); place(c, x * 1.0 + (x < 0 ? -0.0 : 0.0), z, r); scene.add(c); });
  
  // table settings
  for (const [x, z] of [[-0.35, -0.9], [-0.35, -0.4], [-0.35, 0.1], [0.35, -0.9], [0.35, -0.4], [0.35, 0.1]]) { const pl = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.1, 0.012, 32), ceramicMat(0xf3efe6, 0.1)); pl.position.set(x, 0.766, z); pl.castShadow = true; scene.add(pl); }
  I.vase(scene, 0, 0.76, -0.4, { h: 0.3, r: 0.09, type: 'round', mat: ceramicMat(0x3b4a40, 0.2), stems: { n: 8, h: 0.5, leaf: true } });
  I.tray(scene, 0, 0.76, -0.4 + 0.0, { w: 0.5, d: 0.22, rot: Math.PI / 2 }); I.bowl(scene, 0, 0.78, 0.2, { r: 0.13, mat: brassMat(0xc2a050, 0.3) });
  // fixtures
  scene.add(I.chandelierGlobes({ x: 0, z: -0.4, y: 1.95, ceilY: H, n: 11, r: 0.62, lum: 12, globe: 0.085 }));
  room.downlights([[-2.5, -2.9], [-1.0, -2.9], [0.7, -2.9], [2.2, -2.9], [-2.5, 2.2], [0, 2.2], [2.5, 2.2]]);
  I.pot(scene, -2.9, 1.5, { r: 0.22, h: 0.42, mat: ceramicMat(0x2b2b2b, 0.35), profile: 'round' }); I.treePlant(scene, -2.9, 1.5, { h: 1.7, kind: 'ficus', seed: 10, y0: 0.4, leaves: 34, spread: 0.45, leafLen: 0.3 });
  I.pot(scene, 2.9, -2.9, { r: 0.22, h: 0.44, mat: ceramicMat(0xe4ded0, 0.4) }); I.palmPlant(scene, 2.9, -2.9, { h: 1.4, y0: 0.42, n: 12, seed: 3 });
  I.contactShadow(scene, { x: 0, z: -0.4, w: 2.4, d: 3.6, opacity: 0.4 });
  point(scene, 0, 2.6, 0.8, 0xffe6c4, 1.8, 12, 1.8); point(scene, 0, 2.5, -2.4, 0xffd9a8, 1.8, 12, 1.8); point(scene, -2.6, 2.0, -2.8, 0xffc98a, 1.0, 8, 1.8);
  const camera = archCamera({ pos: [0.3, 1.2, 2.7], target: [0, 1.2, -3.5], focal: 20, shift: 0.07, w, h });
  finishScene(scene, camera);
  return { scene, camera, exposure: 0.85, aoRadius: 0.5, grade: { contrast: 1.1, saturation: 1.05, vignette: 0.26, grain: 0.012, warm: 0.0 } };
}
