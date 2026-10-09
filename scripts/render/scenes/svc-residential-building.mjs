// svc-residential-building: G+4 apartment block on a Pakistani street, evening light.
import { THREE, T, boxAt, cyl, ground, rng, bindEnv, finish, win, facade, ledgeStone, lawnMat, railRun, instBoxes, ac, tank, dish, wallStreaks, wallFoot, groundGrime, pavers, planeZ, car, downlight } from '../lib/agent5-kit.mjs';
import { tree2, bush2, hedge2, bougain } from '../lib/agent5-nature.mjs';
import { makeSky } from '../lib/agent5-sky.mjs';
import { setupEnvironment, archCamera } from '../lib/env.mjs';

export default async function build({ renderer, w, h }) {
  const scene = new THREE.Scene(), R = rng(21);
  const E = setupEnvironment({ renderer, scene, sunElevation: 10, sunAzimuth: 64, turbidity: 6, rayleigh: 1.2, sunIntensity: 3.4, sunColor: 0xffc58f, envIntensity: 0.38, shadowExtent: 46, shadowCenter: [0, 0, 6] });
  bindEnv(E.env); E.sky.visible = false;
  const SK = makeSky(scene, { exposure: 0.34, sunEl: 10, sunAz: 64, zenith: 0x4a6f9f, mid: 0x9aa9be, horizon: 0xf0cfae, glow: 0xffc890, glowAmt: 0.6, glowTight: 10, hazeH: 0.28, cover: 0.5, scale: 1.5, soft: 0.3, cirrus: 0.45, seed: 8, cloudLit: 0xffe2c4, cloudShade: 0xa8a2b0, cloudUnder: 0x9a7f88 });
  scene.fog = new THREE.FogExp2(SK.fogColor, 0.0048);

  // materials
  const pW = T.plaster(0xe6dccb, { tileM: 3.2, seed: 4 }), pC = T.plaster(0xc9b79a, { tileM: 3.2, seed: 6 }), pD = T.plaster(0x6e6459, { tileM: 3.2, seed: 9, roughness: 0.85 }), pT = T.plaster(0x9c4f3a, { tileM: 3.2, seed: 13 });
  const brick = T.brick({ color: 0x9b4a35, mortar: 0xbab1a2, tileM: 1.2, rows: 16, cols: 6 });
  const stone = ledgeStone({ colors: [0x8a7f70, 0x9b9080, 0x776d60, 0xa89d8b], tileM: 1.8, seed: 5 });
  const conc = T.concrete(0xb3b1aa, { tileM: 2.5, seed: 5 }), capM = T.concrete(0xa5a39d, { tileM: 2, seed: 15 });
  const asphalt = T.asphalt({ tileM: 7 }), lawn = lawnMat({ color: 0x8aa24f, tileM: 3.4, seed: 61 });
  const metalB = T.solid(0x26282b, { roughness: 0.5, metalness: 0.5 });

  // ground
  ground(-1500, -1500, 1500, 1500, 0, lawn, scene);
  ground(-1500, 11.0, 1500, 34, 0.002, asphalt, scene);
  groundGrime({ x0: -60, z0: 11, x1: 60, z1: 34, y: 0.004, seed: 31, alpha: 0.22, color: [20, 20, 20], scale: 6, cutoff: 0.5, noiseM: 9, res: 2048 }, scene);
  groundGrime({ x0: -60, z0: 11, x1: 60, z1: 15, y: 0.006, seed: 41, alpha: 0.45, color: [130, 112, 88], scale: 12, cutoff: 0.45, res: 2048, noiseM: 5 }, scene);
  const paint = T.solid(0xe9e7df, { roughness: 0.7 }); for (let x = -118; x < 118; x += 6) boxAt(x, 0.004, 22.9, x + 3, 0.012, 23.1, paint, scene, { cast: false });
  ground(-1500, 7.2, 1500, 10.7, 0.02, pavers({ colors: [0xb9b0a2, 0xaaa294, 0xc2baac], tileM: 1.6, seed: 17 }), scene);
  boxAt(-1500, 0, 10.7, 1500, 0.17, 11.0, conc, scene);
  ground(-1500, 7.2, 1500, 7.3, 0.0, T.solid(0x4a3a2a), scene);
  // forecourt
  ground(-12, -0.2, 12, 7.2, 0.03, pavers({ colors: [0xaaa59a, 0xb8b2a6, 0x9e988c], tileM: 1.6, seed: 5 }), scene);
  ground(-12, -9, 12, -0.2, 0.03, T.concrete(0x9d9b95, { tileM: 3, seed: 12 }), scene);

  // ------------------------------------------------ building
  const B = new THREE.Group(); scene.add(B);
  const BW = 3.6, NB = 6, X0 = -10.8, X1 = X0 + BW * NB, GH = 3.5, FH = 3.15, SLT = 0.25, NF = 4, Dp = 14;
  const fy = (k) => GH + k * (FH + SLT);            // underside level of floor k slab (k=0 first-floor slab at GH)
  // ground level: parking under building (stilts)
  for (let i = 0; i <= NB; i++) { const x = X0 + i * BW; boxAt(x - 0.22, 0.03, -0.22, x + 0.22, GH, 0.22, pW, B); boxAt(x - 0.22, 0.03, -6.2, x + 0.22, GH, -5.76, pW, B); }
  boxAt(X0 - 0.2, 0.03, -Dp, X1 + 0.2, GH, -8.2, T.plaster(0x8a8072, { tileM: 3, seed: 20 }), B);         // back wall of parking
  boxAt(X0 - 0.2, 0.03, -8.2, X0 + 0.2, GH, 0, pW, B); boxAt(X1 - 0.2, 0.03, -8.2, X1 + 0.2, GH, 0, pW, B);
  for (const bx of [-7.2, 3.6]) boxAt(bx, 0.03, -8.2, bx + 0.15, GH, -3.2, pW, B);                         // bay dividers
  // stair/lift core at left bay: stone clad, glass door
  boxAt(X0, 0.03, -7.6, X0 + BW, GH, 0.0, stone, B); boxAt(X0 + 1.0, 0.03, -0.02, X0 + 2.6, 2.4, 0.04, T.solid(0x16181b, { roughness: 0.4 }), B);
  win({ x: X0 + 1.1, y: 0.1, w: 1.4, h: 2.25, z: 0.0, cols: 2, frame: 0x1c1e21, reveal: 0.0, interior: false, sill: false }, B);
  for (let i = 1; i < NB; i++) { const x = X0 + i * BW; boxAt(x - 0.3, 0.03, 0.22, x + 0.3, 0.9, 0.5, i % 2 ? stone : pD, B); }
  // ground-floor ceiling slab / plinth beam
  boxAt(X0 - 0.2, GH - 0.55, -Dp, X1 + 0.2, GH, 0.3, pW, B);
  // parking lights
  for (let x = X0 + 2; x < X1; x += 3.6) { downlight(x, GH - 0.55, -2, B, { intensity: 6 }); }
  const pl = new THREE.PointLight(0xffd9a0, 9, 11, 1.8); pl.position.set(-2, GH - 0.8, -3); scene.add(pl);
  const pl2 = new THREE.PointLight(0xffd9a0, 9, 11, 1.8); pl2.position.set(6, GH - 0.8, -3); scene.add(pl2);
  car(B, -4.2, -3.8, Math.PI / 2, { color: 0xb8bcc0 }); car(B, 0.4, -4.2, Math.PI / 2 + 0.05, { color: 0x20262e }); car(B, 7.4, -3.6, Math.PI / 2 - 0.04, { color: 0x7d1f26 });

  // floors
  const glowSet = new Set(); for (let k = 0; k < NF; k++) for (let i = 0; i < NB; i++) if (R() < 0.36) glowSet.add(k * 10 + i);
  for (let k = 0; k < NF; k++) {
    const y0 = fy(k), yb = y0 + SLT, yt = yb + FH;
    // slab band
    boxAt(X0 - 0.25, y0, -Dp, X1 + 0.25, yb, 0.3, k % 2 ? pW : pC, B); boxAt(X0 - 0.27, y0 + 0.02, 0.28, X1 + 0.27, y0 + 0.07, 0.31, pD, B, { cast: false });
    const wins = []; for (let i = 0; i < NB; i++) {
      const bx = X0 + i * BW, balc = i % 2 === 0;
      if (balc) wins.push({ x: bx + 0.6, y: yb + 0.02, w: 2.4, h: 2.25, cols: 2, frame: 0x2b2d30, seed: k * 10 + i + 1, glow: glowSet.has(k * 10 + i) ? 1.4 : 0, curtain: 0.5, floorY: yb + 0.02, ceilY: yt - 0.05, reveal: 0.15, sill: false, roomOpts: { depth: 4.5 } });
      else wins.push({ x: bx + 0.9, y: yb + 0.95, w: 1.8, h: 1.35, cols: 2, frame: 0x2b2d30, seed: k * 10 + i + 3, glow: glowSet.has(k * 10 + i) ? 1.4 : 0, curtain: 0.6, floorY: yb + 0.02, ceilY: yt - 0.05, reveal: 0.15, sillMat: capM, lintel: true, roomOpts: { depth: 4.2 } });
    }
    facade({ x0: X0, x1: X1, y0: yb, y1: yt, zBack: -0.35, t: 0.35, wins, mat: pW, parent: B });
    boxAt(X0 - 0.25, yb, -Dp, X1 + 0.25, yt, -5.6, pW, B);
    boxAt(X0 - 0.25, yb, -5.6, X0, yt, 0.0, pW, B); boxAt(X1, yb, -5.6, X1 + 0.25, yt, 0.0, pW, B);
    for (let i = 0; i < NB; i++) {
      const bx = X0 + i * BW;
      if (i % 2 === 0) { // balcony
        boxAt(bx + 0.15, y0, 0.0, bx + BW - 0.15, y0 + SLT, 1.55, i === 0 || i === 4 ? pT : pC, B); boxAt(bx + 0.15, y0 + SLT, 0.0, bx + BW - 0.15, y0 + SLT + 0.02, 1.55, T.tiles({ color: 0xcfc7b8, tileM: 2.4, n: 4, seed: 51, marble: false, roughness: 0.6 }), B, { cast: false });
        railRun(B, [bx + 0.15, 1.5], [bx + BW - 0.15, 1.5], { y: y0 + SLT, h: 1.05, kind: 'bars', pitch: 0.12, mat: metalB, cap: capM });
        railRun(B, [bx + 0.15, 1.5], [bx + 0.15, 0.0], { y: y0 + SLT, h: 1.05, kind: 'bars', pitch: 0.12, mat: metalB, cap: capM }); railRun(B, [bx + BW - 0.15, 1.5], [bx + BW - 0.15, 0.0], { y: y0 + SLT, h: 1.05, kind: 'bars', pitch: 0.12, mat: metalB, cap: capM });
        if ((k + i) % 3 === 0) ac(bx + 0.3, y0 + SLT + 0.02, 0.9, B, { w: 0.86, h: 0.62, d: 0.34 });
        if ((k + i) % 2 === 0) bush2(bx + BW - 0.7, y0 + SLT + 0.02, 1.0, 0.22, { seed: k * 7 + i, leaf: 'broad', cardS: 0.14, tint: 0xe6f4d2 }, B);
        if ((k * 3 + i) % 4 === 1) { const cl = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.7), T.solid(R() > 0.5 ? 0xb8453a : 0x3f6aa0, { roughness: 1, side: THREE.DoubleSide })); cl.position.set(bx + 1.8, y0 + SLT + 0.65, 1.46); B.add(cl); }
      } else { // brick spandrel + shade
        boxAt(bx + 0.1, yb, 0.0, bx + BW - 0.1, yb + 0.95, 0.09, brick, B); boxAt(bx + 0.6, yb + 2.4, 0.0, bx + BW - 0.6, yb + 2.46, 0.5, capM, B);
        if ((k + i) % 3 === 1) ac(bx + 1.3, yb + 0.1, 0.0 - 0.0 + 0.1, B, { w: 0.86, h: 0.62, d: 0.34, dir: 1 });
      }
    }
    if (k % 2 === 0) { boxAt(X0 + 4.5 * BW - 0.0, yb, 0.0, X0 + 4.5 * BW + 0.4, yt, 0.12, stone, B); }
    wallStreaks({ x0: X0, x1: X1, y0: yb, y1: yt, z: 0.0, seed: k + 3, alpha: 0.2, count: 40 }, B);
  }
  // roof
  const yr = fy(NF) + SLT * 0 , YR = fy(NF - 1) + SLT + FH + SLT;
  boxAt(X0 - 0.25, fy(NF - 1) + SLT + FH, -Dp, X1 + 0.25, YR, 0.3, pW, B);
  const pTop = YR + 1.1;
  boxAt(X0 - 0.25, YR, 0.1, X1 + 0.25, pTop, 0.3, pW, B); boxAt(X0 - 0.25, YR, -Dp, X0 - 0.05, pTop, 0.1, pW, B); boxAt(X1 + 0.05, YR, -Dp, X1 + 0.25, pTop, 0.1, pW, B); boxAt(X0 - 0.25, YR, -Dp, X1 + 0.25, pTop, -Dp + 0.2, pW, B);
  boxAt(X0 - 0.32, pTop, -Dp - 0.07, X1 + 0.32, pTop + 0.07, 0.37, capM, B);
  boxAt(X0 + 0.5, YR, -9, X0 + 4.5, YR + 2.6, -4.5, pW, B); boxAt(X0 + 0.4, YR + 2.6, -9.1, X0 + 4.6, YR + 2.72, -4.4, capM, B);
  tank(X0 + 8.5, YR, -8, B, { r: 0.65, h: 1.3 }); tank(X0 + 10.2, YR, -8, B, { r: 0.65, h: 1.3 }); tank(X0 + 14, YR, -9, B, { r: 0.6, h: 1.2 }); tank(X0 + 19, YR, -7, B, { r: 0.6, h: 1.2 });
  dish(X0 + 6, YR, -6, B, {}); dish(X0 + 17, YR, -4, B, { rot: 0.9 });
  // roof-edge feature: vertical brick fin on right corner
  boxAt(X1 - 1.4, GH, 0.0, X1 + 0.1, YR + 1.1, 0.35, brick, B);

  // ------------------------------------------------ boundary wall + gate
  const wz = 7.4, wall = T.plaster(0xd8cdb8, { tileM: 3, seed: 30 });
  boxAt(-14, 0, wz - 0.12, -5.0, 1.6, wz + 0.12, wall, scene); boxAt(5.0, 0, wz - 0.12, 14, 1.6, wz + 0.12, wall, scene);
  boxAt(-14.1, 1.6, wz - 0.16, -4.9, 1.68, wz + 0.16, capM, scene); boxAt(4.9, 1.6, wz - 0.16, 14.1, 1.68, wz + 0.16, capM, scene);
  for (const px of [-5.2, 4.7]) { boxAt(px, 0, wz - 0.28, px + 0.5, 2.1, wz + 0.28, stone, scene); boxAt(px - 0.04, 2.1, wz - 0.32, px + 0.54, 2.18, wz + 0.32, capM, scene); boxAt(px + 0.05, 2.18, wz - 0.2, px + 0.45, 2.42, wz + 0.2, T.emissive(0xffe2b0, 1.5), scene, { cast: false }); }
  const gl = []; for (let x = -4.6; x < -1.0; x += 0.14) gl.push([x, 0.15, wz - 0.015, x + 0.03, 1.9, wz + 0.015]); for (let x = 1.0; x < 4.6; x += 0.14) gl.push([x, 0.15, wz - 0.015, x + 0.03, 1.9, wz + 0.015]);
  instBoxes(gl, metalB, scene); for (const [a, b] of [[-4.65, -1.0], [1.0, 4.65]]) { boxAt(a, 0.12, wz - 0.03, b, 0.18, wz + 0.03, metalB, scene); boxAt(a, 1.86, wz - 0.03, b, 1.92, wz + 0.03, metalB, scene); boxAt(a, 0.9, wz - 0.02, b, 0.94, wz + 0.02, metalB, scene); }
  bougain(-13.5, -5.2, 1.65, wz, { drop: 0.9, seed: 3, dir: 1 }, scene); bougain(5.2, 13.5, 1.65, wz, { drop: 0.8, seed: 4, dir: 1 }, scene);
  // security cabin
  boxAt(-8.6, 0.03, 3.0, -6.4, 2.4, 5.0, T.plaster(0xd2c6ae, { tileM: 3, seed: 33 }), scene); boxAt(-8.8, 2.4, 2.8, -6.2, 2.5, 5.2, capM, scene);
  win({ x: -8.2, y: 1.0, w: 1.3, h: 1.0, z: 5.0, cols: 2, frame: 0x2b2d30, glow: 1.3, curtain: 0, roomOpts: { depth: 1.8, side: 0.4 }, floorY: 0.1, ceilY: 2.3 }, scene);
  // street trees, shrubs
  for (const [x, z, s, hh] of [[-14, 9.0, 1, 8], [-3, 9.0, 2, 7.5], [9, 9.0, 3, 8.5], [18, 9.0, 4, 8], [-22, 9, 5, 8]]) tree2(x, z, { h: hh, crown: 3.3, kind: 'neem', seed: s * 5, tint: 0xe9f2d0, trunkR: 0.24 }, scene);
  tree2(-20, -6, { h: 11, crown: 4.5, kind: 'mango', seed: 31, tint: 0xdfe9c4 }, scene); tree2(22, -9, { h: 12, crown: 4.5, kind: 'neem', seed: 32, tint: 0xe3edca }, scene);
  hedge2(-4.5, 6.2, 4.5, 6.2, { h: 0.7, w: 0.6, seed: 5, tint: 0xe4f2cc }, scene);
  for (let i = 0; i < 5; i++) bush2(-11 + i * 5.5, 0.03, 5.4, 0.5, { seed: 40 + i, tint: 0xe6f4d2 }, scene);

  // ------------------------------------------------ neighbours
  const neigh = (x0, x1, nf, tone, seed, depth0) => {
    const g = new THREE.Group(); scene.add(g); const pm = T.plaster(tone, { tileM: 3.2, seed: 50 + seed }), pm2 = T.plaster(0xb59d7e, { tileM: 3.2, seed: 60 + seed });
    const zf = depth0, fh = 3.2, top = nf * fh + 0.6; const nb = Math.round((x1 - x0) / 3.4), bw = (x1 - x0) / nb;
    boxAt(x0, 0, -14, x1, top, zf - 4.6, pm, g);
    for (let k = 0; k < nf; k++) {
      const y0 = 0.3 + k * fh, wins = []; for (let i = 0; i < nb; i++) wins.push({ x: x0 + i * bw + bw * 0.25, y: y0 + 0.9, w: bw * 0.5, h: 1.4, cols: 2, frame: 0x3a3836, seed: seed * 10 + k * 3 + i, glow: R() < 0.3 ? 1.3 : 0, curtain: 0.5, floorY: y0 + 0.05, ceilY: y0 + fh - 0.1, sillMat: capM, roomOpts: { depth: 3.4 } });
      facade({ x0, x1, y0, y1: y0 + fh, zBack: zf - 0.35, t: 0.35, wins, mat: k % 2 ? pm : pm2, parent: g });
      boxAt(x0 - 0.15, y0 + fh - 0.12, zf - 0.35, x1 + 0.15, y0 + fh + 0.12, zf + 0.12, capM, g);
      if (k > 0) for (let i = 0; i < nb; i += 2) { const bx = x0 + i * bw; boxAt(bx + 0.2, y0, zf, bx + bw - 0.2, y0 + 0.16, zf + 1.0, capM, g); railRun(g, [bx + 0.2, zf + 1.0], [bx + bw - 0.2, zf + 1.0], { y: y0 + 0.16, h: 1.0, kind: 'bars', mat: metalB }); if ((i + k) % 3 === 0) ac(bx + 0.4, y0 + 0.18, zf + 0.1, g, {}); }
    }
    boxAt(x0, 0, -14, x0 + 0.3, top, zf, pm, g); boxAt(x1 - 0.3, 0, -14, x1, top, zf, pm, g);
    boxAt(x0 - 0.2, top, -14.2, x1 + 0.2, top + 0.3, zf + 0.2, capM, g); tank(x0 + 4, top + 0.3, -6, g, { r: 0.6, h: 1.2 });
    wallStreaks({ x0, x1, y0: 0.3, y1: top, z: zf, seed: seed + 9, alpha: 0.3, count: 50 }, g); wallFoot({ x0, x1, z: zf, h: 1.0, seed: seed + 11, alpha: 0.35 }, g);
  };
  neigh(-36, -12.4, 3, 0xd8cab0, 1, 0.8); neigh(12.4, 33, 6, 0xcfc8bb, 2, 0.5); neigh(-70, -37, 4, 0xc8b99d, 3, 1.0); neigh(34, 70, 5, 0xd6d0c4, 4, 1.4);
  // utility pole + cables
  const pole = (x, z) => { const m = T.concrete(0x9a9892, { tileM: 2, seed: 18 }); cyl(x, 4.5, z, 0.11, 0.17, 9, m, scene, { seg: 8 }); boxAt(x - 1.1, 8.3, z - 0.05, x + 1.1, 8.4, z + 0.05, metalB, scene); for (const dx of [-1.0, 0, 1.0]) cyl(x + dx, 8.5, z, 0.03, 0.04, 0.2, T.solid(0x6b7a80, { roughness: 0.3 }), scene, { seg: 8 }); };
  pole(-6, 10.2); pole(14, 10.2); pole(34, 10.2);
  const wire = (x0, x1, y, z) => { const pts = []; for (let i = 0; i <= 16; i++) { const t = i / 16; pts.push(new THREE.Vector3(x0 + (x1 - x0) * t, y - Math.sin(t * Math.PI) * 0.7, z)); } const mm = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 32, 0.012, 4), T.solid(0x111111)); scene.add(mm); };
  for (const dx of [-1.0, 0, 1.0]) { wire(-6 + dx, 14 + dx, 8.55, 10.2); wire(14 + dx, 34 + dx, 8.55, 10.2); }
  // street parked cars
  car(scene, -12, 14.6, Math.PI, { color: 0xd6d6d2 }); car(scene, 10, 14.6, 0, { color: 0x3b4a5c });
  car(scene, 18.5, 14.6, Math.PI, { color: 0x6e7479 });

  finish(scene, 1.5);
  const camera = archCamera({ pos: [15, 1.65, 29], target: [-1.5, 1.65, 0], focal: 24, shift: 0.17, w, h });
  return { scene, camera, exposure: 0.34, aoRadius: 0.9, aoStrength: 1.0, bloom: true, bloomStrength: 0.1, bloomRadius: 0.6, bloomThreshold: 5, grade: { contrast: 1.07, saturation: 1.0, vignette: 0.24, grain: 0.014, warm: 0.03 } };
}
