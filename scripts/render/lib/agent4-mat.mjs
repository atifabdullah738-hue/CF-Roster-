// agent4: procedural construction-site materials (brick, mortar, formwork concrete, rebar, timber, bamboo, sand, gravel,
// soil, weathered plaster ...). All textures are painted on canvases in the browser. Colour in = sRGB hex.
import * as THREE from 'three';
import { rng } from './textures.mjs';
export { THREE, rng };

const _cache = new Map();
export const memo = (k, f) => { if (!_cache.has(k)) _cache.set(k, f()); return _cache.get(k); };
const clamp = (v, a = 0, b = 255) => (v < a ? a : v > b ? b : v);
export const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
export const mix = (a, b, t) => a + (b - a) * t;
export const rgb = (hex) => [(hex >> 16) & 255, (hex >> 8) & 255, hex & 255];

/** Anisotropic tileable fractal value noise (Float32Array size*size, 0..1). bx/by = base cell counts in x / y. */
export function noise2(seed, size, octaves, bx, by = bx) {
  return memo(`n2/${seed}/${size}/${octaves}/${bx}/${by}`, () => {
    const out = new Float32Array(size * size), r = rng(seed); let amp = 0.5, tot = 0;
    for (let o = 0; o < octaves; o++) {
      const gx = Math.round(bx * 2 ** o), gy = Math.round(by * 2 ** o); if (gx > size / 2 || gy > size / 2) break;
      const g = new Float32Array(gx * gy); for (let i = 0; i < g.length; i++) g[i] = r();
      const x0 = new Int32Array(size), x1 = new Int32Array(size), tx = new Float32Array(size);
      for (let x = 0; x < size; x++) { const fx = (x / size) * gx, i0 = Math.floor(fx), t = fx - i0; x0[x] = i0 % gx; x1[x] = (i0 + 1) % gx; tx[x] = t * t * (3 - 2 * t); }
      for (let y = 0; y < size; y++) {
        const fy = (y / size) * gy, j0 = Math.floor(fy), t = fy - j0, ty = t * t * (3 - 2 * t), r0 = (j0 % gy) * gx, r1 = ((j0 + 1) % gy) * gx;
        for (let x = 0; x < size; x++) { const a = g[r0 + x0[x]], b = g[r0 + x1[x]], c = g[r1 + x0[x]], d = g[r1 + x1[x]]; out[y * size + x] += (a + (b - a) * tx[x] + (c - a) * ty + (a - b - c + d) * tx[x] * ty) * amp; }
      }
      tot += amp; amp *= 0.5;
    }
    for (let i = 0; i < out.length; i++) out[i] /= tot; return out;
  });
}
/** periodic 1-D smooth noise (Float32Array size) */
export function noise1(seed, size, cells) {
  return memo(`n1/${seed}/${size}/${cells}`, () => {
    const r = rng(seed), g = Array.from({ length: cells }, () => r()), o = new Float32Array(size);
    for (let x = 0; x < size; x++) { const f = (x / size) * cells, i = Math.floor(f), t = f - i, s = t * t * (3 - 2 * t); o[x] = g[i % cells] * (1 - s) + g[(i + 1) % cells] * s; }
    return o;
  });
}

/** paint(size, fn(i,x,y,o)) with o=[r,g,b,a] 0..255 -> canvas */
export function paint(size, fn) {
  const c = document.createElement('canvas'); c.width = c.height = size; const ctx = c.getContext('2d'), img = ctx.createImageData(size, size), d = img.data, o = [0, 0, 0, 255];
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) { o[3] = 255; fn(y * size + x, x, y, o); const k = (y * size + x) * 4; d[k] = clamp(o[0]); d[k + 1] = clamp(o[1]); d[k + 2] = clamp(o[2]); d[k + 3] = clamp(o[3]); }
  ctx.putImageData(img, 0, 0); return c;
}
export function toTex(c, { srgb = true, aniso = 8 } = {}) { const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace; t.anisotropy = aniso; return t; }
const canvas = (w, h = w) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
function std(c, cb, o = {}) {
  const { tileM = 1, bumpScale = 1, roughness = 0.9, metalness = 0, color = 0xffffff, ...rest } = o;
  const m = new THREE.MeshStandardMaterial({ map: toTex(c), bumpMap: cb ? toTex(cb, { srgb: false }) : null, bumpScale, roughness, metalness, color, ...rest }); m.userData.tileM = tileM; return m;
}
function grey(S, arr, gain = 255, off = 0) { return paint(S, (i, x, y, o) => { o[0] = o[1] = o[2] = arr[i] * gain + off; }); }

