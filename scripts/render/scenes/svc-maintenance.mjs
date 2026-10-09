// svc-maintenance: wall crack repair — chased crack, fresh plaster patch, ladder, toolbox, trowel, putty knife, bucket; soft daylight, medium shot
import { THREE, T, boxAt, wallWithOpenings, windowUnit, ground } from '../lib/arch.mjs';
import { archCamera } from '../lib/env.mjs';
import * as M from '../lib/agent4-mat.mjs';
import * as G from '../lib/agent4-geo.mjs';
import * as L from '../lib/agent4-site.mjs';
import * as R from '../lib/agent4-trade.mjs';
import { hazeEnvironment } from '../lib/agent4-env.mjs';

export default async function build({ renderer, w, h }) {
  const scene = new THREE.Scene();
  hazeEnvironment({ renderer, scene, sunElevation: 46, sunAzimuth: 28, sunIntensity: 3.6, envIntensity: 0.75, shadowExtent: 12, shadowCenter: [3, 1, 1], horizon: [0.98, 0.92, 0.82], zenith: [0.5, 0.62, 0.85], haze: 0.5, glow: 0.2, fogDensity: 0.006, cloud: 0.8, shadowRadius: 8 });
  const rr = G.rng(4);
  const S6 = 6.4;
  const wallMat = M.detailize(M.weatheredPlaster({ base: 0xcfd8cf, under: 0xb5b0a4, seed: 7, size: 2048, tileM: S6, damp: 0.35, peel: 0.3, brickShow: 0.2, grime: 0.8, cracks: 3, moss: 0.25, dampLine: 0.45,
    crackPts: [{ u: 0.66, v: 0.43, ang: 2.2, len: 0.55, w: 0.011 }, { u: 0.505, v: 0.31, ang: 1.9, len: 1.1, w: 0.009 }, { u: 0.62, v: 0.46, ang: 1.0, len: 0.4, w: 0.006 }], rust: [] }).clone(), { scale: 0.9, strength: 0.3, key: 'wm' });
  // wall with a window
  const WL = 6.4, WH = 3.7, Wd = new THREE.Group(); scene.add(Wd);
  const win = { x: 4.1, y: 1.0, w: 1.5, h: 1.5 };
  wallWithOpenings(0, WL, 0.12, WH, -0.23, 0.23, [win], wallMat, Wd); boxAt(0, 0, -1.2, WL, WH, -0.23, wallMat, Wd);
  boxAt(0, 0, -0.26, WL, 0.12, 0.02, M.paintWall(0x6a665f, { seed: 3, tileM: 2 }), Wd);
  windowUnit({ x: win.x, y: win.y, w: win.w, h: win.h, z: 0, frame: 0x4a3a2c, cols: 2, glassMat: T.glass({ tint: 0x25302c, env: 1.5 }), sill: T.stone({ color: 0xa59f90, tileM: 1.4, seed: 4, rows: 3 }), reveal: 0.11, curtain: 0x706a5c }, Wd);
  // lintel line + roof edge
  boxAt(-0.05, WH - 0.2, -0.26, WL + 0.05, WH + 0.15, 0.1, M.paintWall(0xd9dcd2, { seed: 5, tileM: 3 }), Wd);
  // drain pipe + old conduit + switch plate on wall
  R.conduit({ pts: [[0.55, 0.12, 0.05], [0.55, 3.5, 0.05]], r: 0.04, color: 0x8b8f87, parent: Wd });
  R.switchPlate({ x: 1.2, y: 1.25, z: 0.0, parent: Wd, gangs: 2, color: 0xe8e4d6 }); R.conduit({ pts: [[1.2, 1.31, 0.01], [1.2, 2.6, 0.02], [1.9, 3.0, 0.02]], r: 0.009, color: 0xcfcab8, parent: Wd });
  // chased groove (dark channel) from window corner to patch, + repair patches
  { const gm = new G.Mesher(), gc = M.solidMat(0x56524a, { roughness: 1 }); void gc; const pts = [[4.05, 2.52], [3.85, 2.4], [3.7, 2.25], [3.62, 2.1]]; for (let i = 0; i < pts.length - 1; i++) { const a = pts[i], b = pts[i + 1], dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy); gm.box((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, 0.004, 0.035, len + 0.02, 0.006, { rz: Math.atan2(dx, dy) * -1, tile: 0.7, uv: [rr(), rr()] }); } gm.mesh(M.mortar(0x77736a, 4), Wd); }
  const patchShape = (cx, cy, rw, rh, seed) => { const n = G.makeNoise(seed), sh = new THREE.Shape(), N = 28; for (let i = 0; i < N; i++) { const a = (i / N) * Math.PI * 2, c = Math.cos(a), s = Math.sin(a), sx = Math.pow(Math.abs(c), 0.35) * Math.sign(c), sy = Math.pow(Math.abs(s), 0.35) * Math.sign(s), j = 1 + (n(i * 0.7, seed) - 0.5) * 0.14, X = cx + sx * rw * j, Y = cy + sy * rh * j; if (i) sh.lineTo(X, Y); else sh.moveTo(X, Y); } sh.closePath(); return sh; };
  const mkPatch = (cx, cy, rw, rh, seed, mat, depth = 0.012) => { const geo = new THREE.ExtrudeGeometry(patchShape(cx, cy, rw, rh, seed), { depth, bevelEnabled: true, bevelThickness: 0.004, bevelSize: 0.01, bevelSegments: 3 }); geo.translate(0, 0, 0.0); G.worldUV(geo, 2.5); const m = new THREE.Mesh(geo, mat); m.castShadow = true; m.receiveShadow = true; m.position.z = 0.0; Wd.add(m); return m; };
  const freshWet = M.freshPlaster({ color: 0x8f8d86, seed: 16, tileM: 2.5, wet: 0.7 }).clone(), freshDry = M.freshPlaster({ color: 0xa9a79f, seed: 17, tileM: 2.5, wet: 0 }).clone(); freshWet.bumpScale = 0.25; freshDry.bumpScale = 0.25;
  mkPatch(3.2, 1.85, 0.5, 0.55, 3, freshWet, 0.014); mkPatch(2.55, 1.15, 0.28, 0.2, 9, freshDry, 0.01); mkPatch(3.62, 2.12, 0.3, 0.14, 12, freshDry, 0.008);
  // skim of white putty (smooth) next to the patch
  mkPatch(2.4, 2.35, 0.35, 0.26, 5, M.paintWall(0xdcdfd6, { seed: 30, tileM: 1.5, roller: 0.2 }), 0.004);
  // trowel marks / hawk
  { const hk = new THREE.Group(); const board = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.012, 0.3), M.timber({ color: 0xa88e68, seed: 5 }), ); board.castShadow = true; hk.add(board); const hd = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.16, 8), M.timber({ color: 0xa88e68, seed: 6 })); hd.position.set(0, -0.08, 0); hk.add(hd); const mm = new THREE.Mesh(new THREE.SphereGeometry(0.11, 18, 8), M.mortar(0x8c897f, 21)); mm.scale.set(1, 0.4, 1); mm.position.set(0, 0.04, 0); hk.add(mm); hk.position.set(2.3, 0.82, 0.55); hk.rotation.set(0.0, 0.5, 0); void hk; }
  // ground
  const slab = T.paving({ color: 0xa8a396, tileM: 2.2, n: 4, seed: 11 }); ground(-6, -1.2, 16, 9, 0, slab, scene);
  // ladder leaning on wall, left
  R.ladder({ foot: [1.5, 0, 1.85], top: [1.6, 3.3, 0.18], width: 0.46, rungs: 12, type: 'alu', parent: scene });
  // tools
  R.toolbox({ x: 3.0, y: 0.0, z: 1.7, ry: 0.35, parent: scene });
  L.ghamela({ x: 4.4, z: 1.6, fill: 0.7, parent: scene, seed: 3, rad: 0.3 }); R.trowel({ x: 4.2, y: 0.09, z: 1.5, ry: 0.5, parent: scene, rz: -0.12 }); 
  R.puttyKnife({ x: 3.5, y: 0.0, z: 1.15, ry: 0.4, parent: scene }); R.spiritLevel({ x: 2.2, y: 0.0, z: 1.1, ry: 0.0, len: 0.9, parent: scene });
  L.bucket({ x: 5.4, z: 1.4, rad: 0.17, h: 0.34, color: 0xd1a021, fillColor: 0x6c8fa8, fill: 0.8, parent: scene, seed: 4, drips: false }); L.bucket({ x: 5.8, z: 1.9, rad: 0.17, h: 0.34, color: 0xd9d4c8, fillColor: 0xe9e6dc, parent: scene, seed: 5 });
  L.paintTin({ x: 5.0, z: 2.1, rad: 0.12, h: 0.22, color: 0xcfd8cf, band: 0x2b6cb0, parent: scene, seed: 2, open: true, lidOff: true });
  L.cementStack({ x: 7.0, z: 1.3, ry: 0.2, layers: 3, nx: 2, nz: 1, seed: 6, parent: scene, scheme: 3, pallet: false }); L.looseBag({ x: 6.2, z: 2.6, ry: 0.8, parent: scene, seed: 5, scheme: 3 });
  L.debris({ x0: 0, z0: 0.5, x1: 7, z1: 3.5, count: 18, seed: 4, parent: scene });
  // background: street + facing wall
  boxAt(-8, 0, 9, 20, 2.4, 9.25, T.plaster(0xd9cfb8, { tileM: 3, seed: 40 }), scene); boxAt(-8, 0, -1.2, -0.0, 3.7, 0, wallMat, scene);
  L.neighbourHouse({ x: -2, z: 24, w: 12, d: 12, floors: 3, color: 0xdcd2bb, seed: 3, parent: scene, trim: 0x8a8070, ry: 0, gate: false });
  const camera = archCamera({ pos: [0.9, 1.5, 4.9], target: [3.7, 1.5, 0], focal: 30, shift: 0.02, w, h });
  return { scene, camera, exposure: 0.6, aoRadius: 0.4, aoStrength: 1.1, grade: { contrast: 1.1, saturation: 1.08, vignette: 0.26, grain: 0.02, warm: 0.02 } };
}
