// Wide modern 1-Kanal villa, golden hour.
import * as P from '../lib/agent2-parts.mjs';
import { setupSky as setupEnvironment, archCamera } from '../lib/agent2-env.mjs';
import { acUnit, waterTank, pillarLamp, planter, solarPanels } from '../lib/arch.mjs';
const { THREE, T, boxAt, cyl, ground, glazed, wallPanel, openingPts, tree, palm, bush, hedge, leafy, batten, barFence, streetscape, neighbour, parapetCap, streetLamp } = P;

export default async function build({ renderer, w, h }) {
  const scene = new THREE.Scene();
  setupEnvironment({ renderer, scene, sunElevation: 11, sunAzimuth: 42, sunIntensity: 7.0, sunColor: 0xffc58a, envIntensity: 0.75, shadowExtent: 38, shadowCenter: [0, 0, 2],
    dome: { zenith: [0.16, 0.42, 1.25], mid: [0.42, 0.72, 1.35], horizon: [1.9, 1.25, 0.8], sunCol: [3.6, 1.9, 0.9], coverage: 0.46, soft: 0.24, cloudScale: 1.5, seed: 4.2, cloudLit: [2.4, 2.1, 1.8], cloudShade: [0.8, 0.8, 0.95] },
    fog: { color: [1.3, 1.1, 0.95], density: 0.0035 } });

  // ---- materials
  const white = T.plaster(0xece7de, { tileM: 3.5, seed: 4 }), white2 = T.plaster(0xe4dfd5, { tileM: 3.2, seed: 8 }), grey = T.plaster(0x8c8f92, { tileM: 3.2, seed: 14 });
  const charcoal = T.plaster(0x2c2f33, { tileM: 3, seed: 2, roughness: 0.7 }), coping = T.concrete(0x6f6f6c, { tileM: 2, seed: 23 });
  const stone = T.stone({ color: 0x9a948b, tileM: 2.2, seed: 11, rows: 20 }), stoneL = T.stone({ color: 0xb8afa0, tileM: 2.4, seed: 15, rows: 12 });
  const teak = T.wood({ color: 0xb9854f, tileM: 1.6, planks: 5, seed: 6 }), teakSlat = T.wood({ color: 0xc28c52, tileM: 1.2, planks: 1, gap: false, seed: 4 }), teakDoor = T.wood({ color: 0x8f5f36, tileM: 1.5, planks: 3, seed: 9 });
  const conc = T.concrete(0xa8a7a2, { tileM: 2.5, seed: 31 }), steel = T.metal(0x23272c, { roughness: 0.4 });
  const pave = T.paving({ color: 0xc2bdb2, tileM: 2.6, n: 5, seed: 5 }), paveD = T.paving({ color: 0x8d8a84, tileM: 2.0, n: 8, seed: 6 }), terrace = T.tiles({ color: 0xcfc8ba, grout: 0x85807a, tileM: 2.4, n: 3, marble: false, roughness: 0.55, seed: 33 });
  const lawnA = T.grass({ color: 0x6a9a3e, tileM: 5, seed: 61 }), lawnB = T.grass({ color: 0x5e8e36, tileM: 4.3, seed: 64 });
  const warm = (c, i) => T.emissive(c, i);

  // ---- ground
  ground(-140, -90, 140, 9, 0, T.grass({ color: 0x6b8c45, tileM: 6, seed: 66 }), scene);
  const street = streetscape({ scene, zb: 8.2, foot: 2.6, roadW: 21, paveColor: 0xb9b3a7 }); street.roadMat.color.setRGB(1.85, 1.7, 1.55);
  // lawn mowing stripes
  for (let i = 0; i < 9; i++) ground(-6 + i * 1.6, 0.3, -6 + (i + 1) * 1.6, 7.9, 0.004, i % 2 ? lawnA : lawnB, scene);
  ground(-14, 0.3, -6, 7.9, 0.004, lawnB, scene); ground(8.6, 0.3, 14, 7.9, 0.004, lawnA, scene);
  // driveway into porch
  ground(-10.0, -6, -4.6, 8.2, 0.012, pave, scene); for (const x of [-10.0, -7.3, -4.6]) boxAt(x - 0.04, 0.012, -6, x + 0.04, 0.02, 8.2, paveD, scene, { cast: false });
  for (let z = -5.5; z < 8.2; z += 1.1) boxAt(-10, 0.012, z, -4.6, 0.017, z + 0.05, paveD, scene, { cast: false });
  ground(-10.0, 8.2, -4.6, 10.8, 0.01, pave, scene);   // apron over footpath
  // entry path + stepping stones
  for (let i = 0; i < 6; i++) boxAt(-0.9 + (i % 2 ? 0.1 : -0.05), 0.0, 1.6 + i * 1.0, 0.9 + (i % 2 ? 0.1 : -0.05), 0.04, 2.4 + i * 1.0, stoneL, scene);
  ground(-1.6, 0.0, 1.8, 1.7, 0.03, terrace, scene);

  const H = new THREE.Group(); scene.add(H);
  const FH = 3.35, SL = 0.38, UH = 3.2, TOP = FH + SL + UH;

  // =============================== A. LEFT: car-porch with cantilevered white box over
  boxAt(-10.3, 0, -16, -3.8, 0.0, 0, conc, H, { cast: false });
  // porch back wall (timber) + side door
  boxAt(-10.3, 0, -6.0, -3.8, FH, -5.8, teak, H);
  boxAt(-10.3, 0, -6.0, -10.1, FH, 0, stone, H); // left stone cheek wall (deep) to hold the volume
  P.glazed({ x: -9.1, y: 0.0, w: 1.0, h: 2.3, z: -5.8, cols: 1, frame: 0x1c1f24, glassMat: P.glass({ mode: 'day', seed: 5, env: 2.5, emis: 0.3 }), parent: H, reveal: 0.05 });
  for (const x of [-7.6, -6.9, -6.2, -5.5]) boxAt(x, 0, -5.8, x + 0.04, FH, -5.76, steel, H); // grooves
  boxAt(-4.15, 0, -6, -3.8, FH, 0, stone, H);   // right stone cheek
  // soffit lining (timber) + downlights
  boxAt(-10.1, FH - 0.04, -6.0, -4.15, FH, 1.2, teak, H, { cast: false });
  const down = warm(0xfff1d0, 9);
  for (const x of [-9.2, -8.1, -7.0, -5.9, -4.8]) for (const z of [-4.2, -1.8, 0.6]) { const d = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.02, 14), down); d.position.set(x, FH - 0.05, z); H.add(d); }
  P.lightPoint(scene, 0xffd9a8, 5, 8, -7.2, FH - 0.5, -2.5); P.lightPoint(scene, 0xffd9a8, 4, 6, -7.2, FH - 0.5, 0.2);
  // cantilever slab + white box
  boxAt(-10.5, FH, -16, -3.6, FH + SL, 1.25, charcoal, H);
  boxAt(-10.3, FH + SL, -16, -3.8, TOP, 1.05, white, H);
  boxAt(-10.5, TOP, -16, -3.6, TOP + 0.32, 1.25, charcoal, H);
  // ribbon window in white box
  const wy = FH + SL + 0.75;
  boxAt(-10.3, FH + SL, 1.05, -3.8, wy, 1.06, white, H);
  boxAt(-8.9 - 0.9, wy, 1.0, -4.1 + 0.0, wy + 1.55, 1.05, white, H, { cast: false });
  boxAt(-10.3, wy + 1.55, 1.0, -3.8, TOP, 1.05, white, H, { cast: false });
  // better: real wall with opening
  { const o = openingPts({ x: -9.2, y: wy, w: 4.6, h: 1.55 });
    wallPanel({ x0: -10.3, x1: -3.8, y0: FH + SL, y1: TOP, z0: 1.05, t: 0.3, holes: [o], mat: white, parent: H }); }
  glazed({ x: -9.2, y: wy, w: 4.6, h: 1.55, z: 1.35, cols: 3, rows: 1, frame: 0x1b1d20, mode: 'day', seed: 2, reveal: 0.22, parent: H, sill: coping });
  // timber fin to the right of the window
  boxAt(-4.35, FH + SL + 0.1, 1.05, -4.1, TOP - 0.1, 1.5, teak, H);
  // steel column at the cantilever corner
  { const c = new THREE.CylinderGeometry(0.1, 0.1, FH, 18); c.translate(-9.95, FH / 2, 1.0); P.add(c, steel, H); }
  // upper-left planter box on roof edge (greenery spilling)
  planter(-10.2, 1.4, -3.9, 1.95, FH + SL, 0.5, charcoal, H); hedge(-10.1, 1.67, -4.0, 1.67, { h: 0.55, w: 0.35, y: FH + SL + 0.45, density: 80, seed: 8, color: 0x5d9a3a }, H);

  P.car({ x: -7.3, z: -2.2, rot: 0.0, color: 0xf3f2ee, parent: H });
  P.weather({ x0: -10.3, x1: -3.8, y0: TOP - 1.0, y1: TOP, z: 1.05, parent: H, dir: 'down', alpha: 0.3, seed: 3 });
  P.weather({ x0: -10.3, x1: -3.8, y0: FH + SL, y1: FH + SL + 0.8, z: 1.05, parent: H, dir: 'down', alpha: 0.2, seed: 4 });
  // =============================== B. CENTRE: stone-clad double height entrance volume
  const cx0 = -3.8, cx1 = 2.7, cz = 0.45;
  { const entry = openingPts({ x: -2.35, y: 0, w: 2.8, h: FH + 0.0 });
    wallPanel({ x0: cx0, x1: cx1, y0: 0, y1: TOP + 0.55, z0: cz - 0.45, t: 0.45, holes: [entry], mat: stone, parent: H }); }
  boxAt(cx0, 0, -16, cx1, TOP + 0.55, cz - 0.45, stone, H);
  boxAt(cx0 - 0.02, TOP + 0.55, -16, cx1 + 0.02, TOP + 0.62, cz + 0.05, coping, H);
  // entry recess: back wall wood, pivot door, ceiling light
  const rz = -1.35;
  boxAt(-2.35, 0, rz - 0.4, 0.45, FH, rz, teak, H);
  boxAt(-2.35, FH - 0.0, rz - 0.4, 0.45, FH + 0.2, 0.5, charcoal, H);
  boxAt(-2.35, 0, rz, 0.45, 0.14, 0.5, terrace, H, { cast: false });
  P.doorLeaf({ x: -1.35, y: 0, w: 1.3, h: 2.65, z: rz + 0.02, reveal: 0.1, mat: teakDoor, frameMat: T.metal(0x25282c), panels: false, parent: H });
  glazed({ x: -2.15, y: 0.0, w: 0.5, h: 2.65, z: rz + 0.02, cols: 1, frame: 0x1c1f24, mode: 'day', seed: 7, reveal: 0.05, parent: H });
  glazed({ x: -0.0, y: 0.0, w: 0.4, h: 2.65, z: rz + 0.02, cols: 1, frame: 0x1c1f24, mode: 'day', seed: 8, reveal: 0.05, parent: H });
  for (const x of [-1.6, -0.7]) { const d = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.02, 14), warm(0xfff0cc, 10)); d.position.set(x, FH - 0.03, rz + 0.8); H.add(d); }
  P.lightPoint(scene, 0xffd9a8, 4.5, 6, -0.9, FH - 0.6, -0.2);
  // tall vertical slit window on right of stone volume
  { const o = openingPts({ x: 1.1, y: 0.5, w: 0.7, h: TOP - 0.2 - 0.5 });
    wallPanel({ x0: 0.9, x1: 2.0, y0: 0.2, y1: TOP - 0.1, z0: cz - 0.02, t: 0.02, holes: [], mat: stone, parent: H }); void o; }
  glazed({ x: 1.15, y: 0.55, w: 0.65, h: TOP - 0.65, z: cz + 0.0, cols: 1, rows: 4, frame: 0x1c1f24, mode: 'day', seed: 12, reveal: 0.0, depth: 0.14, frameW: 0.07, parent: H });
  boxAt(1.0, 0.45, cz - 0.1, 1.95, 0.55, cz + 0.12, coping, H);
  // timber box window projecting at first floor
  { const bz = cz + 0.85, by = FH + SL + 0.45;
    boxAt(-3.1, by - 0.28, cz, -0.2, by + 1.85, bz, teak, H);
    boxAt(-3.18, by - 0.36, cz, -0.12, by - 0.28, bz + 0.06, charcoal, H); boxAt(-3.18, by + 1.85, cz, -0.12, by + 1.93, bz + 0.06, charcoal, H);
    glazed({ x: -2.8, y: by, w: 2.3, h: 1.45, z: bz, cols: 2, frame: 0x1b1d20, mode: 'day', seed: 15, reveal: 0.0, depth: 0.09, parent: H });
    boxAt(-3.1, by - 0.28, bz, -2.8, by + 1.85, bz + 0.02, teak, H); boxAt(-0.5, by - 0.28, bz, -0.2, by + 1.85, bz + 0.02, teak, H); }
  // vertical lit groove lines for stone volume rhythm
  for (const x of [-3.5, 2.4]) boxAt(x, 0, cz, x + 0.06, TOP + 0.5, cz + 0.02, T.solid(0x1d1f22), H, { cast: false });
  pillarLamp(-2.9, 2.4, cz + 0.05, H, { intensity: 7 }); pillarLamp(2.1, 2.4, cz + 0.05, H, { intensity: 7 });
  // name plate (blank)
  boxAt(-3.3, 1.45, cz, -2.95, 1.7, cz + 0.05, T.metal(0xc8a052, { roughness: 0.25 }), H);

  // =============================== C. RIGHT: living pavilion
  const rx0 = 2.7, rx1 = 10.4, setZ = -1.6;
  // ground floor: glass wall set back under the cantilever
  { const o = openingPts({ x: 3.5, y: 0.0, w: 6.2, h: 3.05 });
    wallPanel({ x0: rx0, x1: rx1, y0: 0, y1: FH, z0: setZ - 0.3, t: 0.3, holes: [o], mat: white2, parent: H }); }
  boxAt(rx0, 0, -16, rx1, FH, setZ - 0.3, white2, H);
  glazed({ x: 3.5, y: 0.0, w: 6.2, h: 3.05, z: setZ, cols: 4, rows: 1, frame: 0x1a1c1f, mode: 'day', seed: 21, reveal: 0.0, depth: 0.1, frameW: 0.07, transomAt: 2.45, parent: H, glassMat: P.glass({ mode: 'day', seed: 21, env: 2.2, emis: 0.38 }) });
  boxAt(rx0, 0, setZ, rx1, 0.16, 2.6, terrace, H); boxAt(rx0 - 0.05, 0.0, 2.6, rx1 + 0.0, 0.16, 2.75, coping, H);
  // slab + upper volume (dark with timber slats)
  boxAt(rx0 - 0.2, FH, -16, rx1 + 0.2, FH + SL, 2.65, charcoal, H);
  boxAt(rx0, FH + SL, -16, rx1, TOP, 2.2, grey, H);
  boxAt(rx0 - 0.2, TOP, -16, rx1 + 0.2, TOP + 0.32, 2.65, charcoal, H);
  // upper face: recessed glass band + slats at each end
  { const o = openingPts({ x: 4.2, y: FH + SL + 0.65, w: 4.9, h: 1.75 });
    wallPanel({ x0: rx0, x1: rx1, y0: FH + SL, y1: TOP, z0: 2.2, t: 0.0001, holes: [], mat: grey, parent: H }); void o; }
  { const o = openingPts({ x: 4.2, y: FH + SL + 0.65, w: 4.9, h: 1.75 });
    wallPanel({ x0: rx0, x1: rx1, y0: FH + SL, y1: TOP, z0: 2.2, t: 0.25, holes: [o], mat: grey, parent: H }); }
  glazed({ x: 4.2, y: FH + SL + 0.65, w: 4.9, h: 1.75, z: 2.45, cols: 3, frame: 0x1a1c1f, mode: 'day', seed: 31, reveal: 0.25, parent: H, sill: coping });
  batten({ x0: rx0 + 0.0, x1: 4.0, y0: FH + SL + 0.05, y1: TOP - 0.05, z0: 2.2, z1: 2.5, pitch: 0.16, w: 0.07, mat: teakSlat, parent: H });
  batten({ x0: 9.3, x1: rx1, y0: FH + SL + 0.05, y1: TOP - 0.05, z0: 2.2, z1: 2.5, pitch: 0.16, w: 0.07, mat: teakSlat, parent: H });
  // sun-shading louvre blades over upper glass band
  for (let i = 0; i < 4; i++) boxAt(4.1, FH + SL + 2.5 + i * 0.0 - 0.0 + 0.0, 2.2 + i * 0.0, 9.2, FH + SL + 2.55, 3.0, charcoal, H, { cast: true });
  // roof-level: water-tank enclosure + AC + solar
  boxAt(7.0, TOP + 0.32, -9, 9.8, TOP + 1.9, -6.6, white, H); for (let y = TOP + 0.5; y < TOP + 1.8; y += 0.14) boxAt(7.0, y, -6.6, 9.8, y + 0.07, -6.55, charcoal, H);
  boxAt(7.0, TOP + 1.9, -9, 9.8, TOP + 2.0, -6.6, coping, H);
  P.ac(4.6, TOP + 0.4, -12, H); P.ac(5.6, TOP + 0.4, -12, H);
  solarPanels(-9.0, -11.0, 5, 1, TOP + 0.32, H, { tilt: 0.38 });
  // parapet railing on slab edge of the left box (glass) not needed

  // =============================== D. site: boundary, gate, pool, landscaping
  const zb = 8.2;
  // low stone plinth + bar fence
  boxAt(-30, 0, zb - 0.13, -10.9, 0.4, zb + 0.13, stone, scene); boxAt(-4.0, 0, zb - 0.13, 30, 0.4, zb + 0.13, stone, scene);
  boxAt(-30, 0.4, zb - 0.16, -10.9, 0.47, zb + 0.16, coping, scene); boxAt(-4.0, 0.4, zb - 0.16, 30, 0.47, zb + 0.16, coping, scene);
  barFence({ x0: -30, x1: -10.9, y0: 0.47, y1: 1.6, z: zb, pitch: 0.14, bar: 0.03, mat: steel, parent: scene, rails: [0, 1] });
  barFence({ x0: -4.0, x1: 30, y0: 0.47, y1: 1.6, z: zb, pitch: 0.14, bar: 0.03, mat: steel, parent: scene, rails: [0, 1] });
  for (const px of [-10.9, -4.0]) { boxAt(px - 0.3, 0, zb - 0.3, px + 0.3, 2.05, zb + 0.3, stone, scene); boxAt(px - 0.34, 2.05, zb - 0.34, px + 0.34, 2.13, zb + 0.34, coping, scene); pillarLamp(px, 2.13, zb, scene, { intensity: 7 }); }
  for (const px of [4.5, 12.5, 20]) { boxAt(px - 0.25, 0, zb - 0.25, px + 0.25, 1.95, zb + 0.25, stone, scene); boxAt(px - 0.3, 1.95, zb - 0.3, px + 0.3, 2.02, zb + 0.3, coping, scene); }
  // gate track
  boxAt(-10.9, 0.0, zb - 0.04, -4.0, 0.02, zb + 0.04, T.metal(0x55585c), scene, { cast: false });
  // reflecting pool along the front right
  { const pw = T.solid(0x2c7d86, { roughness: 0.04, metalness: 0.0, envMapIntensity: 2.4 }); boxAt(4.8, -0.35, 3.2, 10.2, -0.02, 6.0, T.solid(0x9fc6c8), scene, { cast: false });
    const wm = new THREE.MeshPhysicalMaterial({ color: 0x1e6f7a, roughness: 0.03, metalness: 0, clearcoat: 1, envMapIntensity: 2.6, transmission: 0 }); wm.userData.tileM = 1;
    boxAt(4.8, -0.12, 3.2, 10.2, -0.1, 6.0, wm, scene, { cast: false }); void pw;
    boxAt(4.6, 0, 3.0, 10.4, 0.1, 3.2, coping, scene); boxAt(4.6, 0, 6.0, 10.4, 0.1, 6.2, coping, scene); boxAt(4.6, 0, 3.0, 4.8, 0.1, 6.2, coping, scene); boxAt(10.2, 0, 3.0, 10.4, 0.1, 6.2, coping, scene);
    for (const x of [5.6, 7.4, 9.2]) { const j = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.03, 0.9, 8), T.solid(0xe9f6f8, { roughness: 0.2, transparent: true, opacity: 0.55 })); j.position.set(x, 0.35, 4.6); scene.add(j); } }
  P.lounger({ x: 5.4, z: 1.5, rot: Math.PI, parent: scene, cloth: 0xefe8d8 }); P.lounger({ x: 6.5, z: 1.5, rot: Math.PI + 0.12, parent: scene, cloth: 0xefe8d8 });
  boxAt(5.85, 0.0, 1.2, 6.2, 0.36, 1.55, coping, scene);
  P.backdrop({ scene, z: -34, seed: 2 });
  // planting
  hedge(-14.0, 7.4, -11.4, 7.4, { h: 0.7, w: 0.45, density: 70, seed: 3, color: 0x6a9a3e }, scene); hedge(-3.6, 7.4, 4.4, 7.4, { h: 0.65, w: 0.45, density: 70, seed: 13, color: 0x568f3b }, scene);
  hedge(10.6, 7.4, 16, 7.4, { h: 0.65, w: 0.45, density: 70, seed: 23, color: 0x4f8a35 }, scene);
  for (const [x, z, r, s] of [[-3.0, 2.6, 0.55, 1], [-3.9, 3.4, 0.45, 2], [2.8, 3.0, 0.5, 3], [3.6, 2.2, 0.38, 4], [-11.0, 3, 0.6, 5], [11.2, 2.6, 0.55, 6]]) leafy(bush(x, 0, z, r, scene, { seed: s * 7, color: 0x5c9a3c }));
  // ornamental grasses & stones
  for (const [x, z, s] of [[-2.2, 1.0, 0.36], [-1.2, 5.2, 0.5], [0.6, 6.2, 0.3], [1.6, 4.6, 0.42]]) { const r = new THREE.Mesh(new THREE.IcosahedronGeometry(s, 2), T.concrete(0xb9ab96, { tileM: 1, seed: 9 })); r.position.set(x, s * 0.55, z); r.scale.set(1.2, 0.8, 1); r.castShadow = true; scene.add(r); }
  // trees
  leafy(tree(-17.5, 3.5, { h: 8.5, crown: 3.4, seed: 2, color: 0x86b04c }, scene)); leafy(tree(14.8, 3.0, { h: 7.6, crown: 3.1, seed: 6, color: 0x8cb650 }, scene));
  leafy(tree(-2.5, -22, { h: 12, crown: 5, seed: 11, color: 0x5e8e3a }, scene)); leafy(tree(9, -21, { h: 11, crown: 4.5, seed: 12, color: 0x65953f }, scene)); leafy(tree(-12, -18, { h: 10, crown: 4.2, seed: 15, color: 0x5e8e3a }, scene));
   
  palm(-13.6, 6.2, { h: 8.5, seed: 3, lean: 0.3 }, scene); palm(12.6, 5.4, { h: 7.5, seed: 8, lean: -0.4 }, scene);
  // shade trees across the road (outside frame) cast dappled shadows onto the street
   leafy(tree(-20, 33.5, { h: 7, crown: 3, seed: 43, color: 0x86b04c }, scene));
  // neighbours
  neighbour({ x0: -36, x1: -16, z: -1, depth: 14, floors: 2, mat: T.plaster(0xd9cfbd, { tileM: 3.4, seed: 12 }), trim: T.plaster(0xf2eee6, { tileM: 3, seed: 15 }), seed: 3, scene });
  neighbour({ x0: 17, x1: 38, z: -2.5, depth: 14, floors: 2, mat: T.plaster(0xc9c1b4, { tileM: 3.4, seed: 17 }), trim: T.plaster(0xeee8dd, { tileM: 3, seed: 18 }), seed: 5, scene });
  boxAt(-30, 0, 8, -14, 2.0, 8.3, T.plaster(0xd9cfbd, { tileM: 3, seed: 21 }), scene); boxAt(14.5, 0, 8, 36, 2.0, 8.3, T.plaster(0xc9c1b4, { tileM: 3, seed: 22 }), scene);
  

  const camera = archCamera({ pos: [-11, 4.2, 30], target: [1.5, 0, 0], focal: 38, shift: 0.0, w, h });
  return { scene, camera, exposure: 0.45, aoRadius: 0.9, aoStrength: 1.0, bloom: true, bloomStrength: 0.16, bloomRadius: 0.9, bloomThreshold: 1.7, grade: { contrast: 1.1, saturation: 1.08, vignette: 0.3, grain: 0.016, warm: 0.035 } };
}