// ------------------------------------------------------------------------------------------------ detail / dust shader
/** Adds a world-space tri-planar grain multiplier and a ground-splash dust band to any standard material. */
export function detailize(mat, { tex = grainTex(), scale = 2.2, strength = 0.55, dustH = 0, dustColor = 0xb09a7c, dustAmt = 0.6, key = 'd' } = {}) {
  const dc = new THREE.Color(dustColor);
  mat.onBeforeCompile = (sh) => {
    sh.uniforms.dMap = { value: tex }; sh.uniforms.dScale = { value: scale }; sh.uniforms.dStr = { value: strength };
    sh.uniforms.dDustH = { value: dustH }; sh.uniforms.dDustC = { value: new THREE.Vector3(dc.r, dc.g, dc.b) }; sh.uniforms.dDustA = { value: dustAmt };
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vWP;').replace('#include <begin_vertex>', '#include <begin_vertex>\n#ifdef USE_INSTANCING\n vWP = (modelMatrix * instanceMatrix * vec4(transformed,1.0)).xyz;\n#else\n vWP = (modelMatrix * vec4(transformed,1.0)).xyz;\n#endif');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 vWP; uniform sampler2D dMap; uniform float dScale, dStr, dDustH, dDustA; uniform vec3 dDustC;')
      .replace('#include <map_fragment>', `#include <map_fragment>
      { vec3 wn = abs(normalize(cross(dFdx(vWP), dFdy(vWP))));
        vec2 duv = (wn.y > wn.x && wn.y > wn.z) ? vWP.xz : ((wn.x > wn.z) ? vWP.zy : vWP.xy);
        float g1 = texture2D(dMap, duv * dScale).r, g2 = texture2D(dMap, duv * dScale * 0.23 + 0.37).r;
        float gg = (g1 * 0.65 + g2 * 0.35);
        diffuseColor.rgb *= mix(1.0, gg * 2.0, dStr);
        if (dDustH > 0.0) { float k = smoothstep(dDustH * (0.55 + g2 * 0.9), 0.0, vWP.y) * dDustA * (0.5 + g1); diffuseColor.rgb = mix(diffuseColor.rgb, dDustC * (0.8 + g2 * 0.4), clamp(k, 0.0, 0.85)); } }`);
  };
  mat.customProgramCacheKey = () => key + dustH; return mat;
}
export function grainTex() {
  return memo('grainTex', () => { const S = 512, f = noise2(91, S, 5, 24), g = noise2(92, S, 3, 6), r = rng(4); const c = paint(S, (i, x, y, o) => { const v = 0.5 + (f[i] - 0.5) * 0.55 + (g[i] - 0.5) * 0.3 + (r() - 0.5) * 0.22; o[0] = o[1] = o[2] = v * 255; }); return toTex(c); });
}

// ------------------------------------------------------------------------------------------------ brick & mortar
/** Clay brick material for merged geometry with vertexColors (per-brick tint). Texture is neutral detail. */
export function clay() {
  return memo('clay', () => {
    const S = 512, f1 = noise2(11, S, 5, 28), f2 = noise2(12, S, 4, 5), st = noise1(13, S, 30), r = rng(5), pore = new Float32Array(S * S);
    for (let k = 0; k < 340; k++) { const px = r() * S, py = r() * S, rad = 1 + r() * 3.2; for (let dy = -4; dy <= 4; dy++) for (let dx = -4; dx <= 4; dx++) { const d = Math.hypot(dx, dy) / rad; if (d < 1) { const xx = (Math.floor(px + dx) + S) % S, yy = (Math.floor(py + dy) + S) % S; pore[yy * S + xx] = Math.max(pore[yy * S + xx], (1 - d) * (0.5 + r() * 0.5)); } } }
    const c = paint(S, (i, x, y, o) => {
      const v = 0.9 + (f1[i] - 0.5) * 0.2 + (f2[i] - 0.5) * 0.16 + (st[y] - 0.5) * 0.07 + (r() - 0.5) * 0.07 - pore[i] * 0.38;
      o[0] = v * 255; o[1] = v * 255 * (0.97 + (f2[i] - 0.5) * 0.06); o[2] = v * 255 * (0.94 + (f2[i] - 0.5) * 0.08);
    });
    const cb = paint(S, (i, x, y, o) => { const v = 0.55 + (f1[i] - 0.5) * 0.6 + (r() - 0.5) * 0.3 - pore[i] * 0.7; o[0] = o[1] = o[2] = v * 255; });
    return std(c, cb, { bumpScale: 1.4, roughness: 0.94, vertexColors: true });
  });
}
/** Cement-sand mortar (use via boxAt, tileM 0.7). */
export function mortar(color = 0xaaa59a, seed = 3) {
  return memo(`mortar${color}/${seed}`, () => {
    const S = 512, f = noise2(seed, S, 5, 10), s = noise2(seed + 1, S, 3, 90), r = rng(seed);
    const c = paint(S, (i, x, y, o) => { const v = 0.86 + (f[i] - 0.5) * 0.22 + (s[i] - 0.5) * 0.18 + (r() - 0.5) * 0.14; o[0] = v * 255; o[1] = v * 255; o[2] = v * 254; });
    const cb = paint(S, (i, x, y, o) => { const v = 0.5 + (f[i] - 0.5) * 0.4 + (s[i] - 0.5) * 0.7 + (r() - 0.5) * 0.3; o[0] = o[1] = o[2] = v * 255; });
    return std(c, cb, { tileM: 0.7, bumpScale: 1.6, roughness: 1, color });
  });
}

