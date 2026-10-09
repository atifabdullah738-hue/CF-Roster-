import * as I from '../lib/agent3-interior.mjs';
const { THREE, T, bx, rbox, softBox, buildRoom, gardenView, interiorEnvironment, marbleMat, woodMat, fabricMat, paintMat, porcelainMat, glow, point, place, brassMat, blackMetal, ceramicMat, finishScene } = I;
import { setupEnvironment, archCamera } from '../lib/env.mjs';

export default async function build({ renderer, w, h }) {
  const scene = new THREE.Scene();
  const X0 = -2.0, X1 = 2.0, Z0 = -2.5, Z1 = 2.2, H = 2.8;
  const env = setupEnvironment({ renderer, scene, sunElevation: 30, sunAzimuth: 255, turbidity: 3, sunIntensity: 9, sunColor: 0xffecd4, envIntensity: 0.1, shadowExtent: 6, shadowCenter: [0, 1, -0.5] });
  env.light.shadow.radius = 4;
  interiorEnvironment({ renderer, scene, W: 4, H, D: 4.7, wall: 0xd8d0c2, floor: 0xa59d90, ceil: 0xf2eee6, wallLum: 0.5, floorLum: 0.4, ceilLum: 0.8, windows: [{ side: '-x', c: -0.7, w: 1.4, yb: 1.7, yt: 2.5, lum: 5 }], lamps: [{ pos: [-0.5, 1.8, -2.0], size: 0.6, lum: 4 }], intensity: 0.7 });
  const floor = porcelainMat({ color: 0xc8c1b4, grout: 0x9a9386, slab: 0.8, n: 3, seed: 33, rough: 0.16, cloud: 0.1 });
  const wallT = porcelainMat({ color: 0xd9d2c4, grout: 0xa8a194, slab: 0.6, n: 4, seed: 35, rough: 0.2, cloud: 0.08 });
  const room = buildRoom(scene, { x0: X0, x1: X1, z0: Z0, z1: Z1, H, mats: { floor, wall: wallT, skirt: false }, openings: { left: [{ c: -1.0, w: 1.3, y: 1.65, h: 0.8, type: 'window', panels: 2, sill: true }] }, ceiling: { tray: true, band: 0.35, drop: 0.12, ledColor: 0xffd49a, ledIntensity: 1.6, glowW: 0.8 }, ceilEmissive: 0.2 });
  gardenView(room, 'left', { dim: 0.5, depthWall: 14, trees: false, neighbour: false });
  const walnut = woodMat({ kind: 'walnut', tileM: 1.2, planks: 3, seed: 24, rough: 0.35 }), brass = brassMat(0xc2a050, 0.26);
  const green = T.solid(0x45604f, { roughness: 0.18 }); green.userData.tileM = 1; const gc = new THREE.MeshPhysicalMaterial({ color: 0x4a6652, roughness: 0.22, clearcoat: 0.7 }); gc.userData.tileM = 1;
  // feature fluted wall behind vanity
  I.flutedPanel(scene, { x0: -1.9, x1: 0.8, y0: 0, y1: 2.55, z: Z0 + 0.02, pitch: 0.06, mat: gc, backMat: gc });
  bx(scene, -1.9, 2.55, Z0, 0.8, 2.58, Z0 + 0.05, brass);
  // vanity
  const van = I.vanity({ w: 1.3, d: 0.5, wood: walnut, top: marbleMat({ base: 0xf1ede4, vein: 0x6e675d, veinAlt: 0xa98d4f, slab: 1.0, n: 1, seed: 44, contrast: 1.2 }) }); place(van, -0.55, Z0 + 0.25 + 0.04); scene.add(van);
  I.tap(scene, { x: -0.55, y: 0.93, z: Z0 + 0.2, h: 0.28, reach: 0.12 });
  I.roundMirror(scene, { x: -0.55, y: 1.65, z: Z0 + 0.06, r: 0.42 });
  I.sconce(scene, { x: -1.6, y: 1.7, z: Z0 + 0.06, lum: 3, wash: 0.5 }); I.sconce(scene, { x: 0.5, y: 1.7, z: Z0 + 0.06, lum: 3, wash: 0.5 });
  I.vase(scene, -0.95, 0.93, Z0 + 0.15, { h: 0.2, r: 0.045, type: 'cyl', mat: ceramicMat(0xe9e2d2, 0.2) }); I.tray(scene, -0.2, 0.93, Z0 + 0.25, { w: 0.22, d: 0.14 }); I.bowl(scene, -0.2, 0.945, Z0 + 0.25, { r: 0.05, h: 0.03 });
  // shower enclosure (right-back corner)
  const sx0 = 0.75, sz1 = -0.85;
  bx(scene, sx0, 0, Z0, X1, 0.04, sz1, T.solid(0x9a9386, { roughness: 0.3 }));
  I.flutedPanel(scene, { x0: sx0, x1: X1, y0: 0, y1: 2.55, z: Z0 + 0.02, pitch: 0.06, mat: gc, backMat: gc });
  bx(scene, X1 - 0.5, 0.85, Z0 + 0.02, X1 - 0.12, 1.25, Z0 + 0.12, T.solid(0x222222, { roughness: 0.4 }));
  bx(scene, X1 - 0.5, 0.86, Z0 + 0.1, X1 - 0.12, 0.87, Z0 + 0.11, T.emissive(0xffd49a, 3), { cast: false });
  I.rainShower(scene, { x: 1.35, y: 2.35, z: Z0 + 0.5, wallZ: Z0 + 0.03 }); I.showerGlass(scene, { x0: sx0, x1: X1 - 0.0, z0: Z0, z1: sz1, h: 2.2 });
  bx(scene, 1.3, 0.0, Z0 + 0.3, 1.34, 2.1, Z0 + 0.34, blackMetal(0x141414, 0.35));
  // towel rail, stool, plant, toilet
  I.towelRail(scene, { x: 1.88, y: 0.8, z: -0.3, h: 1.1, w: 0.45, towel: fabricMat({ color: 0xe9e2d2, kind: 'linen', tileM: 0.3, seed: 8 }), rotY: -Math.PI / 2 });
  const tl = I.toiletWall(); place(tl, -1.85 + 0.0, -1.2, Math.PI / 2); scene.add(tl);
  const stool = new THREE.Group(); I.cylY(stool, 0, 0, 0, 0.17, 0.17, 0.42, walnut); softBox(stool, 0.32, 0.12, 0.2, fabricMat({ color: 0xf0ebe0, kind: 'linen', tileM: 0.3, seed: 9 }), 0, 0.5, 0, { r: 0.03, seg: [8, 4, 6], wrinkle: 0.01 }); place(stool, 0.35, -1.2); scene.add(stool);
  I.pot(scene, 1.55, 0.2 + 1.1, { r: 0.2, h: 0.4, mat: ceramicMat(0xe9e4d8, 0.35), profile: 'round' }); I.treePlant(scene, 1.55, 1.3, { h: 1.4, kind: 'rubber', seed: 5, y0: 0.38, leaves: 24, spread: 0.35, leafLen: 0.25 });
  I.pot(scene, -1.6, 0.8, { r: 0.15, h: 0.3, mat: ceramicMat(0x2b2b2b, 0.35) }); I.snakePlant(scene, -1.6, 0.8, { h: 0.8, y0: 0.28, n: 12, seed: 3 });
  room.downlights([[-1.2, -1.8], [0.2, -1.8], [-1.2, 0.2], [0.4, 0.2], [1.4, -1.5]], { y: room.dropY });
  point(scene, -0.3, 2.4, -0.5, 0xfff0dc, 1.8, 10, 1.8); point(scene, 0.5, 1.6, -2.1, 0xffe0b8, 0.8, 6, 1.8);
  const camera = archCamera({ pos: [0.4, 1.35, 1.0], target: [-0.2, 1.35, -2.5], focal: 20, w, h });
  finishScene(scene, camera);
  return { scene, camera, exposure: 0.45, aoRadius: 0.4, grade: { contrast: 1.1, saturation: 1.04, vignette: 0.25, grain: 0.012, warm: 0.0 } };
}
