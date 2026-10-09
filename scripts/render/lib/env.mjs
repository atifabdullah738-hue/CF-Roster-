// Sky, sun, image-based lighting, camera and render pipeline helpers.
import * as THREE from 'three';
import { Sky } from 'three/addons/objects/Sky.js';

export function sunVector(elevationDeg, azimuthDeg) {
  const v = new THREE.Vector3(); v.setFromSphericalCoords(1, THREE.MathUtils.degToRad(90 - elevationDeg), THREE.MathUtils.degToRad(azimuthDeg)); return v;
}

/**
 * Physically-based sky + sun + IBL.
 * @param {object} o  sunElevation(deg) sunAzimuth(deg: 0=+Z toward camera-ish, 90=+X) turbidity rayleigh mie mieG
 *                    sunIntensity envIntensity shadowExtent shadowCenter hemi
 */
export function setupEnvironment({ renderer, scene, sunElevation = 35, sunAzimuth = 120, turbidity = 4, rayleigh = 1.1, mie = 0.004, mieG = 0.82,
  sunIntensity = 3.2, sunColor = 0xfff1de, envIntensity = 1.0, clouds = { coverage: 0.3, density: 0.55, scale: 0.0004, elevation: 0.55 }, shadowExtent = 30, shadowCenter = [0, 0, 0], shadowMap = 4096, fog = null } = {}) {
  const sky = new Sky(); sky.scale.setScalar(4500);
  const u = sky.material.uniforms; u.turbidity.value = turbidity; u.rayleigh.value = rayleigh; u.mieCoefficient.value = mie; u.mieDirectionalG.value = mieG;
  const sun = sunVector(sunElevation, sunAzimuth); u.sunPosition.value.copy(sun);
  if (u.cloudCoverage) { u.cloudCoverage.value = clouds.coverage; u.cloudDensity.value = clouds.density; u.cloudScale.value = clouds.scale; u.cloudElevation.value = clouds.elevation; }
  const skyScene = new THREE.Scene(); skyScene.add(sky);
  const pm = new THREE.PMREMGenerator(renderer); const env = pm.fromScene(skyScene, 0, 0.1, 6000).texture;
  scene.environment = env; scene.environmentIntensity = envIntensity;
  const skyMain = sky.clone(); scene.add(skyMain); scene.background = null;
  const light = new THREE.DirectionalLight(sunColor, sunIntensity);
  const c = new THREE.Vector3(...shadowCenter); light.position.copy(c).addScaledVector(sun, 120); light.target.position.copy(c);
  light.castShadow = true; light.shadow.mapSize.set(shadowMap, shadowMap);
  const sc = light.shadow.camera; sc.left = -shadowExtent; sc.right = shadowExtent; sc.top = shadowExtent; sc.bottom = -shadowExtent; sc.near = 1; sc.far = 320;
  light.shadow.bias = -0.00025; light.shadow.normalBias = 0.03; light.shadow.radius = 3.5; light.shadow.blurSamples = 16;
  scene.add(light, light.target);
  if (sunElevation < 1) light.intensity = Math.max(0, sunIntensity * 0.15);
  if (fog) scene.fog = new THREE.FogExp2(fog.color, fog.density);
  return { sun, light, sky: skyMain, env };
}

/**
 * Architectural camera: eye position + look-at point; optional vertical lens shift (keeps verticals parallel)
 * `shift` in fractions of image height (+ moves the view up), `shiftX` likewise horizontally.
 */
export function archCamera({ pos, target, focal = 28, shift = 0, shiftX = 0, w, h, near = 0.1, far = 4000, keepLevel = true }) {
  const cam = new THREE.PerspectiveCamera(); cam.filmGauge = 36; cam.setFocalLength(focal); cam.aspect = w / h; cam.near = near; cam.far = far;
  cam.position.set(...pos); const t = new THREE.Vector3(...target); if (keepLevel) t.y = pos[1]; cam.lookAt(t);
  if (shift || shiftX) cam.setViewOffset(w, h, -shiftX * w, -shift * h, w, h);
  cam.updateProjectionMatrix(); return cam;
}

/** Subtle ground-level atmospheric haze toward the horizon. */
export function addHaze(scene, color = 0xcfdbe8, density = 0.0035) { scene.fog = new THREE.FogExp2(color, density); }
