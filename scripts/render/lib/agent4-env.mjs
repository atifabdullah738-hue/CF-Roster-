// agent4: hazy, dusty South-Asian sky dome + matching IBL + sun with shadows + HDR fog colour.
import * as THREE from 'three';

const VERT = `varying vec3 vDir; void main(){ vDir = position; vec4 p = projectionMatrix * modelViewMatrix * vec4(position,1.0); gl_Position = p; }`;
const FRAG = `varying vec3 vDir; uniform vec3 horizon, zenith, ground, sunDir, sunCol; uniform float cloud, glow, discAmt, haze, seed;
float hash(vec2 p){ p = fract(p*vec2(123.34, 456.21)); p += dot(p, p+45.32); return fract(p.x*p.y); }
float vn(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f); return mix(mix(hash(i),hash(i+vec2(1,0)),f.x), mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x), f.y); }
float fbm(vec2 p){ float a=0.5, s=0.0; for(int i=0;i<6;i++){ s+=vn(p)*a; p=p*2.03+vec2(11.7,3.1); a*=0.5; } return s; }
void main(){
  vec3 d = normalize(vDir); float h = d.y;
  float t = pow(clamp(h, 0.0, 1.0), 0.42);
  vec3 col = mix(horizon, zenith, t);
  col = mix(col, horizon, haze * (1.0 - smoothstep(0.0, 0.5, h)));
  if (h < 0.0) col = mix(horizon, ground, smoothstep(0.0, -0.12, h));
  float sd = max(dot(d, sunDir), 0.0);
  col += sunCol * (pow(sd, 6.0) * 0.30 + pow(sd, 40.0) * glow + pow(sd, 1500.0) * discAmt);
  // soft dusty high cloud
  if (h > 0.0) { vec2 uv = d.xz / (h + 0.18) * 0.9 + seed; float c = fbm(uv * 1.3); float c2 = fbm(uv * 3.1 + 4.0);
    float m = smoothstep(0.42 - cloud * 0.2, 0.78, c) * (0.6 + 0.4 * c2) * smoothstep(0.0, 0.25, h);
    vec3 cc = mix(horizon * 1.08, vec3(1.05, 0.98, 0.9) * length(zenith) * 0.9, 0.5) * (0.9 + 0.2 * c2);
    col = mix(col, cc, m * cloud * 0.8); }
  gl_FragColor = vec4(col, 1.0);
}`;

function makeDome(o) {
  const mat = new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, side: THREE.BackSide, depthWrite: false, fog: false, uniforms: {
    horizon: { value: new THREE.Vector3(...o.horizon) }, zenith: { value: new THREE.Vector3(...o.zenith) }, ground: { value: new THREE.Vector3(...o.ground) }, sunDir: { value: o.sunDir },
    sunCol: { value: new THREE.Vector3(...o.sunCol) }, cloud: { value: o.cloud }, glow: { value: o.glow }, discAmt: { value: o.disc }, haze: { value: o.haze }, seed: { value: o.seed } } });
  const m = new THREE.Mesh(new THREE.SphereGeometry(3000, 48, 24), mat); m.renderOrder = -10; m.frustumCulled = false; return m;
}

/**
 * Hazy sky + IBL + sun. Colours are LINEAR HDR triples (~0.5-1.2 for sky). Returns {sun, light, fogColor}.
 * o: sunElevation, sunAzimuth(0=+Z toward camera, 90=+X), horizon, zenith, ground, cloud, glow, haze, sunIntensity, sunColor, envIntensity,
 *    fogDensity(0=none), fogColor, shadowExtent, shadowCenter, shadowMap
 */
export function hazeEnvironment({ renderer, scene, sunElevation = 38, sunAzimuth = 60, horizon = [1.0, 0.9, 0.76], zenith = [0.5, 0.62, 0.82], ground = [0.55, 0.46, 0.36], cloud = 0.5, glow = 0.45, haze = 0.8, disc = 0,
  sunIntensity = 3.0, sunColor = 0xffe8c8, envIntensity = 0.5, fogDensity = 0.0075, fogColor = null, shadowExtent = 30, shadowCenter = [0, 0, 0], shadowMap = 4096, seed = 3.3, sunCol = [1.0, 0.82, 0.55], shadowRadius = 4 } = {}) {
  const sun = new THREE.Vector3().setFromSphericalCoords(1, THREE.MathUtils.degToRad(90 - sunElevation), THREE.MathUtils.degToRad(sunAzimuth));
  const opts = { horizon, zenith, ground, sunDir: sun, sunCol, cloud, glow, disc, haze, seed };
  const envScene = new THREE.Scene(); envScene.add(makeDome({ ...opts, disc: 0 }));
  const pm = new THREE.PMREMGenerator(renderer); scene.environment = pm.fromScene(envScene, 0, 0.1, 6000).texture; scene.environmentIntensity = envIntensity; scene.background = null;
  scene.add(makeDome(opts));
  const light = new THREE.DirectionalLight(sunColor, sunIntensity), c = new THREE.Vector3(...shadowCenter); light.position.copy(c).addScaledVector(sun, 140); light.target.position.copy(c);
  light.castShadow = true; light.shadow.mapSize.set(shadowMap, shadowMap); const sc = light.shadow.camera; sc.left = -shadowExtent; sc.right = shadowExtent; sc.top = shadowExtent; sc.bottom = -shadowExtent; sc.near = 1; sc.far = 340;
  light.shadow.bias = -0.0002; light.shadow.normalBias = 0.025; light.shadow.radius = shadowRadius; light.shadow.blurSamples = 16; scene.add(light, light.target);
  const fc = fogColor || horizon; if (fogDensity > 0) { scene.fog = new THREE.FogExp2(0xffffff, fogDensity); scene.fog.color.setRGB(fc[0] * 0.93, fc[1] * 0.93, fc[2] * 0.93); }
  return { sun, light };
}
