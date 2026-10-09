// agent2 environment: same as env.mjs but the sun disc is disabled in the IBL (it can overflow half-float PMREM
// and blank the frame at low rayleigh / high turbidity), with optional overcast / dusk helpers.
import * as THREE from 'three';
import { Sky } from 'three/addons/objects/Sky.js';
export { archCamera } from './env.mjs';
import { sunVector } from './env.mjs';

export function setupEnv({ renderer, scene, sunElevation = 35, sunAzimuth = 120, turbidity = 4, rayleigh = 1.1, mie = 0.004, mieG = 0.8,
  sunIntensity = 3.2, sunColor = 0xfff1de, envIntensity = 1.0, clouds = { coverage: 0.3, density: 0.55, scale: 0.0004, elevation: 0.55 }, shadowExtent = 30, shadowCenter = [0, 0, 0], shadowMap = 4096, sunDisc = false, skyExposure = 1 } = {}) {
  const sky = new Sky(); sky.scale.setScalar(4500);
  const u = sky.material.uniforms; u.turbidity.value = turbidity; u.rayleigh.value = rayleigh; u.mieCoefficient.value = mie; u.mieDirectionalG.value = Math.min(mieG, 0.9);
  const sun = sunVector(sunElevation, sunAzimuth); u.sunPosition.value.copy(sun);
  if (u.showSunDisc) u.showSunDisc.value = sunDisc ? 1 : 0;
  if (u.cloudCoverage) { u.cloudCoverage.value = clouds.coverage; u.cloudDensity.value = clouds.density; u.cloudScale.value = clouds.scale; u.cloudElevation.value = clouds.elevation; }
  const skyScene = new THREE.Scene(); skyScene.add(sky);
  const pm = new THREE.PMREMGenerator(renderer); const env = pm.fromScene(skyScene, 0, 0.1, 6000).texture;
  scene.environment = env; scene.environmentIntensity = envIntensity;
  const skyMain = sky.clone(); skyMain.material = sky.material.clone(); skyMain.material.uniforms = THREE.UniformsUtils.clone(sky.material.uniforms); skyMain.material.uniforms.showSunDisc.value = sunDisc ? 1 : 0; scene.add(skyMain); scene.background = null;
  const light = new THREE.DirectionalLight(sunColor, sunIntensity);
  const c = new THREE.Vector3(...shadowCenter); light.position.copy(c).addScaledVector(sun, 120); light.target.position.copy(c);
  light.castShadow = sunIntensity > 0; light.shadow.mapSize.set(shadowMap, shadowMap);
  const sc = light.shadow.camera; sc.left = -shadowExtent; sc.right = shadowExtent; sc.top = shadowExtent; sc.bottom = -shadowExtent; sc.near = 1; sc.far = 320;
  light.shadow.bias = -0.00025; light.shadow.normalBias = 0.03; light.shadow.radius = 3.5; light.shadow.blurSamples = 16;
  scene.add(light, light.target);
  void skyExposure;
  return { sun, light, sky: skyMain, env };
}

/* ======================================================================================================
 * Art-directed sky dome (gradient + sun glow + soft cumulus) used both as background and as the IBL source.
 * Colours are linear HDR radiance (pre exposure). 1.0 ~ bright sunlit white wall radiance at exposure 0.34 -> ~0.6.
 * ==================================================================================================== */