/** Rough shuttered RCC (formwork joints, pits, stains). tile = 2.4 m. */
export function rcc({ color = 0xa5a49e, seed = 5, ties = false, stain = 0.5 } = {}) {
  return memo(`rcc${color}/${seed}/${ties}/${stain}`, () => {
    const S = 1024, f = noise2(seed, S, 6, 4), g = noise2(seed + 3, S, 5, 14), big = noise2(seed + 5, S, 3, 2), col = noise1(seed + 7, S, 60), col2 = noise1(seed + 8, S, 22), r = rng(seed);
    const pits = new Float32Array(S * S); for (let k = 0; k < 260; k++) { const px = r() * S, py = r() * S, rad = 1 + r() * 3.4; for (let dy = -4; dy <= 4; dy++) for (let dx = -4; dx <= 4; dx++) { const d = Math.hypot(dx, dy) / rad; if (d < 1) { const xx = (Math.floor(px + dx) + S) % S, yy = (Math.floor(py + dy) + S) % S; pits[yy * S + xx] = Math.max(pits[yy * S + xx], 1 - d); } } }
    const holes = []; if (ties) for (let ix = 0; ix < 4; ix++) for (let iy = 0; iy < 4; iy++) holes.push([(0.125 + ix * 0.25) * S, (0.125 + iy * 0.25) * S]);
    const sx = 0.5 * S;
    const heightArr = new Float32Array(S * S);
    const c = paint(S, (i, x, y, o) => {
      let v = 0.86 + (f[i] - 0.5) * 0.2 + (g[i] - 0.5) * 0.1 + (big[i] - 0.5) * 0.2 + (r() - 0.5) * 0.05 - pits[i] * 0.3;
      const sv = Math.max(0, col[x] - 0.5) * 2 * Math.max(0, col2[x] - 0.35) * 1.4 * stain; v *= 1 - 0.22 * sv;
      const dxs = Math.min(Math.abs(x - sx), x, S - x), dys = Math.min(y, S - y);
      let h = 0.5 + (f[i] - 0.5) * 0.3 + (g[i] - 0.5) * 0.3 - pits[i] * 0.5;
      if (dxs < 1.6) { v *= 0.5 + dxs * 0.25; h -= 0.3; } if (dys < 1.5) { v *= 0.55 + dys * 0.25; h -= 0.3; }
      if (dxs < 5 && dxs >= 1.6) { v *= 1 - (5 - dxs) * 0.025; }
      for (const hh of holes) { const d = Math.hypot(x - hh[0], y - hh[1]); if (d < 6) { v *= 0.35 + d * 0.06; h -= 0.35; } else if (d < 11) { v *= 0.93; } }
      // fine brownish dust cast
      o[0] = v * 255 * 1.0; o[1] = v * 255 * 0.985; o[2] = v * 255 * 0.955; heightArr[i] = h;
    });
    const cb = grey(S, heightArr, 255);
    return std(c, cb, { tileM: 2.4, bumpScale: 1.1, roughness: 0.96, color });
  });
}

