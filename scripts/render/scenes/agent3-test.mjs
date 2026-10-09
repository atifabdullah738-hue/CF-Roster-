import { THREE, T, bx, bc, rbox, softBox, pillow, buildRoom, gardenView, curtainSet, interiorEnvironment, marbleMat, woodMat, fabricMat, paintMat, rugMat, glow, point, areaLight, place } from '../lib/agent3-interior.mjs';
import { setupEnvironment, archCamera } from '../lib/env.mjs';

export default async function build({ renderer, w, h }) {
  const scene = new THREE.Scene();
  const X0 = -3.1, X1 = 3.1, Z0 = -3.6, Z1 = 3.3, H = 3.1;
  setupEnvironment({ renderer, scene, sunElevation: 26, sunAzimuth: 250, turbidity: 2.6, sunIntensity: 8.0, sunColor: 0xffe6c4, envIntensity: 0.15, shadowExtent: 8, shadowCenter: [0, 1, 0] });
  interiorEnvironment({ renderer, scene, W: 6.2, H, D: 6.9, wall: 0xe8e0d2, floor: 0xb8a58c, ceil: 0xf3eadb, wallLum: 0.5, floorLum: 0.35, ceilLum: 0.7, windows: [{ side: '-x', c: -0.8, w: 3.4, yb: 0.4, yt: 2.7, lum: 5 }], intensity: 1.0 });
  const floor = marbleMat({ base: 0xe9e3d6, vein: 0x9c9285, veinAlt: 0xb8a37a, slab: 0.8, n: 3, seed: 5 });
  const room = buildRoom(scene, { x0: X0, x1: X1, z0: Z0, z1: Z1, H, mats: { floor, wall: paintMat(0xe9e2d4) }, openings: { left: [{ c: -0.8, w: 3.4, y: 0.4, h: 2.3, type: 'window', panels: 3 }] }, ceiling: { tray: true, band: 0.8, drop: 0.2 } });
  gardenView(room, "left", {trees:false, neighbour:false});

  const g = new THREE.Group(); scene.add(g);
  softBox(g, 2.2, 0.45, 0.9, fabricMat({ color: 0x8b95a1, kind: 'linen' }), 0, 0.3, 0, { r: 0.08, bulge: { y: 0.05 } });
  const camera = archCamera({ pos: [0.15, 1.25, 3.15], target: [0, 1.25, -3.5], focal: 20, w, h });
  return { scene, camera, exposure: 0.4, aoRadius: 0.5 };
}
