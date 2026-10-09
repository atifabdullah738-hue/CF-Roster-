import { THREE, T, boxAt } from '../lib/arch.mjs';
import { setupEnvironment, archCamera } from '../lib/env.mjs';
import * as M from '../lib/agent4-mat.mjs';
import * as G from '../lib/agent4-geo.mjs';
import * as S from '../lib/agent4-struct.mjs';
import { hazeEnvironment } from '../lib/agent4-env.mjs';

export default async function build({ renderer, w, h }) {
  const scene = new THREE.Scene();
  hazeEnvironment({ renderer, scene, sunElevation: 34, sunAzimuth: 50, sunIntensity: 4.6, envIntensity: 0.5, shadowExtent: 18, shadowCenter: [0, 0, 0] });
  const soil = M.soil(); M.detailize(soil, { scale: 1.2, strength: 0.7 });
  G.terrain({ x0: -40, z0: -40, x1: 40, z1: 40, y: 0, mat: soil, parent: scene, res: 0.5, amp: 0.05 });
  const clay = M.clay(); M.detailize(clay, { scale: 1, strength: 0.0, dustH: 0.5, key: 'clay' });
  const w1 = S.brickWall({ len: 6, hgt: 2.0, t: 0.23, bond: 'english', back: true, openings: [{ u0: 1.5, u1: 2.7, v0: 0.9, v1: 1.8 }], ranges: S.racked({ len: 6, from: 'right', maxC: 23 }), seed: 3, parent: scene });
  S.place(w1, -3, 0, 0);
  const rcc = M.rcc(); M.detailize(rcc, { scale: 1.5, strength: 0.4 });
  S.column({ x: -3.3, z: -0.1, y1: 3.2, mat: rcc, parent: scene });
  const rb = new S.Rebar(2, 0.6); rb.column({ x: -3.3, z: -0.1, y0: 3.2, y1: 3.2, ext: 0.9, nx: 2, nz: 3 }); rb.mesh(scene);
  const rm = new S.Rebar(5, 0.5); rm.mat({ x0: 3, z0: -4, x1: 8, z1: 0, y: 3.0, pitchX: 0.15, pitchZ: 0.15, dia: 0.012 }); rm.mesh(scene);
  const ms = S.shutterMeshers(); S.slabDeck({ x0: 3, z0: -4, x1: 8, z1: 0, yTop: 2.95, ms, seed: 2 }); S.flushShutter(ms, scene);
  const sm = S.scaffoldMeshers(); S.steelScaffold({ x0: -8, x1: -4, z: 2, depth: 1.2, height: 5, boards: [0, 1], sm, seed: 3 }); S.bambooScaffold({ x0: 9, x1: 13, z: 1, height: 5, levels: [2, 4], sm, seed: 4 }); S.flushScaffold(sm, scene);
  const sandM = M.sand(); M.detailize(sandM, { scale: 3, strength: 0.4 });
  const hp = G.heap({ x: 0, z: 4, rx: 2.4, rz: 1.8, h: 1.3, seed: 4, mat: sandM, parent: scene });
  const gm = M.gravel(); const hp2 = G.heap({ x: 5, z: 5, rx: 2.2, rz: 1.6, h: 1.1, seed: 9, mat: gm, parent: scene, tile: 1.2 });
  const st = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9, vertexColors: false }); G.stonesOnHeap(hp2, { count: 5000, mat: st, parent: scene });
  const camera = archCamera({ pos: [3, 1.7, 14], target: [2, 1.7, 0], focal: 24, shift: 0.0, w, h, keepLevel: true });
  return { scene, camera, exposure: 0.5, aoRadius: 0.5 };
}
