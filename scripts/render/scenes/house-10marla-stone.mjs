import { crownTree, mound, flowerMass, hedgeRow, cam, skyDome, treeline, THREE, T, bx, ground, cyl, palm, facade, shell, glazing, parapet, slatScreen, downlights, pointLight, room, pillar, gate, roadX, footpath, neighbour, waterTankLite, acCondenser, car, streetLamp, wallStain, pebbles, glass, coat, ledStrip } from '../lib/agent1-kit.mjs';
import { glassRailing, doorUnit } from '../lib/arch.mjs';
import { setupEnvironment } from '../lib/env.mjs';

export default async function build({ renderer, w, h }) {
  const scene = new THREE.Scene();
  const env = setupEnvironment({ renderer, scene, sunElevation: 20, sunAzimuth: 318, turbidity: 4.5, rayleigh: 1.2, mie: 0.01, sunIntensity: 3.3, sunColor: 0xffd9b0, envIntensity: 0.34, shadowExtent: 32, shadowCenter: [0, 3, 3] });
  env.sky.visible = false;
  skyDome(scene, { sunElevation: 20, sunAzimuth: 318, zenith: 0x4a84cc, horizon: 0xf0e6d8, cloudCover: 0.5, cloudScale: 2.0, glow: 0.45, seed: 31, cloudShadow: 0xb5b4c4, cloudBright: 1.3, cloudTint: 0xfff0e0, gain: 3.5, haze: 0.1 });
  treeline({ scene, z: -90, y: -1, hMax: 30, color: '#7c8d6c', haze: '#e6e0d6', bright: 2.5, seed: 6 });
  scene.fog = new THREE.FogExp2(0xe8e2d8, 0.0036);

  const sA = T.stone({ color: 0xbfae93, tileM: 2.0, seed: 22, rows: 13 }), sB = T.stone({ color: 0xa89a82, tileM: 2.4, seed: 25, rows: 15 }), sC = T.stone({ color: 0xcdbfa8, tileM: 1.8, seed: 29, rows: 11 });
  const white = T.plaster(0xe8e4db, { tileM: 3.5, seed: 5 }), white2 = T.plaster(0xe0dcd1, { tileM: 3.5, seed: 9 }), brz = T.plaster(0x3b3a38, { tileM: 3, seed: 3, roughness: 0.75 });
  const cap = T.concrete(0xb9b6ae, { tileM: 2, seed: 41 }), conc = T.concrete(0xa7a59f, { tileM: 2.5, seed: 77 });
  const woodS = T.wood({ color: 0x9a6a3c, tileM: 1.4, planks: 6, seed: 61 }), doorM = T.wood({ color: 0x5b3a22, tileM: 1.2, planks: 4, seed: 64 });
  const drive = T.paving({ color: 0x9d9a93, tileM: 2.4, n: 6, seed: 45 }), pave = T.paving({ color: 0xc9c3b6, tileM: 2.4, n: 6, seed: 46 });
  const lawn = T.grass({ color: 0x6f9f45 });
  ground(-160, -90, 160, 90, -0.02, T.solid(0x7c6f5c, { roughness: 1 }), scene);
  const X0 = -5.8, X1 = 5.8, G = 0.4, U = 3.8, RF = 7.2, ZW = 9.0;
  const H = new THREE.Group(); scene.add(H);

  neighbour({ x0: -20, x1: -5.8, zF: -0.8, depth: 14, floors: 2, storeyH: 3.4, wall: 0xd6cdbb, accent: 0x6a5a48, seed: 3, zWall: ZW, wallH: 1.7, parent: scene, glow: 0.08 });
  neighbour({ x0: 5.8, x1: 20, zF: 0.6, depth: 14, floors: 2, storeyH: 3.4, wall: 0xc2c6c8, accent: 0x474c52, seed: 7, zWall: ZW, wallH: 1.6, parent: scene, glow: 0.08 });
  neighbour({ x0: -36, x1: -20, zF: 0.2, depth: 14, floors: 3, storeyH: 3.2, wall: 0xe3d9c6, accent: 0x7b5a3c, seed: 9, zWall: ZW, parent: scene });
  neighbour({ x0: 20, x1: 36, zF: -0.4, depth: 14, floors: 2, storeyH: 3.3, wall: 0xcfc3b0, accent: 0x5a6a58, seed: 11, zWall: ZW, parent: scene });

  const EZ = -1.6; // entrance recess plane
  // left stone wing (both storeys)
  facade({ x0: X0, x1: -1.8, y0: 0, y1: RF, z: 0, t: 0.3, mat: sA, openings: [{ x: -4.6, y: G + 0.9, w: 1.4, h: 1.8 }, { x: -4.9, y: U + 0.7, w: 2.2, h: 1.7 }], parent: H });
  shell({ x0: X0, x1: -1.8, y0: 0, y1: RF, zF: -0.3, zB: -14, t: 0.25, side: white2, roofMat: conc, parent: H });
  glazing({ x: -4.6, y: G + 0.9, w: 1.4, h: 1.8, z: 0, cols: 2, frame: 0x1b1a19, parent: H, reveal: 0.15 });
  glazing({ x: -4.9, y: U + 0.7, w: 2.2, h: 1.7, z: 0, cols: 2, frame: 0x1b1a19, parent: H, reveal: 0.15 });
  room({ x0: -4.9, x1: -3.0, floorY: G, ceilY: U - 0.5, zF: -0.3, depth: 4.5, style: 'lib', glow: 0.14, seed: 2, parent: H });
  room({ x0: -5.1, x1: -2.5, floorY: U, ceilY: U + 3.1, zF: -0.3, depth: 4.5, style: 'bed', glow: 0.14, seed: 4, parent: H });
  bx(X0 - 0.02, 0, -0.1, -1.78, G, 0.16, sB, H);
  bx(X0 - 0.05, U - 0.3, -0.3, -1.75, U - 0.1, 0.08, brz, H);
  // stone piers framing the entrance + double height glazing
  bx(-1.8, 0, EZ - 0.3, -0.9, RF + 0.5, 0.45, sB, H); bx(2.5, 0, EZ - 0.3, 3.4, RF + 0.5, 0.45, sB, H);
  facade({ x0: -0.9, x1: 2.5, y0: 0, y1: RF + 0.5, z: EZ, t: 0.3, mat: brz, openings: [{ x: -0.7, y: G, w: 3.0, h: 6.5 }], parent: H });
  glazing({ x: -0.7, y: G, w: 3.0, h: 6.5, z: EZ, cols: 4, rows: 3, rowH: [0.12, 0.38, 0.5], frame: 0x1b1a19, parent: H, reveal: 0.12, colW: [0.25, 0.25, 0.25, 0.25] });
  room({ x0: -1.4, x1: 3.0, floorY: G, ceilY: G + 6.4, zF: EZ - 0.3, depth: 6.5, style: 'void', glow: 0.14, seed: 6, parent: H, wallColor: 0xe6dac4, curtains: false });
  bx(-0.8, 0, EZ + 0.0, 2.4, G, 4.0, sC, H); bx(-0.8, 0, 4.0, 2.4, G - 0.1, 4.0, sC, H); // porch step
  doorUnit({ x: 0.6, y: G, w: 1.1, h: 2.4, z: EZ - 0.15, mat: doorM, recess: 0, frame: 0x1b1a19, handle: 0xc9a85a }, scene);
  // canopy
  bx(-1.8, 3.45, EZ - 0.3, 3.4, 3.7, 2.4, white, H); downlights([[-0.9, 0.2], [0.4, 0.2], [1.7, 0.2], [2.8, 0.2], [-0.9, 1.6], [0.4, 1.6], [1.7, 1.6], [2.8, 1.6]], { y: 3.45, intensity: 7, color: 0xffe3b8, parent: H });
  pointLight(scene, 0xffd9a8, 5, 0.8, 3.2, 1.2, 7, 1.7);
  bx(-1.8, RF + 0.5, EZ - 0.5, 3.4, RF + 0.7, 0.8, cap, H);
  // right wing: white lower, stone upper cantilever
  facade({ x0: 3.4, x1: X1, y0: 0, y1: U - 0.3, z: 0, t: 0.3, mat: white, openings: [{ x: 3.9, y: G + 0.3, w: 1.5, h: 2.2 }], parent: H });
  glazing({ x: 3.9, y: G + 0.3, w: 1.5, h: 2.2, z: 0, cols: 2, frame: 0x1b1a19, parent: H, reveal: 0.12 });
  room({ x0: 3.6, x1: 5.6, floorY: G, ceilY: U - 0.6, zF: -0.3, depth: 4.5, style: 'dining', glow: 0.14, seed: 8, parent: H });
  shell({ x0: 3.4, x1: X1, y0: 0, y1: U - 0.3, zF: -0.3, zB: -14, t: 0.25, side: white2, roofMat: conc, parent: H });
  facade({ x0: 3.4, x1: X1, y0: U - 0.3, y1: RF, z: 0.9, t: 0.3, mat: sA, openings: [{ x: 3.9, y: U + 0.7, w: 1.9, h: 1.7 }], parent: H });
  glazing({ x: 3.9, y: U + 0.7, w: 1.9, h: 1.7, z: 0.9, cols: 2, frame: 0x1b1a19, parent: H, reveal: 0.15 });
  room({ x0: 3.6, x1: 5.6, floorY: U, ceilY: U + 3.0, zF: 0.6, depth: 4.6, style: 'living', glow: 0.14, seed: 9, parent: H });
  bx(3.4, U - 0.3, -14, X1, RF, 0.6 - 4.8, white2, H); bx(3.4, U - 0.3, 0.6 - 4.8, 3.65, RF, 0.6, white2, H); bx(X1 - 0.25, U - 0.3, 0.6 - 4.8, X1, RF, 0.6, white2, H);
  bx(3.4, U - 0.3, -0.3, X1, U - 0.1, 0.9, brz, H);
  bx(3.3, RF, -14, X1 + 0.05, RF + 0.22, 1.2, cap, H);
  // left wing parapet/cap
  bx(X0 - 0.05, RF, -14, -1.75, RF + 0.22, 0.4, cap, H);
  // timber accent panel
  ground(X0 + 0.2, -13.8, -1.8, -0.25, RF + 0.23, T.concrete(0x9d9b95, { tileM: 2, seed: 60 }), H); ground(3.4, -13.8, X1, -0.25, RF + 0.23, T.concrete(0x9d9b95, { tileM: 2, seed: 61 }), H);
  waterTankLite(-3.5, RF + 0.22, -3, H); waterTankLite(-2.4, RF + 0.22, -3.8, H, { r: 0.5, h: 1.0 });
  wallStain({ x0: X0, x1: -1.8, y0: 3.8, y1: RF, z: 0, seed: 2, alpha: 0.14, parent: H });

  // front lawn, path, hedges, gate
  ground(X0, 0.2, X1, ZW, 0.01, lawn, scene);
  ground(-0.8, 0.45, 2.4, 4.0, 0.02, pave, scene);
  for (let i = 0; i < 6; i++) { const z = 4.4 + i * 0.75, xx = 0.8 + Math.sin(i * 0.7) * 0.6; bx(xx - 0.6, 0, z, xx + 0.6, 0.02, z + 0.5, pave, scene); }
  ground(2.4, 7.0, 5.8, ZW, 0.013, drive, scene); ground(3.6, 0.2, 5.8, 7.0, 0.013, drive, scene);
  car({ x: 4.6, z: 3.6, rot: -Math.PI / 2 + 0.0, color: 0xcfd1d3, type: 'suv', parent: scene });
  mound(-3.0, 0, 2.2, 0.8, scene, { seed: 3 }); mound(-1.6, 0, 2.0, 0.6, scene, { seed: 4, tint: 0xe6ffd0 }); mound(-4.6, 0, 3.4, 0.7, scene, { seed: 5 });
  mound(-0.2, 0, 3.4, 0.5, scene, { seed: 6 }); mound(1.8, 0, 3.8, 0.5, scene, { seed: 7, tint: 0xe6ffd0 });
  flowerMass({ x0: -5.6, x1: -2.8, y0: 0.2, y1: 1.4, z: 4.5, depth: 1, seed: 11, parent: scene, kind: 'flower' });
  crownTree(-8.5, 5.0, { h: 8.5, crown: 3.2, kind: 'umbrella', seed: 17, trunkR: 0.15 }, scene);
  palm(-7.2, 1.5, { h: 8.5, seed: 9, lean: 0.3 }, scene);
  bx(X0, 0, ZW - 0.2, 2.4, 0.9, ZW + 0.2, sB, scene); bx(X0 - 0.03, 0.9, ZW - 0.24, 2.4, 0.97, ZW + 0.24, cap, scene);
  hedgeRow(X0 + 0.2, ZW - 0.9, 2.2, ZW - 0.9, { h: 1.1, w: 0.8, y: 0, seed: 4 }, scene);
  pillar({ x: 2.7, z: ZW, w: 0.6, h: 2.1, mat: sB, cap, lampI: 7, parent: scene }); pillar({ x: 5.6, z: ZW, w: 0.6, h: 2.1, mat: sB, cap, lampI: 7, parent: scene });
  gate({ x0: 3.0, x1: 5.3, z: ZW, y1: 1.9, mats: [woodS], slat: 0.1, gap: 0.04, vertical: true, parent: scene, leaves: 2 });

  const FP0 = ZW + 0.2, ROAD0 = 11.4;
  footpath({ x0: -70, x1: 70, z0: FP0, z1: ROAD0, y: 0.1, mat: pave, parent: scene });
  roadX({ x0: -70, x1: 70, zN: ROAD0, zF: 19, seed: 9, parent: scene });
  footpath({ x0: -70, x1: 70, z0: 19, z1: 24, y: 0.12, mat: pave, parent: scene });
  crownTree(-9.5, 10.4, { h: 9.5, crown: 3.4, kind: 'neem', seed: 51, lean: -0.3 }, scene); crownTree(11, 10.4, { h: 9.5, crown: 3.3, kind: 'umbrella', seed: 53 }, scene);
  crownTree(-26, 10.4, { h: 8.5, crown: 3.2, kind: 'tall', seed: 55 }, scene); crownTree(27, 10.4, { h: 9, crown: 3.2, kind: 'neem', seed: 57 }, scene);
  crownTree(-8, -20, { h: 14, crown: 5.6, kind: 'neem', seed: 61 }, scene); crownTree(9, -21, { h: 14, crown: 5.6, kind: 'umbrella', seed: 62 }, scene);
  streetLamp({ x: -14, z: 11.0, h: 7.5, arm: 1.7, dir: 1, parent: scene });

  const camera = cam({ pos: [-1.8, 1.7, 22], target: [0.2, 1.7, 0], focal: 36, shift: 0.2, w, h });
  return { scene, camera, exposure: 0.44, aoRadius: 0.8, aoStrength: 1.0, grade: { contrast: 1.12, saturation: 1.1, vignette: 0.24, grain: 0.015, warm: 0.05 } };
}