const C = (c) => (c instanceof THREE.Color ? c : new THREE.Color(c));
const V3 = (a) => new THREE.Vector3(a[0], a[1], a[2]);
export function makeSkyDome({ sunDir, zenith = [0.2, 0.5, 1.35], mid = [0.45, 0.75, 1.4], horizon = [1.2, 1.0, 0.85], ground = [0.35, 0.3, 0.25], sunCol = [3, 2.2, 1.4], glow = 1,
  cloudLit = [2.3, 2.1, 1.9], cloudShade = [0.75, 0.82, 1.0], coverage = 0.5, soft = 0.25, cloudScale = 1.6, cloudOpacity = 0.95, seed = 3.1, disc = false, gain = 1 } = {}) {
  const mat = new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { uZenith: { value: V3(zenith) }, uMid: { value: V3(mid) }, uHorizon: { value: V3(horizon) }, uGround: { value: V3(ground) }, uSunDir: { value: sunDir.clone().normalize() }, uSunCol: { value: V3(sunCol) }, uGlow: { value: glow },
      uCloudLit: { value: V3(cloudLit) }, uCloudShade: { value: V3(cloudShade) }, uCov: { value: coverage }, uSoft: { value: soft }, uScale: { value: cloudScale }, uOpacity: { value: cloudOpacity }, uSeed: { value: seed }, uDisc: { value: disc ? 1 : 0 }, uGain: { value: gain } },
    vertexShader: 'varying vec3 vDir; void main(){ vDir = position; vec4 p = projectionMatrix * modelViewMatrix * vec4(position,1.0); gl_Position = p.xyww; }',
    fragmentShader: `varying vec3 vDir;
      uniform vec3 uZenith,uMid,uHorizon,uGround,uSunDir,uSunCol,uCloudLit,uCloudShade; uniform float uGlow,uCov,uSoft,uScale,uOpacity,uSeed,uDisc,uGain;
      float hash(vec2 p){ p = fract(p*vec2(123.34,456.21)); p += dot(p,p+45.32); return fract(p.x*p.y); }
      float vn(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f); return mix(mix(hash(i),hash(i+vec2(1,0)),f.x), mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x), f.y); }
      float fbm(vec2 p){ float a=0.5,s=0.0; for(int i=0;i<6;i++){ s+=a*vn(p); p=p*2.03+vec2(17.1,9.2); a*=0.5; } return s; }
      void main(){
        vec3 d = normalize(vDir); float h = clamp(d.y,0.0,1.0);
        vec3 col = mix(uHorizon, uMid, smoothstep(0.0,0.2,h)); col = mix(col, uZenith, smoothstep(0.12,0.95,h));
        float sd = max(dot(d, normalize(uSunDir)),0.0);
        col += uSunCol * uGlow * (pow(sd,5.0)*0.18 + pow(sd,40.0)*0.35 + uDisc*pow(sd,2500.0)*6.0);
        if (d.y > 0.0) {
          vec2 uv = d.xz/(d.y+0.28)*uScale + uSeed;
          float n = fbm(uv), n2 = fbm(uv + normalize(uSunDir.xz+0.001)*0.06);
          float m = smoothstep(uCov, uCov+uSoft, n);
          float shade = clamp(0.62 + (n2-n)*7.0, 0.0, 1.0);
          vec3 cc = mix(uCloudShade, uCloudLit, shade);
          cc += uSunCol*pow(sd,6.0)*0.25*m*(1.0-m)*4.0;
          float fade = smoothstep(0.0,0.14,d.y);
          col = mix(col, cc, m*fade*uOpacity);
        } else { col = mix(uHorizon*0.9, uGround, smoothstep(0.0,-0.25,d.y)); }
        gl_FragColor = vec4(col*uGain, 1.0);
      }`
  });
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(3000, 48, 32), mat); mesh.frustumCulled = false; mesh.renderOrder = -10; return mesh;
}

/** Scene setup with the art-directed dome: sun light + PMREM from the dome. */
export function setupSky({ renderer, scene, sunElevation = 20, sunAzimuth = 40, sunIntensity = 3.2, sunColor = 0xfff1de, envIntensity = 0.6, shadowExtent = 30, shadowCenter = [0, 0, 0], shadowMap = 4096, dome = {}, fog = null } = {}) {
  const sun = sunVector(sunElevation, sunAzimuth);
  const d1 = makeSkyDome({ sunDir: sun, ...dome }), skyScene = new THREE.Scene(); skyScene.add(d1);
  const pm = new THREE.PMREMGenerator(renderer), env = pm.fromScene(skyScene, 0, 0.1, 6000).texture;
  scene.environment = env; scene.environmentIntensity = envIntensity;
  const d2 = makeSkyDome({ sunDir: sun, ...dome }); scene.add(d2); scene.background = null;
  const light = new THREE.DirectionalLight(sunColor, sunIntensity), c = new THREE.Vector3(...shadowCenter); light.position.copy(c).addScaledVector(sun, 120); light.target.position.copy(c);
  light.castShadow = sunIntensity > 0; light.shadow.mapSize.set(shadowMap, shadowMap);
  const sc = light.shadow.camera; sc.left = -shadowExtent; sc.right = shadowExtent; sc.top = shadowExtent; sc.bottom = -shadowExtent; sc.near = 1; sc.far = 320;
  light.shadow.bias = -0.00025; light.shadow.normalBias = 0.03; light.shadow.radius = 3.5; light.shadow.blurSamples = 16;
  scene.add(light, light.target);
  if (fog) scene.fog = new THREE.FogExp2(Array.isArray(fog.color) ? new THREE.Color().setRGB(...fog.color, THREE.LinearSRGBColorSpace) : C(fog.color), fog.density);
  return { sun, light, dome: d2, env };
}