/** Weathered, cracked, stained, peeling old painted plaster. */
export function weatheredPlaster({ base = 0xd8c690, under = 0xb3ada1, seed = 3, size = 2048, tileM = 8, damp = 0.6, peel = 0.55, brickShow = 0.5, grime = 0.7, cracks = 7, moss = 0.5, rust = [], dampLine = 0.75, crackPts = null, repair = true } = {}) {
  const key = `wp${base}/${under}/${seed}/${size}/${tileM}/${damp}/${peel}/${brickShow}/${grime}/${cracks}/${moss}/${dampLine}/${JSON.stringify(rust)}/${JSON.stringify(crackPts)}`;
  return memo(key, () => {
    const S = size, tpm = S / tileM, f = noise2(seed, S, 6, 6), g = noise2(seed + 2, S, 4, 3), fine = noise2(seed + 4, S, 4, 72), m1 = noise2(seed + 6, S, 6, 3), pm = noise2(seed + 8, S, 6, 4), am = noise2(seed + 10, S, 5, 6);
    const strk = noise1(seed + 12, S, 70), strk2 = noise1(seed + 14, S, 18), r = rng(seed + 20);
    // crack mask
    const cc = canvas(S), cx = cc.getContext('2d'); cx.fillStyle = '#000'; cx.fillRect(0, 0, S, S); cx.strokeStyle = '#fff'; cx.lineCap = 'round'; cx.lineJoin = 'round';
    const crack = (x0, y0, ang, len, w, depth = 0) => {
      let x = x0, y = y0, a = ang; cx.beginPath(); cx.moveTo(x, y); const step = 6 + r() * 6;
      for (let d = 0; d < len; d += step) { a += (r() - 0.5) * 0.7; x += Math.cos(a) * step; y += Math.sin(a) * step; cx.lineWidth = Math.max(0.8, w * (1 - d / len * 0.7)); cx.lineTo(x, y); if (depth < 2 && r() < 0.07) { const sx = x, sy = y; cx.stroke(); crack(sx, sy, a + (r() < 0.5 ? 1 : -1) * (0.5 + r() * 0.6), len * (0.25 + r() * 0.25) - d * 0.3, w * 0.6, depth + 1); cx.beginPath(); cx.moveTo(sx, sy); } }
      cx.stroke();
    };
    if (crackPts) for (const p of crackPts) crack(p.u * S, (1 - p.v) * S, p.ang ?? Math.PI / 2, p.len * tpm, (p.w ?? 0.012) * tpm);
    for (let k = 0; k < cracks; k++) { const horizontal = r() < 0.3; crack(r() * S, r() * S, horizontal ? (r() < 0.5 ? 0 : Math.PI) + (r() - 0.5) * 0.5 : Math.PI / 2 + (r() - 0.5) * 0.9, (0.5 + r() * 1.6) * tpm, (0.004 + r() * 0.007) * tpm * 2); }
    const crk = new Float32Array(S * S); { const d = cx.getImageData(0, 0, S, S).data; for (let i = 0; i < S * S; i++) crk[i] = d[i * 4] / 255; }
    const B = rgb(base), U = rgb(under), bh = 0.086 * tpm, bw = 0.239 * tpm, gap = 0.011 * tpm;
    const hArr = new Float32Array(S * S);
    const c = paint(S, (i, x, y, o) => {
      const yN = y / S, height = (1 - yN) * tileM; // metres above tile bottom
      let v = 0.95 + (f[i] - 0.5) * 0.12 + (g[i] - 0.5) * 0.1 + (fine[i] - 0.5) * 0.04;
      let R = B[0] * v, G = B[1] * v, Bl = B[2] * v;
      // rain streaks and top grime
      const sx = strk[x] * 0.6 + strk2[x] * 0.4, sv = Math.max(0, sx - 0.5) * 2.2 * (0.25 + 0.75 * (1 - yN)) * grime; R *= 1 - 0.30 * sv; G *= 1 - 0.30 * sv; Bl *= 1 - 0.26 * sv;
      const topG = smooth(0.85, 1.0, 1 - yN) * 0.0; void topG;
      // rising damp
      const dl = dampLine + (m1[i] - 0.5) * 1.5, dm = smooth(dl + 0.16, dl - 0.1, height) * damp;
      const edge = Math.exp(-(((height - dl) / 0.045) ** 2)) * damp * smooth(0.0, 0.3, height);
      R *= 1 - 0.38 * dm; G *= 1 - 0.34 * dm; Bl *= 1 - 0.32 * dm;
      R = mix(R, 238, 0.42 * edge); G = mix(G, 234, 0.42 * edge); Bl = mix(Bl, 222, 0.4 * edge);
      // peeling / loss of paint
      const pp = pm[i] + 0.08 * dm + 0.04 * (1 - smooth(0, 1.2, height)) - 0.04 * peel * 0 - (0.62 - 0.6 * peel) * 0.2 + 0.0;
      const th = 0.64 - peel * 0.12, pmask = smooth(th, th + 0.014, pp);
      let hh = 0.62 + (f[i] - 0.5) * 0.08 + (fine[i] - 0.5) * 0.12;
      if (pmask > 0) {
        const uv = 0.88 + (fine[i] - 0.5) * 0.28 + (f[i] - 0.5) * 0.25;
        let uR = U[0] * uv * (1 - 0.3 * dm), uG = U[1] * uv * (1 - 0.3 * dm), uB = U[2] * uv * (1 - 0.28 * dm);
        const bm = smooth(th + 0.07 + (1 - brickShow) * 0.12, th + 0.08 + (1 - brickShow) * 0.12 + 0.012, pp);
        if (bm > 0) {
          const row = Math.floor(y / bh), xo = x + (row % 2) * bw * 0.5, col = Math.floor(xo / bw), ly = y - row * bh, lx = xo - col * bw, inb = ly > gap && ly < bh && lx > gap * 0.5 && lx < bw - gap * 0.5;
          const hsh = ((row * 73856093) ^ (col * 19349663)) >>> 0, k = ((hsh % 100) / 100 - 0.5) * 0.3;
          const bR = inb ? (150 + k * 120) * (0.85 + fine[i] * 0.3) : 150, bG = inb ? (68 + k * 60) * (0.85 + fine[i] * 0.3) : 138, bB = inb ? (48 + k * 50) * (0.85 + fine[i] * 0.3) : 126;
          uR = mix(uR, bR, bm); uG = mix(uG, bG, bm); uB = mix(uB, bB, bm); hh -= bm * (inb ? 0.1 : 0.2);
        }
        // shadow lip just inside the paint edge
        const lip = (1 - smooth(th + 0.014, th + 0.03, pp)) * 0.35;
        R = mix(R, uR * (1 - lip), pmask); G = mix(G, uG * (1 - lip), pmask); Bl = mix(Bl, uB * (1 - lip), pmask);
        hh -= pmask * 0.22;
      }
      // lifted paint flake edge
      const fe = smooth(th - 0.012, th, pp) * (1 - smooth(th, th + 0.004, pp)); R *= 1 + 0.12 * fe; G *= 1 + 0.12 * fe; Bl *= 1 + 0.12 * fe; hh += fe * 0.25;
      // algae / mould low down
      const mo = smooth(0.52, 0.68, am[i] + 0.16 * dm) * smooth(1.1, 0.0, height) * moss; R = mix(R, 52, mo * 0.6); G = mix(G, 66, mo * 0.6); Bl = mix(Bl, 40, mo * 0.6);
      // cracks
      const cv = crk[i]; R *= 1 - 0.86 * cv; G *= 1 - 0.86 * cv; Bl *= 1 - 0.84 * cv; hh -= cv * 0.45;
      hArr[i] = hh; o[0] = R; o[1] = G; o[2] = Bl;
    });
    // rust streaks (below protruding steel)
    const ctx = c.getContext('2d');
    for (const ru of rust) {
      for (let k = 0; k < 7; k++) {
        const x = (ru.u + (r() - 0.5) * (ru.w ?? 0.12)) * S, y0 = (1 - ru.v) * S, len = (ru.len ?? 1.0) * tpm * (0.5 + r() * 0.7), gr = ctx.createLinearGradient(0, y0, 0, y0 + len);
        gr.addColorStop(0, `rgba(122,62,28,${0.38 * (0.4 + r() * 0.6)})`); gr.addColorStop(1, 'rgba(122,62,28,0)'); ctx.fillStyle = gr; ctx.fillRect(x, y0, (0.01 + r() * 0.02) * tpm, len);
      }
    }
    return std(c, grey(S, hArr, 255), { tileM, bumpScale: 1.5, roughness: 0.96 });
  });
}

