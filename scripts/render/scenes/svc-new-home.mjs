// svc-new-home: brand-new modern double-storey home, soft morning light, fresh landscaping, surveyor's kit at the frame edge.
import { THREE, T, boxAt, cyl, ground, rng, bindEnv, finish, win, facade, ledgeStone, railRun, instBoxes, ac, tank, dish, wallLamp, downlight, wallStreaks, wallFoot, groundGrime, pavers, lawnOverlay, planeZ, planeY, glassPane, metalPro, ctex, cv } from '../lib/agent5-kit.mjs';
import { tree2, hedge2, bush2, grassTufts, flowerBed, bougain } from '../lib/agent5-nature.mjs';
import { setupEnvironment, archCamera } from '../lib/env.mjs';
import { makeSky } from '../lib/agent5-sky.mjs';

export default async function build({ renderer, w, h }) {
  const scene = new THREE.Scene();
  const E = setupEnvironment({ renderer, scene, sunElevation: 27, sunAzimuth: -32, turbidity: 5, rayleigh: 1.0, mie: 0.006, sunIntensity: 3.1, sunColor: 0xffe2bd, envIntensity: 0.36, shadowExtent: 34, shadowCenter: [0, 0, 4] });
  bindEnv(E.env); E.sky.visible = false;
  const SK = makeSky(scene, { exposure: 0.36, sunEl: 27, sunAz: -32, cover: 0.5, scale: 1.6, soft: 0.28, cirrus: 0.35, seed: 3, zenith: 0x5d88b8, mid: 0x88aacd, horizon: 0xd3dbdf });
  scene.fog = new THREE.FogExp2(SK.fogColor, 0.0042);
  const R = rng(11);

  // ---------------------------------------------------------------- materials
  const P = 0.45, F = 3.2, SL = 0.25, Y1 = P + F + SL, Y2 = Y1 + F, YR = Y2 + SL;      // plinth, storey, slab, level-1 floor, level-2 ceiling, roof floor
  const pW = T.plaster(0xdcd5c8, { tileM: 3.2, seed: 4 }), pW2 = T.plaster(0xd3ccbf, { tileM: 3.2, seed: 12 }), pG = T.plaster(0x8a8b8a, { tileM: 3.2, seed: 8, roughness: 0.85 }), dark = T.plaster(0x2c2e31, { tileM: 3, seed: 2, roughness: 0.7 });
  const stone = ledgeStone({ colors: [0xa89f90, 0xb5ad9d, 0x968d7e, 0xbdb4a4, 0x8c8376], tileM: 1.8, seed: 11 }), stone2 = ledgeStone({ colors: [0x6c665e, 0x7d766b, 0x5d5851, 0x8a8277], tileM: 1.6, seed: 17, rowMin: 0.07, rowMax: 0.14 });
  const conc = T.concrete(0xbdbcb6, { tileM: 2.5, seed: 5 }), concD = T.concrete(0x8d8c88, { tileM: 2.5, seed: 9 });
  const woodMat = T.solid(0x9a6a40, { roughness: 0.55 });
  const walnut = T.wood({ color: 0x8c5a35, tileM: 1.4, planks: 2, gap: false, seed: 21 });
  const soffit = T.wood({ color: 0xb98a58, tileM: 1.2, planks: 8, seed: 33 });
  const metalBlack = T.solid(0x1d1f22, { roughness: 0.45, metalness: 0.5 });
  const lawn = T.grass({ color: 0xa2c05e, tileM: 4.5, seed: 61 });
  const asphalt = T.asphalt({ tileM: 7 });

  // ---------------------------------------------------------------- ground
  ground(-1500, -1500, 1500, 12.6, 0, lawn, scene);                                   // base turf (also behind house / neighbour plots)
  ground(-1500, 12.6, 1500, 45, 0.0, asphalt, scene); ground(-1500, 45, 1500, 1500, 0, lawn, scene);                                // road
  ground(-120, 10.2, 120, 12.6, 0.02, pavers({ colors: [0xc0b8aa, 0xb3ab9d, 0xa9a194], tileM: 1.6, seed: 17 }), scene);   // footpath
  boxAt(-120, 0, 12.6, 120, 0.17, 12.9, T.concrete(0xb9b8b2, { tileM: 2, seed: 17 }), scene);   // kerb
  groundGrime({ x0: -60, z0: 12.9, x1: 60, z1: 45, y: 0.004, seed: 31, alpha: 0.2, color: [22, 22, 20], scale: 6, cutoff: 0.52, noiseM: 9, res: 2048 }, scene);
  groundGrime({ x0: -40, z0: 12.9, x1: 40, z1: 16, y: 0.006, seed: 41, alpha: 0.5, color: [120, 105, 85], scale: 12, cutoff: 0.45, res: 2048, noiseM: 5 }, scene);
  const paint = T.solid(0xe9e7df, { roughness: 0.7 }); for (let x = -118; x < 118; x += 6) boxAt(x, 0.004, 28.9, x + 3, 0.012, 29.1, paint, scene, { cast: false });
  // plot lawns, fresh turf with seams
  lawnOverlay({ x0: -9, z0: 0, x1: 9, z1: 10.2, y: 0.008, seed: 5, rollW: 0.6, rollL: 1.6, patch: 0.28 }, scene);
  lawnOverlay({ x0: 9, z0: -12, x1: 9.01, z1: 10, y: 0.007 }, scene);
  // vacant neighbouring plot (dry, dusty)
  ground(9.3, -40, 60, 10.2, 0.03, T.solid(0x9a8a6c, { roughness: 1 }), scene);
  groundGrime({ x0: 9.3, z0: -12, x1: 40, z1: 10.2, y: 0.034, seed: 77, alpha: 0.9, color: [118, 130, 70], scale: 5, cutoff: 0.5, res: 1024, noiseM: 7 }, scene);
  grassTufts({ x0: 9.5, z0: -4, x1: 30, z1: 10, y: 0.03, count: 3200, h: 0.34, w: 0.34, seed: 8, tint: 0xd6cb8a, hVar: 0.8 }, scene);
  // driveway (new pavers) + edge kerbs, entrance path
  const drive = pavers({ colors: [0xb8b3a8, 0xc3beb3, 0xaaa59a], tileM: 1.6, seed: 5, across: 8 });
  ground(-6.35, -5.4, -2.75, 10.2, 0.035, drive, scene);
  for (const [a, b] of [[-6.55, -6.35], [-2.75, -2.55]]) boxAt(a, 0, -5.4, b, 0.07, 10.2, concD, scene);
  boxAt(-6.55, 0, 10.0, -2.55, 0.07, 10.2, concD, scene);
  ground(-2.0, 8.8, -1.0, 10.2, 0.03, pavers({ colors: [0xb4ad9f, 0xa49d90], tileM: 1.2, seed: 22, across: 6 }), scene);     // gate apron
  // stepping stones to the door
  const slabM = T.concrete(0xc8c4ba, { tileM: 1.2, seed: 31 });
  for (let i = 0; i < 9; i++) boxAt(-1.95 + 0.12 * (i % 2), 0.0, 8.7 - i * 0.95, -1.15 + 0.12 * (i % 2), 0.045, 8.0 - i * 0.95, slabM, scene);
  // carport floor
  ground(-6.5, -5.5, -2.6, 0, 0.14, drive, scene); boxAt(-6.5, 0.0, 0.0, -2.6, 0.14, 0.9, conc, scene);

  // ---------------------------------------------------------------- house
  const H = new THREE.Group(); scene.add(H);
  const XL = -6.5, XR = 6.5, D = 12;
  // plinth
  boxAt(XL - 0.05, 0, -D, XR + 0.05, P, 0.12, stone2, H);
  // ===== ground floor
  // right volume: living room, big sliding glazing
  const glz = { x: 1.9, y: P + 0.05, w: 4.1, h: 2.45 };
  wallWithOpeningsFront(H, 1.2, XR, P, Y1 - SL, 0, 0.35, [glz], pW);
  boxAt(1.2, P, -D, XR - 0.35, Y1 - SL, -6.5, pW, H); boxAt(1.2, P, -6.5, 1.9 - 0.0, Y1 - SL, -0.35, pW, H);
  win({ ...glz, z: 0, cols: 3, frame: 0x22252a, fw: 0.06, reveal: 0.16, sill: false, glow: 0, curtain: 0.38, floorY: P + 0.02, ceilY: Y1 - SL - 0.05, seed: 3, roomOpts: { depth: 6, side: 2 } }, H);
  // planter box in front of glazing
  boxAt(1.7, 0, 0.55, 6.1, 0.6, 1.1, stone, H); boxAt(1.64, 0.6, 0.5, 6.16, 0.66, 1.16, concD, H);
  // entrance recess (stone wall) + door
  boxAt(-2.6, P, -D, 1.2, Y1 - SL, -1.7, stone, H);
  const door = { x: -1.55, w: 1.3, h: 2.45 };
  boxAt(-1.9, P, -1.69, -0.9, P + 2.6, -1.64, T.solid(0x1d1f22, { roughness: 0.6 }), H);
  boxAt(door.x, P, -1.75, door.x + door.w, P + door.h, -1.62, walnut, H);
  boxAt(door.x - 0.06, P, -1.78, door.x, P + door.h + 0.06, -1.6, metalBlack, H); boxAt(door.x + door.w, P, -1.78, door.x + door.w + 0.06, P + door.h + 0.06, -1.6, metalBlack, H); boxAt(door.x - 0.06, P + door.h, -1.78, door.x + door.w + 0.06, P + door.h + 0.06, -1.6, metalBlack, H);
  boxAt(door.x + 0.14, P + 0.75, -1.6, door.x + 0.17, P + 1.75, -1.55, metalPro(0xb08a4a, { roughness: 0.28 }), H);   // brass pull
  for (let i = 0; i < 4; i++) boxAt(door.x + 0.28 + i * 0.28, P + 0.04, -1.625, door.x + 0.3 + i * 0.28, P + door.h - 0.06, -1.615, T.solid(0x6b4426, { roughness: 0.5 }), H, { cast: false });
  boxAt(0.1, P, -1.72, 0.9, P + 2.45, -1.62, T.solid(0x16181a, { roughness: 0.4 }), H);   // sidelight dark glass
  win({ x: 0.15, y: P + 0.1, w: 0.7, h: 2.2, z: -1.7, cols: 1, frame: 0x1d1f22, reveal: 0.0, glow: 0, curtain: 0, sill: false, interior: false }, H);
  boxAt(-2.6, 0.0, -1.7, 1.25, P, 0.7, conc, H); boxAt(-2.6, P - 0.05, -1.7, 1.25, P, 0.7, stone2, H);    // porch floor / step
  boxAt(-2.6, 0.15, 0.7, 1.25, 0.3, 1.2, conc, H); boxAt(-2.6, 0, 1.2, 1.25, 0.15, 1.7, conc, H);
  // carport: back wall, side wall, slim column
  boxAt(XL, P, -D, -2.6, Y1 - SL, -5.5, stone2, H); boxAt(XL - 0.25, P, -5.5, XL, Y1 - SL, 0.3, stone, H); boxAt(XL - 0.25, 0, -D, XL, P, 0.3, stone2, H);
  boxAt(-2.75, P, 0.12, -2.6, Y1 - SL, 0.27, metalBlack, H);
  boxAt(-6.2, P + 0.04, -5.45, -4.9, P + 2.1, -5.4, T.solid(0x4b3827, { roughness: 0.6 }), H);   // timber service door
  // ===== first-floor slab (with canopy cantilever)
  boxAt(XL - 0.3, Y1 - SL, -D - 0.3, XR + 0.3, Y1, -1.6, pW2, H);
  boxAt(XL - 0.3, Y1 - SL, -1.6, 1.2, Y1, 0.95, pW2, H); boxAt(1.2, Y1 - SL, -1.6, XR + 0.3, Y1, 0.25, pW2, H);
  boxAt(XL - 0.32, Y1 - SL, 0.95 - 0.02, 1.2, Y1, 0.98, dark, H); boxAt(1.2, Y1 - SL, 0.25 - 0.02, XR + 0.32, Y1, 0.28, dark, H);   // fascia lip
  // soffit lining over porch/carport (timber)
  boxAt(XL, Y1 - SL - 0.02, -5.5, -2.6, Y1 - SL, 0.9, soffit, H, { cast: false }); boxAt(-2.6, Y1 - SL - 0.02, -1.7, 1.2, Y1 - SL, 0.9, soffit, H, { cast: false });
  for (const [x, z] of [[-5.6, -1.2], [-4.2, -1.2], [-3.4, -3.8], [-0.2, 0.2], [0.5, -0.8], [-1.5, 0.2]]) downlight(x, Y1 - SL - 0.02, z, H, { intensity: 3 });
  // ===== upper left: master bedroom, timber battens
  boxAt(XL, Y1, -D, 0.8, Y2, 0.6, dark, H);
  const battens = [];
  for (let x = XL + 0.05; x < 0.75; x += 0.2) battens.push([x, Y1 + 0.06, 0.6, x + 0.075, Y2 - 0.06, 0.78]);
  instBoxes(battens, woodMat, H);
  // ribbon window set back into the timber box
  boxAt(XL + 0.02, Y1 + 0.55, 0.5, XL + 0.05, Y1 + 0.58, 0.51, dark, H);
  boxAt(-5.4, Y1 + 0.9, 0.55, -1.2, Y1 + 2.45, 0.7, T.solid(0x16181b, { roughness: 0.45 }), H); // dark ribbon-glass band behind battens
  glassPane(-5.4, Y1 + 0.95, -1.2, Y1 + 2.4, 0.71, H, { tint: 0x14191d, refl: 0.5, opacity: 0.85 });
  for (const x of [-5.4, -4.0, -2.6, -1.2]) boxAt(x - 0.03, Y1 + 0.9, 0.62, x + 0.03, Y1 + 2.45, 0.75, metalBlack, H);
  boxAt(XL - 0.12, Y2, -D - 0.1, 0.95, Y2 + SL, 0.8, dark, H);                   // roof slab of the master box (fascia dark)
  // side-face slab of master box: stone return on left
  boxAt(XL - 0.05, Y1, -D, XL, Y2, 0.6, dark, H);
  // ===== upper right: grey plaster volume set back with terrace
  const zb = -2.0;
  boxAt(0.8, Y1, -D, XR - 0.35, Y2, zb - 5.4, pG, H);
  const dr = { x: 1.5, y: Y1 + 0.02, w: 3.2, h: 2.4 }, wn = { x: 5.0, y: Y1 + 0.85, w: 1.2, h: 1.4 };
  wallWithOpeningsFront(H, 0.8, XR, Y1, Y2, zb - 0.35, 0.35, [dr, wn], pG);
  win({ ...dr, z: zb, cols: 2, frame: 0x1d1f22, fw: 0.055, reveal: 0.15, sill: false, glow: 0, curtain: 0.5, floorY: Y1 + 0.02, ceilY: Y2 - 0.05, seed: 6, roomOpts: { depth: 5 } }, H);
  win({ ...wn, z: zb, cols: 2, frame: 0x1d1f22, reveal: 0.15, glow: 0, curtain: 0.6, floorY: Y1 + 0.02, ceilY: Y2 - 0.05, seed: 9, sillMat: conc }, H);
  // terrace: tiled floor, glass railing, steel column, roof slab with fins
  planeY(Y1 + 0.001, 0.8, zb, XR + 0.3, 0.25, T.tiles({ color: 0xcfcac0, grout: 0x8a867e, tileM: 2.4, n: 4, seed: 51, marble: false, roughness: 0.55 }), H, { world: true });
  railRun(H, [0.9, 0.12], [XR + 0.18, 0.12], { y: Y1, h: 1.05, kind: 'glass' }); railRun(H, [XR + 0.18, 0.12], [XR + 0.18, zb], { y: Y1, h: 1.05, kind: 'glass' });
  boxAt(XR + 0.05, Y1, 0.05, XR + 0.25, Y1 + 0.05, 0.19, metalBlack, H);
  boxAt(XR + 0.1, Y1, 0.0, XR + 0.26, Y2, 0.16, metalBlack, H);                  // slim steel column
  boxAt(0.8, Y2, -D - 0.1, XR + 0.35, Y2 + SL, 0.45, dark, H); boxAt(0.8, Y2 - 0.02, zb, XR + 0.3, Y2, 0.45, soffit, H, { cast: false });
  for (let x = 1.4; x < XR; x += 1.15) boxAt(x, Y2 - 0.3, -0.2, x + 0.06, Y2, 0.42, T.solid(0x1d1f22, { roughness: 0.5 }), H, { cast: false });   // pergola fins
  boxAt(0.75, Y1, zb - 0.35, 1.05, Y2, 0.3, pW, H);                               // wing wall dividing master / terrace
  // ===== roof level
  const parapetTop = YR + 1.0;
  const cap = T.concrete(0xaaa9a4, { tileM: 2, seed: 15 });
  // parapet = outer shell around the roof perimeter
  boxAt(XL - 0.3, YR, -D - 0.3, XR + 0.3, parapetTop, -D - 0.1, pW, H); boxAt(XL - 0.3, YR, -D - 0.1, XL - 0.1, parapetTop, 0.25, pW, H); boxAt(XR + 0.1, YR, -D - 0.1, XR + 0.3, parapetTop, 0.25, pW, H);
  boxAt(XL - 0.3, YR, 0.05, XR + 0.3, parapetTop, 0.3 + 0.55, pW, H);
  boxAt(XL - 0.35, parapetTop, -D - 0.35, XR + 0.35, parapetTop + 0.07, 0.9, cap, H);
  boxAt(XL - 0.3, YR, 0.2, XR + 0.3, parapetTop, 0.85, pW, H);
  // roof floor
  boxAt(XL - 0.1, YR - 0.02, -D - 0.1, XR + 0.1, YR, 0.3, T.concrete(0xb7b4ab, { tileM: 2, seed: 22 }), H);
  // stair headroom (mumty), water tanks, solar, dish
  boxAt(2.2, YR, -9.3, 5.0, YR + 2.5, -5.8, pW, H); boxAt(2.1, YR + 2.5, -9.4, 5.1, YR + 2.62, -5.7, cap, H);
  boxAt(3.0, YR, -5.82, 3.9, YR + 2.05, -5.76, T.solid(0x20262c, { roughness: 0.6 }), H);
  tank(3.4, YR + 2.62, -8.0, H, { r: 0.62, h: 1.2, base: true }); tank(4.4, YR + 2.62, -7.2, H, { r: 0.55, h: 1.1, base: false });
  tank(-4.4, YR, -9.4, H, { r: 0.6, h: 1.15, base: true });
  dish(-2.0, YR, -9.5, H, { r: 0.32 });
  // ===== right (side) face: real openings + windows (group rotated so local +z = world +x, local x = -world z)
  const SW = new THREE.Group(); SW.rotation.y = Math.PI / 2; SW.position.set(XR, 0, 0); H.add(SW);
  const gfW = [[-3.9, 1.5, 1.2, P + 1.0, 21], [-8.0, 1.5, 1.2, P + 1.0, 22]], ufW = [[-4.6, 1.2, 1.4, Y1 + 0.9, 23], [-9.4, 0.8, 2.3, Y1 + 0.3, 24]];
  const op = (list) => list.map(([zc, wd, ht, y0]) => ({ x: -zc - wd / 2, y: y0, w: wd, h: ht }));
  wallWithOpeningsFront(SW, 0.35, D, P, Y1 - SL, -0.35, 0.35, op(gfW), pW);
  boxAt(0.35, Y1 - SL, -D, D, Y1, 0.0, pW2, SW);
  wallWithOpeningsFront(SW, 2.35, D, Y1, Y2, -0.35, 0.35, op(ufW), pG);
  boxAt(D, P, -0.35, D + 0.35, Y2, 0.0, pW, SW);
  for (const [list, ceilA, floorA] of [[gfW, Y1 - SL - 0.05, P + 0.02], [ufW, Y2 - 0.05, Y1 + 0.02]]) for (const [zc, wd, ht, y0, k] of list) win({ x: -zc - wd / 2, y: y0, w: wd, h: ht, z: 0, cols: wd > 1.0 ? 2 : 1, frame: 0x24272b, reveal: 0.12, curtain: 0.5, seed: k, sillMat: conc, floorY: floorA, ceilY: ceilA, roomOpts: { depth: 3.4, side: 1.0 } }, SW);

  // decorative details & utilities on the right face
  ac(XR + 0.0, Y1 + 0.2, -6.4, H, { w: 0.86, h: 0.62, d: 0.34 });
  boxAt(XR, P + 0.5, -1.1, XR + 0.14, P + 1.6, -0.55, T.solid(0xc9c6bd, { roughness: 0.6 }), H);                         // meter box
  cyl(XR + 0.06, (Y2 + P) / 2, -0.7, 0.045, 0.045, Y2 - P, T.solid(0xd8d6d0, { roughness: 0.5 }), H, { seg: 10 });       // down-pipe
  // front-face details
  wallStreaks({ x0: 1.2, x1: XR, y0: P, y1: Y1 - SL, z: 0.0, seed: 3, alpha: 0.22, count: 24 }, H);
  wallFoot({ x0: 1.2, x1: XR, z: 0.0, h: 0.5, seed: 4, alpha: 0.2 }, H);
  wallStreaks({ x0: 0.8, x1: XR, y0: Y1, y1: Y2, z: zb, seed: 5, alpha: 0.2, count: 26 }, H);
  // lamp at door
  wallLamp(-1.9, P + 2.2, -1.65, H, { dir: 1, color: 0xffe3b0, intensity: 1.2 });

  // ---------------------------------------------------------------- boundary: finished wall + gate pillars (left), unfinished right (stakes + string)
  const wz = 10.0, cp = T.concrete(0xbdbbb4, { tileM: 2, seed: 7 });
  // low stone plinth + steel bars
  const barM = T.solid(0x1b1d20, { roughness: 0.45, metalness: 0.5 });
  const barList = [];
  const pil = (x0, x1) => { boxAt(x0, 0, wz - 0.25, x1, 1.95, wz + 0.25, stone, scene); boxAt(x0 - 0.04, 1.95, wz - 0.29, x1 + 0.04, 2.03, wz + 0.29, cp, scene); boxAt(x0 + 0.05, 2.03, wz - 0.2, x1 - 0.05, 2.27, wz + 0.2, T.emissive(0xfff0cc, 0.5), scene, { cast: false }); boxAt(x0 + 0.02, 2.27, wz - 0.23, x1 - 0.02, 2.32, wz + 0.23, metalBlack, scene); };
  pil(-7.4, -6.9); pil(-2.5, -2.0);
  boxAt(-9.0, 0, wz - 0.11, -7.4, 0.78, wz + 0.11, stone2, scene); boxAt(-9.02, 0.78, wz - 0.14, -7.4, 0.86, wz + 0.14, cp, scene);
  for (let x = -8.94; x < -7.43; x += 0.13) barList.push([x, 0.86, wz - 0.012, x + 0.024, 1.62, wz + 0.012]); boxAt(-9.0, 1.56, wz - 0.03, -7.4, 1.62, wz + 0.03, barM, scene); boxAt(-9.0, 0.9, wz - 0.02, -7.4, 0.93, wz + 0.02, barM, scene);
  instBoxes(barList, barM, scene);
  // blank nameplate on pillar
  boxAt(-2.42, 1.1, wz + 0.25, -2.08, 1.46, wz + 0.27, T.solid(0x24262a, { roughness: 0.3, metalness: 0.4 }), scene);

  boxAt(-7.0, 0.0, wz - 0.25, 9.0, 0.03, wz + 0.1, T.solid(0x4a3a2a, { roughness: 1 }), scene, { cast: false });
  // unfinished boundary: stakes, string, tape
  const stakeM = T.solid(0xb9955f, { roughness: 0.85 }), tapeM = T.solid(0xff6a13, { roughness: 0.6 }), pinkM = T.solid(0xff3d8b, { roughness: 0.6 });
  const stakes = [];
  const line1 = []; for (let x = -1.7; x <= 9.01; x += 1.78) line1.push([x, wz]);
  const line0 = [[-2.0, wz]]; void line0;
  const line2 = []; for (let z = wz - 2.2; z > -9; z -= 2.2) line2.push([9.0, z]);
  const pts = [...line1, [9.0, wz], ...line2];
  const stakeList = [], tapeList = [];
  for (const [sx, sz] of pts) { const lean = (R() - 0.5) * 0.04; stakeList.push([sx - 0.02 + lean, 0, sz - 0.02, sx + 0.02 + lean, 0.52 + R() * 0.12, sz + 0.02]); tapeList.push([sx - 0.03, 0.36, sz - 0.03, sx + 0.03, 0.41, sz + 0.03]); }
  instBoxes(stakeList, stakeM, scene); instBoxes(tapeList, tapeM, scene);
  const strM = new THREE.MeshStandardMaterial({ color: 0xffb020, roughness: 0.7, emissive: 0x6a3a00, emissiveIntensity: 0.4 });
  const stringBetween = (a, b, y = 0.38) => { const v = new THREE.Vector3(b[0] - a[0], 0, b[1] - a[1]), L = v.length(); const m = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, L, 5), strM); m.position.set((a[0] + b[0]) / 2, y, (a[1] + b[1]) / 2); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), v.normalize()); m.castShadow = true; scene.add(m); };
  for (let i = 0; i < pts.length - 1; i++) stringBetween(pts[i], pts[i + 1], 0.385);
  // corner pegs with ribbon flags
  for (const [sx, sz] of [[9.0, wz], [9.0, -9.0]]) { boxAt(sx - 0.03, 0, sz - 0.03, sx + 0.03, 1.0, sz + 0.03, stakeM, scene); boxAt(sx + 0.03, 0.72, sz - 0.005, sx + 0.3, 0.98, sz + 0.005, pinkM, scene); }
  // surveyor total station on tripod + prism pole (foreground right edge)
  surveyor(scene, 6.8, 9.6);
  // staked sapling trees, mulch, planting
  sapling(scene, 8.0, 5.8, 1);
  sapling(scene, 3.4, 6.4, 2);
  // ---------------------------------------------------------------- planting
  const mulch = T.solid(0x4a3626, { roughness: 1 });
  boxAt(1.55, 0.0, 0.4, 6.3, 0.05, 1.3, mulch, scene);
  // beds along wall / front
  mulchBed(scene, -8.9, 0.8, -6.65, 9.5, mulch);
  hedge2(-8.8, 9.2, -7.6, 9.2, { h: 0.95, w: 0.7, y: 0, seed: 3, tint: 0xd9f2c0 }, scene);
  hedge2(-8.6, 1.2, -8.6, 9.0, { h: 0.8, w: 0.6, y: 0, seed: 4, tint: 0xc8e8b0 }, scene);
  hedge2(-6.55, 2.0, -6.55, 9.4, { h: 0.5, w: 0.45, y: 0.0, seed: 5, tint: 0xd0eeb8 }, scene);
  for (const [x, z, r2, s] of [[-2.2, 8.9, 0.5, 7], [-1.7, 3.0, 0.45, 8], [0.3, 8.7, 0.55, 9], [2.4, 8.8, 0.45, 10], [1.9, 2.4, 0.4, 11], [3.3, 1.8, 0.5, 12]]) bush2(x, 0.05, z, r2, { seed: s, tint: 0xe2f6cc, leaf: s % 2 ? 'broad' : 'neem' }, scene);
  flowerBed(1.7, 0.5, 6.0, 1.1, { y: 0.6, h: 0.4, seed: 2, count: 520, tint: 0xffffff }, scene);
  flowerBed(-2.4, 7.0, 3.8, 9.3, { y: 0.1, h: 0.45, seed: 3, count: 520 }, scene);
  // trees around: behind house and on neighbour plots
  tree2(-12.6, -2.0, { h: 9.5, crown: 3.4, kind: 'neem', seed: 3, tint: 0xe6f6d0, trunkR: 0.26 }, scene);
  tree2(14.0, -6.5, { h: 10, crown: 3.6, kind: 'mango', seed: 5, tint: 0xd9efc0, trunkR: 0.28 }, scene);
  tree2(2.5, -17, { h: 12, crown: 4.4, kind: 'neem', seed: 8, tint: 0xdff1c8, trunkR: 0.3 }, scene);
  tree2(-9, -16, { h: 11, crown: 4.2, kind: 'mango', seed: 9, tint: 0xd2e9bd, trunkR: 0.3 }, scene);
  tree2(10, -19, { h: 13, crown: 4.8, kind: 'neem', seed: 12, tint: 0xe2f3cb, trunkR: 0.3 }, scene);
  tree2(22, 3, { h: 9, crown: 3.4, kind: 'neem', seed: 15, tint: 0xe1f2c8, trunkR: 0.25 }, scene);
  // street trees
  tree2(-14, 11.4, { h: 8, crown: 3.0, kind: 'neem', seed: 21, tint: 0xe6f6d0, trunkR: 0.22 }, scene);
  tree2(16, 11.4, { h: 8.5, crown: 3.2, kind: 'neem', seed: 22, tint: 0xdcf0c4, trunkR: 0.22 }, scene);
  grassTufts({ x0: -9, z0: 0.3, x1: 9, z1: 10, y: 0.0, count: 5000, h: 0.07, w: 0.14, seed: 2, tint: 0xf4ffd0, mask: (x, z) => !((x > -6.7 && x < -2.45 && z > -5.5) || (x > -2.6 && x < 0.3 && z > 4.8) || (x > -1.2 && x < 0 && z > 0 && z < 5) || (x > 1.6 && x < 6.4 && z < 1.4) || (x > -2.6 && x < -1.8)) }, scene);

  // ---------------------------------------------------------------- neighbours
  neighbour(scene, -22.5, 'L', 0xe0d7c6, 4);
  neighbour(scene, 26, 'R', 0xcfc9bb, 9);
  // far-left boundary wall continuation
  boxAt(-9.0, 0, wz - 0.1, -60, 1.6, wz + 0.1, T.plaster(0xd8d0c0, { tileM: 3, seed: 14 }), scene);
  boxAt(-9.1, 1.6, wz - 0.14, -60, 1.68, wz + 0.14, cp, scene);

  finish(scene, 1.5);
  const camera = archCamera({ pos: [6.0, 1.65, 14.6], target: [-1.5, 1.65, 0], focal: 26, shift: 0.07, w, h });
  return { scene, camera, exposure: 0.36, aoRadius: 0.9, aoStrength: 1.0, grade: { contrast: 1.07, saturation: 0.98, vignette: 0.22, grain: 0.014, warm: 0.02 } };
}

