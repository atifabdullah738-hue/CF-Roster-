import * as I from '../lib/agent3-interior.mjs';
const { THREE, T, bx, rbox, softBox, pillow, buildRoom, gardenView, curtainSet, interiorEnvironment, marbleMat, woodMat, fabricMat, paintMat, rugMat, artMat, glow, point, place, brassMat, blackMetal, ceramicMat, finishScene } = I;
import { setupEnvironment, archCamera } from '../lib/env.mjs';

export default async function build({ renderer, w, h }) {
  const scene = new THREE.Scene();
  const X0 = -3.4, X1 = 3.4, Z0 = -3.3, Z1 = 2.9, H = 2.9;
  const env = setupEnvironment({ renderer, scene, sunElevation: 11, sunAzimuth: 262, turbidity: 5, rayleigh: 2.0, mie: 0.01, sunIntensity: 9, sunColor: 0xffb87a, envIntensity: 0.1, shadowExtent: 8, shadowCenter: [0, 1, -0.5] });
  env.light.shadow.radius = 5;
  interiorEnvironment({ renderer, scene, W: 6.8, H, D: 6.2, wall: 0xcfc2ae, floor: 0x9c8466, ceil: 0xe6dccb, wallLum: 0.35, floorLum: 0.25, ceilLum: 0.5, windows: [{ side: '-x', c: -0.5, w: 1.9, yb: 0.6, yt: 2.5, lum: 3.5, color: 0xffc9a0 }], lamps: [{ pos: [-1.6, 0.8, -2.3], size: 0.5, lum: 5 }, { pos: [0.8, 0.8, -2.3], size: 0.5, lum: 5 }], intensity: 0.6 });

  const floor = woodMat({ kind: 'oak', tileM: 1.6, planks: 8, seed: 61, rough: 0.5, clearcoat: 0.15 });
  floor.color.set(0xd8cdbd);
  const wallM = paintMat(0xcdc1ac, { seed: 3 });
  const room = buildRoom(scene, { x0: X0, x1: X1, z0: Z0, z1: Z1, H, mats: { floor, wall: wallM }, openings: { left: [{ c: -2.0, w: 1.9, y: 0.6, h: 1.95, type: 'window', panels: 2 }] }, ceiling: { tray: true, band: 0.65, drop: 0.15, ledColor: 0xffc27a, ledIntensity: 1.6, glowW: 1.2 }, ceilEmissive: 0.15 });
  gardenView(room, 'left', { depthWall: 16, dim: 0.5, trees: true, treeSpec: [[room.frames.left.L * 0.2, -12, 8, 0x4a7f35, 3], [-3, -13, 9, 0x558a3a, 7]] });
  curtainSet(room.wall.left, { u0: room.uOf('left', -2.0 + 0.95), u1: room.uOf('left', -2.0 - 0.95), yTop: 2.7, yBot: 0.02, zOff: 0.15, drape: fabricMat({ color: 0xb9a58a, kind: 'linen', tileM: 0.5, seed: 6 }), sheerOpacity: 0.5, stack: 0.7, rodMat: brassMat(0xc2a050, 0.3), seed: 5 });

  // headboard wall: mouldings
  const sage = fabricMat({ color: 0x8c9a86, kind: 'velvet', tileM: 0.5, seed: 21 });
  I.wallMoulding(scene, { x0: -2.4, x1: 1.6, y0: 0.2, y1: 2.65, z: Z0, cols: 3, rows: 1, gap: 0.16, mat: paintMat(0xd6cbb8, { seed: 9 }) });
  // bed
  const linen = fabricMat({ color: 0xf2eee4, kind: 'linen', tileM: 0.5, seed: 31, sheen: 0.4 }), duvet = fabricMat({ color: 0xf3efe4, kind: 'linen', tileM: 0.5, seed: 32, sheen: 0.4 }), terra = fabricMat({ color: 0xb2623f, kind: 'linen', tileM: 0.4, seed: 33 }), band = fabricMat({ color: 0xcfc4ae, kind: 'linen', tileM: 0.4, seed: 34 }), sageL = fabricMat({ color: 0x7e8d7a, kind: 'linen', tileM: 0.4, seed: 35 });
  const walnut = woodMat({ kind: 'walnut', tileM: 1.2, planks: 4, seed: 24, rough: 0.4 });
  const bd = I.bed({ w: 1.85, l: 2.1, wood: walnut, linen, duvet, band, throwMat: terra, headFab: sage, pillowMat: fabricMat({ color: 0xf6f2ea, kind: 'linen', tileM: 0.4, seed: 36 }), accent: [{ mat: terra, x: -0.45, y: 0.82, z: -0.8, w: 0.5, h: 0.3, rotZ: 0.1 }, { mat: sageL, x: 0.4, y: 0.8, z: -0.78, w: 0.45, h: 0.3, rotZ: -0.08 }], seed: 3 });
  place(bd, -0.5, -2.1); scene.add(bd);
  // nightstands + lamps
  for (const x of [-1.95, 0.95]) {
    const ns = I.nightstand({ wood: walnut, stone: marbleMat({ base: 0xefe9de, vein: 0x6e675d, slab: 0.6, n: 1, seed: 44, contrast: 1.1 }) }); place(ns, x, -2.9); scene.add(ns);
    const lp = I.tableLamp({ h: 0.5, kind: 'gourd', baseMat: ceramicMat(0xd9cdb6, 0.2), lum: 3 }); place(lp, x, -2.92, 0, 0.665); scene.add(lp);
    I.books(scene, x + 0.12, 0.665, -2.82, { n: 2, w: 0.18, d: 0.13, seed: 5 });
    I.sconce(scene, { x, y: 1.75, z: Z0 + 0.01, rotY: 0, lum: 3, wash: 0.5 });
  }
  // rug & bench
  const rug = rugMat({ kind: 'geo', w: 3.4, d: 2.6, pal: { field: 0xd2c9b8, red: 0xb88a6a, ivory: 0xece5d6, gold: 0xb09060, teal: 0x8c9a86 }, seed: 4 });
  const rg = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.014, 2.6), rug); rg.position.set(-0.5, 0.007, -1.2); rg.receiveShadow = true; scene.add(rg);
  const bench = new THREE.Group(); softBox(bench, 1.5, 0.14, 0.46, fabricMat({ color: 0xc9bfa6, kind: 'velvet', tileM: 0.4, seed: 38 }), 0, 0.46, 0, { r: 0.05, bulge: { y: 0.03 }, seg: [20, 5, 8] });
  bx(bench, -0.75, 0.15, -0.22, 0.75, 0.39, 0.22, walnut); for (const sx of [-1, 1]) bx(bench, sx * 0.66 - 0.015, 0, -0.2, sx * 0.66 + 0.015, 0.15, 0.2, brassMat()); 
  // wardrobe wall (back wall right) + continuing on right wall
  I.wardrobeWall(scene, { x0: 1.55, x1: X1, y1: 2.75, z: Z0 + 0.62, cols: 4, wood: woodMat({ kind: 'oak', tileM: 1.2, planks: 2, seed: 71, rough: 0.45 }), fab: fabricMat({ color: 0xcfc4ae, kind: 'linen', tileM: 0.4, seed: 72 }), depth: 0.62 });
  bx(scene, 1.55, 0, Z0, X1, 2.9, Z0 + 0.0, T.solid(0x15110e));
  bx(scene, 1.5, 0, Z0 + 0.0, 1.55, 2.9, Z0 + 0.65, paintMat(0xd6cbb8, { seed: 9 }));
  // plants / decor
  I.pot(scene, -3.0, 0.5, { r: 0.22, h: 0.42, mat: ceramicMat(0xe4ded0, 0.4), profile: 'round' }); I.treePlant(scene, -3.0, 0.5, { h: 1.7, kind: 'ficus', seed: 8, y0: 0.4, leaves: 36, spread: 0.45, leafLen: 0.3 });
  I.pot(scene, 2.9, 1.2, { r: 0.2, h: 0.36, mat: ceramicMat(0x2b2b2b, 0.35) }); I.snakePlant(scene, 2.9, 1.2, { h: 0.95, y0: 0.34, n: 14, seed: 6 });
  const art = artMat({ kind: 'landscape', pal: [0xe9dcc4, 0xb2623f, 0x7e8d7a, 0xd9b27a, 0x2b3a3a], seed: 2, aspect: 2.2 });
  I.artPanel(scene, { x: -0.5, y: 2.3, z: Z0 + 0.03, w: 1.8, h: 0.62, mat: art, frame: 'brass' });
  room.downlights([[-2.6, -2.5], [-0.5, -2.5], [1.6, -2.5], [-2.6, 1.8], [0, 1.8], [2.6, 1.8]], { lum: 8 });
  I.contactShadow(scene, { x: -0.5, z: -2.0, w: 3.3, d: 3.0, opacity: 0.35 });
  point(scene, -0.5, 2.2, 0.8, 0xffe2c0, 1.0, 12, 1.8); point(scene, 1.5, 1.2, -2.0, 0xffc98a, 0.8, 8, 1.8); point(scene, -2.0, 1.2, -2.0, 0xffc98a, 0.8, 8, 1.8);
  const camera = archCamera({ pos: [-0.3, 1.15, 1.6], target: [-0.3, 1.15, -3.3], focal: 22, w, h });
  finishScene(scene, camera);
  return { scene, camera, exposure: 0.6, aoRadius: 0.5, grade: { contrast: 1.08, saturation: 1.05, vignette: 0.28, grain: 0.012, warm: 0.0 } };
}