/** Clean modern interior/exterior paint: very fine roller stipple + soft cloudiness. */
export function paintWall(color = 0xe8e2d4, { seed = 8, tileM = 3, roller = 1.0, roughness = 0.88 } = {}) {
  return memo(`paintw${color}/${seed}/${tileM}/${roller}`, () => {
    const S = 1024, f = noise2(seed, S, 5, 5), fine = noise2(seed + 1, S, 3, 180), r = rng(seed);
    const c = paint(S, (i, x, y, o) => { const v = 0.97 + (f[i] - 0.5) * 0.045 + (fine[i] - 0.5) * 0.04 * roller + (r() - 0.5) * 0.012; o[0] = o[1] = o[2] = v * 255; });
    const cb = paint(S, (i, x, y, o) => { const v = 0.5 + (fine[i] - 0.5) * 0.9 * roller + (f[i] - 0.5) * 0.3 + (r() - 0.5) * 0.12; o[0] = o[1] = o[2] = v * 255; });
    return std(c, cb, { tileM, bumpScale: 0.35, roughness, color });
  });
}
/** Freshly applied grey-beige cement plaster, trowel/float marks. */
export function freshPlaster({ color = 0xb9b4a8, seed = 12, tileM = 2, wet = 0.0 } = {}) {
  return memo(`fp${color}/${seed}/${tileM}/${wet}`, () => {
    const S = 1024, f = noise2(seed, S, 5, 4), a = noise2(seed + 2, S, 5, 3, 18), b = noise2(seed + 3, S, 4, 18, 3), s = noise2(seed + 4, S, 3, 120), r = rng(seed);
    const c = paint(S, (i, x, y, o) => { const sw = Math.sin((a[i] * 9 + b[i] * 7) * 3.0) * 0.5 + 0.5; const v = 0.88 + (f[i] - 0.5) * 0.14 + (sw - 0.5) * 0.07 + (s[i] - 0.5) * 0.1 + (r() - 0.5) * 0.05 - wet * (0.1 + f[i] * 0.1); o[0] = v * 255; o[1] = v * 255; o[2] = v * 252; });
    const cb = paint(S, (i, x, y, o) => { const sw = Math.sin((a[i] * 9 + b[i] * 7) * 3.0) * 0.5 + 0.5; const v = 0.5 + (sw - 0.5) * 0.5 + (s[i] - 0.5) * 0.7 + (f[i] - 0.5) * 0.3 + (r() - 0.5) * 0.2; o[0] = o[1] = o[2] = v * 255; });
    return std(c, cb, { tileM, bumpScale: 1.0, roughness: wet > 0.5 ? 0.55 : 0.98, color });
  });
}

// ------------------------------------------------------------------------------------------------ steel / rebar
/** Rebar (use vertexColors for rust variation). UV: u around, v along (1 tile = 0.1 m). */
export function rebar() {
  return memo('rebar', () => {
    const S = 512, f = noise2(21, S, 5, 8, 24), r = rng(21);
    const c = paint(S, (i, x, y, o) => {
      const u = x / S, rib = Math.abs(Math.sin((y / S * 6.0 + u * 2.0) * Math.PI)); // transverse ribs
      let v = 0.78 + (f[i] - 0.5) * 0.42 + (r() - 0.5) * 0.16 - (u > 0.45 && u < 0.5 ? 0.12 : 0) - (rib > 0.85 ? 0.1 : 0);
      o[0] = v * 255; o[1] = v * 250; o[2] = v * 245;
    });
    const cb = paint(S, (i, x, y, o) => { const u = x / S, rib = Math.abs(Math.sin((y / S * 6.0 + u * 2.0) * Math.PI)); o[0] = o[1] = o[2] = 120 + rib * 110 + (f[i] - 0.5) * 70; });
    return std(c, cb, { bumpScale: 1.6, roughness: 0.62, metalness: 0.55, vertexColors: true });
  });
}
export function steel(color = 0x8a8d8e, { roughness = 0.42, metalness = 0.85, rust = 0.0, seed = 2 } = {}) {
  return memo(`steel${color}/${roughness}/${rust}/${seed}`, () => {
    const S = 512, f = noise2(seed, S, 5, 6), s = noise2(seed + 1, S, 4, 4, 60), r = rng(seed);
    const c = paint(S, (i, x, y, o) => { const rs = smooth(0.55 - rust * 0.3, 0.7, f[i] * 0.7 + s[i] * 0.4) * rust; const v = 0.86 + (s[i] - 0.5) * 0.25 + (r() - 0.5) * 0.06; o[0] = mix(v * 255, 150, rs); o[1] = mix(v * 255, 82, rs); o[2] = mix(v * 255, 40, rs); });
    return std(c, grey(S, s, 255), { bumpScale: 0.25, roughness, metalness, color });
  });
}
/** Painted steel (red oxide / blue / yellow) with chips and cement splatter. */
export function paintedSteel(color = 0xc2491f, { seed = 4, wear = 0.5, splatter = 0.3 } = {}) {
  return memo(`ps${color}/${seed}/${wear}/${splatter}`, () => {
    const S = 512, f = noise2(seed, S, 5, 5), s = noise2(seed + 1, S, 4, 40), sp = noise2(seed + 2, S, 5, 9), r = rng(seed);
    const c = paint(S, (i, x, y, o) => {
      let v = 0.9 + (f[i] - 0.5) * 0.22 + (r() - 0.5) * 0.04; let R = v * 255, G = v * 255, B = v * 255;
      const chip = smooth(0.66 - wear * 0.1, 0.7 - wear * 0.1, s[i] * 0.6 + f[i] * 0.5);
      if (chip > 0.0) { R = mix(R, 120, chip * 0.8); G = mix(G, 70, chip * 0.8); B = mix(B, 48, chip * 0.8); }
      const sps = smooth(0.66 - splatter * 0.12, 0.7 - splatter * 0.12, sp[i]); if (sps > 0) { R = mix(R, 170, sps * 0.8); G = mix(G, 166, sps * 0.8); B = mix(B, 156, sps * 0.8); }
      o[0] = R; o[1] = G; o[2] = B;
    });
    return std(c, grey(S, s, 255), { bumpScale: 0.3, roughness: 0.55, metalness: 0.45, color });
  });
}

