// svc-architectural-design: dramatic low-angle 3/4 view of a refined contemporary facade, golden hour, reflecting pool.
import { THREE, T, boxAt, cyl, ground, rng, bindEnv, finish, win, facade, ledgeStone, lawnMat, instBoxes, wallStreaks, groundGrime, pavers, planeZ, planeY, glassPane, glassPair, metalPro, downlight, room, lightWall, rotated } from '../lib/agent5-kit.mjs';
import { tree2, bush2, hedge2, grassTufts } from '../lib/agent5-nature.mjs';
import { makeSky } from '../lib/agent5-sky.mjs';
import { setupEnvironment, archCamera } from '../lib/env.mjs';

export default async function build({ renderer, w, h }) {
  const scene = new THREE.Scene(), R = rng(3);
  const E = setupEnvironment({ renderer, scene, sunElevation: 7, sunAzimuth: 66, turbidity: 6, rayleigh: 1.4, sunIntensity: 3.6, sunColor: 0xffb877, envIntensity: 0.4, shadowExtent: 34, shadowCenter: [0, 0, 4] });
  bindEnv(E.env); E.sky.visible = false;
  const SK = makeSky(scene, { exposure: 0.46, sunEl: 7, sunAz: 66, zenith: 0x3d6397, mid: 0x93a6c0, horizon: 0xf6c18f, glow: 0xffb36a, glowAmt: 0.75, glowTight: 7, hazeH: 0.3, cover: 0.55, scale: 1.4, soft: 0.3, cirrus: 0.55, seed: 21, cloudLit: 0xffd9b0, cloudShade: 0xa59bb0, cloudUnder: 0x96788a, boost: 0.8 });
  scene.fog = new THREE.FogExp2(SK.fogColor, 0.0042);

  const stone = ledgeStone({ colors: [0xb3a48b, 0xc2b399, 0xa29479, 0xcdbfa6], tileM: 1.8, seed: 5, rowMin: 0.05, rowMax: 0.1 }), stoneD = ledgeStone({ colors: [0x5c5750, 0x6a655d, 0x4d4944], tileM: 1.8, seed: 8 });
  const concW = T.concrete(0xd0cdc5, { tileM: 2.5, seed: 5 }), concG = T.concrete(0x8f8e89, { tileM: 2.5, seed: 9 }), plasterW = T.plaster(0xe9e2d3, { tileM: 3.2, seed: 4 });
  const timber = T.solid(0x8c5a34, { roughness: 0.5 }), timberL = T.solid(0xa97b4e, { roughness: 0.5 }), brass = metalPro(0xc9a05a, { roughness: 0.25, k: 2.0 }), blk = T.solid(0x17181a, { roughness: 0.4, metalness: 0.6 });
  const lawn = lawnMat({ color: 0x8a9d4c, tileM: 3.4, seed: 61 }), travertine = T.tiles({ color: 0xcbbfa8, grout: 0x9a8f7a, tileM: 2.4, n: 3, seed: 71, marble: true, roughness: 0.4 });

  // ---- ground with a rectangular pool hole (pool x -9..4, z 3.2..10.4)
  const PX0 = -9, PX1 = 4.5, PZ0 = 3.2, PZ1 = 10.6, GY = 0.14;
  ground(-1500, -1500, 1500, PZ0 - 0.4, 0, lawn, scene); ground(-1500, PZ0 - 0.4, PX0 - 0.4, PZ1 + 0.4, 0, lawn, scene); ground(PX1 + 0.4, PZ0 - 0.4, 1500, PZ1 + 0.4, 0, lawn, scene); ground(-1500, PZ1 + 0.4, 1500, 1500, 0, lawn, scene);
  // paved terrace + coping
  ground(-9.4, -1.0, 12, PZ0 - 0.4, GY, travertine, scene); boxAt(-9.4, 0, -1.0, 12, GY, PZ0 - 0.4, concG, scene, { cast: false });
  boxAt(PX0 - 0.4, 0, PZ0 - 0.4, PX0, GY, PZ1 + 0.4, concW, scene); boxAt(PX1, 0, PZ0 - 0.4, PX1 + 0.4, GY, PZ1 + 0.4, concW, scene); boxAt(PX0, 0, PZ1, PX1, GY, PZ1 + 0.4, concW, scene); boxAt(PX0, 0, PZ0 - 0.4, PX1, GY, PZ0, concW, scene);
  // pool shell (so edges look solid) + water
  boxAt(PX0, -1.2, PZ0, PX1, -1.1, PZ1, T.solid(0x2a3a3c, { roughness: 0.8 }), scene, { cast: false });
  const wTint = new THREE.MeshStandardMaterial({ color: 0x0f2326, transparent: true, opacity: 0.58, roughness: 0.05, depthWrite: false }); wTint.userData.tileM = 1;
  const wRefl = new THREE.MeshPhysicalMaterial({ color: 0x000000, roughness: 0.02, ior: 1.6, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, envMap: E.env, envMapIntensity: 1.5 }); wRefl.userData.tileM = 1;
  planeY(-0.04, PX0, PZ0, PX1, PZ1, wTint, scene, { world: false }); planeY(-0.035, PX0, PZ0, PX1, PZ1, wRefl, scene, { world: false });
  // stepping stones across the pool towards the entrance
  for (let i = 0; i < 6; i++) boxAt(1.5 - 0.1 * (i % 2), -0.1, PZ1 - 0.2 - i * 1.2, 2.9 - 0.1 * (i % 2), 0.02, PZ1 - 0.2 - i * 1.2 - 0.9, travertine, scene);
  // foreground planting beyond the pool

  // ---- house group (built once, mirrored below for the reflection)
  const buildHouse = (G) => {
    const X0 = -9, X1 = 9.5, ZB = -12, YF = 0.14;
    // plinth + ground floor
    boxAt(X0, 0, ZB, X1, YF, 0.2, concG, G);
    // left stone wing (full height 2 storeys) with deep return
    boxAt(X0, YF, ZB, -3.2, 7.2, 0.0, stone, G);
    boxAt(-3.2, YF, -5, -2.9, 7.2, 0.0, stoneD, G);
    // central glazing bay (ground floor) set under the cantilever
    const gz = -0.4, gw = [{ x: -2.9, y: YF + 0.02, w: 6.4, h: 3.05, cols: 4, frame: 0x111214, fw: 0.045, reveal: 0.2, glow: 1.9, curtain: 0, seed: 3, sill: false, floorY: YF + 0.02, ceilY: YF + 3.5, roomOpts: { depth: 7, side: 2.5, wall: 0xe8d9bd, floor: 0x7a5a3a, warm: 0xffbf70 } }];
    facade({ x0: -2.9, x1: 3.5, y0: YF, y1: 3.5, zBack: gz - 0.35, t: 0.35, wins: gw, mat: plasterW, parent: G });
    boxAt(-2.9, YF, ZB, 3.5, 3.5, -7.2, plasterW, G);
    // entrance: recessed timber pivot door in dark stone
    boxAt(3.5, YF, -2.4, 7.2, 3.5, -2.0, stoneD, G); boxAt(3.5, YF, -2.4, 3.8, 3.5, 0.0, stoneD, G);
    boxAt(4.5, YF, -2.04, 5.9, YF + 2.95, -1.96, timber, G); for (let i = 0; i < 9; i++) boxAt(4.55 + i * 0.15, YF + 0.05, -1.97, 4.6 + i * 0.15, YF + 2.9, -1.94, i % 2 ? timberL : timber, G, { cast: false });
    boxAt(4.62, YF + 0.9, -1.94, 4.66, YF + 2.0, -1.84, brass, G);
    room({ x: 6.2, y: YF, w: 1.0, h: 2.9, z: -2.0, floorY: YF, ceilY: 3.4, depth: 4, glow: 1.4, warm: 0xffbf70, seed: 2 }, G);
    boxAt(3.9, YF, -2.0, 7.2, 0.1, 0.0, concG, G);
    // right wing: plaster box with a tall glass slot
    boxAt(7.2, YF, ZB, X1, 7.2, 0.0, plasterW, G);
    boxAt(7.15, YF, -0.3, 7.3, 7.2, 0.0, brass, G);
    // ---- upper volume: long cantilever clad in vertical timber with brass fins
    const UY0 = 3.5, UY1 = 6.8;
    boxAt(-3.4, UY0, ZB, 9.7, UY0 + 0.3, 3.0, concW, G);                      // slab, 3 m overhang
    boxAt(-3.4, UY0 - 0.02, 0.0, 7.2, UY0, 3.0, timberL, G, { cast: false }); // timber soffit
    boxAt(-3.4, UY0 + 0.3, ZB, 7.2, UY1, 2.4, concG, G);                       // core of the box
    const slats = []; for (let x = -3.3; x < 7.1; x += 0.22) slats.push([x, UY0 + 0.3, 2.4, x + 0.1, UY1, 2.55]); instBoxes(slats, timber, G);
    // glazed slot in the box front, filled by brass fins
    boxAt(-3.0, UY0 + 0.6, 2.35, 2.3, UY1 - 0.4, 2.42, T.solid(0x0d0f11, { roughness: 0.3 }), G);
    glassPane(-3.0, UY0 + 0.6, 2.3, UY1 - 0.4, 2.45, G, { tint: 0x101820, refl: 1.2, opacity: 0.55 });
    room({ x: -3.0, y: UY0 + 0.6, w: 5.3, h: 2.8, z: 2.35, floorY: UY0 + 0.3, ceilY: UY1 - 0.1, depth: 5, glow: 2.2, warm: 0xffbf70, seed: 9, side: 0.2 }, G);
    const fins = []; for (let x = -2.95; x < 2.3; x += 0.32) fins.push([x, UY0 + 0.45, 2.5, x + 0.05, UY1 - 0.25, 2.85]); instBoxes(fins, brass, G);
    boxAt(-3.1, UY1 - 0.35, 2.45, 2.4, UY1 - 0.28, 2.9, brass, G); boxAt(-3.1, UY0 + 0.3, 2.45, 2.4, UY0 + 0.4, 2.9, brass, G);
    // roof slab: thin, projecting
    boxAt(-4.2, UY1, ZB, 10.4, UY1 + 0.28, 3.6, concW, G); boxAt(-4.2, UY1 + 0.28, ZB, 10.4, UY1 + 0.34, 3.6, concG, G);
    // right-hand terrace on the cantilever: glass balustrade and planter
    boxAt(3.4, UY0 + 0.3, 2.4, 7.3, UY0 + 0.34, 3.0, travertine, G, { cast: false });
    // stone wing roof
    boxAt(X0 - 0.2, 7.2, ZB, -3.0, 7.5, 0.4, concW, G);
    // downlights in soffit
    for (const x of [-2.4, -0.8, 0.8, 2.4, 4.0, 5.6]) downlight(x, UY0 - 0.02, 1.6, G, { intensity: 16, color: 0xffd9a0 });
    // vertical brass fins at the stone wing edge and a brass-capped planter
    boxAt(-3.3, YF, 0.0, -3.2, 3.5, 0.3, brass, G); boxAt(-9.1, 7.2, ZB, -3.0, 7.28, 0.5, brass, G, { cast: false });
    // sculptural columns under the cantilever (slim steel) at the outer corner
    for (const x of [-3.4, 7.4]) boxAt(x, YF, 2.7, x + 0.14, UY0, 2.84, blk, G);
    // low planter wall along the terrace
    boxAt(-9.0, YF, -0.0, -3.4, 0.7, 1.3, stone, G);
    wallStreaks({ x0: -9, x1: -3.2, y0: YF, y1: 7.2, z: 0.0, seed: 5, alpha: 0.16, count: 30 }, G);
  };
  const G = new THREE.Group(); scene.add(G); buildHouse(G);
  const M = new THREE.Group(); M.scale.y = -1; scene.add(M); buildHouse(M);
  M.traverse((o) => { if (o.isMesh) { o.castShadow = false; o.receiveShadow = false; } });
  // warm lights (outside the mirrored group)
  const pl = (x, y, z, i, d) => { const p = new THREE.PointLight(0xffbf70, i, d, 1.7); p.position.set(x, y, z); scene.add(p); };
  pl(0, 2, 0.5, 14, 12); pl(5.2, 2.0, 0.5, 8, 9); pl(-1, 5.0, 3.0, 12, 11); pl(2.5, 5.2, 1.2, 8, 8);
  // vegetation: tall slender trees and low planting
  tree2(-12.5, 3.0, { h: 11, crown: 3.2, kind: 'tall', seed: 3, tint: 0xe8f0c8, trunkR: 0.2 }, scene); tree2(13.5, 2, { h: 10, crown: 3.3, kind: 'mango', seed: 6, tint: 0xe2ebc2 }, scene);
  tree2(-6, -16, { h: 12, crown: 4.5, kind: 'neem', seed: 8, tint: 0xdde8c0 }, scene); tree2(8, -17, { h: 12, crown: 4.5, kind: 'neem', seed: 9, tint: 0xdde8c0 }, scene); tree2(-22, -4, { h: 12, crown: 4.5, kind: 'mango', seed: 10, tint: 0xd8e4bc }, scene); tree2(24, -6, { h: 12, crown: 4.5, kind: 'neem', seed: 11, tint: 0xd8e4bc }, scene);
  for (let i = 0; i < 7; i++) bush2(-8.6 + i * 0.8, 0.7, 0.55, 0.38, { seed: 20 + i, leaf: 'fine', cardS: 0.2, tint: 0xe8f0cc }, scene);
  for (let i = 0; i < 4; i++) bush2(-9.5 - i * 1.2, 0.0, 11.5 + (i % 2) * 0.4, 0.55, { seed: 40 + i, leaf: 'broad', tint: 0xe4efcc }, scene);

  finish(scene, 1.6);
  const camera = archCamera({ pos: [9.0, 0.8, 16.2], target: [-1.5, 0.8, 0], focal: 22, shift: 0.17, w, h });
  return { scene, camera, exposure: 0.46, aoRadius: 0.9, aoStrength: 1.0, bloom: true, bloomStrength: 0.18, bloomRadius: 0.7, bloomThreshold: 3.8, grade: { contrast: 1.1, saturation: 1.04, vignette: 0.28, grain: 0.014, warm: 0.035 } };
}
