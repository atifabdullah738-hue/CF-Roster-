import * as I from '../lib/agent3-interior.mjs';
const { THREE, T, bx, rbox, softBox, buildRoom, gardenView, curtainSet, interiorEnvironment, marbleMat, woodMat, fabricMat, paintMat, glow, point, place, brassMat, blackMetal, steelMat, ceramicMat, rod, cylY, finishScene } = I;
import { setupEnvironment, archCamera } from '../lib/env.mjs';

export default async function build({ renderer, w, h }) {
  const scene = new THREE.Scene();
  const X0 = -3.2, X1 = 3.2, Z0 = -3.4, Z1 = 3.0, H = 3.0;
  const env = setupEnvironment({ renderer, scene, sunElevation: 27, sunAzimuth: 248, turbidity: 3, sunIntensity: 11, sunColor: 0xffecd2, envIntensity: 0.1, shadowExtent: 8, shadowCenter: [0, 1, -0.5] });
  env.light.shadow.radius = 4;
  interiorEnvironment({ renderer, scene, W: 6.4, H, D: 6.4, wall: 0xcfcac0, floor: 0x9a968e, ceil: 0xe8e4dc, wallLum: 0.5, floorLum: 0.35, ceilLum: 0.7, windows: [{ side: '-x', c: -0.5, w: 2.6, yb: 0.2, yt: 2.5, lum: 6 }], intensity: 0.8 });
  const screed = T.concrete(0xa9a69f, { tileM: 2.5, seed: 9, roughness: 0.92 });
  const rawWall = T.plaster(0xb9b6af, { tileM: 2.5, seed: 17, roughness: 0.95 }); rawWall.bumpScale = 0.3;
  const paintedWall = paintMat(0xf1ede4, { seed: 5 });
  const room = buildRoom(scene, { x0: X0, x1: X1, z0: Z0, z1: Z1, H, mats: { floor: screed, wall: rawWall, left: paintedWall, skirt: false }, openings: { left: [{ c: -0.5, w: 2.6, y: 0.2, h: 2.3, type: 'window', panels: 2, frame: 0x2a2d31, sill: false }] }, ceiling: { tray: true, band: 0.8, drop: 0.2, ledColor: 0xffd49a, ledIntensity: 1.2, glowW: 1.2 }, ceilEmissive: 0.2 });
  gardenView(room, 'left', { dim: 0.5, depthWall: 14, trees: false });
  // painted half of back wall (left) as an overlay slab; the right part stays raw plaster
  bx(scene, X0, 0, Z0, 0.4, H, Z0 + 0.004, paintedWall);
  const tape = T.solid(0xd9c27a, { roughness: 0.8 }); bx(scene, 0.4, 0, Z0 + 0.0, 0.43, H, Z0 + 0.006, tape);
  // ---- tiling in progress: slabs laid on the right part, staggered edge
  const slab = marbleMat({ base: 0xebe5d6, vein: 0x8d857a, veinAlt: 0xb59b62, slab: 0.8, n: 3, seed: 5, contrast: 1.1, freq: 1.0, veinPow: 30, groutPx: 0.2, rough: 0.12 });
  const bed = T.solid(0x8a8780, { roughness: 1 }); bx(scene, 0.55, 0.0, Z0, X1, 0.012, 1.6, bed, { cast: false });
  const S = 0.8, g = 0.004;
  for (let ix = 0; ix < 4; ix++) for (let iz = 0; iz < 7; iz++) {
    const x = 0.6 + ix * S, z = Z0 + 0.02 + iz * S; if (x + S > X1 + 0.05) continue;
    if (iz === 6 && ix > 1) continue; // unfinished corner
    if (iz === 5 && ix > 2) continue;
    bx(scene, x, 0.012, z, x + S - g, 0.032, z + S - g, slab);
  }
  // bedding mortar patch with ridged trowel marks
  const mortar = T.solid(0x9b978e, { roughness: 1 }); for (let k = 0; k < 16; k++) bx(scene, 1.0 + k * 0.05, 0.012, 1.45 - 0.0, 1.0 + k * 0.05 + 0.022, 0.03, 1.45 + 0.8, mortar, { cast: false });
  // spacers
  const sp = T.solid(0x151515, { roughness: 0.6 });
  for (let i = 0; i < 18; i++) { const x = 0.6 + (i % 5) * 0.8 + 0.8 - 0.002, z = Z0 + 0.02 + Math.floor(i / 5) * 0.8 + 0.8 - 0.002; bx(scene, x - 0.012, 0.032, z - 0.002, x + 0.012, 0.034, z + 0.002, sp, { cast: false }); bx(scene, x - 0.002, 0.032, z - 0.012, x + 0.002, 0.034, z + 0.012, sp, { cast: false }); }
  // tile cartons
  const carton = T.solid(0xb89a6a, { roughness: 0.9 });
  const printed = T.solid(0xe4d8bd, { roughness: 0.8 });
  for (let k = 0; k < 4; k++) { bx(scene, -2.9 + (k % 2) * 0.0, k * 0.22, -3.0 + (k % 2) * 0.06, -2.0, k * 0.22 + 0.22, -2.55 + (k % 2) * 0.06, carton); bx(scene, -2.9, k * 0.22 + 0.09, -2.55 + (k % 2) * 0.06, -2.0, k * 0.22 + 0.13, -2.549 + (k % 2) * 0.06, printed, { cast: false }); }
  for (let k = 0; k < 2; k++) bx(scene, -1.9, k * 0.22, -3.05, -1.0, k * 0.22 + 0.22, -2.6, carton);
  bx(scene, -0.6, 0.0, -2.9, 0.0, 0.18, -2.5, carton); bx(scene, -0.6, 0.18, -2.88, 0.0, 0.36, -2.52, carton);
  // spare marble slabs leaning on the wall
  for (let k = 0; k < 3; k++) { const m = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 0.02), slab); m.position.set(0.9 + k * 0.03, 0.4 + 0.0, Z0 + 0.08 + k * 0.025); m.rotation.x = -0.1; m.castShadow = true; scene.add(m); }
  // bucket with mortar + trowel
  const bkt = T.solid(0x2b5f9e, { roughness: 0.5 }); const bucket = new THREE.Group(); cylY(bucket, 0, 0, 0, 0.16, 0.12, 0.3, bkt, { seg: 24 }); cylY(bucket, 0, 0.27, 0, 0.145, 0.145, 0.015, T.solid(0x8d8a83, { roughness: 1 }), { seg: 24 }); place(bucket, 0.05, 0.1); scene.add(bucket);
  const tr = new THREE.Group(); bx(tr, -0.14, 0, -0.055, 0.14, 0.003, 0.055, steelMat(0xc7cacc, 0.25)); bx(tr, 0.12, 0.003, -0.012, 0.16, 0.02, 0.012, T.solid(0x111111)); bx(tr, 0.15, 0.02, -0.02, 0.28, 0.05, 0.02, woodMat({ kind: 'oak', tileM: 0.3, planks: 1, gap: false, seed: 3 })); place(tr, 1.3, 0.62, 0.5); tr.position.y = 0.012; scene.add(tr);
  // spirit level (yellow) on tiles
  const lv = new THREE.Group(); const yel = T.solid(0xe2b61c, { roughness: 0.4, metalness: 0.5 }); bx(lv, -0.6, 0, -0.025, 0.6, 0.045, 0.025, yel); for (const k of [-0.3, 0, 0.3]) bx(lv, k - 0.04, 0.046, -0.012, k + 0.04, 0.05, 0.012, T.solid(0xbfe36a, { roughness: 0.2 })); place(lv, 1.6, -1.0, 0.35); lv.position.y = 0.032; scene.add(lv);
  // rubber mallet + bags + float
  const mal = new THREE.Group(); cylY(mal, 0, 0, 0, 0.04, 0.04, 0.1, T.solid(0x111111, { roughness: 0.7 })); rod(mal, [0, 0.05, 0], [0.3, 0.05, 0], 0.014, woodMat({ kind: 'oak', tileM: 0.3, planks: 1, gap: false, seed: 3 })); place(mal, 2.5, -0.2, 0.6); mal.position.y = 0.032; mal.rotation.z = 0; scene.add(mal);
  const bag = T.solid(0xd9d3c4, { roughness: 1 }); softBox(scene, 0.5, 0.14, 0.3, bag, -2.2, 0.07, 1.0, { r: 0.04, bulge: { y: 0.04 }, seg: [10, 4, 8], wrinkle: 0.01, seed: 2, tile: 0.4 }); softBox(scene, 0.5, 0.14, 0.3, bag, -2.15, 0.21, 1.02, { r: 0.04, bulge: { y: 0.04 }, seg: [10, 4, 8], wrinkle: 0.01, seed: 3, tile: 0.4, rotY: 0.3 });
  // stepladder
  const lad = new THREE.Group(); const al = steelMat(0xcfd2d4, 0.3);
  for (const sx of [-1, 1]) { rod(lad, [sx * 0.22, 0, 0.5], [sx * 0.2, 1.8, 0.0], 0.018, al, { seg: 8 }); rod(lad, [sx * 0.24, 0, -0.5], [sx * 0.2, 1.8, 0.0], 0.018, al, { seg: 8 }); }
  for (let k = 1; k <= 5; k++) { const t = k / 6.2, zz = 0.5 * (1 - t); bx(lad, -0.22, 1.8 * t - 0.01, zz - 0.04, 0.22, 1.8 * t + 0.01, zz + 0.04, al); }
  bx(lad, -0.26, 1.78, -0.12, 0.26, 1.82, 0.12, T.solid(0xc22b2b, { roughness: 0.5 })); place(lad, -1.7, -2.2, 0.5); scene.add(lad);
  // paint tins + roller tray on the painted side
  for (const [x, z, c] of [[-2.6, 0.2, 0xefece4], [-2.4, 0.5, 0xd8cdb6]]) { const tn = new THREE.Group(); cylY(tn, 0, 0, 0, 0.13, 0.13, 0.17, T.metal(0xb8bbbd, { roughness: 0.4 }), { seg: 24 }); cylY(tn, 0, 0.168, 0, 0.115, 0.115, 0.004, T.solid(c, { roughness: 0.4 }), { seg: 24 }); place(tn, x, z); scene.add(tn); }
  // work light on tripod (warm, adds interior highlight)
  const wl = new THREE.Group(); for (const a of [0, 2.1, 4.2]) rod(wl, [0, 1.1, 0], [Math.cos(a) * 0.35, 0, Math.sin(a) * 0.35], 0.012, blackMetal(0x222222), { seg: 6 }); bx(wl, -0.2, 1.1, -0.03, 0.2, 1.4, 0.03, blackMetal(0x222222, 0.5)); bx(wl, -0.18, 1.12, 0.031, 0.18, 1.38, 0.034, T.emissive(0xfff0d8, 9), { cast: false }); place(wl, -0.9, -0.2, 0.4); scene.add(wl);
  point(wl, 0, 1.3, 0.5, 0xfff0d8, 3.0, 10, 1.8);
  I.halo(wl, [0, 1.25, 0.1], 0.9, 0xfff0d8, 0.5);
  point(scene, 0, 2.6, 0.5, 0xfff0dc, 1.2, 12, 1.8);
  // cornice work: downlights only on finished (left) band
  room.downlights([[-2.5, -2.9], [-1.2, -2.9], [-2.5, 2.4], [-1.2, 2.4]], { y: room.dropY });
  const camera = archCamera({ pos: [-0.4, 1.4, 2.7], target: [0.4, 1.4, -3.4], focal: 22, w, h });
  finishScene(scene, camera);
  return { scene, camera, exposure: 0.6, aoRadius: 0.5, grade: { contrast: 1.1, saturation: 1.0, vignette: 0.25, grain: 0.018, warm: 0.0 } };
}
