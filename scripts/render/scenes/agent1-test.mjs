import { crownTree, mound, flowerMass, hedgeRow, cam, skyDome, THREE, T, ground, car } from '../lib/agent1-kit.mjs';
import { setupEnvironment } from '../lib/env.mjs';
export default async function build({ renderer, w, h }) {
  const scene = new THREE.Scene();
  const env = setupEnvironment({ renderer, scene, sunElevation: 38, sunAzimuth: 305, turbidity: 3.5, sunIntensity: 3.8, envIntensity: 0.27, shadowExtent: 12, shadowCenter: [0, 0, 0] });
  env.sky.visible = false; skyDome(scene, { sunElevation: 38, sunAzimuth: 305 });
  ground(-50, -50, 50, 50, 0, T.asphalt(), scene);
  crownTree(-6, -4, { h: 9, crown: 3.4, kind: 'neem', seed: 2 }, scene); crownTree(-1, -6, { h: 10, crown: 4.2, kind: 'umbrella', seed: 4 }, scene); crownTree(5, -5, { h: 11, crown: 3, kind: 'tall', seed: 6 }, scene); mound(2.5,0,2,0.7,scene); flowerMass({x0:-3,x1:0,y0:0.3,y1:1.8,z:-1,parent:scene,seed:3});
  car({ x: -2.6, z: 0, rot: 0.0, color: 0x1d2735, type: 'suv', parent: scene });
  car({ x: 2.8, z: 0, rot: 0.0, color: 0xe8e8e6, type: 'sedan', parent: scene });
  const camera = cam({ pos: [3, 1.6, 20], target: [0, 4, 0], focal: 30, w, h, keepLevel: false });
  return { scene, camera, exposure: 0.46 };
}