// ------------------------------------------------------------------------------------------------ timber / bamboo / ply
/** Rough sawn timber, grain along texture-u. `tint` scales colour via material.color. tile ~2.5 m. */
export function timber({ color = 0xb59a70, seed = 6, weather = 0.5, splatter = 0.0, knots = 4 } = {}) {
  return memo(`timber${color}/${seed}/${weather}/${splatter}/${knots}`, () => {
    const S = 1024, f = noise2(seed, S, 5, 2, 30), g = noise2(seed + 1, S, 5, 3, 120), w = noise2(seed + 2, S, 3, 4, 5), sp = noise2(seed + 3, S, 5, 6), r = rng(seed);
    const kn = Array.from({ length: knots }, () => [r() * S, r() * S, 10 + r() * 16]);
    const hA = new Float32Array(S * S);
    const c = paint(S, (i, x, y, o) => {
      let ring = Math.sin((f[i] * 26 + g[i] * 1.4) * Math.PI) * 0.5 + 0.5, v = 0.78 + (ring - 0.5) * 0.28 + (g[i] - 0.5) * 0.22 + (w[i] - 0.5) * 0.18 * weather + (r() - 0.5) * 0.03;
      for (const k of kn) { const dx = (x - k[0]), dy = (y - k[1]) * 0.55, d = Math.hypot(dx, dy) / k[2]; if (d < 1) v *= 0.55 + 0.45 * d; else if (d < 1.9) v *= 1 - 0.12 * (1.9 - d); }
      let R = v * 255, G = v * 244, B = v * 226;
      if (splatter > 0) { const s = smooth(0.7 - splatter * 0.15, 0.74 - splatter * 0.15, sp[i]); R = mix(R, 175, s * 0.8); G = mix(G, 171, s * 0.8); B = mix(B, 160, s * 0.8); }
      hA[i] = 0.5 + (ring - 0.5) * 0.3 + (g[i] - 0.5) * 0.3;
      o[0] = R; o[1] = G; o[2] = B;
    });
    return std(c, grey(S, hA, 255), { tileM: 2.5, bumpScale: 0.7, roughness: 0.82, color });
  });
}
/** Plywood sheet — UV 0..1 spans exactly one sheet (use tile=[2.44,1.22]). film = dark phenolic shuttering ply. */
export function plywood({ film = true, seed = 14, color } = {}) {
  return memo(`ply${film}/${seed}`, () => {
    const S = 1024, f = noise2(seed, S, 5, 2, 36), g = noise2(seed + 1, S, 4, 4, 10), sp = noise2(seed + 2, S, 5, 8), r = rng(seed), hA = new Float32Array(S * S);
    const c = paint(S, (i, x, y, o) => {
      const edge = Math.min(x, y, S - 1 - x, S - 1 - y); let v = (film ? 0.55 : 0.85) + (f[i] - 0.5) * (film ? 0.18 : 0.3) + (g[i] - 0.5) * 0.12 + (r() - 0.5) * 0.04;
      let R = v * (film ? 150 : 255), G = v * (film ? 96 : 232), B = v * (film ? 52 : 190);
      const st = smooth(0.62, 0.7, sp[i] * 0.8 + g[i] * 0.4); R = mix(R, 150, st * (film ? 0.7 : 0.35)); G = mix(G, 146, st * (film ? 0.7 : 0.35)); B = mix(B, 136, st * (film ? 0.7 : 0.35));
      if (edge < 4) { R *= 0.45 + edge * 0.1; G *= 0.45 + edge * 0.1; B *= 0.45 + edge * 0.1; } hA[i] = edge < 3 ? 0.2 : 0.55 + (f[i] - 0.5) * 0.1;
      o[0] = R; o[1] = G; o[2] = B;
    });
    return std(c, grey(S, hA, 255), { tileM: 2.44, bumpScale: 0.5, roughness: film ? 0.5 : 0.8, color: color ?? 0xffffff });
  });
}
/** Bamboo pole: u around, v along (tile 2 m). Per-pole tint through vertex colours. */
export function bamboo() {
  return memo('bamboo', () => {
    const S = 512, f = noise2(31, S, 5, 40, 3), g = noise2(32, S, 4, 3, 3), r = rng(31), h = new Float32Array(S * S);
    const c = paint(S, (i, x, y, o) => { const fib = Math.sin(x * 0.9 + f[i] * 12) * 0.5 + 0.5; let v = 0.84 + (f[i] - 0.5) * 0.26 + (fib - 0.5) * 0.08 + (g[i] - 0.5) * 0.14 + (r() - 0.5) * 0.04; h[i] = 0.5 + (f[i] - 0.5) * 0.5 + (fib - 0.5) * 0.2; o[0] = v * 255; o[1] = v * 255; o[2] = v * 240; });
    return std(c, grey(S, h, 255), { tileM: 2, bumpScale: 0.4, roughness: 0.55, vertexColors: true });
  });
}
export function rope(color = 0x8a7a55) { return memo(`rope${color}`, () => { const m = new THREE.MeshStandardMaterial({ color, roughness: 1 }); m.userData.tileM = 1; return m; }); }

