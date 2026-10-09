import { crownTree, mound, flowerMass, hedgeRow, cam, skyDome, treeline, THREE, T, bx, ground, cyl, palm, facade, shell, glazing, parapet, slatScreen, downlights, pointLight, room, pillar, gate, roadX, footpath, neighbour, waterTankLite, acCondenser, car, streetLamp, wallStain, pebbles, glass, coat, ledStrip } from '../lib/agent1-kit.mjs';
import { glassRailing, doorUnit } from '../lib/arch.mjs';
import { setupEnvironment } from '../lib/env.mjs';

export default async function build({ renderer, w, h }) {
  const scene = new THREE.Scene();
  const env = setupEnvironment({ renderer, scene, sunElevation: 40, sunAzimuth: 68, turbidity: 3.2, rayleigh: 1.1, mie: 0.006, sunIntensity: 3.7, sunColor: 0xffeccc, envIntensity: 0.28, shadowExtent: 30, shadowCenter: [0, 3, 2] });
  env.sky.visible = false;
  skyDome(scene, { sunElevation: 40, sunAzimuth: 68, zenith: 0x2a6fd0, horizon: 0xdbe7f3, cloudCover: 0.45, cloudScale: 2.4, glow: 0.3, seed: 21, cloudShadow: 0x9fb2cf, cloudBright: 1.4, gain: 3.5 });
  treeline({ scene, z: -90, y: -1, hMax: 28, color: '#718a69', haze: '#d6e2ea', bright: 2.4, seed: 4 });
  scene.fog = new THREE.FogExp2(0xdde6ee, 0.0030);

  const cream = T.plaster(0xe9ddc6, { tileM: 3.5, seed: 5 }), cream2 = T.plaster(0xe3d6bd, { tileM: 3.5, seed: 9 }), char = T.plaster(0x34373b, { tileM: 3, seed: 3, roughness: 0.78 }), char2 = T.plaster(0x40434a, { tileM: 3, seed: 13, roughness: 0.78 });
  const cap = T.concrete(0x4a4c50, { tileM: 2, seed: 41 }), conc = T.concrete(0xaaa8a2, { tileM: 2.5, seed: 77 });
  const woodS = T.wood({ color: 0xa3703f, tileM: 1.4, planks: 6, seed: 61 }), doorM = T.wood({ color: 0x5b3a22, tileM: 1.2, planks: 4, seed: 64 });
  const drive = T.paving({ color: 0x8e8c87, tileM: 2.4, n: 6, seed: 45 }), pave = T.paving({ color: 0xc6c1b6, tileM: 2.4, n: 6, seed: 46 });
  const lawn = T.grass({ color: 0x6a9a42 });
  ground(-160, -90, 160, 90, -0.02, T.solid(0x7c6f5c, { roughness: 1 }), scene);
  const X0 = -5.2, X1 = 5.2, G = 0.4, U = 3.8, RF = 7.1, ZW = 7.0, CZ = 2.3;
  const H = new THREE.Group(); scene.add(H);

  neighbour({ x0: -19, x1: -5.2, zF: -0.6, depth: 14, floors: 2, storeyH: 3.4, wall: 0xcfcabf, accent: 0x5f5a52, seed: 3, zWall: ZW, wallH: 1.7, parent: scene, glow: 0.1 });
  neighbour({ x0: 5.2, x1: 19, zF: 0.8, depth: 14, floors: 2, storeyH: 3.4, wall: 0xbfc4c4, accent: 0x4c5256, seed: 7, zWall: ZW, wallH: 1.6, parent: scene, glow: 0.1 });
  neighbour({ x0: -34, x1: -19, zF: 0.2, depth: 14, floors: 3, storeyH: 3.2, wall: 0xdccfb5, accent: 0x7a5a3c, seed: 9, zWall: ZW, parent: scene });
  neighbour({ x0: 19, x1: 34, zF: -0.4, depth: 14, floors: 2, storeyH: 3.3, wall: 0xcdbfa8, accent: 0x5a6a58, seed: 11, zWall: ZW, parent: scene });

  // ground floor right: entrance + big glazing
  const gx = 1.8, gw = 3.1;
  facade({ x0: -0.8, x1: X1, y0: 0, y1: U - 0.35, z: 0, t: 0.3, mat: cream, openings: [{ x: 0.0, y: G, w: 1.2, h: 2.4 }, { x: gx, y: G, w: gw, h: 2.95 }], parent: H });
  doorUnit({ x: 0.0, y: G, w: 1.2, h: 2.4, z: 0, mat: doorM, recess: 0.2, frame: 0x1b1c1e, handle: 0xc9a85a }, H);
  glazing({ x: gx, y: G, w: gw, h: 2.95, z: 0, cols: 3, frame: 0x16181a, parent: H, reveal: 0.12 });
  room({ x0: gx - 0.4, x1: gx + gw + 0.3, floorY: G, ceilY: U - 0.55, zF: -0.3, depth: 5.2, style: 'living', glow: 0.14, seed: 2, parent: H, wallColor: 0xe0d4bd });
  bx(-0.8, 0, -0.04, X1, G, 0.12, char2, H); // plinth
  shell({ x0: X0, x1: X1, y0: 0, y1: U - 0.35, zF: -0.3, zB: -14, t: 0.25, side: cream2, roofMat: conc, parent: H });
  // porch
  bx(X0, 0, -6.0, -0.8, U - 0.4, -5.8, cream2, H); bx(-0.85, 0, -6.0, -0.8, U - 0.4, 0, char, H);
  ground(X0, -5.8, -0.8, ZW, 0.013, drive, H);
  bx(X0, U - 0.4, -5.8, -0.8, U - 0.34, CZ, woodS, H, { swap: true });
  downlights([[-4.4, 1.6], [-2.6, 1.6], [-1.2, 1.6], [-4.4, -0.8], [-2.6, -0.8], [-1.2, -0.8], [-4.4, -3.2], [-1.2, -3.2]], { y: U - 0.405, intensity: 7, color: 0xffe3b8, parent: H });
  pointLight(scene, 0xffd9a8, 6, -3, 2.9, -1.0, 9, 1.7);
  car({ x: -3.0, z: -2.8, rot: -Math.PI / 2, color: 0x8d9094, type: 'suv', parent: H });
  doorUnit({ x: -2.0, y: G, w: 1.1, h: 2.2, z: -5.8, mat: doorM, recess: 0, frame: 0x1b1c1e }, H);
  // slab edge
  bx(X0 - 0.05, U - 0.35, -0.4, X1 + 0.05, U + 0.0, 0.1, char, H);

  // upper left: cantilevered cream box
  const bL = X0, bR = 0.4;
  facade({ x0: bL, x1: bR, y0: U, y1: RF, z: CZ, t: 0.3, mat: cream, openings: [{ x: -4.45, y: U + 0.5, w: 3.5, h: 2.35 }], parent: H });
  bx(bL, U - 0.4, -14, bR, RF, CZ - 5.4, cream2, H);
  glazing({ x: -4.45, y: U + 0.5, w: 3.5, h: 2.35, z: CZ, cols: 3, frame: 0x16181a, parent: H, reveal: 0.15 });
  room({ x0: -4.7, x1: -0.7, floorY: U, ceilY: U + 3.05, zF: CZ - 0.3, depth: 5.0, style: 'bed', glow: 0.14, seed: 4, parent: H });
  bx(bL, U - 0.4, CZ - 5.4, bL + 0.25, RF, CZ - 0.3, cream2, H); bx(bR - 0.25, U - 0.4, CZ - 5.4, bR, RF, CZ - 0.3, cream2, H);
  bx(bL, U - 0.4, CZ - 5.4, bR, U, CZ - 0.3, cream2, H);
  // charcoal frame around window (projecting)
  bx(-4.62, U + 2.85, CZ, -0.78, U + 3.1, CZ + 0.28, char, H); bx(-4.62, U + 0.3, CZ, -0.78, U + 0.5, CZ + 0.28, char, H);
  bx(-4.62, U + 0.5, CZ, -4.45, U + 2.85, CZ + 0.28, char, H); bx(-0.95, U + 0.5, CZ, -0.78, U + 2.85, CZ + 0.28, char, H);
  bx(bL, U - 0.4, CZ - 0.02, bR, U - 0.2, CZ + 0.14, char2, H);
  bx(bL - 0.05, RF - 0.2, -14, bR + 0.05, RF + 0.08, CZ + 0.25, cap, H);
  // upper right: balcony
  facade({ x0: bR, x1: X1, y0: U, y1: RF, z: 0, t: 0.3, mat: cream, openings: [{ x: 1.0, y: U + 0.2, w: 3.7, h: 2.7 }], parent: H });
  bx(bR, U - 0.4, -14, X1, RF, -5.2, cream2, H);
  glazing({ x: 1.0, y: U + 0.2, w: 3.7, h: 2.7, z: 0, cols: 3, frame: 0x16181a, parent: H, reveal: 0.12 });
  room({ x0: 0.7, x1: 5.0, floorY: U, ceilY: U + 3.05, zF: -0.3, depth: 4.8, style: 'lounge', glow: 0.14, seed: 6, parent: H, wallColor: 0xddd0b8 });
  bx(bR, U - 0.4, -5.2, bR + 0.25, RF, -0.3, cream2, H); bx(X1 - 0.25, U - 0.4, -5.2, X1, RF, -0.3, cream2, H); bx(bR, U - 0.4, -5.2, X1, U, -0.3, cream2, H);
  bx(bR, U - 0.4, -0.02, X1, U + 0.12, 1.6, char, H); // balcony slab
  glassRailing({ x0: bR + 0.05, x1: X1 - 0.05, y: U + 0.12, z0: 1.5, z1: 1.5, h: 1.05, parent: H });
  glassRailing({ x0: bR + 0.05, x1: bR + 0.05, y: U + 0.12, z0: 0, z1: 1.5, h: 1.05, parent: H });
  bx(bR, U + 2.95, -0.02, X1, U + 3.2, 1.6, char, H); bx(bR, U + 3.2, -0.02, X1, RF, 0.0, cream, H);
  bx(bR + 0.05, U + 0.12, 0.5, bR + 0.5, U + 0.62, 1.4, char2, H); mound(bR + 0.28, U + 0.6, 0.95, 0.28, H, { seed: 2 });
  acCondenser(4.4, U + 0.12, -0.0, H);
  ledStrip(bR, U + 2.9, 1.52, X1, U + 2.95, 1.6, { color: 0xffe0b0, intensity: 5, parent: H });
  // charcoal vertical fin
  bx(bR - 0.02, U - 0.4, CZ - 1.2, bR + 0.34, RF + 0.1, CZ + 0.2, char, H);
  // roof
  parapet({ x0: X0, x1: X1, zF: 0, zB: -14, y: RF, h: 0.95, t: 0.22, mat: cream, cap, parent: H });
  bx(X0, RF - 0.2, -14, X1, RF, 0, conc, H);
  ground(X0 + 0.22, -13.8, X1 - 0.22, -0.22, RF + 0.005, T.concrete(0x9d9b95, { tileM: 2, seed: 60 }), H);
  waterTankLite(3.2, RF, -3.0, H); waterTankLite(4.3, RF, -3.8, H, { r: 0.5, h: 1.0 });
  wallStain({ x0: bR, x1: X1, y0: U + 3.25, y1: RF, z: 0, seed: 3, alpha: 0.1, parent: H });
  wallStain({ x0: bL, x1: bR, y0: U, y1: RF, z: CZ, seed: 8, alpha: 0.1, parent: H });

  // boundary & gate & garden
  pillar({ x: -5.0, z: ZW, w: 0.55, h: 2.1, mat: char, cap, lampI: 7, parent: scene }); pillar({ x: -0.9, z: ZW, w: 0.55, h: 2.1, mat: char, cap, lampI: 7, parent: scene });
  gate({ x0: -4.7, x1: -3.2, z: ZW, y1: 1.95, mats: [T.solid(0x2a2d31, { roughness: 0.5, metalness: 0.5 })], vertical: true, slat: 0.07, gap: 0.05, parent: scene, leaves: 2 });
  bx(-0.6, 0, ZW - 0.12, X1, 1.1, ZW + 0.12, cream, scene); bx(-0.65, 1.1, ZW - 0.16, X1 + 0.02, 1.17, ZW + 0.16, cap, scene);
  bx(-0.6, 0.0, ZW + 0.12, 3.0, 0.6, ZW + 0.2, T.stone({ color: 0x8e8578, tileM: 2.2, seed: 33 }), scene);
  bx(1.0, 0, ZW - 0.1, 2.0, 1.1, ZW + 0.1, T.solid(0x2a2d31, { roughness: 0.5 }), scene); // ped gate
  ground(-0.6, 0.2, X1, ZW - 0.12, 0.012, lawn, scene); ground(0.0, 0.2, 1.4, ZW, 0.016, pave, scene);
  mound(-0.2, 0, 2.2, 0.5, scene, { seed: 3 }); mound(3.2, 0, 1.0, 0.55, scene, { seed: 4, tint: 0xe6ffd0 }); mound(4.6, 0, 2.4, 0.45, scene, { seed: 5 });
  flowerMass({ x0: 3.2, x1: 5.0, y0: 1.5, y1: 2.0, z: ZW, depth: 0.5, seed: 12, parent: scene });
  crownTree(7.0, 1.0, { h: 4.0, crown: 1.6, kind: 'neem', seed: 17, trunkR: 0.08 }, scene);
  ground(0, ZW, 0.2, ZW + 0.1, 0.012, pave, scene);

  const FP0 = ZW + 0.14, ROAD0 = 9.2;
  footpath({ x0: -70, x1: 70, z0: FP0, z1: ROAD0, y: 0.1, mat: pave, parent: scene });
  roadX({ x0: -70, x1: 70, zN: ROAD0, zF: 17, seed: 9, parent: scene });
  footpath({ x0: -70, x1: 70, z0: 17, z1: 21, y: 0.12, mat: pave, parent: scene });
  crownTree(-11, 8.2, { h: 9, crown: 3.3, kind: 'umbrella', seed: 51, lean: -0.3 }, scene);
  crownTree(12, 8.2, { h: 9.5, crown: 3.2, kind: 'neem', seed: 53 }, scene);
  crownTree(-24, 8.2, { h: 8.5, crown: 3.2, kind: 'tall', seed: 55 }, scene); crownTree(26, 8.2, { h: 9, crown: 3.2, kind: 'umbrella', seed: 57 }, scene);
  crownTree(-7, -19, { h: 13, crown: 5.4, kind: 'neem', seed: 61 }, scene); crownTree(8, -20, { h: 13, crown: 5.4, kind: 'umbrella', seed: 62 }, scene);
  streetLamp({ x: 8.5, z: 9.0, h: 7.5, arm: -1.7, dir: -1, parent: scene });
  car({ x: 12, z: 14.5, rot: Math.PI, color: 0xe6e6e4, type: 'sedan', parent: scene });

  const camera = cam({ pos: [2.0, 1.7, 20.0], target: [0, 1.7, 0], focal: 36, shift: 0.2, w, h });
  return { scene, camera, exposure: 0.4, aoRadius: 0.8, aoStrength: 1.0, grade: { contrast: 1.15, saturation: 1.12, vignette: 0.22, grain: 0.015, warm: 0.04 } };
}
