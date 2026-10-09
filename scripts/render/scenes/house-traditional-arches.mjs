// Traditional Mughal-inspired Pakistani house: cusped arches, jharoka, jali, red brick + sandstone, chhatri, courtyard glimpse. Late afternoon.
import * as P from '../lib/agent2-parts.mjs';
import { setupSky, archCamera } from '../lib/agent2-env.mjs';
const { THREE, T, boxAt, cyl, ground, glazed, wallPanel, openingPts, ring, extrudePoly, tree, palm, bush, hedge, leafy, barFence, streetscape, neighbour, corbel, jali, chhatri, dome, lathe, balustrade } = P;

export default async function build({ renderer, w, h }) {
  const scene = new THREE.Scene();
  setupSky({ renderer, scene, sunElevation: 17, sunAzimuth: 52, sunIntensity: 7.2, sunColor: 0xffbf80, envIntensity: 0.7, shadowExtent: 38, shadowCenter: [0, 0, 0],
    dome: { zenith: [0.22, 0.42, 1.05], mid: [0.5, 0.7, 1.15], horizon: [2.0, 1.35, 0.8], sunCol: [3.8, 2.0, 0.9], coverage: 0.52, soft: 0.2, cloudScale: 1.4, seed: 2.6, cloudLit: [2.4, 1.9, 1.4], cloudShade: [0.95, 0.85, 0.9] },
    fog: { color: [1.7, 1.25, 0.85], density: 0.0042 } });

  const brick = T.brick({ color: 0x95472f, mortar: 0xc2b8a4, tileM: 1.2, rows: 16, cols: 6, seed: 7 }), brick2 = T.brick({ color: 0x9a4430, mortar: 0xbdb09a, tileM: 1.2, rows: 16, cols: 6, seed: 12, variation: 0.3 });
  const sand = T.stone({ color: 0xe4b88a, tileM: 2.4, seed: 22, rows: 28 }), sand2 = T.stone({ color: 0xd9a574, tileM: 2.4, seed: 27, rows: 18 }), white = T.plaster(0xf2eadc, { tileM: 2, seed: 6 });
  const wood = T.wood({ color: 0x5e3a22, tileM: 1.2, planks: 4, seed: 9 }), brass = T.metal(0xc89a40, { roughness: 0.3 }), iron = T.metal(0x23201d, { roughness: 0.5 });
  const pave = T.paving({ color: 0xc4a888, tileM: 2.2, n: 6, seed: 5 }), paveB = T.brick({ color: 0xa3503a, mortar: 0x9a8f80, tileM: 1.0, rows: 12, cols: 6, seed: 14 });
  const warm = (c, i) => T.emissive(c, i);

  ground(-140, -90, 140, 10, 0, T.grass({ color: 0x768a45, tileM: 6, seed: 66 }), scene);
  const st = streetscape({ scene, zb: 9.6, foot: 2.6, roadW: 21, paveColor: 0xb8a58c }); st.roadMat.color.setRGB(1.9, 1.7, 1.5);
  ground(-12, 0.3, 12, 9.6, 0.004, pave, scene);
  for (let x = -12; x < 12; x += 1.5) boxAt(x, 0.004, 0.3, x + 0.03, 0.01, 9.6, T.solid(0x8d7660), scene, { cast: false });
  ground(-3.2, -8, 3.2, 0.3, 0.012, paveB, scene);   // courtyard floor / threshold
  const H = new THREE.Group(); scene.add(H);
  const FH = 3.9, SL = 0.3, UH = 3.5, TOP = FH + SL + UH;

  // ------------------------------------------------ wings
  const wing = (xa, xb, sgn) => {
    // ground floor: brick with 2 pointed windows
    const holes = [], ww = 1.3, n = 2, gap = (xb - xa - n * ww) / (n + 1);
    for (let i = 0; i < n; i++) holes.push(openingPts({ kind: 'pointed', x: xa + gap * (i + 1) + ww * i, y: 0.9, w: ww, h: 2.5, rise: ww * 0.85 }));
    wallPanel({ x0: xa, x1: xb, y0: 0.55, y1: FH, z0: -0.5, t: 0.5, holes, mat: brick, parent: H }); boxAt(xa, 0.55, -9, xb, FH, -0.5, brick, H);
    boxAt(xa - 0.05, 0, -9, xb + 0.05, 0.55, 0.08, sand2, H);   // plinth
    for (let i = 0; i < n; i++) { const x = xa + gap * (i + 1) + ww * i;
      glazed({ kind: 'pointed', x, y: 0.9, w: ww, h: 2.5, rise: ww * 0.85, z: 0, cols: 2, frame: 0x3a2a1c, frameW: 0.06, reveal: 0.22, mode: 'day', seed: 3 + i, parent: H });
      ring(openingPts({ kind: 'pointed', x: x - 0.2, y: 0.9, w: ww + 0.4, h: 2.5 + 0.25, rise: ww * 0.85 + 0.25 }), openingPts({ kind: 'pointed', x, y: 0.9, w: ww, h: 2.5, rise: ww * 0.85 }), -0.02, 0.1, sand, H);
      boxAt(x - 0.25, 0.82, 0.0, x + ww + 0.25, 0.9, 0.2, sand, H);
      jali({ x: x + 0.06, y: 0.98, w: ww - 0.12, h: 0.7, z: -0.02, cell: 0.1, mat: sand, back: warm(0x6a3a18, 0.35), t: 0.04, parent: H, border: 0.05 });  // low jali panel
    }
    // string course
    boxAt(xa - 0.05, FH - 0.08, -0.0, xb + 0.05, FH + 0.12, 0.16, sand, H);
    // slab
    boxAt(xa, FH, -9, xb, FH + SL, 0.0, brick2, H);
    // upper floor: windows with chajja + corbels (right) or jali screens (left)
    const holes2 = [], w2 = 1.4, y2 = FH + SL + 0.6, h2 = 2.4;
    for (let i = 0; i < n; i++) holes2.push(openingPts({ kind: 'foil', x: xa + gap * (i + 1) + ww * i - 0.05, y: y2, w: w2, h: h2, rise: w2 * 0.85, foils: 7 }));
    wallPanel({ x0: xa, x1: xb, y0: FH + SL, y1: TOP, z0: -0.5, t: 0.5, holes: holes2, mat: brick, parent: H }); boxAt(xa, FH + SL, -9, xb, TOP, -0.5, brick, H);
    for (let i = 0; i < n; i++) { const x = xa + gap * (i + 1) + ww * i - 0.05;
      if (sgn < 0) { glazed({ kind: 'foil', x, y: y2, w: w2, h: h2, rise: w2 * 0.85, z: 0, cols: 1, frame: 0x3a2a1c, reveal: 0.25, mode: 'day', seed: 8 + i, foils: 7, parent: H });
        jali({ x: x + 0.0, y: y2, w: w2, h: 1.1, z: 0.05, cell: 0.11, mat: sand, back: warm(0x4a2a14, 0.4), t: 0.05, parent: H, border: 0.06 }); }
      else { glazed({ kind: 'foil', x, y: y2, w: w2, h: h2, rise: w2 * 0.85, z: 0, cols: 2, rows: 1, frame: 0x3a2a1c, reveal: 0.25, mode: 'day', seed: 15 + i, foils: 7, parent: H }); }
      ring(openingPts({ kind: 'foil', x: x - 0.2, y: y2, w: w2 + 0.4, h: h2 + 0.3, rise: w2 * 0.85 + 0.3, foils: 7 }), openingPts({ kind: 'foil', x, y: y2, w: w2, h: h2, rise: w2 * 0.85, foils: 7 }), -0.02, 0.1, sand, H);
      // chajja
      boxAt(x - 0.3, y2 + h2 + 0.05, 0.0, x + w2 + 0.3, y2 + h2 + 0.15, 0.7, sand2, H); boxAt(x - 0.3, y2 + h2 + 0.15, 0.55, x + w2 + 0.3, y2 + h2 + 0.22, 0.7, sand2, H);
      for (const cx of [x - 0.15, x + w2 / 2 - 0.08, x + w2 + 0.0]) corbel({ x: cx, y: y2 + h2 + 0.05, z0: 0.0, w: 0.16, h: 0.5, proj: 0.6, mat: sand, parent: H });
      boxAt(x - 0.15, y2 - 0.08, 0.0, x + w2 + 0.15, y2, 0.15, sand, H);
    }
    // parapet with pointed merlons
    boxAt(xa - 0.05, TOP, -9, xb + 0.05, TOP + 0.55, -8.7, brick2, H); boxAt(xa - 0.05, TOP, 0 - 0.3, xb + 0.05, TOP + 0.55, 0.0, brick2, H);
    boxAt(xa - 0.1, TOP + 0.55, -0.4, xb + 0.1, TOP + 0.65, 0.12, sand, H);
    for (let x = xa + 0.1; x < xb - 0.2; x += 0.55) extrudePoly(openingPts({ kind: 'pointed', x, y: TOP + 0.65, w: 0.4, h: 0.55, rise: 0.25 }), -0.3, 0.3, sand, H);
    boxAt(xa - 0.05, TOP, -9, xa + 0.2, TOP + 0.65, 0.12, brick2, H); boxAt(xb - 0.2, TOP, -9, xb + 0.05, TOP + 0.65, 0.12, brick2, H);
    // wall weathering
    P.weather({ x0: xa, x1: xb, y0: 0.55, y1: 1.6, z: 0.0, parent: H, alpha: 0.3, seed: sgn + 5 });
    P.weather({ x0: xa, x1: xb, y0: TOP - 1.2, y1: TOP, z: 0.0, parent: H, alpha: 0.22, dir: 'down', seed: sgn + 8 });
  };
  wing(-8, -3.2, -1); wing(3.2, 8, 1);

  // ------------------------------------------------ central bay: gateway + jharoka
  const cx0 = -3.2, cx1 = 3.2;
  { const gate = openingPts({ kind: 'foil', x: -1.5, y: 0.0, w: 3.0, h: 4.0, rise: 1.9, foils: 9 });
    wallPanel({ x0: cx0, x1: cx1, y0: 0, y1: FH + SL + 0.01, z0: -0.5, t: 0.5, holes: [gate], mat: brick, parent: H });
    ring(openingPts({ kind: 'foil', x: -1.8, y: 0.0, w: 3.6, h: 4.45, rise: 2.1, foils: 9 }), openingPts({ kind: 'foil', x: -1.5, y: 0.0, w: 3.0, h: 4.0, rise: 1.9, foils: 9 }), -0.02, 0.14, sand, H);
    // spandrel panel above arch in sandstone with rosette
    boxAt(cx0, 4.55, -0.5, cx1, 4.62, 0.12, sand, H);
    // side pilasters
    for (const x of [cx0 - 0.0, cx1 - 0.35]) boxAt(x, 0, -0.1, x + 0.35, FH + SL, 0.14, sand, H);
    // upper floor over the gate: sandstone wall with 3 arches
    wallPanel({ x0: cx0, x1: cx1, y0: FH + SL, y1: TOP, z0: -0.5, t: 0.5, holes: [], mat: sand2, parent: H });
    boxAt(cx0, 0.0, -0.5, -1.6, 0.0, 0.0, brick, H);
  }
  // courtyard seen through the gate
  { const g = new THREE.Group(); H.add(g);
    boxAt(-3.2, 0, -9.2, -3.1, FH + SL + UH, -0.5, brick, g); boxAt(3.1, 0, -9.2, 3.2, FH + SL + UH, -0.5, brick, g);
    // far arcade wall (lit by sun)
    { const holes = [-2.2, 0, 2.2].map((cx) => openingPts({ kind: 'foil', x: cx - 0.8, y: 0.2, w: 1.6, h: 3.0, rise: 1.2, foils: 7 }));
      wallPanel({ x0: -3.2, x1: 3.2, y0: 0, y1: 4.8, z0: -9.2, t: 0.3, holes, mat: sand2, parent: g });
      for (const cx of [-2.2, 0, 2.2]) glazed({ kind: 'foil', x: cx - 0.8, y: 0.2, w: 1.6, h: 3.0, rise: 1.2, z: -8.9, cols: 2, frame: 0x3a2a1c, reveal: 0.1, mode: 'day', seed: 20 + cx, foils: 7, parent: g }); }
    // courtyard tree & planter + fountain + charpai-like bench
    leafy(tree(1.9, -6.6, { h: 5.5, crown: 2.0, seed: 61, color: 0x86b04c }, g));
    const pm = T.stone({ color: 0xe6d5b4, tileM: 1.5, seed: 31, rows: 12 }); cyl(-1.2, 0.2, -5.2, 0.9, 1.0, 0.4, pm, g, { seg: 32 }); const wm = new THREE.MeshPhysicalMaterial({ color: 0x2a7f88, roughness: 0.03, clearcoat: 1, envMapIntensity: 2 }); wm.userData.tileM = 1; cyl(-1.2, 0.38, -5.2, 0.8, 0.8, 0.03, wm, g, { seg: 32 });
    for (const [x, z] of [[-2.6, -3], [2.7, -3.0], [-2.6, -7], [2.7, -8]]) { cyl(x, 0.35, z, 0.32, 0.22, 0.7, T.solid(0xb5623a, { roughness: 0.8 }), g, { seg: 16 }); bush(x, 0.55, z, 0.4, g, { seed: x * 3 + 9, color: 0x5d9a3a }); }
    P.lightPoint(scene, 0xffd9a8, 5, 10, 0, 2.4, -3, 1.6);
  }
  // jharoka over the gate
  { const jx = 0, jy = FH + SL + 0.5, jw = 3.6, jd = 1.25, jh = 2.8;
    boxAt(jx - jw / 2, jy - 0.12, 0, jx + jw / 2, jy + 0.1, jd, sand, H);
    for (const cx of [-1.4, -0.45, 0.4, 1.3]) corbel({ x: jx + cx, y: jy - 0.12, z0: 0.0, w: 0.2, h: 0.75, proj: jd * 0.95, mat: sand, parent: H });
    // front jali half-wall
    jali({ x: jx - jw / 2 + 0.2, y: jy + 0.1, w: jw - 0.4, h: 0.85, z: jd, cell: 0.12, mat: sand, back: warm(0x3a2410, 0.4), t: 0.06, parent: H, border: 0.06 });
    boxAt(jx - jw / 2, jy + 0.1, jd - 0.12, jx + jw / 2, jy + 0.2, jd + 0.06, sand, H);
    // arcade above
    { const hs = [-1.1, 0, 1.1].map((c) => openingPts({ kind: 'foil', x: c - 0.46, y: jy + 1.0, w: 0.92, h: 1.7, rise: 0.7, foils: 7 }));
      wallPanel({ x0: jx - jw / 2, x1: jx + jw / 2, y0: jy + 0.95, y1: jy + jh, z0: jd - 0.12, t: 0.12, holes: hs, mat: sand, parent: H });
      for (const c of [-1.1, 0, 1.1]) glazed({ kind: 'foil', x: c - 0.46, y: jy + 1.0, w: 0.92, h: 1.7, rise: 0.7, z: jd - 0.02, cols: 1, frame: 0x3a2a1c, reveal: 0.1, mode: 'day', seed: 40 + c * 3, foils: 7, parent: H }); }
    // side jali
    for (const sx of [-1, 1]) { const g = new THREE.Group(); g.rotation.y = sx * Math.PI / 2; g.position.set(jx + sx * (jw / 2), 0, 0); H.add(g); jali({ x: -jd / 2 - 0.0, y: jy + 0.2, w: jd - 0.05, h: jh - 0.2, z: 0.0, cell: 0.11, mat: sand, back: warm(0x3a2410, 0.4), t: 0.05, parent: g, border: 0.07 }); g.position.z = jd / 2; }
    // roof: eaves + dome
    boxAt(jx - jw / 2 - 0.25, jy + jh, -0.1, jx + jw / 2 + 0.25, jy + jh + 0.14, jd + 0.3, sand2, H); boxAt(jx - jw / 2 - 0.3, jy + jh + 0.14, jd + 0.1, jx + jw / 2 + 0.3, jy + jh + 0.22, jd + 0.32, sand, H);
    for (let i = 0; i < 8; i++) boxAt(jx - jw / 2 - 0.2 + i * 0.52, jy + jh - 0.1, jd + 0.18, jx - jw / 2 - 0.1 + i * 0.52, jy + jh, jd + 0.28, sand, H);
    dome({ x: jx, y: jy + jh + 0.22, z: jd * 0.45, r: 0.95, mat: white, finial: brass, parent: H });
    for (const sx of [-1, 1]) dome({ x: jx + sx * 1.55, y: jy + jh + 0.22, z: jd * 0.7, r: 0.38, mat: white, finial: brass, parent: H });
  }
  // central parapet above jharoka level
  boxAt(cx0 - 0.05, TOP, -0.5, cx1 + 0.05, TOP + 0.6, 0.0, brick2, H); boxAt(cx0 - 0.1, TOP + 0.6, -0.5, cx1 + 0.1, TOP + 0.7, 0.12, sand, H);
  // doorway: open wooden gate leaves
  for (const sx of [-1, 1]) { const g = new THREE.Group(); g.position.set(sx * 1.48, 0, 0.0); g.rotation.y = sx * -1.35; H.add(g);
    boxAt(sx > 0 ? -1.45 : 0.0, 0.05, 0, sx > 0 ? 0 : 1.45, 3.4, 0.08, wood, g); for (let y = 0.4; y < 3.3; y += 0.5) for (let x = 0.2; x < 1.4; x += 0.5) { const s = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 6), brass); s.position.set(sx > 0 ? -x : x, y, 0.1); g.add(s); } }
  // roof: chhatri at right corner + water tank + AC
  chhatri({ x: 5.6, y: TOP + 0.65, z: -2.4, s: 2.5, h: 2.5, stone: sand, white, parent: H });
  { const tm = T.solid(0x242628, { roughness: 0.6 }); cyl(-5.8, TOP + 0.65 + 0.55, -6.2, 0.55, 0.55, 1.1, tm, H, { seg: 24 }); cyl(-5.8, TOP + 0.65 + 1.15, -6.2, 0.38, 0.55, 0.16, tm, H); cyl(-4.2, TOP + 0.65 + 0.55, -6.2, 0.55, 0.55, 1.1, tm, H, { seg: 24 }); cyl(-4.2, TOP + 0.65 + 1.15, -6.2, 0.38, 0.55, 0.16, tm, H); }

  // ------------------------------------------------ boundary wall + piers + planting
  const zb = 9.6;
  for (const [xa, xb] of [[-30, -3.0], [3.0, 30]]) { boxAt(xa, 0, zb - 0.2, xb, 0.9, zb + 0.2, brick, scene); boxAt(xa, 0.9, zb - 0.26, xb, 1.0, zb + 0.26, sand, scene); P.barFence({ x0: xa, x1: xb, y0: 1.0, y1: 1.5, z: zb, pitch: 0.12, bar: 0.025, mat: iron, parent: scene, rails: [0, 1] });
    for (let x = Math.ceil(xa / 5) * 5; x <= xb; x += 5) { boxAt(x - 0.28, 0, zb - 0.28, x + 0.28, 1.55, zb + 0.28, brick, scene); boxAt(x - 0.34, 1.55, zb - 0.34, x + 0.34, 1.63, zb + 0.34, sand, scene); dome({ x, y: 1.63, z: zb, r: 0.22, mat: white, finial: brass, parent: scene }); } }
  for (const px of [-3.0, 3.0]) { boxAt(px - 0.4, 0, zb - 0.4, px + 0.4, 2.3, zb + 0.4, brick, scene); boxAt(px - 0.5, 2.3, zb - 0.5, px + 0.5, 2.42, zb + 0.5, sand, scene); dome({ x: px, y: 2.42, z: zb, r: 0.42, mat: white, finial: brass, parent: scene }); boxAt(px - 0.1, 1.7, zb + 0.4, px + 0.1, 2.0, zb + 0.44, warm(0xffd9a0, 1.4), scene, { cast: false }); }
  for (const sx of [-1, 1]) { const g = new THREE.Group(); g.position.set(sx * 2.6, 0, zb); g.rotation.y = sx * -1.25; scene.add(g); P.barFence({ x0: sx > 0 ? -2.2 : 0, x1: sx > 0 ? 0 : 2.2, y0: 0.15, y1: 2.0, z: 0, pitch: 0.12, bar: 0.028, mat: iron, parent: g, rails: [0, 0.5, 1] }); }
  // forecourt planting + pots
  for (const sx of [-1, 1]) { for (const x of [4.2, 6.3]) { cyl(sx * x, 0.4, 3.0, 0.38, 0.28, 0.8, T.solid(0xb5623a, { roughness: 0.8 }), scene, { seg: 18 }); bush(sx * x, 0.7, 3.0, 0.45, scene, { seed: x + 20, color: 0x5d9a3a }); }
    hedge(sx * 3.6, 6.8, sx * 11, 6.8, { h: 0.55, w: 0.4, density: 70, seed: 9 + sx, color: 0x5d9a3a }, scene); ground(sx * 3.6, 6.8, sx * 11, 8.9, 0.006, T.grass({ color: 0x6f9740, tileM: 4, seed: 70 }), scene); }
  leafy(tree(-13.5, 4.2, { h: 9, crown: 3.8, seed: 2, color: 0x86b04c }, scene)); leafy(tree(14, 4.0, { h: 8.5, crown: 3.6, seed: 6, color: 0x8cb650 }, scene));
  palm(-11, 7.4, { h: 8.5, seed: 3, lean: 0.3 }, scene); palm(11.4, 7.6, { h: 8, seed: 8, lean: -0.3 }, scene);
  leafy(tree(-4, -20, { h: 12, crown: 5, seed: 11, color: 0x6e9e42 }, scene)); leafy(tree(8, -20, { h: 11, crown: 4.5, seed: 12, color: 0x76a647 }, scene));
  neighbour({ x0: -36, x1: -12.2, z: -1, depth: 14, floors: 2, mat: T.plaster(0xd8c4a4, { tileM: 3.4, seed: 12 }), trim: T.plaster(0xf0e8d6, { tileM: 3, seed: 15 }), seed: 3, scene });
  neighbour({ x0: 12.2, x1: 36, z: -1, depth: 14, floors: 2, mat: T.plaster(0xcdb892, { tileM: 3.4, seed: 17 }), trim: T.plaster(0xeee6d2, { tileM: 3, seed: 18 }), seed: 5, scene });
  P.backdrop({ scene, z: -34, seed: 6, palette: [0xd8c4a4, 0xcdb892, 0xe0d2b6] });

  const camera = archCamera({ pos: [-6.5, 3.2, 24], target: [0.5, 0, 0], focal: 34, shift: 0.07, w, h });
  return { scene, camera, exposure: 0.45, aoRadius: 0.9, aoStrength: 1.0, bloom: true, bloomStrength: 0.15, bloomRadius: 0.9, bloomThreshold: 1.7, grade: { contrast: 1.1, saturation: 1.08, vignette: 0.3, grain: 0.016, warm: 0.04 } };
}
