import { THREE, T, boxAt, ground } from '../lib/agent5-kit.mjs';
import { setupEnvironment, archCamera } from '../lib/env.mjs';
import { makeSky } from '../lib/agent5-sky.mjs';
export default async function build({ renderer, w, h }) {
  const scene = new THREE.Scene();
  const E = setupEnvironment({ renderer, scene, sunElevation: 27, sunAzimuth: -32, turbidity: 6, rayleigh: 1.0, sunIntensity: 3.0, sunColor: 0xffe6c4, envIntensity: 0.42, shadowExtent: 20 });
  E.sky.visible = false;
  const S = makeSky(scene, { exposure: 0.36, sunEl: 27, sunAz: -32, cover: 0.62, scale: 1.6, soft: 0.28, cirrus: 0.4, seed: 3 });
  scene.fog = new THREE.FogExp2(S.fogColor, 0.004);
  ground(-2000, -2000, 2000, 60, 0, T.grass({ color: 0x66903f, tileM: 4.5 }), scene);
  boxAt(-3, 0, -10, 3, 5, -4, T.plaster(0xece6da), scene);
  const camera = archCamera({ pos: [6, 1.65, 14], target: [-1.8, 1.65, 0], focal: 24, shift: 0.1, w, h });
  return { scene, camera, exposure: 0.36, ao: false };
}