// ====================================================================== local helpers
function wallWithOpeningsFront(parent, x0, x1, y0, y1, zBack, t, openings, mat) {
  const xs = new Set([x0, x1]), ys = new Set([y0, y1]);
  for (const o of openings) { xs.add(o.x); xs.add(o.x + o.w); ys.add(o.y); ys.add(o.y + o.h); }
  const X = [...xs].filter((v) => v >= x0 && v <= x1).sort((a, b) => a - b), Y = [...ys].filter((v) => v >= y0 && v <= y1).sort((a, b) => a - b);
  for (let i = 0; i < X.length - 1; i++) for (let j = 0; j < Y.length - 1; j++) {
    const cx = (X[i] + X[i + 1]) / 2, cy = (Y[j] + Y[j + 1]) / 2;
    if (openings.some((o) => cx > o.x && cx < o.x + o.w && cy > o.y && cy < o.y + o.h)) continue;
    boxAt(X[i], Y[j], zBack, X[i + 1], Y[j + 1], zBack + t, mat, parent);
  }
}

function mulchBed(scene, x0, z0, x1, z1, mat, hh = 0.04) { boxAt(x0, 0, z0, x1, hh, z1, mat, scene); }

function sapling(scene, x, z, seed) {
  const g = new THREE.Group(); scene.add(g);
  const stakeM = T.solid(0xb08a58, { roughness: 0.9 });
  cyl(x, 0.02, z, 0.8, 0.8, 0.04, T.solid(0x45331f, { roughness: 1 }), g, { seg: 24, cast: false });
  tree2(x, z, { h: 4.2, crown: 1.4, trunkR: 0.06, kind: 'neem', seed: 40 + seed, tint: 0xeaf8d4, density: 0.7 }, g);
  for (const a of [0, 2.1, 4.2]) { const sx = x + Math.cos(a) * 0.35, sz = z + Math.sin(a) * 0.35; boxAt(sx - 0.025, 0, sz - 0.025, sx + 0.025, 1.9, sz + 0.025, stakeM, g); }
  const tie = T.solid(0x2b2b2b, { roughness: 0.8 }); cyl(x, 1.5, z, 0.075, 0.075, 0.05, tie, g, { seg: 10 });
}

