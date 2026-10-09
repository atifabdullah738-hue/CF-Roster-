import { crownTree, mound, flowerMass, hedgeRow, cam, skyDome, treeline, THREE, T, bx, boxAt, ground, cyl, tree, palm, bush, hedge, facade, shell, glazing, surround, parapet, slatScreen, downlights, pointLight, room, pillar, gate, roadX, footpath, neighbour, waterTankLite, acCondenser, car, streetLamp, grunge, wallStain, pebbles, planterBed, sky, glass, coat, ledStrip, numberPlate } from '../lib/agent1-kit.mjs';
import { glassRailing, doorUnit, solarPanels } from '../lib/arch.mjs';
import { setupEnvironment, archCamera } from '../lib/env.mjs';

export default async function build({ renderer, w, h }) {
  const scene = new THREE.Scene();
  const env = setupEnvironment({ renderer, scene, sunElevation: 31, sunAzimuth: 300, turbidity: 3.5, rayleigh: 1.0, mie: 0.005, sunIntensity: 3.8, sunColor: 0xffe0bd, envIntensity: 0.24, shadowExtent: 26, shadowCenter: [0, 3, 0],
    clouds: { coverage: 0.3, density: 0.3, scale: 0.00028, elevation: 0.6 } });
  env.sky.visible = false;
  skyDome(scene, { sunElevation: 31, sunAzimuth: 300, zenith: 0x2766cf, horizon: 0xd6e6f6, cloudCover: 0.42, cloudScale: 2.2, glow: 0.25, seed: 4, cloudShadow: 0x8fa5c6, cloudBright: 1.35, gain: 3.6 });
  treeline({ scene, z: -90, y: -1, hMax: 30, color: '#6f8a6a', haze: '#d5e0e7', bright: 2.4 });
  scene.fog = new THREE.FogExp2(0xdde4ea, 0.0034);

  // ---------------------------------------------------------------- materials
  const white = T.plaster(0xe6e1d7, { tileM: 3.5, seed: 4 }), white2 = T.plaster(0xe9e5dc, { tileM: 3.5, seed: 8 });
  const graph = T.plaster(0x3a3d42, { tileM: 3, seed: 2, roughness: 0.78 }), graph2 = T.plaster(0x44474c, { tileM: 3, seed: 12, roughness: 0.78 });
  const cap = T.concrete(0x6a6c70, { tileM: 2, seed: 41 }), conc = T.concrete(0xb0afaa, { tileM: 2.5, seed: 7 });
  const slate = T.stone({ color: 0x4a4b4e, tileM: 2.2, seed: 15, rows: 18 });
  const timber = T.wood({ color: 0x9a6b40, tileM: 1.4, planks: 4, seed: 24 }), doorW = T.wood({ color: 0x7c4f2c, tileM: 1.2, planks: 3, seed: 26, gap: true });
  const gateW = [T.wood({ color: 0x3b2a20, tileM: 1.0, planks: 1, gap: false, seed: 9 }), T.wood({ color: 0x45322a, tileM: 1.0, planks: 1, gap: false, seed: 10 })];
  const pave = T.paving({ color: 0xbfbbb1, tileM: 2.4, n: 6, seed: 41 }), drive = T.paving({ color: 0x8d8b86, tileM: 2.4, n: 5, seed: 45 });
  const lawn = T.grass({ color: 0x5f8a3d });

  // ---------------------------------------------------------------- ground
  ground(-140, -80, 140, 80, -0.02, T.solid(0x7c6f5c, { roughness: 1 }), scene);
  const X0 = -3.35, X1 = 3.35, G = 0.3, U = 3.6, RF = 6.9, PH = 1.0, ZW = 3.4;
  const H = new THREE.Group(); scene.add(H);

  // ---------------------------------------------------------------- neighbours (left lower/cream, right taller/grey)
  neighbour({ x0: -14.2, x1: -3.35, zF: 0.7, depth: 12, floors: 2, storeyH: 3.3, wall: 0xb4bcc0, accent: 0x4c5660, seed: 3, zWall: ZW, wallH: 1.7, parent: scene, glow: 0.12, frameCol: 0x3a2f27 });
  neighbour({ x0: 3.35, x1: 14.2, zF: -0.5, depth: 12, floors: 3, storeyH: 3.2, wall: 0xcdbfa6, accent: 0x6e5a42, seed: 5, zWall: ZW, wallH: 1.6, parent: scene, glow: 0.1 });
  neighbour({ x0: -26, x1: -14.2, zF: -0.3, depth: 12, floors: 2, storeyH: 3.2, wall: 0xe4dcc9, accent: 0x8a5a3c, seed: 7, zWall: ZW, parent: scene });
  neighbour({ x0: 14.2, x1: 27, zF: 0.4, depth: 12, floors: 2, storeyH: 3.3, wall: 0xd1cbbc, accent: 0x5c6a58, seed: 9, zWall: ZW, parent: scene });

  // ---------------------------------------------------------------- house: ground floor
  // front wall (right volume) with door + tall window
  const dX = 0.55, dW = 1.15, wX = 2.0, wW = 1.05;
  facade({ x0: -0.15, x1: X1, y0: 0, y1: U - 0.3, z: 0, t: 0.3, mat: white, openings: [{ x: dX, y: G, w: dW, h: 2.3 }, { x: wX, y: G + 0.35, w: wW, h: 2.4 }], parent: H });
  // slate entrance feature wall (veneer, real opening for door)
  facade({ x0: -0.15, x1: 1.85, y0: 0, y1: U - 0.3, z: 0.1, t: 0.1, mat: slate, openings: [{ x: dX, y: G, w: dW, h: 2.3 }], parent: H });
  doorUnit({ x: dX, y: G, w: dW, h: 2.3, z: 0, mat: doorW, recess: 0.18, frame: 0x1a1c1f, handle: 0xcfd2d6 }, H);
  glazing({ x: wX, y: G + 0.35, w: wW, h: 2.4, z: 0, cols: 1, rows: 3, frame: 0x1a1c1f, parent: H, rowH: [0.62, 0.2, 0.18] });
  room({ x0: wX - 0.3, x1: wX + wW + 0.2, floorY: G, ceilY: U - 0.4, zF: -0.3, depth: 4.4, style: 'dining', glow: 0.16, seed: 1, parent: H });
  bx(X1 - 0.0, 0, -0.3, X1 + 0.0, 0, 0, white, H); // placeholder (zero)
  // plinth band under right vol
  bx(-0.15, 0, -0.05, X1, G, 0.12, slate, H);
  // shell for ground right volume + side walls running full depth
  shell({ x0: X0, x1: X1, y0: 0, y1: U - 0.3, zF: -0.3, zB: -12.5, t: 0.25, side: white2, back: white2, roofMat: conc, parent: H });
  // porch: back wall, floor, soffit
  bx(X0, 0, -5.2, -0.15, U - 0.3, -5.0, white2, H);
  const porchDoorX = -2.9; doorUnit({ x: porchDoorX, y: G, w: 1.1, h: 2.2, z: -5.0, mat: doorW, recess: 0.0, frame: 0x1a1c1f }, H);
  ground(X0 + 0.02, -5.0, -0.15, 0.02, 0.012, drive, H);
  bx(X0, U - 0.34, -5.2, -0.15, U - 0.3, 0.0, T.wood({ color: 0xa87a4a, tileM: 1.2, planks: 8, seed: 33 }), H, { swap: true });
  downlights([[-2.8, 0.6], [-1.6, 0.6], [-0.6, 0.6], [-2.8, -1.2], [-1.6, -1.2], [-0.6, -1.2], [-2.8, -3.2], [-0.6, -3.2]], { y: U - 0.34, intensity: 7, color: 0xffe6bd, parent: H });
  bx(X0 + 0.15, 2.6, -5.0, X0 + 0.5, 2.62, -4.7, T.emissive(0xffe2b0, 6), H, { cast: false });
  // pendant-wall lamp on porch side wall
  bx(-0.19, 1.9, -2.1, -0.15, 2.3, -1.9, T.emissive(0xffdca0, 5), H, { cast: false });
  pointLight(scene, 0xffd9a8, 6, -1.8, 2.7, -1.5, 7, 1.8);
  car({ x: -1.9, z: -2.6, rot: -Math.PI / 2, color: 0x9a9da3, type: 'sedan', parent: H });
  // slab edge between floors
  bx(X0 - 0.03, U - 0.3, -0.35, X1 + 0.03, U + 0.02, 0.1, white, H); bx(X0 - 0.03, U - 0.28, 0.1, X1 + 0.03, U - 0.02, 0.14, graph, H);

  // ---------------------------------------------------------------- first floor
  // framed bedroom box on the left (projects 0.9 m)
  const bx0 = X0, bx1 = 0.55, by0 = U + 0.02, by1 = RF + 0.05, pr = 0.9;
  // recessed back wall with big window
  facade({ x0: X0, x1: X1, y0: U, y1: RF, z: 0, t: 0.3, mat: white, openings: [{ x: -2.65, y: U + 0.5, w: 2.7, h: 2.25 }, { x: 0.9, y: U + 0.2, w: 2.05, h: 2.4 }], parent: H });
  glazing({ x: -2.65, y: U + 0.5, w: 2.7, h: 2.25, z: 0, cols: 3, rows: 1, frame: 0x1a1c1f, parent: H, colW: [0.34, 0.33, 0.33] });
  room({ x0: -2.95, x1: 0.35, floorY: U, ceilY: U + 2.95, zF: -0.3, depth: 4.3, style: 'bed', glow: 0.16, seed: 3, parent: H });
  // loggia (right): recess behind, sliding door
  glazing({ x: 0.9, y: U + 0.2, w: 2.05, h: 2.4, z: 0, cols: 2, frame: 0x1a1c1f, parent: H, reveal: 0.08 });
  room({ x0: 0.7, x1: 3.15, floorY: U, ceilY: U + 2.95, zF: -0.3, depth: 4.5, style: 'living', glow: 0.14, seed: 5, parent: H, wallColor: 0xd8cdb8 });
  // box frame (dark graphite)
  bx(bx0, by0 + 3.02, 0, bx1, by1 - 0.05, pr, graph, H); bx(bx0, by0 - 0.0, 0, bx1, by0 + 0.38, pr, graph, H);
  bx(bx0, by0, 0, bx0 + 0.3, by1 - 0.05, pr, graph2, H); bx(bx1 - 0.3, by0, 0, bx1, by1 - 0.05, pr, graph2, H);
  // timber lining inside the frame ceiling
  bx(bx0 + 0.3, by0 + 3.0, 0, bx1 - 0.3, by0 + 3.02, pr - 0.0, T.wood({ color: 0xa87a4a, tileM: 1.2, planks: 8, seed: 33 }), H, { swap: true });
  bx(bx0, by1 - 0.05, -0.2, bx1 + 0.04, by1 + 0.02, pr + 0.04, cap, H);
  ledStrip(bx0 + 0.3, by0 + 3.0, pr - 0.04, bx1 - 0.3, by0 + 3.01, pr - 0.02, { color: 0xffe2b0, intensity: 6, parent: H });
  // right loggia: slab floor + side + railing + fascia
  bx(bx1, U - 0.02, -1.6, X1, U + 0.14, 0.0, T.concrete(0xaaa8a2, { tileM: 2, seed: 70 }), H); // loggia floor tile
  bx(bx1, U + RF - U - 0.55, -0.35, X1 + 0.0, RF, 0.05, white, H); // top fascia over loggia
  bx(bx1, U + 2.9, -0.35, X1, U + 3.0, 0.0, white, H);
  glassRailing({ x0: bx1 + 0.02, x1: X1 - 0.02, y: U + 0.14, z0: -0.02, z1: -0.02, h: 1.0, parent: H });
  bx(bx1, U + 0.14, -0.3, bx1 + 0.04, U + 1.15, 0.0, glass({ opacity: 0.3 }), H, { cast: false });
  acCondenser(2.6, U + 0.14, -0.9, H, { rot: 0 });
  // ornamental planter on loggia
  bx(0.7, U + 0.14, -1.1, 1.05, U + 0.64, -0.5, graph, H); bush(0.88, U + 0.6, -0.8, 0.28, H, { seed: 4, color: 0x4a8a3a });
  // vertical fin at right edge
  bx(X1 - 0.18, U, 0.0, X1, RF, 0.3, graph2, H);
  // dark parapet cap & parapet
  parapet({ x0: X0, x1: X1, zF: 0.0, zB: -12.5, y: RF, h: PH, t: 0.2, mat: white, cap, parent: H });
  bx(X0, RF - 0.2, -12.5, X1, RF, 0.0, conc, H);
  // flat roof
  ground(X0 + 0.2, -12.3, X1 - 0.2, -0.2, RF + 0.005, T.concrete(0x9d9b95, { tileM: 2, seed: 60 }), H);
  waterTankLite(1.9, RF, -2.2, H); waterTankLite(0.6, RF, -2.9, H, { r: 0.5, h: 1.0 });
  // signage-free nameplate & meter, wall lamps on facade
  bx(-0.2 + 0.0, 2.25, 0.2, 0.15, 2.4, 0.22, T.solid(0x1e2023, { roughness: 0.4 }), H, { cast: false });
  bx(1.7, G + 1.0, 0.12, 1.84, G + 1.5, 0.2, T.emissive(0xffdca0, 4), H, { cast: false });

  // ---------------------------------------------------------------- front: boundary wall, gate, garden
  const wallM = white, pcap = cap;
  // left gate section with pillars
  pillar({ x: X0 + 0.23, z: ZW, w: 0.46, h: 1.95, mat: graph, cap: pcap, lampI: 7, parent: scene });
  pillar({ x: -0.18, z: ZW, w: 0.46, h: 1.95, mat: graph, cap: pcap, lampI: 7, parent: scene });
  gate({ x0: -3.1, x1: -2.1, z: ZW, y1: 1.9, mats: gateW, parent: scene, leaves: 1 });
  // open leaf slid to the right of the opening, behind pillar line
  bx(-3.1, 0, ZW - 0.06, -0.41, 0.05, ZW + 0.06, coat(0x222426), scene);
  // right: low wall with dark top, planter wall
  bx(0.05, 0, ZW - 0.12, X1, 1.0, ZW + 0.12, wallM, scene); bx(0.0, 1.0, ZW - 0.17, X1 + 0.02, 1.07, ZW + 0.17, pcap, scene);
  bx(0.05, 0.35, ZW + 0.12, 2.6, 0.75, ZW + 0.2, slate, scene); // stone band
  // pedestrian gate
  gate({ x0: 0.3, x1: 1.3, z: ZW + 0.0, y0: 0.0, y1: 1.45, mats: gateW, vertical: true, parent: scene, leaves: 1, seed: 8 });
  bx(1.55, 0.5, ZW + 0.12, 1.95, 0.85, ZW + 0.22, T.solid(0x6b6e72, { roughness: 0.6, metalness: 0.4 }), scene, { cast: false }); // meter box
  // front garden: pebbles + bushes
  ground(0.2, 0.1, X1, ZW - 0.12, 0.014, pebbles({ tileM: 1.3 }), scene);
  bx(0.2, 0, 0.1, X1, 0.16, 0.18, graph2, scene); // kerb edging
  mound(0.6, 0.0, 2.2, 0.45, scene, { seed: 4 }); mound(2.6, 0.0, 2.4, 0.42, scene, { seed: 14, tint: 0xe6ffd0 }); mound(3.0, 0.0, 1.1, 0.35, scene, { seed: 17 });
  flowerMass({ x0: 2.0, x1: 3.3, y0: 0.9, y1: 1.5, z: ZW + 0.0, depth: 0.5, seed: 5, parent: scene }); mound(1.5, 0.0, 1.6, 0.4, scene, { seed: 2 });
  // approach: paved
  ground(-3.35, 0.1, 0.2, ZW, 0.012, drive, scene); ground(0.2, 0.1, 1.5, 1.4, 0.016, pave, scene);

  // ---------------------------------------------------------------- street
  footpath({ x0: -60, x1: 60, z0: ZW + 0.12, z1: 5.5, y: 0.1, mat: pave, parent: scene });
  roadX({ x0: -60, x1: 60, zN: 5.5, zF: 12.8, seed: 3, parent: scene });
  footpath({ x0: -60, x1: 60, z0: 12.8, z1: 16, y: 0.12, mat: pave, parent: scene });
  // trees on the footpath + behind
  crownTree(-8.6, 4.6, { h: 8.5, crown: 3.0, kind: 'neem', seed: 21, trunkR: 0.2, lean: -0.3 }, scene);
  crownTree(9.4, 4.6, { h: 9, crown: 3.2, kind: 'umbrella', seed: 22, trunkR: 0.2, lean: 0.4 }, scene);
  crownTree(-18, 4.6, { h: 8, crown: 3.2, kind: 'neem', seed: 26 }, scene); crownTree(19, 4.6, { h: 9, crown: 3.4, kind: 'tall', seed: 28 }, scene);
  crownTree(-5.5, -16, { h: 13, crown: 5.4, kind: 'neem', seed: 12 }, scene); crownTree(7, -17, { h: 13, crown: 5.4, kind: 'umbrella', seed: 13 }, scene); crownTree(-22, -14, { h: 12, crown: 4.8, kind: 'tall', seed: 15 }, scene);
  palm(-12.4, 3.9, { h: 8.2, seed: 3, lean: 0.3 }, scene);
  // street lamp + parked car in the road in front of left neighbour
  streetLamp({ x: 10.5, z: 5.2, h: 7.5, arm: -1.7, dir: -1, parent: scene });
  car({ x: 10.5, z: 11.0, rot: Math.PI, color: 0xe8e8e6, type: 'sedan', parent: scene });
  // weathering
  wallStain({ x0: X0, x1: X1, y0: 3.7, y1: RF, z: 0, seed: 3, alpha: 0.1, parent: H });

  const camera = cam({ pos: [0.4, 1.75, 15.6], target: [0.2, 1.75, 0], focal: 32, shift: 0.2, w, h });
  return { scene, camera, exposure: 0.46, aoRadius: 0.7, aoStrength: 1.0, grade: { contrast: 1.16, saturation: 1.14, vignette: 0.22, grain: 0.015, warm: 0.04 } };
}
