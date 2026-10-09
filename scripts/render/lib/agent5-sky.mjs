// agent5 sky: procedural photographic sky dome (gradient + haze + sun glow + cumulus/cirrus clouds) rendered in a fragment shader
// and inverse-tone-mapped (ACES) so the colours you specify are the colours you get on screen. Also returns a matching fog colour.
import * as THREE from 'three';

// forward ACES exactly as three.js (per-channel mixing) for JS-side inversion (fog colour)
function acesFwd(c, exp) {
  let r = c[0] * exp / 0.6, g = c[1] * exp / 0.6, b = c[2] * exp / 0.6;
  let r2 = 0.59719 * r + 0.35458 * g + 0.04823 * b, g2 = 0.076 * r + 0.90834 * g + 0.01566 * b, b2 = 0.0284 * r + 0.13383 * g + 0.83777 * b;
  const f = (v) => (v * (v + 0.0245786) - 0.000090537) / (v * (0.983729 * v + 0.432951) + 0.238081);
  r2 = f(r2); g2 = f(g2); b2 = f(b2);
  return [Math.min(1, Math.max(0, 1.60475 * r2 - 0.53108 * g2 - 0.07367 * b2)), Math.min(1, Math.max(0, -0.10208 * r2 + 1.10813 * g2 - 0.00605 * b2)), Math.min(1, Math.max(0, -0.00327 * r2 - 0.07276 * g2 + 1.07602 * b2))];
}
/** hex sRGB display colour -> linear HDR scene value that tone-maps (ACES, exposure) to that colour. */
export function invTone(hexColor, exposure) {
  const c = new THREE.Color(hexColor); const t = [Math.min(c.r, 0.97), Math.min(c.g, 0.97), Math.min(c.b, 0.97)]; // Color is linear already (three converts hex from sRGB)
  let x = t.map((v) => v * 2.5 + 0.05);
  for (let i = 0; i < 40; i++) { const f = acesFwd(x, exposure); x = x.map((v, k) => v * Math.min(1.6, Math.max(0.6, (t[k] + 1e-3) / (f[k] + 1e-3)))); }
  return new THREE.Color(x[0], x[1], x[2]);
}

const VERT = `varying vec3 vDir; void main(){ vDir = (modelMatrix * vec4(position,1.0)).xyz - cameraPosition; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); gl_Position.z = gl_Position.w; }`;
const FRAG = `
precision highp float;
varying vec3 vDir;
uniform vec3 uSun, uZenith, uMid, uHorizon, uGlow, uCloudLit, uCloudShade, uCloudUnder, uGround;
uniform float uExp, uGlowTight, uGlowAmt, uHazeH, uCover, uScale, uSoft, uCirrus, uSeed, uSunDisc, uCloudOpacity, uBoost;
vec3 mulIn(vec3 c){ return vec3(0.59719*c.x+0.35458*c.y+0.04823*c.z, 0.076*c.x+0.90834*c.y+0.01566*c.z, 0.0284*c.x+0.13383*c.y+0.83777*c.z); }
vec3 mulOut(vec3 c){ return vec3(1.60475*c.x-0.53108*c.y-0.07367*c.z, -0.10208*c.x+1.10813*c.y-0.00605*c.z, -0.00327*c.x-0.07276*c.y+1.07602*c.z); }
vec3 aces(vec3 c){ c *= uExp/0.6; c = mulIn(c); vec3 a = c*(c+0.0245786)-0.000090537; vec3 b = c*(0.983729*c+0.4329510)+0.238081; c = a/b; c = mulOut(c); return clamp(c,0.0,1.0); }
vec3 invAces(vec3 t){ t = min(t, vec3(0.972)); vec3 x = t*2.5+0.05; for(int i=0;i<14;i++){ vec3 f = aces(x); x *= clamp((t+1e-3)/(f+1e-3), 0.6, 1.6);} return x; }
vec3 s2l(vec3 c){ return mix(c/12.92, pow((c+0.055)/1.055, vec3(2.4)), step(0.04045, c)); }
vec2 grad(vec2 i){ vec3 p = fract(i.xyx*vec3(0.1031,0.1030,0.0973)); p += dot(p,p.yzx+33.33); return fract((p.xx+p.yz)*p.zy)*2.0-1.0; }
float noise(vec2 p){ vec2 i=floor(p), f=fract(p); vec2 u=f*f*f*(f*(f*6.0-15.0)+10.0);
  float a=dot(grad(i),f), b=dot(grad(i+vec2(1,0)),f-vec2(1,0)), c=dot(grad(i+vec2(0,1)),f-vec2(0,1)), d=dot(grad(i+vec2(1,1)),f-vec2(1,1));
  return mix(mix(a,b,u.x),mix(c,d,u.x),u.y)*1.5; }
float fbm(vec2 p){ float r=0.0, a=0.5; for(int i=0;i<6;i++){ r+=a*noise(p); p=p*2.03+vec2(17.1,9.2); a*=0.5; } return r; }
void main(){
  vec3 d = normalize(vDir); float e = d.y;
  float el = max(e, 0.0);
  // base gradient (display-space colours)
  float hz = exp(-el / uHazeH);
  vec3 sky = mix(uMid, uZenith, smoothstep(0.1, 0.85, el));
  sky = mix(sky, uHorizon, clamp(hz, 0.0, 1.0));
  float sd = max(dot(d, uSun), 0.0);
  float glow = pow(sd, uGlowTight) * uGlowAmt + pow(sd, 6.0) * uGlowAmt * 0.35;
  sky = mix(sky, uGlow, clamp(glow, 0.0, 0.92));
  // clouds
  float alpha = 0.0; vec3 cc = uCloudLit;
  if (e > 0.0) {
    vec2 p = d.xz / (e + 0.10) * uScale + vec2(uSeed*7.3, uSeed*3.1);
    float n = fbm(p) * 0.5 + 0.5;
    float region = fbm(p * 0.22 + 5.0) * 0.5 + 0.5;
    float thr = 1.0 - uCover + (region - 0.5) * 0.35;
    float m = smoothstep(thr, thr + uSoft, n);
    vec2 sp = normalize(uSun.xz + 1e-4) * 0.06;
    float n2 = fbm(p + sp) * 0.5 + 0.5;
    float lit = clamp(0.5 + (n - n2) * 9.0, 0.0, 1.0);
    float body = smoothstep(thr, thr + 0.42, n);
    float fade = smoothstep(0.0, 0.16, e);
    alpha = m * fade * uCloudOpacity;
    cc = mix(uCloudShade, uCloudLit, 0.35 + 0.65 * lit);
    cc = mix(cc, uCloudUnder, smoothstep(0.35, 1.0, body) * 0.55 * (1.0 - lit));
    cc += uCloudLit * pow(sd, 4.0) * 0.35 * (1.0 - body);
    cc = mix(cc, uHorizon, clamp(hz * 0.85, 0.0, 0.85));
    // cirrus veils
    vec2 q = vec2(d.x, d.z) / (e + 0.22) * uScale * vec2(0.45, 1.8) + 31.0 + uSeed;
    float ci = smoothstep(0.52, 0.95, fbm(q) * 0.5 + 0.5) * uCirrus * fade;
    sky = mix(sky, mix(uCloudLit, uHorizon, 0.4), ci * 0.55);
  }
  vec3 col = mix(sky, cc, alpha);
  if (e <= 0.0) { col = mix(uHorizon, uGround, smoothstep(0.0, 0.06, -e)); }
  vec3 hdr = invAces(s2l(col));
  // sun disc / hot glow above display white
  hdr += uGlow * 0.0;
  float disc = smoothstep(0.99985, 0.99996, dot(d, uSun)) * uSunDisc * (1.0 - alpha * 0.9);
  hdr += vec3(1.0, 0.88, 0.7) * disc * 40.0;
  hdr += uGlow * pow(sd, uGlowTight * 2.0) * uBoost;
  gl_FragColor = vec4(hdr, 1.0);
}`;

