// Luxury traditional-meets-modern: arches + large glazing + brass accents, white plaster, overcast soft light.
import * as P from '../lib/agent2-parts.mjs';
import { setupSky, archCamera } from '../lib/agent2-env.mjs';
const { THREE, T, boxAt, cyl, ground, glazed, wallPanel, openingPts, ring, tree, palm, bush, hedge, leafy, barFence, streetscape, neighbour, cornice, balustrade, lathe } = P;

export default async function build({ renderer, w, h }) {
  const scene = new THREE.Scene();
  setupSky({ renderer, scene, sunElevation: 55, sunAzimuth: 20, sunIntensity: 3.0, sunColor: 0xf4f2ee, envIntensity: 1.7, shadowExtent: 36, shadowCenter: [0, 0, 2],
    dome: { zenith: [0.78, 0.84, 0.95], mid: [0.9, 0.94, 1.0], horizon: [1.05, 1.05, 1.05], ground: [0.45, 0.43, 0.4], sunCol: [0.3, 0.3, 0.3], glow: 0.3, coverage: 0.12, soft: 0.5, cloudScale: 0.9, cloudLit: [0.98, 1.0, 1.05], cloudShade: [0.68, 0.72, 0.8], cloudOpacity: 0.75, seed: 5.5 },
    fog: { color: [1.0, 1.02, 1.05], density: 0.003 } });

  const white = T.plaster(0xf4f1ea, { tileM: 3.4, seed: 4 }), white2 = T.plaster(0xeeeae1, { tileM: 3.0, seed: 8 }), trim = T.plaster(0xf8f6f0, { tileM: 2.5, seed: 9 });
  const brass = T.metal(0xb8955a, { roughness: 0.3 }), brassD = T.metal(0x9a7a44, { roughness: 0.38 }), charcoal = T.metal(0x2a2c30, { roughness: 0.5 });
  const marble = T.tiles({ color: 0xe6e1d6, grout: 0xb5afa3, tileM: 2.6, n: 3, marble: true, roughness: 0.3, seed: 33 });
  const stone = T.stone({ color: 0xcfc6b4, tileM: 2.4, seed: 14, rows: 26 }), pave = T.paving({ color: 0xd8d2c4, tileM: 2.6, n: 5, seed: 5 }), paveD = T.paving({ color: 0x9c968a, tileM: 2.0, n: 8, seed: 6 });
  const lawn = T.grass({ color: 0x6f9a44, tileM: 5, seed: 61 }), doorW = T.wood({ color: 0x4a2f1e, tileM: 1.2, planks: 4, seed: 9 });
  const warm = (c, i) => T.emissive(c, i);

  ground(-140, -90, 140, 9, 0, T.grass({ color: 0x6b8c45, tileM: 6, seed: 66 }), scene);
  const st = streetscape({ scene, zb: 9.0, foot: 2.6, roadW: 21, paveColor: 0xc8c3b8 }); st.roadMat.color.setRGB(1.9, 1.85, 1.8);
  ground(-12, 0.4, 12, 9.0, 0.004, lawn, scene);
  ground(-3.0, 0.0, 3.0, 9.4, 0.012, pave, scene); for (const x of [-3.0, 0, 3.0]) boxAt(x - 0.03, 0.012, 0.0, x + 0.03, 0.02, 9.4, paveD, scene, { cast: false });
  ground(-10, -6, -3.4, 9.4, 0.012, pave, scene);
  const H = new THREE.Group(); scene.add(H);
  const FH = 3.6, SL = 0.3, UH = 3.4, TOP = FH + SL + UH;

  // ---- LEFT: double-height arched glass volume
  { const xa = -9.2, xb = -2.6, holes = [], ww = 1.5, n = 3, gap = (xb - xa - n * ww) / (n + 1);
    for (let i = 0; i < n; i++) holes.push(openingPts({ kind: 'round', x: xa + gap * (i + 1) + ww * i, y: 0.15, w: ww, h: 6.3, rise: ww / 2 }));
    wallPanel({ x0: xa, x1: xb, y0: 0, y1: TOP, z0: -0.5, t: 0.5, holes, mat: white, parent: H }); boxAt(xa, 0, -12, xb, TOP, -0.5, white, H);
    for (let i = 0; i < n; i++) { const x = xa + gap * (i + 1) + ww * i;
      glazed({ kind: 'round', x, y: 0.15, w: ww, h: 6.3, rise: ww / 2, z: 0, cols: 2, rows: 1, frameMat: brass, frameW: 0.06, reveal: 0.26, depth: 0.1, mode: 'day', seed: 3 + i, transomAt: 3.5, parent: H });
      ring(openingPts({ kind: 'round', x: x - 0.14, y: 0.15, w: ww + 0.28, h: 6.3 + 0.14, rise: ww / 2 + 0.14 }), openingPts({ kind: 'round', x, y: 0.15, w: ww, h: 6.3, rise: ww / 2 }), -0.02, 0.1, trim, H);
      // brass juliet rail at first floor
      boxAt(x + 0.05, FH + SL + 0.2, 0.0, x + ww - 0.05, FH + SL + 0.24, 0.14, brass, H); for (let k = 0; k < 9; k++) boxAt(x + 0.1 + k * (ww - 0.2) / 8 - 0.01, FH + SL - 0.4, 0.1, x + 0.1 + k * (ww - 0.2) / 8 + 0.01, FH + SL + 0.2, 0.12, brass, H, { cast: false });
    }
    boxAt(xa - 0.05, FH + SL - 0.15, 0, xb + 0.05, FH + SL + 0.1, 0.18, trim, H);
    cornice({ x0: xa - 0.05, x1: xb + 0.05, y: TOP, z: 0.0, layers: [[0.15, 0.14], [0.3, 0.12], [0.42, 0.2]], mat: trim, parent: H, zBack: -2 });
    boxAt(xa - 0.05, TOP + 0.46, -12, xb + 0.05, TOP + 0.8, 0.45, trim, H);
    P.weather({ x0: xa, x1: xb, y0: 0, y1: 1.0, z: 0.0, parent: H, alpha: 0.3, seed: 3 });
  }
  // ---- CENTRE: arched portal
  { const xa = -2.6, xb = 2.6, p = openingPts({ kind: 'round', x: -1.3, y: 0.3, w: 2.6, h: 3.7, rise: 1.3 }), uw = openingPts({ kind: 'round', x: -0.8, y: FH + SL + 0.4, w: 1.6, h: 2.5, rise: 0.8 });
    wallPanel({ x0: xa, x1: xb, y0: 0, y1: TOP + 0.9, z0: -0.7, t: 0.7, holes: [p, uw], mat: white2, parent: H }); boxAt(xa, 0, -12, xb, TOP + 0.9, -0.7, white2, H);
    // projecting surround
    ring(openingPts({ kind: 'round', x: -1.65, y: 0.3, w: 3.3, h: 4.35, rise: 1.65 }), p, -0.02, 0.35, trim, H);
    ring(openingPts({ kind: 'round', x: -1.55, y: 0.3, w: 3.1, h: 4.25, rise: 1.55 }), p, 0.3, 0.1, trim, H);
    P.doorLeaf({ kind: 'round', x: -1.3, y: 0.3, w: 2.6, h: 3.7, rise: 1.3, z: -0.1, reveal: 0.25, mat: doorW, frameMat: brass, panels: true, glassArch: true, handleMat: brass, parent: H });
    boxAt(-1.4, 0.0, 0.0, 1.4, 0.3, 1.4, marble, H); boxAt(-1.7, 0.0, 1.4, 1.7, 0.15, 2.2, marble, H); boxAt(-2.0, 0.0, 2.2, 2.0, 0.08, 2.9, marble, H);
    glazed({ kind: 'round', x: -0.8, y: FH + SL + 0.4, w: 1.6, h: 2.5, rise: 0.8, z: 0.0, cols: 2, frameMat: brass, frameW: 0.06, reveal: 0.22, mode: 'day', seed: 21, parent: H });
    ring(openingPts({ kind: 'round', x: -1.0, y: FH + SL + 0.4, w: 2.0, h: 2.7, rise: 1.0 }), uw, -0.02, 0.14, trim, H);
    // brass balcony
    boxAt(-1.3, FH + SL - 0.1, 0.0, 1.3, FH + SL + 0.08, 0.9, trim, H);
    for (let k = 0; k <= 22; k++) boxAt(-1.25 + k * 0.1136 - 0.012, FH + SL + 0.08, 0.84, -1.25 + k * 0.1136 + 0.012, FH + SL + 1.0, 0.86, brass, H, { cast: false });
    boxAt(-1.3, FH + SL + 1.0, 0.0, 1.3, FH + SL + 1.05, 0.9, brass, H); boxAt(-1.3, FH + SL + 0.0, 0.84, 1.3, FH + SL + 0.08, 0.9, brass, H);
    boxAt(-1.3, FH + SL, 0, -1.25, FH + SL + 1.05, 0.9, brass, H); boxAt(1.25, FH + SL, 0, 1.3, FH + SL + 1.05, 0.9, brass, H);
    // brass lanterns
    for (const x of [-1.95, 1.95]) { boxAt(x - 0.1, 2.4, 0.02, x + 0.1, 2.9, 0.2, warm(0xffe0a0, 1.4), H, { cast: false }); boxAt(x - 0.13, 2.9, 0.0, x + 0.13, 2.95, 0.22, brass, H); boxAt(x - 0.13, 2.35, 0.0, x + 0.13, 2.4, 0.22, brass, H); }
    cornice({ x0: xa - 0.1, x1: xb + 0.1, y: TOP + 0.9, z: 0.0, layers: [[0.2, 0.14], [0.35, 0.12], [0.5, 0.2]], mat: trim, parent: H, zBack: -2 });
    // finials
    for (const x of [-2.4, 2.4]) { lathe([[0.0, 0], [0.18, 0], [0.18, 0.1], [0.1, 0.25], [0.2, 0.5], [0.0, 0.7]], x, TOP + 1.3, 0.1, brassD, H); }
  }
  // ---- RIGHT: arched windows + brass framed bay
  { const xa = 2.6, xb = 9.2, n = 2, ww = 1.5, gap = (xb - xa - n * ww) / (n + 1), holes = [];
    for (let i = 0; i < n; i++) holes.push(openingPts({ kind: 'round', x: xa + gap * (i + 1) + ww * i, y: 0.7, w: ww, h: 2.6, rise: ww / 2 }));
    wallPanel({ x0: xa, x1: xb, y0: 0, y1: FH + SL, z0: -0.5, t: 0.5, holes, mat: white, parent: H });
    const h2 = []; for (let i = 0; i < n; i++) h2.push(openingPts({ kind: 'round', x: xa + gap * (i + 1) + ww * i, y: FH + SL + 0.5, w: ww, h: 2.5, rise: ww / 2 }));
    wallPanel({ x0: xa, x1: xb, y0: FH + SL, y1: TOP, z0: -0.5, t: 0.5, holes: h2, mat: white, parent: H }); boxAt(xa, 0, -12, xb, TOP, -0.5, white, H);
    for (let i = 0; i < n; i++) { const x = xa + gap * (i + 1) + ww * i;
      glazed({ kind: 'round', x, y: 0.7, w: ww, h: 2.6, rise: ww / 2, z: 0, cols: 2, rows: 2, frameMat: brass, frameW: 0.06, reveal: 0.24, mode: 'day', seed: 31 + i, parent: H });
      ring(openingPts({ kind: 'round', x: x - 0.16, y: 0.7, w: ww + 0.32, h: 2.6 + 0.16, rise: ww / 2 + 0.16 }), openingPts({ kind: 'round', x, y: 0.7, w: ww, h: 2.6, rise: ww / 2 }), -0.02, 0.1, trim, H);
      boxAt(x - 0.2, 0.62, 0.0, x + ww + 0.2, 0.7, 0.2, trim, H);
      glazed({ kind: 'round', x, y: FH + SL + 0.5, w: ww, h: 2.5, rise: ww / 2, z: 0, cols: 2, rows: 1, frameMat: brass, frameW: 0.06, reveal: 0.24, mode: 'day', seed: 41 + i, parent: H });
      ring(openingPts({ kind: 'round', x: x - 0.16, y: FH + SL + 0.5, w: ww + 0.32, h: 2.5 + 0.16, rise: ww / 2 + 0.16 }), openingPts({ kind: 'round', x, y: FH + SL + 0.5, w: ww, h: 2.5, rise: ww / 2 }), -0.02, 0.1, trim, H);
      boxAt(x - 0.2, FH + SL + 0.42, 0.0, x + ww + 0.2, FH + SL + 0.5, 0.2, trim, H);
    }
    boxAt(xa - 0.05, FH + SL - 0.15, 0, xb + 0.05, FH + SL + 0.1, 0.18, trim, H);
    cornice({ x0: xa - 0.05, x1: xb + 0.05, y: TOP, z: 0.0, layers: [[0.15, 0.14], [0.3, 0.12], [0.42, 0.2]], mat: trim, parent: H, zBack: -2 });
    boxAt(xa - 0.05, TOP + 0.46, -12, xb + 0.05, TOP + 0.8, 0.45, trim, H);
    // slim brass-capped pilasters at the far corner
    boxAt(xb - 0.35, 0, 0.0, xb + 0.0, TOP, 0.14, trim, H);
    P.weather({ x0: xa, x1: xb, y0: 0, y1: 1.0, z: 0.0, parent: H, alpha: 0.3, seed: 6 });
    P.ac(7.2, TOP + 0.9, -9, H);
  }
  // central pilasters between volumes
  for (const x of [-2.75, 2.45]) boxAt(x, 0, 0.0, x + 0.3, TOP + 0.5, 0.12, trim, H);

  // ---- boundary: low white wall with brass-topped piers and vertical brass slat gate
  const zb = 9.0;
  for (const [xa, xb] of [[-30, -3.4], [3.4, 30]]) { boxAt(xa, 0, zb - 0.18, xb, 0.9, zb + 0.18, white, scene); boxAt(xa, 0.9, zb - 0.24, xb, 0.98, zb + 0.24, trim, scene); barFence({ x0: xa, x1: xb, y0: 0.98, y1: 1.6, z: zb, pitch: 0.16, bar: 0.03, mat: brass, parent: scene, rails: [0, 1] });
    for (let x = Math.ceil(xa / 5) * 5; x <= xb; x += 5) { boxAt(x - 0.25, 0, zb - 0.25, x + 0.25, 1.7, zb + 0.25, white, scene); boxAt(x - 0.3, 1.7, zb - 0.3, x + 0.3, 1.78, zb + 0.3, trim, scene); boxAt(x - 0.12, 1.78, zb - 0.12, x + 0.12, 1.84, zb + 0.12, brass, scene); } }
  for (const px of [-3.4, 3.4]) { boxAt(px - 0.35, 0, zb - 0.35, px + 0.35, 2.2, zb + 0.35, white, scene); boxAt(px - 0.42, 2.2, zb - 0.42, px + 0.42, 2.3, zb + 0.42, trim, scene); boxAt(px - 0.2, 2.3, zb - 0.2, px + 0.2, 2.6, zb + 0.2, warm(0xffe0a8, 1.4), scene, { cast: false }); boxAt(px - 0.24, 2.6, zb - 0.24, px + 0.24, 2.68, zb + 0.24, brass, scene); }
  boxAt(-3.0, 0.0, zb - 0.04, 3.0, 0.02, zb + 0.04, T.metal(0x55585c), scene, { cast: false });
  // ---- planting: olive trees, topiary, pebble beds, planter boxes
  const pebble = T.concrete(0xe4ded0, { tileM: 0.8, seed: 44 });
  for (const sx of [-1, 1]) {
    ground(sx * 3.4, 0.4, sx * 4.6, 7.6, 0.014, pebble, scene);
    for (const [x, z] of [[4.4, 2.2], [4.4, 6.2]]) { const b = new THREE.Mesh(new THREE.SphereGeometry(0.62, 24, 18), T.foliage({ color: 0x4d8a34 })); b.position.set(sx * x, 0.7, z); b.castShadow = true; scene.add(b); cyl(sx * x, 0.18, z, 0.35, 0.28, 0.36, T.solid(0x2e3034, { roughness: 0.6 }), scene); }
    hedge(sx * 5.4, 1.0, sx * 10.5, 1.0, { h: 0.7, w: 0.45, density: 70, seed: 9 + sx, color: 0x4f8a35 }, scene); hedge(sx * 5.4, 7.6, sx * 11, 7.6, { h: 0.5, w: 0.4, density: 70, seed: 19 + sx, color: 0x4f8a35 }, scene);
    for (let i = 0; i < 5; i++) bush(sx * (6.3 + i * 0.9), 0, 3.0 + (i % 2) * 1.6, 0.42, scene, { seed: 40 + i + sx, color: i % 2 ? 0x6d9a48 : 0x8fb06a });
    leafy(tree(sx * 6.4, 4.6, { h: 3.4, crown: 1.3, seed: 72 + sx, color: 0x8da56a, trunkR: 0.1 }, scene));
  }
  leafy(tree(-14.5, 3, { h: 9, crown: 3.8, seed: 2, color: 0x86b04c }, scene)); leafy(tree(14.6, 2.6, { h: 8.5, crown: 3.6, seed: 6, color: 0x8cb650 }, scene));
  palm(-11.6, 6.8, { h: 8.5, seed: 3, lean: 0.3 }, scene); palm(11.8, 6.6, { h: 8, seed: 8, lean: -0.3 }, scene);
  leafy(tree(-3, -18, { h: 12, crown: 5, seed: 11, color: 0x6e9e42 }, scene)); leafy(tree(8, -18, { h: 11, crown: 4.5, seed: 12, color: 0x76a647 }, scene));
  neighbour({ x0: -36, x1: -12.8, z: -1, depth: 14, floors: 2, mat: T.plaster(0xe0dccf, { tileM: 3.4, seed: 12 }), trim: T.plaster(0xf6f2e8, { tileM: 3, seed: 15 }), seed: 3, scene });
  neighbour({ x0: 12.8, x1: 36, z: -1, depth: 14, floors: 3, mat: T.plaster(0xd2cdc0, { tileM: 3.4, seed: 17 }), trim: T.plaster(0xf4eee2, { tileM: 3, seed: 18 }), seed: 5, scene });
  P.backdrop({ scene, z: -34, seed: 8, palette: [0xe0dccf, 0xd2cdc0, 0xe8e2d4] });

  const camera = archCamera({ pos: [-5.5, 3.1, 25], target: [0, 0, 0], focal: 33, shift: 0.07, w, h });
  return { scene, camera, exposure: 0.46, aoRadius: 0.9, aoStrength: 1.2, bloom: true, bloomStrength: 0.1, bloomRadius: 0.8, bloomThreshold: 1.6, grade: { contrast: 1.15, saturation: 1.06, vignette: 0.24, grain: 0.014, warm: 0.0 } };
}
