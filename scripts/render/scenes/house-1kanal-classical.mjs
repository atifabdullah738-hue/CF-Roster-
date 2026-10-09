// 1-Kanal neo-classical villa: columns, pediment, balustrades, arched windows, fountain; cream limestone, bright afternoon.
import * as P from '../lib/agent2-parts.mjs';
import { setupSky, archCamera } from '../lib/agent2-env.mjs';
const { THREE, T, boxAt, cyl, ground, glazed, wallPanel, openingPts, ring, tree, palm, bush, hedge, leafy, barFence, streetscape, neighbour, column, balustrade, pediment, cornice, quoins, lathe } = P;

export default async function build({ renderer, w, h }) {
  const scene = new THREE.Scene();
  setupSky({ renderer, scene, sunElevation: 46, sunAzimuth: 28, sunIntensity: 6.6, sunColor: 0xfff0d8, envIntensity: 0.85, shadowExtent: 40, shadowCenter: [0, 0, 2],
    dome: { zenith: [0.14, 0.4, 1.3], mid: [0.4, 0.7, 1.35], horizon: [1.3, 1.25, 1.2], sunCol: [3, 2.4, 1.6], coverage: 0.5, soft: 0.2, cloudScale: 1.3, seed: 8.4, cloudLit: [2.4, 2.35, 2.3], cloudShade: [0.9, 0.95, 1.1] },
    fog: { color: [1.0, 1.05, 1.1], density: 0.0025 } });

  const cream = T.stone({ color: 0xf2e6c8, tileM: 2.4, seed: 15, rows: 24 }), creamS = T.stone({ color: 0xe6d8b4, tileM: 2.4, seed: 19, rows: 26 });
  const plast = T.plaster(0xeee2c4, { tileM: 3.2, seed: 5 }), trim = T.plaster(0xf4ecd8, { tileM: 2.5, seed: 9 }), trimStone = T.stone({ color: 0xf0e6cc, tileM: 2.4, seed: 21, rows: 30 });
  const roofT = T.solid(0x8a5a40, { roughness: 0.85 }), gold = T.metal(0xc59a42, { roughness: 0.28 }), iron = T.metal(0x1d1f22, { roughness: 0.45 });
  const stepS = T.stone({ color: 0xe0d4b8, tileM: 2, seed: 25, rows: 40 }), lawn = T.grass({ color: 0x6f9a40, tileM: 5, seed: 61 }), lawn2 = T.grass({ color: 0x64913a, tileM: 4, seed: 64 });
  const pave = T.paving({ color: 0xd2c6ad, tileM: 2.6, n: 6, seed: 7 }), door = T.wood({ color: 0x5b3a26, tileM: 1.2, planks: 2, seed: 9 });

  ground(-140, -90, 140, 9, 0, T.grass({ color: 0x6b8c45, tileM: 6, seed: 66 }), scene);
  const st = streetscape({ scene, zb: 9.2, foot: 2.6, roadW: 21, paveColor: 0xc4bba8 }); st.roadMat.color.setRGB(1.85, 1.75, 1.6);
  ground(-12, 0.5, 12, 9, 0.004, lawn, scene);
  for (let i = 0; i < 8; i++) ground(-12 + i * 3, 0.5, -12 + (i + 1) * 3, 9, 0.006, i % 2 ? lawn2 : lawn, scene);
  // central drive + fountain court
  ground(-2.2, 3.5, 2.2, 9.5, 0.012, pave, scene);
  { const g = new THREE.Group(); scene.add(g);
    const FH = 3.7, SL = 0.0, UH = 3.5, TOP = FH + UH, ZP = 3.4;
    // ---------------- main body
    const wings = [[-10, -3.9], [3.9, 10]];
    for (const [xa, xb] of wings) {
      // ground floor (rusticated limestone) with arched windows
      const holes = []; const n = 2, ww = 1.5, gap = (xb - xa - n * ww) / (n + 1);
      for (let i = 0; i < n; i++) holes.push(openingPts({ kind: 'round', x: xa + gap * (i + 1) + ww * i, y: 0.7, w: ww, h: 2.7, rise: ww / 2 }));
      wallPanel({ x0: xa, x1: xb, y0: 0, y1: FH, z0: -0.45, t: 0.45, holes, mat: cream, parent: g });
      boxAt(xa, 0, -14, xb, FH, -0.45, cream, g);
      for (let i = 0; i < n; i++) { const x = xa + gap * (i + 1) + ww * i;
        glazed({ kind: 'round', x, y: 0.7, w: ww, h: 2.7, rise: ww / 2, z: 0, cols: 2, rows: 2, bars: 2, barW: 0.025, frame: 0xf2eee4, frameW: 0.07, reveal: 0.2, mode: 'day', seed: 3 + i, parent: g });
        ring(openingPts({ kind: 'round', x: x - 0.22, y: 0.7, w: ww + 0.44, h: 2.7 + 0.22, rise: ww / 2 + 0.22 }), openingPts({ kind: 'round', x, y: 0.7, w: ww, h: 2.7, rise: ww / 2 }), -0.02, 0.12, trimStone, g);
        boxAt(x + ww / 2 - 0.16, 3.46, 0.08, x + ww / 2 + 0.16, 3.75, 0.2, trimStone, g);                 // keystone
        boxAt(x - 0.3, 0.64, 0.02, x + ww + 0.3, 0.7, 0.2, trimStone, g);                                   // sill
      }
      // upper floor: segmental-pedimented rectangular windows with balconettes
      const holes2 = [];
      for (let i = 0; i < n; i++) holes2.push(openingPts({ x: xa + gap * (i + 1) + ww * i, y: FH + 0.55, w: ww, h: 2.3 }));
      wallPanel({ x0: xa, x1: xb, y0: FH, y1: TOP, z0: -0.4, t: 0.4, holes: holes2, mat: plast, parent: g });
      boxAt(xa, FH, -14, xb, TOP, -0.4, plast, g);
      for (let i = 0; i < n; i++) { const x = xa + gap * (i + 1) + ww * i, y = FH + 0.55;
        glazed({ x, y, w: ww, h: 2.3, z: 0, cols: 2, rows: 2, bars: 3, barW: 0.022, frame: 0xf2eee4, frameW: 0.07, reveal: 0.18, mode: 'day', seed: 11 + i, parent: g });
        boxAt(x - 0.18, y - 0.08, 0.0, x + ww + 0.18, y, 0.3, trimStone, g);
        boxAt(x - 0.2, y + 2.3, 0.0, x + ww + 0.2, y + 2.3 + 0.2, 0.18, trimStone, g);
        const tri = new THREE.Shape([new THREE.Vector2(x - 0.3, y + 2.5), new THREE.Vector2(x + ww + 0.3, y + 2.5), new THREE.Vector2(x + ww / 2, y + 2.95)]); const tg = new THREE.ExtrudeGeometry(tri, { depth: 0.16, bevelEnabled: false }); P.add(tg, trimStone, g);
        for (const sx of [-1, 1]) boxAt(sx > 0 ? x + ww : x - 0.2, y, 0.0, sx > 0 ? x + ww + 0.2 : x, y + 2.3, 0.14, trimStone, g);
        balustrade({ a: x - 0.1, b: x + ww + 0.1, fixed: 0.28, y: y - 0.05, h: 0.62, pitch: 0.16, mat: trimStone, parent: g, pierEvery: 99, rail: 0.09 });
      }
      // end quoins
      quoins({ x: xa, y0: 0, y1: TOP, z: 0, mat: trimStone, parent: g, side: 1, w: 0.45, h: 0.5 }); quoins({ x: xb, y0: 0, y1: TOP, z: 0, mat: trimStone, parent: g, side: -1, w: 0.45, h: 0.5 });
      // roof balustrade + cornice
      cornice({ x0: xa - 0.05, x1: xb + 0.05, y: TOP, z: 0.0, layers: [[0.18, 0.16], [0.34, 0.12], [0.46, 0.22]], mat: trim, parent: g, dentils: true, zBack: -3 });
      balustrade({ a: xa + 0.3, b: xb - 0.3, fixed: 0.25, y: TOP + 0.5, h: 0.95, pitch: 0.2, mat: trimStone, parent: g, pierEvery: 8 });
      // hip roof behind (terracotta) so the roofline reads
      const roof = new THREE.Shape([new THREE.Vector2(xa + 0.4, TOP + 0.5), new THREE.Vector2(xb - 0.4, TOP + 0.5), new THREE.Vector2(xb - 2.0, TOP + 2.0), new THREE.Vector2(xa + 2.0, TOP + 2.0)]); const rg = new THREE.ExtrudeGeometry(roof, { depth: 8, bevelEnabled: false }); rg.translate(0, 0, -8.5); P.add(rg, roofT, g);
    }
    // band course
    boxAt(-10.2, FH - 0.12, -0.0, 10.2, FH + 0.18, 0.14, trimStone, g);
    // ---------------- central portico block
    const hx = 3.9;
    { const hd = [openingPts({ kind: 'round', x: -1.0, y: 0.55, w: 2.0, h: 3.0, rise: 1.0 }), openingPts({ kind: 'round', x: -0.9, y: FH + 0.5, w: 1.8, h: 2.7, rise: 0.9 }), openingPts({ x: -3.1, y: 0.8, w: 1.2, h: 2.4 }), openingPts({ x: 1.9, y: 0.8, w: 1.2, h: 2.4 }), openingPts({ x: -3.1, y: FH + 0.55, w: 1.2, h: 2.3 }), openingPts({ x: 1.9, y: FH + 0.55, w: 1.2, h: 2.3 })];
      wallPanel({ x0: -hx, x1: hx, y0: 0, y1: TOP + 0.2, z0: -0.45, t: 0.45, holes: hd, mat: cream, parent: g }); boxAt(-hx, 0, -14, hx, TOP + 0.2, -0.45, cream, g);
      P.doorLeaf({ kind: 'round', x: -1.0, y: 0.55, w: 2.0, h: 3.0, rise: 1.0, z: 0, reveal: 0.25, mat: door, frameMat: T.solid(0xf1ead8, { roughness: 0.6 }), glassArch: true, parent: g });
      glazed({ kind: 'round', x: -0.9, y: FH + 0.5, w: 1.8, h: 2.7, rise: 0.9, z: 0, cols: 2, rows: 2, bars: 2, frame: 0xf2eee4, frameW: 0.07, reveal: 0.2, mode: 'day', seed: 31, parent: g });
      for (const x of [-3.1, 1.9]) { glazed({ x, y: 0.8, w: 1.2, h: 2.4, z: 0, cols: 2, bars: 3, frame: 0xf2eee4, reveal: 0.2, mode: 'day', seed: 41, parent: g }); glazed({ x, y: FH + 0.55, w: 1.2, h: 2.3, z: 0, cols: 2, bars: 3, frame: 0xf2eee4, reveal: 0.2, mode: 'day', seed: 42, parent: g }); }
    }
    // portico slab, columns, entablature, pediment
    boxAt(-hx - 0.3, 0, 0, hx + 0.3, 0.55, ZP + 0.2, stepS, g);
    for (const cx of [-3.2, -1.07, 1.07, 3.2]) column({ x: cx, z: ZP - 0.5, y0: 0.55, h: 6.2, r: 0.3, mat: trimStone, parent: g, order: 'ionic' });
    boxAt(-hx - 0.1, 6.75, -0.2, hx + 0.1, 7.2, ZP + 0.1, trim, g);
    boxAt(-hx - 0.1, 7.2 - 0.02, ZP - 0.1, hx + 0.1, 7.34, ZP + 0.2, trimStone, g);
    pediment({ x0: -hx - 0.3, x1: hx + 0.3, y: 7.34, z: ZP + 0.1, depth: 0.7, rise: 1.7, mat: trimStone, tymp: cream, parent: g });
    balustrade({ a: -hx + 0.3, b: hx - 0.3, fixed: ZP - 0.5, y: FH + 0.55, h: 1.0, pitch: 0.17, mat: trimStone, parent: g, pierEvery: 99 });
    // steps with cheek balustrades
    for (let i = 0; i < 5; i++) boxAt(-2.6 - i * 0.0, i * 0.11, ZP + 0.2 + (4 - i) * 0.36 - 0.0, 2.6, i * 0.11 + 0.11, ZP + 0.2 + (5 - i) * 0.36, stepS, g);
    // lanterns
    for (const x of [-1.5, 1.5]) { boxAt(x - 0.1, 3.0, 0.02, x + 0.1, 3.5, 0.2, T.emissive(0xffe2a8, 1.6), g, { cast: false }); boxAt(x - 0.13, 3.5, 0.0, x + 0.13, 3.55, 0.23, iron, g); }
    // chimneys
    for (const x of [-7, 7]) { boxAt(x - 0.5, TOP + 1.0, -6.5, x + 0.5, TOP + 3.0, -5.5, cream, g); boxAt(x - 0.6, TOP + 3.0, -6.6, x + 0.6, TOP + 3.12, -5.4, trimStone, g); }
    // roof tank hidden behind balustrade; AC on side
    P.ac(8.4, TOP + 0.5, -9, g);
    // ground-floor weathering + plinth
    boxAt(-10.1, 0, 0.0, 10.1, 0.0, 0.0, cream, g, { cast: false });
    P.weather({ x0: -10, x1: -4, y0: 0, y1: 0.9, z: 0.0, parent: g, alpha: 0.28, seed: 2 }); P.weather({ x0: 4, x1: 10, y0: 0, y1: 0.9, z: 0.0, parent: g, alpha: 0.28, seed: 5 });
    boxAt(-10.12, 0, -0.0, -10.0, 0.5, 0.15, trimStone, g); // plinth lip
  }
  // ---------------- fountain
  { const fz = 5.8, g = new THREE.Group(); scene.add(g);
    cyl(0, 0.3, fz, 2.0, 2.1, 0.6, T.stone({ color: 0xe8dcc0, tileM: 1.5, seed: 33, rows: 16 }), g, { seg: 48 });
    const wm = new THREE.MeshPhysicalMaterial({ color: 0x2c8590, roughness: 0.03, clearcoat: 1, envMapIntensity: 2.2 }); wm.userData.tileM = 1; cyl(0, 0.52, fz, 1.82, 1.82, 0.04, wm, g, { seg: 48 });
    const sm = T.stone({ color: 0xece0c6, tileM: 1.5, seed: 36, rows: 20 });
    lathe([[0.0, 0], [0.34, 0], [0.34, 0.5], [0.22, 0.7], [0.2, 1.1], [0.46, 1.25], [0.9, 1.35], [0.9, 1.42], [0.0, 1.46]], 0, 0.5, fz, sm, g);
    lathe([[0.0, 0], [0.12, 0.02], [0.14, 0.25], [0.3, 0.45], [0.52, 0.5], [0.5, 0.56], [0.0, 0.6]], 0, 1.95, fz, sm, g);
    const jet = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.05, 1.0, 10), T.solid(0xeaf6fa, { roughness: 0.1, transparent: true, opacity: 0.6 })); jet.position.set(0, 2.9, fz); g.add(jet);
    for (let i = 0; i < 12; i++) { const a = (i / 12) * 6.283; const d = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.015, 0.9, 6), T.solid(0xeaf6fa, { roughness: 0.1, transparent: true, opacity: 0.45 })); d.position.set(Math.cos(a) * 0.9, 0.95, fz + Math.sin(a) * 0.9); d.rotation.set(Math.sin(a) * 0.5, 0, -Math.cos(a) * 0.5); g.add(d); }
    ground(-3.3, fz - 3.3, 3.3, fz + 3.3, 0.014, pave, g);
    // fountain court drive loop
  }
  // ---------------- parterre hedges & topiary
  const hg = { h: 0.55, w: 0.4, density: 70, color: 0x4f8636 };
  for (const sx of [-1, 1]) {
    for (const [x0, z0, x1, z1] of [[3.5, 1.2, 9.5, 1.2], [3.5, 1.2, 3.5, 8.0], [9.5, 1.2, 9.5, 8.0], [3.5, 8.0, 9.5, 8.0], [3.5, 4.6, 9.5, 4.6], [6.5, 1.2, 6.5, 8.0]])
      hedge(sx * x0, z0, sx * x1, z1, { ...hg, seed: Math.floor(x0 * 7 + z0 * 3 + (sx + 2)) }, scene);
    ground(sx * 3.5, 1.2, sx * 6.5, 4.6, 0.006, T.solid(0xd8c8a8, { roughness: 1 }), scene);
    for (const [x, z] of [[4.8, 2.9], [8.0, 2.9], [4.8, 6.3], [8.0, 6.3]]) { for (let k = 0; k < 2; k++) { bush(sx * x + (k ? 0.25 : -0.25), 0, z, 0.35, scene, { seed: 3 + k + x, color: k ? 0xd98a9a : 0xe9b0a0 }); } }
    // topiary cones/balls flanking the porch
    const cm = T.foliage({ color: 0x4d8a34 });
    for (const [x, z] of [[4.5, 0.9], [9.5, 0.9]]) { const c = new THREE.Mesh(new THREE.ConeGeometry(0.7, 2.2, 24), cm); c.position.set(sx * x, 1.5, z); c.castShadow = true; scene.add(c); const base = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.3, 0.5, 16), T.stone({ color: 0xd9ccb0, tileM: 1, seed: 8 })); base.position.set(sx * x, 0.25, z); scene.add(base); }
    const b = new THREE.Mesh(new THREE.SphereGeometry(0.75, 24, 18), cm); b.position.set(sx * 2.2, 1.35, 1.0); b.castShadow = true; scene.add(b);
  }
  // ---------------- boundary wall with balusters, gate
  const zb = 9.2;
  for (const [xa, xb] of [[-30, -2.6], [2.6, 30]]) { boxAt(xa, 0, zb - 0.2, xb, 0.75, zb + 0.2, creamS, scene); boxAt(xa, 0.75, zb - 0.25, xb, 0.85, zb + 0.25, trimStone, scene); barFence({ x0: xa, x1: xb, y0: 0.85, y1: 1.85, z: zb, pitch: 0.16, bar: 0.03, mat: iron, parent: scene, rails: [0, 0.97] });
    for (let x = Math.ceil(xa / 4.5) * 4.5; x < xb; x += 4.5) { boxAt(x - 0.28, 0, zb - 0.28, x + 0.28, 2.05, zb + 0.28, creamS, scene); boxAt(x - 0.34, 2.05, zb - 0.34, x + 0.34, 2.15, zb + 0.34, trimStone, scene); const sp = new THREE.Mesh(new THREE.SphereGeometry(0.2, 16, 12), trimStone); sp.position.set(x, 2.35, zb); sp.castShadow = true; scene.add(sp); } }
  for (const px of [-2.6, 2.6]) { boxAt(px - 0.4, 0, zb - 0.4, px + 0.4, 2.7, zb + 0.4, creamS, scene); boxAt(px - 0.5, 2.7, zb - 0.5, px + 0.5, 2.85, zb + 0.5, trimStone, scene); const sp = new THREE.Mesh(new THREE.SphereGeometry(0.3, 20, 14), trimStone); sp.position.set(px, 3.15, zb); scene.add(sp); sp.castShadow = true; boxAt(px - 0.12, 1.6, zb + 0.4, px + 0.12, 2.0, zb + 0.44, T.emissive(0xffe6b8, 1.5), scene, { cast: false }); }
  barFence({ x0: -2.2, x1: -0.03, y0: 0.15, y1: 2.0, z: zb, pitch: 0.14, bar: 0.03, mat: iron, parent: scene, rails: [0, 0.5, 0.97] }); barFence({ x0: 0.03, x1: 2.2, y0: 0.15, y1: 2.0, z: zb, pitch: 0.14, bar: 0.03, mat: iron, parent: scene, rails: [0, 0.5, 0.97] });
  for (const x of [-1.1, 1.1]) { const r = new THREE.Mesh(new THREE.TorusGeometry(0.45, 0.025, 8, 28), gold); r.position.set(x, 1.2, zb + 0.02); scene.add(r); }
  // ---------------- trees, neighbours
  leafy(tree(-14.5, 2.5, { h: 9, crown: 3.8, seed: 2, color: 0x86b04c }, scene)); leafy(tree(15, 2.0, { h: 9, crown: 3.6, seed: 6, color: 0x8cb650 }, scene));
  palm(-12.2, 5.2, { h: 8.5, seed: 3, lean: 0.2 }, scene); palm(12.0, 5.6, { h: 8, seed: 8, lean: -0.3 }, scene); palm(-12.9, 1.0, { h: 7.5, seed: 5, lean: 0.2 }, scene); palm(12.9, 0.8, { h: 7, seed: 9, lean: -0.2 }, scene);
  leafy(tree(-5, -20, { h: 12, crown: 5, seed: 11, color: 0x6e9e42 }, scene)); leafy(tree(6, -21, { h: 11, crown: 4.5, seed: 12, color: 0x76a647 }, scene));
  neighbour({ x0: -38, x1: -14.5, z: -1, depth: 14, floors: 2, mat: T.plaster(0xe0d3bd, { tileM: 3.4, seed: 12 }), trim: T.plaster(0xf6f1e6, { tileM: 3, seed: 15 }), seed: 3, scene });
  neighbour({ x0: 14.5, x1: 38, z: -2.5, depth: 14, floors: 2, mat: T.plaster(0xd6cbb9, { tileM: 3.4, seed: 17 }), trim: T.plaster(0xf4eee2, { tileM: 3, seed: 18 }), seed: 5, scene });
  P.backdrop({ scene, z: -34, seed: 4 });

  const camera = archCamera({ pos: [-6, 3.2, 26], target: [0, 0, 0], focal: 34, shift: 0.07, w, h });
  return { scene, camera, exposure: 0.42, aoRadius: 0.9, aoStrength: 1.0, bloom: true, bloomStrength: 0.12, bloomRadius: 0.9, bloomThreshold: 1.8, grade: { contrast: 1.08, saturation: 1.06, vignette: 0.26, grain: 0.015, warm: 0.02 } };
}
