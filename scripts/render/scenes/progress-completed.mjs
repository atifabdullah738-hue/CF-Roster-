// Finished, handover-ready mid-sized family home in warm daylight: tidy lawn, driveway, fresh landscaping.
import * as P from '../lib/agent2-parts.mjs';
import { setupSky, archCamera } from '../lib/agent2-env.mjs';
import { glassRailing } from '../lib/arch.mjs';
const { THREE, T, boxAt, cyl, ground, glazed, wallPanel, openingPts, ring, tree, palm, bush, hedge, leafy, batten, barFence, streetscape, neighbour, cornice, balustrade, lightPoint } = P;

export default async function build({ renderer, w, h }) {
  const scene = new THREE.Scene();
  setupSky({ renderer, scene, sunElevation: 32, sunAzimuth: 38, sunIntensity: 6.8, sunColor: 0xffe2bc, envIntensity: 0.8, shadowExtent: 34, shadowCenter: [0, 0, 3],
    dome: { zenith: [0.17, 0.44, 1.3], mid: [0.45, 0.74, 1.38], horizon: [1.5, 1.3, 1.1], sunCol: [3.2, 2.2, 1.3], coverage: 0.5, soft: 0.2, cloudScale: 1.4, seed: 6.6, cloudLit: [2.4, 2.25, 2.1], cloudShade: [0.85, 0.9, 1.05] },
    fog: { color: [1.3, 1.2, 1.05], density: 0.003 } });

  const cream = T.plaster(0xe8dcbf, { tileM: 3.4, seed: 4 }), cream2 = T.plaster(0xe0d3b2, { tileM: 3.0, seed: 8 }), white = T.plaster(0xf4f0e6, { tileM: 2.6, seed: 9 }), brown = T.plaster(0x6e4e3a, { tileM: 3, seed: 2, roughness: 0.75 });
  const base = T.stone({ color: 0x9b8f7c, tileM: 2.2, seed: 11, rows: 20 }), tile = T.brick({ color: 0x8a4a38, mortar: 0x6e3c2e, tileM: 1.0, rows: 12, cols: 10, seed: 3, variation: 0.18 });
  const wood = T.wood({ color: 0x7a4e2c, tileM: 1.4, planks: 3, seed: 9 }), steel = T.metal(0x2a2c30, { roughness: 0.45 });
  const pave = T.paving({ color: 0xc8c0b0, tileM: 2.4, n: 6, seed: 5 }), paveD = T.paving({ color: 0x8e887c, tileM: 2.0, n: 8, seed: 6 });
  const lawnA = T.grass({ color: 0x74a444, tileM: 5, seed: 61 }), lawnB = T.grass({ color: 0x669a3a, tileM: 4.3, seed: 64 });

  ground(-140, -90, 140, 9, 0, T.grass({ color: 0x6b8c45, tileM: 6, seed: 66 }), scene);
  const st = streetscape({ scene, zb: 8.0, foot: 2.6, roadW: 21, paveColor: 0xbdb5a5 }); st.roadMat.color.setRGB(1.9, 1.75, 1.6);
  for (let i = 0; i < 12; i++) ground(-12 + i * 2, 0.3, -12 + (i + 1) * 2, 7.9, 0.004, i % 2 ? lawnA : lawnB, scene);
  ground(-6.3, -6, -1.0, 8.0, 0.012, pave, scene); ground(-6.3, 8.0, -1.0, 10.8, 0.01, pave, scene);
  for (const x of [-6.3, -3.65, -1.0]) boxAt(x - 0.04, 0.012, -6, x + 0.04, 0.02, 8.0, paveD, scene, { cast: false });
  boxAt(-6.5, 0.0, -6, -6.3, 0.1, 8.0, T.concrete(0xb0aca2, { tileM: 2, seed: 8 }), scene); boxAt(-1.0, 0.0, -6, -0.8, 0.1, 8.0, T.concrete(0xb0aca2, { tileM: 2, seed: 8 }), scene);
  for (let i = 0; i < 7; i++) boxAt(1.4 + (i % 2) * 0.08, 0.0, 1.6 + i * 0.9, 2.9 + (i % 2) * 0.08, 0.04, 2.3 + i * 0.9, pave, scene);
  ground(0.4, 0.2, 4.2, 1.6, 0.03, pave, scene);

  const H = new THREE.Group(); scene.add(H);
  const FH = 3.3, SL = 0.3, UH = 3.1, TOP = FH + SL + UH, X0 = -6.8, X1 = 6.8;

  // ---------- ground floor
  { const holes = [openingPts({ x: 1.0, y: 0, w: 1.2, h: 2.4 })];
    wallPanel({ x0: -1.0, x1: X1, y0: 0, y1: FH, z0: -0.35, t: 0.35, holes, mat: cream, parent: H }); boxAt(-1.0, 0, -11, X1, FH, -0.35, cream, H);
    P.doorLeaf({ x: 1.0, y: 0, w: 1.2, h: 2.4, z: 0.0, reveal: 0.12, mat: wood, frameMat: white, panels: true, parent: H });
    boxAt(0.7, 2.4, -0.0, 2.5, 2.52, 1.2, white, H); boxAt(0.7, 2.52, 0.0, 2.5, 2.6, 1.2, brown, H);
    for (const x of [0.78, 2.42]) boxAt(x - 0.06, 0, 1.0, x + 0.06, 2.4, 1.12, white, H);
    boxAt(-1.0, 0, -0.35, X1, 0.5, 0.06, base, H);    // plinth
    // bay window (projecting) on right
    const bx0 = 3.4, bx1 = 6.4, bz = 1.0, by = 0.8;
    boxAt(bx0, 0, 0.0, bx1, 0.5, bz, base, H); boxAt(bx0, 0.5, 0.0, bx1, by, bz, cream, H); boxAt(bx0, by + 1.7, 0.0, bx1, FH - 0.1, bz, cream, H);
    boxAt(bx0, by, 0.0, bx0 + 0.18, by + 1.7, bz, cream, H); boxAt(bx1 - 0.18, by, 0.0, bx1, by + 1.7, bz, cream, H);
    glazed({ x: bx0 + 0.18, y: by, w: bx1 - bx0 - 0.36, h: 1.7, z: bz, cols: 3, frame: 0xf2eee4, frameW: 0.06, mode: 'day', seed: 5, reveal: 0.12, parent: H, sill: white });
    boxAt(bx0 - 0.1, FH - 0.1, 0.0, bx1 + 0.1, FH + 0.06, bz + 0.15, white, H);
    // carport (left): flat slab on two square pillars; car underneath
    boxAt(-6.9, 0, -6, -6.7, FH, 0, cream2, H); boxAt(-6.9, 0, -6, -6.7, FH, 0, cream2, H);
    boxAt(-1.2, 0, -0.35, -1.0, FH, 1.9, cream2, H);
    for (const [x, z] of [[-6.6, 2.0], [-1.2, 2.0]]) { boxAt(x - 0.22, 0, z - 0.22, x + 0.22, 0.6, z + 0.22, base, H); boxAt(x - 0.17, 0.6, z - 0.17, x + 0.17, FH, z + 0.17, cream2, H); boxAt(x - 0.24, FH - 0.2, z - 0.24, x + 0.24, FH, z + 0.24, white, H); }
    boxAt(-6.9, 0, -6, -1.0, FH, -5.8, cream, H);
    P.car({ x: -3.9, z: -1.2, rot: 0.0, color: 0xeeeeea, parent: H });
    boxAt(-6.9, FH - 0.04, -6, -1.0, FH, 2.2, white, H, { cast: false });
  }
  // ---------- slab + first floor
  boxAt(X0, FH, -11, X1, FH + SL, 2.2, white, H);
  { const holes = [openingPts({ x: -5.9, y: FH + SL + 0.65, w: 1.8, h: 1.7 }), openingPts({ x: -2.2, y: FH + SL + 0.65, w: 1.8, h: 1.7 }), openingPts({ x: 1.0, y: FH + SL + 0.1, w: 1.5, h: 2.5 }), openingPts({ x: 3.9, y: FH + SL + 0.65, w: 2.0, h: 1.7 })];
    wallPanel({ x0: X0 + 0.2, x1: X1 - 0.2, y0: FH + SL, y1: TOP, z0: -0.35, t: 0.35, holes, mat: cream, parent: H }); boxAt(X0 + 0.2, FH + SL, -11, X1 - 0.2, TOP, -0.35, cream, H);
    for (const [x, y, ww, hh, sd] of [[-5.9, FH + SL + 0.65, 1.8, 1.7, 11], [-2.2, FH + SL + 0.65, 1.8, 1.7, 12], [3.9, FH + SL + 0.65, 2.0, 1.7, 14]]) {
      glazed({ x, y, w: ww, h: hh, z: 0, cols: 2, frame: 0xf2eee4, frameW: 0.06, mode: 'day', seed: sd, reveal: 0.18, parent: H, sill: white });
      boxAt(x - 0.25, y - 0.0, 0.0, x - 0.02, y + hh, 0.1, cream2, H); boxAt(x + ww + 0.02, y, 0.0, x + ww + 0.25, y + hh, 0.1, cream2, H);   // shutters/fins
      boxAt(x - 0.25, y + hh, 0.0, x + ww + 0.25, y + hh + 0.14, 0.2, white, H); }
    // balcony door + small balcony
    glazed({ x: 1.0, y: FH + SL + 0.1, w: 1.5, h: 2.5, z: 0, cols: 2, frame: 0xf2eee4, mode: 'day', seed: 20, reveal: 0.18, parent: H });
    boxAt(0.6, FH + SL, 0.0, 2.9, FH + SL + 0.1, 1.0, white, H); glassRailing({ x0: 0.6, x1: 2.9, y: FH + SL + 0.1, z0: 1.0, z1: 1.0, h: 1.0, parent: H });
    // tiled roof strip over the bay window (hip)
    const rs = new THREE.Shape([new THREE.Vector2(0, 0), new THREE.Vector2(1.6, 0), new THREE.Vector2(1.1, 0.7), new THREE.Vector2(0.5, 0.7)]); void rs;
  }
  boxAt(X0 - 0.1, TOP, -11, X1 + 0.1, TOP + 0.3, 0.3, white, H);
  boxAt(X0 - 0.1, TOP + 0.3, 0.0, X1 + 0.1, TOP + 1.0, 0.25, cream, H); boxAt(X0 - 0.16, TOP + 1.0, -0.06, X1 + 0.16, TOP + 1.1, 0.32, brown, H);
  boxAt(X0 - 0.1, TOP + 0.3, -11, X0 + 0.15, TOP + 1.0, 0.25, cream, H); boxAt(X1 - 0.15, TOP + 0.3, -11, X1 + 0.1, TOP + 1.0, 0.25, cream, H);
  // pitched tile accent over the front porch roof (slope visible above the entrance)
  { const g = new THREE.Group(); const sh = new THREE.Shape([new THREE.Vector2(0, 0), new THREE.Vector2(3.8, 0), new THREE.Vector2(3.0, 0.9), new THREE.Vector2(0.8, 0.9)]);
    const geo = new THREE.ExtrudeGeometry(sh, { depth: 0.25, bevelEnabled: false }); geo.rotateX(-Math.PI / 2 + 0.0); void geo; void g; }
  { const slope = new THREE.BoxGeometry(5.0, 0.12, 1.5); slope.rotateX(0.38); slope.translate(-3.9, FH + SL + 0.9, 0.9 + 0.0); P.add(slope, tile, H);
    boxAt(-6.5, FH + SL, 0.0, -1.3, FH + SL + 0.6, 0.12, cream2, H); }
  // water tank + AC
  { const tm = T.solid(0x1f2124, { roughness: 0.6 }); for (const x of [-4.2, -2.9]) { cyl(x, TOP + 0.3 + 0.55, -6, 0.55, 0.55, 1.1, tm, H, { seg: 24 }); cyl(x, TOP + 0.3 + 1.15, -6, 0.38, 0.55, 0.16, tm, H); boxAt(x - 0.5, TOP + 0.3, -6.5, x + 0.5, TOP + 0.3, -5.5, cream, H); }
    P.ac(4.6, FH + SL + 0.3, -0.0 + 0.05, H); }
  cornice({ x0: X0, x1: X1, y: FH + SL - 0.02, z: 2.2, layers: [[0.05, 0.1]], mat: white, parent: H, zBack: 2.0 });
  P.weather({ x0: -1, x1: X1, y0: 0.5, y1: 1.4, z: 0.0, parent: H, alpha: 0.2, seed: 7 }); P.weather({ x0: X0 + 0.2, x1: X1 - 0.2, y0: TOP - 1.0, y1: TOP, z: 0.0, parent: H, alpha: 0.18, dir: 'down', seed: 9 });
  for (const x of [-4, 3.5]) boxAt(x - 0.1, 2.2, 0.02, x + 0.1, 2.6, 0.18, T.emissive(0xffe2b0, 1.2), H, { cast: false });

  // ---------- boundary: cream wall w/ bars, brick piers, open gate
  const zb = 8.0;
  for (const [xa, xb] of [[-30, -6.8], [-0.5, 30]]) { boxAt(xa, 0, zb - 0.15, xb, 0.8, zb + 0.15, cream, scene); boxAt(xa, 0.8, zb - 0.2, xb, 0.88, zb + 0.2, white, scene); barFence({ x0: xa, x1: xb, y0: 0.88, y1: 1.55, z: zb, pitch: 0.13, bar: 0.03, mat: steel, parent: scene, rails: [0, 1] });
    for (let x = Math.ceil(xa / 4.5) * 4.5; x <= xb; x += 4.5) { boxAt(x - 0.25, 0, zb - 0.25, x + 0.25, 1.75, zb + 0.25, base, scene); boxAt(x - 0.3, 1.75, zb - 0.3, x + 0.3, 1.83, zb + 0.3, white, scene); } }
  for (const px of [-6.8, -0.5]) { boxAt(px - 0.3, 0, zb - 0.3, px + 0.3, 2.0, zb + 0.3, base, scene); boxAt(px - 0.36, 2.0, zb - 0.36, px + 0.36, 2.08, zb + 0.36, white, scene); boxAt(px - 0.14, 2.08, zb - 0.14, px + 0.14, 2.36, zb + 0.14, T.emissive(0xffe6b8, 1.5), scene, { cast: false }); }
  for (const [sx, x0] of [[1, -0.5], [-1, -6.8]]) { const g = new THREE.Group(); g.position.set(x0 + sx * 0.3, 0, zb); g.rotation.y = sx * 1.3; scene.add(g); barFence({ x0: sx > 0 ? 0 : -1.75, x1: sx > 0 ? 1.75 : 0, y0: 0.12, y1: 1.8, z: 0, pitch: 0.13, bar: 0.03, mat: steel, parent: g, rails: [0, 0.5, 1] }); }
  // ---------- landscaping: flower beds, saplings, shrubs, tidy hedges
  const bed = T.solid(0x4a3626, { roughness: 1 }); boxAt(-0.6, 0.0, 3.2, 12.5, 0.07, 7.2, bed, scene, { cast: false }); boxAt(-12.2, 0.0, 3.8, -7.2, 0.07, 7.4, bed, scene, { cast: false });
  hedge(-0.4, 7.2, 12.5, 7.2, { h: 0.7, w: 0.45, density: 70, seed: 3, color: 0x4f8a35 }, scene);
  const cols = [0xd9456a, 0xf0b13a, 0xe8e8e4, 0xc2395a, 0xf08a3a];
  for (let i = 0; i < 16; i++) leafy(bush(0.6 + i * 0.72, 0, 4.2 + (i % 3) * 0.8, 0.3 + (i % 2) * 0.08, scene, { seed: i * 3 + 1, color: cols[i % cols.length] }), { emissive: 0x2a2a10, k: 0.2 });
  for (const [x, z, r] of [[5.6, 1.9, 0.5], [7.1, 1.6, 0.4], [-0.3, 1.8, 0.45], [-8.0, 1.8, 0.5], [-10.4, 5.2, 0.5]]) leafy(bush(x, 0, z, r, scene, { seed: x * 5 + 3, color: 0x5f9a3c }));
  for (const [x, z] of [[-8.6, 4.8], [9.6, 5.0]]) { leafy(tree(x, z, { h: 3.6, crown: 1.3, seed: x + 40, color: 0x86b04c, trunkR: 0.07 }, scene)); boxAt(x - 0.5, 0, z - 0.02, x + 0.5, 0.02, z + 0.02, T.solid(0x7a5a38), scene, { cast: false }); for (const sx of [-1, 1]) boxAt(x + sx * 0.4 - 0.02, 0, z - 0.02, x + sx * 0.4 + 0.02, 1.5, z + 0.02, T.solid(0x7a5a38), scene); }
  for (const x of [1.5, 6.2]) { cyl(x, 0.35, 1.5, 0.32, 0.24, 0.7, T.solid(0xb5623a, { roughness: 0.8 }), scene, { seg: 16 }); bush(x, 0.55, 1.5, 0.4, scene, { seed: x + 9, color: 0x4f8a35 }); }
  leafy(tree(-14.6, 2.8, { h: 9, crown: 3.8, seed: 2, color: 0x86b04c }, scene)); leafy(tree(14.8, 2.4, { h: 8.5, crown: 3.5, seed: 6, color: 0x8cb650 }, scene));
  palm(-11.4, 7.0, { h: 8, seed: 3, lean: 0.3 }, scene); palm(12.0, 6.6, { h: 7.5, seed: 8, lean: -0.3 }, scene);
  leafy(tree(-3, -18, { h: 12, crown: 5, seed: 11, color: 0x6e9e42 }, scene)); leafy(tree(7, -19, { h: 11, crown: 4.5, seed: 12, color: 0x76a647 }, scene));
  neighbour({ x0: -36, x1: -12.4, z: -1, depth: 13, floors: 2, mat: T.plaster(0xd6c6a6, { tileM: 3.4, seed: 12 }), trim: T.plaster(0xf0e8d6, { tileM: 3, seed: 15 }), seed: 3, scene });
  neighbour({ x0: 14, x1: 38, z: -1.5, depth: 13, floors: 2, mat: T.plaster(0xcabd9f, { tileM: 3.4, seed: 17 }), trim: T.plaster(0xeee6d2, { tileM: 3, seed: 18 }), seed: 5, scene });
  P.backdrop({ scene, z: -34, seed: 9, palette: [0xd6c6a6, 0xcabd9f, 0xe0d4b8] });

  const camera = archCamera({ pos: [-4.5, 3.6, 19], target: [0.5, 0, 0], focal: 32, shift: 0.02, w, h });
  return { scene, camera, exposure: 0.45, aoRadius: 0.9, aoStrength: 1.0, bloom: true, bloomStrength: 0.12, bloomRadius: 0.9, bloomThreshold: 1.8, grade: { contrast: 1.1, saturation: 1.1, vignette: 0.26, grain: 0.015, warm: 0.03 } };
}
