// Modern facade at dusk/night: warm interiors, LED facade strips, uplighting, wet reflective road, stars, bloom.
import * as P from '../lib/agent2-parts.mjs';
import { setupSky, archCamera } from '../lib/agent2-env.mjs';
const { THREE, T, boxAt, cyl, ground, glazed, wallPanel, openingPts, tree, palm, bush, hedge, leafy, batten, barFence, streetscape, neighbour, lightPoint, lightSpot, stars, mirrorBelow } = P;

export default async function build({ renderer, w, h }) {
  const scene = new THREE.Scene();
  setupSky({ renderer, scene, sunElevation: -3, sunAzimuth: 200, sunIntensity: 0, envIntensity: 1.0, shadowExtent: 30,
    dome: { zenith: [0.006, 0.02, 0.09], mid: [0.03, 0.06, 0.2], horizon: [0.55, 0.26, 0.2], ground: [0.02, 0.02, 0.04], sunCol: [1.2, 0.5, 0.2], glow: 0.5, coverage: 0.5, soft: 0.3, cloudLit: [0.08, 0.07, 0.14], cloudShade: [0.015, 0.02, 0.06], cloudOpacity: 0.6, cloudScale: 1.6, seed: 9.1 },
    fog: { color: [0.04, 0.05, 0.1], density: 0.004 } });
  stars(scene, { count: 900, scale: Math.max(1, w / 1280) });
  const LED = (c = 0xffd9a0, i = 9) => T.emissive(c, i);

  const conc = T.concrete(0xb6b4ae, { tileM: 2.5, seed: 31 }), concD = T.concrete(0x6c6c6a, { tileM: 2.2, seed: 37 }), char = T.plaster(0x24262a, { tileM: 3, seed: 2, roughness: 0.7 });
  const teak = T.wood({ color: 0xb9854f, tileM: 1.6, planks: 5, seed: 6 }), teakSlat = T.wood({ color: 0xc28c52, tileM: 1.2, planks: 1, gap: false, seed: 4 }), steel = T.metal(0x14161a, { roughness: 0.4 });
  const white = T.plaster(0xe6e3dc, { tileM: 3.5, seed: 4 }), stone = T.stone({ color: 0x777067, tileM: 2.2, seed: 11, rows: 22 });
  const pave = T.paving({ color: 0xa9a59a, tileM: 2.6, n: 5, seed: 5 }), lawn = T.grass({ color: 0x4f7a34, tileM: 5, seed: 61 });

  ground(-140, -90, 140, 9, 0, T.grass({ color: 0x4a6a35, tileM: 6, seed: 66 }), scene);
  const st = streetscape({ scene, zb: 8.4, foot: 2.6, roadW: 21, wet: true, paveColor: 0x9c988e }); st.roadMat.color.setRGB(1.3, 1.3, 1.4); st.roadMat.opacity = 0.84;
  ground(-12, 0.3, 12, 8.4, 0.004, lawn, scene);
  ground(-9.6, -6, -4.4, 8.4, 0.012, pave, scene); ground(-9.6, 8.4, -4.4, 11.0, 0.01, pave, scene);
  for (let i = 0; i < 6; i++) boxAt(-0.6 + (i % 2) * 0.12, 0.0, 1.8 + i * 1.1, 0.9 + (i % 2) * 0.12, 0.04, 2.6 + i * 1.1, pave, scene);

  const R = new THREE.Group(); scene.add(R);   // everything reflected in the wet road
  const FH = 3.3, SL = 0.36, UH = 3.2, TOP = FH + SL + UH;

  // ---------- LEFT: carport + first-floor concrete box with glowing corner window
  boxAt(-10.3, 0, -6.0, -3.9, FH, -5.8, teak, R); boxAt(-10.3, 0, -6.0, -10.1, FH, 0, stone, R); boxAt(-4.1, 0, -6.0, -3.9, FH, 0, stone, R);
  boxAt(-10.1, FH - 0.04, -6.0, -4.1, FH, 1.2, teak, R, { cast: false });
  boxAt(-10.5, FH, -15, -3.7, FH + SL, 1.25, char, R); boxAt(-10.3, FH + SL, -15, -3.9, TOP, 1.05, conc, R); boxAt(-10.5, TOP, -15, -3.7, TOP + 0.3, 1.25, char, R);
  { const o = openingPts({ x: -9.5, y: FH + SL + 0.6, w: 4.8, h: 1.9 }); wallPanel({ x0: -10.3, x1: -3.9, y0: FH + SL, y1: TOP, z0: 1.05, t: 0.3, holes: [o], mat: conc, parent: R }); }
  glazed({ x: -9.5, y: FH + SL + 0.6, w: 4.8, h: 1.9, z: 1.35, cols: 4, frame: 0x101215, mode: 'night', seed: 2, reveal: 0.22, parent: R });
  boxAt(-10.5, FH - 0.0, 1.0, -3.7, FH + 0.03, 1.2, LED(0xffd9a0, 12), R, { cast: false });   // LED under slab edge
  boxAt(-10.5, TOP + 0.3, 1.0, -3.7, TOP + 0.34, 1.22, LED(0xffe6b8, 10), R, { cast: false });
  for (let i = 0; i < 5; i++) for (const z of [-4.2, -1.6, 0.6]) { const d = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.02, 14), LED(0xfff3d6, 14)); d.position.set(-9.2 + i * 1.1, FH - 0.05, z); R.add(d); }
  lightPoint(scene, 0xffc88a, 9, 9, -7, FH - 0.5, -2.5, 1.5); lightPoint(scene, 0xffc88a, 6, 7, -7, FH - 0.4, 0.4, 1.5);
  for (const x of [-7.6, -6.7, -5.8]) boxAt(x, 0.0, -5.78, x + 0.05, FH, -5.74, LED(0xffd9a0, 3), R, { cast: false });
  P.car({ x: -7.1, z: -2.0, rot: 0, color: 0x2a2d33, parent: R, lights: true });
  boxAt(-4.3, FH + SL + 0.1, 1.05, -4.05, TOP - 0.1, 1.5, teak, R);
  { const c = new THREE.CylinderGeometry(0.1, 0.1, FH, 18); c.translate(-9.95, FH / 2, 1.0); P.add(c, steel, R); }

  // ---------- CENTRE: glowing double-height glass hall between stone & timber fins
  { const cx0 = -3.9, cx1 = 2.4;
    const o = openingPts({ x: -2.7, y: 0.0, w: 4.4, h: TOP - 0.7 });
    wallPanel({ x0: cx0, x1: cx1, y0: 0, y1: TOP + 0.5, z0: -0.45, t: 0.45, holes: [o], mat: stone, parent: R }); boxAt(cx0, 0, -15, cx1, TOP + 0.5, -0.45, stone, R);
    glazed({ x: -2.7, y: 0.0, w: 4.4, h: TOP - 0.7, z: 0.0, cols: 4, rows: 3, frame: 0x101215, frameW: 0.06, mode: 'night', seed: 14, reveal: 0.3, parent: R, glassMat: P.glass({ mode: 'night', seed: 14, emis: 2.4 }) });
    P.doorLeaf({ x: -1.5, y: 0, w: 1.3, h: 2.6, z: 0.02, reveal: 0.0, mat: T.wood({ color: 0x7a4e2a, tileM: 1.5, planks: 3, seed: 9 }), frameMat: steel, panels: false, parent: R });
    batten({ x0: -3.55, x1: -2.75, y0: 0.0, y1: TOP + 0.4, z0: 0.0, z1: 0.14, pitch: 0.16, w: 0.07, mat: teakSlat, parent: R });
    batten({ x0: 1.7, x1: 2.3, y0: 0.0, y1: TOP + 0.4, z0: 0.0, z1: 0.14, pitch: 0.16, w: 0.07, mat: teakSlat, parent: R });
    boxAt(cx0, 0, 0.0, cx0 + 0.04, TOP, 0.04, LED(0xffd9a0, 4), R, { cast: false });
    boxAt(cx0, TOP + 0.5, -0.45, cx1, TOP + 0.58, 0.06, concD, R);
    boxAt(-2.8, FH + 0.08, -0.3, 1.8, FH + 0.14, 0.15, LED(0xffe0b0, 8), R, { cast: false });
    lightPoint(scene, 0xffd49a, 12, 14, -0.5, 3.0, 2.4, 1.5);
  }
  // ---------- RIGHT: dark volume with horizontal slot + cove light
  { const rx0 = 2.4, rx1 = 10.4, sz = -1.4;
    const o = openingPts({ x: 3.3, y: 0.0, w: 6.4, h: 3.0 }); wallPanel({ x0: rx0, x1: rx1, y0: 0, y1: FH, z0: sz - 0.3, t: 0.3, holes: [o], mat: white, parent: R }); boxAt(rx0, 0, -15, rx1, FH, sz - 0.3, white, R);
    glazed({ x: 3.3, y: 0.0, w: 6.4, h: 3.0, z: sz, cols: 4, frame: 0x101215, mode: 'night', seed: 21, reveal: 0.0, depth: 0.1, parent: R, transomAt: 2.4 });
    boxAt(rx0, 0, sz, rx1, 0.16, 2.6, T.tiles({ color: 0xcfc8ba, grout: 0x85807a, tileM: 2.4, n: 3, marble: false, roughness: 0.4, seed: 33 }), R);
    boxAt(rx0 - 0.2, FH, -15, rx1 + 0.2, FH + SL, 2.65, char, R); boxAt(rx0, FH + SL, -15, rx1, TOP, 2.2, char, R); boxAt(rx0 - 0.2, TOP, -15, rx1 + 0.2, TOP + 0.3, 2.65, concD, R);
    { const o2 = openingPts({ x: 3.0, y: FH + SL + 0.9, w: 6.6, h: 1.0 }); wallPanel({ x0: rx0, x1: rx1, y0: FH + SL, y1: TOP, z0: 2.2, t: 0.25, holes: [o2], mat: char, parent: R }); }
    glazed({ x: 3.0, y: FH + SL + 0.9, w: 6.6, h: 1.0, z: 2.45, cols: 5, frame: 0x101215, mode: 'night', seed: 31, reveal: 0.25, parent: R });
    boxAt(rx0 - 0.2, FH - 0.02, 2.2, rx1 + 0.2, FH + 0.02, 2.62, LED(0xffd9a0, 12), R, { cast: false });
    boxAt(rx0 - 0.2, TOP - 0.02, 2.2, rx1 + 0.2, TOP + 0.02, 2.62, LED(0xfff0d0, 9), R, { cast: false });
    for (const x of [4.2, 6.2, 8.2]) boxAt(x, 0.16, 2.3, x + 0.06, 0.24, 2.5, LED(0xffd9a0, 6), R, { cast: false });
    for (let x = rx0 + 0.3; x < rx1; x += 1.4) { const d = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.02, 14), LED(0xfff3d6, 14)); d.position.set(x, FH - 0.03 + SL * 0, 2.2 + 0.2); R.add(d); }
    lightPoint(scene, 0xffc88a, 10, 10, 6.5, 2.4, 0.5, 1.5);
    // pool glow
    const pw = new THREE.MeshStandardMaterial({ color: 0x0a4e5a, emissive: 0x19c6d4, emissiveIntensity: 1.6, roughness: 0.08, metalness: 0 }); pw.userData.tileM = 1;
    boxAt(4.8, -0.12, 3.4, 10.2, -0.1, 6.0, pw, R, { cast: false }); boxAt(4.6, 0, 3.2, 10.4, 0.1, 3.4, concD, R); boxAt(4.6, 0, 6.0, 10.4, 0.1, 6.2, concD, R); boxAt(4.6, 0, 3.2, 4.8, 0.1, 6.2, concD, R); boxAt(10.2, 0, 3.2, 10.4, 0.1, 6.2, concD, R);
    lightPoint(scene, 0x30d0e0, 6, 9, 7.5, 0.4, 4.7, 1.6);
  }
  // ---------- uplighting: walls, palms, trees
  const up = (x, z, c = 0xffc890) => { const l = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.1, 10), LED(c, 14)); l.position.set(x, 0.05, z); R.add(l); };
  for (const [x, z] of [[-11.8, 5.6], [11.6, 5.8], [-2.3, 1.6], [1.6, 1.6]]) up(x, z);
  lightSpot(scene, 0xffc080, 160, 16, 0.5, [-11.8, 0.1, 5.6], [-12, 7, 5.6], 0.8, 1.5); lightSpot(scene, 0xffc080, 160, 16, 0.5, [11.6, 0.1, 5.8], [11.6, 7, 5.8], 0.8, 1.5);
  lightSpot(scene, 0xffd49a, 90, 12, 0.7, [-2.3, 0.1, 1.6], [-2.3, 6, -0.3], 0.8, 1.5); lightSpot(scene, 0xffd49a, 90, 12, 0.7, [1.6, 0.1, 1.6], [1.6, 6, -0.3], 0.8, 1.5);
  palm(-11.8, 5.6, { h: 8.5, seed: 3, lean: 0.2 }, R); palm(11.6, 5.8, { h: 8, seed: 8, lean: -0.3 }, R);
  // step / bollard lights along the path
  for (let i = 0; i < 6; i++) for (const sx of [-1, 1]) boxAt(sx * 1.0 - 0.04 + (i % 2) * 0.1, 0.05, 2.0 + i * 1.1, sx * 1.0 + 0.04 + (i % 2) * 0.1, 0.35, 2.1 + i * 1.1, LED(0xffd29a, 6), R, { cast: false });

  // ---------- boundary wall, pillar lamps, street lamps
  const zb = 8.4;
  boxAt(-30, 0, zb - 0.13, -10.9, 0.45, zb + 0.13, stone, R); boxAt(-4.0, 0, zb - 0.13, 30, 0.45, zb + 0.13, stone, R);
  barFence({ x0: -30, x1: -10.9, y0: 0.45, y1: 1.55, z: zb, pitch: 0.14, bar: 0.03, mat: steel, parent: R, rails: [0, 1] }); barFence({ x0: -4.0, x1: 30, y0: 0.45, y1: 1.55, z: zb, pitch: 0.14, bar: 0.03, mat: steel, parent: R, rails: [0, 1] });
  boxAt(-30, 0.01, zb + 0.14, -10.9, 0.05, zb + 0.18, LED(0xffd29a, 5), R, { cast: false }); boxAt(-4.0, 0.01, zb + 0.14, 30, 0.05, zb + 0.18, LED(0xffd29a, 5), R, { cast: false });
  for (const px of [-10.9, -4.0, 4.5, 12.5, 20]) { boxAt(px - 0.3, 0, zb - 0.3, px + 0.3, 2.0, zb + 0.3, stone, R); boxAt(px - 0.34, 2.0, zb - 0.34, px + 0.34, 2.08, zb + 0.34, concD, R); boxAt(px - 0.12, 2.08, zb - 0.12, px + 0.12, 2.36, zb + 0.12, LED(0xfff0cc, 16), R, { cast: false }); }
  hedge(-3.6, 7.0, 4.4, 7.0, { h: 0.6, w: 0.45, density: 70, seed: 13, color: 0x3f6f30 }, R); hedge(10.8, 7.0, 16, 7.0, { h: 0.6, w: 0.45, density: 70, seed: 23, color: 0x3f6f30 }, R);
  leafy(tree(-16, 3.5, { h: 8.5, crown: 3.4, seed: 2, color: 0x4f7a38 }, R), { emissive: 0x0a1406, k: 0.4 }); leafy(tree(15.5, 3.0, { h: 8, crown: 3.1, seed: 6, color: 0x4f7a38 }, R), { emissive: 0x0a1406, k: 0.4 });
  leafy(tree(-3, -21, { h: 12, crown: 5, seed: 11, color: 0x3f6a30 }, scene), { emissive: 0x08100a, k: 0.3 }); leafy(tree(8, -21, { h: 11, crown: 4.5, seed: 12, color: 0x3f6a30 }, scene), { emissive: 0x08100a, k: 0.3 });
  const lampPost = (x, z, dir) => { P.streetLamp(x, z, scene, { dir, on: true }); lightSpot(scene, 0xffc17a, 220, 22, 0.9, [x + dir * 1.6, 7.0, z], [x + dir * 1.6, 0, z + 1], 0.9, 1.4); };
  lampPost(-16, 11.2, 1); lampPost(14, 11.2, -1);
  mirrorBelowR(R, scene);
  neighbour({ x0: -36, x1: -13, z: -1, depth: 14, floors: 2, mat: T.plaster(0xb9b1a2, { tileM: 3.4, seed: 12 }), trim: T.plaster(0xd9d3c6, { tileM: 3, seed: 15 }), seed: 3, scene, mode: 'night' });
  neighbour({ x0: 15, x1: 38, z: -2.5, depth: 14, floors: 2, mat: T.plaster(0xaaa294, { tileM: 3.4, seed: 17 }), trim: T.plaster(0xd2ccbe, { tileM: 3, seed: 18 }), seed: 5, scene, mode: 'night' });
  P.backdrop({ scene, z: -34, seed: 3, palette: [0x9a9284, 0x8e8678], mode: 'night', treeColor: 0x3a5f2c });

  const camera = archCamera({ pos: [-7.5, 2.1, 25], target: [0, 0, 0], focal: 31, shift: 0.05, w, h });
  return { scene, camera, exposure: 0.55, aoRadius: 0.9, aoStrength: 1.0, bloom: true, bloomStrength: 0.4, bloomRadius: 0.75, bloomThreshold: 3.2, grade: { contrast: 1.14, saturation: 1.08, vignette: 0.32, grain: 0.02, warm: 0.0 } };
}
function mirrorBelowR(group, scene) { const c = group.clone(true); c.scale.y = -1; c.position.y = -0.3; c.traverse((o) => { o.castShadow = false; }); scene.add(c); return c; }
