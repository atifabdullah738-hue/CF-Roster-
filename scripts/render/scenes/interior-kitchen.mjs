import * as I from '../lib/agent3-interior.mjs';
const { THREE, T, bx, rbox, softBox, buildRoom, gardenView, curtainSet, interiorEnvironment, marbleMat, woodMat, fabricMat, paintMat, subwayMat, porcelainMat, glow, point, place, brassMat, blackMetal, steelMat, ceramicMat, finishScene } = I;
import { setupEnvironment, archCamera } from '../lib/env.mjs';

export default async function build({ renderer, w, h }) {
  const scene = new THREE.Scene();
  const X0 = -3.4, X1 = 3.4, Z0 = -3.0, Z1 = 3.2, H = 2.9;
  const env = setupEnvironment({ renderer, scene, sunElevation: 21, sunAzimuth: 108, turbidity: 3, rayleigh: 1.2, sunIntensity: 10, sunColor: 0xffe8cc, envIntensity: 0.1, shadowExtent: 8, shadowCenter: [0, 1, -0.5] });
  env.light.shadow.radius = 5;
  interiorEnvironment({ renderer, scene, W: 6.8, H, D: 6.2, wall: 0xe6e0d4, floor: 0xb6ada0, ceil: 0xf4efe6, wallLum: 0.55, floorLum: 0.4, ceilLum: 0.9, windows: [{ side: '+x', c: -0.4, w: 2.4, yb: 0.9, yt: 2.5, lum: 6 }], intensity: 0.7 });
  const floor = porcelainMat({ color: 0xcfc8ba, grout: 0xa39c8e, slab: 0.9, n: 2, seed: 21, rough: 0.2, cloud: 0.1 });
  const room = buildRoom(scene, { x0: X0, x1: X1, z0: Z0, z1: Z1, H, mats: { floor, wall: paintMat(0xece6da, { seed: 3 }) }, openings: { right: [{ c: -0.6, w: 2.4, y: 0.95, h: 1.55, type: 'window', panels: 2 }] }, ceiling: { tray: false }, ceilEmissive: 0.22 });
  gardenView(room, 'right', { dim: 0.5, depthWall: 14, treeSpec: [[room.frames.right.L * 0.3, -17, 8, 0x4a7f35, 4]] });
  curtainSet(room.wall.right, { u0: room.uOf('right', -0.6 - 1.2), u1: room.uOf('right', -0.6 + 1.2), yTop: 2.6, yBot: 0.9, zOff: 0.12, drape: null, sheerOpacity: 0.4, track: true, stack: 0.1, seed: 3 });

  const sage = paintMat(0x667a62, { seed: 6, rough: 0.55, bump: 0.01 }), cream = paintMat(0xebe5d8, { seed: 7, rough: 0.55, bump: 0.01 }), walnut = woodMat({ kind: 'walnut', tileM: 1.2, planks: 3, seed: 24, rough: 0.4 });
  const quartz = marbleMat({ base: 0xf2eee6, vein: 0x8d877d, veinAlt: 0xb59b62, slab: 1.4, n: 2, seed: 27, contrast: 1.0, veinPow: 30, cloud: 0.04, rough: 0.12 });
  const brass = brassMat(0xc2a050, 0.26);
  // back run
  const g = new THREE.Group(); scene.add(g);
  I.baseCabinets(g, { x0: -2.5, x1: 1.6, z: Z0 + 0.6, depth: 0.6, h: 0.9, mat: sage, counter: quartz, cols: [1, 1, 1.2, 1.2, 1, 1], rows: [1, 1.0], slot: true });
  bx(g, -2.5, 0.0, Z0, 1.6, 0.9, Z0 + 0.0, sage);
  // tall units
  I.frontGrid(g, { x0: -3.4, x1: -2.5, y0: 0.0, y1: 2.9, z: Z0 + 0.62, t: 0.02, cols: [1], rows: [2.3, 0.7], matFn: (i, j) => (j === 0 ? steelMat(0xb9bcc0, 0.3) : walnut), depth: 0.62, carcass: walnut });
  bx(g, -3.1, 1.3, Z0 + 0.64, -3.08, 1.9, Z0 + 0.66, steelMat(0x8f9296, 0.25));
  I.frontGrid(g, { x0: 1.6, x1: 2.5, y0: 0.0, y1: 2.9, z: Z0 + 0.62, t: 0.02, cols: [1], rows: [0.8, 1.1, 1.0], matFn: (i, j) => (j === 1 ? blackMetal(0x1a1a1c, 0.3) : walnut), depth: 0.62, carcass: walnut });
  // backsplash + wall cabinets
  const bsM = subwayMat({ color: 0xe9ece4, grout: 0xbab6a8, w: 0.3, h: 0.1, cols: 2, rows: 6, seed: 4, rough: 0.08 });
  bx(g, -2.5, 0.9, Z0, 1.6, 1.55, Z0 + 0.01, bsM);
  I.frontGrid(g, { x0: -2.5, x1: -1.0, y0: 1.55, y1: 2.5, z: Z0 + 0.35, t: 0.02, cols: [1, 1, 1], rows: [1], mat: cream, depth: 0.35, carcass: cream, slot: sage });
  I.frontGrid(g, { x0: 0.4, x1: 1.6, y0: 1.55, y1: 2.5, z: Z0 + 0.35, t: 0.02, cols: [1, 1], rows: [1], mat: cream, depth: 0.35, carcass: cream, slot: sage });
  bx(g, -2.5, 2.5, Z0, 1.6, H, Z0 + 0.36, cream);
  for (const [a, b] of [[-2.5, -1.0], [0.4, 1.6]]) { bx(g, a + 0.03, 1.535, Z0 + 0.04, b - 0.03, 1.55, Z0 + 0.33, T.emissive(0xffd9a0, 4), { cast: false }); glow(g, { kind: 'edge', w: b - a, h: 0.5, color: 0xffd9a0, intensity: 0.8, pos: [(a + b) / 2, 1.3, Z0 + 0.012] }); }
  I.hob(g, { x: -0.5, y: 0.9, z: Z0 + 0.3 }); I.chimneyHood(g, { x: -0.5, y: 1.55, z: Z0 + 0.3, w: 0.9, d: 0.5, top: H, mat: steelMat(0x9ea2a6, 0.3) });
  // sink + tap
  bx(g, -2.0, 0.9, Z0 + 0.12, -1.35, 0.905, Z0 + 0.5, T.solid(0x1b1b1b, { roughness: 0.3, metalness: 0.4 })); I.tap(g, { x: -1.68, y: 0.93, z: Z0 + 0.1 });
  I.vase(g, 0.9, 0.93, Z0 + 0.18, { h: 0.28, r: 0.06, type: 'bottle', mat: ceramicMat(0xd9cdb6, 0.3), stems: { n: 4, h: 0.4, leaf: true } }); I.books(g, 1.2, 0.93, Z0 + 0.3, { n: 3, seed: 7 });
  I.pot(g, 0.1, Z0 + 0.15, { r: 0.07, h: 0.12, mat: ceramicMat(0xe4ded0, 0.4), y: 0.93 }); I.palmPlant(g, 0.1, Z0 + 0.15, { h: 0.35, y0: 1.03, n: 8, seed: 2 });
  // island
  const isl = new THREE.Group(); scene.add(isl);
  I.baseCabinets(isl, { x0: -1.4, x1: 1.4, z: 0.2, depth: 0.95, h: 0.92, mat: woodMat({ kind: 'walnut', tileM: 1.2, planks: 3, seed: 25, rough: 0.4, tone: 1.45 }), counter: quartz, cols: [1, 1, 1, 1], rows: [1], over: 0.3 });
  bx(isl, 1.4, 0, -0.75, 1.43, 0.95, 0.5, quartz); bx(isl, -1.43, 0, -0.75, -1.4, 0.95, 0.5, quartz);
  I.bowl(isl, 0.0, 0.95, 0.0, { r: 0.17, h: 0.09, mat: ceramicMat(0xe9e2d2, 0.2) });
  for (const [x, z, c] of [[-0.05, 0.0, 0xc95a2e], [0.07, 0.04, 0xd9a43a], [0.0, -0.05, 0x6a8f3a]]) { const f = new THREE.Mesh(new THREE.SphereGeometry(0.045, 14, 10), T.solid(c, { roughness: 0.5 })); f.position.set(x, 1.08, z); f.castShadow = true; isl.add(f); }
  I.vase(isl, 1.05, 0.95, -0.2, { h: 0.22, r: 0.06, type: 'cyl', mat: ceramicMat(0x2f3d36, 0.2), stems: { n: 5, h: 0.5, leaf: true } });
  const stool = fabricMat({ color: 0xc9b99a, kind: 'linen', tileM: 0.4, seed: 5 });
  for (const x of [-0.8, 0, 0.8]) { const s = I.barStool({ seat: stool, legs: brass, h: 0.68 }); place(s, x, 0.95); scene.add(s); }
  for (const x of [-0.8, 0, 0.8]) I.pendantDome(scene, { x, z: -0.2, y: H, drop: 0.75, r: 0.2, h: 0.22, shell: brassMat(0xc2a050, 0.3), lum: 7, ceilY: H });
  room.downlights([[-2.5, -1.0], [0.0, -1.0], [2.0, -1.0], [-2.5, 1.5], [0, 2.2], [2.5, 1.5]], { y: H });
  // plants and window
  I.pot(scene, 2.9, 1.4, { r: 0.22, h: 0.4, mat: ceramicMat(0xe4ded0, 0.4), profile: 'round' }); I.treePlant(scene, 2.9, 1.4, { h: 1.5, kind: 'rubber', seed: 4, y0: 0.38, leaves: 26, spread: 0.4, leafLen: 0.26 });
  I.contactShadow(scene, { x: 0, z: 0.3, w: 3.6, d: 2.2, opacity: 0.4 });
  point(scene, 0, 2.6, 1.5, 0xfff0dc, 2.0, 14, 1.8); point(scene, -1, 2.5, -2.0, 0xfff0dc, 1.4, 10, 1.8); point(scene, 2.0, 2.5, 0.5, 0xfff0dc, 1.0, 10, 1.8);
  const camera = archCamera({ pos: [0.2, 1.35, 3.0], target: [0, 1.35, -3.0], focal: 22, w, h });
  finishScene(scene, camera);
  return { scene, camera, exposure: 0.5, aoRadius: 0.5, grade: { contrast: 1.1, saturation: 1.04, vignette: 0.25, grain: 0.012, warm: 0.0 } };
}