// ------------------------------------------------------------------------------------------------ granular & soil
export function sand({ color = 0xc3b190, seed = 41, tileM = 2.0 } = {}) {
  return memo(`sand${color}/${seed}`, () => {
    const S = 1024, f = noise2(seed, S, 6, 6), g = noise2(seed + 1, S, 3, 220), rip = noise2(seed + 2, S, 3, 5, 40), r = rng(seed);
    const c = paint(S, (i, x, y, o) => { const v = 0.9 + (f[i] - 0.5) * 0.2 + (g[i] - 0.5) * 0.18 + (rip[i] - 0.5) * 0.08 + (r() - 0.5) * 0.12 + (r() > 0.992 ? 0.14 : 0) - (r() > 0.995 ? 0.25 : 0); o[0] = v * 255; o[1] = v * 253; o[2] = v * 248; });
    const cb = paint(S, (i, x, y, o) => { o[0] = o[1] = o[2] = (0.5 + (g[i] - 0.5) * 0.8 + (r() - 0.5) * 0.5 + (rip[i] - 0.5) * 0.3) * 255; });
    return std(c, cb, { tileM, bumpScale: 0.9, roughness: 1, color });
  });
}
export function gravel({ color = 0x9a9488, seed = 43, tileM = 1.2 } = {}) {
  return memo(`gravel${color}/${seed}`, () => {
    const S = 1024, r = rng(seed), c = canvas(S), x = c.getContext('2d'), cb = canvas(S), xb = cb.getContext('2d');
    x.fillStyle = '#2c2924'; x.fillRect(0, 0, S, S); xb.fillStyle = '#101010'; xb.fillRect(0, 0, S, S);
    const stone = (px, py) => {
      const rad = 7 + r() * 17, n = 6 + Math.floor(r() * 3), a0 = r() * 6.28, tones = [[150, 142, 130], [120, 115, 106], [178, 164, 140], [96, 92, 88], [160, 150, 120], [138, 124, 106], [188, 182, 172]], t = tones[Math.floor(r() * tones.length)], k = 0.7 + r() * 0.5;
      const offs = [[0, 0]]; if (px < 30) offs.push([S, 0]); if (px > S - 30) offs.push([-S, 0]); if (py < 30) offs.push([0, S]); if (py > S - 30) offs.push([0, -S]);
      for (const [ox, oy] of offs) {
        x.beginPath(); xb.beginPath();
        for (let j = 0; j < n; j++) { const a = a0 + (j / n) * 6.283, rr = rad * (0.75 + ((Math.sin(a * 3 + px) + 1) * 0.12)) * (j % 2 ? 0.9 : 1); const X = px + ox + Math.cos(a) * rr, Y = py + oy + Math.sin(a) * rr * 0.8; if (j) { x.lineTo(X, Y); xb.lineTo(X, Y); } else { x.moveTo(X, Y); xb.moveTo(X, Y); } }
        x.closePath(); xb.closePath();
        x.fillStyle = `rgb(${t[0] * k},${t[1] * k},${t[2] * k})`; x.fill(); x.strokeStyle = 'rgba(0,0,0,0.5)'; x.lineWidth = 1.6; x.stroke();
        const gr = x.createLinearGradient(px - rad, py - rad, px + rad, py + rad); gr.addColorStop(0, 'rgba(255,255,255,0.22)'); gr.addColorStop(1, 'rgba(0,0,0,0.25)'); x.fillStyle = gr; x.fill();
        xb.fillStyle = `rgb(${150 + r() * 90},${150 + r() * 90},${150 + r() * 90})`; xb.fill();
      }
    };
    for (let i = 0; i < 2600; i++) stone(r() * S, r() * S);
    const img = x.getImageData(0, 0, S, S), d = img.data, n = noise2(seed, S, 5, 40);
    for (let i = 0; i < S * S; i++) { const v = 0.9 + (n[i] - 0.5) * 0.3 + (r() - 0.5) * 0.1; d[i * 4] = clamp(d[i * 4] * v); d[i * 4 + 1] = clamp(d[i * 4 + 1] * v); d[i * 4 + 2] = clamp(d[i * 4 + 2] * v); } x.putImageData(img, 0, 0);
    return std(c, cb, { tileM, bumpScale: 2.2, roughness: 0.92, color: new THREE.Color(color).multiplyScalar(1.3) });
  });
}
/** Dusty compacted site soil. tile 10 m (use detailize for close grain). */
export function soil({ color = 0xbca98a, seed = 51, tileM = 10, size = 1024, dark = 0x8e795b } = {}) {
  return memo(`soil${color}/${seed}/${tileM}/${size}`, () => {
    const S = size, f = noise2(seed, S, 6, 5), g = noise2(seed + 1, S, 5, 24), big = noise2(seed + 2, S, 4, 3), fine = noise2(seed + 3, S, 3, 200), r = rng(seed), A = rgb(color), D = rgb(dark);
    const cc = canvas(S), cx = cc.getContext('2d'); cx.clearRect(0, 0, S, S);
    for (let k = 0; k < 2200; k++) { const px = r() * S, py = r() * S, rr = (0.5 + r() * 1.3) * S / 1024, t = r(), tone = t < 0.45 ? 200 + r() * 40 : t < 0.8 ? 60 + r() * 40 : 140 + r() * 40; cx.fillStyle = `rgba(${tone},${tone * 0.95},${tone * 0.86},${0.35 + r() * 0.5})`; cx.beginPath(); cx.ellipse(px, py, rr, rr * (0.6 + r() * 0.4), r() * 6, 0, 6.28); cx.fill(); }
    const peb = cx.getImageData(0, 0, S, S).data, hA = new Float32Array(S * S);
    const c = paint(S, (i, x, y, o) => {
      const dk = smooth(0.4, 0.68, big[i] * 0.75 + f[i] * 0.4), v = 0.92 + (f[i] - 0.5) * 0.2 + (g[i] - 0.5) * 0.14 + (fine[i] - 0.5) * 0.14 + (r() - 0.5) * 0.05;
      let R = mix(A[0], D[0], dk) * v, G = mix(A[1], D[1], dk) * v, B = mix(A[2], D[2], dk) * v; const a = peb[i * 4 + 3] / 255; R = mix(R, peb[i * 4], a * 0.7); G = mix(G, peb[i * 4 + 1], a * 0.7); B = mix(B, peb[i * 4 + 2], a * 0.7);
      hA[i] = 0.5 + (g[i] - 0.5) * 0.4 + (fine[i] - 0.5) * 0.5 + a * 0.3; o[0] = R; o[1] = G; o[2] = B;
    });
    return std(c, grey(S, hA, 255), { tileM, bumpScale: 1.4, roughness: 1 });
  });
}