function surveyor(scene, x, z) {
  const g = new THREE.Group(); g.position.set(x, 0, z); scene.add(g);
  const leg = T.solid(0xc8a165, { roughness: 0.55 }), met = T.solid(0x3a3d41, { roughness: 0.4, metalness: 0.7 }), yel = T.solid(0xe3b81d, { roughness: 0.45 }), gry = T.solid(0x50555a, { roughness: 0.5 }), top = new THREE.Vector3(0, 1.45, 0);
  for (let i = 0; i < 3; i++) {
    const a = i * 2.094 + 0.4, foot = new THREE.Vector3(Math.cos(a) * 0.75, 0.0, Math.sin(a) * 0.75), top2 = new THREE.Vector3(Math.cos(a) * 0.1, 1.42, Math.sin(a) * 0.1), len = foot.distanceTo(top2);
    const m = new THREE.Mesh(new THREE.BoxGeometry(0.05, len, 0.035), leg); m.position.copy(foot).add(top2).multiplyScalar(0.5); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), top2.clone().sub(foot).normalize()); m.rotateY(a); m.castShadow = true; g.add(m);
    const sh = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.01, 0.2, 6), met); sh.position.copy(foot).add(new THREE.Vector3(0, 0.1, 0)); sh.castShadow = true; g.add(sh);
    const clamp = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.16, 0.06), met); clamp.position.copy(top2.clone().lerp(foot, 0.3)); clamp.castShadow = true; g.add(clamp);
  }
  cyl(0, 1.45, 0, 0.17, 0.17, 0.05, met, g, { seg: 24 });                         // tribrach plate
  boxAt(-0.11, 1.5, -0.09, 0.11, 1.62, 0.09, yel, g);                              // base
  const body = boxAt(-0.1, 1.62, -0.08, 0.1, 1.94, 0.08, yel, g); void body;     // standards
  boxAt(-0.12, 1.84, -0.07, 0.12, 1.92, 0.07, gry, g);
  const tel = cyl(0, 1.8, 0, 0.045, 0.045, 0.34, gry, g, { seg: 16 }); tel.rotation.x = Math.PI / 2; tel.rotation.z = 0.0; tel.rotation.y = 0; tel.position.set(0, 1.82, 0.03);
  cyl(0, 1.82, 0.22, 0.055, 0.055, 0.06, met, g, { seg: 16 }).rotation.x = Math.PI / 2;
  // prism pole nearby (red/white)
  const pole = new THREE.Group(); pole.position.set(-0.9, 0, -0.6); pole.rotation.z = 0.03; g.add(pole);
  const red = T.solid(0xd2381d, { roughness: 0.5 }), wht = T.solid(0xf0efe9, { roughness: 0.5 });
  for (let i = 0; i < 9; i++) cyl(0, 0.2 + i * 0.25, 0, 0.016, 0.016, 0.25, i % 2 ? wht : red, pole, { seg: 10 });
  cyl(0, 2.5, 0, 0.012, 0.012, 0.5, met, pole, { seg: 6 }); boxAt(-0.07, 2.7, -0.015, 0.07, 2.86, 0.015, yel, pole);
  // wooden hammer & peg bundle on the ground
  boxAt(0.5, 0, 0.5, 0.62, 0.05, 1.1, T.solid(0xb9955f, { roughness: 0.9 }), g); boxAt(0.3, 0.0, 0.8, 0.74, 0.08, 0.92, met, g);
}

