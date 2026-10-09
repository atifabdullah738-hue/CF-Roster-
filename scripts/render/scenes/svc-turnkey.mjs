// svc-turnkey: finished move-in-ready home at warm dusk, glowing windows, front door ajar, open gate.
import { THREE, T, boxAt, cyl, ground, rng, bindEnv, finish, win, facade, ledgeStone, lawnMat, railRun, instBoxes, ac, tank, wallStreaks, wallFoot, groundGrime, pavers, planeZ, lightPool, lightWall, room, wallLamp, downlight, glassPane } from '../lib/agent5-kit.mjs';
import { tree2, bush2, hedge2, grassTufts, bougain } from '../lib/agent5-nature.mjs';
import { palm } from '../lib/nature.mjs';
import { makeSky } from '../lib/agent5-sky.mjs';
import { setupEnvironment, archCamera } from '../lib/env.mjs';

export default async function build({ renderer, w, h }) {
  const scene = new THREE.Scene(), R = rng(5);
  const E = setupEnvironment({ renderer, scene, sunElevation: 0.4, sunAzimuth: 190, turbidity: 8, rayleigh: 1.6, sunIntensity: 3, envIntensity: 1.5, shadowExtent: 30, shadowCenter: [0, 0, 6] });
  bindEnv(E.env); E.sky.visible = false;
  const SK = makeSky(scene, { exposure: 0.62, sunEl: 1.5, sunAz: 190, zenith: 0x1f2f55, mid: 0x5b5f86, horizon: 0xf2a56b, glow: 0xff9a52, glowAmt: 0.85, glowTight: 5, hazeH: 0.32, cover: 0.45, scale: 1.7, soft: 0.3, cirrus: 0.5, seed: 11, cloudLit: 0xffb08a, cloudShade: 0x6b5a7c, cloudUnder: 0x4e4668, ground: 0x2a2f35, boost: 0.0 });
  scene.fog = new THREE.FogExp2(SK.fogColor.clone().multiplyScalar(0.8), 0.0055);
  const warm = 0xffc27a;
  scene.add(new THREE.HemisphereLight(0x8d98c8, 0x4a3a32, 1.1));

  const pW = T.plaster(0xd9cdb7, { tileM: 3.2, seed: 4 }), pC = T.plaster(0xcdbfa6, { tileM: 3.2, seed: 8 }), pB = T.plaster(0xe8dfcc, { tileM: 3.2, seed: 12 });
  const stone = ledgeStone({ colors: [0x9b8f7c, 0xaa9f8b, 0x857a69, 0xb4a995], tileM: 1.8, seed: 7 }), stone2 = ledgeStone({ colors: [0x6e665c, 0x7b7367, 0x5f5850], tileM: 1.6, seed: 9 });
  const conc = T.concrete(0xb5b2aa, { tileM: 2.5, seed: 5 }), capM = T.concrete(0xaaa7a0, { tileM: 2, seed: 15 });
  const walnut = T.wood({ color: 0x6d4527, tileM: 1.4, planks: 2, gap: false, seed: 21 }), metalB = T.solid(0x1a1b1d, { roughness: 0.45, metalness: 0.55 });
  const lawn = lawnMat({ color: 0x6f8c46, tileM: 3.4, seed: 61 }), asphalt = T.asphalt({ tileM: 7 });

  // ground
  ground(-1500, -1500, 1500, 11.8, 0, lawn, scene); ground(-1500, 11.8, 1500, 40, 0, asphalt, scene); ground(-1500, 40, 1500, 1500, 0, lawn, scene);
  ground(-1500, 9.6, 1500, 11.8, 0.02, pavers({ colors: [0xaaa49a, 0x9c968c, 0xb5afa4], tileM: 1.6, seed: 17 }), scene); boxAt(-1500, 0, 11.8, 1500, 0.17, 12.1, conc, scene);
  groundGrime({ x0: -60, z0: 12.1, x1: 60, z1: 40, y: 0.004, seed: 31, alpha: 0.2, color: [20, 20, 20], scale: 6, cutoff: 0.52, noiseM: 9, res: 2048 }, scene);
  const drive = pavers({ colors: [0xaaa59a, 0xb6b0a4, 0x9c978c], tileM: 1.6, seed: 5 });
  ground(-6.6, -4.8, -2.4, 9.6, 0.035, drive, scene); boxAt(-6.8, 0, -4.8, -6.6, 0.07, 9.6, conc, scene); boxAt(-2.4, 0, -4.8, -2.2, 0.07, 9.6, conc, scene);
  ground(-1.9, -2.0, 1.4, 4.6, 0.03, pavers({ colors: [0xb4ad9f, 0xa49d90], tileM: 1.2, seed: 22, across: 6 }), scene);
  // curved-ish path of paving slabs from gate to porch
  for (let i = 0; i < 7; i++) { const px = 2.8 - i * 0.55; boxAt(px - 0.55, 0, 9.4 - i * 0.95 - 0.7, px + 0.55, 0.045, 9.4 - i * 0.95, T.concrete(0xc4c0b6, { tileM: 1.2, seed: 31 }), scene); }

  // ---------------------------------------------------------------- house
  const H = new THREE.Group(); scene.add(H);
  const XL = -7, XR = 7, D = 12, P = 0.5, F = 3.3, SL = 0.28, Y1 = P + F + SL, Y2 = Y1 + F, YR = Y2 + SL;
  boxAt(XL - 0.1, 0, -D, XR + 0.1, P, 0.2, stone2, H);
  // ground floor: wall with 2 glowing windows left & right of the portal
  const gW = [{ x: -6.0, y: P + 0.8, w: 2.2, h: 1.7, cols: 2, glow: 1.9, seed: 1, curtain: 0.5, floorY: P + 0.05, ceilY: Y1 - SL - 0.05, frame: 0x2a2623, sillMat: capM, lintel: true, roomOpts: { depth: 5, wall: 0xe4cfa6, warm } },
    { x: 3.2, y: P + 0.8, w: 3.2, h: 1.7, cols: 3, glow: 2.1, seed: 2, curtain: 0.4, floorY: P + 0.05, ceilY: Y1 - SL - 0.05, frame: 0x2a2623, sillMat: capM, lintel: true, roomOpts: { depth: 6, wall: 0xe9d3a8, warm } }];
  facade({ x0: XL, x1: XR, y0: P, y1: Y1 - SL, zBack: -0.35, t: 0.35, wins: gW, mat: pW, parent: H });
  boxAt(XL, P, -D, XR, Y1 - SL, -7.5, pW, H);
  boxAt(XL, P, -7.5, XL + 0.3, Y1 - SL, -0.35, pW, H); boxAt(XR - 0.3, P, -7.5, XR, Y1 - SL, -0.35, pW, H);
  // stone pilasters + portal
  for (const x of [-7.0, -3.4, 2.4, 6.5]) boxAt(x, P, 0.0, x + 0.5, Y1 - SL, 0.18, stone, H);
  boxAt(-3.0, P, -2.6, 2.4, Y1 - SL, -2.2, stone, H);                          // recessed entrance wall
  boxAt(-3.0, P, -2.2, -2.6, Y1 - SL, 0.0, stone, H); boxAt(2.0, P, -2.2, 2.4, Y1 - SL, 0.0, stone, H);
  for (const x of [-2.9, 1.6]) { boxAt(x, 0, 0.2, x + 0.5, Y1 - SL, 0.7, stone, H); boxAt(x - 0.06, P, 0.15, x + 0.56, P + 0.25, 0.75, capM, H); boxAt(x - 0.06, Y1 - SL - 0.25, 0.15, x + 0.56, Y1 - SL, 0.75, capM, H); }
  // porch floor & steps
  boxAt(-3.0, 0, -2.2, 2.4, P, 0.9, conc, H); boxAt(-3.3, 0.0, 0.9, 2.7, 0.25, 1.5, conc, H); boxAt(-3.6, 0, 1.5, 3.0, 0.12, 2.1, conc, H);
  // door: left leaf closed, right leaf ajar, warm hall behind
  const dx0 = -1.1, dw = 1.1, dh = 2.5;
  boxAt(dx0 - 0.1, P, -2.3, dx0 + 2 * dw + 0.1, P + dh + 0.1, -2.2, metalB, H);
  room({ x: dx0, y: P, w: 2 * dw, h: dh, z: -2.3, floorY: P, ceilY: P + 3.0, depth: 5.5, side: 1.5, glow: 2.6, warm, seed: 7, wall: 0xf1dcb4, floor: 0xb59a74 }, H);
  boxAt(dx0, P, -2.3, dx0 + dw, P + dh, -2.22, walnut, H);                        // closed leaf
  const hinge = new THREE.Group(); hinge.position.set(dx0 + 2 * dw, 0, -2.2); hinge.rotation.y = 0.75; H.add(hinge);     // open leaf, hinged on the right
  boxAt(-dw, P, -0.0, 0, P + dh, 0.08, walnut, hinge); boxAt(-0.18, P + 1.0, -0.03, -0.14, P + 1.5, 0.14, T.metal(0xb8924e, { roughness: 0.3 }), hinge);
  for (let i = 0; i < 3; i++) boxAt(-dw + 0.14, P + 0.2 + i * 0.75, 0.08, -0.14, P + 0.2 + i * 0.75 + 0.5, 0.1, T.solid(0x5a381f, { roughness: 0.5 }), hinge, { cast: false });
  boxAt(dx0 + dw - 0.07, P + 1.0, -2.22, dx0 + dw - 0.04, P + 1.5, -2.14, T.metal(0xb8924e, { roughness: 0.3 }), H);
  // light spill from the door on the porch floor + steps
  lightPool({ x0: -1.8, z0: -2.1, x1: 2.2, z1: 3.4, y: P + 0.01, color: warm, intensity: 0.7 }, H); lightPool({ x0: -2.6, z0: 0.9, x1: 3.0, z1: 5.2, y: 0.14, color: warm, intensity: 0.35 }, H);
  const dl = new THREE.PointLight(warm, 26, 11, 1.6); dl.position.set(0.5, P + 1.6, -1.6); scene.add(dl);
  const dl2 = new THREE.PointLight(warm, 10, 9, 1.8); dl2.position.set(0.5, P + 1.2, 0.8); scene.add(dl2);
  // porch ceiling lights + wall lanterns
  for (const x of [-2.0, -0.3, 1.4]) { downlight(x, Y1 - SL - 0.02, -0.4, H, { intensity: 22, color: 0xffd9a0 }); }
  wallLamp(-1.3, P + 2.35, -2.2, H, { color: 0xffd9a0, intensity: 14, dir: 1 }); wallLamp(2.0, P + 2.35, -2.2, H, { color: 0xffd9a0, intensity: 14, dir: 1 });
  // slab + upper floor
  boxAt(XL - 0.3, Y1 - SL, -D - 0.3, XR + 0.3, Y1, 0.9, pB, H); boxAt(XL - 0.35, Y1 - SL - 0.12, 0.88, XR + 0.35, Y1 - SL, 0.98, capM, H);
  const uW = [{ x: -6.0, y: Y1 + 0.8, w: 1.6, h: 1.6, cols: 2, glow: 2.0, seed: 3, curtain: 0.6, floorY: Y1 + 0.02, ceilY: Y2 - 0.05, frame: 0x2a2623, sillMat: capM, lintel: true, roomOpts: { depth: 4.4, wall: 0xe6c99a, warm } },
    { x: -3.5, y: Y1 + 0.05, w: 2.2, h: 2.3, cols: 2, glow: 1.8, seed: 4, curtain: 0.5, floorY: Y1 + 0.02, ceilY: Y2 - 0.05, frame: 0x2a2623, reveal: 0.15, sill: false, roomOpts: { depth: 4.6, wall: 0xe9d3a8, warm } },
    { x: 1.2, y: Y1 + 0.05, w: 2.2, h: 2.3, cols: 2, glow: 1.6, seed: 5, curtain: 0.5, floorY: Y1 + 0.02, ceilY: Y2 - 0.05, frame: 0x2a2623, reveal: 0.15, sill: false, roomOpts: { depth: 4.6, wall: 0xe0c496, warm } },
    { x: 4.6, y: Y1 + 0.8, w: 1.6, h: 1.6, cols: 2, glow: 0, seed: 6, curtain: 0.7, floorY: Y1 + 0.02, ceilY: Y2 - 0.05, frame: 0x2a2623, sillMat: capM, lintel: true, roomOpts: { depth: 4.4 } }];
  facade({ x0: XL, x1: XR, y0: Y1, y1: Y2, zBack: -0.35, t: 0.35, wins: uW, mat: pC, parent: H });
  boxAt(XL, Y1, -D, XR, Y2, -5.5, pC, H); boxAt(XL, Y1, -5.5, XL + 0.3, Y2, -0.35, pC, H); boxAt(XR - 0.3, Y1, -5.5, XR, Y2, -0.35, pC, H);
  // balcony in front of the two central doors: slab + baluster railing
  boxAt(-3.9, Y1 - 0.0, 0.0, 3.9, Y1 + 0.1, 1.5, pB, H); boxAt(-3.95, Y1 + 0.1, 0.0, 3.95, Y1 + 0.13, 1.55, T.tiles({ color: 0xd2c8b6, tileM: 2.4, n: 4, seed: 51, marble: false }), H, { cast: false });
  const bal = []; for (let x = -3.8; x < 3.85; x += 0.14) bal.push([x, Y1 + 0.13, 1.38, x + 0.07, Y1 + 1.0, 1.45]);
  for (let z = 0.1; z < 1.45; z += 0.14) { bal.push([-3.85, Y1 + 0.13, z, -3.78, Y1 + 1.0, z + 0.07]); bal.push([3.78, Y1 + 0.13, z, 3.85, Y1 + 1.0, z + 0.07]); }
  instBoxes(bal, pB, H); boxAt(-3.9, Y1 + 1.0, 1.32, 3.9, Y1 + 1.1, 1.52, capM, H); boxAt(-3.9, Y1 + 1.0, 0.0, -3.75, Y1 + 1.1, 1.52, capM, H); boxAt(3.75, Y1 + 1.0, 0.0, 3.9, Y1 + 1.1, 1.52, capM, H);
  // cornice + parapet + roof stuff
  boxAt(XL - 0.4, Y2, -D - 0.4, XR + 0.4, Y2 + SL, 0.6, pB, H); boxAt(XL - 0.5, Y2 - 0.1, 0.55, XR + 0.5, Y2 + SL, 0.75, capM, H);
  boxAt(XL - 0.3, YR, 0.1, XR + 0.3, YR + 1.0, 0.45, pB, H); boxAt(XL - 0.3, YR, -D - 0.2, XR + 0.3, YR + 1.0, -D, pB, H); boxAt(XL - 0.3, YR, -D, XL - 0.1, YR + 1.0, 0.1, pB, H); boxAt(XR + 0.1, YR, -D, XR + 0.3, YR + 1.0, 0.1, pB, H);
  boxAt(XL - 0.38, YR + 1.0, -D - 0.28, XR + 0.38, YR + 1.07, 0.52, capM, H);
  tank(-2.5, YR, -7, H, { r: 0.65, h: 1.3 }); tank(-0.8, YR, -7.4, H, { r: 0.6, h: 1.2 }); tank(4.5, YR, -9, H, { r: 0.6, h: 1.2 });
  ac(XR, Y1 + 0.2, -3, H, { w: 0.86, h: 0.62, d: 0.34 });
  wallStreaks({ x0: XL, x1: XR, y0: P, y1: Y2, z: 0.0, seed: 3, alpha: 0.18, count: 40 }, H);
  // warm washes on the front wall from the window light
  for (const [x0, x1] of [[-6.6, -3.4], [2.8, 6.8]]) lightWall({ x0, y0: P, x1, y1: Y1 - SL, z: 0.0, color: warm, intensity: 0.12 }, H);
  lightWall({ x0: -3.9, y0: Y1, x1: 3.9, y1: Y2, z: 0.0, color: warm, intensity: 0.1 }, H);

  // ---------------------------------------------------------------- gate, boundary, garden lighting
  const wz = 9.9, wallM = T.plaster(0xd6cab4, { tileM: 3, seed: 30 });
  const barL = []; const seg = (a, b) => { boxAt(a, 0, wz - 0.12, b, 0.62, wz + 0.12, stone2, scene); boxAt(a - 0.02, 0.62, wz - 0.15, b + 0.02, 0.7, wz + 0.15, capM, scene); for (let x = a + 0.06; x < b - 0.03; x += 0.13) barL.push([x, 0.7, wz - 0.012, x + 0.024, 1.5, wz + 0.012]); boxAt(a, 1.46, wz - 0.03, b, 1.52, wz + 0.03, metalB, scene); };
  seg(-9.5, -7.4); seg(-2.0, 9.5); instBoxes(barL, metalB, scene);
  const pil = (x0, x1) => { boxAt(x0, 0, wz - 0.28, x1, 2.0, wz + 0.28, stone, scene); boxAt(x0 - 0.05, 2.0, wz - 0.33, x1 + 0.05, 2.08, wz + 0.33, capM, scene); boxAt(x0 + 0.06, 2.08, wz - 0.2, x1 - 0.06, 2.34, wz + 0.2, T.emissive(0xffd9a0, 22), scene, { cast: false }); boxAt(x0 + 0.02, 2.34, wz - 0.24, x1 - 0.02, 2.4, wz + 0.24, metalB, scene); };
  pil(-7.4, -6.9); pil(-2.5, -2.0);
  for (const x of [-7.15, -2.25]) { const p = new THREE.PointLight(0xffc27a, 7, 8, 1.8); p.position.set(x, 2.2, wz + 0.6); scene.add(p); }
  // open gate leaves (swung inward ~75deg)
  const leaf = (hx, sgn) => { const g = new THREE.Group(); g.position.set(hx, 0, wz); g.rotation.y = sgn * -1.25; scene.add(g); const bars = []; for (let x = 0.08; x < 2.15; x += 0.13) bars.push([sgn * x - 0.012, 0.15, -0.012, sgn * x + 0.012, 1.85, 0.012]); instBoxes(bars, metalB, g); boxAt(Math.min(0, sgn * 2.2), 0.1, -0.025, Math.max(0, sgn * 2.2), 0.17, 0.025, metalB, g); boxAt(Math.min(0, sgn * 2.2), 1.82, -0.025, Math.max(0, sgn * 2.2), 1.9, 0.025, metalB, g); boxAt(Math.min(0, sgn * 2.2), 0.95, -0.02, Math.max(0, sgn * 2.2), 0.99, 0.02, metalB, g); for (let i = 0; i < 6; i++) { const s = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 6), metalB); s.position.set(sgn * (0.2 + i * 0.37), 1.92, 0); g.add(s); } };
  leaf(-6.9, 1); leaf(-2.5, -1);
  // lawn, beds, trees (uplit)
  grassTufts({ x0: -9, z0: 0.5, x1: 9.5, z1: 9.6, y: 0, count: 5000, h: 0.07, w: 0.14, seed: 3, tint: 0xd8e8b4, mask: (x, z) => !((x > -6.8 && x < -2.2) || (x > -1.9 && x < 1.5 && z < 5) || (x > 1.5 && x < 4.2 && z > 3.5)) }, scene);
  hedge2(3.5, 8.4, 9.2, 8.4, { h: 0.6, w: 0.5, seed: 2, tint: 0xd8ecc0 }, scene); hedge2(-9.2, 8.4, -7.2, 8.4, { h: 0.6, w: 0.5, seed: 4, tint: 0xd8ecc0 }, scene);
  for (const [x, z, s] of [[-7.8, 2.0, 5], [-8.2, 4.2, 6], [3.6, 1.9, 7], [5.2, 2.3, 8], [6.6, 2.0, 9], [-1.9, 4.8, 10], [1.5, 4.8, 11]]) bush2(x, 0, z, 0.5, { seed: s, tint: 0xd6e8c0, leaf: s % 2 ? 'broad' : 'neem' }, scene);
  boxAt(-9.2, 0, 0.9, -3.3, 0.18, 1.5, stone2, scene); boxAt(3.2, 0, 0.9, 7.0, 0.18, 1.5, stone2, scene);
  palm(-8.2, 6.4, { h: 6.5, seed: 4, lean: 0.2 }, scene); palm(8.0, 6.0, { h: 7.2, seed: 6, lean: -0.2 }, scene);
  tree2(10.5, 3.0, { h: 8.5, crown: 3.4, kind: 'mango', seed: 14, tint: 0xd4e4c0 }, scene); tree2(-12.5, 2.0, { h: 9, crown: 3.4, kind: 'neem', seed: 15, tint: 0xd7e6c2 }, scene);
  tree2(0, -17, { h: 12, crown: 4.5, kind: 'neem', seed: 16, tint: 0xd0e0bd }, scene); tree2(-13, -12, { h: 11, crown: 4.2, kind: 'mango', seed: 17, tint: 0xcfdfbc }, scene); tree2(13, -14, { h: 12, crown: 4.4, kind: 'neem', seed: 18, tint: 0xd0e0bd }, scene);
  tree2(-16, 11, { h: 8, crown: 3, kind: 'neem', seed: 19, tint: 0xd2e1bf }, scene); tree2(15, 11, { h: 8, crown: 3, kind: 'neem', seed: 20, tint: 0xd2e1bf }, scene);
  const bol = T.emissive(0xffd9a0, 16);
  for (const [x, z] of [[-1.0, 2.2], [1.0, 2.2], [-2.8, 6.8], [-2.8, 3.0], [3.2, 5.0], [4.8, 3.5], [-6.0, 3.0]]) { cyl(x, 0.28, z, 0.05, 0.05, 0.56, T.solid(0x222222, { roughness: 0.5 }), scene, { seg: 8 }); cyl(x, 0.6, z, 0.07, 0.07, 0.1, bol, scene, { seg: 10, cast: false }); lightPool({ x0: x - 1.1, z0: z - 1.1, x1: x + 1.1, z1: z + 1.1, y: 0.05, color: 0xffc27a, intensity: 0.22 }, scene); }
  for (const [x, z] of [[-1.0, 2.2], [3.2, 5.0], [-6.0, 3.0]]) { const p = new THREE.PointLight(0xffc27a, 3.2, 6, 1.8); p.position.set(x, 0.8, z); scene.add(p); }
  // neighbours
  const nb = (x0, x1, nf, tone, seed) => { const g = new THREE.Group(); scene.add(g); const pm = T.plaster(tone, { tileM: 3.2, seed: 70 + seed }); const wins = []; for (let k = 0; k < nf; k++) for (let i = 0; i < 3; i++) wins.push({ x: x0 + 1.4 + i * 4.4, y: 0.9 + k * 3.3, w: 2.0, h: 1.4, cols: 2, frame: 0x2f2d2b, seed: seed * 5 + k * 3 + i, glow: R() < 0.55 ? 1.8 : 0, curtain: 0.5, floorY: 0.1 + k * 3.3, ceilY: 3.2 + k * 3.3, roomOpts: { depth: 3.4, warm }, sillMat: capM });
    facade({ x0, x1, y0: 0, y1: nf * 3.3, zBack: 0.15, t: 0.35, wins, mat: pm, parent: g }); boxAt(x0, 0, -13, x1, nf * 3.3, -4.4, pm, g); boxAt(x0 - 0.2, nf * 3.3, -13, x1 + 0.2, nf * 3.3 + 0.9, 0.7, pm, g); boxAt(x0 - 0.2, nf * 3.3 + 0.9, -13, x1 + 0.2, nf * 3.3 + 0.97, 0.7, capM, g); boxAt(x0 - 1, 0, 9.9, x1 + 1, 1.6, 10.1, wallM, g); };
  nb(-27, -12.5, 2, 0xd2c7b0, 1); nb(12.5, 28, 3, 0xcdc6b8, 2);

  finish(scene, 1.4);
  const camera = archCamera({ pos: [5.2, 1.6, 18.5], target: [-0.8, 1.6, 0], focal: 28, shift: 0.1, w, h });
  return { scene, camera, exposure: 0.62, aoRadius: 0.9, aoStrength: 1.0, bloom: true, bloomStrength: 0.3, bloomRadius: 0.75, bloomThreshold: 6, grade: { contrast: 1.1, saturation: 1.05, vignette: 0.3, grain: 0.016, warm: 0.02 } };
}