// ------------------------------------------------------------------------------------------------ cement bag, plastic, tarp, label art
export function cementBag(scheme = 0) {
  return memo(`bag${scheme}`, () => {
    const W = 512, H = 768, c = canvas(W, H), x = c.getContext('2d'), r = rng(7 + scheme);
    const schemes = [['#d9cdb4', '#1c5a8c', '#f2c230', '#ffffff'], ['#d6cfbf', '#c0392b', '#f4f0e6', '#2a2a2a'], ['#d9d2c0', '#1f7a4d', '#f2e8c8', '#e0a420'], ['#dcd5c4', '#2b3a8c', '#e8573a', '#f2f2f2']], s = schemes[scheme % 4];
    x.fillStyle = s[0]; x.fillRect(0, 0, W, H);
    for (let i = 0; i < 4000; i++) { x.fillStyle = `rgba(${r() < 0.5 ? 255 : 90},${r() < 0.5 ? 250 : 80},${r() < 0.5 ? 240 : 70},0.05)`; x.fillRect(r() * W, r() * H, 1 + r() * 14, 1 + r() * 2); }
    x.fillStyle = s[1]; x.fillRect(0, H * 0.18, W, H * 0.12); x.fillRect(0, H * 0.72, W, H * 0.10); x.fillStyle = s[2]; x.fillRect(0, H * 0.30, W, H * 0.025); x.fillRect(0, H * 0.695, W, H * 0.025);
    x.fillStyle = s[1]; x.beginPath(); x.arc(W / 2, H * 0.50, H * 0.14, 0, 6.28); x.fill(); x.fillStyle = s[3]; x.beginPath(); x.arc(W / 2, H * 0.50, H * 0.115, 0, 6.28); x.fill(); x.fillStyle = s[2]; x.beginPath(); x.arc(W / 2, H * 0.50, H * 0.075, 0, 6.28); x.fill();
    x.fillStyle = s[1]; for (let i = 0; i < 4; i++) { x.fillRect(W * 0.1, H * (0.36 + i * 0.01), W * (0.2 - i * 0.03), 3); x.fillRect(W * 0.7, H * (0.36 + i * 0.01), W * (0.2 - i * 0.03), 3); }
    x.fillStyle = s[3]; x.fillRect(W * 0.12, H * 0.2, W * 0.76, 5); x.fillRect(W * 0.12, H * 0.27, W * 0.76, 5);
    x.fillStyle = 'rgba(80,70,60,0.35)'; for (let i = 0; i < 9; i++) x.fillRect(W * (0.08 + i * 0.1), H * 0.61, W * 0.06, 4);
    x.strokeStyle = 'rgba(70,60,50,0.18)'; x.lineWidth = 2; for (let i = 0; i < 14; i++) { x.beginPath(); x.moveTo(r() * W, r() * H); x.lineTo(r() * W, r() * H); x.stroke(); }
    const n = noise2(90 + scheme, 512, 4, 8, 8), img = x.getImageData(0, 0, W, H), d = img.data;
    for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) { const k = (j * W + i) * 4, v = 0.9 + (n[(j % 512) * 512 + (i % 512)] - 0.5) * 0.3; d[k] *= v; d[k + 1] *= v; d[k + 2] *= v; } x.putImageData(img, 0, 0);
    const m = new THREE.MeshStandardMaterial({ map: toTex(c), roughness: 0.92 }); m.userData.tileM = 1; return m;
  });
}
export function plastic(color = 0x2d6cc0, { roughness = 0.5, seed = 2 } = {}) { return memo(`pl${color}/${roughness}`, () => { const m = new THREE.MeshStandardMaterial({ color, roughness, metalness: 0 }); m.userData.tileM = 1; return m; }); }
/** blue/green polythene tarpaulin */
export function tarp(color = 0x3a78b8, seed = 3) {
  return memo(`tarp${color}/${seed}`, () => {
    const S = 512, f = noise2(seed, S, 4, 5), r = rng(seed), c = paint(S, (i, x, y, o) => { const wv = ((x % 8) < 1 || (y % 8) < 1) ? 0.92 : 1, v = (0.92 + (f[i] - 0.5) * 0.14 + (r() - 0.5) * 0.04) * wv; o[0] = o[1] = o[2] = v * 255; });
    return std(c, grey(S, f, 255), { tileM: 1.5, bumpScale: 0.3, roughness: 0.55, color, side: THREE.DoubleSide });
  });
}
export function solidMat(color, { roughness = 0.7, metalness = 0, ...rest } = {}) { const m = new THREE.MeshStandardMaterial({ color, roughness, metalness, ...rest }); m.userData.tileM = 1; return m; }
