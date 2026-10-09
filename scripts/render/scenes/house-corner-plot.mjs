import { crownTree, mound, flowerMass, hedgeRow, cam, skyDome, treeline, THREE, T, bx, ground, cyl, palm, facade, shell, glazing, parapet, slatScreen, downlights, pointLight, room, pillar, gate, roadX, footpath, neighbour, waterTankLite, acCondenser, car, streetLamp, wallStain, glass, coat, ledStrip } from '../lib/agent1-kit.mjs';
import { glassRailing, doorUnit } from '../lib/arch.mjs';
import { setupEnvironment } from '../lib/env.mjs';

export default async function build({ renderer, w, h }) {
  const scene = new THREE.Scene();
  const EL = 27, AZ = 62;
  const env = setupEnvironment({ renderer, scene, sunElevation: EL, sunAzimuth: AZ, turbidity: 3.8, rayleigh: 1.2, mie: 0.007, sunIntensity: 3.6, sunColor: 0xffe2bd, envIntensity: 0.28, shadowExtent: 40, shadowCenter: [2, 2, 2] });
  env.sky.visible = false;
  skyDome(scene, { sunElevation: EL, sunAzimuth: AZ, zenith: 0x2a68c8, horizon: 0xe3ecf4, cloudCover: 0.48, cloudScale: 2.3, glow: 0.4, seed: 41, cloudShadow: 0xa2b0cb, cloudBright: 1.4, cloudTint: 0xfff4e6, gain: 3.4 });
  treeline({ scene, z: -110, y: -1, hMax: 30, color: '#70896a', haze: '#dce4e8', bright: 2.4, seed: 14, x0: -250, x1: 250 });
  treeline({ scene, z: 90, y: -1, hMax: 0.1, color: '#70896a', haze: '#dce4e8', bright: 2.4, seed: 14, x0: 0, x1: 1 });
  scene.fog = new THREE.FogExp2(0xdfe6ec, 0.0032);

  const grey = T.plaster(0xdad5cb, { tileM: 3.5, seed: 5 }), grey2 = T.plaster(0xd2cdc2, { tileM: 3.5, seed: 9 }), char = T.plaster(0x34373d, { tileM: 3, seed: 3, roughness: 0.76 }), char2 = T.plaster(0x40434a, { tileM: 3, seed: 13, roughness: 0.76 });
  const stone = T.stone({ color: 0xa79a86, tileM: 2.0, seed: 22, rows: 13 }), stone2 = T.stone({ color: 0x91877a, tileM: 2.4, seed: 26, rows: 15 });
  const cap = T.concrete(0x5e6064, { tileM: 2, seed: 41 }), conc = T.concrete(0xaaa8a2, { tileM: 2.5, seed: 77 });
  const woodS = [0, 1, 2].map((i) => T.wood({ color: [0x9a6838, 0xa3703f, 0x8f6032][i], tileM: 1.2, planks: 1, gap: false, seed: 70 + i })), woodP = T.wood({ color: 0xa06f40, tileM: 1.4, planks: 6, seed: 61 }), doorM = T.wood({ color: 0x5b3a22, tileM: 1.2, planks: 4, seed: 64 });
  const drive = T.paving({ color: 0x95928c, tileM: 2.4, n: 6, seed: 47 }), pave = T.paving({ color: 0xc4bfb3, tileM: 2.4, n: 6, seed: 46 });
  const lawn = T.grass({ color: 0x669440 });
  ground(-300, -130, 300, 130, -0.02, T.solid(0x7c6f5c, { roughness: 1 }), scene);
  const G = 0.45, U = 3.9, RF = 7.3, XW = -9.0, XE = 8.0, ZW = 6.5, XB = 10.8, UB = -1.8, BAL = 1.7, XEU = 6.2;
  const H = new THREE.Group(); scene.add(H);
  const S = new THREE.Group(); S.position.set(XE, 0, 0); S.rotation.y = Math.PI / 2; H.add(S);   // side facade, local z = +X world, local x = -Z world
  const S2 = new THREE.Group(); S2.position.set(XEU, 0, 0); S2.rotation.y = Math.PI / 2; H.add(S2);

  // ================= FRONT FACADE ground floor (z = 0)
  const open = [{ x: -8.4, y: 0, w: 4.2, h: 2.55 }, { x: -3.1, y: G, w: 1.1, h: 2.4 }, { x: -1.2, y: G, w: 7.6, h: 3.0 }];
  facade({ x0: XW, x1: XE, y0: 0, y1: U - 0.4, z: 0, t: 0.3, mat: grey, openings: open, parent: H });
  shell({ x0: XW, x1: XE, y0: 0, y1: U - 0.4, zF: -0.3, zB: -15, t: 0.25, side: grey2, roofMat: conc, parent: H });
  bx(-8.4, 0, -0.5, -4.2, 2.55, -0.4, T.solid(0x151515), H);
  slatScreen({ x0: -8.4, x1: -4.2, y0: 0, y1: 2.55, z: -0.1, w: 0.2, d: 0.06, pitch: 0.215, horizontal: true, mats: woodS, seed: 4, parent: H });
  doorUnit({ x: -3.1, y: G, w: 1.1, h: 2.4, z: 0, mat: doorM, recess: 0.2, frame: 0x1b1c1e, handle: 0xc9a85a }, H);
  bx(-3.7, 0, -0.02, -2.5, G + 3.4, 0.2, stone, H); // stone entrance strip (veneer over wall, door is cut-out below)
  glazing({ x: -1.2, y: G, w: 7.6, h: 3.0, z: 0, cols: 4, frame: 0x14161a, parent: H, reveal: 0.12 });
  room({ x0: -1.5, x1: 6.7, floorY: G, ceilY: G + 3.1, zF: -0.3, depth: 7.0, style: 'living', glow: 0.14, seed: 2, parent: H, wallColor: 0xe6dac4, anchor: 2.8 });
  bx(XW, 0, -0.04, XE, G, 0.12, stone2, H);
  // ================= UPPER FLOOR recessed box
  facade({ x0: XW, x1: XEU, y0: U - 0.4, y1: RF, z: UB, t: 0.3, mat: grey, openings: [{ x: -7.6, y: U + 0.15, w: 6.0, h: 2.9 }, { x: -0.6, y: U + 0.15, w: 6.2, h: 2.9 }], parent: H });
  glazing({ x: -7.6, y: U + 0.15, w: 6.0, h: 2.9, z: UB, cols: 3, frame: 0x14161a, parent: H, reveal: 0.12 });
  glazing({ x: -0.6, y: U + 0.15, w: 6.2, h: 2.9, z: UB, cols: 3, frame: 0x14161a, parent: H, reveal: 0.12 });
  room({ x0: -7.9, x1: -1.3, floorY: U, ceilY: U + 3.05, zF: UB - 0.3, depth: 5.5, style: 'bed', glow: 0.14, seed: 4, parent: H });
  room({ x0: -0.9, x1: 5.9, floorY: U, ceilY: U + 3.05, zF: UB - 0.3, depth: 5.5, style: 'lounge', glow: 0.14, seed: 6, parent: H, wallColor: 0xdfd2b9 });
  bx(XW, U - 0.4, -15, XEU, RF, UB - 6.1, grey2, H); bx(XW, U - 0.4, UB - 6.1, XW + 0.25, RF, UB - 0.3, grey2, H); bx(XEU - 0.25, U - 0.4, UB - 6.1, XEU, RF, UB - 0.3, grey2, H); bx(XW, RF - 0.4, UB - 6.1, XEU, RF, UB - 0.3, grey2, H);
  bx(XW + 0.25, U - 0.4, UB - 6.1, -7.9, RF, UB - 0.3, grey2, H); bx(-1.3, U - 0.4, UB - 6.1, -0.9, RF, UB - 0.3, grey2, H);
  // rear/left upper volume on the far side of side-wing handled by shell above
  // balcony ring slab (front + side)
  bx(XW, U - 0.4, UB, XE + BAL, U + 0.14, BAL, T.concrete(0x6a6b6e, { tileM: 2, seed: 83 }), H);
  bx(XEU, U - 0.4, -12, XE + BAL, U + 0.14, UB, T.concrete(0x6a6b6e, { tileM: 2, seed: 84 }), H);
  bx(XW, U - 0.43, UB, XE + BAL, U - 0.4, BAL, woodP, H, { swap: true }); bx(XEU, U - 0.43, -12, XE + BAL, U - 0.4, UB, woodP, H, { swap: true });
  bx(XW - 0.05, U - 0.4, BAL - 0.2, XE + BAL + 0.05, U - 0.1, BAL + 0.04, char, H); bx(XE + BAL - 0.2, U - 0.4, -12, XE + BAL + 0.04, U - 0.1, BAL, char, H);
  glassRailing({ x0: XW + 0.05, x1: XE + BAL - 0.05, y: U + 0.14, z0: BAL - 0.08, z1: BAL - 0.08, h: 1.05, parent: H });
  glassRailing({ x0: XE + BAL - 0.08, x1: XE + BAL - 0.08, y: U + 0.14, z0: -12, z1: BAL - 0.08, h: 1.05, parent: H });
  // roof ring
  bx(XW - 0.2, RF, -15, XE + BAL + 0.25, RF + 0.3, BAL + 0.25, cap, H);
  bx(XW - 0.3, RF + 0.3, BAL + 0.1, XE + BAL + 0.35, RF + 0.42, BAL + 0.25, grey, H);
  bx(XW - 0.2, RF - 0.5, UB, XE + BAL + 0.1, RF, BAL + 0.0, woodP, H, { swap: true });
  bx(XEU, RF - 0.5, -12, XE + BAL + 0.1, RF, UB, woodP, H, { swap: true });
  downlights([[-6, 0.6], [-3, 0.6], [0, 0.6], [3, 0.6], [6, 0.6], [8.5, 0.6], [8.5, -3], [8.5, -7], [7.3, -3], [7.3, -7]], { y: RF - 0.51, intensity: 6, color: 0xffe3b8, parent: H });
  // corner column + planters
  bx(XE + BAL - 0.35, 0, BAL - 0.35, XE + BAL - 0.1, U - 0.4, BAL - 0.1, char, H);
  for (const x of [-6.0, -2.0, 2.0]) { bx(x, U + 0.14, BAL - 0.55, x + 1.0, U + 0.6, BAL - 0.15, char2, H); mound(x + 0.5, U + 0.58, BAL - 0.35, 0.34, H, { seed: x + 3 }); }
  flowerMass({ x0: XE + 0.1, x1: XE + 1.4, y0: U + 0.15, y1: U + 0.7, z: BAL - 0.3, depth: 0.4, kind: 'flowerO', seed: 7, parent: H });
  // stone feature tower (front-left)
  bx(XW, 0, -0.1, XW + 0.5, RF + 0.1, 0.2, stone, H);
  waterTankLite(-4, RF + 0.3, -6, H); waterTankLite(-2.8, RF + 0.3, -6.8, H, { r: 0.5, h: 1.0 }); ground(XW, -15, XE, -0.2, RF + 0.31, T.concrete(0x9d9b95, { tileM: 2, seed: 60 }), H);

  // ================= SIDE FACADE ground (local coords: x -> -Z, z -> +X) at x = XE
  facade({ x0: 0, x1: 14.5, y0: 0, y1: U - 0.4, z: 0.0, t: 0.3, mat: grey, openings: [{ x: 1.8, y: G + 0.3, w: 3.0, h: 2.6 }, { x: 6.6, y: G, w: 1.0, h: 2.3 }, { x: 9.2, y: G + 0.3, w: 3.4, h: 2.6 }], parent: S });
  glazing({ x: 1.8, y: G + 0.3, w: 3.0, h: 2.6, z: 0, cols: 2, frame: 0x14161a, parent: S, reveal: 0.12 });
  glazing({ x: 9.2, y: G + 0.3, w: 3.4, h: 2.6, z: 0, cols: 3, frame: 0x14161a, parent: S, reveal: 0.12 });
  doorUnit({ x: 6.6, y: G, w: 1.0, h: 2.3, z: 0, mat: doorM, recess: 0.2, frame: 0x1b1c1e }, S);
  room({ x0: 1.5, x1: 5.1, floorY: G, ceilY: G + 3.05, zF: -0.3, depth: 4.5, style: 'dining', glow: 0.14, seed: 8, parent: S });
  room({ x0: 8.9, x1: 12.9, floorY: G, ceilY: G + 3.05, zF: -0.3, depth: 4.5, style: 'lounge', glow: 0.14, seed: 9, parent: S });
  bx(0, 0, -0.04, 14.5, G, 0.12, stone2, S);
  slatScreen({ x0: 5.3, x1: 6.5, y0: 0.2, y1: U - 0.5, z: 0.0, w: 0.06, d: 0.1, pitch: 0.16, mats: woodS, seed: 3, parent: S });
  bx(0.0, U - 0.4, -0.3, 14.5, U - 0.05, 0.0, grey, S);
  // side upper box facade
  facade({ x0: 1.8, x1: 12.0, y0: U - 0.4, y1: RF, z: 0.0, t: 0.3, mat: grey2, openings: [{ x: 2.6, y: U + 0.15, w: 4.2, h: 2.9 }, { x: 7.6, y: U + 0.15, w: 3.2, h: 2.9 }], parent: S2 });
  glazing({ x: 2.6, y: U + 0.15, w: 4.2, h: 2.9, z: 0, cols: 3, frame: 0x14161a, parent: S2, reveal: 0.12 });
  glazing({ x: 7.6, y: U + 0.15, w: 3.2, h: 2.9, z: 0, cols: 2, frame: 0x14161a, parent: S2, reveal: 0.12 });
  room({ x0: 2.3, x1: 7.1, floorY: U, ceilY: U + 3.05, zF: -0.3, depth: 4.5, style: 'bed', glow: 0.14, seed: 10, parent: S2 });
  room({ x0: 7.3, x1: 11.1, floorY: U, ceilY: U + 3.05, zF: -0.3, depth: 4.5, style: 'lounge', glow: 0.14, seed: 11, parent: S2 });
  bx(1.8, U - 0.4, -4.8, 12.0, RF, -0.3, grey2, S2);
  bx(12.0, U - 0.4, -4.8, 12.01, RF, 0, grey2, S2);
  // far end of the side wing (end wall) and stone panel
  bx(11.9, 0, -0.4, 12.4, RF, 0.2, stone, S2);
  wallStain({ x0: 1.8, x1: 12, y0: U + 3.1, y1: RF, z: 0, seed: 3, alpha: 0.12, parent: S2 });
  wallStain({ x0: XW, x1: XEU, y0: U + 3.1, y1: RF, z: UB, seed: 5, alpha: 0.1, parent: H });

  // ================= plot: lawn, drive, boundary
  ground(XW - 0.1, 0.0, XB, ZW, 0.012, lawn, scene);
  ground(-8.5, 0.0, -3.9, ZW + 0.3, 0.02, drive, scene);
  ground(-3.5, 0.2, -1.8, 3.0, 0.02, pave, scene); ground(-1.8, 0.0, 6.5, 2.2, 0.02, pave, scene);
  ground(XE, -15, XB, 0, 0.012, lawn, scene);
  ground(XE + 0.1, -14.5, XE + 1.2, 0, 0.02, pave, scene);
  car({ x: -6.2, z: 3.5, rot: -Math.PI / 2, color: 0xe8e9ea, type: 'sedan', parent: scene });
  mound(0.4, 0, 2.7, 0.7, scene, { seed: 3 }); mound(3.5, 0, 3.0, 0.6, scene, { seed: 4, tint: 0xe6ffd0 }); mound(6.4, 0, 3.4, 0.7, scene, { seed: 5 }); mound(9.2, 0, 1.0, 0.6, scene, { seed: 8 });
  mound(9.6, 0, -4, 0.6, scene, { seed: 9 }); mound(9.4, 0, -9, 0.7, scene, { seed: 10, tint: 0xe6ffd0 });
  flowerMass({ x0: 0, x1: 3, y0: 0.1, y1: 1.2, z: 1.3, depth: 0.8, seed: 15, parent: scene });
  palm(9.2, 3.8, { h: 7.5, seed: 7, lean: 0.2 }, scene); palm(-0.6, 4.0, { h: 5, seed: 8, lean: -0.1 }, scene);
  crownTree(10.0, -11, { h: 9, crown: 3.4, kind: 'neem', seed: 17 }, scene);
  // boundary walls
  bx(XW - 0.3, 0, ZW - 0.13, -4.0, 1.5, ZW + 0.13, grey, scene); bx(-0.9, 0, ZW - 0.13, XB, 1.5, ZW + 0.13, grey, scene); bx(XW - 0.33, 1.5, ZW - 0.17, XB + 0.2, 1.57, ZW + 0.17, cap, scene);
  bx(XB - 0.13, 0, -16, XB + 0.13, 1.5, ZW, grey, scene); bx(XB - 0.17, 1.5, -16, XB + 0.17, 1.57, ZW, cap, scene);
  bx(-0.9, 0, ZW + 0.13, 6.0, 0.8, ZW + 0.22, stone2, scene);
  pillar({ x: -4.2, z: ZW, w: 0.55, h: 2.1, mat: stone2, cap, lampI: 7, parent: scene }); pillar({ x: -0.6, z: ZW, w: 0.55, h: 2.1, mat: stone2, cap, lampI: 7, parent: scene });
  gate({ x0: -3.9, x1: -0.9, z: ZW, y1: 1.95, mats: woodS, slat: 0.1, gap: 0.035, parent: scene, leaves: 2 });
  // side gate (pedestrian) on side wall
  bx(XB - 0.2, 0, -6.0, XB + 0.2, 2.0, -4.8, stone2, scene); bx(XB - 0.2, 0, -8.6, XB + 0.2, 2.0, -8.2, stone2, scene);
  bx(XB - 0.04, 0, -8.2, XB + 0.04, 1.9, -6.0 - 0.0, T.solid(0x2a2d31, { roughness: 0.5, metalness: 0.5 }), scene);
  hedgeRow(XB - 0.7, -15, XB - 0.7, ZW - 0.8, { h: 1.1, w: 0.8, seed: 2 }, scene);
  flowerMass({ x0: XB - 2.0, x1: XB + 0.0, y0: 1.2, y1: 2.0, z: 3.0, depth: 0.5, seed: 33, parent: scene });

  // ================= streets (front road along X, side road along Z)
  const FP = ZW + 0.2, R0 = 9.3, R1 = 16.8, SR0 = 13.6, SR1 = 21.0;
  const road = new THREE.Group(); scene.add(road);
  footpath({ x0: -90, x1: SR0 - 0.0, z0: FP, z1: R0, y: 0.1, mat: pave, parent: road });
  footpath({ x0: XB + 0.2, x1: SR0, z0: -80, z1: FP, y: 0.1, mat: pave, parent: road }); // side footpath strip along x XB..SR0 (z from -80..FP)
  roadX({ x0: -90, x1: SR0, zN: R0, zF: R1, seed: 3, parent: road });
  roadX({ x0: SR1, x1: 90, zN: R0, zF: R1, seed: 4, parent: road });
  ground(SR0, R0, SR1, R1, 0.0, T.asphalt(), road);
  // side road: rotate roadX so local x -> -Z
  const sideRoad = new THREE.Group(); sideRoad.rotation.y = Math.PI / 2; scene.add(sideRoad);
  roadX({ x0: -R0 + 0.0, x1: 80, zN: SR0, zF: SR1, seed: 6, parent: sideRoad });
  footpath({ x0: -R1 - 3, x1: R0 - 0.0, z0: SR1, z1: SR1 + 3.5, y: 0.12, mat: pave, parent: road });
  footpath({ x0: SR1, x1: 90, z0: FP, z1: R0, y: 0.1, mat: pave, parent: road });
  footpath({ x0: -90, x1: 90, z0: R1, z1: R1 + 4, y: 0.12, mat: pave, parent: road });
  // trees & street furniture
  crownTree(-12, 8.0, { h: 9, crown: 3.4, kind: 'umbrella', seed: 51, lean: -0.3 }, scene); crownTree(-22, 8.0, { h: 8.5, crown: 3.2, kind: 'neem', seed: 53 }, scene);
  crownTree(12.2, -3, { h: 9.5, crown: 3.4, kind: 'neem', seed: 55 }, scene); crownTree(12.2, -18, { h: 9, crown: 3.2, kind: 'umbrella', seed: 57 }, scene);
  crownTree(24, 8.0, { h: 9, crown: 3.2, kind: 'tall', seed: 59 }, scene); crownTree(-6, -22, { h: 14, crown: 5.6, kind: 'neem', seed: 61 }, scene); crownTree(8, -26, { h: 14, crown: 5.4, kind: 'umbrella', seed: 62 }, scene);
  streetLamp({ x: 11.4, z: 8.4, h: 7.5, arm: 1.7, dir: 1, parent: scene });
  car({ x: -14, z: 10.5, rot: 0, color: 0x2d3340, type: 'suv', parent: scene });
  neighbour({ x0: -34, x1: -9.3, zF: 0.2, depth: 13, floors: 2, storeyH: 3.4, wall: 0xcfc4af, accent: 0x6a5a48, seed: 3, zWall: ZW, wallH: 1.7, parent: scene, glow: 0.1 });
  neighbour({ x0: -60, x1: -34, zF: -0.4, depth: 13, floors: 3, storeyH: 3.2, wall: 0xc2c7ca, accent: 0x474c52, seed: 7, zWall: ZW, parent: scene });
  neighbour({ x0: 26, x1: 52, zF: -1.5, depth: 13, floors: 2, storeyH: 3.4, wall: 0xd6cbb6, accent: 0x5a6a58, seed: 11, zWall: ZW, parent: scene });

  const camera = cam({ pos: [15.5, 1.7, 24.5], target: [-1.6, 1.7, -1.0], focal: 27, shift: 0.14, w, h });
  return { scene, camera, exposure: 0.42, aoRadius: 0.9, aoStrength: 1.0, grade: { contrast: 1.14, saturation: 1.1, vignette: 0.24, grain: 0.015, warm: 0.04 } };
}
