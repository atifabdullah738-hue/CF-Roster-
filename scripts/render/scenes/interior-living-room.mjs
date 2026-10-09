import * as I from '../lib/agent3-interior.mjs';
const { THREE, T, bx, bc, rbox, softBox, pillow, buildRoom, gardenView, curtainSet, interiorEnvironment, marbleMat, woodMat, fabricMat, leatherMat, paintMat, rugMat, artMat, glow, point, place, brassMat, blackMetal, ceramicMat, halo, finishScene } = I;
import { setupEnvironment, archCamera } from '../lib/env.mjs';

export default async function build({ renderer, w, h }) {
  const scene = new THREE.Scene();
  const X0 = -3.1, X1 = 3.1, Z0 = -3.6, Z1 = 3.3, H = 3.1;
  const env = setupEnvironment({ renderer, scene, sunElevation: 24, sunAzimuth: 252, turbidity: 2.4, rayleigh: 1.0, sunIntensity: 6.5, sunColor: 0xffe6c8, envIntensity: 0.1, shadowExtent: 8, shadowCenter: [0, 1, -0.5] });
  env.light.shadow.radius = 5;
  interiorEnvironment({ renderer, scene, W: 6.2, H, D: 6.9, wall: 0xe6dfd2, floor: 0xb0a088, ceil: 0xf4efe6, wallLum: 0.62, floorLum: 0.42, ceilLum: 1.0, windows: [{ side: '-x', c: -1.3, w: 3.2, yb: 0.4, yt: 2.7, lum: 6 }], lamps: [{ pos: [-0.2, 2.5, -1], size: 1.0, lum: 4 }], intensity: 0.5 });

  const floor = marbleMat({ base: 0xe8e2d6, vein: 0x8f877b, veinAlt: 0xaf9764, slab: 0.8, n: 3, seed: 5, contrast: 0.95, freq: 1.1, veinPow: 34, cloud: 0.09, rough: 0.2 });
  const wallM = paintMat(0xe9e3d8, { seed: 3 });
  const room = buildRoom(scene, { x0: X0, x1: X1, z0: Z0, z1: Z1, H, mats: { floor, wall: wallM }, openings: { left: [{ c: -1.3, w: 3.2, y: 0.4, h: 2.3, type: 'window', panels: 3 }] }, ceiling: { tray: true, band: 0.85, drop: 0.2, ledColor: 0xffd49a, ledIntensity: 1.3, glowW: 1.2 } });
  gardenView(room, 'left', { dim: 0.55 });
  const wl = room.wall.left, u0 = room.uOf('left', -1.3 + 1.6), u1 = room.uOf('left', -1.3 - 1.6);
  curtainSet(wl, { u0, u1, yTop: 2.88, zOff: 0.16, drape: fabricMat({ color: 0xa08d74, kind: 'linen', tileM: 0.5, seed: 6 }), sheerOpacity: 0.42, stack: 0.8, track: false, rodMat: brassMat(0xc2a050, 0.3), seed: 3 });

  // ---------- TV feature wall (back wall) ----------
  const marble = marbleMat({ base: 0xf0ebe0, vein: 0x6e675d, veinAlt: 0xa98d4f, slab: 1.2, n: 2, seed: 9, contrast: 1.3, freq: 0.8 }); marble.roughness = 0.42; marble.clearcoat = 0.0;
  const walnut = woodMat({ kind: 'walnut', tileM: 1.2, planks: 4, seed: 24, rough: 0.4 });
  const mx0 = -1.2, mx1 = 1.7, zf = Z0;
  bx(scene, mx0, 0.0, zf, mx1, 2.9, zf + 0.03, marble);
  I.flutedPanel(scene, { x0: -2.6, x1: mx0, y0: 0, y1: 2.9, z: zf + 0.012, pitch: 0.055, mat: walnut, backMat: woodMat({ kind: 'dark', tileM: 1, planks: 1, seed: 3, gap: false }) });
  I.flutedPanel(scene, { x0: mx1, x1: 3.1 - 0.3, y0: 0, y1: 2.9, z: zf + 0.012, pitch: 0.055, mat: walnut, backMat: woodMat({ kind: 'dark', tileM: 1, planks: 1, seed: 3, gap: false }) });
  bx(scene, mx0 - 0.012, 0, zf, mx0, 2.9, zf + 0.04, brassMat(0xc2a050, 0.3)); bx(scene, mx1, 0, zf, mx1 + 0.012, 2.9, zf + 0.04, brassMat(0xc2a050, 0.3));
  // glow wash on wall right of panel & left
  glow(scene, { kind: 'edge', w: 2.9, h: 0.5, color: 0xffd49a, intensity: 0.9, pos: [3.1 - 0.15, 1.45, zf + 0.004], rot: [0, 0, Math.PI / 2] });
  // TV
  I.tvSet(scene, { x: 0.25, y: 1.45, z: zf + 0.06, w: 1.7 });
  // floating console
  const cons = new THREE.Group(); scene.add(cons);
  const cwood = woodMat({ kind: 'walnut', tileM: 1.2, planks: 4, seed: 28, rough: 0.35 });
  I.frontGrid(cons, { x0: -1.5, x1: 1.9, y0: 0.32, y1: 0.7, z: zf + 0.34, t: 0.02, cols: [1, 1, 1], mat: cwood, depth: 0.34, carcass: woodMat({ kind: 'walnut', tileM: 1.2, planks: 4, seed: 29, rough: 0.5 }), slot: blackMetal(0x0c0c0c, 0.6) });
  bx(cons, -1.52, 0.7, zf + 0.0, 1.92, 0.73, zf + 0.37, woodMat({ kind: 'walnut', tileM: 1.2, planks: 4, seed: 30, rough: 0.35 }));
  bx(cons, -1.45, 0.28, zf + 0.02, 1.85, 0.3, zf + 0.34, T.emissive(0xffd49a, 3.5), { cast: false });
  glow(scene, { kind: 'edge', w: 3.4, h: 0.4, color: 0xffd49a, intensity: 1.3, pos: [0.2, 0.08, zf + 0.2], rot: [-Math.PI / 2, 0, 0] });
  // decor on console
  I.vase(cons, -1.1, 0.73, zf + 0.2, { h: 0.34, r: 0.09, type: 'bottle', mat: ceramicMat(0x2d4a4a, 0.18), stems: { n: 7, h: 0.55, leaf: true } });
  I.books(cons, -0.55, 0.73, zf + 0.2, { n: 4, seed: 4 }); I.bowl(cons, -0.55, 0.73 + 0.1, zf + 0.2, { r: 0.1 });
  I.ringSculpture(cons, 1.45, 0.73, zf + 0.2, { s: 0.2 });
  I.vase(cons, 1.1, 0.73, zf + 0.2, { h: 0.22, r: 0.07, type: 'gourd', mat: ceramicMat(0xd8cdb8, 0.3) });

  // ---------- right wall: art + slim console ----------
  const art1 = artMat({ kind: 'arches', pal: [0xe8dcc6, 0xb85c3c, 0x2f5d62, 0xc7a14f, 0x1c1c1e], seed: 3, aspect: 0.8 }), art2 = artMat({ kind: 'abstract', pal: [0xe6dbc7, 0x2f5d62, 0xb85c3c, 0xc7a14f, 0x1c1c1e], seed: 5, aspect: 0.8 });
  I.artPanel(scene, { x: X1 - 0.02, y: 1.7, z: -1.9, w: 0.9, h: 1.2, mat: art1, frame: 'brass', rotY: -Math.PI / 2 });
  I.artPanel(scene, { x: X1 - 0.02, y: 1.7, z: -0.55, w: 0.9, h: 1.2, mat: art2, frame: 'brass', rotY: -Math.PI / 2 });

  // right wall console + sconces
  { const rc = new THREE.Group(); place(rc, X1, -1.25, -Math.PI / 2); scene.add(rc);
    I.frontGrid(rc, { x0: -1.2, x1: 1.2, y0: 0.18, y1: 0.7, z: 0.36, t: 0.02, cols: [1, 1, 1, 1], mat: woodMat({ kind: 'walnut', tileM: 1.2, planks: 4, seed: 41, rough: 0.35 }), depth: 0.34, carcass: woodMat({ kind: 'walnut', tileM: 1.2, planks: 4, seed: 29, rough: 0.5 }), slot: blackMetal(0x0c0c0c, 0.6) });
    bx(rc, -1.22, 0.7, 0, 1.22, 0.73, 0.39, marbleMat({ base: 0xefe9de, vein: 0x6e675d, veinAlt: 0xa98d4f, slab: 1.0, n: 1, seed: 44, contrast: 1.2 }));
    bx(rc, -1.15, 0.0, 0.04, -1.1, 0.18, 0.34, brassMat()); bx(rc, 1.1, 0.0, 0.04, 1.15, 0.18, 0.34, brassMat());
    I.vase(rc, -0.9, 0.73, 0.2, { h: 0.22, r: 0.07, type: 'gourd', mat: ceramicMat(0x2f5d62, 0.2) });
    I.vase(rc, 0.7, 0.73, 0.2, { h: 0.3, r: 0.08, type: 'round', mat: ceramicMat(0xd7c9ae, 0.25), stems: { n: 5, h: 0.5, leaf: false, color: 0xe2d6bb } });
    I.books(rc, 0.1, 0.73, 0.2, { n: 3, seed: 15 });
  }
  I.sconce(scene, { x: X1 - 0.01, y: 1.85, z: -2.7, rotY: -Math.PI / 2 }); I.sconce(scene, { x: X1 - 0.01, y: 1.85, z: 0.2, rotY: -Math.PI / 2 });
  // ---------- rug ----------
  const rug = rugMat({ kind: 'persian', w: 2.7, d: 3.7, pal: { field: 0x223250, red: 0x9d3b2b, ivory: 0xe8dec6, gold: 0xc6a05a, teal: 0x2f6c70, dark: 0x131a2c }, seed: 7 });
  const rg = new THREE.Mesh(new THREE.BoxGeometry(2.7, 0.014, 3.7), rug); rg.position.set(-0.35, 0.007, -0.8); rg.receiveShadow = true; scene.add(rg);
  // (BoxGeometry UVs are 0..1 per face: top face carries the full pattern)

  // ---------- seating ----------
  const sofaFab = fabricMat({ color: 0xe3dccd, kind: 'boucle', tileM: 0.45, seed: 11, sheen: 0.3 });
  const teal = fabricMat({ color: 0x2e5a60, kind: 'velvet', tileM: 0.4, seed: 12 }), rust = fabricMat({ color: 0xa4512f, kind: 'velvet', tileM: 0.4, seed: 13 }), mustard = fabricMat({ color: 0xc79a3a, kind: 'linen', tileM: 0.4, seed: 14 }), cream = fabricMat({ color: 0xece3d1, kind: 'linen', tileM: 0.4, seed: 15 });
  const sofa = I.sofaL({ len: 3.1, depth: 0.98, chaise: 1.55, cw: 1.0, side: 'l', fabric: sofaFab, seatN: 2, seed: 3,
    pillows: [{ x: -0.3, z: -0.06, y: 0.68, w: 0.48, h: 0.46, mat: teal, rotZ: 0.1 }, { x: 0.12, z: -0.04, y: 0.68, w: 0.44, h: 0.44, mat: rust, rotZ: -0.12, rotY: 0.2 }, { x: 0.8, z: -0.06, y: 0.68, w: 0.46, h: 0.44, mat: mustard, rotZ: 0.2 }, { x: -1.15, z: 0.0, y: 0.66, w: 0.44, h: 0.42, mat: cream, rotZ: -0.15 }] });
  place(sofa, -1.85, -0.8, Math.PI / 2); scene.add(sofa);
  const chairMat = leatherMat({ color: 0x8c502e, tileM: 0.5 });
  for (const [z, ry] of [[-1.8, -Math.PI / 2 + 0.25], [0.35, -Math.PI / 2 - 0.2]]) { const ac = I.armchair({ fabric: chairMat, seed: 4 }); place(ac, 1.55, z, ry); scene.add(ac); }
  // side table between chairs
  const stable = I.roundTable({ r: 0.26, h: 0.52, top: marbleMat({ base: 0x2b2b2b, vein: 0xb99a5a, slab: 0.6, n: 1, seed: 21, contrast: 1.2 }), legMat: brassMat() }); place(stable, 1.95, -0.7, 0); scene.add(stable);
  const lamp = I.tableLamp({ h: 0.46, kind: 'gourd', baseMat: ceramicMat(0x3b4a4a, 0.18) }); place(lamp, 1.95, -0.7, 0, 0.52); scene.add(lamp);
  // coffee tables
  const ctTop = marbleMat({ base: 0xf2eee5, vein: 0x7d766b, veinAlt: 0xa98d4f, slab: 0.9, n: 1, seed: 31, contrast: 1.2 });
  const ct = I.roundTable({ r: 0.58, h: 0.4, top: ctTop, legMat: brassMat(0xc2a050, 0.22) }); place(ct, -0.4, -0.8, 0); scene.add(ct);
  const ct2 = I.roundTable({ r: 0.32, h: 0.5, top: woodMat({ kind: 'walnut', tileM: 0.6, planks: 1, seed: 33, gap: false }), legMat: brassMat() }); place(ct2, 0.45, 0.1, 0); scene.add(ct2);
  I.tray(scene, -0.4, 0.4, -0.8, { w: 0.42, d: 0.28, rot: 0.3 }); I.books(scene, -0.55, 0.435, -0.8, { n: 3, seed: 8, rot: 0.3 }); I.vase(scene, -0.25, 0.432, -0.75, { h: 0.2, r: 0.05, type: 'cyl', mat: ceramicMat(0xc9b08a, 0.3) });
  I.vase(scene, 0.45, 0.5, 0.1, { h: 0.16, r: 0.05, type: 'gourd', mat: ceramicMat(0x2f5d62, 0.2) });

  // ---------- plants & lamps ----------
  const potW = ceramicMat(0xe4ded0, 0.4), potD = ceramicMat(0x2b2b2b, 0.35);
  I.pot(scene, -2.55, -3.05, { r: 0.24, h: 0.46, mat: potW, profile: 'round' }); I.treePlant(scene, -2.55, -3.05, { h: 1.9, kind: 'ficus', seed: 5, y0: 0.44, leaves: 40, spread: 0.5, leafLen: 0.34 });
  I.pot(scene, 2.55, -3.1, { r: 0.26, h: 0.5, mat: potD, profile: 'round' }); I.monstera(scene, 2.55, -3.1, { h: 0.9, seed: 9, y0: 0.48, n: 10, leafLen: 0.48 });
  I.pot(scene, 2.6, 1.4, { r: 0.2, h: 0.36, mat: potW }); I.snakePlant(scene, 2.6, 1.4, { h: 1.0, y0: 0.34, n: 16, seed: 4 });
  
  // contact shadows
  I.contactShadow(scene, { x: -1.6, z: -0.2, w: 2.2, d: 4.4, opacity: 0.3 });

  // ---------- ceiling fixtures ----------
  room.downlights([[-2.3, -3.0], [-0.8, -3.0], [0.7, -3.0], [2.2, -3.0], [-2.3, 2.5], [-0.8, 2.5], [0.7, 2.5], [2.2, 2.5], [-2.35, -1.0], [2.35, -1.0], [-2.35, 0.8], [2.35, 0.8]]);
  I.chandelierRings(scene, { x: -0.4, z: -0.9, y: 2.35, rings: [0.62, 0.42, 0.24], gap: 0.19, ceilY: H, bulbs: 14, lum: 16, color: 0xffd9a8 });

  // ---------- fill lights ----------
  point(scene, -0.3, 2.7, 1.2, 0xfff0dc, 2.2, 14, 1.8); point(scene, 0.5, 2.6, -2.6, 0xfff0dc, 2.2, 12, 1.8); point(scene, 2.0, 2.5, 0.4, 0xffe0b8, 1.2, 10, 1.8);
  // sun spill bounce on floor
  point(scene, 0.8, 0.8, -0.6, 0xffd9a8, 1.0, 8, 1.8);

  const camera = archCamera({ pos: [0.15, 1.25, 3.15], target: [0, 1.25, -3.5], focal: 21, w, h });
  finishScene(scene, camera);
  return { scene, camera, exposure: 0.42, aoRadius: 0.55, aoStrength: 1.0, grade: { contrast: 1.08, saturation: 1.05, vignette: 0.22, grain: 0.012, warm: 0.0 } };
}
