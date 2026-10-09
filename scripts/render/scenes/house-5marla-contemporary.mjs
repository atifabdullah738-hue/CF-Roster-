import { crownTree, mound, flowerMass, hedgeRow, cam, skyDome, treeline, THREE, T, bx, ground, cyl, palm, facade, shell, glazing, parapet, slatScreen, downlights, pointLight, room, pillar, gate, roadX, footpath, neighbour, waterTankLite, acCondenser, car, streetLamp, grunge, wallStain, pebbles, glass, coat, ledStrip, utilityPole } from '../lib/agent1-kit.mjs';
import { glassRailing, doorUnit } from '../lib/arch.mjs';
import { setupEnvironment } from '../lib/env.mjs';

export default async function build({ renderer, w, h }) {
  const scene = new THREE.Scene();
  const env = setupEnvironment({ renderer, scene, sunElevation: 52, sunAzimuth: 38, turbidity: 3.0, rayleigh: 1.1, mie: 0.005, sunIntensity: 3.6, sunColor: 0xfff3e0, envIntensity: 0.3, shadowExtent: 26, shadowCenter: [0, 3, 0] });
  env.sky.visible = false;
  skyDome(scene, { sunElevation: 52, sunAzimuth: 38, zenith: 0x1f64d0, horizon: 0xcfe4f7, cloudCover: 0.5, cloudScale: 2.6, glow: 0.2, seed: 11, cloudShadow: 0x9db3d0, cloudBright: 1.4, gain: 3.5 });
  treeline({ scene, z: -90, y: -1, hMax: 28, color: '#6d8a66', haze: '#d3e2ec', bright: 2.4, seed: 8 });
  scene.fog = new THREE.FogExp2(0xdbe6ee, 0.0030);

  // ---------------------------------------------------------------- materials
  const plas = T.plaster(0xece8df, { tileM: 3.5, seed: 14 }), plas2 = T.plaster(0xe3ded3, { tileM: 3.5, seed: 18 }), ch = T.plaster(0x2f3236, { tileM: 3, seed: 6, roughness: 0.8 });
  const stone = T.stone({ color: 0xb4a58f, tileM: 2.0, seed: 22, rows: 11 }), stone2 = T.stone({ color: 0x9d9486, tileM: 2.4, seed: 27, rows: 12 });
  const slatsM = [0, 1, 2, 3].map((i) => T.wood({ color: [0xa8743f, 0xb07c48, 0x9a6a38, 0xb98650][i], tileM: 1.2, planks: 1, gap: false, seed: 50 + i }));
  const woodH = T.wood({ color: 0xa8743f, tileM: 1.4, planks: 6, seed: 61 }), doorM = T.wood({ color: 0x8a5a30, tileM: 1.2, planks: 4, seed: 64 });
  const cap = T.concrete(0xcfcdc7, { tileM: 2, seed: 41 }), conc = T.concrete(0xa9a8a3, { tileM: 2.5, seed: 77 });
  const drive = T.paving({ color: 0x9c9a95, tileM: 2.4, n: 6, seed: 45 }), pave = T.paving({ color: 0xc4bfb4, tileM: 2.4, n: 6, seed: 46 });
  const brickM = T.brick({ color: 0xa4553a, mortar: 0xc8c0b2, tileM: 1.6, rows: 20, cols: 8 });

  ground(-140, -80, 140, 80, -0.02, T.solid(0x7c6f5c, { roughness: 1 }), scene);
  const X0 = -3.35, X1 = 3.35, G = 0.3, U = 3.6, RF = 6.9, ZW = 3.6;
  const H = new THREE.Group(); scene.add(H);

  // ---------------------------------------------------------------- neighbours
  neighbour({ x0: -14.5, x1: -3.35, zF: -0.4, depth: 12, floors: 2, storeyH: 3.3, wall: 0xc9b9a0, accent: 0x6a5a48, seed: 4, zWall: ZW, wallH: 1.7, parent: scene, glow: 0.1, frameCol: 0x2c2a28 });
  neighbour({ x0: 3.35, x1: 14.5, zF: 0.6, depth: 12, floors: 2, storeyH: 3.3, wall: 0xaeb5ba, accent: 0x474c52, seed: 6, zWall: ZW, wallH: 1.5, parent: scene, glow: 0.1 });
  neighbour({ x0: -27, x1: -14.5, zF: 0.3, depth: 12, floors: 3, storeyH: 3.2, wall: 0xe0d6c3, accent: 0x7b5a3c, seed: 8, zWall: ZW, parent: scene });
  neighbour({ x0: 14.5, x1: 28, zF: -0.6, depth: 12, floors: 2, storeyH: 3.3, wall: 0xd7cdbd, accent: 0x5b6b58, seed: 10, zWall: ZW, parent: scene });

  // ---------------------------------------------------------------- stone tower (left)
  const TX1 = -0.45, TF = 0.35; // tower right edge, front face
  const dX = -2.85, dW = 1.15, balX = -3.05, balW = 2.35;
  facade({ x0: X0, x1: TX1, y0: 0, y1: RF + 0.45, z: TF, t: 0.3, mat: stone, openings: [{ x: dX, y: G, w: dW, h: 2.4 }, { x: balX, y: U + 0.25, w: balW, h: 2.75 }], parent: H });
  shell({ x0: X0, x1: TX1, y0: 0, y1: RF, zF: TF - 0.3, zB: -12.5, t: 0.25, side: plas2, roofMat: conc, parent: H });
  // entrance
  doorUnit({ x: dX, y: G, w: dW, h: 2.4, z: TF, mat: doorM, recess: 0.25, frame: 0x1a1b1d, handle: 0xc9a85a }, H);
  bx(dX - 0.25, G + 2.4, TF - 0.01, dX + dW + 0.25, G + 2.46, TF + 0.55, ch, H); // canopy
  downlights([[dX + 0.2, TF + 0.3], [dX + dW - 0.2, TF + 0.3]], { y: G + 2.4, intensity: 6, color: 0xffe0b0, parent: H });
  bx(dX + dW + 0.1, 1.0, TF + 0.0, dX + dW + 0.4, 1.9, TF + 0.04, T.emissive(0xffdca0, 3), H, { cast: false }); // wall light slit
  bx(dX + dW + 0.1, G + 0.9, TF, dX + dW + 0.4, G + 1.4, TF + 0.06, coat(0x1b1d20), H, { cast: false });
  // balcony: recessed into the stone tower
  glazing({ x: balX, y: U + 0.25, w: balW, h: 2.75, z: TF, cols: 2, frame: 0x16181a, parent: H, reveal: 1.25 });
  room({ x0: balX - 0.3, x1: balX + balW + 0.3, floorY: U, ceilY: U + 3.0, zF: TF - 1.55, depth: 4.2, style: 'bed', glow: 0.14, seed: 13, parent: H, wallColor: 0xe6dcc9 });
  bx(balX - 0.05, U - 0.02, TF - 1.4, balX + balW + 0.05, U + 0.18, TF + 0.02, T.paving({ color: 0xb8b2a6, n: 4, seed: 71, tileM: 2 }), H);
  glassRailing({ x0: balX, x1: balX + balW, y: U + 0.18, z0: TF - 0.05, z1: TF - 0.05, h: 1.05, parent: H });
  bx(balX, U + 0.18, TF - 0.55, balX + 0.55, U + 0.7, TF - 0.1, ch, H); mound(balX + 0.27, U + 0.65, TF - 0.32, 0.3, H, { seed: 3 }); // planter
  flowerMass({ x0: balX + 1.4, x1: balX + 2.3, y0: U + 0.2, y1: U + 0.95, z: TF - 0.35, depth: 0.4, kind: 'flowerO', seed: 9, parent: H, density: 700 });
  // deep stone coping + thin projecting slab on top of tower
  bx(X0 - 0.05, RF + 0.45, -0.2, TX1 + 0.05, RF + 0.62, TF + 0.35, cap, H);
  bx(X0 - 0.03, U - 0.18, TF - 1.0, TX1 + 0.03, U - 0.02, TF + 0.06, plas, H); // slab band between floors
  bx(X0 + 0.25, U + 3.0, -1.6, TX1 - 0.25, U + 3.14, TF - 0.3, plas, H);
  // stone vertical groove accent
  ledStrip(TX1 - 0.04, 0.3, TF + 0.0, TX1, RF + 0.3, TF + 0.015, { color: 0xffe0b0, intensity: 2.5, parent: H });

  // ---------------------------------------------------------------- right: porch + cantilevered timber box
  const PX0 = TX1, BF = 1.5; // box front (cantilever)
  // ground floor right: open porch, back wall at -4.4
  bx(PX0, 0, -4.6, X1, U - 0.25, -4.4, plas2, H);
  ground(PX0, -4.4, X1, ZW, 0.012, drive, H);
  bx(PX0, U - 0.3, -4.6, X1, U - 0.04, BF, plas, H); // soffit slab
  bx(PX0, U - 0.33, -4.6, X1, U - 0.3, BF, woodH, H, { swap: true });
  downlights([[0.4, 1.0], [1.8, 1.0], [3.0, 1.0], [0.4, -1.0], [1.8, -1.0], [3.0, -1.0], [0.4, -3.0], [3.0, -3.0]], { y: U - 0.335, intensity: 7, color: 0xffe3b8, parent: H });
  pointLight(scene, 0xffd9a8, 6, 1.9, 2.8, -1.5, 8, 1.7);
  car({ x: 1.9, z: -2.4, rot: -Math.PI / 2, color: 0xc2c4c6, type: 'sedan', parent: H });
  doorUnit({ x: 2.2, y: G, w: 1.0, h: 2.1, z: -4.4, mat: doorM, recess: 0.0, frame: 0x16181a }, H);
  bx(PX0, 0, -4.6, PX0 + 0.25, U - 0.25, 0.0, stone2, H); // stone return wall
  // timber box over porch
  facade({ x0: PX0, x1: X1, y0: U - 0.04, y1: RF, z: BF, t: 0.3, mat: ch, openings: [{ x: 0.5, y: U + 0.4, w: 2.4, h: 2.2 }], parent: H });
  bx(PX0, U - 0.04, -12.5, X1, RF, BF - 4.9, ch, H);
  glazing({ x: 0.5, y: U + 0.4, w: 2.4, h: 2.2, z: BF, cols: 2, frame: 0x101112, parent: H, reveal: 0.15 });
  room({ x0: 0.3, x1: 3.1, floorY: U, ceilY: U + 3.0, zF: BF - 0.3, depth: 4.4, style: 'lounge', glow: 0.14, seed: 21, parent: H, wallColor: 0xdcd0bc });
  bx(PX0, U - 0.04, BF - 4.9, 0.3, RF, BF - 0.3, ch, H); bx(3.1, U - 0.04, BF - 4.9, X1, RF, BF - 0.3, ch, H); bx(PX0, RF - 0.5, BF - 4.9, X1, RF, BF - 0.3, ch, H);
  slatScreen({ x0: PX0 + 0.04, x1: X1 - 0.0, y0: U, y1: RF - 0.05, z: BF, w: 0.055, d: 0.11, pitch: 0.17, mats: slatsM, seed: 3, parent: H });
  ledStrip(PX0 + 0.04, U + 0.0, BF + 0.0, X1, U + 0.04, BF + 0.1, { color: 0xffd9a0, intensity: 5, parent: H });
  // projecting roof slab
  bx(PX0 - 0.1, RF - 0.05, -12.5, X1 + 0.05, RF + 0.2, BF + 0.45, cap, H); bx(PX0 - 0.1, RF + 0.2, BF + 0.35, X1 + 0.05, RF + 0.28, BF + 0.45, ch, H);
  bx(PX0, U - 0.04, BF - 0.02, X1, U + 0.1, BF + 0.0, ch, H);
  // right party wall surface
  bx(X1 - 0.0, 0, -12.5, X1 + 0.0, RF, BF, plas, H);
  // roof stuff
  waterTankLite(-1.9, RF + 0.62, -2.2, H); waterTankLite(-0.9, RF + 0.62, -3.0, H, { r: 0.5, h: 1.0 });
  ground(X0 + 0.1, -12.3, TX1 - 0.1, TF - 0.3, RF + 0.465, T.concrete(0x9d9b95, { tileM: 2, seed: 60 }), H);

  // ---------------------------------------------------------------- boundary: stone pillars, slatted sliding gate, planter wall
  const stonePil = stone2;
  pillar({ x: -0.35, z: ZW, w: 0.5, h: 2.05, mat: stonePil, cap: cap, lampI: 7, parent: scene });
  pillar({ x: X1 - 0.25, z: ZW, w: 0.5, h: 2.05, mat: stonePil, cap: cap, lampI: 7, parent: scene });
  gate({ x0: -0.1, x1: 3.1, z: ZW + 0.12, y0: 0, y1: 1.95, mats: slatsM, slat: 0.1, gap: 0.03, parent: scene, leaves: 2, frame: 0x16181a });
  bx(-0.1, 0, ZW - 0.06, 3.1, 0.06, ZW + 0.08, coat(0x222426), scene);
  // left low wall with planter, pedestrian gate
  bx(X0, 0, ZW - 0.12, -0.6, 1.25, ZW + 0.12, stone2, scene); bx(X0 - 0.02, 1.25, ZW - 0.16, -0.58, 1.32, ZW + 0.16, cap, scene);
  bx(-2.8, 0.0, ZW - 0.02, -1.6, 1.75, ZW + 0.02, T.solid(0x16181a, { roughness: 0.5 }), scene); // ped gate frame
  slatScreen({ x0: -2.75, x1: -1.65, y0: 0.08, y1: 1.7, z: ZW + 0.02, w: 0.07, d: 0.05, pitch: 0.12, mats: slatsM, seed: 5, parent: scene });
  bx(-3.1, 0.0, ZW - 0.15, -2.9, 1.9, ZW + 0.15, stone, scene);
  // front garden: lawn + pebble + planter
  ground(X0, 0.2, PX0, ZW - 0.12, 0.012, T.grass({ color: 0x6a9a42 }), scene); ground(PX0, 0.0, X1, ZW, 0.01, drive, scene);
  ground(-2.6, 0.2, -1.7, ZW, 0.016, pave, scene);
  mound(-3.0, 0, 2.1, 0.45, scene, { seed: 6 }); mound(-0.9, 0, 1.2, 0.5, scene, { seed: 7, tint: 0xe8ffd6 }); mound(-1.0, 0, 2.8, 0.35, scene, { seed: 9 });
  hedgeRow(-3.1, 3.0, -0.8, 3.0, { h: 0.5, w: 0.4, y: 1.32, seed: 5 }, scene);
  flowerMass({ x0: -3.2, x1: -1.0, y0: 1.28, y1: 1.7, z: ZW, depth: 0.45, seed: 6, parent: scene });

  // ---------------------------------------------------------------- street
  footpath({ x0: -60, x1: 60, z0: ZW + 0.12, z1: 5.7, y: 0.1, mat: pave, parent: scene });
  roadX({ x0: -60, x1: 60, zN: 5.7, zF: 13.0, seed: 8, parent: scene });
  footpath({ x0: -60, x1: 60, z0: 13.0, z1: 17, y: 0.12, mat: pave, parent: scene });
  crownTree(-9.2, 4.8, { h: 8.5, crown: 3.1, kind: 'umbrella', seed: 31, lean: -0.3 }, scene);
  crownTree(8.8, 4.8, { h: 9, crown: 3.0, kind: 'neem', seed: 33, lean: 0.3 }, scene);
  crownTree(-20, 4.8, { h: 8, crown: 3.0, kind: 'tall', seed: 35 }, scene); crownTree(21, 4.8, { h: 9, crown: 3.4, kind: 'umbrella', seed: 37 }, scene);
  crownTree(-6, -16, { h: 13, crown: 5.4, kind: 'neem', seed: 41 }, scene); crownTree(6, -17, { h: 13, crown: 5.2, kind: 'umbrella', seed: 42 }, scene);
  palm(-12.8, 4.0, { h: 8.0, seed: 4, lean: -0.3 }, scene);
  streetLamp({ x: -11.6, z: 5.4, h: 7.5, arm: 1.7, dir: 1, parent: scene });
  car({ x: 8.5, z: 8.5, rot: 0, color: 0x2e3a4c, type: 'sedan', parent: scene });
  wallStain({ x0: X0, x1: TX1, y0: 3.7, y1: RF + 0.3, z: TF, seed: 4, alpha: 0.12, parent: H });

  const camera = cam({ pos: [-3.6, 1.7, 15.2], target: [0.2, 1.7, 0], focal: 36, shift: 0.17, w, h });
  return { scene, camera, exposure: 0.4, aoRadius: 0.7, aoStrength: 1.0, grade: { contrast: 1.15, saturation: 1.12, vignette: 0.22, grain: 0.015, warm: 0.03 } };
}
