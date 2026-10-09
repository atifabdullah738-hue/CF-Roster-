// svc-plumbing-electrical: brick wall with open chases showing copper/PVC pipes, tap, conduit + wiring, switch boxes, distribution board; work-light lit
import { THREE, T, boxAt, ground } from '../lib/arch.mjs';
import { archCamera } from '../lib/env.mjs';
import * as M from '../lib/agent4-mat.mjs';
import * as G from '../lib/agent4-geo.mjs';
import * as S from '../lib/agent4-struct.mjs';
import * as L from '../lib/agent4-site.mjs';
import * as R from '../lib/agent4-trade.mjs';
import { hazeEnvironment } from '../lib/agent4-env.mjs';

export default async function build({ renderer, w, h }) {
  const scene = new THREE.Scene();
  hazeEnvironment({ renderer, scene, sunElevation: 30, sunAzimuth: 70, sunIntensity: 0.5, envIntensity: 0.13, shadowExtent: 6, shadowCenter: [1.1, 0.9, 0.5], horizon: [0.5, 0.45, 0.4], zenith: [0.3, 0.33, 0.4], fogDensity: 0, glow: 0, cloud: 0, shadowRadius: 5 });
  const rr = G.rng(9);
  const clay = M.clay(); M.detailize(clay, { strength: 0.0, dustH: 0.0, key: 'clayP' });
  const mortar = M.detailize(M.mortar(0x8f8a80, 3).clone(), { scale: 3, strength: 0.4, key: 'mortP' });
  const WL = 2.6, WH = 1.9;
  const chases = [
    { u0: 0.55, u1: 0.7, v0: 0.0, v1: 1.15, d: 0.04 },       // vertical water supply
    { u0: 0.55, u1: 1.62, v0: 1.12, v1: 1.26, d: 0.04 },     // horizontal run
    { u0: 1.5, u1: 1.62, v0: 0.62, v1: 1.26, d: 0.04 },      // drop to switch box
    { u0: 0.9, u1: 1.0, v0: 0.2, v1: 1.15, d: 0.04 },        // second vertical (drain/cold)
    { u0: 1.37, u1: 1.44, v0: 1.26, v1: 1.9, d: 0.04 },      // conduit up
  ];
  const openings = [{ u0: 1.44, u1: 1.78, v0: 0.5, v1: 0.74 }, { u0: 0.46, u1: 0.78, v0: 0.2, v1: 0.3 }];
  const wall = S.brickWall({ len: WL, hgt: WH, t: 0.23, bond: 'english', chases, openings: [], seed: 14, clayMat: clay, mortarMat: mortar, palette: { base: 0x8c4e3b, light: 0xa56a4d, dark: 0x663d34 } }); void openings;
  scene.add(wall);
  // plastered zones with raw edges
  const pl = M.detailize(M.freshPlaster({ color: 0xa9a59a, seed: 31, tileM: 2, wet: 0.2 }).clone(), { scale: 1.5, strength: 0.4, key: 'plP' });
  const plF = (x0, y0, x1, y1, th = 0.018) => { boxAt(x0, y0, -0.003, x1, y1, th, pl, scene); };
  plF(-0.05, -0.05, 0.28, WH + 0.05); plF(0.28, 1.6, 0.9, WH + 0.05, 0.016); plF(1.95, -0.05, WL + 0.05, WH + 0.05); plF(1.78, 1.45, 1.95, WH + 0.05, 0.016);
  // floor, dust, back-fill: rough concrete floor + rubble
  ground(-4, -3, 6, 4, -0.0, T.concrete(0x8f8c85, { tileM: 2, seed: 13 }), scene);
  // ---------------- plumbing: copper vertical pair in chase 1, horizontal copper, tee, elbow, tap
  const cu = R.MAT.copper(), cuO = R.MAT.copperOld(), chrome = R.MAT.chrome(), brass = R.MAT.brass(), pvcW = R.MAT.pvcWhite(), pvcG = R.MAT.pvcGrey();
  const zP = -0.012; // pipe axis z inside the chase (15 mm pipes in 40 mm deep chase)
  R.pipe({ a: [0.595, 0.02, zP], b: [0.595, 1.19, zP], r: 0.0079, mat: cu, parent: scene, collars: [0.2, 0.55], collarMat: cuO, cr: 0.0105 });
  R.pipe({ a: [0.655, 0.02, zP], b: [0.655, 1.19, zP], r: 0.0079, mat: cu, parent: scene, collars: [0.35, 0.8], collarMat: cuO, cr: 0.0105 });
  R.elbow({ p: [0.595, 1.19, zP], from: [0, -1, 0], to: [1, 0, 0], r: 0.0079, mat: cu, parent: scene, collarMat: cuO });
  R.pipe({ a: [0.645, 1.19, zP], b: [1.55, 1.19, zP], r: 0.0079, mat: cu, parent: scene, collars: [0.3], cr: 0.0105, collarMat: cuO });
  R.tee({ p: [0.9, 1.19, zP], axis: [1, 0, 0], branch: [0, -1, 0], r: 0.0079, len: 0.05, mat: cuO, parent: scene });
  R.pipe({ a: [0.95, 0.2, zP], b: [0.95, 1.17, zP], r: 0.0155, mat: pvcG, parent: scene, collars: [0.0, 0.5, 1.0], cr: 0.0215, collarMat: pvcG });
  // tap stub through wall with flange: pipe elbow forward from the vertical copper at y=0.62
  R.pipe({ a: [0.655, 0.62, zP], b: [0.655, 0.62, 0.04], r: 0.0079, mat: cu, parent: scene });
  R.elbow({ p: [0.655, 0.62, 0.05], from: [0, 0, -1], to: [0, 1, 0], r: 0.0079, mat: brass, parent: scene });
  R.valve({ x: 0.655, y: 0.34, z: zP, parent: scene, axis: [0, 1, 0] });
  R.tap({ x: 0.655, y: 0.44, z: 0.052, parent: scene, ry: 0, mat: chrome });
  // water droplet beads on the tap and a tiny leak mark
  R.droplets({ x0: 0.64, z0: 0.06, x1: 0.67, z1: 0.14, y: 0.4, count: 5, rad: [0.002, 0.004], parent: scene, seed: 3 });
  // pipe clips along the vertical
  for (const y of [0.15, 0.45, 0.95]) { const c = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.012, 0.012), M.steel(0xb8bbbd, { roughness: 0.3 })); c.position.set(0.625, y, -0.004); scene.add(c); }
  // ---------------- electrical: PVC conduit in horizontal + drop chase, switch box, DB
  R.conduit({ pts: [[1.405, 1.9, -0.015], [1.405, 1.31, -0.015], [1.405, 1.25, -0.015]], r: 0.0105, color: 0xe9e7df, parent: scene });
  R.conduit({ pts: [[1.405, 1.25, -0.015], [1.4, 1.2, -0.012], [1.36, 1.17, -0.012], [0.98, 1.2, -0.012]], r: 0.0105, color: 0xe9e7df, parent: scene }); // junction run (white conduit)
  R.conduit({ pts: [[1.56, 1.2, -0.012], [1.56, 0.9, -0.012], [1.56, 0.7, -0.012]], r: 0.0105, color: 0xe9e7df, parent: scene });
  R.openBox({ x: 1.56, y: 0.62, z: -0.02, w: 0.075, h: 0.075, d: 0.05, parent: scene });
  // wires hanging out of the box + loop
  const wc = [0xc4291b, 0x1a1a1a, 0x2f7d36, 0xe2b81f];
  wc.forEach((c, i) => { const pts = []; for (let k = 0; k <= 14; k++) { const t = k / 14; pts.push([1.545 + i * 0.008 + Math.sin(t * 5 + i) * 0.006, 0.66 - t * 0.14 * (1 + i * 0.2) - Math.sin(t * Math.PI) * 0.02, -0.002 + t * 0.06 * (1 - i * 0.1)]); } R.wirePath({ pts, r: 0.0022, color: c, parent: scene }); });
  // wires visible inside the horizontal chase (3 cores) next to conduit
  [0xc4291b, 0x1a1a1a].forEach((c, i) => R.wirePath({ pts: [[1.4, 1.31 + i * 0.006, -0.005], [1.2, 1.234 + i * 0.005, -0.006], [0.98, 1.24, -0.006]], r: 0.0019, color: c, parent: scene }));
  // surface switch plates (finished area on the right) & DB with door open
  R.switchPlate({ x: 2.2, y: 1.05, z: 0.02, parent: scene, gangs: 3, color: 0xefede6 }); R.switchPlate({ x: 2.2, y: 0.4, z: 0.02, parent: scene, gangs: 2, color: 0xefede6 });
  R.distributionBoard({ x: 2.28, y: 1.5, z: 0.02, parent: scene, rows: 2, mods: 8, door: true });
  R.conduit({ pts: [[2.0, 1.12, 0.04], [2.05, 1.13, 0.04], [2.1, 1.3, 0.04]], r: 0.01, color: 0xe9e7df, parent: scene });
  // junction box on the plaster + conduit
  R.junctionBox({ x: 0.14, y: 1.02, z: 0.03, parent: scene, w: 0.09, h: 0.09, d: 0.05, color: 0xcfccc3 }); R.conduit({ pts: [[0.14, 1.0, 0.03], [0.14, 0.2, 0.03]], r: 0.0105, color: 0xe9e7df, parent: scene });
  R.wirePath({ pts: [[0.14, 1.0, 0.05], [0.2, 0.98, 0.15], [0.3, 0.8, 0.25], [0.5, 0.5, 0.35], [0.8, 0.35, 0.5]], r: 0.004, color: 0x1a1a1a, parent: scene });
  // ---------------- floor props: chiselled debris, pipe wrench, coil, tape, offcuts
  L.brickPile({ x: 0.4, z: 0.45, rad: 0.22, h: 0.05, count: 8, seed: 4, parent: scene, broken: 0.6 }); L.debris({ x0: 0.1, z0: 0.15, x1: 2.4, z1: 1.2, count: 24, seed: 6, parent: scene });
  { const dust = new THREE.Mesh(new THREE.CircleGeometry(0.5, 24), M.solidMat(0x8f7b66, { roughness: 1 })); dust.rotation.x = -Math.PI / 2; dust.position.set(0.8, 0.003, 0.3); dust.scale.set(1.3, 0.7, 1); scene.add(dust); }
  { const m = new G.Mesher(), pts = []; for (let i = 0; i <= 120; i++) { const a = (i / 120) * 6.283 * 5, rad = 0.12 - i * 0.0004; pts.push([1.7 + Math.cos(a) * rad, 0.011 + Math.floor(i / 24) * 0.0 + (i % 24) * 0.0001, 0.7 + Math.sin(a) * rad]); } m.path(pts, 0.0079, { sides: 8 }); m.mesh(cu, scene); }
  { const wr = new G.Mesher(); wr.tube([2.0, 0.015, 0.6], [2.5, 0.015, 0.9], 0.012, { sides: 8, color: G.lin(0xb33a2a) }); wr.box(2.5, 0.025, 0.9, 0.06, 0.05, 0.03, { color: G.lin(0x8a8d90), ry: 0.6 }); wr.mesh(M.solidMat(0xffffff, { roughness: 0.4, metalness: 0.7, vertexColors: true }), scene); }
  { const t = new THREE.Mesh(new THREE.TorusGeometry(0.03, 0.012, 8, 20), M.solidMat(0x1b1b1b, { roughness: 0.6 })); t.rotation.x = -Math.PI / 2; t.position.set(1.2, 0.014, 0.9); scene.add(t); }
  R.puttyKnife({ x: 0.3, y: 0.0, z: 0.8, ry: 0.4, parent: scene }); R.trowel({ x: 1.3, y: 0.0, z: 1.15, ry: 1.4, parent: scene, mortar: false });
  // ledge with a bucket of mortar and plastic offcuts
  L.bucket({ x: 2.7, z: 0.9, rad: 0.17, h: 0.34, color: 0x2a2a2a, parent: scene, seed: 3, metal: true });
  // ---------------- work light (LED flood on tripod, left of frame) — real light + visible fixture
  const spot = new THREE.SpotLight(0xfff0d8, 60, 8, 0.75, 0.6, 1.6); spot.position.set(-1.5, 1.45, 0.95); spot.target.position.set(1.15, 0.85, 0); spot.castShadow = true; spot.shadow.mapSize.set(2048, 2048); spot.shadow.bias = -0.0003; spot.shadow.normalBias = 0.01; spot.shadow.radius = 4; scene.add(spot, spot.target);
  const fill = new THREE.PointLight(0xffe0b8, 3.2, 6, 1.7); fill.position.set(1.2, 1.9, 1.6); scene.add(fill);
  { const g = new THREE.Group(), lamp = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.26, 0.05), M.solidMat(0x222426, { roughness: 0.5, metalness: 0.5 })); g.add(lamp); const face = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.22), M.solidMat(0xffffff, { roughness: 0.5, emissive: 0xfff4de, emissiveIntensity: 6 })); face.position.z = 0.026; g.add(face); const st = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 1.5, 8), M.steel(0x777777)); st.position.set(0, -0.8, -0.02); g.add(st); g.position.set(-1.2, 1.55, 1.6); g.lookAt(1.1, 0.9, 0); scene.add(g); }
  const camera = archCamera({ pos: [1.28, 0.95, 1.5], target: [1.28, 0.95, 0], focal: 28, shift: 0.0, w, h });
  return { scene, camera, exposure: 0.62, aoRadius: 0.2, aoStrength: 1.2, bloom: true, bloomStrength: 0.12, bloomThreshold: 4, grade: { contrast: 1.12, saturation: 1.1, vignette: 0.34, grain: 0.022, warm: 0.03 } };
}