function neighbour(scene, cx, side, tone, seed) {
  const g = new THREE.Group(); scene.add(g);
  const pm = T.plaster(tone, { tileM: 3.2, seed: 20 + seed }), pm2 = T.plaster(0xb9b1a2, { tileM: 3.2, seed: 40 + seed }), cap = T.concrete(0xaaa9a4, { tileM: 2, seed: 15 }), dark = T.plaster(0x34363a, { tileM: 3, seed: 3 });
  const x0 = cx - 7, x1 = cx + 7, zf = 1.0, F1 = 3.3, SLB = 0.3, Y1 = F1 + SLB, Y2 = Y1 + 3.2;
  const gW = [0, 1, 2].map((i) => ({ x: x0 + 1.0 + i * 4.3, y: 0.95, w: i === 1 ? 1.2 : 2.1, h: 1.4, cols: 2, frame: 0x3b3b3d, seed: seed + i, curtain: 0.55, floorY: 0.1, ceilY: F1 - 0.1, roomOpts: { depth: 3.4 }, grille: i !== 1 }));
  g.add(Object.assign(new THREE.Group(), {}));
  facade({ x0, x1, y0: 0, y1: F1, zBack: zf - 0.35, t: 0.35, wins: gW, mat: pm, parent: g });
  boxAt(x0, 0, -13, x1, Y2 + 0.2, zf - 4.2, pm, g);
  boxAt(x0 - 0.3, F1, -13, x1 + 0.3, Y1, zf + 0.35, pm, g); boxAt(x0 - 0.3, F1 - 0.04, zf + 0.0, x1 + 0.3, F1, zf + 0.35, dark, g, { cast: false });
  const uW = [0, 1, 2].map((i) => ({ x: x0 + 1.4 + i * 4.2, y: Y1 + 0.9, w: i === 1 ? 2.4 : 1.6, h: i === 1 ? 2.2 : 1.4, cols: 2, frame: 0x3b3b3d, seed: seed + 4 + i, curtain: 0.5, floorY: Y1 + 0.05, ceilY: Y2 - 0.1, roomOpts: { depth: 3.6 } }));
  facade({ x0, x1, y0: Y1, y1: Y2, zBack: zf - 0.35 - 0.0, t: 0.35, wins: uW, mat: pm2, parent: g });
  boxAt(x0 - 0.3, Y2, -13, x1 + 0.3, Y2 + 0.22, zf + 0.3, pm, g);
  boxAt(x0 - 0.2, Y2 + 0.22, zf - 0.1, x1 + 0.2, Y2 + 1.1, zf + 0.2, pm, g); boxAt(x0 - 0.2, Y2 + 0.22, -13, x0 + 0.1, Y2 + 1.1, zf + 0.2, pm, g); boxAt(x1 - 0.1, Y2 + 0.22, -13, x1 + 0.2, Y2 + 1.1, zf + 0.2, pm, g);
  boxAt(x0 - 0.3, Y2 + 1.1, -13.3, x1 + 0.3, Y2 + 1.17, zf + 0.3, cap, g);
  boxAt(x0, 0, -13, x0 + 0.3, Y2, zf, pm, g); boxAt(x1 - 0.3, 0, -13, x1, Y2, zf, pm, g);
  // balcony on centre upper window
  const bx = x0 + 1.4 + 4.2 - 0.4; boxAt(bx, Y1 - 0.0, zf, bx + 3.2, Y1 + 0.18, zf + 1.1, pm, g); railRun(g, [bx + 0.05, zf + 1.05], [bx + 3.15, zf + 1.05], { y: Y1 + 0.18, h: 1.0, kind: 'bars' }); railRun(g, [bx + 0.05, zf + 1.05], [bx + 0.05, zf + 0.0], { y: Y1 + 0.18, h: 1.0, kind: 'bars' }); railRun(g, [bx + 3.15, zf + 1.05], [bx + 3.15, zf + 0.0], { y: Y1 + 0.18, h: 1.0, kind: 'bars' });
  ac(x0 + 1.6, Y1 + 0.2, zf + 0.0, g, { w: 0.86, h: 0.62, d: 0.34 }); ac(x1 - 2.4, Y1 + 0.3, zf + 0.0, g, {});
  tank(x0 + 3, Y2 + 1.17, -6, g, { r: 0.6, h: 1.2 });
  // boundary wall in front + gate
  boxAt(x0 - 1.0, 0, 9.9, x1 + 1.0, 1.7, 10.1, T.plaster(0xd9d1c1, { tileM: 3, seed: 30 + seed }), g); boxAt(x0 - 1.0, 1.7, 9.86, x1 + 1.0, 1.77, 10.14, cap, g);
  wallStreaks({ x0, x1, y0: Y1, y1: Y2, z: zf, seed: seed + 5, alpha: 0.28, count: 40 }, g);
  wallFoot({ x0, x1, z: zf, h: 0.7, seed: seed + 6, alpha: 0.3 }, g);
  void side;
}