/**
 * Add a sky dome. Colours are DISPLAY sRGB hex values (what you want on screen after tone mapping).
 * Returns { dome, fogColor (linear HDR Color) }.
 */
export function makeSky(scene, o = {}) {
  const { exposure = 0.36, sunEl = 30, sunAz = 0, zenith = 0x5b86b8, mid = 0x86a9cc, horizon = 0xcfd9e0, glow = 0xfff0d8, glowAmt = 0.35, glowTight = 14, hazeH = 0.2,
    cover = 0.3, scale = 1.4, soft = 0.3, cirrus = 0.25, seed = 1, cloudLit = 0xffffff, cloudShade = 0x9aa8bc, cloudUnder = 0x7f8da3, ground = 0x9aa38a, sunDisc = 0, opacity = 0.95, boost = 0 } = o;
  const sunDir = new THREE.Vector3(Math.cos(THREE.MathUtils.degToRad(sunEl)) * Math.sin(THREE.MathUtils.degToRad(sunAz)), Math.sin(THREE.MathUtils.degToRad(sunEl)), Math.cos(THREE.MathUtils.degToRad(sunEl)) * Math.cos(THREE.MathUtils.degToRad(sunAz)));
  const C = (v) => new THREE.Vector3(((v >> 16) & 255) / 255, ((v >> 8) & 255) / 255, (v & 255) / 255);
  const mat = new THREE.ShaderMaterial({
    vertexShader: VERT, fragmentShader: FRAG, side: THREE.BackSide, depthWrite: false, fog: false, toneMapped: false,
    uniforms: { uSun: { value: sunDir }, uZenith: { value: C(zenith) }, uMid: { value: C(mid) }, uHorizon: { value: C(horizon) }, uGlow: { value: C(glow) }, uCloudLit: { value: C(cloudLit) }, uCloudShade: { value: C(cloudShade) }, uCloudUnder: { value: C(cloudUnder) }, uGround: { value: C(ground) },
      uExp: { value: exposure }, uGlowTight: { value: glowTight }, uGlowAmt: { value: glowAmt }, uHazeH: { value: hazeH }, uCover: { value: cover }, uScale: { value: scale }, uSoft: { value: soft }, uCirrus: { value: cirrus }, uSeed: { value: seed }, uSunDisc: { value: sunDisc }, uCloudOpacity: { value: opacity }, uBoost: { value: boost } },
  });
  const dome = new THREE.Mesh(new THREE.SphereGeometry(2500, 48, 32), mat); dome.frustumCulled = false; dome.renderOrder = -10; scene.add(dome);
  const fogColor = invTone(horizon, exposure);
  return { dome, fogColor, sunDir };
}
