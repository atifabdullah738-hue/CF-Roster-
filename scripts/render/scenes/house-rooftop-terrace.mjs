// Double-storey house with usable rooftop terrace, dusk: glass railing, timber pergola, lounge seating, string lights, tank enclosure, solar panels.
import * as P from '../lib/agent2-parts.mjs';
import { setupSky, archCamera } from '../lib/agent2-env.mjs';
import { glassRailing, solarPanels } from '../lib/arch.mjs';
const { THREE, T, boxAt, cyl, ground, glazed, wallPanel, openingPts, tree, palm, bush, hedge, leafy, batten, barFence, streetscape, neighbour, lightPoint, lightSpot, stars } = P;

export default async function build({ renderer, w, h }) {
  const scene = new THREE.Scene();
  setupSky({ renderer, scene, sunElevation: -2.5, sunAzimuth: 235, sunIntensity: 0, envIntensity: 1.1, shadowExtent: 30,
    dome: { zenith: [0.03, 0.09, 0.32], mid: [0.2, 0.28, 0.62], horizon: [1.7, 0.75, 0.45], ground: [0.12, 0.09, 0.09], sunCol: [2.2, 0.8, 0.3], glow: 0.9, coverage: 0.45, soft: 0.3, cloudScale: 1.5, cloudLit: [0.9, 0.5, 0.42], cloudShade: [0.18, 0.16, 0.3], cloudOpacity: 0.75, seed: 3.3 },
    fog: { color: [0.55, 0.33, 0.3], density: 0.0045 } });
  stars(scene, { count: 260, scale: Math.max(1, w / 1280), minEl: 0.35 });
  const LED = (c = 0xffd9a0, i = 9) => T.emissive(c, i);

  const sand = T.plaster(0xd8c8a8, { tileM: 3.4, seed: 4 }), white = T.plaster(0xeeeae0, { tileM: 3.0, seed: 8 }), dark = T.plaster(0x3a3c40, { tileM: 3, seed: 2, roughness: 0.7 });
  const teak = T.wood({ color: 0xa87444, tileM: 1.6, planks: 5, seed: 6 }), teakS = T.wood({ color: 0xb9814a, tileM: 1.2, planks: 1, gap: false, seed: 4 }), steel = T.metal(0x16181b, { roughness: 0.4 });
  const stone = T.stone({ color: 0xa89c88, tileM: 2.2, seed: 11, rows: 22 }), deck = T.wood({ color: 0x8e6a45, tileM: 1.4, planks: 7, seed: 12 });
  const pave = T.paving({ color: 0xb2ab9c, tileM: 2.6, n: 5, seed: 5 }), lawn = T.grass({ color: 0x4f7a34, tileM: 5, seed: 61 });
  const fabric = (c) => T.solid(c, { roughness: 0.95 });

  ground(-140, -90, 140, 9, 0, T.grass({ color: 0x4a6a35, tileM: 6, seed: 66 }), scene);
  const st = streetscape({ scene, zb: 8.2, foot: 2.6, roadW: 21, paveColor: 0xa8a294 }); st.roadMat.color.setRGB(1.5, 1.4, 1.4);
  ground(-12, 0.3, 12, 8.2, 0.004, lawn, scene);
  ground(-8.6, -6, -3.4, 8.2, 0.012, pave, scene); ground(-8.6, 8.2, -3.4, 10.8, 0.01, pave, scene);
  for (let i = 0; i < 6; i++) boxAt(1.0 + (i % 2) * 0.1, 0.0, 1.8 + i * 1.0, 2.4 + (i % 2) * 0.1, 0.04, 2.6 + i * 1.0, pave, scene);
  const FH = 3.3, SL = 0.32, UH = 3.2, TOP = FH + SL + UH, X0 = -8.2, X1 = 8.8;

  // ---------- ground floor
  { const holes = [openingPts({ x: 2.4, y: 0, w: 1.3, h: 2.5 }), openingPts({ x: 4.6, y: 0.9, w: 3.2, h: 1.7 })];
    wallPanel({ x0: -3.4, x1: X1, y0: 0, y1: FH, z0: -0.35, t: 0.35, holes, mat: sand, parent: scene }); boxAt(-3.4, 0, -12, X1, FH, -0.35, sand, scene);
    P.doorLeaf({ x: 2.4, y: 0, w: 1.3, h: 2.5, z: 0.0, reveal: 0.1, mat: T.wood({ color: 0x6a4428, tileM: 1.5, planks: 3, seed: 9 }), frameMat: steel, panels: false, parent: scene });
    glazed({ x: 4.6, y: 0.9, w: 3.2, h: 1.7, z: 0.0, cols: 3, frame: 0x1a1c20, mode: 'night', seed: 5, reveal: 0.18, parent: scene, sill: white });
    boxAt(-3.4, 0, -0.35, -3.0, FH, 0.1, stone, scene); boxAt(X1 - 0.2, 0, -0.35, X1, FH, 0.1, stone, scene);
    boxAt(1.9, FH - 0.3, -0.0, 4.2, FH - 0.2, 1.7, dark, scene); boxAt(1.9, FH - 0.2, 1.62, 4.2, FH - 0.0, 1.7, LED(0xffd9a0, 8), scene, { cast: false });  // canopy w/ LED edge
    for (const x of [2.3, 3.1, 3.8]) { const d = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.02, 14), LED(0xfff3d6, 14)); d.position.set(x, FH - 0.31, 0.9); scene.add(d); }
    lightPoint(scene, 0xffc88a, 7, 8, 3.0, FH - 0.6, 1.2, 1.5);
    boxAt(-8.3, 0, -0.35, -3.4, FH, 0.0, sand, scene);
    // garage: slatted timber door
    boxAt(-8.2, 0, -6, -8.0, FH, 0, sand, scene); boxAt(-3.6, 0, -6, -3.4, FH, 0, sand, scene);
    batten({ x0: -7.9, x1: -3.7, y0: 0.1, y1: 2.6, z0: -0.18, z1: -0.1, pitch: 0.16, w: 0.12, mat: teakS, parent: scene, axis: 'y' }); boxAt(-8.0, 2.6, -0.2, -3.6, FH, -0.1, sand, scene);
    boxAt(-8.3, 0, -0.35, -3.3, 0.02, 0, sand, scene);
    for (const x of [-7.2, -6.0, -4.8]) boxAt(x, 0.0, 0.0, x + 0.04, 0.35, 0.12, LED(0xffd29a, 5), scene, { cast: false });
  }
  // ---------- slab + first floor
  boxAt(X0 - 0.2, FH, -12, X1 + 0.2, FH + SL, 0.35, white, scene);
  { const holes = [openingPts({ x: -6.8, y: FH + SL + 0.7, w: 2.6, h: 1.7 }), openingPts({ x: 2.2, y: FH + SL + 0.1, w: 3.6, h: 2.6 })];
    wallPanel({ x0: X0, x1: X1, y0: FH + SL, y1: TOP, z0: -0.35, t: 0.35, holes, mat: sand, parent: scene }); boxAt(X0, FH + SL, -12, X1, TOP, -0.35, sand, scene);
    glazed({ x: -6.8, y: FH + SL + 0.7, w: 2.6, h: 1.7, z: 0, cols: 2, frame: 0x1a1c20, mode: 'night', seed: 11, reveal: 0.2, parent: scene, sill: white });
    glazed({ x: 2.2, y: FH + SL + 0.1, w: 3.6, h: 2.6, z: 0, cols: 3, frame: 0x1a1c20, mode: 'night', seed: 13, reveal: 0.2, parent: scene });
    // projecting balcony in front of the big window
    boxAt(1.6, FH + SL - 0.0, 0.0, 6.4, FH + SL + 0.14, 1.6, white, scene); glassRailing({ x0: 1.6, x1: 6.4, y: FH + SL + 0.14, z0: 1.6, z1: 1.6, h: 1.05, parent: scene });
    glassRailing({ x0: 1.6, x1: 1.6, y: FH + SL + 0.14, z0: 0, z1: 1.6, h: 1.05, parent: scene }); glassRailing({ x0: 6.4, x1: 6.4, y: FH + SL + 0.14, z0: 0, z1: 1.6, h: 1.05, parent: scene });
    boxAt(1.6, FH + SL - 0.02, 1.55, 6.4, FH + SL + 0.02, 1.62, LED(0xffd9a0, 9), scene, { cast: false });
    // vertical timber fin & stone feature panel
    boxAt(-3.2, FH + SL, -0.35, -0.2, TOP, 0.08, stone, scene); batten({ x0: -8.0, x1: -7.0, y0: FH + SL + 0.1, y1: TOP - 0.1, z0: 0.0, z1: 0.14, pitch: 0.14, w: 0.06, mat: teakS, parent: scene });
    boxAt(-3.2, FH + SL + 0.8, 0.08, -0.2, FH + SL + 0.86, 0.12, LED(0xffd9a0, 5), scene, { cast: false });
    for (let i = 0; i < 3; i++) lightSpot(scene, 0xffc88a, 24, 7, 0.9, [-2.7 + i * 1.0, FH + SL + 0.2, 0.6], [-2.7 + i * 1.0, FH + SL + 3, 0.0], 0.8, 1.6);
    P.ac(7.6, FH + SL + 0.5, 0.0, scene);
  }
  // ---------- roof: parapet (low) + glass railing, terrace deck
  boxAt(X0 - 0.2, TOP, -12, X1 + 0.2, TOP + 0.3, 0.35, white, scene);
  boxAt(X0 - 0.2, TOP + 0.3, 0.1, X1 + 0.2, TOP + 0.62, 0.35, white, scene); boxAt(X0 - 0.26, TOP + 0.62, 0.06, X1 + 0.26, TOP + 0.7, 0.4, dark, scene);
  boxAt(X0 - 0.2, TOP + 0.3, -12, X0 + 0.05, TOP + 0.62, 0.35, white, scene); boxAt(X1 - 0.05, TOP + 0.3, -12, X1 + 0.2, TOP + 0.62, 0.35, white, scene);
  boxAt(X0 - 0.2, TOP - 0.04, 0.3, X1 + 0.2, TOP + 0.0, 0.42, LED(0xffd9a0, 10), scene, { cast: false });
  boxAt(X0, TOP + 0.3, -9.5, X1, TOP + 0.34, 0.1, deck, scene);   // deck
  glassRailing({ x0: X0, x1: X1, y: TOP + 0.7, z0: 0.22, z1: 0.22, h: 1.0, parent: scene });
  for (let x = X0 + 0.0; x <= X1 + 0.01; x += 2.0) boxAt(x - 0.03, TOP + 0.7, 0.19, x + 0.03, TOP + 1.7, 0.25, T.metal(0xbfc3c8, { roughness: 0.3 }), scene);
  // pergola over lounge (left)
  { const px0 = -7.6, px1 = -1.2, pz0 = -3.6, pz1 = -0.7, py = TOP + 0.34, ph = 2.5;
    for (const [x, z] of [[px0, pz0], [px1, pz0], [px0, pz1], [px1, pz1], [(px0 + px1) / 2, pz1], [(px0 + px1) / 2, pz0]]) boxAt(x - 0.08, py, z - 0.08, x + 0.08, py + ph, z + 0.08, teak, scene);
    for (const z of [pz0, pz1]) boxAt(px0 - 0.2, py + ph, z - 0.07, px1 + 0.2, py + ph + 0.2, z + 0.07, teak, scene);
    for (let x = px0 - 0.2; x <= px1 + 0.2; x += 0.45) boxAt(x, py + ph + 0.2, pz0 - 0.2, x + 0.1, py + ph + 0.3, pz1 + 0.2, teakS, scene);
    // lounge: L sofa, coffee table, cushions, planters, rug
    boxAt(px0 + 0.4, py + 0.0, pz0 + 0.2, px1 - 1.3, py + 0.015, pz1 - 0.3, fabric(0x3c4650), scene, { cast: false });
    const sofa = fabric(0xd9d2c2), cush = [0xc47a3a, 0x3d6a74, 0xe8e0cf, 0xa84a3a];
    boxAt(px0 + 0.5, py + 0.0, pz0 + 0.3, px0 + 2.7, py + 0.42, pz0 + 1.2, sofa, scene); boxAt(px0 + 0.5, py + 0.42, pz0 + 0.3, px0 + 2.7, py + 0.85, pz0 + 0.55, sofa, scene);
    boxAt(px0 + 0.5, py + 0.0, pz0 + 1.2, px0 + 1.4, py + 0.42, pz0 + 2.8, sofa, scene); boxAt(px0 + 0.5, py + 0.42, pz0 + 1.2, px0 + 0.75, py + 0.85, pz0 + 2.8, sofa, scene);
    cush.forEach((c, i) => boxAt(px0 + 0.9 + i * 0.5, py + 0.42, pz0 + 0.55, px0 + 1.3 + i * 0.5, py + 0.72, pz0 + 0.7, fabric(c), scene));
    cyl(px0 + 2.6, py + 0.2, pz0 + 2.2, 0.5, 0.5, 0.4, T.metal(0x2a2c30, { roughness: 0.4 }), scene, { seg: 24 }); cyl(px0 + 2.6, py + 0.41, pz0 + 2.2, 0.52, 0.52, 0.03, T.solid(0xd9d4c6, { roughness: 0.3 }), scene, { seg: 24 });
    for (const [x, z] of [[px0 + 4.2, pz0 + 0.5], [px0 + 4.2, pz0 + 2.6]]) { cyl(x, py + 0.0 + 0.4, z, 0.35, 0.3, 0.8, T.solid(0x2b2d30, { roughness: 0.5 }), scene, { seg: 18 }); bush(x, py + 0.7, z, 0.45, scene, { seed: x + 9, color: 0x4f8a35 }); }
    // chairs + dining at right of pergola
    for (const [x, z] of [[px1 - 1.3, pz0 + 1.2], [px1 - 0.4, pz0 + 1.2], [px1 - 1.3, pz0 + 2.4], [px1 - 0.4, pz0 + 2.4]]) boxAt(x - 0.22, py + 0.0, z - 0.22, x + 0.22, py + 0.45, z + 0.22, T.solid(0x5c4630, { roughness: 0.8 }), scene);
    boxAt(px1 - 1.7, py + 0.7, pz0 + 1.55, px1 - 0.0, py + 0.76, pz0 + 2.2, T.wood({ color: 0x6a4a2c, tileM: 1, planks: 3, seed: 3 }), scene); boxAt(px1 - 1.55, py, pz0 + 1.7, px1 - 1.45, py + 0.7, pz0 + 1.8, steel, scene); boxAt(px1 - 0.25, py, pz0 + 1.7, px1 - 0.15, py + 0.7, pz0 + 1.8, steel, scene);
    // string lights (catenary) between pergola posts and the railing
    const bulb = LED(0xffe2a8, 18), wire = T.solid(0x111111);
    const strings = [[[px0, py + ph - 0.05, pz1], [px1, py + ph - 0.05, pz1]], [[px0, py + ph - 0.05, pz0], [px1, py + ph - 0.05, pz0]], [[px0 - 0.1, py + ph - 0.05, pz1], [px0 - 0.1, py + ph - 0.05, pz0]], [[px1 + 0.1, py + ph - 0.05, pz1], [px1 + 0.1, py + ph - 0.05, pz0]], [[px1, py + ph, pz1], [X1 - 1.0, py + 2.1, 0.0]], [[px0, py + ph, pz1], [X0 + 0.3, py + 2.2, 0.0]]];
    for (const [a, b] of strings) { const n = 16, len = Math.hypot(b[0] - a[0], b[2] - a[2]); for (let i = 0; i <= n; i++) { const t = i / n, sag = Math.sin(t * Math.PI) * Math.min(0.5, len * 0.08); const s = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 6), bulb); s.position.set(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t - sag, a[2] + (b[2] - a[2]) * t); scene.add(s); } }
    lightPoint(scene, 0xffc880, 14, 11, (px0 + px1) / 2, py + 2.0, (pz0 + pz1) / 2, 1.4); lightPoint(scene, 0xffc880, 8, 8, px1 + 2.5, py + 1.8, -1.5, 1.5);
    lightSpot(scene, 0xffd49a, 40, 8, 0.8, [px0 + 1, py + 2.4, pz1], [px0 + 1.0, py, pz0 + 1], 0.8, 1.5);
  }
  // water tank enclosure (louvred) + tanks + solar panels (right)
  { const tx0 = 4.2, tx1 = 7.8, tz0 = -8.6, tz1 = -6.0, ty = TOP + 0.34;
    boxAt(tx0, ty, tz0, tx1, ty + 2.2, tz1, white, scene); for (let y = ty + 0.3; y < ty + 2.0; y += 0.16) boxAt(tx0 - 0.02, y, tz1, tx1 + 0.02, y + 0.08, tz1 + 0.06, dark, scene);
    boxAt(tx0 - 0.1, ty + 2.2, tz0 - 0.1, tx1 + 0.1, ty + 2.32, tz1 + 0.1, dark, scene);
    const tm = T.solid(0x202224, { roughness: 0.6 }); for (const x of [4.9, 6.3]) { cyl(x, ty + 2.32 + 0.55, -7.3, 0.55, 0.55, 1.1, tm, scene, { seg: 24 }); cyl(x, ty + 2.32 + 1.15, -7.3, 0.38, 0.55, 0.16, tm, scene); }
    solarPanels(1.0, -4.0, 3, 1, ty + 0.1, scene, { tilt: 0.4 });
    P.ac(8.0, ty, -3.6, scene);
  }
  // ---------- fence, gate, planting, lamps
  const zb = 8.2;
  boxAt(-30, 0, zb - 0.13, -3.0, 0.5, zb + 0.13, stone, scene); boxAt(-3.0 + 7.6, 0, zb - 0.13, 30, 0.5, zb + 0.13, stone, scene); boxAt(-2.0, 0, zb - 0.13, 3.0, 0.5, zb + 0.13, stone, scene);
  barFence({ x0: -30, x1: -3.0, y0: 0.5, y1: 1.6, z: zb, pitch: 0.14, bar: 0.03, mat: steel, parent: scene, rails: [0, 1] }); barFence({ x0: -2.0, x1: 30, y0: 0.5, y1: 1.6, z: zb, pitch: 0.14, bar: 0.03, mat: steel, parent: scene, rails: [0, 1] });
  boxAt(-30, 0.01, zb + 0.14, -3.0, 0.05, zb + 0.18, LED(0xffd29a, 4), scene, { cast: false });
  for (const px of [-3.0, -2.0 + 0, 5.6, 13, 20]) { boxAt(px - 0.28, 0, zb - 0.28, px + 0.28, 2.0, zb + 0.28, stone, scene); boxAt(px - 0.34, 2.0, zb - 0.34, px + 0.34, 2.08, zb + 0.34, dark, scene); boxAt(px - 0.12, 2.08, zb - 0.12, px + 0.12, 2.34, zb + 0.12, LED(0xfff0cc, 16), scene, { cast: false }); }
  hedge(-2.0, 7.0, 6, 7.0, { h: 0.6, w: 0.45, density: 70, seed: 13, color: 0x3f6f30 }, scene);
  for (const [x, z, r] of [[0.0, 1.4, 0.5], [-1.5, 2.8, 0.4], [7.5, 2.6, 0.5], [9.2, 3.2, 0.4]]) leafy(bush(x, 0, z, r, scene, { seed: x * 5 + 3, color: 0x4f8a35 }), { emissive: 0x0e1c08, k: 0.5 });
  lightSpot(scene, 0xffc080, 90, 14, 0.5, [-11.8, 0.1, 5.8], [-12, 7, 5.8], 0.8, 1.5); lightSpot(scene, 0xffc080, 90, 14, 0.5, [11.6, 0.1, 5.8], [11.6, 7, 5.8], 0.8, 1.5);
  boxAt(-11.9, 0.0, 5.7, -11.7, 0.1, 5.9, LED(0xffc890, 14), scene, { cast: false }); boxAt(11.5, 0.0, 5.7, 11.7, 0.1, 5.9, LED(0xffc890, 14), scene, { cast: false });
  palm(-11.8, 5.8, { h: 8.5, seed: 3, lean: 0.2 }, scene); palm(11.6, 5.8, { h: 8, seed: 8, lean: -0.3 }, scene);
  leafy(tree(-16, 3.5, { h: 8.5, crown: 3.4, seed: 2, color: 0x4f7a38 }, scene), { emissive: 0x0a1406, k: 0.45 }); leafy(tree(15.5, 3.0, { h: 8, crown: 3.1, seed: 6, color: 0x4f7a38 }, scene), { emissive: 0x0a1406, k: 0.45 });
  leafy(tree(-3, -21, { h: 12, crown: 5, seed: 11, color: 0x3f6a30 }, scene), { emissive: 0x08100a, k: 0.3 }); leafy(tree(8, -21, { h: 11, crown: 4.5, seed: 12, color: 0x3f6a30 }, scene), { emissive: 0x08100a, k: 0.3 });
  const lampPost = (x, z, dir) => { P.streetLamp(x, z, scene, { dir, on: true }); lightSpot(scene, 0xffc17a, 260, 24, 0.9, [x + dir * 1.6, 7.0, z], [x + dir * 1.6, 0, z + 1], 0.9, 1.4); };
  lampPost(-15, 11.0, 1); lampPost(15, 11.0, -1);
  P.car({ x: 8.0, z: 12.6, rot: Math.PI / 2, color: 0xb9bcc2, parent: scene, y: -0.15, lights: false });
  neighbour({ x0: -36, x1: -13.2, z: -1, depth: 14, floors: 2, mat: T.plaster(0xb9ab94, { tileM: 3.4, seed: 12 }), trim: T.plaster(0xd9d3c6, { tileM: 3, seed: 15 }), seed: 3, scene, mode: 'night' });
  neighbour({ x0: 13.4, x1: 38, z: -2, depth: 14, floors: 3, mat: T.plaster(0xaa9f8c, { tileM: 3.4, seed: 17 }), trim: T.plaster(0xd2ccbe, { tileM: 3, seed: 18 }), seed: 5, scene, mode: 'night' });
  P.backdrop({ scene, z: -34, seed: 7, palette: [0xa09480, 0x948a78], mode: 'night', treeColor: 0x3a5f2c });

  const camera = archCamera({ pos: [-7, 5.4, 21.5], target: [0.5, 0, 0], focal: 34, shift: -0.03, w, h });
  return { scene, camera, exposure: 0.55, aoRadius: 0.9, aoStrength: 1.0, bloom: true, bloomStrength: 0.34, bloomRadius: 0.75, bloomThreshold: 3.0, grade: { contrast: 1.12, saturation: 1.1, vignette: 0.3, grain: 0.018, warm: 0.01 } };
}
