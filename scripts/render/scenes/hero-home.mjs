import { crownTree, mound, flowerMass, hedgeRow, cam, skyDome, treeline, THREE, T, bx, ground, cyl, palm, facade, shell, glazing, parapet, slatScreen, downlights, pointLight, room, pillar, gate, roadX, footpath, neighbour, waterTankLite, acCondenser, car, streetLamp, wallStain, pebbles, glass, coat, ledStrip, grunge } from '../lib/agent1-kit.mjs';
import { glassRailing, doorUnit } from '../lib/arch.mjs';
import { setupEnvironment } from '../lib/env.mjs';

export default async function build({ renderer, w, h }) {
  const scene = new THREE.Scene();
  const SEL = 6.5, SAZ = 100;
  const env = setupEnvironment({ renderer, scene, sunElevation: SEL, sunAzimuth: SAZ, turbidity: 6, rayleigh: 2.0, mie: 0.02, mieG: 0.9, sunIntensity: 3.6, sunColor: 0xffb673, envIntensity: 0.34, shadowExtent: 48, shadowCenter: [6, 2, 8], shadowMap: 4096 });
  env.sky.visible = false;
  skyDome(scene, { sunElevation: SEL, sunAzimuth: SAZ, zenith: 0x27407a, horizon: 0xffbf8a, ground: 0x6a5a58, cloudCover: 0.5, cloudScale: 2.2, glow: 1.0, seed: 17, cloudShadow: 0x6b5f84, cloudTint: 0xffb98a, cloudBright: 1.6, sunColor: 0xffb070, gain: 2.6, horizonBand: 0.5, haze: 0.0 });
  scene.fog = new THREE.FogExp2(0xe7b48a, 0.0042);

  const plas = T.plaster(0xe6dccb, { tileM: 3.5, seed: 5 }), plas2 = T.plaster(0xddd2bf, { tileM: 3.5, seed: 9 }), char = T.plaster(0x2c2e34, { tileM: 3, seed: 3, roughness: 0.74 }), char2 = T.plaster(0x383b41, { tileM: 3, seed: 13, roughness: 0.74 });
  const stone = T.stone({ color: 0xa5977f, tileM: 2.0, seed: 22, rows: 13 }), stone2 = T.stone({ color: 0x8e8272, tileM: 2.4, seed: 26, rows: 15 });
  const cap = T.concrete(0x6b6a68, { tileM: 2, seed: 41 }), conc = T.concrete(0xa9a69f, { tileM: 2.5, seed: 77 });
  const woodS = [0, 1, 2].map((i) => T.wood({ color: [0x9a6838, 0xa3703f, 0x8f6032][i], tileM: 1.2, planks: 1, gap: false, seed: 70 + i })), woodP = T.wood({ color: 0x9a6a3c, tileM: 1.4, planks: 6, seed: 61 }), doorM = T.wood({ color: 0x5b3a22, tileM: 1.2, planks: 4, seed: 64 });
  const terr = T.paving({ color: 0xb3ab9d, tileM: 2.4, n: 4, seed: 45 }); terr.roughness = 0.45;
  const drive = T.paving({ color: 0x8c8982, tileM: 2.4, n: 6, seed: 47 }); drive.roughness = 0.5; const pave = T.paving({ color: 0xc2bcaf, tileM: 2.4, n: 6, seed: 46 });
  const lawn = T.grass({ color: 0x5d8a3a });
  ground(-300, -120, 300, 120, -0.02, T.solid(0x6f6354, { roughness: 1 }), scene);
  const G = 0.45, U = 4.0, RF = 7.4, XL = 1.0, XM = 8.6, XR = 20.0;
  const H = new THREE.Group(); scene.add(H);
  const GLOW = 1.9; const GL = glass({ opacity: 0.28, env: 1.4, tint: 0x20262c });

  // ---------------------------------------------------------------- GARAGE WING (x XL..XM): stone ground + timber garage door, white upper box
  facade({ x0: XL, x1: XM, y0: 0, y1: U - 0.4, z: 0, t: 0.3, mat: stone, openings: [{ x: 1.6, y: 0.0, w: 4.6, h: 2.5 }, { x: 7.1, y: G, w: 1.1, h: 2.4 }], parent: H });
  shell({ x0: XL, x1: XM, y0: 0, y1: U - 0.4, zF: -0.3, zB: -14, t: 0.25, side: plas2, roofMat: conc, parent: H });
  bx(1.6, 0, -0.45, 6.2, 2.5, -0.35, T.solid(0x1a1a1a), H); // garage void backing
  slatScreen({ x0: 1.6, x1: 6.2, y0: 0.0, y1: 2.5, z: -0.12, w: 0.2, d: 0.06, pitch: 0.215, horizontal: true, mats: woodS, seed: 5, parent: H });
  ledStrip(1.6, 2.5, -0.12, 6.2, 2.54, 0.0, { color: 0xffe0b0, intensity: 6, parent: H });
  doorUnit({ x: 7.1, y: G, w: 1.1, h: 2.4, z: 0, mat: doorM, recess: 0.2, frame: 0x1b1c1e, handle: 0xc9a85a }, H);
  bx(6.9, G + 2.4, -0.02, 8.4, G + 2.48, 1.4, char, H); downlights([[7.3, 0.8], [8.0, 0.8]], { y: G + 2.4, intensity: 8, color: 0xffe0b0, parent: H });
  // upper box (cantilevers 1.4)
  const UF = 1.4;
  facade({ x0: XL, x1: XM, y0: U - 0.4, y1: RF, z: UF, t: 0.3, mat: plas, openings: [{ x: 1.8, y: U + 0.7, w: 5.6, h: 1.7 }], parent: H });
  bx(XL, U - 0.4, -14, XM, RF, UF - 5.2, plas2, H);
  glazing({ x: 1.8, y: U + 0.7, w: 5.6, h: 1.7, z: UF, cols: 4, frame: 0x16181a, glassMat: GL, parent: H, reveal: 0.15 });
  room({ x0: 1.4, x1: 7.8, floorY: U, ceilY: U + 3.0, zF: UF - 0.3, depth: 5.0, style: 'bed', glow: GLOW, seed: 4, parent: H, wallColor: 0xe9d9bd });
  bx(XL, U - 0.4, UF - 5.2, XL + 0.25, RF, UF - 0.3, plas2, H); bx(XM - 0.25, U - 0.4, UF - 5.2, XM, RF, UF - 0.3, plas2, H); bx(XL, U - 0.4, UF - 5.2, XM, U, UF - 0.3, plas2, H); bx(XL, RF - 0.4, UF - 5.2, XM, RF, UF - 0.3, plas2, H);
  bx(XL, U - 0.4, UF - 0.05, XM, U - 0.1, UF + 0.12, char, H);
  slatScreen({ x0: 6.4, x1: XM, y0: U - 0.1, y1: RF - 0.2, z: UF, w: 0.06, d: 0.14, pitch: 0.18, mats: woodS, seed: 8, parent: H });
  bx(XL, U - 0.4 + 0.0, UF - 0.02, XM, U - 0.4 + 0.03, UF + 0.12, T.emissive(0xffd9a0, 4), H, { cast: false });
  downlights([[2.0, 0.7], [3.4, 0.7], [4.8, 0.7], [6.2, 0.7]], { y: U - 0.41, intensity: 8, color: 0xffe0b0, parent: H });
  bx(XL, U - 0.41, -0.3, XM, U - 0.4, UF, woodP, H, { swap: true });

  // ---------------------------------------------------------------- MAIN WING (x XM..XR): glazed living + charcoal upper with balcony
  bx(XM, 0, -0.9, XM + 0.9, RF + 0.2, 0.6, stone2, H); // stone pier left
  bx(XR - 1.2, 0, -0.9, XR, RF + 0.2, 0.6, stone, H); // stone feature right
  facade({ x0: XM + 0.9, x1: XR - 1.2, y0: 0, y1: U - 0.4, z: -0.3, t: 0.3, mat: char, openings: [{ x: XM + 1.1, y: G, w: 8.2, h: 3.0 }], parent: H });
  glazing({ x: XM + 1.1, y: G, w: 8.2, h: 3.0, z: -0.3, cols: 5, frame: 0x121315, glassMat: GL, parent: H, reveal: 0.12 });
  room({ x0: XM + 0.9, x1: XR - 1.3, floorY: G, ceilY: G + 3.1, zF: -0.6, depth: 7.5, style: 'living', glow: GLOW, seed: 2, parent: H, wallColor: 0xeadcc2, anchor: 14.0 });
  shell({ x0: XM, x1: XR, y0: 0, y1: U - 0.4, zF: -0.6, zB: -14, t: 0.25, side: plas2, roofMat: conc, parent: H });
  // upper charcoal volume + balcony
  facade({ x0: XM + 0.9, x1: XR - 1.2, y0: U - 0.4, y1: RF, z: -0.3, t: 0.3, mat: char2, openings: [{ x: XM + 1.4, y: U + 0.15, w: 7.6, h: 2.85 }], parent: H });
  glazing({ x: XM + 1.4, y: U + 0.15, w: 7.6, h: 2.85, z: -0.3, cols: 4, frame: 0x121315, glassMat: GL, parent: H, reveal: 0.12 });
  room({ x0: XM + 1.1, x1: XR - 1.5, floorY: U, ceilY: U + 3.05, zF: -0.6, depth: 6.5, style: 'lounge', glow: GLOW, seed: 6, parent: H, wallColor: 0xe6d6ba, anchor: 13.5 });
  bx(XM + 0.9, U - 0.4, -14, XR - 1.2, RF, -7.4, char, H); bx(XM + 0.9, U - 0.4, -7.4, XM + 1.15, RF, -0.6, char, H); bx(XR - 1.45, U - 0.4, -7.4, XR - 1.2, RF, -0.6, char, H); bx(XM + 0.9, RF - 0.4, -7.4, XR - 1.2, RF, -0.6, char, H);
  bx(XM + 0.9, U - 0.4, -0.3, XR - 1.2, U + 0.12, 2.6, T.concrete(0x55565a, { tileM: 2, seed: 83 }), H); // balcony slab
  bx(XM + 0.9, U - 0.43, -0.3, XR - 1.2, U - 0.4, 2.6, woodP, H, { swap: true });
  glassRailing({ x0: XM + 0.95, x1: XR - 1.25, y: U + 0.12, z0: 2.5, z1: 2.5, h: 1.05, parent: H });
  glassRailing({ x0: XM + 0.95, x1: XM + 0.95, y: U + 0.12, z0: -0.3, z1: 2.5, h: 1.05, parent: H });
  glassRailing({ x0: XR - 1.25, x1: XR - 1.25, y: U + 0.12, z0: -0.3, z1: 2.5, h: 1.05, parent: H });
  ledStrip(XM + 0.9, U - 0.38, 2.55, XR - 1.2, U - 0.34, 2.62, { color: 0xffd9a0, intensity: 6, parent: H });
  downlights([[10, 0.6], [11.5, 0.6], [13, 0.6], [14.5, 0.6], [16, 0.6], [17.5, 0.6]], { y: U - 0.43, intensity: 8, color: 0xffe0b0, parent: H });
  for (const x of [10.5, 13.5, 16.5]) bx(x, U + 0.12, 1.8, x + 0.9, U + 0.55, 2.3, char2, H), mound(x + 0.45, U + 0.52, 2.05, 0.32, H, { seed: x });
  // roof slab + fascia over everything
  bx(XM + 0.6, RF, -14, XR + 0.4, RF + 0.2, 1.1, cap, H); bx(XM + 0.6, RF + 0.2, 1.0, XR + 0.4, RF + 0.3, 1.1, char, H);
  bx(XL - 0.2, RF - 0.4, -14, XM, RF - 0.2 + 0.0, UF + 0.6, cap, H);
  bx(XL - 0.3, RF - 0.2, -14, XM + 0.2, RF + 0.1, UF + 0.45, cap, H);
  waterTankLite(14.0, RF + 0.2, -5, H); waterTankLite(15.2, RF + 0.2, -5.7, H, { r: 0.5, h: 1.0 });
  // wall washers on stone
  for (const [x, y] of [[XM + 0.45, 1.5], [XM + 0.45, 5.0]]) bx(x - 0.05, y, 0.6, x + 0.05, y + 0.3, 0.64, T.emissive(0xffd9a0, 6), H, { cast: false });
  bx(XR - 0.6, 1.4, 0.6, XR - 0.5, 1.8, 0.64, T.emissive(0xffd9a0, 6), H, { cast: false });
  wallStain({ x0: XM + 0.9, x1: XR - 1.2, y0: U + 3.1, y1: RF, z: -0.3, seed: 3, alpha: 0.1, parent: H });

  // ---------------------------------------------------------------- terrace, steps, landscape lights
  ground(XL - 1, 0.0, XR + 1, 5.2, 0.02, terr, scene); ground(XL - 1, 5.2, XM + 0.9, 6.4, 0.02, terr, scene);
  bx(XM + 0.9, 0, 5.2, XR + 1, 0.12, 5.5, stone2, scene);
  const lamp = T.emissive(0xffd39a, 7);
  for (const x of [2.5, 5.0, 10, 13, 16, 19]) { bx(x - 0.04, 0.0, 4.4, x + 0.04, 0.45, 4.48, coat(0x222426), scene); bx(x - 0.045, 0.45, 4.395, x + 0.045, 0.5, 4.485, lamp, scene, { cast: false }); }
  pointLight(scene, 0xffc888, 18, 12.0, 2.0, 3.0, 14, 1.6); pointLight(scene, 0xffc888, 14, 16.5, 2.0, 3.0, 12, 1.6); pointLight(scene, 0xffc888, 12, 4.5, 1.8, 2.5, 10, 1.6); pointLight(scene, 0xffc080, 10, 6.0, 5.5, 3.5, 10, 1.6);
  pointLight(scene, 0xffc888, 8, 8, 0.6, 6, 8, 1.5);
  car({ x: 5.0, z: 8.6, rot: -Math.PI / 2 + 0.12, color: 0x1d2228, type: 'suv', lit: true, parent: scene });
  // lawn + front garden
  ground(-300, 5.0, 300, 11.3, 0.01, lawn, scene); ground(-300, -120, XL - 1, 5.0, 0.01, lawn, scene); ground(XR + 1, -120, 300, 5.0, 0.01, lawn, scene); ground(XR + 1, 0, 300, 5.0, 0.01, lawn, scene);
  ground(2.4, 6.4, 7.8, 11.6, 0.03, drive, scene);
  for (let i = 0; i < 9; i++) { const xx = -6 + Math.sin(i * 0.6) * 1.2 + i * 0.9, zz = 10.5 - i * 0.8; bx(xx - 0.5, 0, zz - 0.3, xx + 0.5, 0.025, zz + 0.3, pave, scene); }
  mound(-0.6, 0, 3.0, 0.9, scene, { seed: 3 }); mound(0.2, 0, 4.3, 0.6, scene, { seed: 4, tint: 0xe6ffd0 }); mound(21.5, 0, 3.0, 0.9, scene, { seed: 5 }); mound(9.4, 0, 6.2, 0.55, scene, { seed: 7 }); mound(18.4, 0, 6.4, 0.55, scene, { seed: 8 });
  flowerMass({ x0: XM + 1, x1: XM + 4, y0: 0.15, y1: 0.8, z: 5.9, depth: 0.7, seed: 14, parent: scene, kind: 'flowerO' });
  palm(22.6, 4.2, { h: 8.5, seed: 8, lean: -0.2 }, scene);
  pointLight(scene, 0xffc080, 9, -1.4, 0.4, 5.8, 10, 1.6);
  crownTree(-12, 7.5, { h: 9, crown: 3.6, kind: 'umbrella', seed: 17, tint: 0x8a9a78 }, scene); crownTree(-20, 3.5, { h: 12, crown: 4.8, kind: 'neem', seed: 19, lean: -0.4, tint: 0x7b8a6a }, scene);
  crownTree(-8, -14, { h: 15, crown: 6.0, kind: 'neem', seed: 23, tint: 0x8a9a78 }, scene); crownTree(-28, -10, { h: 14, crown: 5.5, kind: 'umbrella', seed: 29, tint: 0x8a9a78 }, scene); crownTree(6, -30, { h: 17, crown: 7, kind: 'neem', seed: 33 }, scene); crownTree(-30, -35, { h: 17, crown: 7, kind: 'umbrella', seed: 35 }, scene); crownTree(20, -38, { h: 18, crown: 7, kind: 'neem', seed: 37 }, scene); crownTree(-14, -40, { h: 18, crown: 7, kind: 'neem', seed: 39 }, scene);
  crownTree(24, -3, { h: 13, crown: 5, kind: 'neem', seed: 31 }, scene);
  // boundary wall + gate + hedge
  const ZW = 11.6;
  bx(-70, 0, ZW - 0.14, 2.0, 1.25, ZW + 0.14, plas, scene); bx(-70, 1.25, ZW - 0.18, 2.0, 1.32, ZW + 0.18, cap, scene);
  bx(8.4, 0, ZW - 0.14, 70, 1.25, ZW + 0.14, plas, scene); bx(8.4, 1.25, ZW - 0.18, 70, 1.32, ZW + 0.18, cap, scene);
  pillar({ x: 2.4, z: ZW, w: 0.7, h: 1.9, mat: stone2, cap, lampI: 9, parent: scene }); pillar({ x: 8.1, z: ZW, w: 0.7, h: 1.9, mat: stone2, cap, lampI: 9, parent: scene });
  gate({ x0: 2.8, x1: 7.7, z: ZW, y1: 1.6, mats: woodS, slat: 0.12, gap: 0.04, parent: scene, leaves: 2 });
  hedgeRow(-60, ZW - 0.9, 2.0, ZW - 0.9, { h: 0.9, w: 0.8, seed: 5, tint: 0xa8b890 }, scene); hedgeRow(8.4, ZW - 0.9, 40, ZW - 0.9, { h: 0.9, w: 0.8, seed: 6 }, scene);
  
  // street
  const wet = T.asphalt({ wet: true });
  footpath({ x0: -90, x1: 90, z0: ZW + 0.2, z1: 14.2, y: 0.1, mat: pave, parent: scene });
  roadX({ x0: -90, x1: 90, zN: 14.2, zF: 22, wet: true, seed: 12, parent: scene, tint: 0x6b6b70 });
  void wet;
  streetLamp({ x: -14, z: 13.4, h: 7.5, arm: 1.8, dir: 1, lit: true, parent: scene }); streetLamp({ x: 22, z: 13.4, h: 7.5, arm: -1.8, dir: -1, lit: true, parent: scene });
  pointLight(scene, 0xffd9a0, 30, -12.5, 7, 13.4, 20, 1.5);
  neighbour({ x0: -60, x1: -30, zF: -4, depth: 14, floors: 2, storeyH: 3.4, wall: 0xcfc2ae, accent: 0x5f5a52, seed: 5, zWall: ZW, parent: scene, glow: 0.9 });
  neighbour({ x0: 24, x1: 54, zF: -3, depth: 14, floors: 2, storeyH: 3.4, wall: 0xc8c0b2, accent: 0x474c52, seed: 9, zWall: ZW, parent: scene, glow: 0.9 });

  const camera = cam({ pos: [-6, 1.7, 29], target: [1.0, 1.7, 0], focal: 27, shift: 0.15, w, h });
  return { scene, camera, exposure: 0.5, aoRadius: 0.9, aoStrength: 1.0, bloom: true, bloomStrength: 0.38, bloomRadius: 0.75, bloomThreshold: 2.6,
    grade: { contrast: 1.12, saturation: 1.1, vignette: 0.4, grain: 0.02, warm: 0.04 } };
}
