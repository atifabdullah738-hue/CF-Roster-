// svc-grey-structure: roof-slab casting prep — shuttering, dense rebar mesh, beam cages, starter bars, brick wall, steel bundles; low backlit sun
import { THREE, T, boxAt } from '../lib/arch.mjs';
import { archCamera } from '../lib/env.mjs';
import { tree } from '../lib/nature.mjs';
import * as M from '../lib/agent4-mat.mjs';
import * as G from '../lib/agent4-geo.mjs';
import * as S from '../lib/agent4-struct.mjs';
import * as L from '../lib/agent4-site.mjs';
import { hazeEnvironment } from '../lib/agent4-env.mjs';

export default async function build({ renderer, w, h }) {
  const scene = new THREE.Scene();
  hazeEnvironment({ renderer, scene, sunElevation: 13, sunAzimuth: 118, sunIntensity: 7.5, sunColor: 0xffc58a, envIntensity: 0.6, shadowExtent: 22, shadowCenter: [3, 3, -2], horizon: [1.2, 0.84, 0.54], zenith: [0.36, 0.5, 0.78], ground: [0.5, 0.4, 0.3], glow: 1.1, disc: 5, haze: 0.45, cloud: 0.35, fogDensity: 0.011, sunCol: [1.0, 0.7, 0.4] });
  const rr = G.rng(5);
  const soilM = () => M.detailize(M.soil().clone(), { scale: 1.1, strength: 0.75, key: 'soilD' });
  G.terrain({ x0: -30, z0: -35, x1: 40, z1: 25, y: 0, mat: soilM(), parent: scene, res: 0.5, amp: 0.05, seed: 3 });
  { const far = new THREE.Mesh(new THREE.PlaneGeometry(1600, 1600), soilM()); far.rotation.x = -Math.PI / 2; far.position.y = -0.06; far.receiveShadow = true; const p = far.geometry.attributes.position, uv = far.geometry.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, p.getX(i) / 10, -p.getY(i) / 10); scene.add(far); }

  const rccCol = M.detailize(M.rcc({ seed: 5, color: 0xa7a59e }).clone(), { scale: 1.6, strength: 0.45, key: 'rc1' });
  const rccBeam = M.detailize(M.rcc({ seed: 9, color: 0x9f9d96 }).clone(), { scale: 1.4, strength: 0.45, key: 'rc2' });
  const clay = M.clay(); M.detailize(clay, { strength: 0.0, dustH: 0.6, dustColor: 0xa28b6e, dustAmt: 0.5, key: 'clayD' });
  const mortar = M.detailize(M.mortar(0x938e83, 3).clone(), { scale: 2.4, strength: 0.4, key: 'mortD' });

  const Y = 3.2, X1 = 7.2, Z0 = -5.6;           // deck top, slab extents x 0..X1, z Z0..0
  const beams = [[0, 'x'], [Z0 + 0.23, 'x'], [0, 'z'], [X1 - 0.23, 'z'], [3.5, 'z']]; void beams;
  const bx = [[0.0, 0.23, 'z0'], [X1 - 0.23, X1, 'z0']]; void bx;
  // beam strips (holes in deck): front/back along x, left/right/mid along z
  const holes = [[0, -0.23, X1, 0], [0, Z0, X1, Z0 + 0.23], [0, Z0, 0.23, 0], [X1 - 0.23, Z0, X1, 0], [3.4, Z0, 3.63, 0]];
  const ms = S.shutterMeshers();
  S.slabDeck({ x0: -0.05, z0: Z0 - 0.05, x1: X1 + 0.05, z1: 0.05, yTop: Y, ms, seed: 4, propPitch: 1.15, holes: [], balli: 0.3 });
  // beam troughs: sides in ply, floor, cages
  const rb = new S.Rebar(7, 0.55), rbTop = new S.Rebar(9, 0.5);
  const beamTrough = (x0, z0, x1, z1) => {
    const alongX = (x1 - x0) > (z1 - z0), L0 = alongX ? x1 - x0 : z1 - z0, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, bd = 0.45;
    const sideC = alongX ? [[cx, Y - bd / 2 + 0.065, z0 - 0.009], [cx, Y - bd / 2 + 0.065, z1 + 0.009]] : [[x0 - 0.009, Y - bd / 2 + 0.065, cz], [x1 + 0.009, Y - bd / 2 + 0.065, cz]];
    for (const c of sideC) ms.ply.box(c[0], c[1], c[2], alongX ? L0 : 0.018, bd + 0.13, alongX ? 0.018 : L0, { tile: [Math.max(L0, 1.2), 0.6], uv: [rr(), 0] });
    // cage: 4 corner bars + 2 mid, stirrups
    const w0 = 0.23 - 0.07, d0 = bd - 0.08, yb = Y - bd + 0.05;
    for (const [dy, dw] of [[0, -1], [0, 1], [d0, -1], [d0, 1], [d0 / 2, -1], [d0 / 2, 1]]) { const off = dw * w0 / 2; if (alongX) rb.bar([x0, yb + dy, cz + off], [x1 + 0.9, yb + dy, cz + off], 0.02); else rb.bar([cx + off, yb + dy, z0], [cx + off, yb + dy, z1 + 0.9], 0.02); }
    for (let t = 0.08; t < L0; t += 0.14) { const pts = [], hw = w0 / 2 + 0.006, y0 = yb - 0.006, y1 = yb + d0 + 0.006; const P = (a, y) => (alongX ? [x0 + t, y, cz + a] : [cx + a, y, z0 + t]); for (const [a, y] of [[-hw, y0], [hw, y0], [hw, y1], [-hw, y1]]) pts.push(P(a, y)); rb.poly(pts, 0.008, { closed: true, sides: 5 }); }
    ms.ply.box(cx, Y - bd - 0.009, cz, alongX ? L0 : 0.25, 0.018, alongX ? 0.25 : L0, { tile: [1.2, 0.6] });
  };
  beamTrough(0, -0.23, X1, 0); beamTrough(0, Z0, X1, Z0 + 0.23); beamTrough(0, Z0 + 0.23, 0.23, -0.23); beamTrough(X1 - 0.23, Z0 + 0.23, X1, -0.23); beamTrough(3.4, Z0 + 0.23, 3.63, -0.23);
  // bottom + top mats with holes at beams; stair void
  const mh = [...holes.map((q) => [q[0], q[1], q[2], q[3]]), [5.2, -4.2, 6.7, -2.8]];
  rb.mat({ x0: 0.3, z0: Z0 + 0.3, x1: X1 - 0.3, z1: -0.3, y: Y + 0.035, pitchX: 0.15, pitchZ: 0.15, dia: 0.012, holes: mh, rust: 0.6, tieEvery: 2 });
  rb.mat({ x0: 0.3, z0: Z0 + 0.3, x1: X1 - 0.3, z1: -0.3, y: Y + 0.115, pitchX: 0.2, pitchZ: 0.2, dia: 0.01, holes: mh, rust: 0.7, tieEvery: 3 });
  // extra top bars over supports
  for (let i = 0; i < 12; i++) rb.bar([3.5 - 0.9, Y + 0.145, -0.45 - i * 0.43], [3.5 + 0.9, Y + 0.145, -0.45 - i * 0.43], 0.012);
  // chair bars (inverted U) and cover blocks
  { const cm = new G.Mesher(); for (let x = 0.7; x < X1 - 0.5; x += 0.8) for (let z = Z0 + 0.6; z < -0.4; z += 0.8) { if (mh.some((q) => x > q[0] && x < q[2] && z > q[1] && z < q[3])) continue; rb.poly([[x - 0.1, Y + 0.047, z], [x - 0.1, Y + 0.115, z], [x + 0.1, Y + 0.115, z], [x + 0.1, Y + 0.047, z]], 0.008, { sides: 5, rust: 0.7 }); cm.box(x, Y + 0.02, z + 0.07, 0.05, 0.04, 0.05, { tile: 0.5, uv: [rr(), rr()] }); } cm.mesh(M.mortar(0x9a968c, 5), scene); }
  rb.mesh(scene);
  // columns below the deck (visible at the edges) and starter bars above
  const cols = [[0.15, -0.15], [X1 - 0.15, -0.15], [0.15, Z0 + 0.15], [X1 - 0.15, Z0 + 0.15], [3.52, -0.15], [3.52, Z0 + 0.15]];
  const st = new S.Rebar(13, 0.75);
  for (const [cx, cz] of cols) { boxAt(cx - 0.15, 0, cz - 0.15, cx + 0.15, Y - 0.45, cz + 0.15, rccCol, scene); st.column({ x: cx, z: cz, w: 0.3, d: 0.3, y0: Y - 0.3, y1: Y + 0.3, ext: 0.85, nx: 2, nz: 3, dia: 0.016, pitch: 0.16, rust: 0.7, bend: 0.1 }); }
  // props under the beams around the edge (visible below the deck)
  st.mesh(scene);
  // column shutter box on one starter (ready to cast)
  S.columnForm({ x: 3.52, z: Z0 + 0.15, w: 0.3, d: 0.3, y0: Y + 0.0, y1: Y + 1.1, ms, seed: 2 });
  S.flushShutter(ms, scene);
  // brick wall rising on the right edge (racked)
  { const g = S.brickWall({ len: 4.2, hgt: 2.0, t: 0.23, bond: 'english', seed: 5, clayMat: clay, mortarMat: mortar, ranges: S.racked({ len: 4.2, from: 'left', step: 0.12, topC: 23, maxC: 23 }) }); S.place(g, X1, Y + 0.0, Z0 + 0.35, -Math.PI / 2, scene); }
  { const g = S.brickWall({ len: 3.2, hgt: 1.0, t: 0.23, bond: 'english', seed: 6, clayMat: clay, mortarMat: mortar, ranges: S.racked({ len: 3.2, from: 'right', step: 0.12, topC: 12, maxC: 12 }) }); S.place(g, 0.4, Y, Z0 + 0.23, Math.PI, scene); g.position.set(3.8, Y, Z0 + 0.23 - 0.0); }
  // working platform (foreground left) + materials
  { const pm = new G.Mesher(); for (let k = 0; k < 14; k++) pm.box(-3.2, Y - 0.02, -4.9 + k * 0.255 + 0.0, 5.0, 0.04, 0.24, { tile: 2.5, uv: [rr(), rr()], ry: (rr() - 0.5) * 0.01 }); pm.mesh(M.timber({ color: 0xcdb48c, seed: 17, weather: 1, splatter: 0.7, knots: 7 }), scene);
    for (const z of [-4.7, -2.4, -0.2]) { const t = new G.Mesher(); t.box(-3.2, Y - 0.12, z, 5.0, 0.1, 0.1, { tile: 2.5 }); t.mesh(M.timber({ color: 0x8a6e4a, seed: 9, weather: 1 }), scene); } }
  S.barBundle({ x: -3.0, y: Y, z: -1.6, len: 6, dia: 0.02, rows: 5, ry: 0.08, parent: scene, seed: 3, rust: 0.6 });
  S.barBundle({ x: -3.0, y: Y, z: -3.3, len: 6, dia: 0.016, rows: 4, ry: -0.05, parent: scene, seed: 6, rust: 0.45 });
  L.bucket({ x: -1.2, y: Y, z: -0.2, rad: 0.15, color: 0xc9a227, parent: scene, seed: 2 });
  { const tw = new G.Mesher(), pts = []; for (let i = 0; i <= 90; i++) { const a = i / 90 * 6.283 * 6; pts.push([-0.8 + Math.cos(a) * 0.1, Y + 0.05 + (i / 90) * 0.04 + Math.sin(a * 0.5) * 0.002, -3.8 + Math.sin(a) * 0.1 + 0.0]); } tw.path(pts, 0.003, { sides: 4, color: G.lin(0x2b2b2b) }); tw.mesh(M.solidMat(0xffffff, { roughness: 0.5, metalness: 0.7, vertexColors: true }), scene); }
  L.brickStack({ x: -0.9, z: -2.6, y: Y, layers: 6, la: [3, 5], lb: [3, 6], seed: 2, parent: scene });
  L.ghamela({ x: 6.7, z: -0.7, y: Y, fill: 0.7, parent: scene, seed: 5, rad: 0.3 }); 
  // tall props under the slab edge are inside deck builder; scaffold posts for the platform
  // background
  L.neighbourHouse({ x: -22, z: -22, w: 11, d: 12, floors: 3, color: 0xe3d7bd, seed: 2, parent: scene, trim: 0x938a7a, gate: false });
  L.neighbourHouse({ x: 8, z: -26, w: 12, d: 12, floors: 2, color: 0xd9cfb4, seed: 3, parent: scene, trim: 0x877c6a, gate: false });
  L.neighbourHouse({ x: 26, z: -22, w: 10, d: 12, floors: 3, color: 0xe6dcc6, seed: 4, parent: scene, trim: 0x8a7f6d, gate: false });
  L.neighbourHouse({ x: -8, z: -40, w: 12, d: 12, floors: 3, color: 0xd6cbb2, seed: 5, parent: scene, trim: 0x877c6a, gate: false });
  tree(-12, -12, { h: 9, crown: 4, seed: 4, color: 0x5a7a3a }, scene); tree(17, -12, { h: 10, crown: 4.4, seed: 7, color: 0x587838 }, scene); tree(30, -6, { h: 11, crown: 4.6, seed: 9, color: 0x56763a }, scene);
  L.dryGrass({ x0: -10, z0: -20, x1: 20, z1: 10, count: 500, scale: [0.12, 0.3], seed: 3, parent: scene });
  L.debris({ x0: -6, z0: -12, x1: 14, z1: 8, count: 80, seed: 3, parent: scene, avoid: (x, z) => x > -0.5 && x < X1 + 0.5 && z < 0.5 && z > Z0 - 0.5 });
  const camera = archCamera({ pos: [0.3, Y + 1.1, 2.6], target: [4.4, Y + 1.1, -3.6], focal: 23, shift: -0.1, w, h });
  return { scene, camera, exposure: 0.72, aoRadius: 0.5, aoStrength: 1.0, bloom: true, bloomStrength: 0.18, bloomThreshold: 3.0, bloomRadius: 0.6, grade: { contrast: 1.14, saturation: 1.12, vignette: 0.32, grain: 0.02, warm: 0.04 } };
}
