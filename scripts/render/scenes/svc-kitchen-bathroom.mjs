import * as I from '../lib/agent3-interior.mjs';
const { THREE, T, bx, rbox, softBox, buildRoom, gardenView, curtainSet, interiorEnvironment, marbleMat, woodMat, fabricMat, paintMat, subwayMat, porcelainMat, glow, point, place, brassMat, blackMetal, steelMat, ceramicMat, finishScene } = I;
import { setupEnvironment, archCamera } from '../lib/env.mjs';

export default async function build({ renderer, w, h }) {
  const scene = new THREE.Scene();
  const X0 = -2.8, X1 = 2.4, Z0 = -3.0, Z1 = 2.8, H = 2.8;
  const env = setupEnvironment({ renderer, scene, sunElevation: 24, sunAzimuth: 255, turbidity: 3, sunIntensity: 10, sunColor: 0xffe8cc, envIntensity: 0.1, shadowExtent: 8, shadowCenter: [0, 1, -1.5] });
  env.light.shadow.radius = 5;
  interiorEnvironment({ renderer, scene, W: 5.2, H, D: 5.8, wall: 0xe6e0d4, floor: 0xb6ada0, ceil: 0xf4efe6, wallLum: 0.55, floorLum: 0.4, ceilLum: 0.9, windows: [{ side: '-x', c: 0.3, w: 2.0, yb: 0.9, yt: 2.5, lum: 6 }], intensity: 0.75 });
  const floor = porcelainMat({ color: 0xcfc8ba, grout: 0xa39c8e, slab: 0.9, n: 2, seed: 21, rough: 0.2, cloud: 0.1 });
  const room = buildRoom(scene, { x0: X0, x1: X1, z0: Z0, z1: Z1, H, mats: { floor, wall: paintMat(0xece6da, { seed: 3 }) }, openings: { left: [{ c: 0.3, w: 2.0, y: 0.95, h: 1.55, type: 'window', panels: 2 }], back: [{ c: 1.35, w: 0.95, y: 0, h: 2.1, type: 'void' }] }, ceiling: { tray: false }, ceilEmissive: 0.22 });
  gardenView(room, 'left', { dim: 0.5, depthWall: 14, trees: false });
  curtainSet(room.wall.left, { u0: room.uOf('left', 0.3 + 1.0), u1: room.uOf('left', 0.3 - 1.0), yTop: 2.6, yBot: 0.9, zOff: 0.12, drape: null, sheerOpacity: 0.4, track: true, stack: 0.1, seed: 3 });
  const sage = paintMat(0x667a62, { seed: 6, rough: 0.55, bump: 0.01 }), cream = paintMat(0xebe5d8, { seed: 7, rough: 0.55, bump: 0.01 }), walnut = woodMat({ kind: 'walnut', tileM: 1.2, planks: 3, seed: 24, rough: 0.4 });
  const quartz = marbleMat({ base: 0xf2eee6, vein: 0x8d877d, veinAlt: 0xb59b62, slab: 1.4, n: 2, seed: 27, contrast: 1.0, veinPow: 30, cloud: 0.04, rough: 0.12 });
  const g = new THREE.Group(); scene.add(g);
  // back run (left of doorway)
  I.baseCabinets(g, { x0: -2.8, x1: 0.85, z: Z0 + 0.6, depth: 0.6, h: 0.9, mat: sage, counter: quartz, cols: [1, 1, 1.2, 1.2, 1], rows: [1, 1], slot: true });
  const bs = subwayMat({ color: 0xe9ece4, grout: 0xbab6a8, w: 0.3, h: 0.1, cols: 2, rows: 6, seed: 4, rough: 0.08 });
  bx(g, -2.8, 0.9, Z0, 0.85, 1.55, Z0 + 0.012, bs);
  I.frontGrid(g, { x0: -2.8, x1: -1.1, y0: 1.55, y1: 2.5, z: Z0 + 0.35, t: 0.02, cols: [1, 1, 1], rows: [1], mat: cream, depth: 0.35, carcass: cream, slot: sage });
  bx(g, -2.8, 1.535, Z0 + 0.04, -1.1, 1.55, Z0 + 0.33, T.emissive(0xffd9a0, 4), { cast: false }); glow(g, { kind: 'edge', w: 1.7, h: 0.5, color: 0xffd9a0, intensity: 0.8, pos: [-1.95, 1.3, Z0 + 0.014] });
  I.hob(g, { x: -0.3, y: 0.9, z: Z0 + 0.3 }); I.chimneyHood(g, { x: -0.3, y: 1.55, z: Z0 + 0.3, w: 0.9, d: 0.5, top: H, mat: steelMat(0x9ea2a6, 0.3) });
  I.tap(g, { x: -1.8, y: 0.93, z: Z0 + 0.12 }); bx(g, -2.1, 0.9, Z0 + 0.12, -1.5, 0.905, Z0 + 0.5, T.solid(0x1b1b1b, { roughness: 0.3, metalness: 0.4 }));
  I.vase(g, 0.6, 0.93, Z0 + 0.2, { h: 0.26, r: 0.06, type: 'bottle', mat: ceramicMat(0xd9cdb6, 0.3), stems: { n: 4, h: 0.4, leaf: true } });
  // peninsula counter in foreground (marble top, tiled front)
  const pn = new THREE.Group(); scene.add(pn);
  I.baseCabinets(pn, { x0: -2.8, x1: 0.2, z: 1.0, depth: 0.9, h: 0.92, mat: walnut, counter: quartz, cols: [1, 1, 1], rows: [1], over: 0.28 });
  I.bowl(pn, -1.4, 0.95, 0.75, { r: 0.18, h: 0.09, mat: ceramicMat(0xe9e2d2, 0.2) });
  for (const [x, z, c] of [[-1.45, 0.75, 0xc95a2e], [-1.35, 0.78, 0xd9a43a], [-1.4, 0.7, 0x6a8f3a]]) { const f = new THREE.Mesh(new THREE.SphereGeometry(0.045, 14, 10), T.solid(c, { roughness: 0.5 })); f.position.set(x, 1.08, z); f.castShadow = true; pn.add(f); }
  I.tray(pn, -0.5, 0.95, 0.7, { w: 0.4, d: 0.26, rot: 0.2 }); I.books(pn, -0.5, 0.965, 0.7, { n: 2, seed: 3, w: 0.2, d: 0.14 });
  const stool = fabricMat({ color: 0xc9b99a, kind: 'linen', tileM: 0.4, seed: 5 });
  for (const x of [-2.2, -1.4, -0.6]) { const s = I.barStool({ seat: stool, legs: brassMat(), h: 0.68 }); place(s, x, 1.55); scene.add(s); }
  // ---- bathroom glimpsed through the doorway (z < Z0)
  const bz1 = Z0 - 0.5, bz0 = bz1 - 3.0;
  const bath = buildRoom(scene, { x0: 0.2, x1: 2.6, z0: bz0, z1: bz1, H: 2.7, mats: { floor: porcelainMat({ color: 0xc8c1b4, grout: 0x9a9386, slab: 0.8, n: 3, seed: 33, rough: 0.16 }), wall: porcelainMat({ color: 0xd9d2c4, grout: 0xa8a194, slab: 0.6, n: 4, seed: 35, rough: 0.2 }), skirt: false }, openings: { front: [{ c: 1.35, w: 0.95, y: 0, h: 2.1, type: 'void' }] }, ceiling: { tray: false }, ceilEmissive: 0.3 });
  const gc = new THREE.MeshPhysicalMaterial({ color: 0x4a6652, roughness: 0.22, clearcoat: 0.7 }); gc.userData.tileM = 1;
  I.flutedPanel(scene, { x0: 0.2, x1: 2.6, y0: 0, y1: 2.5, z: bz0 + 0.02, pitch: 0.06, mat: gc, backMat: gc });
  const van = I.vanity({ w: 1.2, d: 0.48, wood: walnut, top: marbleMat({ base: 0xf1ede4, vein: 0x6e675d, veinAlt: 0xa98d4f, slab: 1.0, n: 1, seed: 44, contrast: 1.2 }) }); place(van, 1.4, bz0 + 0.27); scene.add(van);
  I.tap(scene, { x: 1.4, y: 0.93, z: bz0 + 0.2, h: 0.28, reach: 0.12 }); I.roundMirror(scene, { x: 1.4, y: 1.65, z: bz0 + 0.07, r: 0.42 });
  I.towelRail(scene, { x: 2.5, y: 0.8, z: bz0 + 1.2, h: 1.1, w: 0.45, towel: fabricMat({ color: 0xe9e2d2, kind: 'linen', tileM: 0.3, seed: 8 }), rotY: -Math.PI / 2 });
  bath.downlights([[1.0, bz0 + 0.8], [1.8, bz0 + 1.6], [1.3, bz0 + 2.3]], { y: 2.7 }); point(scene, 1.3, 2.3, bz0 + 1.5, 0xffeed8, 2.2, 8, 1.8); point(scene, 1.4, 1.65, bz0 + 0.6, 0xffe0b8, 1.0, 5, 1.8);
  // kitchen fixtures
  I.pendantDome(scene, { x: -1.6, z: 0.3, y: H, drop: 1.0, r: 0.2, h: 0.22, shell: brassMat(0xc2a050, 0.3), lum: 7, ceilY: H }); I.pendantDome(scene, { x: -0.8, z: 0.3, y: H, drop: 1.0, r: 0.2, h: 0.22, shell: brassMat(0xc2a050, 0.3), lum: 7, ceilY: H });
  room.downlights([[-2.0, -1.0], [-0.5, -1.0], [-2.0, 1.8], [0.8, 1.2]], { y: H });
  I.pot(scene, 2.0, 1.8, { r: 0.2, h: 0.38, mat: ceramicMat(0xe4ded0, 0.4), profile: 'round' }); I.treePlant(scene, 2.0, 1.8, { h: 1.4, kind: 'rubber', seed: 4, y0: 0.36, leaves: 24, spread: 0.35, leafLen: 0.25 });
  point(scene, 0, 2.5, 1.5, 0xfff0dc, 2.0, 14, 1.8); point(scene, -1.2, 2.4, -1.5, 0xfff0dc, 1.4, 10, 1.8);
  const camera = archCamera({ pos: [-1.0, 1.2, 2.4], target: [0.9, 1.2, -3.0], focal: 22, w, h });
  finishScene(scene, camera);
  return { scene, camera, exposure: 0.62, aoRadius: 0.5, grade: { contrast: 1.1, saturation: 1.04, vignette: 0.25, grain: 0.012, warm: 0.0 } };
}
