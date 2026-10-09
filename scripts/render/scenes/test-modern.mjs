import { THREE, T, boxAt, ground, wallWithOpenings, windowUnit, doorUnit, slatGate, pillarLamp, planter, waterTank, acUnit } from '../lib/arch.mjs';
import { setupEnvironment, archCamera } from '../lib/env.mjs';
import { hedge, bush, tree, palm } from '../lib/nature.mjs';

export default async function build({ renderer, w, h }) {
  const scene = new THREE.Scene();
  setupEnvironment({ renderer, scene, sunElevation: 28, sunAzimuth: 58, turbidity: 2.4, rayleigh: 1.0, sunIntensity: 3.0, sunColor: 0xffecd2, envIntensity: 0.38, shadowExtent: 30, shadowCenter: [0, 0, 4] });

  const pG = T.plaster(0xb8bbbf, { tileM: 3.5, seed: 4 }), pW = T.plaster(0xf0ece4, { tileM: 3.5, seed: 8 }), dark = T.plaster(0x2a2d32, { tileM: 3, seed: 2, roughness: 0.75 });
  const slat = T.wood({ color: 0xc08a4c, tileM: 1.2, planks: 1, gap: false, seed: 4 }), clad = T.wood({ color: 0x6a5240, tileM: 1.6, planks: 5, seed: 6 }), gateW = T.wood({ color: 0xb8814a, tileM: 1.0, planks: 1, gap: false, seed: 9 });
  const road = T.asphalt(), pave = T.paving({ color: 0xbab6ac, tileM: 2.4, n: 6 }), drive = T.paving({ color: 0xd0ccc3, tileM: 2.6, n: 5, seed: 5 }), lawn = T.grass({ color: 0x5b8a3a }), conc = T.concrete(0xb2b2ae);

  ground(-90, -60, 90, 90, 0, lawn, scene);
  ground(-90, 13.5, 90, 40, 0.002, road, scene);
  ground(-90, 9, 90, 13.5, 0.02, pave, scene);
  ground(-9.5, 0, -1.2, 9, 0.03, drive, scene);
  ground(0.4, 0.4, 2.2, 9, 0.03, pave, scene);

  const H = new THREE.Group(); scene.add(H);
  const D = 11, F = 3.3, SL = 0.3;                                           // depth, storey height, slab depth
  // ---- ground floor (right) with real openings
  wallWithOpenings(1.0, 10.0, 0, F, -0.35, 0.35, [{ x: 2.2, y: 0.85, w: 5.2, h: 1.9 }], pW, H);
  boxAt(1.0, 0, -D, 10.0, F, -0.35, pW, H);
  windowUnit({ x: 2.2, y: 0.85, w: 5.2, h: 1.9, z: 0, glow: 0xffd49a, cols: 3, frame: 0x1c1f24 }, H);
  // ---- porch (left): back wall with entrance, side pier
  wallWithOpenings(-9.5, 1.0, 0, F, -3.9, 0.35, [{ x: -3.9, y: 0, w: 1.3, h: 2.4 }, { x: -7.8, y: 0.9, w: 1.6, h: 1.8 }], pW, H);
  doorUnit({ x: -3.9, w: 1.3, h: 2.4, z: -3.55, mat: clad, recess: 0.0 }, H);
  windowUnit({ x: -7.8, y: 0.9, w: 1.6, h: 1.8, z: -3.55, glow: 0xffd49a, frame: 0x1c1f24, reveal: 0.1 }, H);
  boxAt(-9.5, 0, -D, 1.0, F, -3.9, pW, H);
  boxAt(-9.7, 0, -3.9, -9.3, F, 0, pG, H);                                   // left porch pier
  boxAt(0.7, 0, -3.9, 1.0, F, 0, pG, H);                                      // right porch pier
  boxAt(-9.5, 0, -3.9, 1.0, 0.02, 0, conc, H);
  // ---- first-floor slab (cantilevers over porch), dark fascia
  boxAt(-9.9, F, -D, 10.3, F + SL, 1.6, dark, H);
  // ---- upper left: slat-clad bedroom box
  boxAt(-9.7, F + SL, -D, -0.3, F + SL + 3.3, 0.9, dark, H);
  for (let x = -9.6; x < -0.4; x += 0.19) boxAt(x, F + SL + 0.05, 0.9, x + 0.065, F + SL + 3.25, 1.04, slat, H);
  boxAt(-9.9, F + SL + 3.3, -D, -0.1, F + SL + 3.55, 1.3, dark, H);
  planter(-9.8, 0.95, -0.2, 1.55, F + SL, 0.4, dark, H); hedge(-9.6, 1.25, -0.4, 1.25, { h: 0.5, w: 0.3, y: F + SL + 0.35, density: 90, seed: 8, color: 0x4d8a38 }, H);
  // ---- upper right: grey plaster volume with window + timber fin
  wallWithOpenings(0.5, 10.0, F + SL, F + SL + 3.3, -0.35, 0.35, [{ x: 1.4, y: F + SL + 0.8, w: 2.0, h: 1.5 }], pG, H);
  boxAt(0.5, F + SL, -D, 10.0, F + SL + 3.3, -0.35, pG, H);
  windowUnit({ x: 1.4, y: F + SL + 0.8, w: 2.0, h: 1.5, z: 0, glow: 0xffd49a, cols: 2, frame: 0x1c1f24 }, H);
  boxAt(5.6, F + SL, 0, 7.0, F + SL + 3.3, 0.16, clad, H);
  boxAt(0.3, F + SL + 3.3, -D, 10.3, F + SL + 3.55, 0.35, dark, H);
  // ---- porch downlights
  const lamp = T.emissive(0xfff0cc, 10);
  for (const x of [-8.2, -6.4, -4.6, -2.8, -1.0]) { const d = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.02, 16), lamp); d.position.set(x, F - 0.01, 0.3); H.add(d); const pl = new THREE.PointLight(0xffdca8, 3.5, 7, 1.7); pl.position.set(x, F - 0.3, 0.6); scene.add(pl); }
  waterTank(8.2, F + SL + 3.55, -7, H); acUnit(8.4, F + SL + 0.4, 0.0, H);

  // ---- boundary wall, pillars, gate
  const wz = 8.4;
  boxAt(-16, 0, wz - 0.12, -9.9, 1.6, wz + 0.12, pW, scene); boxAt(1.2, 0, wz - 0.12, 16, 1.6, wz + 0.12, pW, scene);
  for (const px of [-9.9, -1.1]) { boxAt(px - 0.22, 0, wz - 0.22, px + 0.22, 1.9, wz + 0.22, pG, scene); pillarLamp(px, 1.9, wz, scene, { intensity: 8 }); }
  slatGate({ x0: -9.7, x1: -1.3, y0: 0, y1: 1.8, z: wz, slat: 0.11, gap: 0.035, mat: gateW, frame: T.metal(0x1c1f24), parent: scene });
  boxAt(-0.9, 0, wz - 0.12, 1.2, 1.1, wz + 0.12, pW, scene); boxAt(1.4, 1.0, wz + 0.12, 3.4, 1.55, wz + 0.16, dark, scene);
  for (const [x, z, s] of [[3.4, 7.0, 0.42], [4.2, 7.4, 0.26], [5.2, 7.0, 0.18]]) { const r = new THREE.Mesh(new THREE.IcosahedronGeometry(s, 3), T.concrete(0xc2b49c, { tileM: 1, seed: 9 })); r.position.set(x, s * 0.6, z); r.scale.set(1.25, 0.8, 1); r.castShadow = true; scene.add(r); }
  bush(2.4, 0, 7.0, 0.5, scene, { seed: 3, color: 0x4a8236 }); hedge(1.2, 6.2, 9, 6.2, { h: 0.45, w: 0.4, density: 70, seed: 4, color: 0x4a8236 }, scene);

  // ---- trees & context
  tree(-13, -4, { h: 9, crown: 3.6, seed: 2, color: 0x4a7f35 }, scene); tree(13.5, -3, { h: 8, crown: 3.2, seed: 6, color: 0x558a3a }, scene);
  tree(-5, -19, { h: 11, crown: 4.6, seed: 11, color: 0x3f7230 }, scene); tree(9, -19, { h: 11, crown: 4.6, seed: 12, color: 0x487c34 }, scene);
  palm(-15, 6, { h: 8.5, seed: 3 }, scene);
  boxAt(-34, 0, -14, -17, 7, 3, T.plaster(0xe3ddd0, { tileM: 3.5, seed: 12 }), scene); boxAt(17, 0, -14, 34, 8.5, 3, T.plaster(0xcfc9bd, { tileM: 3.5, seed: 14 }), scene);

  const camera = archCamera({ pos: [1.5, 1.7, 24], target: [0, 0, 0], focal: 32, shift: 0.04, w, h });
  return { scene, camera, exposure: 0.34, aoRadius: 0.8, aoStrength: 1.0 };
}
