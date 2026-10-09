// =============================================================================
// Asif Builders - procedural SVG illustration set (interiors + services)
// Run:  node scripts/art/interiors-services.mjs
// Writes 17 self-contained SVGs (1200x900) into archive/illustrations/
// No dependencies. Every file prefixes its <defs> ids so inlining is collision free.
// =============================================================================
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../archive/illustrations');
fs.mkdirSync(OUT, { recursive: true });

// ----------------------------------------------------------------- palette
const C = {
  navy: '#0f2238', navy2: '#183250', navy3: '#27496d', navy4: '#3d6590',
  char: '#2b2f36', char2: '#3b4048', char3: '#5a6069',
  brass: '#c9a24b', brassL: '#e8cc84', brassD: '#8f6f2a',
  cream: '#f4efe6', cream2: '#ebe3d4', white: '#fbf9f4',
  sand: '#d9c9a8', sand2: '#c3b08a', sandD: '#a38f68',
  wood: '#8c5b38', woodL: '#b98558', woodD: '#5a3722', oak: '#c19a6b', walnut: '#6d4529',
  sage: '#7c8f6a', sageD: '#4f6444', leaf: '#5d7f4e', leafD: '#3d5c38', leafL: '#8aa66c',
  terra: '#b5603c', terraD: '#8a4528', rust: '#a4502e', teal: '#2f6f73', tealD: '#1f4f55',
  marble: '#ece8e0', stone: '#bdb7ab', glass: '#cfe2ea', sky: '#bcd6e6', skyD: '#8db3cc',
  red: '#a8372d', brick: '#b0593a', brickD: '#8d4529', concrete: '#a9a9a6', concreteD: '#86878a',
};

// ------------------------------------------------------------ colour utils
const hex2rgb = (h) => { h = h.replace('#', ''); if (h.length === 3) h = h.split('').map((c) => c + c).join(''); const n = parseInt(h, 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
const rgb2hex = (r, g, b) => '#' + [r, g, b].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
const mix = (a, b, t) => { const A = hex2rgb(a), B = hex2rgb(b); return rgb2hex(A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t); };
const lighten = (c, t) => mix(c, '#ffffff', t);
const darken = (c, t) => mix(c, '#000000', t);
const shade = (c, t) => mix(c, '#141a2a', t); // shadows lean cool/navy for a consistent look
const warm = (c, t) => mix(c, '#ffd9a0', t);

// ------------------------------------------------------------------- random
let _seed = 1;
const reseed = (s) => { _seed = s >>> 0; };
const rnd = () => { _seed |= 0; _seed = (_seed + 0x6d2b79f5) | 0; let t = Math.imul(_seed ^ (_seed >>> 15), 1 | _seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const rr = (a, b) => a + (b - a) * rnd();

// -------------------------------------------------------------- scene state
let S = null;
function begin(prefix) { S = { p: 'ab-' + prefix, defs: new Map(), body: [] }; reseed(7); }
const id = (n) => `${S.p}-${n}`;
const url = (n) => `url(#${id(n)})`;
const add = (...parts) => { for (const p of parts) if (p) S.body.push(Array.isArray(p) ? p.join('') : p); };
const addDef = (key, str) => { if (!S.defs.has(key)) S.defs.set(key, str); };
const r1 = (n) => (Math.round(n * 10) / 10).toString();

const ALIAS = { sw: 'stroke-width', op: 'opacity', fo: 'fill-opacity', so: 'stroke-opacity', lj: 'stroke-linejoin', lc: 'stroke-linecap', da: 'stroke-dasharray', clip: 'clip-path', tf: 'transform', fr: 'fill-rule' };
function A(o) {
  if (!o) return '';
  let s = '';
  for (const k in o) {
    const v = o[k];
    if (v === undefined || v === null || v === false) continue;
    s += ` ${ALIAS[k] || k}="${typeof v === 'number' ? r1(v) : v}"`;
  }
  return s;
}
const rect = (x, y, w, h, fill, o) => `<rect x="${r1(x)}" y="${r1(y)}" width="${r1(w)}" height="${r1(h)}" fill="${fill}"${A(o)}/>`;
const circle = (cx, cy, rad, fill, o) => `<circle cx="${r1(cx)}" cy="${r1(cy)}" r="${r1(rad)}" fill="${fill}"${A(o)}/>`;
const ellipse = (cx, cy, rx, ry, fill, o) => `<ellipse cx="${r1(cx)}" cy="${r1(cy)}" rx="${r1(rx)}" ry="${r1(ry)}" fill="${fill}"${A(o)}/>`;
const line = (x1, y1, x2, y2, stroke, sw = 1, o) => `<line x1="${r1(x1)}" y1="${r1(y1)}" x2="${r1(x2)}" y2="${r1(y2)}" stroke="${stroke}" stroke-width="${r1(sw)}"${A(o)}/>`;
const poly = (pts, fill, o) => `<polygon points="${pts.map((p) => r1(p[0]) + ',' + r1(p[1])).join(' ')}" fill="${fill}"${A(o)}/>`;
const pline = (pts, stroke, sw = 1, o) => `<polyline points="${pts.map((p) => r1(p[0]) + ',' + r1(p[1])).join(' ')}" fill="none" stroke="${stroke}" stroke-width="${r1(sw)}"${A(o)}/>`;
const path_ = (d, fill, o) => `<path d="${d}" fill="${fill}"${A(o)}/>`;
const stroke_ = (d, stroke, sw = 1, o) => `<path d="${d}" fill="none" stroke="${stroke}" stroke-width="${r1(sw)}"${A(o)}/>`;
const g = (inner, o) => `<g${A(o)}>${Array.isArray(inner) ? inner.join('') : inner}</g>`;
const T = (x, y, extra = '') => `translate(${r1(x)} ${r1(y)})${extra ? ' ' + extra : ''}`;
const rrect = (x, y, w, h, rad, fill, o) => rect(x, y, w, h, fill, { rx: rad, ...o });

// -------------------------------------------------------- defs: gradients etc
function lin(name, stops, c = [0, 0, 0, 1], units) {
  addDef('lin' + name, `<linearGradient id="${id(name)}" x1="${c[0]}" y1="${c[1]}" x2="${c[2]}" y2="${c[3]}"${units ? ` gradientUnits="${units}"` : ''}>${stops.map((s) => `<stop offset="${s[0]}" stop-color="${s[1]}"${s[2] !== undefined ? ` stop-opacity="${s[2]}"` : ''}/>`).join('')}</linearGradient>`);
  return url(name);
}
function radial(name, stops, c = [0.5, 0.5, 0.5], units, extra = '') {
  addDef('rad' + name, `<radialGradient id="${id(name)}" cx="${c[0]}" cy="${c[1]}" r="${c[2]}"${units ? ` gradientUnits="${units}"` : ''}${extra}>${stops.map((s) => `<stop offset="${s[0]}" stop-color="${s[1]}"${s[2] !== undefined ? ` stop-opacity="${s[2]}"` : ''}/>`).join('')}</radialGradient>`);
  return url(name);
}
const hkey = (s) => { let h = 0; for (const ch of s) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return h.toString(36); };
const vgrad = (top, bot) => lin('v' + hkey(top + bot), [[0, top], [1, bot]]);
const hgrad = (l, rgt) => lin('h' + hkey(l + rgt), [[0, l], [1, rgt]], [0, 0, 1, 0]);
// soft vertical shading for a flat colour (light top -> deeper bottom)
const soft = (c, up = 0.07, dn = 0.1) => vgrad(lighten(c, up), shade(c, dn));
function blur(n) {
  const nm = 'bl' + String(n).replace('.', '_');
  addDef(nm, `<filter id="${id(nm)}" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="${n}"/></filter>`);
  return url(nm);
}
function pattern(name, w, h, inner, extra = '') {
  addDef('pat' + name, `<pattern id="${id(name)}" width="${w}" height="${h}" patternUnits="userSpaceOnUse"${extra}>${inner}</pattern>`);
  return url(name);
}
function clipDef(name, shapes) {
  addDef('clip' + name, `<clipPath id="${id(name)}">${shapes}</clipPath>`);
  return url(name);
}

function finish(file, title, desc, zoom) {
  const p = S.p;
  if (zoom) { // zoom/crop the scene (everything but the final vignette layer)
    const [s, cx, cy, dy] = zoom; const last = S.body.pop();
    S.body = [`<g transform="translate(${r1(cx * (1 - s))} ${r1(cy * (1 - s) + dy)}) scale(${s})">`, ...S.body, '</g>', last];
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 900" width="1200" height="900" role="img" aria-labelledby="${p}-title ${p}-desc">\n<title id="${p}-title">${title}</title>\n<desc id="${p}-desc">${desc}</desc>\n<defs>${[...S.defs.values()].join('')}</defs>\n${S.body.join('\n')}\n</svg>\n`;
  fs.writeFileSync(path.join(OUT, file), svg);
  console.log(file.padEnd(34), (svg.length / 1024).toFixed(1) + ' KB');
  if (svg.length > 200 * 1024) console.warn('  WARNING: over 200KB');
}

// ------------------------------------------------------ shared decorations
// soft contact shadow polygon / ellipse
const shadowPoly = (pts, op = 0.35, b = 8) => poly(pts, '#0a0f1c', { op, filter: blur(b) });
const shadowEll = (cx, cy, rx, ry, op = 0.35, b = 8) => ellipse(cx, cy, rx, ry, '#0a0f1c', { op, filter: blur(b) });
// abstract "text" lines
const textLines = (x, y, w, n, col, h = 3, gap = 8, o) => {
  let s = '';
  for (let i = 0; i < n; i++) { const ww = i === n - 1 ? w * rr(0.4, 0.7) : w * rr(0.82, 1); s += rect(x, y + i * gap, ww, h, col, { rx: h / 2, ...o }); }
  return s;
};
// sparkle / star
const star4 = (x, y, rad, fill, o) => path_(`M${r1(x)} ${r1(y - rad)}Q${r1(x)} ${r1(y)} ${r1(x + rad)} ${r1(y)}Q${r1(x)} ${r1(y)} ${r1(x)} ${r1(y + rad)}Q${r1(x)} ${r1(y)} ${r1(x - rad)} ${r1(y)}Q${r1(x)} ${r1(y)} ${r1(x)} ${r1(y - rad)}Z`, fill, o);
const regPoly = (cx, cy, rad, n, rot, fill, o) => poly(Array.from({ length: n }, (_, i) => [cx + rad * Math.cos(rot + (i * 2 * Math.PI) / n), cy + rad * Math.sin(rot + (i * 2 * Math.PI) / n)]), fill, o);
const starPoly = (cx, cy, ro, ri, n, rot, fill, o) => poly(Array.from({ length: n * 2 }, (_, i) => { const rad = i % 2 ? ri : ro; const a = rot + (i * Math.PI) / n; return [cx + rad * Math.cos(a), cy + rad * Math.sin(a)]; }), fill, o);

// =============================================================================
// Pseudo-3D camera for interiors (one-point perspective, metres)
// X: left/right of camera axis, h: height above floor, Z: distance from camera
// =============================================================================
class Cam {
  constructor(f, cx, cy, eye) { this.f = f; this.cx = cx; this.cy = cy; this.eye = eye; }
  P(X, h, Z) { const s = this.f / Z; return [this.cx + X * s, this.cy + (this.eye - h) * s]; }
  s(Z) { return this.f / Z; }
  quad(pts, fill, o) { return poly(pts.map((p) => this.P(p[0], p[1], p[2])), fill, o); }
  frect(X0, X1, h0, h1, Z, fill, o) { const a = this.P(X0, h0, Z), b = this.P(X1, h1, Z); return rect(a[0], b[1], b[0] - a[0], a[1] - b[1], fill, o); }
  fq(x0, x1, z0, z1, fill, o) { return this.quad([[x0, 0, z0], [x1, 0, z0], [x1, 0, z1], [x0, 0, z1]], fill, o); }
  // horizontal quad at height h
  hq(x0, x1, z0, z1, h, fill, o) { return this.quad([[x0, h, z0], [x1, h, z0], [x1, h, z1], [x0, h, z1]], fill, o); }
  // axis aligned box with automatic shading; col: string or {front,top,left,right}
  box(x0, x1, y0, y1, z0, z1, col, o = {}) {
    const c = typeof col === 'string'
      ? { front: col, top: lighten(col, o.topL ?? 0.16), left: shade(col, 0.22), right: lighten(col, 0.03) }
      : col;
    let out = '';
    const st = (f) => ({ stroke: f, sw: 0.7, lj: 'round' });
    if (x0 > 0) out += this.quad([[x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0]], c.left, st(c.left));
    if (x1 < 0) out += this.quad([[x1, y0, z0], [x1, y0, z1], [x1, y1, z1], [x1, y1, z0]], c.right, st(c.right));
    if (y1 < this.eye) out += this.quad([[x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]], c.top, st(c.top));
    if (y0 > this.eye) out += this.quad([[x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1]], shade(c.front, 0.2), st(c.front));
    const a = this.P(x0, y0, z0), b = this.P(x1, y1, z0);
    const fill = o.flat ? c.front : soft(c.front, o.fu ?? 0.05, o.fd ?? 0.1);
    out += rect(a[0], b[1], b[0] - a[0], a[1] - b[1], fill, { rx: o.rx ? o.rx * this.s(z0) : 0, stroke: c.front, sw: 0.5 });
    return out;
  }
  // ellipse-ish circle lying on a horizontal plane
  hcircle(cx, cz, rad, h, fill, o, n = 40) {
    const pts = Array.from({ length: n }, (_, i) => { const a = (i / n) * 2 * Math.PI; return this.P(cx + rad * Math.cos(a), h, cz + rad * Math.sin(a)); });
    return poly(pts, fill, o);
  }
  hellipse(cx, cz, rx, rz, h, fill, o, n = 40) {
    const pts = Array.from({ length: n }, (_, i) => { const a = (i / n) * 2 * Math.PI; return this.P(cx + rx * Math.cos(a), h, cz + rz * Math.sin(a)); });
    return poly(pts, fill, o);
  }
  // cylinder (vertical) from y0..y1 at (cx,cz), radius
  cyl(cx, cz, rad, y0, y1, col, o = {}) {
    const s = this.s(cz); const [bx, by] = this.P(cx, y0, cz); const [, ty] = this.P(cx, y1, cz);
    const rxp = rad * s, ryp = rad * s * (Math.abs(this.eye - y0) / cz) * 0.0 + rad * s * Math.min(0.9, Math.abs(this.eye - (y1)) / cz * 1.0 + 0.05);
    const ryb = rad * s * Math.min(0.9, Math.abs(this.eye - y0) / cz + 0.05);
    const ryt = rad * s * Math.min(0.9, Math.abs(this.eye - y1) / cz + 0.05);
    const fillSide = o.grad ?? hgrad(darken(col, 0.0), shade(col, 0.28));
    const gid = lin('cy' + hkey(col), [[0, shade(col, 0.2)], [0.35, lighten(col, 0.12)], [1, shade(col, 0.3)]], [0, 0, 1, 0]);
    let out = '';
    out += path_(`M${r1(bx - rxp)} ${r1(ty)}L${r1(bx - rxp)} ${r1(by)}A${r1(rxp)} ${r1(ryb)} 0 0 0 ${r1(bx + rxp)} ${r1(by)}L${r1(bx + rxp)} ${r1(ty)}Z`, gid);
    out += ellipse(bx, ty, rxp, ryt, lighten(col, 0.18));
    if (o.topFill) out += ellipse(bx, ty, rxp, ryt, o.topFill);
    return out;
  }
}

// Surfaces: map wall (u,v) coordinates to the screen -----------------------
const surfBack = (cam, Zb) => ({ map: (u, v) => cam.P(u, v, Zb), cam });
const surfL = (cam, W) => ({ map: (u, v) => cam.P(-W, v, u), cam });
const surfR = (cam, W) => ({ map: (u, v) => cam.P(W, v, u), cam });
const sq = (Sf, u0, u1, v0, v1, fill, o) => poly([Sf.map(u0, v0), Sf.map(u1, v0), Sf.map(u1, v1), Sf.map(u0, v1)], fill, o);
const sp = (Sf, pts, fill, o) => poly(pts.map((p) => Sf.map(p[0], p[1])), fill, o);
const sl = (Sf, u0, v0, u1, v1, stroke, sw = 1, o) => { const a = Sf.map(u0, v0), b = Sf.map(u1, v1); return line(a[0], a[1], b[0], b[1], stroke, sw, o); };
const sc = (Sf, cu, cv, ru, rv, fill, o, n = 48) => poly(Array.from({ length: n }, (_, i) => { const a = (i / n) * 2 * Math.PI; return Sf.map(cu + ru * Math.cos(a), cv + rv * Math.sin(a)); }), fill, o);
// arch shape (u0..u1 wide, bottom v0, spring height vs, top v1)
const sarch = (Sf, u0, u1, v0, v1, fill, o, n = 24) => {
  const cu = (u0 + u1) / 2, ru = (u1 - u0) / 2, vs = v1 - ru;
  const pts = [[u0, v0], [u1, v0], [u1, vs]];
  for (let i = 1; i < n; i++) { const a = (i / n) * Math.PI; pts.push([cu + ru * Math.cos(a), vs + ru * Math.sin(a)]); }
  pts.push([u0, vs]);
  return sp(Sf, pts, fill, o);
};

// ----------------------------------------------------------------- room shell
// Draws ceiling, back wall, side walls and floor with ambient shading.
function roomShell(cam, R) {
  const { W, H, Zb, Zn = 1.0 } = R;
  const out = [];
  const bl = cam.P(-W, 0, Zb), tr = cam.P(W, H, Zb);
  out.push(cam.quad([[-W, H, Zn], [W, H, Zn], [W, H, Zb], [-W, H, Zb]], R.ceiling || vgrad(lighten(C.cream, 0.4), C.cream2)));
  out.push(cam.quad([[-W, 0, Zn], [-W, H, Zn], [-W, H, Zb], [-W, 0, Zb]], R.wallL || R.wall));
  out.push(cam.quad([[W, 0, Zn], [W, H, Zn], [W, H, Zb], [W, 0, Zb]], R.wallR || R.wall));
  out.push(rect(bl[0], tr[1], tr[0] - bl[0], bl[1] - tr[1], R.wallB || R.wall));
  out.push(cam.quad([[-W, 0, Zn], [W, 0, Zn], [W, 0, Zb], [-W, 0, Zb]], R.floor));
  return out.join('');
}
// wall/floor/ceiling ambient occlusion + corner shading
function roomShade(cam, R, o = {}) {
  const { W, H, Zb, Zn = 1.0 } = R;
  const out = [];
  const a = o.ao ?? 0.22;
  // corners (soft vertical strips)
  const gL = lin('aoL', [[0, '#0a1020', a], [1, '#0a1020', 0]], [0, 0, 1, 0]);
  const gR = lin('aoR', [[0, '#0a1020', 0], [1, '#0a1020', a]], [0, 0, 1, 0]);
  const bl = cam.P(-W, 0, Zb), tr = cam.P(W, H, Zb);
  out.push(rect(bl[0], tr[1], 46, bl[1] - tr[1], gL));
  out.push(rect(tr[0] - 46, tr[1], 46, bl[1] - tr[1], gR));
  // ceiling / back wall junction
  out.push(rect(bl[0], tr[1], tr[0] - bl[0], 40, lin('aoT', [[0, '#0a1020', a * 0.9], [1, '#0a1020', 0]])));
  // back wall / floor junction
  out.push(rect(bl[0], bl[1] - 34, tr[0] - bl[0], 34, lin('aoB', [[0, '#0a1020', 0], [1, '#0a1020', a * 0.8]])));
  return out.join('');
}
// Floor tile grid in perspective
function floorGrid(cam, R, size, col, sw = 1, op = 0.35, offX = 0, offZ = 0) {
  const { W, Zb, Zn = 1.0 } = R; const out = [];
  for (let x = -Math.floor(W / size) * size + offX; x <= W + 1e-6; x += size) { const a = cam.P(x, 0, Zn), b = cam.P(x, 0, Zb); out.push(line(a[0], a[1], b[0], b[1], col, sw, { op })); }
  for (let z = Zb - offZ; z >= Zn; z -= size) { const a = cam.P(-W, 0, z), b = cam.P(W, 0, z); out.push(line(a[0], a[1], b[0], b[1], col, sw, { op })); }
  return out.join('');
}
// Glossy floor sheen
function floorSheen(cam, R, op = 0.32) {
  const { W, Zb, Zn = 1.0 } = R;
  return cam.quad([[-W, 0, Zn], [W, 0, Zn], [W, 0, Zb], [-W, 0, Zb]], lin('fsheen', [[0, '#ffffff', 0], [0.55, '#ffffff', 0], [1, '#ffffff', op]], [0, 1, 0, 0]));
}
// Skirting boards along three walls
function skirting(cam, R, h = 0.1, col = C.white) {
  const { W, Zb, Zn = 1.0 } = R; const out = [];
  out.push(cam.frect(-W, W, 0, h, Zb, col));
  out.push(cam.quad([[-W, 0, Zn], [-W, h, Zn], [-W, h, Zb], [-W, 0, Zb]], shade(col, 0.1)));
  out.push(cam.quad([[W, 0, Zn], [W, h, Zn], [W, h, Zb], [W, 0, Zb]], shade(col, 0.06)));
  return out.join('');
}

// global vignette + warm glow finishing layer
function finishLayer(o = {}) {
  addDef('radvig', `<radialGradient id="${id('vig')}" gradientUnits="userSpaceOnUse" cx="600" cy="450" r="780"><stop offset="0.55" stop-color="#0a1020" stop-opacity="0"/><stop offset="1" stop-color="#0a1020" stop-opacity="${o.vig ?? 0.38}"/></radialGradient>`);
  let s = rect(0, 0, 1200, 900, url('vig'));
  if (o.glow) s += rect(0, 0, 1200, 900, radial('glow', [[0, o.glow, o.glowOp ?? 0.22], [1, o.glow, 0]], [o.gx ?? 0.5, o.gy ?? 0.4, 0.65]), { style: 'mix-blend-mode:screen' });
  return s;
}

// =============================================================================
// Decor helpers (screen space; k = pixels per metre at that object's depth)
// =============================================================================
function leafShape(len, wid) { // leaf pointing up from origin
  return `M0 0C${r1(wid)} ${r1(-len * 0.25)} ${r1(wid * 0.9)} ${r1(-len * 0.75)} 0 ${r1(-len)}C${r1(-wid * 0.9)} ${r1(-len * 0.75)} ${r1(-wid)} ${r1(-len * 0.25)} 0 0Z`;
}
function pot(x, y, k, col = C.terra, h = 0.34, w = 0.34) {
  const topW = w * k, botW = w * 0.72 * k, hh = h * k;
  const gr = lin('pot' + hkey(col), [[0, shade(col, 0.2)], [0.4, lighten(col, 0.1)], [1, shade(col, 0.32)]], [0, 0, 1, 0]);
  return shadowEll(x, y, topW * 0.6, topW * 0.12, 0.35, 6) +
    path_(`M${r1(x - topW / 2)} ${r1(y - hh)}L${r1(x + topW / 2)} ${r1(y - hh)}L${r1(x + botW / 2)} ${r1(y)}Q${r1(x)} ${r1(y + topW * 0.1)} ${r1(x - botW / 2)} ${r1(y)}Z`, gr) +
    ellipse(x, y - hh, topW / 2, topW * 0.07, shade(col, 0.35)) +
    rect(x - topW / 2 - 1.5, y - hh - topW * 0.03, topW + 3, topW * 0.07, lighten(col, 0.12), { rx: 3 });
}
function plantFiddle(x, y, k, o = {}) {
  const potH = (o.potH ?? 0.34), h = (o.h ?? 1.5);
  let s = pot(x, y, k, o.pot || C.char2, potH, 0.38);
  const ty = y - potH * k;
  s += stroke_(`M${r1(x)} ${r1(ty)}Q${r1(x + 6 * k / 100)} ${r1(ty - h * k * 0.5)} ${r1(x - 2)} ${r1(ty - h * k * 0.82)}`, C.woodD, Math.max(2, k * 0.035), { lc: 'round' });
  const n = o.n ?? 15; reseed(o.seed ?? 11);
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    const ly = ty - (0.28 + 0.62 * t) * h * k;
    const side = i % 2 ? 1 : -1;
    const ang = side * rr(35, 75);
    const len = (0.3 + 0.1 * (1 - t) + rr(0, 0.07)) * k;
    const col = mix(C.leafD, C.leafL, rr(0.05, 0.75));
    s += g(path_(leafShape(len, len * 0.42), col) + stroke_(`M0 0L0 ${r1(-len * 0.92)}`, lighten(col, 0.25), Math.max(0.8, k * 0.006), { op: 0.7 }), { tf: `translate(${r1(x + side * 3)} ${r1(ly)}) rotate(${r1(ang)})` });
  }
  return s;
}
function plantSnake(x, y, k, o = {}) {
  let s = pot(x, y, k, o.pot || C.sand2, 0.3, 0.34);
  const ty = y - 0.3 * k; reseed(o.seed ?? 5);
  const n = 9;
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    const a = (t - 0.5) * 38 + rr(-4, 4);
    const len = (0.55 + 0.5 * Math.sin(t * Math.PI) + rr(0, 0.12)) * k * (o.sc ?? 1);
    const w = k * 0.055;
    const col = mix(C.leafD, C.leaf, rr(0.2, 0.9));
    s += g(path_(`M${-w} 0C${-w * 1.2} ${r1(-len * 0.4)} ${-w * 0.5} ${r1(-len * 0.8)} 0 ${r1(-len)}C${w * 0.5} ${r1(-len * 0.8)} ${w * 1.2} ${r1(-len * 0.4)} ${w} 0Z`, col) + stroke_(`M${-w * 0.4} ${r1(-len * 0.1)}L${-w * 0.1} ${r1(-len * 0.8)}`, C.brassL, 1.2, { op: 0.45 }), { tf: `translate(${r1(x + (t - 0.5) * k * 0.12)} ${r1(ty)}) rotate(${r1(a)})` });
  }
  return s;
}
function plantPalm(x, y, k, o = {}) {
  let s = pot(x, y, k, o.pot || C.char2, 0.34, 0.4);
  const ty = y - 0.34 * k; reseed(o.seed ?? 3);
  const n = o.n ?? 11, h = (o.h ?? 1.2) * k;
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1); const a = (t - 0.5) * 150; const len = h * rr(0.7, 1.0);
    const col = mix(C.leafD, C.leafL, rr(0.1, 0.8));
    const ex = Math.sin((a * Math.PI) / 180) * len, ey = -Math.cos((a * Math.PI) / 180) * len;
    s += stroke_(`M${r1(x)} ${r1(ty)}Q${r1(x + ex * 0.35)} ${r1(ty + ey * 0.9)} ${r1(x + ex)} ${r1(ty + ey * 0.8 + len * 0.18)}`, col, Math.max(2, k * 0.02), { lc: 'round' });
    // leaflets
    for (let j = 1; j < 9; j++) {
      const tt = j / 9; const px = x + ex * tt * (0.9 - 0.3 * tt) * 1.05, py = ty + ey * tt * 0.95 + len * 0.18 * tt * tt;
      const sg = a < 0 ? -1 : 1;
      s += path_(`M${r1(px)} ${r1(py)}q${r1(sg * len * 0.1)} ${r1(-len * 0.05)} ${r1(sg * len * 0.2)} ${r1(len * 0.1)}q${r1(-sg * len * 0.1)} ${r1(-len * 0.01)} ${r1(-sg * len * 0.2)} ${r1(-len * 0.1)}Z`, col, { op: 0.9 });
      s += path_(`M${r1(px)} ${r1(py)}q${r1(-sg * len * 0.1)} ${r1(-len * 0.05)} ${r1(-sg * len * 0.2)} ${r1(len * 0.1)}q${r1(sg * len * 0.1)} ${r1(-len * 0.01)} ${r1(sg * len * 0.2)} ${r1(-len * 0.1)}Z`, mix(col, C.leafL, 0.2), { op: 0.85 });
    }
  }
  return s;
}
// abstract framed art (colour field + brass frame)
function frameArt(x, y, w, h, kind = 0, o = {}) {
  const fr = o.frame || C.brass;
  let s = shadowPoly([[x + 5, y + 7], [x + w + 5, y + 7], [x + w + 5, y + h + 7], [x + 5, y + h + 7]], 0.22, 5);
  s += rect(x, y, w, h, fr);
  s += rect(x + 3, y + 3, w - 6, h - 6, C.cream);
  const ix = x + 3, iy = y + 3, iw = w - 6, ih = h - 6;
  const cid = clipDef('fa' + Math.round(x) + '_' + Math.round(y), rect(ix, iy, iw, ih, '#000'));
  const pal = o.pal || [C.navy2, C.brass, C.terra, C.sage, C.sand];
  let inner = rect(ix, iy, iw, ih, pal[4 % pal.length] ? lighten(pal[4], 0.5) : C.cream);
  if (kind === 0) { inner += circle(ix + iw * 0.5, iy + ih * 0.42, Math.min(iw, ih) * 0.28, pal[1], { op: 0.95 }) + path_(`M${ix} ${iy + ih}L${ix} ${iy + ih * 0.7}Q${ix + iw * 0.3} ${iy + ih * 0.5} ${ix + iw * 0.6} ${iy + ih * 0.72}T${ix + iw} ${iy + ih * 0.66}L${ix + iw} ${iy + ih}Z`, pal[0]); }
  else if (kind === 1) { for (let i = 0; i < 4; i++) inner += rect(ix, iy + (ih / 4) * i, iw, ih / 4, [pal[0], pal[3], pal[2], pal[1]][i], { op: 0.85 }); inner += circle(ix + iw * 0.5, iy + ih * 0.5, Math.min(iw, ih) * 0.2, C.cream); }
  else if (kind === 2) { inner += path_(`M${ix} ${iy + ih * 0.7}Q${ix + iw * 0.25} ${iy + ih * 0.35} ${ix + iw * 0.5} ${iy + ih * 0.6}T${ix + iw} ${iy + ih * 0.5}L${ix + iw} ${iy + ih}L${ix} ${iy + ih}Z`, pal[0], { op: 0.9 }) + path_(`M${ix} ${iy + ih * 0.85}Q${ix + iw * 0.3} ${iy + ih * 0.6} ${ix + iw * 0.6} ${iy + ih * 0.82}T${ix + iw} ${iy + ih * 0.78}L${ix + iw} ${iy + ih}L${ix} ${iy + ih}Z`, pal[2], { op: 0.85 }) + circle(ix + iw * 0.7, iy + ih * 0.25, Math.min(iw, ih) * 0.12, pal[1]); }
  else { inner += regPoly(ix + iw / 2, iy + ih / 2, Math.min(iw, ih) * 0.34, 4, Math.PI / 4, pal[0]) + regPoly(ix + iw / 2, iy + ih / 2, Math.min(iw, ih) * 0.22, 4, Math.PI / 4, pal[1]) + regPoly(ix + iw / 2, iy + ih / 2, Math.min(iw, ih) * 0.1, 4, Math.PI / 4, pal[2]); }
  s += g(inner, { clip: cid });
  return s;
}
// table lamp with glow
function tableLamp(x, y, k, o = {}) {
  const sh = o.shade || C.cream, base = o.base || C.brass;
  let s = '';
  s += ellipse(x, y - 0.42 * k, 0.5 * k, 0.5 * k, radial('lg' + Math.round(x), [[0, '#ffd9a0', 0.55], [1, '#ffd9a0', 0]]), { 'style': 'mix-blend-mode:screen' });
  s += shadowEll(x, y, 0.1 * k, 0.025 * k, 0.4, 3);
  s += rect(x - 0.012 * k, y - 0.28 * k, 0.024 * k, 0.28 * k, base);
  s += ellipse(x, y - 0.02 * k, 0.07 * k, 0.025 * k, base);
  s += ellipse(x, y - 0.17 * k, 0.065 * k, 0.1 * k, vgrad(lighten(base, 0.25), darken(base, 0.1)));
  s += path_(`M${r1(x - 0.07 * k)} ${r1(y - 0.62 * k)}L${r1(x + 0.07 * k)} ${r1(y - 0.62 * k)}L${r1(x + 0.14 * k)} ${r1(y - 0.3 * k)}L${r1(x - 0.14 * k)} ${r1(y - 0.3 * k)}Z`, hgrad(warm(sh, 0.5), mix(sh, '#ffd9a0', 0.15)));
  s += ellipse(x, y - 0.62 * k, 0.07 * k, 0.014 * k, lighten(sh, 0.4));
  return s;
}
// vase with branches
function vase(x, y, k, col = C.teal, o = {}) {
  const h = (o.h ?? 0.3) * k, w = (o.w ?? 0.14) * k;
  let s = shadowEll(x, y, w * 0.6, w * 0.12, 0.35, 3);
  const gr = lin('va' + hkey(col), [[0, shade(col, 0.2)], [0.4, lighten(col, 0.2)], [1, shade(col, 0.35)]], [0, 0, 1, 0]);
  s += path_(`M${r1(x - w * 0.22)} ${r1(y - h)}Q${r1(x - w * 0.22)} ${r1(y - h * 0.8)} ${r1(x - w * 0.5)} ${r1(y - h * 0.4)}Q${r1(x - w * 0.55)} ${r1(y)} ${r1(x)} ${r1(y)}Q${r1(x + w * 0.55)} ${r1(y)} ${r1(x + w * 0.5)} ${r1(y - h * 0.4)}Q${r1(x + w * 0.22)} ${r1(y - h * 0.8)} ${r1(x + w * 0.22)} ${r1(y - h)}Z`, gr);
  s += ellipse(x, y - h, w * 0.22, w * 0.05, shade(col, 0.4));
  if (o.branch) {
    reseed(o.seed ?? 4);
    for (let i = 0; i < 5; i++) { const a = rr(-30, 30), l = rr(0.6, 1.1) * k * 0.4; const ex = x + Math.sin((a * Math.PI) / 180) * l, ey = y - h - Math.cos((a * Math.PI) / 180) * l; s += stroke_(`M${r1(x)} ${r1(y - h)}L${r1(ex)} ${r1(ey)}`, C.woodD, 1.5) + circle(ex, ey, k * 0.02, o.bloom || C.cream); }
  }
  return s;
}
// stack of books
function books(x, y, k, n = 3, o = {}) {
  let s = ''; const cols = o.cols || [C.navy2, C.brass, C.terra, C.sage, C.cream2];
  let yy = y; reseed(o.seed ?? 8);
  for (let i = 0; i < n; i++) { const h = rr(0.025, 0.04) * k, w = rr(0.2, 0.28) * k; s += rect(x - w / 2 + rr(-3, 3), yy - h, w, h, cols[i % cols.length], { rx: 1.5 }) + rect(x - w / 2 + 3, yy - h * 0.55, w - 6, h * 0.1, 'rgba(255,255,255,.4)'); yy -= h; }
  return s;
}
// brass chandelier hanging from (x, y0)
function chandelier(x, y0, k, o = {}) {
  const arms = o.arms ?? 6, rad = (o.r ?? 0.42) * k, col = o.col || C.brass;
  const cy = y0 + (o.drop ?? 0.5) * k;
  let s = '';
  s += rect(x - 0.018 * k, y0, 0.036 * k, cy - y0, col);
  s += ellipse(x, y0, 0.07 * k, 0.02 * k, darken(col, 0.2));
  // glow
  s += ellipse(x, cy + 0.1 * k, rad * 1.8, rad * 1.3, radial('chg' + hkey(String(x) + y0), [[0, '#ffe2a8', 0.5], [1, '#ffe2a8', 0]]), { style: 'mix-blend-mode:screen' });
  s += ellipse(x, cy, 0.08 * k, 0.07 * k, vgrad(lighten(col, 0.3), darken(col, 0.1)));
  for (let i = 0; i < arms; i++) {
    const t = (i / (arms - 1)) * 2 - 1; const ax = x + t * rad; const ay = cy + 0.06 * k + (1 - t * t) * 0.07 * k - 0.04 * k;
    s += stroke_(`M${r1(x)} ${r1(cy + 0.03 * k)}Q${r1(x + t * rad * 0.5)} ${r1(cy + 0.2 * k)} ${r1(ax)} ${r1(ay + 0.04 * k)}`, col, Math.max(1.5, k * 0.012), { lc: 'round' });
    s += ellipse(ax, ay + 0.045 * k, 0.025 * k, 0.012 * k, darken(col, 0.1));
    s += path_(`M${r1(ax - 0.014 * k)} ${r1(ay + 0.04 * k)}L${r1(ax - 0.012 * k)} ${r1(ay - 0.03 * k)}Q${r1(ax)} ${r1(ay - 0.07 * k)} ${r1(ax + 0.012 * k)} ${r1(ay - 0.03 * k)}L${r1(ax + 0.014 * k)} ${r1(ay + 0.04 * k)}Z`, '#fff3d0');
    s += circle(ax, ay - 0.02 * k, 0.045 * k, radial('chb' + hkey(String(ax)), [[0, '#fff6dc', 0.8], [1, '#ffdca0', 0]]), { style: 'mix-blend-mode:screen' });
  }
  if (o.crystals) for (let i = 0; i < 9; i++) { const t = i / 8 * 2 - 1; s += circle(x + t * rad * 0.8, cy + 0.2 * k + (1 - t * t) * 0.05 * k, 0.012 * k, '#fff', { op: 0.7 }); }
  return s;
}
// round pendant light (dome) hanging from the ceiling
function pendantDome(x, y0, k, len, rad, col = C.brass, o = {}) {
  const yb = y0 + len * k, r = rad * k;
  let s = line(x, y0, x, yb - r * 0.55, o.cord || C.char, Math.max(1.5, k * 0.01));
  s += ellipse(x, yb + r * 0.25, r * 1.9, r * 1.1, radial('pd' + hkey(String(x) + y0), [[0, '#ffe2a8', 0.45], [1, '#ffe2a8', 0]]), { style: 'mix-blend-mode:screen' });
  s += path_(`M${r1(x - r)} ${r1(yb)}A${r1(r)} ${r1(r * 0.9)} 0 0 1 ${r1(x + r)} ${r1(yb)}Z`, hgrad(lighten(col, 0.25), darken(col, 0.18)));
  s += ellipse(x, yb, r, r * 0.16, '#fff2c8');
  s += ellipse(x, yb + 1, r * 0.8, r * 0.1, '#ffe7a8', { op: 0.9 });
  return s;
}
// Persian-style rug pattern (screen-space painter; callback maps rug (u,v in 0..1) to screen)
function rugPaint(map, pal, o = {}) {
  const P = (u, v) => map(u, v);
  const Q = (u0, u1, v0, v1, fill, op) => poly([P(u0, v0), P(u1, v0), P(u1, v1), P(u0, v1)], fill, op ? { op } : undefined);
  const D = (cu, cv, ru, rv, fill, op) => poly([P(cu, cv - rv), P(cu + ru, cv), P(cu, cv + rv), P(cu - ru, cv)], fill, op ? { op } : undefined);
  const asp = o.asp ?? 1; // rug depth/width ratio so diamonds look square
  let s = '';
  s += Q(0, 1, 0, 1, pal.field);
  s += Q(0, 1, 0, 1, 'none');
  // border bands
  const b1 = 0.07, b2 = 0.115;
  s += poly([P(0, 0), P(1, 0), P(1, 1), P(0, 1)], pal.border);
  s += poly([P(b1 * asp, b1), P(1 - b1 * asp, b1), P(1 - b1 * asp, 1 - b1), P(b1 * asp, 1 - b1)], pal.accent);
  s += poly([P(b2 * 0.88 * asp, b2 * 0.88), P(1 - b2 * 0.88 * asp, b2 * 0.88), P(1 - b2 * 0.88 * asp, 1 - b2 * 0.88), P(b2 * 0.88 * asp, 1 - b2 * 0.88)], pal.field);
  // small diamonds along border
  const nU = o.nU ?? 12, nV = o.nV ?? 8;
  for (let i = 0; i < nU; i++) { const u = (i + 0.5) / nU; const ru = 0.016, rv = 0.026; s += D(u, 0.036, ru, rv, pal.motif, 0.9); s += D(u, 0.964, ru, rv, pal.motif, 0.9); }
  for (let i = 0; i < nV; i++) { const v = 0.1 + (i + 0.5) / nV * 0.8; s += D(0.036 * asp, v, 0.013, 0.026, pal.motif, 0.9); s += D(1 - 0.036 * asp, v, 0.013, 0.026, pal.motif, 0.9); }
  // medallion
  const cu = 0.5, cv = 0.5;
  s += D(cu, cv, 0.34, 0.36, pal.accent);
  s += D(cu, cv, 0.3, 0.32, pal.field2);
  s += D(cu, cv, 0.22, 0.235, pal.motif, 0.9);
  s += D(cu, cv, 0.185, 0.2, pal.field);
  s += D(cu, cv, 0.1, 0.11, pal.accent);
  s += D(cu, cv, 0.045, 0.05, pal.motif);
  // corner spandrels
  for (const [a, b] of [[0.2, 0.22], [0.8, 0.22], [0.2, 0.78], [0.8, 0.78]]) { s += D(a, b, 0.07, 0.085, pal.field2, 0.9); s += D(a, b, 0.035, 0.045, pal.motif, 0.9); }
  // field dots
  for (const [a, b] of [[0.5, 0.2], [0.5, 0.8], [0.18, 0.5], [0.82, 0.5]]) s += D(a, b, 0.022, 0.03, pal.motif, 0.85);
  return s;
}
// Concrete curtains (back wall style, screen-space panel with soft folds). Draws vertical folds.
function curtainFolds(x0, x1, y0, y1, col, nf = 8, o = {}) {
  const w = x1 - x0; let s = '';
  const cid = clipDef('cf' + Math.round(x0) + '_' + Math.round(y0), poly(o.shape || [[x0, y0], [x1, y0], [x1, y1], [x0, y1]], '#000'));
  const gr = lin('cfh' + hkey(col), [[0, shade(col, 0.2)], [0.5, lighten(col, 0.1)], [1, shade(col, 0.25)]], [0, 0, 1, 0]);
  let inner = '';
  for (let i = 0; i < nf; i++) {
    const a = x0 + (w / nf) * i;
    const cc = i % 2 ? shade(col, 0.12) : lighten(col, 0.06);
    inner += rect(a, y0 - 2, w / nf + 0.5, y1 - y0 + 4, o.sheer ? gr : (i % 2 ? hgrad(shade(col, 0.1), lighten(col, 0.03)) : hgrad(lighten(col, 0.05), shade(col, 0.12))), { op: o.sheer ? 0.55 + (i % 2) * 0.12 : 1 });
  }
  return g(inner, { clip: cid, op: o.op });
}

// =============================================================================
// 10. svc-renovation (before / after split)
// =============================================================================
function svcRenovation() {
  begin('srn');
  add(svcBg({ r: 360, cy: 450, ground: false }));
  const cx0 = 100, cy0 = 120, cw = 1000, ch = 660;
  const clipAll = clipDef('card', rrect(cx0, cy0, cw, ch, 30, '#000'));
  const dTop = 650, dBot = 540;
  const clipL = clipDef('half-l', poly([[cx0, cy0], [dTop, cy0], [dBot, cy0 + ch], [cx0, cy0 + ch]], '#000'));
  const clipR = clipDef('half-r', poly([[dTop, cy0], [cx0 + cw, cy0], [cx0 + cw, cy0 + ch], [dBot, cy0 + ch]], '#000'));
  add(shadowPoly([[cx0 + 10, cy0 + 24], [cx0 + cw + 10, cy0 + 24], [cx0 + cw + 10, cy0 + ch + 24], [cx0 + 10, cy0 + ch + 24]], 0.35, 16));
  const k = 1.5, fx = 600 - 260 * k, groundY = 700, fy = groundY - 358 * k;
  // ---------- BEFORE (left)
  let L = '';
  L += rect(cx0, cy0, cw, ch, lin('skyo', [[0, '#b8b7ab'], [0.7, '#dcd6c4'], [1, '#e8dfc8']], [0, 0, 0, 1]));
  L += cloud(250, 220, 1.4, 0.45) + cloud(520, 180, 1.0, 0.4);
  L += circle(180, 190, 38, '#e8e1cf', { op: 0.7 });
  // pole + wires
  L += rect(170, 230, 9, 520, '#4a4338') + rect(140, 262, 70, 6, '#4a4338') + rect(150, 300, 50, 5, '#4a4338');
  L += path_(`M140 265Q380 330 ${fx + 40} 300`, 'none', { stroke: '#2b2f36', sw: 1.6 }) + path_('M205 265Q420 320 640 285', 'none', { stroke: '#2b2f36', sw: 1.6 });
  // far buildings muted
  for (let i = 0; i < 8; i++) L += rect(cx0 + i * 90, groundY - 140 - (i % 3) * 30, 70, 160, '#9a9788', { op: 0.35 });
  // ground
  L += rect(cx0, groundY - 8, cw, 120, vgrad('#8d8670', '#6d6754'));
  L += poly([[cx0, groundY + 10], [cx0 + cw, groundY + 10], [cx0 + cw, groundY + 40], [cx0, groundY + 40]], '#a39b84', { op: 0.6 });
  for (let i = 0; i < 12; i++) L += rect(cx0 + 20 + i * 90, groundY + 14, 60, 4, '#5d5746', { op: 0.5 });
  L += pline([[250, groundY + 20], [262, groundY + 34], [256, groundY + 50]], '#3b3629', 1.5);
  for (let i = 0; i < 9; i++) L += path_(`M${cx0 + 40 + i * 55} ${groundY + 12}q3 -16 8 0M${cx0 + 46 + i * 55} ${groundY + 12}q-1 -12 -6 -2`, 'none', { stroke: '#7a8a52', sw: 2 });
  L += facade(fx, fy, k, 'old');
  // rusted gate left
  L += rect(fx - 10, groundY - 52, 90, 50, 'none') ;
  L += roundTreeDead(cx0 + 90, groundY + 6);
  add(g(g(L, { clip: clipL }), { clip: clipAll }));
  // ---------- AFTER (right)
  let Rr = '';
  Rr += rect(cx0, cy0, cw, ch, lin('skyn', [[0, '#8fc5e4'], [0.7, '#cfe6ee'], [1, '#f8ead0']], [0, 0, 0, 1]));
  Rr += circle(960, 230, 130, radial('sunn', [[0, '#fff3cf', 0.95], [1, '#fff3cf', 0]])) + circle(960, 230, 40, '#fff6dc');
  Rr += cloud(720, 200, 1.1, 0.95) + cloud(1000, 330, 0.9, 0.9);
  for (let i = 0; i < 8; i++) Rr += rect(cx0 + i * 90, groundY - 140 - (i % 3) * 30, 70, 160, '#8fb0c8', { op: 0.4 });
  Rr += rect(cx0, groundY - 8, cw, 120, vgrad('#9bb87a', '#7aa05c'));
  Rr += rect(cx0, groundY + 6, cw, 34, vgrad('#e4dcc7', '#cfc5ab'));
  for (let i = 0; i < 14; i++) Rr += line(cx0 + 20 + i * 76, groundY + 6, cx0 + 5 + i * 76, groundY + 40, '#b5ab90', 1.2, { op: 0.8 });
  Rr += facade(fx, fy, k, 'new');
  Rr += palmTree(1040, groundY, 190, 1.3) + roundTree(870 + 60, groundY + 8, 1.1, C.leaf);
  for (let i = 0; i < 6; i++) Rr += circle(cx0 + 740 + i * 40, groundY + 52, 14, mix(C.leafD, C.leafL, (i % 3) / 3));
  add(g(g(Rr, { clip: clipR }), { clip: clipAll }));
  // divider
  const dv = clipDef('divcard', rrect(cx0, cy0, cw, ch, 30, '#000'));
  add(g(line(dTop, cy0, dBot, cy0 + ch, '#000', 14, { op: 0.18, filter: blur(6) }) + line(dTop, cy0, dBot, cy0 + ch, '#fff', 9) + line(dTop, cy0, dBot, cy0 + ch, brassGradH(), 5), { clip: dv }));
  const mx = (dTop + dBot) / 2, my = cy0 + ch / 2;
  add(circle(mx + 3, my + 8, 40, '#000', { op: 0.3, filter: blur(6) }), circle(mx, my, 40, lin('knob', [[0, C.brassL], [1, C.brassD]], [0, 0, 1, 1])), circle(mx, my, 33, C.navy), path_(`M${mx - 20} ${my}L${mx - 8} ${my - 9}L${mx - 8} ${my + 9}Z`, C.cream), path_(`M${mx + 20} ${my}L${mx + 8} ${my - 9}L${mx + 8} ${my + 9}Z`, C.cream));
  // corner tags (icons)
  add(circle(160, 180, 34, 'rgba(15,34,56,.85)', { stroke: C.brass, sw: 2 }), pline([[146, 168], [158, 182], [152, 192], [166, 202]], '#e5d8b7', 3, { lc: 'round', lj: 'round' }));
  add(circle(1040, 180, 34, 'rgba(15,34,56,.9)', { stroke: C.brass, sw: 2 }), star4(1040, 180, 18, C.brassL), star4(1056, 166, 7, C.cream));
  add(rrect(cx0, cy0, cw, ch, 30, 'none', { stroke: C.brass, sw: 3 }));
  finish('svc-renovation.svg', 'Home renovation', 'A before-and-after split of one house facade: the left half is dated and weathered, the right half is renovated with a modern finish.');
}
function roundTreeDead(x, y) {
  return shadowEll(x, y, 30, 6, 0.25, 4) + path_(`M${x - 5} ${y}L${x - 3} ${y - 90}L${x + 3} ${y - 90}L${x + 5} ${y}Z`, '#4a3d2e') + stroke_(`M${x} ${y - 70}L${x - 30} ${y - 110}M${x} ${y - 60}L${x + 30} ${y - 95}M${x} ${y - 90}L${x - 12} ${y - 130}M${x} ${y - 88}L${x + 14} ${y - 125}`, '#4a3d2e', 4, { lc: 'round' });
}

// =============================================================================
// 11. svc-maintenance
// =============================================================================
function svcMaintenance() {
  begin('smt');
  add(svcBg({ mode: 'navy', r: 350, cy: 440, ground: false }));
  const k = 1.0, fx = 600 - 260 * k, fy = 545 - 358 * k;
  add(shadowEll(600, 552, 300, 14, 0.35, 8));
  add(facade(fx, fy, k, 'new'));
  add(wrenchBadge(880, 190, 68));
  add(ellipse(600, 770, 420, 60, '#0a1424', { op: 0.4, filter: blur(16) }));
  add(spanner(360, 590, 300, 34));
  add(hammer(840, 590, 300, -34));
  add(toolbox(430, 615, 340, 165));
  const nut = (x, y, r) => regPoly(x, y, r, 6, 0, lin('nut', [[0, '#eef1f4'], [1, '#7d838d']], [0, 0, 1, 1]), { stroke: '#555c66', sw: 1.2 }) + circle(x, y, r * 0.42, '#3a3f48') + circle(x, y, r * 0.3, '#6a717c');
  add(nut(300, 810, 22), nut(342, 830, 14), nut(880, 820, 18));
  add(screwdriver(1050, 560, 210, 22));
  finish('svc-maintenance.svg', 'Home maintenance', 'A modern house with a brass tools badge above a foreground of maintenance tools: spanner, hammer, screwdriver and a red toolbox.');
}

// =============================================================================
// 12. svc-finishing
// =============================================================================
function svcFinishing() {
  begin('sfn');
  add(svcBg({ r: 360, cy: 450, ground: false, flip: true }));
  const cx0 = 100, cy0 = 120, cw = 1000, ch = 640;
  const clip = clipDef('card', rrect(cx0, cy0, cw, ch, 30, '#000'));
  add(shadowPoly([[cx0 + 10, cy0 + 24], [cx0 + cw + 10, cy0 + 24], [cx0 + cw + 10, cy0 + ch + 24], [cx0 + 10, cy0 + ch + 24]], 0.35, 16));
  let sc = '';
  const wallB = 520; // wall bottom (skirting)
  // wall base
  sc += rect(cx0, cy0, cw, wallB - cy0, '#e4d8bd');
  // zone 1: raw masonry + partial plaster (left)
  const brk = brickPat('rawbrick', 34, 17, '#b0593a', '#a89e88', { seed: 5 });
  sc += rect(cx0, cy0 + 70, 330, wallB - cy0 - 70, brk);
  // plaster being applied (diagonal edge)
  sc += poly([[cx0 + 150, cy0 + 70], [cx0 + 330, cy0 + 70], [cx0 + 330, wallB], [cx0 + 100, wallB]], vgrad('#bdb7ab', '#a9a498'));
  reseed(5);
  for (let i = 0; i < 26; i++) { const yy = cy0 + 80 + i * 14; sc += path_(`M${cx0 + 150 + (i % 6) * 12 + (wallB - yy) * 0.0} ${yy}q40 ${rr(-6, 6)} ${rr(80, 150)} ${rr(-4, 4)}`, 'none', { stroke: i % 2 ? '#d1ccc0' : '#8f8a7d', sw: 3, op: 0.5, lc: 'round' }); }
  sc += poly([[cx0 + 150, cy0 + 70], [cx0 + 100, wallB]], 'none', { stroke: '#7d786b', sw: 3 });
  // zone 2: smooth finished wall with moulded panel (center)
  sc += rect(cx0 + 330, cy0 + 70, 380, wallB - cy0 - 70, vgrad('#f1e8d2', '#e0d3b4'));
  sc += rect(cx0 + 380, cy0 + 130, 280, 300, 'none', { stroke: '#fbf6ea', sw: 6 }) + rect(cx0 + 380, cy0 + 130, 280, 300, 'none', { stroke: '#c9bb99', sw: 1.4, tf: 'translate(3 3)' });
  sc += rect(cx0 + 404, cy0 + 154, 232, 252, 'none', { stroke: '#d3c5a3', sw: 1.2 });
  sc += rect(cx0 + 404, cy0 + 154, 232, 252, 'none', { stroke: '#fbf6ea', sw: 2, tf: 'translate(-1 -1)' });
  sc += rect(cx0 + 330, cy0 + 70, 380, wallB - cy0 - 70, radial('wlight', [[0, '#fff', 0.3], [1, '#fff', 0]], [0.4, 0.3, 0.7]));
  // zone 3: wall panel samples (right)
  const zx = cx0 + 710;
  sc += rect(zx, cy0 + 70, cw - 710, wallB - cy0 - 70, '#d9cdb2');
  // slats
  sc += rect(zx + 14, cy0 + 100, 84, wallB - cy0 - 130, '#6d4529');
  for (let i = 0; i < 12; i++) sc += rect(zx + 16 + i * 7, cy0 + 100, 5, wallB - cy0 - 130, mix(C.woodL, C.wood, (i * 37 % 10) / 10));
  // marble panel
  sc += rect(zx + 108, cy0 + 100, 84, wallB - cy0 - 130, vgrad('#f6f3ec', '#d9d5ca'));
  sc += path_(`M${zx + 118} ${cy0 + 100}Q${zx + 150} ${cy0 + 200} ${zx + 130} ${cy0 + 280}T${zx + 170} ${wallB - 30}`, 'none', { stroke: '#8f8e8b', sw: 1.6, op: 0.6 }) + path_(`M${zx + 170} ${cy0 + 100}Q${zx + 150} ${cy0 + 160} ${zx + 175} ${cy0 + 230}`, 'none', { stroke: C.brass, sw: 1, op: 0.6 });
  // fluted
  sc += rect(zx + 202, cy0 + 100, 84, wallB - cy0 - 130, '#2f6f73');
  for (let i = 0; i < 14; i++) sc += rect(zx + 202 + i * 6, cy0 + 100, 3.2, wallB - cy0 - 130, lighten('#2f6f73', 0.2), { op: 0.7 }) + rect(zx + 205 + i * 6, cy0 + 100, 2, wallB - cy0 - 130, '#0a2a2f', { op: 0.45 });
  for (const xx of [zx + 14, zx + 108, zx + 202]) sc += rect(xx - 3, cy0 + 96, 90, 6, C.brass) + rect(xx - 3, wallB - 34, 90, 6, C.brass);
  // cornice (crown moulding) across the top
  const cH = 70;
  sc += rect(cx0, cy0, cw, cH, vgrad('#fbf8f1', '#e1d8c3'));
  sc += rect(cx0, cy0 + 8, cw, 10, '#fff') + rect(cx0, cy0 + 18, cw, 6, '#d9cfb6') + rect(cx0, cy0 + 34, cw, 4, C.brass) + rect(cx0, cy0 + 40, cw, 18, vgrad('#f0e9d8', '#d3c8ac')) + rect(cx0, cy0 + 58, cw, 12, vgrad('#fbf8f1', '#cdc2a6'));
  for (let i = 0; i < 42; i++) sc += rect(cx0 + 8 + i * 24, cy0 + 42, 12, 12, '#fff', { rx: 2, op: 0.65 }) + rect(cx0 + 8 + i * 24, cy0 + 51, 12, 3, '#b9ad8f', { op: 0.5 });
  sc += rect(cx0, cy0 + 70, cw, 8, '#000', { op: 0.12, filter: blur(3) });
  // skirting
  sc += rect(cx0, wallB - 28, cw, 28, vgrad('#fbf8f1', '#d9cfb6')) + rect(cx0, wallB - 28, cw, 3, '#fff') + rect(cx0, wallB - 4, cw, 4, '#000', { op: 0.1 });
  // floor (perspective) with tiles
  const fy0 = wallB, fy1 = 770;
  const topL = cx0 - 0, topR = cx0 + cw, botL = cx0 - 220, botR = cx0 + cw + 220;
  const aF = 1.25; const sT = (t) => (1 - 1 / (1 + aF * t)) / (1 - 1 / (1 + aF));
  const fm = (u, t) => { const s_ = sT(t); const xl = topL + (botL - topL) * s_, xr = topR + (botR - topR) * s_; return [xl + (xr - xl) * u, fy0 + (fy1 - fy0) * s_]; };
  sc += poly([fm(0, 0), fm(1, 0), fm(1, 1), fm(0, 1)], vgrad('#c9bfa6', '#b3a88c'));
  // laid tiles on right 60%: cement-tile pattern
  const uLaid = 0.42; const nU = 20, nT = 7;
  const tileCols = ['#f1e8d2', '#27496d', '#d9c08a', '#b5603c'];
  for (let j = 0; j < nT; j++) for (let i = 0; i < nU; i++) {
    const u0 = i / nU, u1 = (i + 1) / nU; if (u1 < uLaid) continue;
    const t0 = j / nT, t1 = (j + 1) / nT;
    const c = (i + j) % 2 ? '#f1e8d2' : '#27496d';
    sc += poly([fm(Math.max(u0, uLaid), t0), fm(u1, t0), fm(u1, t1), fm(Math.max(u0, uLaid), t1)], c, { stroke: '#a89a74', sw: 1.2 });
    // small motif in each tile
    const mu = (Math.max(u0, uLaid) + u1) / 2, mt = (t0 + t1) / 2; const [mx_, my_] = fm(mu, mt); const sz = 4 + mt * 12;
    sc += poly([[mx_, my_ - sz * 0.45], [mx_ + sz * 0.8, my_], [mx_, my_ + sz * 0.45], [mx_ - sz * 0.8, my_]], (i + j) % 2 ? '#d9c08a' : '#d9c08a', { op: 0.85 });
  }
  // screed on the left with chalk lines + spacers
  for (let i = 0; i <= nU; i++) { if (i / nU > uLaid) break; const a = fm(i / nU, 0), b = fm(i / nU, 1); sc += line(a[0], a[1], b[0], b[1], '#f4efe6', 1, { op: 0.45, da: '5 5' }); }
  for (let j = 0; j <= nT; j++) { const a = fm(0, j / nT), b = fm(uLaid, j / nT); sc += line(a[0], a[1], b[0], b[1], '#f4efe6', 1, { op: 0.45, da: '5 5' }); }
  // mortar edge
  const [ea, eb] = [fm(uLaid, 0), fm(uLaid, 1)];
  sc += line(ea[0], ea[1], eb[0], eb[1], '#8f866f', 3);
  for (let j = 0; j < nT; j++) { const p = fm(uLaid, (j + 0.5) / nT); sc += pline([[p[0] - 5, p[1]], [p[0] + 5, p[1]]], '#e5602a', 2.4, {}) + pline([[p[0], p[1] - 5], [p[0], p[1] + 5]], '#e5602a', 2.4, {}); }
  // floor sheen
  sc += poly([fm(0, 0), fm(1, 0), fm(1, 1), fm(0, 1)], lin('fsh', [[0, '#fff', 0.0], [1, '#fff', 0.12]], [0, 0, 0, 1]));
  // floor shadow at wall base
  sc += rect(cx0, wallB, cw, 14, lin('fwb', [[0, '#000', 0.25], [1, '#000', 0]], [0, 0, 0, 1]));
  add(g(sc, { clip }));
  add(rrect(cx0, cy0, cw, ch, 30, 'none', { stroke: C.brass, sw: 3 }));
  // foreground tools: plaster trowel with plaster on hawk, tile + notched trowel
  add(shadowEll(300, 700, 150, 18, 0.3, 8));
  add(trowel(310, 650, 250, -14, { mortar: true }));
  add(trowel(850, 705, 240, 10, { notched: true }));
  // loose tile & spacers
  add(g(poly([[0, 0], [150, -30], [175, 110], [25, 140]], '#f1e8d2', { stroke: '#a89a74', sw: 2 }) + poly([[18, 18], [132, -6], [150, 94], [36, 118]], '#27496d') + poly([[77, 20], [100, 0], [135, 50], [100, 100], [60, 120], [30, 70]], '#d9c08a', { op: 0.9 }) + poly([[77, 45], [108, 40], [110, 75], [78, 80]], '#f1e8d2'), { tf: 'translate(520 670) rotate(8)' }));
  add(shadowEll(620, 790, 100, 14, 0.3, 6));
  finish('svc-finishing.svg', 'Interior and exterior finishing', 'A wall in three stages of finishing, raw masonry, plastered and panelled, with crown cornice and a floor half laid with patterned tiles, plus a plastering trowel and a loose tile.');
}

// =============================================================================
// pipes / electrical primitives
// =============================================================================
function pipeH(x1, x2, y, th, col, o = {}) { // horizontal pipe with cylindrical shading
  const gr = lin('pp' + hkey(col + th), [[0, lighten(col, 0.35)], [0.3, col], [1, shade(col, 0.35)]], [0, 0, 0, 1]);
  return rect(x1, y - th / 2, x2 - x1, th, gr, { stroke: shade(col, 0.4), sw: 0.8 }) + rect(x1, y - th / 2 + th * 0.15, x2 - x1, th * 0.12, '#fff', { op: 0.35 });
}
function pipeV(x, y1, y2, th, col) {
  const gr = lin('ppv' + hkey(col + th), [[0, lighten(col, 0.3)], [0.35, col], [1, shade(col, 0.35)]], [0, 0, 1, 0]);
  return rect(x - th / 2, y1, th, y2 - y1, gr, { stroke: shade(col, 0.4), sw: 0.8 }) + rect(x - th / 2 + th * 0.15, y1, th * 0.12, y2 - y1, '#fff', { op: 0.35 });
}
function elbow(x, y, th, col, quad) { // quad: 'ne','nw','se','sw' : the two arms go toward those directions; quarter-circle joint
  const r = th * 0.9; const gr = lin('el' + hkey(col), [[0, lighten(col, 0.25)], [1, shade(col, 0.3)]], [0, 0, 1, 1]);
  return circle(x, y, th * 0.68, gr, { stroke: shade(col, 0.4), sw: 0.8 }) + circle(x - th * 0.15, y - th * 0.15, th * 0.2, '#fff', { op: 0.35 });
}
function coupling(x, y, th, col, vertical = false) {
  return vertical ? rect(x - th * 0.68, y - th * 0.35, th * 1.36, th * 0.7, vgrad(lighten(col, 0.3), shade(col, 0.3)), { rx: 2, stroke: shade(col, 0.45), sw: 0.8 }) : rect(x - th * 0.35, y - th * 0.68, th * 0.7, th * 1.36, hgrad(lighten(col, 0.3), shade(col, 0.3)), { rx: 2, stroke: shade(col, 0.45), sw: 0.8 });
}
function valveWheel(x, y, s) {
  return rect(x - 8 * s, y - 14 * s, 16 * s, 28 * s, brassGradH(), { rx: 3 * s }) + rect(x - 3 * s, y - 34 * s, 6 * s, 22 * s, C.brassD) + ellipse(x, y - 36 * s, 22 * s, 6 * s, '#c0392b', { stroke: '#7d2219', sw: 1.2 }) + rect(x - 3 * s, y - 40 * s, 6 * s, 8 * s, '#7d2219');
}
function mcb(x, y, w, h, on = true) { return rect(x, y, w, h, '#f1f3f5', { rx: 2, stroke: '#8b929d', sw: 1 }) + rect(x + w * 0.2, y + h * 0.12, w * 0.6, h * 0.34, on ? '#2b2f36' : '#c0392b', { rx: 2 }) + rect(x + w * 0.28, y + (on ? h * 0.14 : h * 0.3), w * 0.44, h * 0.14, '#555c66', { rx: 1 }) + rect(x + w * 0.2, y + h * 0.62, w * 0.6, 3, '#8b929d', { op: 0.6, rx: 1.5 }) + rect(x + w * 0.2, y + h * 0.75, w * 0.4, 3, '#8b929d', { op: 0.4, rx: 1.5 }); }

// =============================================================================
// 13. svc-plumbing-electrical
// =============================================================================
function svcPlumbElec() {
  begin('spe');
  add(svcBg({ mode: 'navy', r: 360, cy: 450, ground: false }));
  const wx = 150, wy = 130, ww = 900, wh = 640;
  const clip = clipDef('wall', rrect(wx, wy, ww, wh, 24, '#000'));
  add(shadowPoly([[wx + 10, wy + 22], [wx + ww + 10, wy + 22], [wx + ww + 10, wy + wh + 22], [wx + 10, wy + wh + 22]], 0.45, 16));
  // plaster wall
  let w = rect(wx, wy, ww, wh, vgrad('#f4ecd9', '#e2d6bb'));
  reseed(3); for (let i = 0; i < 90; i++) w += circle(wx + rnd() * ww, wy + rnd() * wh, rr(1, 3), '#c9bb99', { op: 0.25 });
  // cutaway (jagged) revealing brick + services
  const cut = [[wx + 90, wy + 70], [wx + 300, wy + 56], [wx + 420, wy + 80], [wx + 560, wy + 52], [wx + 720, wy + 78], [wx + 810, wy + 60], [wx + 830, wy + 200], [wx + 812, wy + 330], [wx + 836, wy + 450], [wx + 800, wy + 580], [wx + 650, wy + 596], [wx + 520, wy + 574], [wx + 380, wy + 598], [wx + 240, wy + 576], [wx + 100, wy + 590], [wx + 74, wy + 470], [wx + 96, wy + 340], [wx + 70, wy + 210]];
  w += poly(cut, '#000', { op: 0.25, filter: blur(8), tf: 'translate(6 10)' });
  w += poly(cut, '#fbf8f0', { stroke: '#cdbf9e', sw: 8, lj: 'round' });
  const cutId = clipDef('cut', poly(cut, '#000'));
  let inner = rect(wx, wy, ww, wh, brickPat('pebrick', 52, 26, '#b0593a', '#cdbfa3', { seed: 7 }));
  inner += rect(wx, wy, ww, wh, lin('ish', [[0, '#000', 0.35], [0.1, '#000', 0], [0.9, '#000', 0], [1, '#000', 0.35]], [0, 0, 1, 0]));
  inner += rect(wx, wy, ww, wh, lin('isv', [[0, '#000', 0.4], [0.12, '#000', 0], [0.9, '#000', 0], [1, '#000', 0.3]], [0, 0, 0, 1]));
  // copper pipe network (hot/cold) left side
  const cu = '#c9703c', cuL = '#e39a62', th = 18;
  // horizontal main
  inner += pipeH(wx + 70, wx + 470, wy + 200, th, cu) + pipeV(wx + 470, wy + 200, wy + 420, th, cu) + elbow(wx + 470, wy + 200, th, cu) + pipeH(wx + 470, wx + 560, wy + 420, th, cu) + elbow(wx + 470, wy + 420, th, cu);
  inner += pipeV(wx + 150, wy + 200, wy + 560, th, cu) + elbow(wx + 150, wy + 200, th, cu);
  for (const [px, py, v] of [[wx + 150, wy + 330, true], [wx + 310, wy + 200, false], [wx + 470, wy + 320, true], [wx + 520, wy + 420, false]]) inner += coupling(px, py, th, cuL, v);
  // pipe clamps
  for (const [px, py, v] of [[wx + 230, wy + 200, false], [wx + 390, wy + 200, false], [wx + 150, wy + 260, true], [wx + 150, wy + 460, true], [wx + 470, wy + 260, true]]) inner += (v ? rect(px - th * 0.75, py - 5, th * 1.5, 10, '#8b929d', { rx: 3, stroke: '#555c66', sw: 0.8 }) + circle(px - th * 0.55, py, 2, '#444') + circle(px + th * 0.55, py, 2, '#444') : rect(px - 5, py - th * 0.75, 10, th * 1.5, '#8b929d', { rx: 3, stroke: '#555c66', sw: 0.8 }) + circle(px, py - th * 0.55, 2, '#444') + circle(px, py + th * 0.55, 2, '#444'));
  inner += valveWheel(wx + 310, wy + 200 - 6, 1.0);
  // PVC (white/grey) drain stack with blue-stripe supply
  const pv = '#e9eef2';
  inner += pipeV(wx + 560, wy + 80, wy + 600, 34, pv) + rect(wx + 543, wy + 80, 34, 10, '#c3ccd4') + rect(wx + 543, wy + 330, 34, 14, '#c3ccd4', { rx: 2 });
  inner += pipeH(wx + 400, wx + 560, wy + 520, 26, pv) + coupling(wx + 470, wy + 520, 26, '#c3ccd4', false) + circle(wx + 560, wy + 520, 18, '#d3dae0', { stroke: '#8b929d', sw: 1 });
  inner += pipeV(wx + 605, wy + 80, wy + 500, 14, '#3b82c4') + pipeH(wx + 605, wx + 660, wy + 500, 14, '#3b82c4');
  for (let i = 0; i < 4; i++) inner += rect(wx + 560 - 17, wy + 150 + i * 90, 34, 5, '#8b929d', { op: 0.5 });
  // electrical: conduit + wires on right side
  const cd = '#8f969f';
  inner += pipeV(wx + 720, wy + 70, wy + 330, 22, cd) + pipeH(wx + 720, wx + 800, wy + 330, 22, cd) + circle(wx + 720, wy + 330, 15, lighten(cd, 0.15), { stroke: '#555c66', sw: 1 });
  for (let i = 0; i < 8; i++) inner += rect(wx + 709, wy + 100 + i * 30, 22, 3, '#555c66', { op: 0.45 });
  // wires hanging out of cut conduit: red, blue, green
  const wires = [['#d33a2c', 0], ['#2b6fc4', 5], ['#2f9e57', 10]];
  for (const [c, off] of wires) inner += path_(`M${wx + 715 + off - 5} ${wy + 280}C${wx + 690} ${wy + 360} ${wx + 660 - off * 2} ${wy + 420} ${wx + 690 - off} ${wy + 500}`, 'none', { stroke: c, sw: 3.4, lc: 'round' });
  add(g(rect(wx, wy, ww, wh, '#000', { op: 0 }), {}));
  // tap + hose
  // now compose
  add(g(w + g(inner, { clip: cutId }) + poly(cut, 'none', { stroke: '#f6efdc', sw: 3, lj: 'round' }), { clip }));
  add(rrect(wx, wy, ww, wh, 24, 'none', { stroke: C.brass, sw: 3 }));
  // ---- items in front of wall (surface mounted)
  // tap (basin mixer) at lower-left on plaster, with water stream and drop
  { const tx = wx + 150, ty = wy + 640;
    // wall tap (brass) coming from hidden pipe: place on plaster below the cut
  }
  // distribution board (top-right on wall)
  { const bx = wx + 640, by = wy + 40;
    add(rect(bx + 6, by + 10, 190, 150, '#000', { op: 0.3, filter: blur(7) }));
    add(rrect(bx, by, 190, 150, 6, vgrad('#c7ccd3', '#8e959f'), { stroke: '#555c66', sw: 2 }));
    add(rrect(bx + 10, by + 10, 170, 130, 4, '#2b2f36'));
    add(rect(bx + 16, by + 56, 158, 4, '#555c66') + rect(bx + 16, by + 112, 158, 4, '#555c66'));
    for (let r_ = 0; r_ < 2; r_++) for (let i = 0; i < 8; i++) add(mcb(bx + 20 + i * 19.5, by + 18 + r_ * 56, 17, 38, (i + r_) % 5 !== 0));
    add(rrect(bx + 10, by + 130, 170, 12, 3, '#e9ecef') + rect(bx + 20, by + 134, 60, 3, '#8b929d', { rx: 1.5 }));
    add(circle(bx + 6, by + 6, 2.4, '#555c66') + circle(bx + 184, by + 6, 2.4, '#555c66') + circle(bx + 6, by + 144, 2.4, '#555c66') + circle(bx + 184, by + 144, 2.4, '#555c66'));
    // warning triangle
    add(poly([[bx + 160, by - 2], [bx + 190, by - 2], [bx + 175, by - 24]], '#e8b84a', { stroke: '#2b2f36', sw: 1.4 }) + line(bx + 175, by - 20, bx + 175, by - 11, '#2b2f36', 2) + circle(bx + 175, by - 6, 1.4, '#2b2f36'));
  }
  // switch plate + socket (right-bottom, on plaster)
  { const sx = wx + 770, sy = wy + 480;
    add(rect(sx + 4, sy + 8, 100, 140, '#000', { op: 0.25, filter: blur(6) }));
    // switch plate (3 rockers)
    add(rrect(sx - 4, sy, 108, 70, 8, vgrad('#ffffff', '#e5e2da'), { stroke: '#cfc9b8', sw: 1.5 }));
    for (let i = 0; i < 3; i++) add(rrect(sx + 8 + i * 30, sy + 10, 24, 50, 5, vgrad('#fbfaf6', '#d6d2c6'), { stroke: '#b5ae9a', sw: 1 }), rect(sx + 12 + i * 30, sy + 14, 16, 18, '#fff', { op: 0.8, rx: 3 }));
    add(circle(sx + 98, sy + 6, 2, '#b5ae9a') + circle(sx + 98, sy + 64, 2, '#b5ae9a'));
    add(circle(sx + 20 + 30, sy + 52, 2, '#e5602a'));
    // socket plate
    add(rrect(sx - 4, sy + 86, 108, 70, 8, vgrad('#ffffff', '#e5e2da'), { stroke: '#cfc9b8', sw: 1.5 }));
    add(circle(sx + 50, sy + 121, 24, '#f4f2ea', { stroke: '#b5ae9a', sw: 1.4 }) + rect(sx + 38, sy + 108, 5, 16, '#2b2f36', { rx: 1.5 }) + rect(sx + 57, sy + 108, 5, 16, '#2b2f36', { rx: 1.5 }) + rect(sx + 47.5, sy + 128, 5, 8, '#2b2f36', { rx: 1.5 }));
    add(circle(sx + 8, sy + 92, 2, '#b5ae9a') + circle(sx + 98, sy + 150, 2, '#b5ae9a'));
  }
  // bulb hanging from top via cable: left-center over wall? place at center-top overlapping wall top
  { const bx = wx + 410, by = wy + 6;
    add(line(bx, wy - 60, bx, by + 70, '#2b2f36', 3));
    add(circle(bx, by + 118, 90, radial('bulbg', [[0, '#ffe9a8', 0.75], [1, '#ffe9a8', 0]]), { style: 'mix-blend-mode:screen' }));
    add(rect(bx - 14, by + 64, 28, 16, hgrad('#555c66', '#9aa1ab'), { rx: 3 }) + rect(bx - 14, by + 80, 28, 8, brassGradH()) + rect(bx - 12, by + 88, 24, 6, brassGradH()));
    add(path_(`M${bx - 11} ${by + 94}C${bx - 40} ${by + 110} ${bx - 36} ${by + 156} ${bx} ${by + 164}C${bx + 36} ${by + 156} ${bx + 40} ${by + 110} ${bx + 11} ${by + 94}Z`, radial('bulb', [[0, '#fffbe8'], [0.6, '#ffe9a8'], [1, '#f4c85a']], [0.5, 0.45, 0.6]), { stroke: '#e8c25a', sw: 1.2 }));
    add(path_(`M${bx - 6} ${by + 100}L${bx - 8} ${by + 128}L${bx} ${by + 118}L${bx + 8} ${by + 128}L${bx + 6} ${by + 100}`, 'none', { stroke: '#d68a2a', sw: 1.6, lc: 'round', lj: 'round' }));
    for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; add(line(bx + Math.cos(a) * 54, by + 130 + Math.sin(a) * 54, bx + Math.cos(a) * 68, by + 130 + Math.sin(a) * 68, '#ffe08a', 2.4, { lc: 'round', op: 0.9 })); }
  }
  // tap + water drops (bottom-left)
  { const tx = wx + 150, ty = wy + 548;
    const bs = (d, w_, c) => stroke_(d, c, w_, { lc: 'round', lj: 'round' });
    add(shadowEll(tx + 20, ty + 4, 50, 8, 0.3, 4));
    // wall flange
    add(rect(tx - 16, ty - 92, 32, 92, brassGradH(), { rx: 6, stroke: C.brassD, sw: 1 }));
    // spout (stroke pipe)
    add(bs(`M${tx} ${ty - 56}H${tx + 62}q30 0 30 30v14`, 24, C.brassD), bs(`M${tx} ${ty - 56}H${tx + 62}q30 0 30 30v14`, 20, C.brass), bs(`M${tx} ${ty - 61}H${tx + 62}q26 0 26 26v10`, 5, C.brassL));
    add(rect(tx + 80, ty - 14, 24, 12, brassGradH(), { rx: 3 }));
    // handles
    add(rect(tx - 4, ty - 92, 8, 16, C.brassD), ellipse(tx, ty - 98, 22, 7, '#3b82c4', { stroke: '#1e5a96', sw: 1.2 }), rect(tx - 4, ty - 4, 8, 4, C.brassD));
    add(path_(`M${tx + 92} ${ty - 2}q0 22 -1 44`, 'none', { stroke: '#a9d8f3', sw: 5, lc: 'round', op: 0.85 }));
    add(waterDrop(tx + 92, ty + 56, 16, lin('wd', [[0, '#8fd0f2'], [1, '#2f8fd0']], [0, 0, 0, 1]), { stroke: '#fff', sw: 1.5 }));
  }
  finish('svc-plumbing-electrical.svg', 'Plumbing and electrical', 'A wall cutaway revealing copper and PVC pipes with valve and brass tap, conduit and coloured wiring, a distribution board, light switches, a socket and a glowing bulb.');
}

// =============================================================================
// 14. svc-painting-waterproofing
// =============================================================================
function svcPaintWaterproof() {
  begin('spw');
  add(svcBg({ r: 350, cy: 450, flip: true, ground: false }));
  // ---------- left: painted wall card
  const lx = 90, ly = 140, lw = 520, lh = 600;
  const clipL = clipDef('lcard', rrect(lx, ly, lw, lh, 26, '#000'));
  add(shadowPoly([[lx + 10, ly + 22], [lx + lw + 10, ly + 22], [lx + lw + 10, ly + lh + 22], [lx + 10, ly + lh + 22]], 0.4, 14));
  let wl = rect(lx, ly, lw, lh, vgrad('#e1dccf', '#cfc9b9'));
  reseed(6); for (let i = 0; i < 140; i++) wl += circle(lx + rnd() * lw, ly + rnd() * lh, rr(0.8, 2.4), '#a9a291', { op: 0.3 });
  // fresh stripe (teal)
  const sx0 = 215, sx1 = 405, sTop = ly, sBot = 505;
  const teal = '#2f7f84';
  wl += rect(sx0, sTop, sx1 - sx0, sBot - sTop, lin('wet', [[0, '#3a8d92'], [0.5, '#2f7f84'], [1, '#2a7076']], [0, 0, 1, 0]));
  wl += rect(sx0, sTop, sx1 - sx0, sBot - sTop, lin('wet2', [[0, '#fff', 0], [0.7, '#fff', 0.0], [1, '#fff', 0.18]], [0, 0, 0, 1]));
  wl += rect(sx0 + 18, sTop, 14, sBot - sTop - 30, '#fff', { op: 0.16, rx: 7 }) + rect(sx0 + 60, sTop, 5, sBot - sTop - 50, '#fff', { op: 0.1, rx: 2.5 });
  // roller streak texture
  for (let i = 0; i < 20; i++) wl += rect(sx0 + 4 + i * 9, sTop, 1.4, sBot - sTop - 12, '#fff', { op: 0.05 });
  // wet edge at bottom + drips
  wl += path_(`M${sx0} ${sBot - 6}Q${(sx0 + sx1) / 2} ${sBot + 14} ${sx1} ${sBot - 6}V${sBot - 24}H${sx0}Z`, '#348a8f', { op: 0.9 });
  for (const [dx, dl] of [[0.18, 46], [0.38, 26], [0.62, 62], [0.82, 32]]) wl += rect(sx0 + (sx1 - sx0) * dx - 4, sBot, 8, dl, teal, { rx: 4 }) + circle(sx0 + (sx1 - sx0) * dx, sBot + dl, 6, teal) + circle(sx0 + (sx1 - sx0) * dx - 2, sBot + dl - 2, 2, '#fff', { op: 0.5 });
  // masking tape
  for (const tx of [sx0 - 14, sx1]) wl += rect(tx, ly, 14, sBot - ly + 20, '#f4e4a4', { op: 0.96 }) + rect(tx + 2, ly, 2, sBot - ly + 20, '#fff', { op: 0.5 });
  // drop cloth shadow / baseboard
  wl += rect(lx, ly + lh - 90, lw, 90, vgrad('#b6b0a0', '#8f8a7a')) + rect(lx, ly + lh - 94, lw, 6, '#fff');
  add(g(wl, { clip: clipL }));
  add(rrect(lx, ly, lw, lh, 26, 'none', { stroke: C.brass, sw: 3 }));
  // roller
  add(paintRoller(285, 505, 0.76, -5, '#e4e9ec'));
  add(g(rrect(0, 0, 0, 0, 0, 'none'), {}));
  // paint tins
  add(paintTin(300, 655, 120, 100, '#2f7f84'));
  add(paintTin(440, 676, 100, 80, '#c9a24b'));
  // brush leaning
  add(g(rrect(-7, 0, 14, 90, 6, hgrad(C.woodD, C.woodL), { stroke: C.woodD, sw: 1 }) + rect(-12, -26, 24, 30, hgrad('#c7ccd4', '#7d838d'), { rx: 2 }) + path_('M-11 -26Q0 -78 11 -26Z', '#2f7f84') + rect(-9, -62, 18, 6, '#fff', { op: 0.25 }), { tf: 'translate(580 690) rotate(30)' }));
  // colour swatch fan (paint chips)
  { const chips = ['#2f7f84', '#27496d', '#b5603c', '#d9c9a8', '#7c8f6a', '#c9a24b'];
    chips.forEach((c, i) => { const rot = 10 + i * 17; add(g(rrect(-18, -150, 36, 150, 5, '#fbf8f0', { stroke: '#cfc4aa', sw: 1 }) + rect(-14, -146, 28, 52, c, { rx: 3 }) + rect(-14, -90, 28, 40, lighten(c, 0.35), { rx: 3 }) + rect(-14, -46, 28, 30, lighten(c, 0.62), { rx: 3 }) + circle(0, -8, 4, '#cfc4aa'), { tf: `translate(190 650) rotate(${rot})` })); });
    add(circle(190, 650, 8, C.brass, { stroke: C.brassD, sw: 1.5 })); }
  // ---------- right: waterproofing slab section card
  const rx0 = 640, ry0 = 300, rw = 460, rh = 440;
  const clipR = clipDef('rcard', rrect(rx0, ry0, rw, rh, 26, '#000'));
  add(shadowPoly([[rx0 + 10, ry0 + 22], [rx0 + rw + 10, ry0 + 22], [rx0 + rw + 10, ry0 + rh + 22], [rx0 + 10, ry0 + rh + 22]], 0.4, 14));
  let rr_ = rect(rx0, ry0, rw, rh, lin('rsky', [[0, '#bcd9ea'], [0.55, '#e6eef0'], [1, '#f4ead4']], [0, 0, 0, 1]));
  rr_ += cloud(rx0 + 100, ry0 + 60, 0.8, 0.85) + cloud(rx0 + 380, ry0 + 100, 0.6, 0.8);
  // rain
  for (let i = 0; i < 14; i++) rr_ += line(rx0 + 40 + i * 30, ry0 + 30 + (i % 4) * 22, rx0 + 32 + i * 30, ry0 + 58 + (i % 4) * 22, '#7fb4d6', 2, { op: 0.7, lc: 'round' });
  // layered slab (oblique)
  const sxl = rx0 + 36, sxr = rx0 + rw - 125, ytop = ry0 + 190; // front face left/right
  const dx = 46, dy = -26; // oblique offset
  const layers = [
    { h: 34, name: 'tile', fill: brickPat('wptile', 22, 17, '#d9c8a2', '#a89a74', { seed: 3, alt: '#efe3c4' }) },
    { h: 26, name: 'screed', fill: '#c3b89f' },
    { h: 14, name: 'mem', fill: lin('mem', [[0, '#34527a'], [1, '#162a46']], [0, 0, 0, 1]) },
    { h: 40, name: 'ins', fill: '#ecd070' },
    { h: 74, name: 'slab', fill: lin('slab', [[0, '#b9bcc0'], [1, '#8d9096']], [0, 0, 0, 1]) },
  ];
  let yy = ytop; const ys = [];
  for (const L of layers) { ys.push([yy, L]); yy += L.h; }
  const yEnd = yy;
  // right side faces (oblique) first
  for (const [y0, L] of ys) rr_ += poly([[sxr, y0], [sxr + dx, y0 + dy], [sxr + dx, y0 + dy + L.h], [sxr, y0 + L.h]], shade(L.name === 'tile' ? '#bda982' : L.name === 'mem' ? '#1c3556' : L.name === 'ins' ? '#d9bb4a' : L.name === 'slab' ? '#8d9096' : '#a99f86', 0.18));
  // top face with tile grid
  rr_ += poly([[sxl, ytop], [sxr, ytop], [sxr + dx, ytop + dy], [sxl + dx, ytop + dy]], lin('toptile', [[0, '#efe3c4'], [1, '#d3c39c']], [0, 0, 1, 0]));
  for (let i = 1; i < 12; i++) { const t = i / 12; rr_ += line(sxl + (sxr - sxl) * t, ytop, sxl + (sxr - sxl) * t + dx, ytop + dy, '#a89a74', 1, { op: 0.7 }); }
  for (let j = 1; j < 3; j++) rr_ += line(sxl + (dx * j) / 3, ytop + (dy * j) / 3, sxr + (dx * j) / 3, ytop + (dy * j) / 3, '#a89a74', 1, { op: 0.7 });
  // front faces
  for (const [y0, L] of ys) {
    rr_ += rect(sxl, y0, sxr - sxl, L.h, L.fill, { stroke: shade('#8d9096', 0.2), sw: 0.8 });
    if (L.name === 'ins') { reseed(2); for (let i = 0; i < 70; i++) rr_ += circle(sxl + rnd() * (sxr - sxl), y0 + rnd() * L.h, rr(1, 3), '#d6b345', { op: 0.7 }); rr_ += rect(sxl, y0, sxr - sxl, 6, '#fff', { op: 0.25 }); }
    if (L.name === 'slab') { reseed(4); for (let i = 0; i < 90; i++) rr_ += circle(sxl + rnd() * (sxr - sxl), y0 + rnd() * L.h, rr(0.8, 2.2), rnd() > 0.5 ? '#7d8087' : '#cfd2d6', { op: 0.6 }); for (let i = 0; i < 12; i++) rr_ += circle(sxl + 20 + i * ((sxr - sxl - 40) / 11), y0 + L.h - 14, 4.2, '#4d4f55') + circle(sxl + 20 + i * ((sxr - sxl - 40) / 11) - 1, y0 + L.h - 15, 1.4, '#9a9da3'); }
    if (L.name === 'mem') { rr_ += rect(sxl, y0, sxr - sxl, 4, '#5e82b4', { op: 0.6 }); }
  }
  // membrane top face edge (visible strip) + upstand at left parapet
  rr_ += poly([[sxl, ys[2][0]], [sxr, ys[2][0]], [sxr + dx, ys[2][0] + dy], [sxl + dx, ys[2][0] + dy]], '#1b3556', { op: 0 });
  // parapet wall at left
  rr_ += rect(sxl - 30, ytop - 90, 30, yEnd - ytop + 90 + 60, vgrad('#e6dcc3', '#cdbf9e'), { stroke: '#a89a74', sw: 1 });
  rr_ += poly([[sxl - 30, ytop - 90], [sxl, ytop - 90], [sxl + 18, ytop - 100], [sxl - 12, ytop - 100]], '#f4ecd9') + rect(sxl, ytop - 90, 0, 0, '#000');
  rr_ += rect(sxl - 2, ytop - 56, 5, 56, '#1b3556') + rect(sxl - 2, ytop - 56, 3, 56, '#34527a'); // upstand membrane
  // under-slab wall + plaster ceiling
  rr_ += rect(sxl - 30, yEnd, sxr - sxl + 30, 70, vgrad('#e8dfc9', '#d4c7a6'));
  rr_ += rect(sxl - 30, yEnd, sxr - sxl + 30, 8, '#000', { op: 0.12 });
  // leader lines + abstract label bars at right
  const lx2 = sxr + dx + 12;
  ys.forEach(([y0, L], i) => { const yc = y0 + L.h / 2 + dy * 0.2; rr_ += line(sxr + dx - 4, yc + dy * 0.6, lx2 + 6, yc + dy * 0.6, C.brassD, 1, { op: 0.9 }) + circle(sxr + dx - 4, yc + dy * 0.6, 2.4, C.brassD) + rect(lx2 + 8, yc + dy * 0.6 - 2, 26 + (i % 3) * 8, 4, '#2b2f36', { rx: 2, op: 0.7 }); });
  // water drops landing + splash
  for (const [x, y, s] of [[sxl + 120, ytop - 72, 12], [sxl + 210, ytop - 112, 9], [sxl + 290, ytop - 62, 12]]) { rr_ += waterDrop(x, y, s, lin('wdr', [[0, '#9ad7f5'], [1, '#2f8fd0']], [0, 0, 0, 1]), { stroke: '#fff', sw: 1.2 }); rr_ += path_(`M${x - 18} ${ytop - 6}q18 -26 36 0`, 'none', { stroke: '#7fb4d6', sw: 2, op: 0.8, lc: 'round' }); }
  add(g(rr_, { clip: clipR }));
  add(rrect(rx0, ry0, rw, rh, 26, 'none', { stroke: C.brass, sw: 3 }));
  // shield with drop
  { const sx = 860, sy = 250;
    add(shield(sx + 4, sy + 12, 150, 176, '#000', { op: 0.3, filter: blur(8) }));
    add(shield(sx, sy, 150, 176, lin('shg', [[0, C.brassL], [1, C.brassD]], [0, 0, 1, 1])));
    add(shield(sx, sy, 130, 152, lin('shn', [[0, '#27496d'], [1, '#0f2238']], [0, 0, 1, 1])));
    add(waterDrop(sx, sy + 6, 46, lin('shd', [[0, '#bfe6fb'], [1, '#4aa3dc']], [0, 0, 0, 1]), { stroke: '#fff', sw: 2 }));
    add(path_(`M${sx - 16} ${sy + 8}q2 18 14 24`, 'none', { stroke: '#fff', sw: 3.5, lc: 'round', op: 0.7 }));
    add(star4(sx + 72, sy - 70, 12, C.brassL, { op: 0.9 }), star4(sx - 78, sy - 44, 8, C.cream, { op: 0.8 })); }
  finish('svc-painting-waterproofing.svg', 'Painting and waterproofing', 'A paint roller leaving a fresh teal stripe on a wall with paint tins and colour chips, next to a roof slab cross-section showing waterproof membrane layers beneath a water-drop shield.');
}

// =============================================================================
// 15. svc-kitchen-bathroom
// =============================================================================
function svcKitchenBath() {
  begin('skb');
  add(svcBg({ r: 350, cy: 450, ground: false }));
  const cx0 = 100, cy0 = 130, cw = 1000, ch = 640, mid = 600;
  const clip = clipDef('card', rrect(cx0, cy0, cw, ch, 28, '#000'));
  add(shadowPoly([[cx0 + 10, cy0 + 24], [cx0 + cw + 10, cy0 + 24], [cx0 + cw + 10, cy0 + ch + 24], [cx0 + 10, cy0 + ch + 24]], 0.4, 16));
  const floorY = 690;
  let K = '';
  // ---------------- KITCHEN (left)
  K += rect(cx0, cy0, mid - cx0, floorY - cy0, vgrad('#f1e8d6', '#e4d7ba'));
  // backsplash tiles
  K += rect(cx0, 345, mid - cx0, 165, tilePat('kbs', 36, '#eae2d1', '#d3c8ad', { cols: 6, rows: 3, alt: '#f7f2e6', var: 0.9, seed: 4, gloss: 0.2 }));
  // upper cabinets (oak)
  const oak = '#b99671';
  for (const [ux, uw] of [[cx0 + 12, 190], [mid - 202, 190]]) {
    K += rect(ux, 160, uw, 175, vgrad(lighten(oak, 0.08), shade(oak, 0.08)), { stroke: shade(oak, 0.3), sw: 1.2 });
    for (let i = 0; i < 2; i++) { K += rect(ux + 4 + i * (uw / 2 - 2), 164, uw / 2 - 6, 167, vgrad(lighten(oak, 0.12), oak), { stroke: shade(oak, 0.3), sw: 1 }); for (let j = 0; j < 4; j++) K += line(ux + 14 + i * (uw / 2 - 2) + j * 18, 170, ux + 14 + i * (uw / 2 - 2) + j * 18, 325, lighten(oak, 0.25), 1, { op: 0.2 }); K += rect(ux + 10 + i * (uw / 2 - 2), 318, uw / 2 - 18, 4, C.brass, { rx: 2 }); }
    K += rect(ux, 336, uw, 4, '#ffe3b0', { op: 0.95 }) + rect(ux, 340, uw, 14, '#ffe3b0', { op: 0.25, filter: blur(4) });
  }
  // hood + chimney
  K += rect(cx0 + 220, 130, 170, 200, hgrad('#aeb4be', '#e9edf1'));
  K += rect(cx0 + 220, 130, 24, 200, '#fff', { op: 0.35 });
  K += poly([[cx0 + 170, 345], [cx0 + 440, 345], [cx0 + 380, 290], [cx0 + 230, 290]], lin('kh', [[0, '#e6e9ee'], [1, '#aeb3bd']], [0, 0, 0, 1]), { stroke: '#7d838d', sw: 1.2 });
  K += rect(cx0 + 170, 343, 270, 6, C.brass) + rect(cx0 + 240, 300, 130, 4, '#fff', { op: 0.4, rx: 2 });
  K += poly([[cx0 + 170, 350], [cx0 + 440, 350], [cx0 + 500, 510], [cx0 + 110, 510]], lin('hoodl', [[0, '#ffe2a8', 0.55], [1, '#ffe2a8', 0]]), { style: 'mix-blend-mode:screen' });
  // base cabinets navy
  K += rect(cx0, 525, mid - cx0, floorY - 525, '#10192a');
  const doors = [[cx0 + 12, 140], [cx0 + 156, 190], [cx0 + 350, 140], [cx0 + 494, 0]];
  for (const [dx_, dw] of [[cx0 + 10, 150], [cx0 + 164, 150], [cx0 + 318, 150], [cx0 + 472, 20]]) { if (dw < 40) continue; K += rect(dx_, 540, dw, 140, soft('#27496d', 0.06, 0.14), { stroke: '#0f2238', sw: 1.2, rx: 2 }); K += rect(dx_ + dw / 2 - 30, 546, 60, 4, C.brass, { rx: 2 }); }
  K += rect(cx0 + 164, 612, 150, 2, '#0f2238');
  K += rect(cx0 + 164, 540, 150, 68, '#2d5078', { stroke: '#0f2238', sw: 1.2, rx: 2 }) + rect(cx0 + 164 + 60, 548, 30, 4, C.brass, { rx: 2 });
  // worktop
  K += rect(cx0 - 4, 500, mid - cx0 + 8, 28, vgrad('#fbfaf6', '#d9d6cd')) + rect(cx0 - 4, 524, mid - cx0 + 8, 4, '#a9a69c');
  K += path_(`M${cx0 + 40} 508q80 -6 160 0`, 'none', { stroke: '#a9a69c', sw: 1, op: 0.5 });
  // hob + pot
  K += rect(cx0 + 200, 486, 210, 14, '#12151a', { rx: 3 }) + rect(cx0 + 205, 488, 200, 3, '#fff', { op: 0.18 });
  K += rect(cx0 + 240, 440, 100, 48, hgrad('#c6cad1', '#80858f'), { rx: 6, stroke: '#4d535d', sw: 1.2 }) + ellipse(cx0 + 290, 440, 50, 8, '#d7dade') + rect(cx0 + 222, 456, 20, 6, '#4d535d', { rx: 3 }) + rect(cx0 + 340, 456, 20, 6, '#4d535d', { rx: 3 });
  K += path_(`M${cx0 + 280} 430q-12 -30 4 -52t-2 -46`, 'none', { stroke: '#fff', sw: 6, op: 0.45, lc: 'round', filter: blur(2) }) + path_(`M${cx0 + 308} 430q10 -26 -2 -48t6 -40`, 'none', { stroke: '#fff', sw: 5, op: 0.4, lc: 'round', filter: blur(2) });
  // kettle (brass) + canisters + plant
  K += shadowEll(cx0 + 450, 500, 38, 6, 0.3, 3) + path_(`M${cx0 + 420} 498q-6 -50 30 -50q36 0 30 50z`, hgrad(C.brassL, C.brassD)) + rect(cx0 + 440, 436, 20, 12, C.brassD, { rx: 3 }) + path_(`M${cx0 + 480} 470q22 -6 26 -26`, 'none', { stroke: C.brass, sw: 6, lc: 'round' }) + path_(`M${cx0 + 424} 466q-14 -4 -8 -24`, 'none', { stroke: C.brass, sw: 5, lc: 'round' }) + ellipse(cx0 + 440, 458, 6, 18, '#fff', { op: 0.35 });
  for (const [x, h, c] of [[cx0 + 36, 60, '#e9e0c9'], [cx0 + 76, 78, '#d9c8a2'], [cx0 + 116, 50, '#b5603c']]) K += rect(x, 500 - h, 30, h, hgrad(lighten(c, 0.1), shade(c, 0.2)), { rx: 3 }) + rect(x - 1, 500 - h - 6, 32, 8, C.brass, { rx: 2 });
  K += plantSnake(cx0 + 160, 500, 150, { pot: '#d9c8a2', sc: 0.5 });
  // utensil rail
  K += rect(cx0 + 36, 392, 130, 4, C.brass, { rx: 2 });
  for (let i = 0; i < 4; i++) K += line(cx0 + 52 + i * 32, 396, cx0 + 52 + i * 32, 404, C.brass, 2) + (i % 2 ? rect(cx0 + 49 + i * 32, 404, 6, 40, C.woodL, { rx: 3 }) : ellipse(cx0 + 52 + i * 32, 424, 12, 16, '#8a8f98', { stroke: '#555a62', sw: 1.2 }) + rect(cx0 + 50 + i * 32, 408, 4, 8, '#555a62'));
  // floor
  K += rect(cx0, floorY, mid - cx0, 90, lin('kfl', [[0, '#d9cfbb'], [1, '#bdb29a']], [0, 0, 0, 1]));
  for (let i = 0; i < 8; i++) K += line(cx0 + i * 70, floorY, cx0 - 40 + i * 78, floorY + 90, '#a89c82', 1, { op: 0.5 });
  K += line(cx0, floorY + 35, mid, floorY + 35, '#a89c82', 1, { op: 0.5 });
  K += rect(cx0, floorY, mid - cx0, 12, '#000', { op: 0.18, filter: blur(4) });
  // pendant
  K += line(cx0 + 460, cy0, cx0 + 460, 215, '#2b2f36', 2) + path_(`M${cx0 + 430} 255A30 28 0 0 1 ${cx0 + 490} 255Z`, hgrad(C.brassL, C.brassD)) + ellipse(cx0 + 460, 255, 30, 5, '#fff2c8') + ellipse(cx0 + 460, 280, 56, 36, radial('pnd', [[0, '#ffe2a8', 0.5], [1, '#ffe2a8', 0]]), { style: 'mix-blend-mode:screen' });
  // ---------------- BATHROOM (right)
  let B = '';
  B += rect(mid, cy0, cx0 + cw - mid, floorY - cy0, vgrad('#dfe5e1', '#cbd4cf'));
  // big tile wall w/ sage lower band
  B += rect(mid, 330, cx0 + cw - mid, floorY - 330, tilePat('bz', 46, '#6f8a79', '#4d6557', { cols: 6, rows: 4, alt: '#8ba597', var: 0.9, seed: 9, gloss: 0.22 }));
  for (let i = 0; i < 8; i++) B += line(mid + i * 70, cy0, mid + i * 70, 330, '#aeb9b3', 1, { op: 0.6 });
  for (const yy of [220]) B += line(mid, yy, cx0 + cw, yy, '#aeb9b3', 1, { op: 0.6 });
  B += rect(mid, 326, cx0 + cw - mid, 8, C.brass);
  // towel ladder (left)
  B += rect(mid + 32, 380, 5, 220, C.brass) + rect(mid + 100, 380, 5, 220, C.brass);
  for (let i = 0; i < 5; i++) B += rect(mid + 32, 396 + i * 44, 73, 5, brassGradH(), { rx: 2 });
  B += rect(mid + 40, 340, 58, 74, '#f6f1e6', { stroke: '#cfc4aa', sw: 1, rx: 3 }) + rect(mid + 40, 346, 58, 5, C.brass) + rect(mid + 40, 442, 58, 76, '#b5603c', { rx: 3, stroke: '#7d3a1e', sw: 1 }) + rect(mid + 40, 450, 58, 4, '#e8cc84');
  // mirror (round) w/ backlight
  const mxc = 830, myc = 280;
  B += circle(mxc, myc, 150, radial('bmg', [[0.55, '#ffe6b5', 0.7], [1, '#ffe6b5', 0]]), { style: 'mix-blend-mode:screen' }) + circle(mxc, myc, 108, '#fff3d6', { filter: blur(3) }) + circle(mxc, myc, 104, C.brass) + circle(mxc, myc, 98, lin('bmr', [[0, '#e5eff2'], [1, '#b2c8d0']], [0, 0, 1, 1])) + poly([[mxc - 70, myc - 80], [mxc - 30, myc - 92], [mxc - 8, myc + 90], [mxc - 50, myc + 84]], '#fff', { op: 0.28 });
  // vanity
  B += shadowEll(mxc, 636, 160, 12, 0.3, 8) + rect(mxc - 140, 470, 280, 8, vgrad('#fbfaf6', '#d9d6cd')) + rect(mxc - 140, 476, 280, 4, '#a9a69c');
  B += rect(mxc - 130, 480, 260, 130, hgrad('#7a4e2f', '#5e3a22'), { stroke: '#3a2412', sw: 1.2 });
  for (let i = 0; i < 12; i++) B += line(mxc - 118 + i * 21, 486, mxc - 118 + i * 21, 604, lighten(C.walnut, 0.25), 1, { op: 0.2 });
  B += rect(mxc - 120, 490, 240, 52, 'none', { stroke: '#3a2412', sw: 1.2 }) + rect(mxc - 120, 548, 240, 52, 'none', { stroke: '#3a2412', sw: 1.2 }) + rect(mxc - 36, 512, 72, 4, C.brass, { rx: 2 }) + rect(mxc - 36, 570, 72, 4, C.brass, { rx: 2 });
  B += rect(mxc - 100, 618, 200, 10, '#ffd9a0', { op: 0.8, filter: blur(4) });
  // basin + tap
  B += path_(`M${mxc - 52} 450Q${mxc - 50} 472 ${mxc} 472Q${mxc + 50} 472 ${mxc + 52} 450Z`, hgrad('#cfc9bd', '#f8f6f0')) + ellipse(mxc, 450, 52, 10, '#f8f6f0') + ellipse(mxc, 451, 44, 7, '#bdb7ab');
  B += stroke_(`M${mxc} 450V412q0 -14 14 -14h12`, C.brassD, 11, { lc: 'round', lj: 'round' }) + stroke_(`M${mxc} 450V412q0 -14 14 -14h12`, C.brass, 8, { lc: 'round', lj: 'round' }) + stroke_(`M${mxc} 446V414`, C.brassL, 2.4, { lc: 'round', op: 0.8 });
  B += rect(mxc - 112, 452, 14, 18, '#efe8d8', { rx: 3 }) + rect(mxc - 108, 444, 6, 10, C.brass);
  B += vase(mxc + 104, 470, 140, '#d9cdb2', { h: 0.22, w: 0.12, branch: true, bloom: C.leaf, seed: 4 });
  // shower enclosure (right)
  const gx0 = 990, gx1 = 1085;
  B += rect(gx0, 190, gx1 - gx0, floorY - 190, lin('gl', [[0, '#d6ecf3', 0.35], [1, '#bcdbe6', 0.2]], [0, 0, 1, 1]), { stroke: '#23272e', sw: 4 }) + poly([[gx0 + 10, floorY], [gx0 + 36, floorY], [gx0 + 62, 190], [gx0 + 36, 190]], '#fff', { op: 0.2 });
  B += rect(gx0 - 3, 186, gx1 - gx0 + 6, 6, '#23272e');
  B += line(gx0 + 60, 190, gx0 + 60, 140, C.brass, 6, { lc: 'round' }) + ellipse(gx0 + 58, 210, 36, 8, brassGradH(), { stroke: C.brassD, sw: 1 });
  reseed(10); for (let i = 0; i < 24; i++) B += line(gx0 + 30 + rnd() * 56, 216, gx0 + 30 + rnd() * 56 + rr(-3, 3), 216 + rr(90, 400), '#e6f4fa', 1.2, { op: rr(0.25, 0.6) });
  // floor + mat
  B += rect(mid, floorY, cx0 + cw - mid, 90, lin('bfl', [[0, '#c9c4b6'], [1, '#aaa493']], [0, 0, 0, 1]));
  for (let i = 0; i < 7; i++) B += line(mid + i * 78, floorY, mid - 40 + i * 86, floorY + 90, '#8f8977', 1, { op: 0.5 });
  B += line(mid, floorY + 40, cx0 + cw, floorY + 40, '#8f8977', 1, { op: 0.5 });
  B += rect(mxc - 90, floorY + 14, 180, 24, '#e6dcc5', { rx: 3, stroke: '#cfc4aa', sw: 1 });
  for (let i = 0; i < 8; i++) B += rect(mxc - 80 + i * 21, floorY + 16, 5, 20, i % 2 ? C.brass : C.navy3, { op: 0.8 });
  B += rect(mid, floorY, cx0 + cw - mid, 12, '#000', { op: 0.18, filter: blur(4) });
  add(g(K + B, { clip }));
  // divider
  add(rect(mid - 7, cy0, 14, ch, '#000', { op: 0.25, filter: blur(6) }), rect(mid - 5, cy0, 10, ch, brassGradH()));
  const by_ = 732;
  add(circle(mid + 3, by_ + 6, 50, '#000', { op: 0.3, filter: blur(7) }), circle(mid, by_, 50, lin('db', [[0, C.brassL], [1, C.brassD]], [0, 0, 1, 1])), circle(mid, by_, 43, C.navy));
  // icons in divider badge: pot (left) / drop (right)
  add(path_(`M${mid - 36} ${by_ - 6}h20v14q0 8 -10 8t-10 -8z`, C.cream) + rect(mid - 39, by_ - 9, 26, 4, C.brassL, { rx: 2 }) + rect(mid - 14, by_ - 4, 8, 3, C.cream, { rx: 1.5 }));
  add(waterDrop(mid + 20, by_ + 2, 16, lin('bd', [[0, '#bfe6fb'], [1, '#4aa3dc']], [0, 0, 0, 1])));
  add(rrect(cx0, cy0, cw, ch, 28, 'none', { stroke: C.brass, sw: 3 }));
  finish('svc-kitchen-bathroom.svg', 'Kitchen and bathroom fit-outs', 'A split composition: a modern navy kitchen with oak wall cabinets, hob and chimney on the left, and a bathroom with a floating walnut vanity, round backlit mirror, towel rail and glass shower on the right.');
}

// =============================================================================
// 16. svc-grey-structure
// =============================================================================
function svcGreyStructure() {
  begin('sgs');
  add(svcBg({ mode: 'navy', r: 355, cy: 450, flip: true, ground: false }));
  ISO.ox = 600; ISO.oy = 262; ISO.s = 28;
  const conc = { top: '#c4c5c4', left: '#a7a9ab', right: '#828488' };
  const concD = { top: '#b6b7b6', left: '#9a9c9e', right: '#76787c' };
  // plinth / foundation slab
  add(shadowPoly([isoP(-1, -1, 0), isoP(13, -1, 0), isoP(13, 10, 0), isoP(-1, 10, 0)].map((p) => [p[0] + 12, p[1] + 26]), 0.4, 14));
  add(isoBox(-1.2, -1.2, -0.9, 14.4, 11.4, 0.9, { top: '#8a7a64', left: '#6a5a46', right: '#52452f' }, { topFill: lin('soil', [[0, '#a89774'], [1, '#8d7d5b']], [0, 0, 1, 1]) }));
  add(isoBox(0, 0, 0, 12, 9, 0.35, conc));
  // draw order: back to front. columns at x:0,6,12(edge) y:0,9
  const xs = [0.2, 5.8, 11.4], ys = [0.2, 8.4]; const cw = 0.6; const h1 = 3.4, zb = 0.35;
  // back wall (y=0) brickwork partial between columns 0..6 up to z=2.4 (stepped) and right bay up to 1.2
  const brickWall = (plane, a0, a1, y_or_x, z0, z1, stepped) => {
    let s = '';
    const bh = 0.26; const rows = Math.round((z1 - z0) / bh);
    for (let r = 0; r < rows; r++) {
      const zc = z0 + r * bh; let ua = a0, ub = a1; if (stepped) { const cut = Math.max(0, (r - rows * 0.55)) * 0.45; ub = a1 - cut; if (ub <= ua) continue; }
      const col = r % 2 ? '#b0593a' : '#a4502f';
      s += plane === 'L' ? isoL(y_or_x, ua, ub, zc, zc + bh, col, { stroke: '#cdbf9e', sw: 0.9 }) : isoR(y_or_x, ua, ub, zc, zc + bh, shade(col, 0.2), { stroke: '#b3a584', sw: 0.9 });
      const n = Math.floor((ub - ua) / 0.5);
      for (let i = 0; i < n; i++) { const jx = ua + i * 0.5 + (r % 2 ? 0.25 : 0); if (jx < ub) s += plane === 'L' ? isoL(y_or_x, jx, jx + 0.02, zc, zc + bh, '#cdbf9e') : isoR(y_or_x, jx, jx + 0.02, zc, zc + bh, '#b3a584'); }
    }
    return s;
  };
  // back columns (y=0 row) first
  const col = (x, y, z0, z1, rebar) => {
    let s = isoBox(x, y, z0, cw, cw, z1 - z0, conc);
    for (let i = 0; i < 6; i++) { const a = z0 + (z1 - z0) * (0.2 + i * 0.13); s += isoL(y + cw, x + 0.04, x + cw - 0.04, a, a + 0.02, '#8f9195', { op: 0.35 }); }
    if (rebar) { const [bx, by] = isoP(x + cw / 2, y + cw / 2, z1); for (const [dx, dy] of [[-8, 0], [-3, -5], [3, 0], [8, -5]]) s += line(bx + dx, by + dy, bx + dx, by + dy - 62, '#6e5a46', 2.2, { lc: 'round' }) + line(bx + dx - 0.8, by + dy, bx + dx - 0.8, by + dy - 62, '#c9a678', 0.8, { op: 0.8 }); for (let k = 0; k < 4; k++) s += pline([[bx - 9, by - 6 - k * 14], [bx + 9, by - 6 - k * 14 - 1]], '#3a3f48', 1.2, {}); }
    return s;
  };
  // ground floor frame
  for (const x of xs) add(col(x, ys[0], zb, zb + h1, false));
  // back wall brick (between col0 and col1)
  add(brickWall('L', xs[0] + cw, xs[1], ys[0] + cw, zb, zb + 2.5, true));
  add(brickWall('L', xs[1] + cw, xs[2], ys[0] + cw, zb, zb + 1.2, false));
  // left wall (x = xs[0]) is the side facing left-down? the visible right face is x max; left face is y max. so side wall at x=xs[2]+cw (right side) bricks
  add(brickWall('R', ys[0] + cw, ys[1], xs[2] + cw, zb, zb + 1.6, true));
  // beams along y at back (y=0) between columns at z top
  const zbeam = zb + h1;
  add(isoBox(xs[0], ys[0], zbeam - 0.55, xs[2] + cw - xs[0], cw, 0.55, concD));
  add(isoBox(xs[2], ys[0], zbeam - 0.55, cw, ys[1] + cw - ys[0], 0.55, concD));
  // front columns y = ys[1]
  for (const x of xs) add(col(x, ys[1], zb, zb + h1, false));
  add(isoBox(xs[0], ys[1], zbeam - 0.55, xs[2] + cw - xs[0], cw, 0.55, concD));
  add(isoBox(xs[0], ys[0], zbeam - 0.55, cw, ys[1] + cw - ys[0], 0.55, concD));
  // middle column line / beams
  add(isoBox(xs[1], ys[0], zbeam - 0.55, cw, ys[1] + cw - ys[0], 0.55, concD));
  // slab: covers x 0..6.4 fully; right half shows shuttering + rebar mesh
  const zs = zbeam;
  add(isoBox(xs[0], ys[0], zs, xs[1] + cw - xs[0], ys[1] + cw - ys[0], 0.4, conc));
  // right bay: shuttering (plywood sheet) with rebar mesh
  add(isoT(zs + 0.02, xs[1] + cw, xs[2] + cw, ys[0], ys[1] + cw, '#c7a46e'));
  for (let i = 0; i <= 14; i++) { const x = xs[1] + cw + 0.15 + i * ((xs[2] + cw - xs[1] - cw - 0.3) / 14); const a = isoP(x, ys[0] + 0.1, zs + 0.15), b = isoP(x, ys[1] + cw - 0.1, zs + 0.15); add(line(a[0], a[1], b[0], b[1], '#5a4a3a', 1.6)); }
  for (let j = 0; j <= 18; j++) { const y = ys[0] + 0.1 + j * ((ys[1] + cw - ys[0] - 0.2) / 18); const a = isoP(xs[1] + cw + 0.15, y, zs + 0.2), b = isoP(xs[2] + cw - 0.15, y, zs + 0.2); add(line(a[0], a[1], b[0], b[1], '#6e5a46', 1.6)); }
  // slab edge highlight
  // upper columns on slab (left bay) with exposed rebar
  for (const [x, y] of [[xs[0], ys[0]], [xs[1], ys[0]], [xs[0], ys[1]], [xs[1], ys[1]]]) add(col(x, y, zs + 0.4, zs + 0.4 + 2.2, true));
  // second-floor beams stubs
  add(isoBox(xs[0], ys[0], zs + 0.4 + 1.65, xs[1] + cw - xs[0], cw, 0.55, concD));
  add(isoBox(xs[0], ys[1], zs + 0.4 + 1.65, xs[1] + cw - xs[0], cw, 0.55, concD));
  // props under slab edge (shuttering props) on the right bay front side
  for (const [x, y] of [[8.4, 8.4], [10.0, 8.4], [8.4, 4.5], [10.4, 4.5]]) { const a = isoP(x, y, zb), b = isoP(x, y, zs - 0.02); add(line(a[0], a[1], b[0], b[1], '#d9822b', 3.6), line(a[0] - 4, a[1], a[0] + 4, a[1], '#6a6e75', 3)); for (let k = 0; k < 3; k++) { const m = isoP(x, y, zb + 0.6 + k * 0.9); add(circle(m[0], m[1], 2.4, '#5a5f68')); } }
  // scaffolding bar on the front-left
  // ladder leaning on slab
  { const [ax, ay] = isoP(-0.6, 5.2, zb), [bx, by] = isoP(-0.3, 3.6, zs); add(line(ax, ay, bx, by, '#d9a050', 4.5, { lc: 'round' }), line(ax + 16, ay + 6, bx + 16, by + 6, '#d9a050', 4.5, { lc: 'round' })); for (let k = 1; k < 9; k++) { const t = k / 9; add(line(ax + (bx - ax) * t, ay + (by - ay) * t, ax + (bx - ax) * t + 16, ay + (by - ay) * t + 6, '#b87c30', 3)); } }
  // foreground: rebar bundle (iso cylinders)
  { const bx = 150, by = 770; reseed(2);
    add(shadowEll(bx + 80, by + 28, 190, 14, 0.4, 8));
    const rows = [[0, 0], [1, 0], [2, 0], [3, 0], [0.5, -1], [1.5, -1], [2.5, -1], [1, -2], [2, -2]];
    // bars lying along iso x direction (towards upper right)
    for (let i = 0; i < 4; i++) for (const [cx_, cy_] of rows) { const x0 = bx + cx_ * 11 - cy_ * 5, y0 = by + cy_ * 10 - cx_ * 0; }
    const L = 330;
    rows.forEach(([cx_, cy_], idx) => { const x0 = bx + cx_ * 15, y0 = by + cy_ * 13 - cx_ * 7; const x1 = x0 + L * 0.866, y1 = y0 - L * 0.5; add(line(x0, y0, x1, y1, '#4f4033', 13, { lc: 'round' }), line(x0, y0 - 1, x1, y1 - 1, '#8a6e52', 9.5, { lc: 'round' }), line(x0, y0 - 3.4, x1, y1 - 3.4, '#c9a678', 1.8, { lc: 'round', op: 0.7 })); add(circle(x0, y0, 6.2, '#6a5238', { stroke: '#3a2f24', sw: 1 })); for (let k = 0; k < 9; k++) { const t = 0.05 + k * 0.11; add(path_(`M${r1(x0 + (x1 - x0) * t)} ${r1(y0 + (y1 - y0) * t - 4.5)}l1.4 0`, 'none', { stroke: '#3a2f24', sw: 0.8, op: 0.5 })); } });
    // ties
    for (const t of [0.25, 0.7]) { const px = bx + 12 + L * 0.866 * t, py = by - 4 - L * 0.5 * t; add(g(ellipse(0, 0, 44, 30, 'none', { stroke: '#2b2f36', sw: 3.5, op: 0.9 }), { tf: `translate(${px - 6} ${py + 2}) rotate(-30)` })); }
  }
  // brick stack (foreground right) + hard hat
  { ISO.ox = 850; ISO.oy = 715; ISO.s = 28;
    for (let r = 0; r < 4; r++) for (let i = 0; i < 3; i++) add(isoBox(i * 1.05, r % 2 ? 0.1 : 0, r * 0.32, 1, 0.5, 0.3, { top: '#c46a45', left: '#b0593a', right: '#8d4529' }));
    for (let r = 0; r < 3; r++) for (let i = 0; i < 3; i++) add(isoBox(i * 1.05, 0.55, r * 0.32, 1, 0.5, 0.3, { top: '#c46a45', left: '#b0593a', right: '#8d4529' }));
    add(isoBox(0, 1.2, 0, 3, 1, 0.1, { top: '#8a6e52', left: '#6a5238', right: '#52412d' }));
    // hard hat
    const hx = 1040, hy = 730;
    add(shadowEll(hx, hy + 26, 70, 11, 0.35, 5));
    add(path_(`M${hx - 62} ${hy + 18}Q${hx - 62} ${hy - 44} ${hx} ${hy - 48}Q${hx + 62} ${hy - 44} ${hx + 62} ${hy + 18}Z`, lin('hat', [[0, '#ffd04a'], [1, '#e0a216']], [0, 0, 1, 1]), { stroke: '#a0720f', sw: 1.4 }));
    add(path_(`M${hx - 18} ${hy - 46}Q${hx} ${hy - 54} ${hx + 18} ${hy - 46}V${hy + 18}H${hx - 18}Z`, '#f2b92a', { stroke: '#a0720f', sw: 1 }));
    add(path_(`M${hx - 40} ${hy - 30}Q${hx - 28} ${hy - 40} ${hx - 22} ${hy - 20}`, 'none', { stroke: '#fff', sw: 4, op: 0.5, lc: 'round' }));
    add(path_(`M${hx - 72} ${hy + 18}Q${hx} ${hy + 4} ${hx + 72} ${hy + 18}Q${hx + 76} ${hy + 30} ${hx + 60} ${hy + 30}Q${hx} ${hy + 16} ${hx - 60} ${hy + 30}Q${hx - 76} ${hy + 30} ${hx - 72} ${hy + 18}Z`, '#e0a216', { stroke: '#a0720f', sw: 1.2 }));
  }
  finish('svc-grey-structure.svg', 'Grey structure construction', 'An isometric reinforced-concrete frame under construction with columns, beams and slab, rebar mesh and exposed column bars, partial brickwork, props, a ladder, rebar bundle, brick stack and a hard hat.');
}

// =============================================================================
// 17. svc-turnkey
// =============================================================================
function svcTurnkey() {
  begin('stk');
  add(svcBg({ r: 350, cy: 440, ground: false, flip: true }));
  const k = 1.12, fx = 600 - 260 * k + 10, fy = 600 - 358 * k;
  add(shadowEll(600, 606, 340, 16, 0.4, 10));
  add(facade(fx, fy, k, 'new'));
  // gate posts and lawn strip
  add(rect(fx - 20, 596, 520 * k + 40, 8, '#cfc3a4') + rect(fx - 20, 600, 520 * k + 40, 3, '#000', { op: 0.12 }));
  // checklist clipboard (right)
  { const bx = 835, by = 360;
    add(g(rrect(0, 0, 270, 380, 18, '#000', { op: 0.35, filter: blur(14) }), { tf: `translate(${bx + 14} ${by + 26}) rotate(5)` }));
    let cb = rrect(0, 0, 270, 380, 18, lin('cbd', [[0, '#8a5a38'], [1, '#5f3a22']], [0, 0, 1, 1]), { stroke: '#3a2412', sw: 2 });
    cb += rrect(18, 36, 234, 326, 8, vgrad('#fffdf8', '#efe8d6'), { stroke: '#d9cfb6', sw: 1.2 });
    // clip
    cb += rrect(76, -12, 118, 52, 10, brassGradH(), { stroke: C.brassD, sw: 1.5 }) + rrect(96, 2, 78, 14, 5, C.navy) + circle(135, 26, 7, '#e8cc84', { stroke: C.brassD, sw: 1 });
    for (let i = 0; i < 5; i++) {
      const yy = 68 + i * 58; const done = true;
      cb += checkCircle(54, yy + 18, 19, C.brass, '#fff') + rect(86, yy + 6, 140 - (i % 3) * 20, 7, '#2b3a50', { rx: 3.5, op: 0.85 }) + rect(86, yy + 22, 96 - (i % 2) * 22, 5, '#9aa4b2', { rx: 2.5, op: 0.8 }) + line(36, yy + 46, 236, yy + 46, '#d9cfb6', 1, { op: 0.8 });
    }
    add(g(cb, { tf: `translate(${bx} ${by}) rotate(5)` })); }
  // brass key (left), with navy handover tag
  { const kx = 215, ky = 330;
    // tag string + tag
    add(path_(`M${kx - 4} ${ky - 40}C${kx - 70} ${ky - 90} ${kx - 120} ${ky - 40} ${kx - 100} ${ky + 20}`, 'none', { stroke: C.brass, sw: 3, op: 0 }));
    add(brassKey(kx, ky, 470, 12));
    // tag hanging from the bow
    add(g(circle(0, 0, 5, C.brassD) + line(0, 0, 0, 36, '#d9cdb0', 2.5) + path_('M-30 36L30 36L36 118Q0 130 -36 118Z', lin('tag', [[0, '#27496d'], [1, '#0f2238']], [0, 0, 1, 1]), { stroke: C.brass, sw: 2.5, lj: 'round' }) + circle(0, 54, 7, C.cream, { stroke: C.brass, sw: 1.5 }) + path_('M-16 96L0 78L16 96V108H-16Z', C.brassL) + rect(-4, 98, 8, 10, '#27496d'), { tf: `translate(${kx - 100} ${ky + 170}) rotate(-12)` })); }
  // sparkle accents
  add(star4(300, 215, 20, C.brass, { op: 0.95 }), star4(955, 270, 14, C.brass, { op: 0.9 }), star4(180, 640, 12, C.brassL, { op: 0.9 }), star4(1060, 640, 18, C.brassL, { op: 0.9 }));
  finish('svc-turnkey.svg', 'Turnkey home delivery', 'A completed modern house beside a large brass key with a handover tag and a clipboard checklist with every item ticked.');
}

// =============================================================================
// INTERIOR helpers
// =============================================================================
// False-ceiling tray with warm LED cove
function ceilingTray(cam, R, inset = 0.6, drop = 0.18, led = '#ffd9a0') {
  const { W, H, Zb, Zn = 1.0 } = R; const out = [];
  const x0 = -W + inset, x1 = W - inset, zb = Zb - inset, zn = Zn;
  const hL = H - drop;
  // lowered border band (the visible ceiling surround)
  out.push(cam.quad([[-W, hL, Zn], [x0, hL, Zn], [x0, hL, zb], [-W, hL, zb], [-W, hL, Zb]], shade(C.cream2, 0.02)));
  out.push(cam.quad([[W, hL, Zn], [x1, hL, Zn], [x1, hL, zb], [W, hL, zb], [W, hL, Zb]], shade(C.cream2, 0.02)));
  out.push(cam.quad([[x0, hL, zb], [x1, hL, zb], [x1, hL, Zb], [x0, hL, Zb]], shade(C.cream2, 0.06)));
  // risers
  out.push(cam.quad([[x0, hL, zb], [x1, hL, zb], [x1, H, zb], [x0, H, zb]], lighten(C.cream, 0.1)));
  out.push(cam.quad([[x0, hL, Zn], [x0, hL, zb], [x0, H, zb], [x0, H, Zn]], lighten(C.cream, 0.0)));
  out.push(cam.quad([[x1, hL, Zn], [x1, hL, zb], [x1, H, zb], [x1, H, Zn]], shade(C.cream, 0.1)));
  // LED glow on the recessed ceiling
  const glow = lin('cove', [[0, led, 0.0], [1, led, 0.55]], [0, 1, 0, 0]);
  out.push(cam.quad([[x0, H, zb], [x1, H, zb], [x1, H, zb - 0.5], [x0, H, zb - 0.5]], lin('coveB', [[0, led, 0.75], [1, led, 0]], [0, 0, 0, 1]), { style: 'mix-blend-mode:screen' }));
  out.push(cam.quad([[x0, H, Zn], [x0, H, zb], [x0 + 0.5, H, zb], [x0 + 0.5, H, Zn]], lin('coveL', [[0, led, 0.65], [1, led, 0]], [0, 0, 1, 0]), { style: 'mix-blend-mode:screen' }));
  out.push(cam.quad([[x1, H, Zn], [x1, H, zb], [x1 - 0.5, H, zb], [x1 - 0.5, H, Zn]], lin('coveR', [[0, led, 0.65], [1, led, 0]], [0, 0, 1, 0]), { style: 'mix-blend-mode:screen' }));
  // bright LED line
  let a = cam.P(x0, H - 0.01, zb), b = cam.P(x1, H - 0.01, zb);
  out.push(line(a[0], a[1], b[0], b[1], '#fff1cf', 2.4));
  a = cam.P(x0, H - 0.01, Zn); b = cam.P(x0, H - 0.01, zb); out.push(line(a[0], a[1], b[0], b[1], '#fff1cf', 2.4));
  a = cam.P(x1, H - 0.01, Zn); b = cam.P(x1, H - 0.01, zb); out.push(line(a[0], a[1], b[0], b[1], '#fff1cf', 2.4));
  // recessed downlights on the band
  return out.join('');
}
function downlights(cam, pts, h, k = 1) {
  return pts.map(([x, z]) => { const [px, py] = cam.P(x, h, z); const s = cam.s(z); return ellipse(px, py, 0.07 * s, 0.07 * s * 0.28, '#fff6dc') + ellipse(px, py, 0.16 * s, 0.16 * s * 0.28, radial('dl' + hkey(String(x) + z), [[0, '#fff0c8', 0.5], [1, '#fff0c8', 0]]), { style: 'mix-blend-mode:screen' }); }).join('');
}
// window: sky scene + mullions on any surface. returns string
function windowOn(Sf, u0, u1, v0, v1, o = {}) {
  const fr = o.frame || C.char, nu = o.cols ?? 3; let s = '';
  const sky = o.sky || [[0, '#a9cde2'], [0.55, '#dbe9ee'], [1, '#f6e8cf']];
  const cid = clipDef('win' + (o.tag || 'a'), sq(Sf, u0, u1, v0, v1, '#000'));
  let inner = sq(Sf, u0 - 1, u1 + 1, v0 - 1, v1 + 1, lin('sky' + (o.tag || 'a'), sky, [0, 0, 0, 1]));
  // outside: distant skyline / trees (silhouettes) as flat shapes on the surface
  reseed(o.seed ?? 21);
  const du = u1 - u0, dv = v1 - v0;
  if (o.outside !== false) {
    // soft clouds
    for (let i = 0; i < 3; i++) inner += sc(Sf, u0 + du * rr(0.1, 0.9), v0 + dv * rr(0.62, 0.92), du * rr(0.07, 0.13), dv * 0.035, '#fff', { op: 0.55, filter: blur(3) });
    // far houses
    for (let i = 0; i < 6; i++) { const cu = u0 + du * (i / 6) + du * 0.03; const w = du * rr(0.1, 0.16), h = dv * rr(0.1, 0.2); inner += sq(Sf, cu, cu + w, v0, v0 + dv * 0.2 + h * 0.6, mix('#9db6b0', '#bcc9c2', rr(0, 1)), { op: 0.8 }); }
    // trees
    for (let i = 0; i < 7; i++) { const cu = u0 + du * (i / 7 + rr(-0.02, 0.06)); inner += sc(Sf, cu, v0 + dv * rr(0.2, 0.3), du * rr(0.07, 0.11), dv * rr(0.12, 0.2), mix('#5a7d4c', '#86a56a', rr(0, 1))); }
    inner += sq(Sf, u0 - 1, u1 + 1, v0 - 1, v0 + dv * 0.12, '#6e8d58');
  }
  // glass sheen
  inner += sp(Sf, [[u0, v1], [u0 + du * 0.35, v1], [u0 + du * 0.15, v0], [u0, v0]], '#fff', { op: 0.14 });
  s += g(inner, { clip: cid });
  // frame + mullions
  const t = o.t ?? 0.05;
  s += sq(Sf, u0 - t, u1 + t, v0 - t, v0, fr) + sq(Sf, u0 - t, u1 + t, v1, v1 + t, fr) + sq(Sf, u0 - t, u0, v0 - t, v1 + t, fr) + sq(Sf, u1, u1 + t, v0 - t, v1 + t, fr);
  for (let i = 1; i < nu; i++) { const uu = u0 + (du * i) / nu; s += sq(Sf, uu - t * 0.4, uu + t * 0.4, v0, v1, fr); }
  if (o.rows) for (let i = 1; i < o.rows; i++) { const vv = v0 + (dv * i) / o.rows; s += sq(Sf, u0, u1, vv - t * 0.4, vv + t * 0.4, fr); }
  return s;
}
// Curtain panel on a surface with folds (u0..u1) hanging from vTop to vBot
function curtainOn(Sf, u0, u1, vTop, vBot, col, nf = 7, o = {}) {
  let s = ''; const du = u1 - u0;
  for (let i = 0; i < nf; i++) {
    const a = u0 + (du / nf) * i, b = u0 + (du / nf) * (i + 1);
    const shd = o.sheer ? 0.5 : 1;
    const c1 = i % 2 ? shade(col, 0.16) : lighten(col, 0.07);
    const c2 = i % 2 ? lighten(col, 0.02) : shade(col, 0.12);
    const lg = lin('cu' + hkey(c1 + c2), [[0, c1], [1, c2]], [0, 0, 1, 0]);
    // hem sways slightly
    const hem = vBot + (o.sway ?? 0.03) * Math.sin(i * 1.7);
    s += sp(Sf, [[a, vTop], [b, vTop], [b, hem], [a, hem]], o.sheer ? c1 : lg, { op: o.sheer ? 0.5 + 0.12 * (i % 2) : 1 });
  }
  // top gather band
  if (!o.sheer) s += sq(Sf, u0, u1, vTop - 0.04, vTop, shade(col, 0.2));
  return s;
}
// curtain rod
function rodOn(Sf, u0, u1, v, col = C.brass) {
  const a = Sf.map(u0, v), b = Sf.map(u1, v);
  return line(a[0], a[1], b[0], b[1], col, 3.2, { lc: 'round' }) + circle(a[0], a[1], 4.5, brassGrad()) + circle(b[0], b[1], 4.5, brassGrad());
}
const brassGrad = () => lin('brassG', [[0, C.brassL], [0.5, C.brass], [1, C.brassD]], [0, 0, 1, 1]);

// wood slat panel on a surface (vertical slats)
function slatsOn(Sf, u0, u1, v0, v1, col, n, o = {}) {
  let s = sq(Sf, u0, u1, v0, v1, shade(col, 0.45));
  const du = (u1 - u0) / n;
  reseed(o.seed ?? 3);
  for (let i = 0; i < n; i++) {
    const c = mix(col, o.alt || lighten(col, 0.15), rnd() * 0.7);
    s += sq(Sf, u0 + du * i + du * 0.08, u0 + du * (i + 1) - du * 0.08, v0, v1, c);
    s += sl(Sf, u0 + du * i + du * 0.22, v0, u0 + du * i + du * 0.22, v1, lighten(c, 0.2), 1, { op: 0.35 });
  }
  return s;
}
// marble veins within a clip region defined by Sf rect
function marbleOn(Sf, u0, u1, v0, v1, o = {}) {
  const tag = o.tag || 'm';
  let s = sq(Sf, u0, u1, v0, v1, o.base || lin('mrb' + tag, [[0, '#f4f1ea'], [1, '#dedad0']], [0, 0, 1, 1]));
  const cid = clipDef('mrc' + tag, sq(Sf, u0, u1, v0, v1, '#000'));
  let v = ''; reseed(o.seed ?? 9);
  const du = u1 - u0, dv = v1 - v0;
  const bez = (p0, p1, p2, p3, t) => { const m = 1 - t; return [m * m * m * p0[0] + 3 * m * m * t * p1[0] + 3 * m * t * t * p2[0] + t * t * t * p3[0], m * m * m * p0[1] + 3 * m * m * t * p1[1] + 3 * m * t * t * p2[1] + t * t * t * p3[1]]; };
  for (let i = 0; i < (o.n ?? 6); i++) {
    const p0 = [u0 + du * rnd(), v1 + dv * 0.02], p3 = [u0 + du * rnd(), v0 - dv * 0.02];
    const p1 = [u0 + du * rr(-0.2, 1.2), v1 - dv * rr(0.2, 0.5)], p2 = [u0 + du * rr(-0.2, 1.2), v0 + dv * rr(0.2, 0.5)];
    const pts = []; for (let j = 0; j <= 18; j++) pts.push(Sf.map(...bez(p0, p1, p2, p3, j / 18)));
    const d = 'M' + pts.map((p) => r1(p[0]) + ' ' + r1(p[1])).join('L');
    const w = rr(0.8, 1.6), op = rr(0.14, 0.3);
    v += stroke_(d, o.vein || '#8f8e8b', w * 4, { op: op * 0.35, lj: 'round', lc: 'round', filter: blur(2) });
    v += stroke_(d, o.vein || '#8f8e8b', w, { op, lj: 'round', lc: 'round' });
    if (rnd() > 0.45) v += stroke_(d, '#c9a24b', 0.6, { op: 0.4 });
    if (rnd() > 0.5) { const q = Sf.map(...bez(p0, p1, p2, p3, 0.5)); v += stroke_(`M${r1(q[0])} ${r1(q[1])}l${r1(rr(-30, 30))} ${r1(rr(-30, 30))}`, o.vein || '#8f8e8b', 0.8, { op: 0.3 }); }
  }
  s += g(v, { clip: cid });
  return s;
}
// glow for LED line on a surface
function ledOn(Sf, u0, v0, u1, v1, col = '#ffd9a0', w = 2.2) {
  const a = Sf.map(u0, v0), b = Sf.map(u1, v1);
  return line(a[0], a[1], b[0], b[1], col, w * 5, { op: 0.28, filter: blur(4), lc: 'round' }) + line(a[0], a[1], b[0], b[1], '#fff3d6', w, { lc: 'round' });
}
// drum pendant with brass bands
function drumPendant(x, y0, k, len, rad, h) {
  const yb = y0 + len * k, r = rad * k, hh = h * k, yt = yb - hh;
  let s = line(x, y0, x, yt, C.char, Math.max(1.5, k * 0.01));
  s += ellipse(x, yb + hh * 0.3, r * 1.8, r * 1.0, radial('dp' + hkey(String(x) + y0), [[0, '#ffe2a8', 0.5], [1, '#ffe2a8', 0]]), { style: 'mix-blend-mode:screen' });
  const gr = lin('dpg', [[0, '#d9cdb2'], [0.3, '#fbf2dc'], [0.7, '#fff6e2'], [1, '#cdbf9e']], [0, 0, 1, 0]);
  s += rect(x - r, yt, r * 2, hh, gr);
  s += ellipse(x, yt, r, r * 0.17, '#f6ecd4') + ellipse(x, yb, r, r * 0.17, '#ffe9b8');
  s += rect(x - r, yt - 2, r * 2, 3.5, brassGrad(), { rx: 1.5 }) + rect(x - r, yb - 2, r * 2, 3.5, brassGrad(), { rx: 1.5 });
  for (let i = -3; i <= 3; i++) s += line(x + i * r * 0.28, yt + 3, x + i * r * 0.28, yb - 3, '#e0d3b4', 1, { op: 0.6 });
  return s;
}
// Soft veining on a polished floor (perspective)
function floorVeins(cam, R, size = 1.2, n = 26, col = '#a39379') {
  reseed(77); let s = '';
  for (let i = 0; i < n; i++) {
    let x = rr(-R.W, R.W), z = rr(R.Zn + 0.3, R.Zb - 0.3); const pts = [];
    const ang = rr(0, Math.PI);
    for (let j = 0; j < 7; j++) { pts.push(cam.P(x, 0, z)); x += Math.cos(ang + rr(-0.5, 0.5)) * rr(0.15, 0.4); z += Math.sin(ang + rr(-0.5, 0.5)) * rr(0.1, 0.3); if (z > R.Zb - 0.05) z = R.Zb - 0.05; if (z < R.Zn) z = R.Zn; }
    s += pline(pts, col, rr(0.6, 1.2), { op: rr(0.06, 0.14), lj: 'round', lc: 'round', filter: blur(0.8) });
  }
  return s;
}
// Upholstered armchair (box based). Faces the camera.
function armchair(cam, x0, x1, z0, z1, col, o = {}) {
  const c = (cl) => ({ front: cl, top: lighten(cl, 0.14), left: shade(cl, 0.24), right: lighten(cl, 0.05) });
  const dark = shade(col, 0.08);
  let s = shadowPoly([cam.P(x0 + 0.08, 0, z0), cam.P(x1 + 0.08, 0, z0), cam.P(x1 + 0.2, 0, z1), cam.P(x0 + 0.2, 0, z1)], 0.38, 8);
  const lg = 0.1;
  for (const [x, z] of [[x0 + 0.08, z0 + 0.08], [x1 - 0.08, z0 + 0.08], [x0 + 0.08, z1 - 0.08], [x1 - 0.08, z1 - 0.08]]) s += cam.box(x - 0.02, x + 0.02, 0, lg + 0.02, z - 0.02, z + 0.02, C.brass, { flat: true });
  s += cam.box(x0, x1, lg, 0.4, z0, z1, c(col), { rx: 0.04 });
  s += cam.box(x0, x1, 0.4, 0.88, z1 - 0.22, z1, c(dark), { rx: 0.1 });
  s += cam.box(x0, x0 + 0.14, 0.4, 0.62, z0, z1 - 0.22, c(dark), { rx: 0.06 });
  s += cam.box(x1 - 0.14, x1, 0.4, 0.62, z0, z1 - 0.22, c(dark), { rx: 0.06 });
  s += cam.box(x0 + 0.14, x1 - 0.14, 0.4, 0.5, z0 + 0.02, z1 - 0.22, c(lighten(col, 0.08)), { rx: 0.05 });
  s += cam.box(x0 + 0.12, x1 - 0.12, 0.5, 0.85, z1 - 0.34, z1 - 0.22, c(lighten(col, 0.05)), { rx: 0.08 });
  return s;
}
// round pouf / ottoman
function pouf(cam, cx, cz, rad, h, col, o = {}) {
  const [x, y] = cam.P(cx, 0, cz); const k = cam.s(cz);
  const gr = lin('pf' + hkey(col), [[0, shade(col, 0.22)], [0.35, lighten(col, 0.1)], [1, shade(col, 0.32)]], [0, 0, 1, 0]);
  const ry = rad * k * 0.3;
  let s = shadowEll(x + 6, y, rad * k * 1.1, ry * 1.0, 0.38, 8);
  s += path_(`M${r1(x - rad * k)} ${r1(y - h * k)}L${r1(x - rad * k)} ${r1(y)}A${r1(rad * k)} ${r1(ry)} 0 0 0 ${r1(x + rad * k)} ${r1(y)}L${r1(x + rad * k)} ${r1(y - h * k)}Z`, gr);
  s += ellipse(x, y - h * k, rad * k, ry, lighten(col, 0.12));
  s += ellipse(x, y - h * k, rad * k * 0.82, ry * 0.8, lighten(col, 0.18), { op: 0.7 });
  s += circle(x, y - h * k, 3, shade(col, 0.2));
  if (o.band) s += path_(`M${r1(x - rad * k)} ${r1(y - h * k * 0.55)}A${r1(rad * k)} ${r1(ry)} 0 0 0 ${r1(x + rad * k)} ${r1(y - h * k * 0.55)}`, 'none', { stroke: o.band, sw: 2, op: 0.9 });
  return s;
}
// Round-rect style items drawn in screen space for rugs/cushions
function cushion(x, y, w, h, col, rot = 0, kind = 0, o = {}) {
  let s = '';
  const inner = [];
  inner.push(rrect(-w / 2, -h / 2, w, h, Math.min(w, h) * 0.18, soft(col, 0.1, 0.14), { stroke: shade(col, 0.2), sw: 1 }));
  if (kind === 1) { for (let i = -2; i <= 2; i++) inner.push(line(-w / 2 + w * 0.1, i * h * 0.16, w / 2 - w * 0.1, i * h * 0.16, o.line || C.brass, 1.4, { op: 0.8 })); }
  if (kind === 2) { inner.push(regPoly(0, 0, Math.min(w, h) * 0.3, 4, Math.PI / 4, 'none', { stroke: o.line || C.brass, sw: 1.6 })); inner.push(regPoly(0, 0, Math.min(w, h) * 0.15, 4, Math.PI / 4, o.line || C.brass, { op: 0.85 })); }
  if (kind === 3) { for (let i = -3; i <= 3; i++) for (let j = -3; j <= 3; j++) if ((i + j) % 2 === 0) inner.push(circle(i * w * 0.11, j * h * 0.11, w * 0.018, o.line || C.cream, { op: 0.7 })); }
  inner.push(path_(`M${-w / 2 + 3} ${-h / 2 + 3}L${w / 2 - 3} ${-h / 2 + 3}L${w / 2 - 3} ${-h / 2 + 5}L${-w / 2 + 3} ${-h / 2 + 5}Z`, '#fff', { op: 0.18 }));
  s += g(inner, { tf: `translate(${r1(x)} ${r1(y)}) rotate(${rot})` });
  return s;
}

// =============================================================================
// 1. LIVING ROOM
// =============================================================================
function livingRoom() {
  begin('ilr');
  const cam = new Cam(725, 600, 452, 1.25);
  const R = { W: 3.2, H: 2.75, Zb: 6.0, Zn: 1.0, wall: vgrad('#efe6d5', '#e2d6bf') };
  R.wallB = vgrad('#f1e8d8', '#e6dbc5');
  R.floor = vgrad('#cfc2a9', '#e8dfcc');
  const Sb = surfBack(cam, R.Zb), SL = surfL(cam, R.W), SR = surfR(cam, R.W);
  add(roomShell(cam, R));
  // floor marble grid + sheen
  add(floorGrid(cam, R, 1.2, '#a89b82', 1.2, 0.35, 0.0, 0));
  add(floorVeins(cam, R, 1.2, 14, '#a39379'));
  add(floorSheen(cam, R, 0.4));
  add(ceilingTray(cam, R, 0.65, 0.18));

  // ---- back wall: large window with curtains
  add(sq(Sb, -2.65, 2.65, 0.28, 2.55, '#d3c6ac'));
  add(windowOn(Sb, -2.4, 2.4, 0.5, 2.4, { cols: 4, tag: 'lr', t: 0.04, seed: 5 }));
  // sill
  add(sq(Sb, -2.5, 2.5, 0.44, 0.5, C.white));
  add(sq(Sb, -2.55, 2.55, 0.4, 0.44, shade(C.white, 0.1)));
  // sheer curtains
  add(curtainOn(Sb, -2.5, -0.05, 2.5, 0.05, '#fbf8f1', 14, { sheer: true, sway: 0.0 }));
  add(curtainOn(Sb, 0.05, 2.5, 2.5, 0.05, '#fbf8f1', 14, { sheer: true, sway: 0.0 }));
  // main drapes (sand/olive)
  add(curtainOn(Sb, -3.1, -2.15, 2.58, 0.04, '#b9a27a', 7));
  add(curtainOn(Sb, 2.15, 3.1, 2.58, 0.04, '#b9a27a', 7));
  add(rodOn(Sb, -3.15, 3.15, 2.62));
  // left wall decor: art triptych + console + lamp
  add(g([
    sq(SL, 3.5, 5.2, 0.0, 2.75, 'none'),
  ]));
  // left wall wooden wainscot panels
  for (let i = 0; i < 5; i++) { const a = 3.05 + i * 0.62; add(sq(SL, a, a + 0.5, 0.18, 1.0, shade('#e9dfcb', 0.04), { stroke: shade('#e9dfcb', 0.12), sw: 1 })); }
  // left wall art
  add(sq(SL, 3.5, 5.5, 1.35, 2.4, 'none'));
  const fl = [[3.6, 4.2, 1.5, 2.3, 0], [4.3, 4.9, 1.5, 2.3, 2], [5.0, 5.6, 1.5, 2.3, 1]];
  for (const [a, b, v0, v1, kd] of fl) {
    add(sq(SL, a - 0.025, b + 0.025, v0 - 0.025, v1 + 0.025, C.brass));
    add(sq(SL, a, b, v0, v1, ['#f5ecd9', '#f3e5cc', '#efe3cd'][kd]));
    if (kd === 0) add(sc(SL, (a + b) / 2, (v0 + v1) / 2 + 0.1, 0.18, 0.18, C.terra, { op: 0.9 }), sp(SL, [[a, v0], [b, v0], [b, v0 + 0.45], [(a + b) / 2, v0 + 0.3]], C.navy2));
    if (kd === 1) add(sq(SL, a + 0.06, b - 0.06, v0 + 0.06, v0 + 0.45, C.sage, { op: 0.9 }), sq(SL, a + 0.06, b - 0.06, v0 + 0.45, v1 - 0.06, C.sand2, { op: 0.9 }), sc(SL, (a + b) / 2, v1 - 0.25, 0.1, 0.1, C.brass));
    if (kd === 2) add(sp(SL, [[a + 0.05, v0 + 0.05], [b - 0.05, v0 + 0.05], [b - 0.05, v1 - 0.3], [a + 0.05, v1 - 0.05]], C.navy3, { op: 0.9 }), sc(SL, (a + b) / 2, v1 - 0.28, 0.12, 0.12, C.brassL));
  }

  // ---- right wall: TV feature wall
  const wallPanel = '#2a2118';
  add(slatsOn(SR, 3.25, 5.95, 0.0, 2.75, C.walnut, 46, { alt: C.woodL, seed: 4 }));
  // marble slab
  add(marbleOn(SR, 3.95, 5.35, 0.42, 2.55, { tag: 'tv', seed: 12, n: 5 }));
  add(sq(SR, 3.95, 5.35, 2.55, 2.58, C.brass));
  // LED strips
  add(ledOn(SR, 3.95, 0.42, 5.35, 0.42));
  add(ledOn(SR, 3.95, 0.42, 3.95, 2.55, '#ffd9a0', 1.6));
  add(ledOn(SR, 5.35, 0.42, 5.35, 2.55, '#ffd9a0', 1.6));
  // TV
  const tvg = lin('tvg', [[0, '#1b2230'], [0.5, '#0b1018'], [1, '#202838']], [0, 0, 1, 1]);
  add(sq(SR, 4.15, 5.15, 1.02, 1.62, '#0a0e14'));
  add(sq(SR, 4.17, 5.13, 1.04, 1.60, tvg));
  add(sp(SR, [[4.17, 1.04], [4.5, 1.04], [4.3, 1.6], [4.17, 1.6]], '#fff', { op: 0.07 }));
  add(sq(SR, 4.15, 5.15, 1.02, 1.03, '#222a38'));
  // floating console with underglow
  add(cam.box(R.W - 0.4, R.W, 0.34, 0.58, 3.95, 5.65, { front: C.walnut, top: lighten(C.walnut, 0.2), left: shade(C.walnut, 0.2), right: lighten(C.walnut, 0.05) }, { flat: true }));
  // right face of console (facing -X) is the inward face (not visible from camera at x=0: box x0>0 -> left face visible)
  add(sq(SR, 3.95, 5.65, 0.3, 0.34, '#ffe3b0', { op: 0.9, filter: blur(3) }));
  // decor on console
  { const [bx, by] = cam.P(R.W - 0.2, 0.6, 4.2); const k = cam.s(4.2); add(vase(bx, by, k * 1.3, C.teal, { h: 0.34, w: 0.16 })); }
  { const [bx, by] = cam.P(R.W - 0.2, 0.6, 5.35); const k = cam.s(5.35); add(books(bx, by, k * 1.1, 3), `<g transform="translate(${r1(bx)} ${r1(by - 0.1 * k)})">${ellipse(0, 0, 0.04 * k, 0.04 * k, C.brass)}</g>`); }
  // niche shelving at far-right of wall near corner
  add(roomShade(cam, R, { ao: 0.22 }));
  // ---- floor lighting patch from the window
  add(cam.quad([[-2.4, 0, 5.95], [2.4, 0, 5.95], [1.6, 0, 2.2], [-3.4, 0, 2.2]], lin('winlight', [[0, '#fff6dc', 0.7], [1, '#fff6dc', 0]], [0, 0, 0, 1]), { style: 'mix-blend-mode:screen', filter: blur(5) }));

  // ---- rug
  const rx0 = -2.3, rx1 = 2.1, rz0 = 2.75, rz1 = 5.15;
  add(shadowPoly([cam.P(rx0 + 0.05, 0, rz0 + 0.05), cam.P(rx1 + 0.05, 0, rz0 + 0.05), cam.P(rx1 + 0.08, 0, rz1), cam.P(rx0 + 0.08, 0, rz1)], 0.3, 4));
  add(rugPaint((u, v) => cam.P(rx0 + u * (rx1 - rx0), 0, rz0 + (1 - v) * (rz1 - rz0)), { field: '#a85a3a', field2: '#8b4730', border: '#13263e', accent: '#d9c08a', motif: '#e9d9b0' }, { asp: (rz1 - rz0) / (rx1 - rx0), nU: 14, nV: 6 }));
  // fringe
  for (let i = 0; i <= 44; i++) { const u = i / 44; const a = cam.P(rx0 + u * (rx1 - rx0), 0, rz0), b = cam.P(rx0 + u * (rx1 - rx0), 0, rz0 - 0.08); add(line(a[0], a[1], b[0], b[1], '#eadfc6', 1.1)); }

  // ---- lamp on floor near sofa left? plants and decor behind sofa first
  { const [x, y] = cam.P(-2.75, 0, 5.4); add(plantFiddle(x, y, cam.s(5.4) * 1.1, { h: 1.65, seed: 14 })); }
  { const [x, y] = cam.P(2.7, 0, 5.6); add(plantPalm(x, y, cam.s(5.6) * 1.1, { h: 1.1, seed: 6, pot: C.sand2 })); }

  // ---- SOFA (L-shape), navy-slate fabric
  const sofa = '#3e546e', sofaD = shade(sofa, 0.1), cush = lighten(sofa, 0.1);
  const sc_ = (c) => ({ front: c, top: lighten(c, 0.14), left: shade(c, 0.24), right: lighten(c, 0.05) });
  // shadow
  add(shadowPoly([cam.P(-1.95, 0, 3.8), cam.P(-0.7, 0, 3.8), cam.P(-0.7, 0, 5.0), cam.P(1.2, 0, 5.0), cam.P(1.2, 0, 6.0), cam.P(-1.95, 0, 6.0)], 0.4, 9));
  // legs
  for (const [x, z] of [[-1.8, 4.0], [-0.95, 4.0], [-1.8, 5.9], [0.95, 5.9], [0.95, 5.1], [-0.2, 5.9]]) add(cam.box(x - 0.025, x + 0.025, 0, 0.11, z - 0.025, z + 0.025, C.brass, { flat: true }));
  // base frames
  add(cam.box(-1.9, 1.1, 0.1, 0.38, 5.0, 6.0, sc_(sofa), { rx: 0.03 }));
  // backrest (rear)
  add(cam.box(-1.9, 1.1, 0.38, 0.92, 5.75, 6.0, sc_(sofaD), { rx: 0.06 }));
  // back cushions
  const bc = [[-1.55, -0.62], [-0.58, 0.35], [0.39, 0.82]];
  // chaise base
  add(cam.box(-1.9, -0.8, 0.1, 0.38, 3.85, 5.0, sc_(sofa), { rx: 0.03 }));
  // chaise arm (left) and main arms
  add(cam.box(-1.9, -1.62, 0.38, 0.66, 3.85, 5.75, sc_(sofaD), { rx: 0.08 }));
  add(cam.box(-1.9, -1.62, 0.38, 0.94, 5.75, 6.0, sc_(sofaD), { rx: 0.08 }));
  add(cam.box(0.84, 1.1, 0.38, 0.7, 5.0, 6.0, sc_(sofaD), { rx: 0.08 }));
  // seat cushions
  add(cam.box(-1.6, -0.82, 0.38, 0.52, 3.9, 5.75, sc_(cush), { rx: 0.05 }));
  add(cam.box(-0.8, 0.0, 0.38, 0.52, 5.0, 5.75, sc_(cush), { rx: 0.05 }));
  add(cam.box(0.02, 0.82, 0.38, 0.52, 5.0, 5.75, sc_(cush), { rx: 0.05 }));
  // back cushions (leaning)
  for (const [a, b] of [[-1.6, -0.82], [-0.8, 0.0], [0.02, 0.82]]) add(cam.box(a, b, 0.52, 0.9, 5.6, 5.8, sc_(lighten(sofa, 0.06)), { rx: 0.07, fu: 0.08 }));
  // throw pillows
  { const k = cam.s(5.7); const [x, y] = cam.P(-1.2, 0.58, 5.6); add(cushion(x, y - 0.14 * k, 0.4 * k, 0.4 * k, C.cream, -8, 1, { line: C.brassD })); }
  { const k = cam.s(5.7); const [x, y] = cam.P(0.45, 0.58, 5.6); add(cushion(x, y - 0.14 * k, 0.4 * k, 0.4 * k, C.terra, 7, 2, { line: C.cream })); }
  { const k = cam.s(5.7); const [x, y] = cam.P(0.1, 0.58, 5.6); add(cushion(x, y - 0.12 * k, 0.36 * k, 0.36 * k, C.brass, -3, 3, { line: C.cream })); }
  { const k = cam.s(4.4); const [x, y] = cam.P(-1.25, 0.55, 4.4); add(cushion(x, y - 0.03 * k, 0.42 * k, 0.26 * k, '#cdbb92', -4, 1, { line: C.navy2 })); }
  // knitted blanket on chaise
  { const a = cam.P(-1.55, 0.52, 4.0), b = cam.P(-1.05, 0.52, 4.0), c = cam.P(-1.0, 0.52, 4.9), d = cam.P(-1.6, 0.52, 4.9); add(poly([a, b, c, d], '#e4d5b4', { op: 0.95 })); for (let i = 1; i < 6; i++) { const t = i / 6; const p = cam.P(-1.58, 0.521, 4 + t * 0.9), q = cam.P(-1.02, 0.521, 4 + t * 0.9); add(line(p[0], p[1], q[0], q[1], '#bfa87a', 1.2, { op: 0.6 })); } }

  // ---- coffee table (marble top, brass frame)
  { const x0 = -0.55, x1 = 0.85, z0 = 3.35, z1 = 4.3;
    add(shadowPoly([cam.P(x0 + 0.1, 0, z0 + 0.1), cam.P(x1 + 0.1, 0, z0 + 0.1), cam.P(x1 + 0.2, 0, z1 + 0.05), cam.P(x0 + 0.2, 0, z1 + 0.05)], 0.35, 8));
    // shelf
    add(cam.box(x0 + 0.05, x1 - 0.05, 0.1, 0.13, z0 + 0.05, z1 - 0.05, { front: '#2d2a28', top: '#3b3835', left: '#242220', right: '#2d2a28' }, { flat: true }));
    for (const [x, z] of [[x0 + 0.04, z0 + 0.04], [x1 - 0.04, z0 + 0.04], [x0 + 0.04, z1 - 0.04], [x1 - 0.04, z1 - 0.04]]) add(cam.box(x - 0.02, x + 0.02, 0, 0.38, z - 0.02, z + 0.02, C.brass, { flat: true }));
    add(cam.box(x0, x1, 0.36, 0.41, z0, z1, { front: '#d9d6cf', top: '#f4f2ec', left: '#bdb9b0', right: '#d9d6cf' }, { flat: true }));
    // marble veins on top
    for (let i = 0; i < 4; i++) { const u = rr(0.1, 0.9); const p = cam.P(x0 + u * (x1 - x0), 0.411, z0 + 0.03), q = cam.P(x0 + (u + rr(-0.2, 0.2)) * (x1 - x0), 0.411, z1 - 0.03); add(line(p[0], p[1], q[0], q[1], '#9b9a97', 1, { op: 0.4 })); }
    // objects: tray, vase, books
    const [tx, ty] = cam.P(0.15, 0.41, 3.8); const k = cam.s(3.8);
    add(ellipse(tx, ty, 0.2 * k, 0.045 * k, C.brass, { op: 0.9 }), ellipse(tx, ty - 1, 0.18 * k, 0.038 * k, lighten(C.brass, 0.3)));
    add(vase(tx - 0.03 * k, ty - 2, k, C.navy2, { h: 0.2, w: 0.1, branch: true, bloom: '#f0e6d0' }));
    const [bx, by] = cam.P(0.55, 0.41, 3.9); add(books(bx, by, k, 3));
    add(circle(bx, by - 0.1 * k, 0.05 * k, C.teal));
  }
  // ---- round side table w/ lamp (right of sofa)
  { const [x, y] = cam.P(1.55, 0, 5.2); const k = cam.s(5.2);
    add(shadowEll(x, y, 0.3 * k, 0.07 * k, 0.4, 6));
    add(rect(x - 0.012 * k, y - 0.52 * k, 0.024 * k, 0.52 * k, C.brass));
    add(ellipse(x, y, 0.15 * k, 0.03 * k, C.brassD));
    add(ellipse(x, y - 0.52 * k, 0.25 * k, 0.055 * k, vgrad('#f4f2ec', '#c9c5bb')), rect(x - 0.25 * k, y - 0.52 * k, 0.5 * k, 0.012 * k, '#fff', { op: 0.5 }));
    add(tableLamp(x, y - 0.53 * k, k * 1.0, { shade: '#f6ead0' }));
  }
  // floor lamp (arc) by chaise? skip. Pendant chandelier:
  { const [x, y0] = cam.P(0, 2.75, 4.6); const k = cam.s(4.6); add(chandelier(x, y0, k, { arms: 8, r: 0.75, drop: 0.55, crystals: true })); }
  // foreground: armchair + pouf
  add(armchair(cam, 1.25, 2.1, 3.15, 4.05, '#c9ad7f'));
  { const [x, y] = cam.P(1.67, 0.62, 3.35); const k = cam.s(3.45); add(cushion(x, y, 0.34 * k, 0.34 * k, C.navy2, 5, 2, { line: C.brassL })); }
  add(pouf(cam, -1.95, 3.4, 0.27, 0.38, '#b5603c', { band: C.brassL }));
  // ceiling downlights
  add(downlights(cam, [[-2.2, 2.4], [2.2, 2.4], [-2.2, 4.2], [2.2, 4.2], [-2.2, 5.6], [2.2, 5.6]], 2.57));
  add(finishLayer({ vig: 0.34, glow: '#ffd9a0', glowOp: 0.14, gx: 0.5, gy: 0.35 }));
  finish('interior-living-room.svg', 'Modern living room', 'A bright modern Pakistani living and TV lounge with an L-shaped sofa, patterned rug, marble and walnut TV feature wall with LED strip, brass chandelier, large window with curtains and indoor plants.', [1.06, 700, 520, -34]);
}

// Wood plank floor in perspective
function floorPlanks(cam, R, wd = 0.2, base = C.oak, o = {}) {
  const { W, Zb, Zn = 1.0 } = R; let s = ''; reseed(o.seed ?? 31);
  const nCol = Math.round((2 * W) / wd);
  for (let i = 0; i < nCol; i++) {
    let z = Zn;
    const x0 = -W + i * wd, x1 = x0 + wd;
    let first = true;
    while (z < Zb - 0.001) {
      const len = first ? rr(0.4, 1.6) : rr(0.9, 2.0); first = false;
      const z1 = Math.min(Zb, z + len);
      const c = mix(darken(base, 0.04), lighten(base, 0.12), rnd());
      s += cam.fq(x0, x1, z, z1, c, { stroke: shade(c, 0.22), sw: 0.6, so: 0.5 });
      z = z1;
    }
  }
  return s;
}
// Bedroom nightstand with drawer, brass pulls
function nightstand(cam, x0, x1, z0, z1, col = C.walnut) {
  let s = shadowPoly([cam.P(x0 + 0.05, 0, z0), cam.P(x1 + 0.1, 0, z0), cam.P(x1 + 0.12, 0, z1), cam.P(x0 + 0.05, 0, z1)], 0.35, 5);
  s += cam.box(x0, x1, 0.12, 0.55, z0, z1, { front: col, top: lighten(col, 0.22), left: shade(col, 0.22), right: lighten(col, 0.04) }, { rx: 0.015 });
  for (const [x, z] of [[x0 + 0.04, z0 + 0.04], [x1 - 0.04, z0 + 0.04]]) s += cam.box(x - 0.015, x + 0.015, 0, 0.13, z - 0.015, z + 0.015, C.brass, { flat: true });
  const a = cam.P(x0, 0.55, z0), b = cam.P(x1, 0.12, z0);
  const w = b[0] - a[0], hh = b[1] - a[1];
  s += rect(a[0] + w * 0.08, a[1] + hh * 0.1, w * 0.84, hh * 0.38, shade(col, 0.1), { rx: 2, stroke: shade(col, 0.3), sw: 0.8 });
  s += rect(a[0] + w * 0.08, a[1] + hh * 0.54, w * 0.84, hh * 0.38, shade(col, 0.1), { rx: 2, stroke: shade(col, 0.3), sw: 0.8 });
  s += rect(a[0] + w * 0.38, a[1] + hh * 0.26, w * 0.24, 2.4, C.brassL, { rx: 1 });
  s += rect(a[0] + w * 0.38, a[1] + hh * 0.7, w * 0.24, 2.4, C.brassL, { rx: 1 });
  return s;
}

// =============================================================================
// 2. BEDROOM
// =============================================================================
function bedroom() {
  begin('ibd');
  const cam = new Cam(740, 600, 440, 1.8);
  const R = { W: 3.0, H: 2.7, Zb: 6.0, Zn: 1.0, wall: vgrad('#eee5d3', '#e0d3ba') };
  R.wallB = '#1c3454';
  const Sb = surfBack(cam, R.Zb), SL = surfL(cam, R.W), SR = surfR(cam, R.W);
  R.floor = '#c0996c';
  add(roomShell(cam, R));
  add(floorPlanks(cam, R, 0.2, '#b99468'));
  add(floorSheen(cam, R, 0.35));
  add(ceilingTray(cam, R, 0.6, 0.16, '#ffd9a8'));

  // ---- headboard wall: padded navy panels with brass inlay
  const panelCol = '#203a5c';
  add(sq(Sb, -2.45, 2.45, 0, 2.7, shade(panelCol, 0.25)));
  const pw = 0.8;
  for (let i = 0; i < 6; i++) {
    const u0 = -2.4 + i * 0.8, u1 = u0 + 0.76;
    const gid = lin('pn' + i, [[0, lighten(panelCol, 0.12)], [0.5, panelCol], [1, shade(panelCol, 0.2)]], [0, 0, 1, 0]);
    add(sq(Sb, u0, u1, 0.1, 2.55, gid));
    // quilting buttons / diamond stitching
    for (let j = 0; j < 7; j++) add(sc(Sb, (u0 + u1) / 2, 0.35 + j * 0.34, 0.02, 0.02, C.brass));
    add(sl(Sb, u0 + 0.02, 0.1, u0 + 0.02, 2.55, lighten(panelCol, 0.28), 1.2, { op: 0.35 }));
    add(sq(Sb, u1 - 0.012, u1 + 0.015, 0.1, 2.55, C.brass));
  }
  add(ledOn(Sb, -2.45, 2.62, 2.45, 2.62, '#ffd9a0', 2));
  add(ledOn(Sb, -2.45, 0.05, 2.45, 0.05, '#ffd9a0', 1.4));
  // side wall back portions: pale wall regions beyond panel (left/right of -2.45..2.45) already wall color via wallB? fill them
  add(sq(Sb, -3.0, -2.45, 0, 2.7, vgrad('#e8dcc4', '#d9c9a8')), sq(Sb, 2.45, 3.0, 0, 2.7, vgrad('#e8dcc4', '#d9c9a8')));
  add(sq(Sb, -2.5, -2.45, 0, 2.7, C.brass), sq(Sb, 2.45, 2.5, 0, 2.7, C.brass));

  // ---- left wall: wardrobe (depth 0.62)
  const wd = 0.62; const SL2 = surfL(cam, R.W - wd);
  // wardrobe shadow & body
  add(cam.frect(-R.W, -R.W + wd, 0, 2.55, 3.45, hgrad('#6a4328', '#8a5a38')));
  add(sq(SL2, 3.45, 6.0, 0, 2.55, vgrad('#7a4e2f', '#5f3a22')));
  const doorW = (6.0 - 3.45) / 4;
  for (let i = 0; i < 4; i++) {
    const a = 3.45 + i * doorW + 0.01, b = a + doorW - 0.02;
    if (i === 2) {
      add(sq(SL2, a, b, 0.08, 2.5, lin('mirr', [[0, '#cfe0e6'], [0.5, '#a9c3cf'], [1, '#d6e4e8']], [0, 0, 1, 1])));
      add(sp(SL2, [[a, 0.08], [a + 0.3, 0.08], [a + 0.12, 2.5], [a, 2.5]], '#fff', { op: 0.25 }));
      add(sq(SL2, a, b, 0.08, 0.1, C.brass), sq(SL2, a, b, 2.48, 2.5, C.brass));
    } else {
      const col = i % 2 ? '#7d5030' : '#8a5a38';
      add(sq(SL2, a, b, 0.08, 2.5, col, { stroke: shade(col, 0.3), sw: 1 }));
      // veneer grain
      for (let j = 0; j < 7; j++) add(sl(SL2, a + 0.03 + j * doorW * 0.13, 0.12, a + 0.03 + j * doorW * 0.13, 2.45, lighten(col, 0.18), 1, { op: 0.25 }));
      add(sq(SL2, a + 0.05, b - 0.05, 0.13, 2.45, 'none', { stroke: shade(col, 0.2), sw: 1, op: 0.7 }));
    }
    add(sq(SL2, b - 0.07, b - 0.055, 0.9, 1.5, C.brass));
  }
  add(sq(SL2, 3.45, 6.0, 2.55, 2.59, shade(C.walnut, 0.3)));
  // wardrobe top LED
  add(ledOn(SL2, 3.45, 2.52, 6.0, 2.52, '#ffd9a0', 1.6));
  // wardrobe front returns on wall
  // ---- right wall: window + curtains
  add(sq(SR, 3.35, 5.85, 0.0, 2.7, 'none'));
  add(windowOn(SR, 4.0, 5.55, 0.55, 2.35, { cols: 2, tag: 'bd', seed: 9, t: 0.04 }));
  add(sq(SR, 3.95, 5.6, 0.5, 0.55, C.white));
  add(curtainOn(SR, 3.9, 5.65, 2.5, 0.04, '#f8f3ea', 12, { sheer: true, sway: 0 }));
  add(curtainOn(SR, 3.55, 4.1, 2.58, 0.04, '#9c8a63', 6));
  add(curtainOn(SR, 5.55, 6.0, 2.58, 0.04, '#9c8a63', 6));
  add(rodOn(SR, 3.5, 6.0, 2.62));
  // radiator/ console under window? plant by window later
  add(roomShade(cam, R, { ao: 0.25 }));

  // ---- window light patch on floor
  add(cam.quad([[R.W, 0, 5.55], [R.W, 0, 4.0], [0.6, 0, 2.6], [0.6, 0, 4.0]], lin('bwl', [[0, '#fff3d4', 0.65], [1, '#fff3d4', 0]], [1, 0, 0, 1]), { style: 'mix-blend-mode:screen', filter: blur(5) }));

  // ---- rug
  const rx0 = -2.35, rx1 = 2.35, rz0 = 2.7, rz1 = 5.7;
  add(shadowPoly([cam.P(rx0 + 0.05, 0, rz0), cam.P(rx1 + 0.05, 0, rz0), cam.P(rx1 + 0.08, 0, rz1), cam.P(rx0 + 0.08, 0, rz1)], 0.28, 4));
  add(rugPaint((u, v) => cam.P(rx0 + u * (rx1 - rx0), 0, rz0 + (1 - v) * (rz1 - rz0)), { field: '#e5d9bf', field2: '#d4c19a', border: '#c9a24b', accent: '#203a5c', motif: '#a8372d' }, { asp: (rz1 - rz0) / (rx1 - rx0), nU: 16, nV: 6 }));

  // ---- nightstands
  add(nightstand(cam, -2.0, -1.4, 5.35, 6.0));
  add(nightstand(cam, 1.4, 2.0, 5.35, 6.0));
  // lamps and decor
  { const k = cam.s(5.65); let [x, y] = cam.P(-1.7, 0.55, 5.65); add(tableLamp(x, y, k * 1.15, { shade: '#f7edd6' })); [x, y] = cam.P(1.7, 0.55, 5.65); add(tableLamp(x, y, k * 1.15, { shade: '#f7edd6' }));
    [x, y] = cam.P(-1.5, 0.55, 5.6); add(books(x, y, k * 1.3, 3)); [x, y] = cam.P(1.52, 0.55, 5.6); add(vase(x, y, k * 1.3, C.sage, { h: 0.22, w: 0.1, branch: true, bloom: '#f0e6d0' })); }
  // pendants beside bed
  for (const sx of [-1.7, 1.7]) { const [x, y0] = cam.P(sx, 2.7, 5.7); const k = cam.s(5.7); add(pendantDome(x, y0, k, 0.6, 0.17, C.brass)); }

  // ---- BED
  const bedW = 1.0; const linen = '#f6f1e6';
  const L = (cl) => ({ front: cl, top: lighten(cl, 0.1), left: shade(cl, 0.2), right: cl });
  add(shadowPoly([cam.P(-bedW - 0.25, 0, 3.8), cam.P(bedW + 0.35, 0, 3.8), cam.P(bedW + 0.45, 0, 6.0), cam.P(-bedW - 0.15, 0, 6.0)], 0.4, 10));
  // headboard (tall, upholstered cream, wraps)
  add(cam.box(-1.35, 1.35, 0.1, 1.38, 5.85, 6.0, L('#c9b48b'), { rx: 0.05 }));
  // brass trim on headboard top
  add(cam.box(-1.35, 1.35, 1.38, 1.4, 5.85, 6.0, C.brass, { flat: true }));
  // headboard channels
  for (let i = 0; i < 6; i++) { const u = -1.35 + 0.45 * (i + 0.5); add(cam.frect(u - 0.015, u + 0.015, 0.7, 1.33, 5.85, shade('#c9b48b', 0.18), { op: 0.7 })); }
  // base platform
  add(cam.box(-bedW - 0.05, bedW + 0.05, 0.08, 0.36, 3.82, 5.9, L('#6b4528'), { rx: 0.02 }));
  // mattress
  add(cam.box(-bedW, bedW, 0.36, 0.6, 3.88, 5.88, L('#efe9dc'), { rx: 0.05 }));
  // duvet (layered): linen with fold
  add(cam.box(-bedW - 0.03, bedW + 0.03, 0.28, 0.66, 3.85, 5.15, L(linen), { rx: 0.06 }));
  // folded-back top sheet band
  add(cam.hq(-bedW - 0.03, bedW + 0.03, 4.7, 5.15, 0.665, lin('fold', [[0, '#ffffff'], [1, '#e6dfcf']])));
  add(cam.quad([[-bedW - 0.03, 0.665, 4.7], [bedW + 0.03, 0.665, 4.7], [bedW + 0.03, 0.62, 4.7], [-bedW - 0.03, 0.62, 4.7]], '#ddd3be'));
  // quilting lines on duvet top
  for (let i = 1; i < 5; i++) { const x = -bedW + (2 * bedW * i) / 5; const a = cam.P(x, 0.667, 3.9), b = cam.P(x, 0.667, 4.65); add(line(a[0], a[1], b[0], b[1], '#d9cfba', 1.3, { op: 0.9 })); }
  // throw runner over the bed (navy with brass stripes)
  add(cam.hq(-bedW - 0.03, bedW + 0.03, 4.0, 4.65, 0.67, lin('runner', [[0, '#35618e'], [1, '#1f3d5e']])));
  add(cam.quad([[-bedW - 0.03, 0.67, 4.0], [bedW + 0.03, 0.67, 4.0], [bedW + 0.03, 0.6, 4.0], [-bedW - 0.03, 0.6, 4.0]], '#1b3556'));
  for (const zz of [4.07, 4.58]) { const a = cam.P(-bedW - 0.03, 0.672, zz), b = cam.P(bedW + 0.03, 0.672, zz); add(line(a[0], a[1], b[0], b[1], C.brass, 2)); }
  for (let i = 0; i <= 28; i++) { const x = -bedW - 0.03 + (2 * (bedW + 0.03) * i) / 28; const a = cam.P(x, 0.6, 4.0), b = cam.P(x, 0.53, 4.0); add(line(a[0], a[1], b[0], b[1], C.brassL, 1.2)); }
  // pillows
  const pz = 5.55; const kp = cam.s(pz);
  const pillow = (x, h, w, hh, col, rot, kind) => { const [px, py] = cam.P(x, h, pz); return cushion(px, py - hh * kp / 2, w * kp, hh * kp, col, rot, kind, { line: C.brass }); };
  add(pillow(-0.55, 0.62, 0.62, 0.52, '#faf6ee', -2, 0));
  add(pillow(0.55, 0.62, 0.62, 0.52, '#faf6ee', 2, 0));
  add(pillow(-0.55, 0.6, 0.62, 0.42, '#e9e1cf', -1, 0));
  { const zz = 5.0, kk = cam.s(zz); const mk = (x, col, rot, kind, w) => { const [px, py] = cam.P(x, 0.66, zz); return cushion(px, py - 0.14 * kk, w * kk, 0.28 * kk, col, rot, kind, { line: C.brassL }); };
    add(mk(-0.62, '#27496d', -3, 2, 0.5)); add(mk(0.62, '#b5603c', 3, 1, 0.5)); add(mk(0.0, '#c9a24b', 0, 3, 0.4)); }

  // ---- bench at foot of bed
  add(shadowPoly([cam.P(-0.7, 0, 2.95), cam.P(0.85, 0, 2.95), cam.P(0.9, 0, 3.4), cam.P(-0.65, 0, 3.4)], 0.35, 6));
  for (const [x, z] of [[-0.68, 3.0], [0.68, 3.0], [-0.68, 3.3], [0.68, 3.3]]) add(cam.box(x - 0.025, x + 0.025, 0, 0.18, z - 0.025, z + 0.025, C.brass, { flat: true }));
  add(cam.box(-0.75, 0.75, 0.16, 0.4, 2.95, 3.35, L('#8f9f7e'), { rx: 0.05 }));
  add(cam.frect(-0.75, 0.75, 0.34, 0.36, 2.95, C.brass));

  // plant & chair at right window corner
  { const [x, y] = cam.P(2.55, 0, 5.9); add(plantSnake(x, y, cam.s(5.9) * 1.25, { pot: '#b9a77f', sc: 1.25 })); }
  { const [x, y] = cam.P(-2.55, 0, 3.3); }
  { const [x, y0] = cam.P(0, 2.7, 4.4); const k = cam.s(4.4); add(drumPendant(x, y0, k, 0.75, 0.36, 0.28)); }
  add(downlights(cam, [[-1.8, 2.4], [1.8, 2.4], [-1.8, 4.2], [1.8, 4.2]], 2.54));
  add(finishLayer({ vig: 0.36, glow: '#ffd9a0', glowOp: 0.12, gx: 0.5, gy: 0.4 }));
  finish('interior-bedroom.svg', 'Master bedroom', 'A calm master bedroom with a padded navy headboard wall, a bed dressed in layered linen, nightstands with brass lamps, a walnut wardrobe, sheer curtains at the window and a patterned rug.', [1.14, 600, 600, -50]);
}

// Tile pattern (fronto-parallel only). ts = tile size px; returns fill url
function tilePat(name, ts, base, grout, o = {}) {
  const cols = o.cols || 4, rows = o.rows || 2; reseed(o.seed ?? 5);
  let inner = rect(0, 0, ts * cols, ts * rows, grout);
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    const c = mix(base, o.alt || lighten(base, 0.18), rnd() * (o.var ?? 0.7));
    const off = o.brick && j % 2 ? ts * 0.5 : 0;
    const gx = i * ts + off, gy = j * ts;
    inner += rect(gx + 1, gy + 1, ts - 2, ts - 2, c, { rx: o.rx ?? 1.5 });
    inner += rect(gx + 1, gy + 1, ts - 2, (ts - 2) * 0.38, '#fff', { op: o.gloss ?? 0.1, rx: o.rx ?? 1.5 });
    if (o.brick && off) inner += rect(gx - ts + 1, gy + 1, ts - 2, ts - 2, c, { rx: o.rx ?? 1.5 });
  }
  return pattern(name, ts * cols, ts * rows, inner);
}
// Cabinet door run on a fronto-parallel surface; handleless with brass reveal
function doorsOn(Sf, u0, u1, v0, v1, n, col, o = {}) {
  let s = ''; const du = (u1 - u0) / n;
  for (let i = 0; i < n; i++) {
    const a = u0 + du * i + 0.006, b = u0 + du * (i + 1) - 0.006;
    s += sq(Sf, a, b, v0, v1, o.flat ? col : (o.horizGrad ? hgrad(lighten(col, 0.04), shade(col, 0.1)) : soft(col, 0.05, 0.1)), { stroke: shade(col, 0.28), sw: 0.8 });
    if (o.reveal !== false) s += sq(Sf, a, b, o.top ? v1 - 0.02 : v0 + 0.0, o.top ? v1 : v0 + 0.0, 'none');
    // brass finger-pull edge
    if (o.pull === 'top') s += sq(Sf, a + 0.02, b - 0.02, v1 - 0.022, v1 - 0.012, C.brass);
    else if (o.pull === 'bottom') s += sq(Sf, a + 0.02, b - 0.02, v0 + 0.012, v0 + 0.022, C.brass);
    else if (o.pull === 'side') s += sq(Sf, i % 2 ? a + 0.03 : b - 0.04, i % 2 ? a + 0.04 : b - 0.03, v0 + (v1 - v0) * 0.3, v0 + (v1 - v0) * 0.7, C.brass);
    if (o.grain) for (let j = 0; j < 4; j++) s += sl(Sf, a + (b - a) * (0.18 + j * 0.22), v0 + 0.03, a + (b - a) * (0.18 + j * 0.22), v1 - 0.03, lighten(col, 0.2), 1, { op: 0.22 });
  }
  return s;
}
// bar stool (screen space)
function stool(cam, x, z, col = '#2a2f38', seat = '#c9a778') {
  const [px, py] = cam.P(x, 0, z); const k = cam.s(z);
  const h = 0.68 * k, r = 0.19 * k, ry = r * 0.3;
  let s = shadowEll(px + 4, py, r * 1.3, ry * 1.1, 0.38, 6);
  // legs
  for (const dx of [-0.8, 0.8]) { s += line(px + dx * r * 0.95, py - 0.02 * k, px + dx * r * 0.55, py - h, C.brassD, Math.max(2, k * 0.016), { lc: 'round' }); s += line(px + dx * r * 0.95 + 1.5, py - 0.02 * k, px + dx * r * 0.55 + 1.5, py - h, C.brassL, 0.8, { op: 0.6 }); }
  s += line(px, py - 0.02 * k, px, py - h, C.brassD, Math.max(2, k * 0.016));
  s += ellipse(px, py - h * 0.36, r * 0.78, ry * 0.8, 'none', { stroke: C.brass, sw: Math.max(1.5, k * 0.012) });
  // seat
  s += path_(`M${r1(px - r)} ${r1(py - h)}L${r1(px - r)} ${r1(py - h + 0.07 * k)}A${r1(r)} ${r1(ry)} 0 0 0 ${r1(px + r)} ${r1(py - h + 0.07 * k)}L${r1(px + r)} ${r1(py - h)}Z`, hgrad(shade(seat, 0.25), shade(seat, 0.1)));
  s += ellipse(px, py - h, r, ry, vgrad(lighten(seat, 0.2), seat));
  s += ellipse(px, py - h, r * 0.8, ry * 0.75, 'none', { stroke: shade(seat, 0.18), sw: 1, op: 0.7 });
  return s;
}

// =============================================================================
// 3. KITCHEN
// =============================================================================
function kitchen() {
  begin('ikn');
  const cam = new Cam(700, 600, 425, 1.6);
  const R = { W: 2.9, H: 2.7, Zb: 6.2, Zn: 1.0, wall: vgrad('#efe7d7', '#e3d8c2') };
  R.wallB = '#e9dfcc'; R.floor = vgrad('#bfb6a6', '#d7cfc0');
  const Sb = surfBack(cam, R.Zb), SL = surfL(cam, R.W), SR = surfR(cam, R.W);
  add(roomShell(cam, R));
  // floor: large porcelain tiles w/ grid + subtle warm veins
  add(floorGrid(cam, R, 0.8, '#8e8574', 1.1, 0.4));
  add(floorVeins(cam, R, 0.8, 18, '#8e8574'));
  add(floorSheen(cam, R, 0.4));
  add(ceilingTray(cam, R, 0.5, 0.15));
  add(cam.quad([[R.W, 0, 5.7], [R.W, 0, 4.2], [0.9, 0, 2.6], [0.9, 0, 3.8]], lin('kwl', [[0, '#fff3d4', 0.6], [1, '#fff3d4', 0]], [1, 0, 0, 1]), { style: 'mix-blend-mode:screen', filter: blur(6) }));

  // ---- BACK WALL
  const zc = R.Zb - 0.6; // front plane of base cabinets
  // backsplash tiles (full width, 0.93 .. 2.5)
  const ts = 0.15 * cam.s(R.Zb);
  const tile = tilePat('splash', ts, '#eae2d1', '#d3c8ad', { cols: 6, rows: 3, alt: '#f7f2e6', var: 0.9, seed: 8, gloss: 0.18 });
  add(sq(Sb, -R.W, R.W, 0.9, 2.55, tile));
  // under cabinet / above worktop shadow
  add(sq(Sb, -R.W, R.W, 0.9, 1.08, lin('spsh', [[0, '#0a1020', 0], [1, '#0a1020', 0]], [0, 0, 0, 1])));
  // open shelves between hood and uppers
  for (const sx of [-1, 1]) {
    for (const hv of [1.75, 2.15]) {
      add(sq(Sb, sx * 0.62 - 0.38, sx * 0.62 + 0.38, hv, hv + 0.035, C.oak), sq(Sb, sx * 0.62 - 0.38, sx * 0.62 + 0.38, hv - 0.012, hv, shade(C.oak, 0.3)));
    }
  }
  // objects on shelves (screen space)
  { const kb = cam.s(R.Zb - 0.12);
    for (const sx of [-1, 1]) {
      let [x, y] = cam.P(sx * 0.62 - 0.2, 1.785, R.Zb - 0.12); add(vase(x, y, kb, sx > 0 ? C.terra : C.teal, { h: 0.22, w: 0.1 }));
      [x, y] = cam.P(sx * 0.62 + 0.12, 1.785, R.Zb - 0.12); add(books(x, y, kb, 3, { seed: sx + 3 }));
      [x, y] = cam.P(sx * 0.62 - 0.12, 2.185, R.Zb - 0.12); add(rrect(x - 0.1 * kb, y - 0.17 * kb, 0.2 * kb, 0.17 * kb, 3, '#e9dcbd', { stroke: C.brassD, sw: 1.2 }), rrect(x - 0.11 * kb, y - 0.2 * kb, 0.22 * kb, 0.04 * kb, 2, C.brass));
      [x, y] = cam.P(sx * 0.62 + 0.15, 2.185, R.Zb - 0.12); add(rrect(x - 0.08 * kb, y - 0.14 * kb, 0.16 * kb, 0.14 * kb, 3, '#d9c8a2', { stroke: C.brassD, sw: 1.2 }), rrect(x - 0.09 * kb, y - 0.17 * kb, 0.18 * kb, 0.04 * kb, 2, C.brass));
    } }
  // base cabinets (navy handleless) + stone worktop
  add(cam.frect(-R.W, R.W, 0, 0.08, zc, '#1a2536'));
  add(sq(surfBack(cam, zc), -R.W, R.W, 0.08, 0.9, vgrad('#24415f', '#1a3150')));
  add(doorsOn(surfBack(cam, zc), -R.W, R.W, 0.08, 0.9, 11, '#24415f', { pull: 'top' }));
  // drawers center under hob
  for (let i = 0; i < 3; i++) add(sq(surfBack(cam, zc), -0.55, 0.55, 0.12 + i * 0.26, 0.12 + i * 0.26 + 0.24, '#2a4b6e', { stroke: '#122238', sw: 0.8 }), sq(surfBack(cam, zc), -0.3, 0.3, 0.12 + i * 0.26 + 0.2, 0.12 + i * 0.26 + 0.215, C.brass));
  // worktop (white marble slab w/ top visible)
  add(cam.box(-R.W, R.W, 0.9, 0.95, zc - 0.03, R.Zb, { front: '#efece4', top: '#fbfaf6', left: '#c9c5bb', right: '#efece4' }, { flat: true }));
  // hob (induction) on worktop
  { const hx0 = -0.38, hx1 = 0.38, hz0 = 5.8, hz1 = 6.1;
    add(cam.quad([[hx0, 0.952, hz0], [hx1, 0.952, hz0], [hx1, 0.952, hz1], [hx0, 0.952, hz1]], '#12151a'));
    add(cam.quad([[hx0, 0.953, hz0], [hx0 + 0.22, 0.953, hz0], [hx0 + 0.12, 0.953, hz1], [hx0, 0.953, hz1]], '#ffffff', { op: 0.06 }));
    for (const [cx, cz, rad] of [[-0.2, 5.92, 0.1], [0.2, 5.92, 0.1], [-0.2, 6.02, 0.07], [0.2, 6.02, 0.07]]) add(cam.hcircle(cx, cz, rad, 0.954, 'none', { stroke: '#8c929c', sw: 1.2, op: 0.9 }, 28));
    add(cam.hcircle(-0.2, 5.92, 0.04, 0.955, '#e65a2e', { op: 0.8 }, 20));
    // pot on hob
    const [px, py] = cam.P(0.2, 0.95, 5.92); const k = cam.s(5.92);
    add(shadowEll(px, py, 0.14 * k, 0.03 * k, 0.4, 3), rect(px - 0.13 * k, py - 0.15 * k, 0.26 * k, 0.15 * k, hgrad('#b8bcc4', '#7d828b'), { rx: 3 }), ellipse(px, py - 0.15 * k, 0.13 * k, 0.03 * k, '#c9ccd2'), rect(px + 0.13 * k, py - 0.1 * k, 0.07 * k, 0.015 * k, '#5a5f68'), rect(px - 0.2 * k, py - 0.1 * k, 0.07 * k, 0.015 * k, '#5a5f68'));
    const kk = cam.s(5.92);
    add(ellipse(px, py - 0.17 * kk, 0.1 * kk, 0.02 * kk, '#e9eef2', { op: 0.35 }));
    // steam wisps
    add(stroke_(`M${r1(px - 4)} ${r1(py - 0.2 * kk)}q-6 -14 2 -26t0 -24`, '#fff', 3, { op: 0.35, lc: 'round', filter: blur(1.6) }));
  }
  // chimney hood
  { const sbs = (c) => ({ front: c, top: lighten(c, 0.2), left: shade(c, 0.2), right: c });
    // shaft
    add(cam.box(-0.24, 0.24, 1.85, 2.7, 5.85, 6.2, { front: '#b9bdc6', top: '#d6d9df', left: '#8d929c', right: '#b9bdc6' }, { flat: true }));
    add(cam.frect(-0.24, 0.24, 1.85, 2.7, 5.85, hgrad('#dfe3e8', '#9aa0aa'), {}));
    add(cam.frect(-0.24, -0.2, 1.85, 2.7, 5.85, '#fff', { op: 0.25 }));
    // canopy
    add(cam.quad([[-0.5, 1.55, 5.6], [0.5, 1.55, 5.6], [0.5, 1.58, 5.6], [-0.5, 1.58, 5.6]], '#444'));
    add(cam.quad([[-0.5, 1.55, 5.6], [0.5, 1.55, 5.6], [0.24, 1.9, 5.86], [-0.24, 1.9, 5.86]], lin('hood', [[0, '#e6e9ee'], [0.5, '#aeb3bd'], [1, '#c9cdd4']], [0, 0, 0, 1])));
    add(cam.quad([[-0.5, 1.55, 5.6], [-0.26, 1.55, 5.6], [-0.12, 1.9, 5.86], [-0.24, 1.9, 5.86]], '#fff', { op: 0.22 }));
    add(cam.frect(-0.5, 0.5, 1.54, 1.57, 5.6, C.brass));
    // light under hood
    add(cam.quad([[-0.5, 1.5, 5.6], [0.5, 1.5, 5.6], [0.75, 0.95, 5.5], [-0.75, 0.95, 5.5]], lin('hoodlt', [[0, '#ffe2a8', 0.5], [1, '#ffe2a8', 0]], [0, 0, 0, 1]), { style: 'mix-blend-mode:screen' }));
  }
  // utensil rail
  { const y = 1.4; const a = cam.P(-0.95, y, R.Zb - 0.05), b = cam.P(0.95, y, R.Zb - 0.05); add(line(a[0], a[1], b[0], b[1], C.brass, 3, { lc: 'round' }));
    const kb = cam.s(R.Zb - 0.05);
    [-0.7, -0.45, -0.2, 0.2, 0.5, 0.75].forEach((x, i) => { const [px, py] = cam.P(x, y, R.Zb - 0.05); add(stroke_(`M${r1(px)} ${r1(py)}v5`, C.brass, 1.6)); add(i % 3 === 0 ? ellipse(px, py + 0.1 * kb, 0.045 * kb, 0.05 * kb, '#8a8f98', { stroke: '#555a62', sw: 1 }) + rect(px - 1.2, py + 5, 2.4, 0.07 * kb, '#555a62') : (i % 3 === 1 ? rect(px - 2.5, py + 5, 5, 0.17 * kb, C.woodL, { rx: 2 }) : path_(`M${r1(px - 3)} ${r1(py + 5)}h6v${r1(0.14 * kb)}h-6z`, '#9aa0aa'))); });
  }
  // upper cabinets (cream/oak) left and right
  const Su = surfBack(cam, R.Zb - 0.35);
  add(cam.box(-R.W, -1.05, 1.5, 2.55, R.Zb - 0.35, R.Zb, { front: '#b99671', top: '#d9b88f', left: '#8a6c49', right: '#b99671' }, { flat: true }));
  add(cam.box(1.05, R.W, 1.5, 2.55, R.Zb - 0.35, R.Zb, { front: '#b99671', top: '#d9b88f', left: '#8a6c49', right: '#b99671' }, { flat: true }));
  add(doorsOn(Su, -R.W, -1.05, 1.5, 2.55, 4, '#b99671', { pull: 'bottom', horizGrad: true, grain: true }));
  add(doorsOn(Su, 1.05, R.W, 1.5, 2.55, 4, '#b99671', { pull: 'bottom', horizGrad: true, grain: true }));
  // glass front door with warm interior light
  add(sq(Su, 1.5, 1.98, 1.54, 2.51, lin('glassd', [[0, '#ffe7b8'], [1, '#e6b878']], [0, 0, 0, 1]), { stroke: '#7a6a45', sw: 1.2 }));
  for (const vv of [1.9, 2.2]) add(sq(Su, 1.52, 1.96, vv, vv + 0.025, C.oak));
  add(sp(Su, [[1.5, 1.54], [1.65, 1.54], [1.78, 2.51], [1.5, 2.51]], '#fff', { op: 0.25 }));
  { const kb = cam.s(R.Zb - 0.35); for (let i = 0; i < 3; i++) { const [x, y] = cam.P(1.58 + i * 0.14, 1.9, R.Zb - 0.35); add(rrect(x - 0.045 * kb, y - 0.12 * kb, 0.09 * kb, 0.12 * kb, 2, ['#b5603c', '#e8dcc0', '#2f6f73'][i])); } }
  // under-cabinet LED
  add(ledOn(Su, -R.W, 1.5, -1.05, 1.5, '#ffe3b0', 1.4), ledOn(Su, 1.05, 1.5, R.W, 1.5, '#ffe3b0', 1.4));
  // sill herbs on counter right end
  { const [x, y] = cam.P(1.55, 0.95, 6.0); const k = cam.s(6.0); add(plantSnake(x, y, k * 0.55, { pot: '#d9c8a2', sc: 0.5 })); }
  // canisters left
  { const kk = cam.s(5.95); [[-1.9, 0.14, '#e9e0c9'], [-1.62, 0.18, '#d9c8a2'], [-1.35, 0.11, '#b5603c']].forEach(([x, h, c]) => { const [px, py] = cam.P(x, 0.95, 5.95); add(shadowEll(px, py, 0.07 * kk, 0.012 * kk, 0.3, 2), rect(px - 0.06 * kk, py - h * 2 * kk, 0.12 * kk, h * 2 * kk, hgrad(lighten(c, 0.1), shade(c, 0.2)), { rx: 2 }), rect(px - 0.065 * kk, py - h * 2 * kk - 4, 0.13 * kk, 5, C.brass, { rx: 1.5 })); }); }

  // ---- LEFT WALL: tall units (oak veneer), oven tower, fridge
  const wd = 0.62; const SL2 = surfL(cam, R.W - wd);
  add(cam.frect(-R.W, -R.W + wd, 0, 2.6, 3.4, hgrad('#7d6347', '#9a7c58')));
  add(sq(SL2, 3.4, R.Zb - 0.0, 0, 2.6, vgrad('#b99671', '#a18058')));
  // oven tower (3.4-4.45), pantry (4.45-5.2), fridge (5.2-6.2)
  add(doorsOn(SL2, 4.45, 5.25, 0.05, 2.55, 2, '#b99671', { grain: true, pull: 'side' }));
  add(sq(SL2, 3.4, 4.45, 0.05, 0.9, '#b99671', { stroke: '#7a5f3e', sw: 1 }), sq(SL2, 3.4, 4.45, 0.05 + 0, 0.9, 'none'));
  add(sq(SL2, 3.45, 4.4, 0.95, 1.65, '#171a20', { stroke: '#4a4f58', sw: 2 }));
  add(sq(SL2, 3.55, 4.3, 1.05, 1.52, lin('ovg', [[0, '#2b323d'], [1, '#12151a']], [0, 0, 1, 1])));
  add(sp(SL2, [[3.55, 1.05], [3.85, 1.05], [3.7, 1.52], [3.55, 1.52]], '#fff', { op: 0.09 }));
  add(sq(SL2, 3.5, 4.35, 1.58, 1.62, C.brass));
  add(sq(SL2, 3.45, 4.4, 1.7, 2.05, '#171a20', { stroke: '#4a4f58', sw: 2 }), sq(SL2, 3.55, 4.3, 1.76, 1.99, '#1d232c'));
  add(sq(SL2, 3.4, 4.45, 2.1, 2.55, '#b99671', { stroke: '#7a5f3e', sw: 1 }));
  add(sq(SL2, 3.4, 4.45, 0.9, 0.95, '#b99671'));
  // fridge
  add(sq(SL2, 5.3, 6.15, 0.05, 2.5, lin('frz', [[0, '#e5e8ec'], [0.5, '#bdc2ca'], [1, '#d4d8de']], [0, 0, 1, 0]), { stroke: '#7d828b', sw: 1.2 }));
  add(sq(SL2, 5.3, 6.15, 1.5, 1.52, '#7d828b'));
  add(sq(SL2, 5.37, 5.4, 1.62, 2.2, C.brass), sq(SL2, 5.37, 5.4, 0.7, 1.4, C.brass));
  add(sp(SL2, [[5.3, 0.05], [5.5, 0.05], [5.5, 2.5], [5.3, 2.5]], '#fff', { op: 0.18 }));
  add(sq(SL2, 3.4, 6.2, 2.5, 2.6, '#8a6c49'));
  add(ledOn(SL2, 3.4, 2.5, 6.2, 2.5, '#ffe3b0', 1.4));

  // ---- RIGHT WALL: window over sink + base cabinets
  add(sq(SR, 3.7, 6.2, 0.9, 2.5, 'none'));
  add(sq(SR, 3.7, 6.2, 0.95, 1.2, tilePat('splashR', ts * 0.8, '#e8e0cf', '#c9bea5', { cols: 6, rows: 2, alt: '#f6f1e4', var: 0.9, seed: 3 })));
  add(windowOn(SR, 4.2, 5.7, 1.2, 2.4, { cols: 3, tag: 'kn', t: 0.035, seed: 12, frame: '#2b2f36' }));
  add(sq(SR, 4.15, 5.75, 1.15, 1.2, C.white));
  // roller blind
  add(sq(SR, 4.2, 5.7, 2.25, 2.4, '#efe6d2'), sq(SR, 4.2, 5.7, 2.24, 2.26, C.brass));
  // base cabinets
  const SRf = surfR(cam, R.W - 0.6);
  add(cam.box(R.W - 0.6, R.W, 0.0, 0.9, 3.6, R.Zb, { front: '#24415f', top: '#fbfaf6', left: '#14263c', right: '#24415f' }, { flat: true }));
  add(sq(SRf, 3.6, R.Zb, 0.08, 0.9, hgrad('#2d4f73', '#1c3552')));
  add(doorsOn(SRf, 3.6, R.Zb, 0.08, 0.9, 5, '#24415f', { pull: 'top', horizGrad: true, flat: false }));
  add(sq(SRf, 3.6, R.Zb, 0, 0.08, '#10192a'));
  add(cam.box(R.W - 0.66, R.W, 0.9, 0.95, 3.55, R.Zb, { front: '#efece4', top: '#fbfaf6', left: '#c9c5bb', right: '#efece4' }, { flat: true }));
  // sink
  add(cam.quad([[R.W - 0.5, 0.955, 4.4], [R.W - 0.12, 0.955, 4.4], [R.W - 0.12, 0.955, 5.5], [R.W - 0.5, 0.955, 5.5]], hgrad('#aeb4bd', '#e7eaee')));
  add(cam.quad([[R.W - 0.45, 0.956, 4.5], [R.W - 0.17, 0.956, 4.5], [R.W - 0.17, 0.956, 5.4], [R.W - 0.45, 0.956, 5.4]], '#6c727c'));
  { const [x, y] = cam.P(R.W - 0.3, 0.95, 5.55); const k = cam.s(5.55);
    add(path_(`M${r1(x)} ${r1(y)}v${r1(-0.28 * k)}q0 ${r1(-0.1 * k)} ${r1(-0.1 * k)} ${r1(-0.1 * k)}h${r1(-0.1 * k)}`, 'none', { stroke: C.brass, sw: Math.max(3, k * 0.025), lc: 'round' }), circle(x, y - 0.28 * k, 3, C.brassL)); }
  // fruit bowl & board on island later

  // ---- floor reflections / light
  add(roomShade(cam, R, { ao: 0.22 }));

  // ---- runner rug
  { const rx0 = -1.35, rx1 = 1.35, rz0 = 4.3, rz1 = 5.3;
    add(shadowPoly([cam.P(rx0, 0, rz0), cam.P(rx1 + 0.04, 0, rz0), cam.P(rx1 + 0.04, 0, rz1), cam.P(rx0, 0, rz1)], 0.22, 3));
    add(rugPaint((u, v) => cam.P(rx0 + u * (rx1 - rx0), 0, rz0 + (1 - v) * (rz1 - rz0)), { field: '#8f3b30', field2: '#7d3028', border: '#1b3150', accent: '#d9c08a', motif: '#e9d9b0' }, { asp: (rz1 - rz0) / (rx1 - rx0), nU: 12, nV: 3 })); }

  // ---- ISLAND
  { const ix0 = -1.55, ix1 = 1.55, iz0 = 3.05, iz1 = 4.0;
    add(shadowPoly([cam.P(ix0, 0, iz0), cam.P(ix1 + 0.1, 0, iz0), cam.P(ix1 + 0.2, 0, iz1 + 0.1), cam.P(ix0 + 0.1, 0, iz1 + 0.1)], 0.42, 9));
    add(cam.box(ix0, ix1, 0.0, 0.9, iz0, iz1, { front: '#1d3a58', top: '#fff', left: '#14263c', right: '#2d4f73' }, { flat: true }));
    add(cam.frect(ix0, ix1, 0.0, 0.07, iz0, '#0f1b2c'));
    const Si = surfBack(cam, iz0);
    add(sq(Si, ix0, ix1, 0.07, 0.9, vgrad('#2a4a6c', '#1b3652')));
    // doors: 4 drawers pairs
    for (let i = 0; i < 6; i++) { const a = ix0 + i * 0.5167 + 0.01, b = a + 0.5167 - 0.02; add(sq(Si, a, b, 0.1, 0.5, '#2a4a6c', { stroke: '#10203a', sw: 0.8 }), sq(Si, a + 0.12, b - 0.12, 0.45, 0.47, C.brass), sq(Si, a, b, 0.52, 0.88, '#2a4a6c', { stroke: '#10203a', sw: 0.8 }), sq(Si, a + 0.12, b - 0.12, 0.83, 0.85, C.brass)); }
    // wood-panel on stool side (end panel) skipped; stone top w/ overhang
    add(cam.box(ix0 - 0.04, ix1 + 0.04, 0.9, 0.96, iz0 - 0.15, iz1 + 0.05, { front: '#efece4', top: lin('islt', [[0, '#e8e4da'], [1, '#fbfaf6']], [0, 0, 0, 1]), left: '#c9c5bb', right: '#efece4' }, { flat: true }));
    // marble veins on top
    reseed(21); for (let i = 0; i < 9; i++) { const u = rr(0, 1); const a = cam.P(ix0 + u * (ix1 - ix0), 0.961, iz0 - 0.12), b = cam.P(ix0 + (u + rr(-0.15, 0.15)) * (ix1 - ix0), 0.961, iz1 + 0.02); add(line(a[0], a[1], b[0], b[1], '#8f8e8b', rr(0.6, 1.4), { op: rr(0.12, 0.3) })); }
    add(cam.frect(ix0 - 0.04, ix1 + 0.04, 0.9, 0.915, iz0 - 0.15, C.brass));
    // top decor: fruit bowl, board, vase
    let [x, y] = cam.P(-0.6, 0.96, 3.55); let k = cam.s(3.55);
    add(shadowEll(x, y, 0.2 * k, 0.04 * k, 0.3, 3), path_(`M${r1(x - 0.22 * k)} ${r1(y - 0.1 * k)}Q${r1(x)} ${r1(y + 0.06 * k)} ${r1(x + 0.22 * k)} ${r1(y - 0.1 * k)}Z`, hgrad(C.brassL, C.brassD)), ellipse(x, y - 0.1 * k, 0.22 * k, 0.04 * k, C.brass));
    for (const [dx, dy, c] of [[-0.1, -0.13, '#c0392b'], [0.0, -0.15, '#e0a030'], [0.1, -0.13, '#7aa04a'], [-0.04, -0.2, '#d9552e'], [0.06, -0.19, '#c0392b']]) add(circle(x + dx * k, y + dy * k, 0.065 * k, soft(c, 0.2, 0.2)), circle(x + dx * k - 3, y + dy * k - 4, 0.014 * k, '#fff', { op: 0.35 }));
    [x, y] = cam.P(0.5, 0.96, 3.6); add(rrect(x - 0.22 * k, y - 0.03 * k, 0.44 * k, 0.03 * k, 3, C.woodL), rrect(x - 0.22 * k, y - 0.03 * k, 0.44 * k, 0.012 * k, 2, lighten(C.woodL, 0.2)));
    add(circle(x - 0.08 * k, y - 0.07 * k, 0.045 * k, '#a8c46a'), circle(x + 0.05 * k, y - 0.07 * k, 0.04 * k, '#e0b040'));
    [x, y] = cam.P(1.2, 0.96, 3.5); add(vase(x, y, k, C.navy2, { h: 0.34, w: 0.14, branch: true, bloom: '#f4e9d2' }));
  }
  // ---- stools
  for (const x of [-0.95, 0, 0.95]) add(stool(cam, x, 2.75));
  // ---- pendants
  for (const x of [-0.95, 0, 0.95]) { const [px, py] = cam.P(x, 2.7, 3.55); const k = cam.s(3.55); add(pendantDome(px, py, k, 0.8, 0.17, C.brass)); }
  add(downlights(cam, [[-1.9, 2.3], [1.9, 2.3], [-1.9, 4.2], [1.9, 4.2], [0, 5.4]], 2.52));
  add(finishLayer({ vig: 0.34, glow: '#ffe0a8', glowOp: 0.12, gx: 0.5, gy: 0.35 }));
  finish('interior-kitchen.svg', 'Modern kitchen', 'A modern handleless kitchen with navy base cabinets, marble island with bar stools, hob and chimney hood, tiled backsplash, brass pendant lights and a bright window.', [1.12, 600, 600, -44]);
}

// large-format tile wall on any surface (grid lines + soft veining)
function bigTiles(Sf, u0, u1, v0, v1, du, dv, base, grout, o = {}) {
  let s = sq(Sf, u0, u1, v0, v1, o.fill || vgrad(lighten(base, 0.05), shade(base, 0.05)));
  reseed(o.seed ?? 4);
  const nu = Math.round((u1 - u0) / du), nv = Math.round((v1 - v0) / dv);
  for (let j = 0; j < nv; j++) for (let i = 0; i < nu; i++) {
    const a = u0 + i * du, b = a + du, c = v0 + j * dv, d = c + dv;
    const t = rnd();
    s += sq(Sf, a, b, c, d, t > 0.5 ? '#fff' : shade(base, 0.3), { op: (o.var ?? 0.07) * (0.4 + t) });
    // veins
    if (o.veins) { const pts = [[a + du * rr(0.1, 0.9), c], [a + du * rr(0, 1), c + dv * 0.35], [a + du * rr(0, 1), c + dv * 0.7], [a + du * rr(0.1, 0.9), d]].map((p) => Sf.map(p[0], p[1])); s += stroke_(`M${r1(pts[0][0])} ${r1(pts[0][1])}C${r1(pts[1][0])} ${r1(pts[1][1])} ${r1(pts[2][0])} ${r1(pts[2][1])} ${r1(pts[3][0])} ${r1(pts[3][1])}`, o.vein || shade(base, 0.35), rr(0.6, 1.5), { op: rr(0.1, 0.25) }); }
  }
  for (let i = 0; i <= nu; i++) s += sl(Sf, u0 + i * du, v0, u0 + i * du, v1, grout, o.gw ?? 1.2, { op: 0.8 });
  for (let j = 0; j <= nv; j++) s += sl(Sf, u0, v0 + j * dv, u1, v0 + j * dv, grout, o.gw ?? 1.2, { op: 0.8 });
  return s;
}
function brassTap(x, y, k, o = {}) { // wall/deck mounted basin tap (front view)
  const w = Math.max(2.4, k * 0.022);
  return stroke_(`M${r1(x)} ${r1(y)}v${r1(-0.2 * k)}q0 ${r1(-0.07 * k)} ${r1(0.06 * k)} ${r1(-0.07 * k)}h${r1(0.07 * k)}v${r1(0.04 * k)}`, 'none', 1) +
    stroke_(`M${r1(x)} ${r1(y)}v${r1(-0.2 * k)}q0 ${r1(-0.07 * k)} ${r1(0.06 * k)} ${r1(-0.07 * k)}h${r1(0.07 * k)}v${r1(0.04 * k)}`, C.brass, w, { lc: 'round', lj: 'round' }) +
    stroke_(`M${r1(x)} ${r1(y)}v${r1(-0.2 * k)}`, C.brassL, w * 0.35, { lc: 'round', op: 0.7 }) +
    circle(x, y - 0.12 * k, w * 1.3, C.brassD) + (o.lever !== false ? rect(x - 0.07 * k, y - 0.17 * k, 0.04 * k, w * 0.9, C.brass, { rx: 1 }) : '');
}

// =============================================================================
// 4. BATHROOM
// =============================================================================
function bathroom() {
  begin('ibt');
  const cam = new Cam(800, 600, 490, 1.45);
  const R = { W: 2.1, H: 2.6, Zb: 5.0, Zn: 1.0, wall: '#d9cfbf' };
  R.wallB = '#d8cdbb'; R.floor = vgrad('#a8a090', '#c9c1b2');
  const Sb = surfBack(cam, R.Zb), SL = surfL(cam, R.W), SR = surfR(cam, R.W);
  add(roomShell(cam, R));
  // floor tiles (large format) + sheen
  add(floorGrid(cam, R, 0.6, '#837b6b', 1.1, 0.45));
  add(floorVeins(cam, R, 0.6, 22, '#7d7566'));
  add(floorSheen(cam, R, 0.45));
  add(cam.quad([[-R.W, R.H, 1], [R.W, R.H, 1], [R.W, R.H, R.Zb], [-R.W, R.H, R.Zb]], 'none'));

  // ---- back wall: warm stone tile
  add(bigTiles(Sb, -R.W, R.W, 0, R.H, 0.6, 1.3, '#d6cab5', '#b3a78f', { seed: 5, veins: true, var: 0.09, fill: vgrad('#e1d7c4', '#cfc3ad') }));
  // shower wet-wall (left) in sage zellige
  const sg = tilePat('szel', 0.1 * cam.s(R.Zb), '#6f8a79', '#4d6557', { cols: 6, rows: 3, alt: '#8ba597', var: 0.9, seed: 10, gloss: 0.22 });
  add(sq(Sb, -R.W, -1.15, 0, R.H, sg));
  // niche in shower wall
  add(sq(Sb, -1.85, -1.4, 0.95, 1.55, '#3b4a43'), sq(Sb, -1.83, -1.42, 0.97, 1.53, lin('nich', [[0, '#d5cbb7'], [1, '#b6ab94']], [0, 0, 1, 1])));
  add(sq(Sb, -1.83, -1.42, 1.25, 1.27, C.brass));
  add(ledOn(Sb, -1.83, 1.53, -1.42, 1.53, '#ffe3b0', 1.4));
  { const kb = cam.s(R.Zb); let [x, y] = cam.P(-1.7, 1.26, R.Zb); add(rrect(x - 0.025 * kb, y - 0.15 * kb, 0.05 * kb, 0.15 * kb, 3, '#e9dcbd'), rrect(x - 0.02 * kb, y - 0.18 * kb, 0.04 * kb, 0.03 * kb, 1.5, C.brass));
    [x, y] = cam.P(-1.55, 1.26, R.Zb); add(rrect(x - 0.025 * kb, y - 0.12 * kb, 0.05 * kb, 0.12 * kb, 3, '#b5603c'));
    [x, y] = cam.P(-1.7, 0.98, R.Zb); add(rrect(x - 0.06 * kb, y - 0.05 * kb, 0.12 * kb, 0.05 * kb, 2, '#efe8d8'), rrect(x - 0.06 * kb, y - 0.1 * kb, 0.12 * kb, 0.05 * kb, 2, '#d9c8a2')); }
  add(sq(Sb, -1.15, -1.12, 0, R.H, shade('#6f8a79', 0.3)));

  // ---- right wall: tile + clerestory window + towel rail
  add(bigTiles(SR, 2.4, 5.0, 0, R.H, 0.6, 1.3, '#d6cab5', '#b3a78f', { seed: 8, veins: true, var: 0.09, fill: vgrad('#d9cebb', '#c7baa2') }));
  add(windowOn(SR, 3.1, 4.5, 1.75, 2.35, { cols: 3, tag: 'bt', seed: 5, t: 0.03, frame: '#2b2f36', sky: [[0, '#cfe6f0'], [1, '#f6efdc']] }));
  // frosted
  add(sq(SR, 3.1, 4.5, 1.75, 2.35, '#fff', { op: 0.35 }));
  // towel rail (brass ladder)
  const rails = [3.35, 3.95];
  for (const u of rails) add(sq(SR, u - 0.015, u + 0.015, 0.65, 1.65, C.brass));
  for (const v of [0.78, 0.98, 1.18, 1.38, 1.58]) add(sq(SR, rails[0], rails[1], v - 0.012, v + 0.012, C.brass), sl(SR, rails[0], v + 0.008, rails[1], v + 0.008, C.brassL, 1, { op: 0.7 }));
  // towels draped over rail
  const towel = (v, h, col) => sp(SR, [[rails[0] + 0.05, v + 0.03], [rails[1] - 0.05, v + 0.03], [rails[1] - 0.05, v - h], [rails[0] + 0.05, v - h]], col, { stroke: shade(col, 0.2), sw: 1 });
  add(towel(1.38, 0.38, '#f4efe6'), sq(SR, rails[0] + 0.05, rails[1] - 0.05, 1.2, 1.215, '#c9a24b'));
  add(towel(0.98, 0.36, '#b5603c'), sq(SR, rails[0] + 0.05, rails[1] - 0.05, 0.82, 0.835, '#e8cc84'));
  // wall shelf
  add(roomShade(cam, R, { ao: 0.22 }));
  // under-ceiling LED
  add(ceilingTray(cam, R, 0.35, 0.12));

  // ---- SHOWER ENCLOSURE (left)
  const gx = -1.15; const SG = surfL(cam, -gx); // surface at X=gx (use surfL with W=-gx)
  // interior left wall tiles (sage) inside enclosure
  add(sq(SL, 3.0, R.Zb, 0, R.H, tilePat('szel2', 0.1 * cam.s(4), '#6f8a79', '#4d6557', { cols: 6, rows: 3, alt: '#8ba597', var: 0.9, seed: 4, gloss: 0.22 })));
  add(sq(SL, 3.0, R.Zb, 0, R.H, lin('shs', [[0, '#0a1020', 0.0], [1, '#0a1020', 0.35]], [0, 0, 1, 0])));
  // shower floor tray
  add(cam.quad([[-R.W, 0.01, 3.0], [gx, 0.01, 3.0], [gx, 0.01, R.Zb], [-R.W, 0.01, R.Zb]], '#bdb6a6', { op: 0.9 }));
  for (let i = 1; i < 6; i++) { const a = cam.P(-R.W + (i * (R.W + gx)) / 6 * -1 * -1, 0.012, 3.0); }
  // rain shower: arm from the wall + head
  { const [wx, wy] = cam.P(-R.W, 2.28, 4.2); const [hx, hy] = cam.P(-1.55, 2.18, 4.2); const k = cam.s(4.2);
    add(line(wx, wy, hx, hy - 4, C.brass, Math.max(3, k * 0.025), { lc: 'round' }));
    // water streaks
    reseed(14);
    for (let i = 0; i < 36; i++) { const px = hx + rr(-0.22, 0.22) * k, py0 = hy + rr(0, 0.05) * k; const [, fy] = cam.P(-1.55, 0, 4.2); add(line(px, py0, px + rr(-3, 3), fy - rr(0, 0.15) * k, '#e6f4fa', rr(0.8, 1.6), { op: rr(0.25, 0.6) })); }
    add(ellipse(hx, hy, 0.24 * k, 0.045 * k, lin('rsh', [[0, C.brassL], [1, C.brassD]], [0, 0, 1, 0]), { stroke: C.brassD, sw: 1 }));
    add(ellipse(hx, hy + 2, 0.2 * k, 0.03 * k, '#6a5a2a', { op: 0.7 }));
    for (let i = -4; i <= 4; i++) add(circle(hx + i * 0.04 * k, hy + 3, 1.2, '#2b2f36', { op: 0.7 }));
    // mist
    add(ellipse(hx, hy + 0.5 * k, 0.4 * k, 0.55 * k, radial('mist', [[0, '#fff', 0.35], [1, '#fff', 0]]), { style: 'mix-blend-mode:screen' }));
  }
  // glass panels: side (front end at Z=3) and long panel (X=gx)
  const glassG = lin('glassb', [[0, '#d6ecf3', 0.25], [0.5, '#bcdbe6', 0.12], [1, '#e3f3f8', 0.3]], [0, 0, 1, 1]);
  add(cam.quad([[-R.W, 0, 3.0], [gx, 0, 3.0], [gx, 2.3, 3.0], [-R.W, 2.3, 3.0]], glassG));
  add(sq(SG, 3.0, R.Zb, 0, 2.3, glassG));
  add(sp(SG, [[3.1, 0], [3.5, 0], [3.9, 2.3], [3.5, 2.3]], '#fff', { op: 0.16 }));
  add(sp(SG, [[4.1, 0], [4.25, 0], [4.65, 2.3], [4.5, 2.3]], '#fff', { op: 0.12 }));
  // frame (black/brass slim)
  const fr = '#23272e';
  add(cam.frect(-R.W, gx, 2.28, 2.32, 3.0, fr), cam.frect(gx - 0.02, gx + 0.02, 0, 2.32, 3.0, fr), cam.frect(-R.W, gx, 0, 0.03, 3.0, '#3a3f48'));
  add(sq(SG, 3.0, R.Zb, 2.28, 2.32, fr), sq(SG, 3.0, 3.04, 0, 2.32, fr), sq(SG, 3.0, R.Zb, 0, 0.04, '#3a3f48'));
  add(sq(SG, 4.0, 4.03, 0, 2.3, fr)); // door seam
  // door handle
  add(sq(SG, 4.1, 4.13, 0.95, 1.35, C.brass));
  add(sq(SG, 3.2, 3.22, 0, 2.3, fr, { op: 0.0 }));
  // shower floor drain line
  // ---- VANITY (floating, walnut) with vessel basin and round backlit mirror
  const vx0 = -0.85, vx1 = 0.85, vz0 = 4.45, vz1 = R.Zb;
  // mirror backlight
  { const [mx, my] = cam.P(0, 1.65, R.Zb); const kb = cam.s(R.Zb); const rad = 0.5 * kb;
    add(circle(mx, my, rad * 1.35, radial('mglow', [[0.6, '#ffe6b5', 0.75], [1, '#ffe6b5', 0]]), { style: 'mix-blend-mode:screen' }));
    add(circle(mx, my, rad * 1.07, '#fff3d6', { filter: blur(3), op: 0.9 }));
    add(circle(mx, my, rad * 1.025, C.brass));
    add(circle(mx, my, rad * 0.99, shade(C.brassD, 0.2)));
    const mid = lin('mirg', [[0, '#e5eff2'], [0.5, '#b8cdd4'], [1, '#d8e6ea']], [0, 0, 1, 1]);
    add(circle(mx, my, rad * 0.95, mid));
    // reflection: window/plant hints
    add(g(circle(mx, my, rad * 0.95, '#000'), { clip: 'none', op: 0 }));
    const cid = clipDef('mircl', circle(mx, my, rad * 0.95, '#000'));
    add(g(rect(mx - rad * 0.9, my + rad * 0.2, rad * 1.8, rad * 0.9, '#d9cdb6', { op: 0.55 }) + ellipse(mx + rad * 0.4, my + rad * 0.35, rad * 0.22, rad * 0.5, C.leaf, { op: 0.35 }) + poly([[mx - rad * 0.8, my - rad * 0.9], [mx - rad * 0.3, my - rad * 0.9], [mx - rad * 0.05, my + rad * 0.9], [mx - rad * 0.55, my + rad * 0.9]], '#fff', { op: 0.35 }), { clip: cid }));
  }
  // vanity cabinet
  add(shadowPoly([cam.P(vx0, 0, vz0 + 0.1), cam.P(vx1, 0, vz0 + 0.1), cam.P(vx1 + 0.1, 0, R.Zb), cam.P(vx0 - 0.1, 0, R.Zb)], 0.2, 8));
  add(cam.quad([[vx0 - 0.1, 0.02, vz0], [vx1 + 0.1, 0.02, vz0], [vx1 + 0.1, 0.0, vz1], [vx0 - 0.1, 0.0, vz1]], lin('vgl', [[0, '#ffd9a0', 0.8], [1, '#ffd9a0', 0.2]], [0, 0, 0, 1]), { style: 'mix-blend-mode:screen', filter: blur(6) }));
  add(cam.box(vx0, vx1, 0.22, 0.82, vz0, vz1, { front: C.walnut, top: '#f4f1ea', left: shade(C.walnut, 0.2), right: C.walnut }, { flat: true }));
  { const Sv = surfBack(cam, vz0);
    add(sq(Sv, vx0, vx1, 0.22, 0.82, hgrad('#7a4e2f', '#5e3a22')));
    for (let j = 0; j < 12; j++) add(sl(Sv, vx0 + 0.04 + j * 0.14, 0.24, vx0 + 0.04 + j * 0.14, 0.8, lighten(C.walnut, 0.25), 1, { op: 0.2 }));
    add(sq(Sv, vx0 + 0.04, 0, 0.0, 0.0, 'none'));
    add(sq(Sv, vx0 + 0.03, vx0 + 0.83, 0.26, 0.5, 'none', { stroke: shade(C.walnut, 0.4), sw: 1.2 }));
    add(sq(Sv, vx0 + 0.87, vx1 - 0.03, 0.26, 0.5, 'none', { stroke: shade(C.walnut, 0.4), sw: 1.2 }));
    add(sq(Sv, vx0 + 0.03, vx1 - 0.03, 0.54, 0.78, 'none', { stroke: shade(C.walnut, 0.4), sw: 1.2 }));
    add(sq(Sv, -0.25, 0.25, 0.745, 0.76, C.brass), sq(Sv, -0.25, 0.25, 0.465, 0.48, C.brass)); }
  // countertop slab
  add(cam.box(vx0 - 0.05, vx1 + 0.05, 0.82, 0.88, vz0 - 0.03, vz1, { front: '#f4f1ea', top: '#fbfaf6', left: '#c9c5bb', right: '#e9e6de' }, { flat: true }));
  // vessel basin
  { const [bx, by] = cam.P(0, 0.88, 4.85); const k = cam.s(4.85);
    add(shadowEll(bx, by, 0.28 * k, 0.05 * k, 0.28, 3));
    add(path_(`M${r1(bx - 0.26 * k)} ${r1(by - 0.12 * k)}Q${r1(bx - 0.25 * k)} ${r1(by)} ${r1(bx)} ${r1(by + 0.0)}Q${r1(bx + 0.25 * k)} ${r1(by)} ${r1(bx + 0.26 * k)} ${r1(by - 0.12 * k)}Z`, hgrad('#cfc9bd', '#f8f6f0')));
    add(ellipse(bx, by - 0.12 * k, 0.26 * k, 0.06 * k, '#f8f6f0'), ellipse(bx, by - 0.115 * k, 0.22 * k, 0.045 * k, '#bdb7ab'));
    add(brassTap(bx, by - 0.01 * k - 0.07 * k, k * 1.05));
    // accessories
    let [x, y] = cam.P(-0.55, 0.88, 4.95); add(rrect(x - 0.03 * k, y - 0.13 * k, 0.06 * k, 0.13 * k, 3, '#efe8d8'), rect(x - 0.012 * k, y - 0.17 * k, 0.024 * k, 0.04 * k, C.brass));
    [x, y] = cam.P(0.55, 0.88, 4.95); add(vase(x, y, k * 1.1, '#d9cdb2', { h: 0.2, w: 0.1, branch: true, bloom: C.leaf, seed: 9 }));
    [x, y] = cam.P(0.4, 0.88, 4.8); add(rrect(x - 0.1 * k, y - 0.03 * k, 0.2 * k, 0.03 * k, 2, '#efe6d2'), rrect(x - 0.1 * k, y - 0.06 * k, 0.2 * k, 0.03 * k, 2, '#c9a24b'));
  }
  // ---- plant in corner right, bath mat, basket
  { const [x, y] = cam.P(1.65, 0, 4.7); add(plantFiddle(x, y, cam.s(4.7) * 1.15, { h: 1.35, n: 12, seed: 8, pot: C.sand2 })); }
  { const mx0 = -0.65, mx1 = 0.65, mz0 = 3.45, mz1 = 4.2; add(shadowPoly([cam.P(mx0, 0, mz0), cam.P(mx1 + 0.03, 0, mz0), cam.P(mx1 + 0.03, 0, mz1), cam.P(mx0, 0, mz1)], 0.25, 3));
    add(cam.fq(mx0, mx1, mz0, mz1, '#e6dcc5'));
    for (let i = 0; i < 9; i++) { const x = mx0 + (mx1 - mx0) * (i + 0.5) / 9; const a = cam.P(x, 0, mz0 + 0.03), b = cam.P(x, 0, mz1 - 0.03); add(line(a[0], a[1], b[0], b[1], i % 2 ? '#c9a24b' : '#27496d', 3, { op: 0.8 })); }
    add(cam.fq(mx0, mx1, mz0, mz0 + 0.03, '#b6a888')); }
  { const [x, y] = cam.P(1.05, 0, 3.5); const k = cam.s(3.5);
    add(shadowEll(x, y, 0.22 * k, 0.04 * k, 0.35, 5));
    add(path_(`M${r1(x - 0.2 * k)} ${r1(y - 0.34 * k)}L${r1(x + 0.2 * k)} ${r1(y - 0.34 * k)}L${r1(x + 0.17 * k)} ${r1(y)}Q${r1(x)} ${r1(y + 0.04 * k)} ${r1(x - 0.17 * k)} ${r1(y)}Z`, hgrad('#b49a6c', '#8a7248')));
    for (let i = 1; i < 6; i++) add(line(x - 0.2 * k, y - 0.34 * k + i * 0.057 * k, x + 0.2 * k, y - 0.34 * k + i * 0.057 * k, '#6b5834', 1, { op: 0.5 }));
    add(rrect(x - 0.18 * k, y - 0.44 * k, 0.36 * k, 0.12 * k, 4, '#f4efe6', { stroke: '#cfc4aa', sw: 1 }), rrect(x - 0.16 * k, y - 0.5 * k, 0.32 * k, 0.1 * k, 4, '#b5603c'), rrect(x - 0.15 * k, y - 0.54 * k, 0.3 * k, 0.07 * k, 3, '#e8dcc0')); }
  add(downlights(cam, [[-1.4, 2.5], [0, 2.5], [1.4, 2.5], [-0.6, 4.1], [0.6, 4.1]], 2.48));
  add(finishLayer({ vig: 0.34, glow: '#ffe0a8', glowOp: 0.12, gx: 0.5, gy: 0.35 }));
  finish('interior-bathroom.svg', 'Modern bathroom', 'A modern bathroom with a floating walnut vanity, round backlit mirror, large-format stone tiles, a glass shower enclosure with rain shower, brass towel rail and a plant.', [1.1, 600, 620, -36]);
}

// crockery on a shelf (back-wall fronto-parallel surface only)
function shelfItems(Sf, u0, u1, v, seed = 1, o = {}) {
  reseed(seed); let s = ''; let u = u0 + 0.04;
  const px = (m) => Math.abs(Sf.map(m, 0)[0] - Sf.map(0, 0)[0]); // metres->px
  const pm = px(1);
  const cols = [C.white, '#e9dfc6', C.navy3, C.terra, C.teal, C.brassL, '#d9c8a2'];
  while (u < u1 - 0.12) {
    const kind = Math.floor(rnd() * 5); const c = cols[Math.floor(rnd() * cols.length)];
    const [x, y] = Sf.map(u, v);
    if (kind === 0) { // plate stack standing
      const w = rr(0.16, 0.2) * pm, n = 3 + Math.floor(rnd() * 3);
      for (let i = 0; i < n; i++) s += rrect(x, y - (i + 1) * 0.014 * pm, w, 0.012 * pm, 1, i % 2 ? '#fff' : c, { stroke: C.brassD, sw: 0.5 });
      u += w / pm + 0.05;
    } else if (kind === 1) { // bowl
      const w = rr(0.1, 0.15) * pm; s += path_(`M${r1(x)} ${r1(y - w * 0.5)}h${r1(w)}q0 ${r1(w * 0.55)} ${r1(-w / 2)} ${r1(w * 0.55)}t${r1(-w / 2)} ${r1(-w * 0.55)}z`, hgrad(lighten(c, 0.3), shade(c, 0.1))) + rect(x, y - w * 0.52, w, 2, C.brass); s += rect(x + w * 0.35, y - 1.5, w * 0.3, 1.5, shade(c, 0.2)); u += w / pm + 0.04;
    } else if (kind === 2) { // vase
      const h = rr(0.2, 0.3) * pm, w = rr(0.07, 0.1) * pm; s += path_(`M${r1(x + w * 0.3)} ${r1(y - h)}h${r1(w * 0.4)}q${r1(w * 0.5)} ${r1(h * 0.3)} ${r1(w * 0.25)} ${r1(h * 0.55)}q${r1(-w * 0.1)} ${r1(h * 0.15)} ${r1(-w * 0.35)} ${r1(h * 0.15)}h${r1(-w * 0.6)}q${r1(-w * 0.25)} 0 ${r1(-w * 0.35)} ${r1(-h * 0.15)}q${r1(-w * 0.25)} ${r1(-h * 0.25)} ${r1(w * 0.25)} ${r1(-h * 0.55)}z`, hgrad(lighten(c, 0.15), shade(c, 0.25))); s += rect(x + w * 0.3, y - h, w * 0.4, 1.5, C.brass); u += w / pm + 0.06;
    } else if (kind === 3) { // cups row
      const n = 3; for (let i = 0; i < n; i++) { const w = 0.05 * pm; s += path_(`M${r1(x + i * 0.065 * pm)} ${r1(y - 0.05 * pm)}h${r1(w)}l${r1(-w * 0.15)} ${r1(0.05 * pm)}h${r1(-w * 0.7)}z`, '#fbf8f0', { stroke: C.brassD, sw: 0.5 }); }
      u += 0.065 * n + 0.04;
    } else { // teapot
      const w = 0.13 * pm; s += ellipse(x + w * 0.5, y - w * 0.4, w * 0.5, w * 0.38, hgrad(lighten(c, 0.2), shade(c, 0.2))); s += path_(`M${r1(x + w * 0.9)} ${r1(y - w * 0.4)}q${r1(w * 0.3)} ${r1(-w * 0.2)} ${r1(w * 0.35)} ${r1(-w * 0.5)}l${r1(-w * 0.1)} ${r1(w * 0.0)}q0 ${r1(w * 0.25)} ${r1(-w * 0.25)} ${r1(w * 0.45)}z`, shade(c, 0.1)); s += rect(x + w * 0.38, y - w * 0.85, w * 0.24, w * 0.09, C.brass, { rx: 1 }); s += stroke_(`M${r1(x)} ${r1(y - w * 0.5)}q${r1(-w * 0.3)} ${r1(w * 0.1)} 0 ${r1(w * 0.3)}`, C.brassD, 1.4); u += w / pm + 0.05;
    }
  }
  return s;
}
// statement ring chandelier (screen space)
function ringChandelier(x, y0, k, o = {}) {
  const col = C.brass, rad = (o.r ?? 0.7) * k, n = o.n ?? 12; const drop = (o.drop ?? 0.55) * k; const ry = rad * 0.2;
  const cy = y0 + drop;
  let s = '';
  s += ellipse(x, cy + 0.15 * k, rad * 1.9, rad * 0.9, radial('rcg' + hkey(String(x)), [[0, '#ffe2a8', 0.55], [1, '#ffe2a8', 0]]), { style: 'mix-blend-mode:screen' });
  // rods
  for (const a of [-0.7, 0, 0.7]) s += line(x, y0, x + a * rad * 0.9, cy, col, Math.max(1.4, k * 0.007), { op: 0.9 });
  s += rect(x - 0.015 * k, y0 - 0.04 * k, 0.03 * k, 0.1 * k, col);
  s += ellipse(x, y0, 0.08 * k, 0.025 * k, darken(col, 0.25));
  // back half of ring then bulbs then front half
  const ringW = Math.max(2.2, k * 0.014);
  s += path_(`M${r1(x - rad)} ${r1(cy)}A${r1(rad)} ${r1(ry)} 0 0 1 ${r1(x + rad)} ${r1(cy)}`, 'none', { stroke: darken(col, 0.2), sw: ringW });
  const bulbs = [];
  for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2; bulbs.push([x + Math.cos(a) * rad, cy + Math.sin(a) * ry, Math.sin(a)]); }
  bulbs.sort((a, b) => a[2] - b[2]);
  for (const [bx, by, d] of bulbs) {
    if (d >= 0) continue;
    s += circle(bx, by - 0.02 * k, 0.07 * k, radial('bgl' + Math.round(bx), [[0, '#fff4d0', 0.7], [1, '#ffd890', 0]]), { style: 'mix-blend-mode:screen' });
    s += circle(bx, by - 0.02 * k, 0.03 * k, '#fff6dd');
    s += rect(bx - 0.008 * k, by - 0.0 * k, 0.016 * k, 0.03 * k, col);
  }
  s += path_(`M${r1(x - rad)} ${r1(cy)}A${r1(rad)} ${r1(ry)} 0 0 0 ${r1(x + rad)} ${r1(cy)}`, 'none', { stroke: brassGrad(), sw: ringW * 1.15 });
  s += path_(`M${r1(x - rad * 0.55)} ${r1(cy + 0.02 * k)}A${r1(rad * 0.55)} ${r1(ry * 0.55)} 0 0 0 ${r1(x + rad * 0.55)} ${r1(cy + 0.02 * k)}`, 'none', { stroke: brassGrad(), sw: ringW * 0.8 });
  for (const [bx, by, d] of bulbs) {
    if (d < 0) continue;
    s += circle(bx, by - 0.02 * k, 0.075 * k, radial('bgl2' + Math.round(bx), [[0, '#fff4d0', 0.8], [1, '#ffd890', 0]]), { style: 'mix-blend-mode:screen' });
    s += circle(bx, by - 0.02 * k, 0.032 * k, '#fff6dd', { stroke: '#f1d89a', sw: 1 });
    s += rect(bx - 0.008 * k, by + 0.01 * k, 0.016 * k, 0.03 * k, col);
  }
  // hanging crystals
  for (let i = 0; i < 10; i++) { const a = (i / 10) * Math.PI * 2 + 0.2; const bx = x + Math.cos(a) * rad * 0.55, by = cy + 0.02 * k + Math.sin(a) * ry * 0.55; if (Math.sin(a) > -0.3) s += line(bx, by, bx, by + 0.12 * k, '#e8d9b0', 0.8, { op: 0.7 }) + path_(`M${r1(bx)} ${r1(by + 0.1 * k)}l${r1(0.014 * k)} ${r1(0.025 * k)}l${r1(-0.014 * k)} ${r1(0.03 * k)}l${r1(-0.014 * k)} ${r1(-0.03 * k)}z`, '#fff', { op: 0.85 }); }
  return s;
}
// dining chair (side view) facing +x (dir=1: back at x0) or -x
function sideChair(cam, xc, zc, dir, col = '#cdbb94', frame = C.walnut) {
  const hw = 0.23; const x0 = dir > 0 ? xc - 0.23 : xc - 0.23, x1 = xc + 0.23; // seat extent along x (depth)
  const z0 = zc - hw, z1 = zc + hw;
  const C_ = (c) => ({ front: c, top: lighten(c, 0.14), left: shade(c, 0.24), right: lighten(c, 0.05) });
  let s = shadowPoly([cam.P(x0 - 0.02, 0, z0 + 0.03), cam.P(x1 + 0.05, 0, z0 + 0.03), cam.P(x1 + 0.05, 0, z1), cam.P(x0 - 0.02, 0, z1)], 0.3, 5);
  const lw = 0.03;
  const legs = [[x0 + 0.02, z0 + 0.02], [x1 - 0.05, z0 + 0.02], [x0 + 0.02, z1 - 0.05], [x1 - 0.05, z1 - 0.05]];
  // far legs first (larger z)
  legs.sort((a, b) => b[1] - a[1]);
  for (const [lx, lz] of legs) s += cam.box(lx, lx + lw, 0, 0.45, lz, lz + lw, C_(frame), { flat: true });
  const bx0 = dir > 0 ? x0 : x1 - 0.06, bx1 = dir > 0 ? x0 + 0.06 : x1;
  // back rest (behind seat)
  s += cam.box(bx0, bx1, 0.45, 1.0, z0 + 0.01, z1 - 0.01, C_(shade(col, 0.1)), { rx: 0.03 });
  s += cam.box(bx0 + (dir > 0 ? -0.0 : 0.0), bx1, 0.5, 0.92, z0 + 0.04, z1 - 0.04, C_(lighten(col, 0.04)), { rx: 0.03 });
  // seat
  s += cam.box(x0, x1, 0.4, 0.5, z0, z1, C_(col), { rx: 0.03 });
  // brass cap on the legs
  return s;
}
function frontChair(cam, xc, zc, facing, col = '#cdbb94', frame = C.walnut) {
  // facing = -1: faces camera; +1 faces away (seen from behind)
  const hw = 0.23; const C_ = (c) => ({ front: c, top: lighten(c, 0.14), left: shade(c, 0.24), right: lighten(c, 0.05) });
  const z0 = zc - hw, z1 = zc + hw; const x0 = xc - hw, x1 = xc + hw;
  let s = shadowEll(...cam.P(xc, 0, zc), 0.34 * cam.s(zc), 0.06 * cam.s(zc), 0.3, 5);
  const lw = 0.03;
  const bz0 = facing < 0 ? z1 - 0.06 : z0, bz1 = facing < 0 ? z1 : z0 + 0.06;
  const legs = [[x0 + 0.02, z1 - 0.05], [x1 - 0.05, z1 - 0.05], [x0 + 0.02, z0 + 0.02], [x1 - 0.05, z0 + 0.02]];
  for (const [lx, lz] of legs) s += cam.box(lx, lx + lw, 0, 0.45, lz, lz + lw, C_(frame), { flat: true });
  if (facing < 0) {
    s += cam.box(x0, x1, 0.45, 1.0, bz0, bz1, C_(shade(col, 0.1)), { rx: 0.03 });
    s += cam.box(x0, x1, 0.4, 0.5, z0, z1, C_(col), { rx: 0.03 });
    const a = cam.P(xc, 0.58, z0), k = cam.s(z0);
  } else {
    s += cam.box(x0, x1, 0.4, 0.5, z0, z1, C_(col), { rx: 0.03 });
    s += cam.box(x0, x1, 0.45, 1.0, bz0, bz1, C_(shade(col, 0.05)), { rx: 0.03 });
    // channel stitching on the back
    for (let i = 1; i < 4; i++) { const x = x0 + ((x1 - x0) * i) / 4; const a = cam.P(x, 0.55, bz0), b = cam.P(x, 0.95, bz0); s += line(a[0], a[1], b[0], b[1], shade(col, 0.28), 1, { op: 0.6 }); }
  }
  return s;
}

// =============================================================================
// 5. DINING ROOM
// =============================================================================
function dining() {
  begin('idn');
  const cam = new Cam(840, 600, 452, 1.85);
  const R = { W: 3.0, H: 2.8, Zb: 6.2, Zn: 1.0, wall: vgrad('#c9a47e', '#b98e66') };
  R.wallB = vgrad('#cfaa84', '#bd946c'); R.floor = vgrad('#cdb895', '#e8dcc3');
  const Sb = surfBack(cam, R.Zb), SL = surfL(cam, R.W), SR = surfR(cam, R.W);
  add(roomShell(cam, R));
  add(floorGrid(cam, R, 1.0, '#9a8765', 1.2, 0.35));
  add(floorVeins(cam, R, 1.0, 22, '#8c7a58'));
  add(floorSheen(cam, R, 0.45));
  add(ceilingTray(cam, R, 0.6, 0.18, '#ffc882'));

  // ---- back wall: vertical fluted wainscot + upper plaster
  add(sq(Sb, -R.W, R.W, 0, 0.95, vgrad('#e8dcc4', '#d9c9a8')));
  for (let i = 0; i < 70; i++) { const u = -R.W + i * (2 * R.W / 70); add(sl(Sb, u, 0, u, 0.95, shade('#d9c9a8', 0.2), 1, { op: 0.28 })); }
  add(sq(Sb, -R.W, R.W, 0.95, 0.985, C.brass));
  // arched niche (centre)
  { const u0 = -0.75, u1 = 0.75;
    add(sarch(Sb, u0 - 0.06, u1 + 0.06, 0.7, 2.5, C.brass));
    add(sarch(Sb, u0 - 0.03, u1 + 0.03, 0.72, 2.47, shade('#a67c58', 0.2)));
    add(sarch(Sb, u0, u1, 0.75, 2.44, lin('niche', [[0, '#f4e6c8'], [0.6, '#e6cfa2'], [1, '#d3b17a']], [0, 1, 0, 0])));
    add(sarch(Sb, u0 + 0.1, u1 - 0.1, 0.95, 2.34, 'none', { stroke: C.brassD, sw: 1, op: 0.6 }));
    // LED glow on arch
    add(sarch(Sb, u0, u1, 0.75, 2.44, radial('nglow', [[0, '#fff1c8', 0.6], [1, '#fff1c8', 0]], [0.5, 0.5, 0.6]), { style: 'mix-blend-mode:screen' }));
    // shelf inside + vase + brass bowl
    add(sq(Sb, u0 + 0.0, u1, 0.75, 0.82, '#a67c58'), sq(Sb, u0, u1, 0.82, 0.835, C.brass));
    const kb = cam.s(R.Zb);
    let [x, y] = cam.P(-0.25, 0.835, R.Zb - 0.1); add(vase(x, y, kb, C.navy2, { h: 0.7, w: 0.2, branch: true, bloom: '#f0e6d0', seed: 12 }));
    [x, y] = cam.P(0.3, 0.835, R.Zb - 0.1); add(shadowEll(x, y, 0.18 * kb, 0.03 * kb, 0.3, 3), path_(`M${r1(x - 0.18 * kb)} ${r1(y - 0.12 * kb)}Q${r1(x)} ${r1(y + 0.06 * kb)} ${r1(x + 0.18 * kb)} ${r1(y - 0.12 * kb)}Z`, hgrad(C.brassL, C.brassD)), ellipse(x, y - 0.12 * kb, 0.18 * kb, 0.035 * kb, C.brass), circle(x - 0.05 * kb, y - 0.15 * kb, 0.05 * kb, C.terra), circle(x + 0.05 * kb, y - 0.15 * kb, 0.05 * kb, '#d9a030'));
    // console below arch
    add(sq(Sb, -1.1, 1.1, 0.0, 0.7, 'none'));
  }
  // display cabinet (left)
  { const u0 = -2.95, u1 = -0.95; const Sc = surfBack(cam, R.Zb - 0.4);
    add(cam.box(u0, u1, 0, 2.5, R.Zb - 0.4, R.Zb, { front: C.walnut, top: C.walnut, left: shade(C.walnut, 0.2), right: shade(C.walnut, 0.1) }, { flat: true }));
    add(sq(Sc, u0, u1, 0, 2.5, vgrad('#6d4529', '#583520')));
    // lower doors
    add(doorsOn(Sc, u0 + 0.05, u1 - 0.05, 0.08, 0.92, 3, '#7a4e2f', { pull: 'top', grain: true, horizGrad: true }));
    // glass upper section interior
    add(sq(Sc, u0 + 0.06, u1 - 0.06, 1.0, 2.4, lin('cabi', [[0, '#f2dfb5'], [1, '#d9b980']], [0, 0, 0, 1])));
    for (let i = 0; i < 3; i++) { const v = 1.05 + i * 0.45; add(sq(Sc, u0 + 0.06, u1 - 0.06, v + 0.37, v + 0.395, 'none')); }
    const shelves = [1.0, 1.45, 1.9];
    for (const v of shelves) add(sq(Sc, u0 + 0.06, u1 - 0.06, v, v + 0.02, C.oak), sq(Sc, u0 + 0.06, u1 - 0.06, v - 0.012, v, shade(C.oak, 0.3)));
    shelves.forEach((v, i) => add(shelfItems(Sc, u0 + 0.06, u1 - 0.06, v + 0.02, 10 + i * 7)));
    add(sq(Sc, u0 + 0.06, u1 - 0.06, 2.38, 2.4, C.oak));
    // glass doors overlay
    for (let i = 0; i < 3; i++) { const a = u0 + 0.06 + i * (u1 - u0 - 0.12) / 3; add(sq(Sc, a, a + (u1 - u0 - 0.12) / 3, 1.0, 2.4, '#fff', { op: 0.07, stroke: C.brassD, sw: 1.4 })); add(sp(Sc, [[a + 0.05, 1.0], [a + 0.2, 1.0], [a + 0.35, 2.4], [a + 0.2, 2.4]], '#fff', { op: 0.14 })); }
    add(sq(Sc, u0 - 0.03, u1 + 0.03, 2.5, 2.56, C.brass), sq(Sc, u0 - 0.03, u1 + 0.03, 2.46, 2.5, shade(C.walnut, 0.2)));
    add(ledOn(Sc, u0 + 0.06, 2.4, u1 - 0.06, 2.4, '#ffe3b0', 1.6));
  }
  // right side: credenza + large art
  { const u0 = 1.0, u1 = 2.95; const Sc = surfBack(cam, R.Zb - 0.45);
    add(cam.box(u0, u1, 0.1, 0.85, R.Zb - 0.45, R.Zb, { front: C.walnut, top: lighten(C.walnut, 0.25), left: shade(C.walnut, 0.2), right: C.walnut }, { flat: true }));
    add(sq(Sc, u0, u1, 0.1, 0.85, vgrad('#7a4e2f', '#5e3a22')));
    add(doorsOn(Sc, u0 + 0.03, u1 - 0.03, 0.14, 0.82, 4, '#7a4e2f', { pull: 'side', grain: true, horizGrad: true }));
    for (const x of [u0 + 0.1, u1 - 0.1]) add(cam.box(x - 0.02, x + 0.02, 0, 0.1, R.Zb - 0.4, R.Zb - 0.36, C.brass, { flat: true }));
    add(ledOn(Sc, u0, 0.09, u1, 0.09, '#ffd9a0', 1.5));
    // decor on credenza
    const kb = cam.s(R.Zb - 0.2);
    let [x, y] = cam.P(1.35, 0.85, R.Zb - 0.2); add(books(x, y, kb, 4, { seed: 9 }));
    add(circle(x, y - 0.14 * kb, 0.05 * kb, C.brass));
    [x, y] = cam.P(2.5, 0.85, R.Zb - 0.2); add(tableLamp(x, y, kb * 1.3, { shade: '#f6ead0', base: C.teal }));
    [x, y] = cam.P(2.0, 0.85, R.Zb - 0.2); add(vase(x, y, kb, C.terra, { h: 0.36, w: 0.2 }));
    // art
    add(frameArt(Sb.map(1.2, 2.3)[0], Sb.map(1.2, 2.3)[1], Sb.map(2.75, 0)[0] - Sb.map(1.2, 0)[0], Sb.map(0, 1.15)[1] - Sb.map(0, 2.3)[1], 2, { frame: C.brass }));
  }
  // ---- LEFT WALL: tall window with curtains
  add(windowOn(SL, 4.5, 5.95, 0.35, 2.45, { cols: 3, tag: 'dn', seed: 15, t: 0.045, frame: '#3a2a1c' }));
  add(sq(SL, 4.45, 6.0, 0.3, 0.35, C.white));
  add(curtainOn(SL, 4.4, 6.05, 2.55, 0.05, '#fbf6ea', 14, { sheer: true, sway: 0 }));
  add(curtainOn(SL, 4.1, 4.62, 2.6, 0.03, '#8d3a2a', 7));
  add(curtainOn(SL, 5.85, 6.2, 2.6, 0.03, '#8d3a2a', 5));
  add(rodOn(SL, 4.05, 6.2, 2.65));
  // ---- RIGHT WALL: framed art + wall sconces + mirror
  add(sq(SR, 4.0, 6.2, 0, 0.95, vgrad('#e8dcc4', '#d9c9a8')));
  add(sq(SR, 4.0, 6.2, 0.95, 0.985, C.brass));
  add(sarch(SR, 4.4, 5.5, 0.95, 2.35, C.brass));
  add(sarch(SR, 4.44, 5.46, 0.99, 2.31, lin('mir', [[0, '#d9e4e6'], [0.5, '#9fb7bf'], [1, '#d3dfe2']], [0, 0, 1, 1])));
  add(sp(SR, [[4.5, 1.0], [4.65, 1.0], [4.95, 2.2], [4.8, 2.2]], '#fff', { op: 0.25 }));
  for (const u of [5.8, 6.05]) { add(sq(SR, u - 0.02, u + 0.02, 1.7, 1.78, C.brass)); add(sc(SR, u, 1.9, 0.04, 0.09, '#fff3d0')); add(sc(SR, u, 1.9, 0.18, 0.28, radial('scg' + u, [[0, '#ffe2a8', 0.55], [1, '#ffe2a8', 0]]), { style: 'mix-blend-mode:screen' })); }
  add(roomShade(cam, R, { ao: 0.25 }));
  // floor light pool
  add(cam.hellipse(0, 4.4, 2.4, 1.9, 0, radial('flr', [[0, '#ffd9a0', 0.4], [1, '#ffd9a0', 0]]), { style: 'mix-blend-mode:screen' }));

  // ceiling rose: round coffer with LED ring
  add(cam.hellipse(0, 4.3, 1.25, 1.25, 2.78, lin('rose', [[0, '#f0e4cc'], [1, '#e1d1b0']], [0, 0, 0, 1])));
  add(cam.hellipse(0, 4.3, 1.25, 1.25, 2.78, 'none', { stroke: '#fff1cf', sw: 3, op: 0.95 }));
  add(cam.hellipse(0, 4.3, 1.25, 1.25, 2.78, 'none', { stroke: '#ffd9a0', sw: 14, op: 0.35, filter: blur(5) }));
  add(cam.hellipse(0, 4.3, 0.95, 0.95, 2.78, 'none', { stroke: C.brassD, sw: 1.4, op: 0.8 }));
  // ---- RUG
  { const rx0 = -1.75, rx1 = 1.75, rz0 = 2.6, rz1 = 5.9;
    add(shadowPoly([cam.P(rx0, 0, rz0), cam.P(rx1 + 0.05, 0, rz0), cam.P(rx1 + 0.08, 0, rz1), cam.P(rx0, 0, rz1)], 0.3, 4));
    add(rugPaint((u, v) => cam.P(rx0 + u * (rx1 - rx0), 0, rz0 + (1 - v) * (rz1 - rz0)), { field: '#27496d', field2: '#1d3a5b', border: '#7a3225', accent: '#d9c08a', motif: '#e9d9b0' }, { asp: (rz1 - rz0) / (rx1 - rx0), nU: 14, nV: 10 }));
    for (let i = 0; i <= 50; i++) { const u = i / 50; const a = cam.P(rx0 + u * (rx1 - rx0), 0, rz0), b = cam.P(rx0 + u * (rx1 - rx0), 0, rz0 - 0.07); add(line(a[0], a[1], b[0], b[1], '#eadfc6', 1.1)); } }

  // plants
  { const [x, y] = cam.P(-2.65, 0, 4.0); add(plantSnake(x, y, cam.s(3.9) * 1.2, { pot: C.sand2, sc: 0.95 })); }
  { const [x, y] = cam.P(2.6, 0, 5.2); add(plantFiddle(x, y, cam.s(5.2) * 1.1, { h: 1.5, seed: 33, pot: C.char2 })); }

  // ---- chairs far end & far side, then table, then near
  add(frontChair(cam, 0, 5.75, -1, '#c9b48b'));
  add(sideChair(cam, -0.86, 5.0, 1)); add(sideChair(cam, 0.86, 5.0, -1));
  add(sideChair(cam, -0.86, 4.3, 1)); add(sideChair(cam, 0.86, 4.3, -1));
  // table
  { const tx0 = -0.52, tx1 = 0.52, tz0 = 3.25, tz1 = 5.35;
    add(shadowPoly([cam.P(tx0 - 0.1, 0, tz0), cam.P(tx1 + 0.15, 0, tz0), cam.P(tx1 + 0.2, 0, tz1 + 0.1), cam.P(tx0 - 0.1, 0, tz1 + 0.1)], 0.38, 9));
    // legs: four tapered walnut legs with brass feet
    for (const [lx, lz] of [[-0.44, 5.2], [0.44, 5.2], [-0.44, 3.4], [0.44, 3.4]]) { add(cam.box(lx - 0.035, lx + 0.035, 0.03, 0.72, lz - 0.035, lz + 0.035, C.walnut, { flat: true })); add(cam.box(lx - 0.04, lx + 0.04, 0, 0.03, lz - 0.04, lz + 0.04, C.brass, { flat: true })); }
    // top: marble slab with brass edge
    add(cam.box(tx0, tx1, 0.72, 0.77, tz0, tz1, { front: '#eae6dc', top: '#f6f3ec', left: '#c9c5bb', right: '#eae6dc' }, { flat: true }));
    add(cam.frect(tx0, tx1, 0.72, 0.735, tz0, C.brass));
    // marble veins
    reseed(44); for (let i = 0; i < 8; i++) { const x = rr(tx0, tx1); const a = cam.P(x, 0.771, tz0 + 0.03), b = cam.P(x + rr(-0.3, 0.3), 0.771, tz1 - 0.03); add(line(a[0], a[1], b[0], b[1], '#8f8e8b', rr(0.6, 1.3), { op: rr(0.12, 0.3) })); }
    // runner
    add(cam.hq(-0.14, 0.14, tz0 + 0.02, tz1 - 0.02, 0.772, '#8d3a2a', { op: 0.92 }));
    add(cam.hq(-0.14, -0.12, tz0 + 0.02, tz1 - 0.02, 0.773, C.brass), cam.hq(0.12, 0.14, tz0 + 0.02, tz1 - 0.02, 0.773, C.brass));
    // place settings
    const seatsZ = [3.6, 4.3, 5.0]; const place = (x, z, rot) => { return cam.hellipse(x, z, 0.12, 0.12, 0.775, '#fbf8f0', { stroke: C.brass, sw: 1.1 }, 24) + cam.hellipse(x, z, 0.075, 0.075, 0.776, 'none', { stroke: '#d7ccb2', sw: 0.8 }, 20); };
    for (const z of seatsZ) { add(place(-0.33, z), place(0.33, z)); }
    add(place(0, 5.12));
    // glasses and napkin
    for (const z of seatsZ) for (const x of [-0.33, 0.33]) { const [gx, gy] = cam.P(x * 1.0 + (x < 0 ? 0.0 : 0.0), 0.775, z + 0.2); const k = cam.s(z); add(path_(`M${r1(gx - 0.022 * k)} ${r1(gy - 0.1 * k)}h${r1(0.044 * k)}q0 ${r1(0.045 * k)} ${r1(-0.022 * k)} ${r1(0.055 * k)}q${r1(-0.022 * k)} ${r1(-0.01 * k)} ${r1(-0.022 * k)} ${r1(-0.055 * k)}z`, '#cfe5ee', { op: 0.7, stroke: '#fff', sw: 0.7 }), rect(gx - 0.002 * k, gy - 0.045 * k, 0.004 * k * 1.2, 0.045 * k, '#cfe5ee', { op: 0.8 })); }
    // centerpiece: brass bowl w/ fruit + candles + vase
    let [x, y] = cam.P(0, 0.772, 4.3); const k = cam.s(4.3);
    add(shadowEll(x, y, 0.2 * k, 0.03 * k, 0.3, 3));
    add(vase(x - 0.12 * k, y, k * 1.0, C.teal, { h: 0.34, w: 0.13, branch: true, bloom: '#f6d9b0', seed: 21 }));
    add(path_(`M${r1(x + 0.0 * k)} ${r1(y - 0.09 * k)}Q${r1(x + 0.14 * k)} ${r1(y + 0.05 * k)} ${r1(x + 0.28 * k)} ${r1(y - 0.09 * k)}Z`, hgrad(C.brassL, C.brassD)), ellipse(x + 0.14 * k, y - 0.09 * k, 0.14 * k, 0.025 * k, C.brass));
    for (const [dx, dy, c] of [[0.06, -0.11, '#c0392b'], [0.14, -0.13, '#e0a030'], [0.22, -0.11, '#7aa04a']]) add(circle(x + dx * k, y + dy * k, 0.045 * k, soft(c, 0.2, 0.2)));
    [x, y] = cam.P(0.0, 0.772, 3.7); const k2 = cam.s(3.7);
    for (const dx of [-0.1, 0.1]) { add(rect(x + dx * k2 - 0.012 * k2, y - 0.18 * k2, 0.024 * k2, 0.18 * k2, '#f4ecd8'), rect(x + dx * k2 - 0.026 * k2, y - 0.01 * k2, 0.052 * k2, 0.012 * k2, C.brass), path_(`M${r1(x + dx * k2)} ${r1(y - 0.2 * k2)}q${r1(-0.012 * k2)} ${r1(-0.03 * k2)} 0 ${r1(-0.06 * k2)}q${r1(0.012 * k2)} ${r1(0.03 * k2)} 0 ${r1(0.06 * k2)}z`, '#ffb347'), circle(x + dx * k2, y - 0.24 * k2, 0.06 * k2, radial('cd' + dx, [[0, '#ffe2a8', 0.7], [1, '#ffe2a8', 0]]), { style: 'mix-blend-mode:screen' })); }
  }
  // near chairs (side) & near end chair
  add(sideChair(cam, -0.86, 3.6, 1)); add(sideChair(cam, 0.86, 3.6, -1));
  // chandelier
  { const [x, y0] = cam.P(0, 2.78, 4.3); const k = cam.s(4.3); add(ringChandelier(x, y0, k, { r: 0.75, drop: 0.45, n: 14 })); }
  add(downlights(cam, [[-2.2, 2.5], [2.2, 2.5], [-2.2, 5.2], [2.2, 5.2], [0, 2.3]], 2.6));
  add(finishLayer({ vig: 0.42, glow: '#ffc882', glowOp: 0.2, gx: 0.5, gy: 0.4 }));
  finish('interior-dining.svg', 'Dining room', 'A warm dining room with a six-seat marble-top table, upholstered chairs, a statement brass chandelier, a lit crockery display cabinet and an arched niche.', [1.14, 600, 620, -46]);
}

// =============================================================================
// SERVICES: shared illustration language
// =============================================================================
const steelGrad = () => lin('steel', [[0, '#eef1f4'], [0.45, '#b4bac3'], [1, '#6f7681']], [0, 0, 0, 1]);
const steelGradH = () => lin('steelh', [[0, '#8b929d'], [0.35, '#eef1f4'], [0.7, '#b4bac3'], [1, '#6a717c']], [0, 0, 1, 0]);
const brassGradH = () => lin('brassH', [[0, C.brassD], [0.35, C.brassL], [0.7, C.brass], [1, C.brassD]], [0, 0, 1, 0]);

// 8-point star tile pattern (Islamic geometric feel), used faintly in backgrounds
function starPattern(col, op) {
  const sz = 110, c = sz / 2;
  const inner = starPoly(c, c, 34, 17, 8, Math.PI / 8, 'none', { stroke: col, sw: 1.2 }) + regPoly(c, c, 8, 8, Math.PI / 8, 'none', { stroke: col, sw: 1 }) +
    regPoly(0, 0, 6, 4, Math.PI / 4, 'none', { stroke: col, sw: 1 }) + regPoly(sz, 0, 6, 4, Math.PI / 4, 'none', { stroke: col, sw: 1 }) + regPoly(0, sz, 6, 4, Math.PI / 4, 'none', { stroke: col, sw: 1 }) + regPoly(sz, sz, 6, 4, Math.PI / 4, 'none', { stroke: col, sw: 1 });
  return pattern('star' + hkey(col), sz, sz, g(inner, { op }));
}
// Background panel shared by the services series
function svcBg(o = {}) {
  const navy = o.mode === 'navy';
  const cx = o.cx ?? 600, cy = o.cy ?? 440, r = o.r ?? 340;
  let s = '';
  s += rect(0, 0, 1200, 900, navy ? vgrad('#17385c', '#0b1a2c') : vgrad('#f8f3e9', '#e9dfca'));
  s += rect(0, 0, 1200, 900, starPattern(navy ? C.brass : C.navy, navy ? 0.16 : 0.07));
  // corner glows
  s += rect(0, 0, 1200, 900, radial('bgl', [[0, navy ? '#3d6590' : '#ffffff', navy ? 0.35 : 0.8], [1, navy ? '#3d6590' : '#ffffff', 0]], [0.5, 0.45, 0.6]));
  // stage circle
  const st = navy ? ['#f6efe0', '#e3d6b8'] : ['#1e4068', '#0f2238'];
  s += circle(cx + 14, cy + 20, r + 6, '#000', { op: 0.18, filter: blur(14) });
  s += circle(cx, cy, r, radial('stage', [[0, st[0] === '#f6efe0' ? '#fbf7ee' : '#2c5382'], [1, st[1] === '#e3d6b8' ? '#e1d3b2' : '#0f2238']], [0.4, 0.35, 0.8]));
  s += circle(cx, cy, r + 26, 'none', { stroke: C.brass, sw: 2.5, op: 0.9 });
  s += circle(cx, cy, r + 44, 'none', { stroke: C.brass, sw: 1.2, op: 0.6, da: '3 9' });
  s += circle(cx, cy, r - 18, 'none', { stroke: navy ? C.navy : C.brass, sw: 1, op: 0.35 });
  // decor
  const fl = o.flip ? -1 : 1; const X = (x) => (o.flip ? 1200 - x : x);
  // dotted grid
  let dots = '';
  for (let i = 0; i < 6; i++) for (let j = 0; j < 5; j++) dots += circle(X(70 + i * 20), 70 + j * 20, 2.2, navy ? C.brassL : C.navy, { op: 0.35 });
  s += dots;
  // diamonds
  s += regPoly(X(1090), 120, 18, 4, Math.PI / 4, C.brass, { op: 0.9 }) + regPoly(X(1090), 120, 30, 4, Math.PI / 4, 'none', { stroke: C.brass, sw: 1.5, op: 0.7 });
  s += regPoly(X(120), 790, 14, 4, Math.PI / 4, navy ? C.brassL : C.navy, { op: 0.85 }) + regPoly(X(150), 820, 7, 4, Math.PI / 4, C.brass);
  s += star4(X(1030), 770, 22, C.brass, { op: 0.9 }) + star4(X(1090), 700, 11, navy ? C.cream : C.navy3, { op: 0.8 });
  s += path_(`M${X(1200)} 560A140 140 0 0 ${o.flip ? 0 : 1} ${X(1060)} 700`, 'none', { stroke: C.brass, sw: 2, op: 0.6 });
  s += path_(`M${X(0)} 300A120 120 0 0 ${o.flip ? 0 : 1} ${X(120)} 180`, 'none', { stroke: C.brass, sw: 2, op: 0.5 });
  // ground shadow
  if (o.ground !== false) s += ellipse(cx, o.gy ?? 745, o.gw ?? 400, 34, '#0a1424', { op: navy ? 0.45 : 0.28, filter: blur(14) });
  return s;
}
// Isometric helpers ----------------------------------------------------------
const ISO = { ox: 600, oy: 500, s: 1 };
const isoP = (x, y, z) => [ISO.ox + (x - y) * 0.866 * ISO.s, ISO.oy + (x + y) * 0.5 * ISO.s - z * ISO.s];
const isoPoly = (pts, fill, o) => poly(pts.map((p) => isoP(...p)), fill, o);
function isoBox(x, y, z, w, d, h, col, o = {}) {
  const c = typeof col === 'string' ? { top: lighten(col, 0.2), left: col, right: shade(col, 0.22) } : col;
  const st = (f) => ({ stroke: f, sw: 0.6, lj: 'round' });
  let s = '';
  // left face: plane y = y+d (front-left), spans x
  s += isoPoly([[x, y + d, z], [x + w, y + d, z], [x + w, y + d, z + h], [x, y + d, z + h]], o.leftFill || soft(c.left, 0.03, 0.06), st(c.left));
  // right face: plane x = x+w, spans y
  s += isoPoly([[x + w, y, z], [x + w, y + d, z], [x + w, y + d, z + h], [x + w, y, z + h]], o.rightFill || soft(c.right, 0.03, 0.06), st(c.right));
  s += isoPoly([[x, y, z + h], [x + w, y, z + h], [x + w, y + d, z + h], [x, y + d, z + h]], o.topFill || c.top, st(c.top));
  return s;
}
// rect on the left face (plane y=Y) from x0..x1 and z0..z1
const isoL = (Y, x0, x1, z0, z1, fill, o) => isoPoly([[x0, Y, z0], [x1, Y, z0], [x1, Y, z1], [x0, Y, z1]], fill, o);
const isoR = (X, y0, y1, z0, z1, fill, o) => isoPoly([[X, y0, z0], [X, y1, z0], [X, y1, z1], [X, y0, z1]], fill, o);
const isoT = (Z, x0, x1, y0, y1, fill, o) => isoPoly([[x0, y0, Z], [x1, y0, Z], [x1, y1, Z], [x0, y1, Z]], fill, o);
function isoGrid(x0, y0, w, d, n, m, col, sw = 1, op = 0.4, z = 0) {
  let s = '';
  for (let i = 0; i <= n; i++) { const a = isoP(x0 + (w * i) / n, y0, z), b = isoP(x0 + (w * i) / n, y0 + d, z); s += line(a[0], a[1], b[0], b[1], col, sw, { op }); }
  for (let j = 0; j <= m; j++) { const a = isoP(x0, y0 + (d * j) / m, z), b = isoP(x0 + w, y0 + (d * j) / m, z); s += line(a[0], a[1], b[0], b[1], col, sw, { op }); }
  return s;
}
// flat shapes ---------------------------------------------------------------
function roundTree(x, y, s = 1, col = C.leaf) {
  return shadowEll(x, y, 38 * s, 8 * s, 0.25, 4) + rect(x - 4 * s, y - 52 * s, 8 * s, 52 * s, C.woodD) +
    circle(x, y - 78 * s, 38 * s, radial('rt' + hkey(col), [[0, lighten(col, 0.25)], [1, shade(col, 0.15)]], [0.35, 0.3, 0.8])) +
    circle(x + 20 * s, y - 62 * s, 24 * s, shade(col, 0.1), { op: 0.7 }) + circle(x - 22 * s, y - 92 * s, 18 * s, lighten(col, 0.2), { op: 0.5 });
}
function palmTree(x, y, h = 160, s = 1) {
  let o = shadowEll(x, y, 26 * s, 6 * s, 0.25, 3);
  o += path_(`M${r1(x - 4 * s)} ${r1(y)}Q${r1(x + 8 * s)} ${r1(y - h * 0.5)} ${r1(x + 2 * s)} ${r1(y - h)}L${r1(x + 7 * s)} ${r1(y - h)}Q${r1(x + 16 * s)} ${r1(y - h * 0.5)} ${r1(x + 5 * s)} ${r1(y)}Z`, hgrad('#8a6a44', '#5e4630'));
  const tx = x + 4 * s, ty = y - h;
  for (let i = 0; i < 9; i++) { const a = -160 + i * 40; const L = (58 + (i % 2) * 10) * s; const ex = tx + Math.cos((a * Math.PI) / 180) * L, ey = ty + Math.sin((a * Math.PI) / 180) * L * 0.7 + L * 0.35;
    o += path_(`M${r1(tx)} ${r1(ty)}Q${r1((tx + ex) / 2)} ${r1(ty - 24 * s)} ${r1(ex)} ${r1(ey)}Q${r1((tx + ex) / 2 + 4)} ${r1(ty - 8 * s)} ${r1(tx)} ${r1(ty + 3)}Z`, mix(C.leafD, C.leafL, (i % 3) / 3)); }
  o += circle(tx, ty + 4, 5 * s, C.woodD) + circle(tx + 6 * s, ty + 7, 4 * s, C.woodD);
  return o;
}
function cloud(x, y, s = 1, op = 0.9) { return g(ellipse(x, y, 60 * s, 18 * s, '#fff') + circle(x - 22 * s, y - 10 * s, 20 * s, '#fff') + circle(x + 8 * s, y - 18 * s, 26 * s, '#fff') + circle(x + 34 * s, y - 6 * s, 16 * s, '#fff'), { op }); }
function lampPost(x, y, h = 170, on = true) {
  return rect(x - 3, y - h, 6, h, C.char) + path_(`M${x} ${y - h}q0 -22 22 -22`, 'none', { stroke: C.char, sw: 5 }) + ellipse(x + 24, y - h - 16, 12, 5, on ? '#ffe9ad' : C.char3) + (on ? ellipse(x + 24, y - h + 8, 30, 20, radial('lp' + x, [[0, '#ffe9ad', 0.5], [1, '#ffe9ad', 0]]), { style: 'mix-blend-mode:screen' }) : '');
}
function carSide(x, y, s = 1, col = '#e8e3d8') {
  const w = 190 * s, h = 52 * s;
  let o = shadowEll(x, y + 2, w * 0.52, 8 * s, 0.35, 4);
  o += path_(`M${r1(x - w / 2)} ${r1(y - 14 * s)}Q${r1(x - w / 2)} ${r1(y - 26 * s)} ${r1(x - w * 0.4)} ${r1(y - 28 * s)}L${r1(x - w * 0.22)} ${r1(y - 31 * s)}L${r1(x - w * 0.1)} ${r1(y - 52 * s)}L${r1(x + w * 0.2)} ${r1(y - 52 * s)}L${r1(x + w * 0.34)} ${r1(y - 30 * s)}L${r1(x + w * 0.46)} ${r1(y - 26 * s)}Q${r1(x + w / 2)} ${r1(y - 22 * s)} ${r1(x + w / 2)} ${r1(y - 12 * s)}L${r1(x + w / 2)} ${r1(y - 4 * s)}L${r1(x - w / 2)} ${r1(y - 4 * s)}Z`, vgrad(lighten(col, 0.2), shade(col, 0.12)));
  o += path_(`M${r1(x - w * 0.08)} ${r1(y - 49 * s)}L${r1(x + w * 0.18)} ${r1(y - 49 * s)}L${r1(x + w * 0.3)} ${r1(y - 31 * s)}L${r1(x - w * 0.18)} ${r1(y - 31 * s)}Z`, '#2c3e52');
  o += rect(x + w * 0.03, y - 49 * s, 2, 18 * s, col);
  for (const dx of [-0.28, 0.28]) { o += circle(x + dx * w, y - 4 * s, 14 * s, '#14181e') + circle(x + dx * w, y - 4 * s, 7 * s, '#9aa1ab') + circle(x + dx * w, y - 4 * s, 2.5 * s, '#555'); }
  o += rect(x + w / 2 - 8 * s, y - 20 * s, 8 * s, 5 * s, '#ffe9ad') + rect(x - w / 2, y - 20 * s, 6 * s, 5 * s, '#c44');
  return o;
}
// window with frame + reflective glass (front elevation)
function winEl(x, y, w, h, o = {}) {
  const fr = o.frame || C.char; let s = '';
  s += rect(x - 2, y - 2, w + 4, h + 4, fr, { rx: o.rx ?? 1 });
  s += rect(x, y, w, h, o.glass || lin('wg' + hkey(String(o.tint || 1)), [[0, o.tint || '#a9c9de'], [1, shade(o.tint || '#a9c9de', 0.25)]], [0, 0, 1, 1]));
  s += poly([[x, y + h], [x + w * 0.45, y], [x + w * 0.65, y], [x + w * 0.2, y + h]], '#fff', { op: 0.2 });
  const cols = o.cols ?? 2, rows = o.rows ?? 1;
  for (let i = 1; i < cols; i++) s += rect(x + (w * i) / cols - 1.2, y, 2.4, h, fr);
  for (let j = 1; j < rows; j++) s += rect(x, y + (h * j) / rows - 1.2, w, 2.4, fr);
  if (o.sill !== false) s += rect(x - 5, y + h + 2, w + 10, 5, o.sillCol || C.white, { rx: 1 });
  return s;
}
// ----------------------------------------------------------- icons & tools
function checkCircle(x, y, r, fill = C.brass, ck = C.white, o = {}) {
  return circle(x, y, r, fill, o) + pline([[x - r * 0.42, y + r * 0.02], [x - r * 0.1, y + r * 0.34], [x + r * 0.44, y - r * 0.32]], ck, Math.max(2.5, r * 0.2), { lc: 'round', lj: 'round' });
}
function wrenchPath(R, w, d, L, hw) { // head circle radius R with jaw slot of half-width w, depth d (from centre), handle length L half-width hw
  const yb = Math.sqrt(R * R - w * w);
  const yh = Math.sqrt(R * R - hw * hw);
  // head: starts at slot, goes around; handle attaches at bottom
  return `M${r1(-w)} ${r1(-yb)}L${r1(-w)} ${r1(-d)}L${r1(w)} ${r1(-d)}L${r1(w)} ${r1(-yb)}A${r1(R)} ${r1(R)} 0 0 1 ${r1(hw)} ${r1(yh)}L${r1(hw)} ${r1(L)}Q${r1(hw)} ${r1(L + hw)} 0 ${r1(L + hw)}Q${r1(-hw)} ${r1(L + hw)} ${r1(-hw)} ${r1(L)}L${r1(-hw)} ${r1(yh)}A${r1(R)} ${r1(R)} 0 0 1 ${r1(-w)} ${r1(-yb)}Z`;
}
function spanner(x, y, len, rot, o = {}) {
  const R = len * 0.13, w = R * 0.52, d = R * 0.05, hw = R * 0.42;
  const L = len - R;
  const body = path_(wrenchPath(R, w, d, L, hw), o.fill || steelGradH(), { stroke: '#5a616c', sw: 1.2 });
  const hi = rect(-hw * 0.3, R * 0.6, hw * 0.35, L - R * 0.8, '#fff', { op: 0.4, rx: 2 });
  const hole = circle(0, L + hw * 0.1, hw * 0.45, '#5a616c', { op: 0.9 });
  return g(shadowEll(8, len * 0.5, R * 0.9, len * 0.5, 0.18, 6, 0) + body + hi + hole, { tf: `translate(${r1(x)} ${r1(y)}) rotate(${rot})` });
}
function hammer(x, y, len, rot, o = {}) {
  const hl = len * 0.9, hw = len * 0.055;
  let s = rrect(-hw, -hl * 0.1, hw * 2, hl * 1.1, hw, hgrad(C.woodD, C.woodL), { stroke: C.woodD, sw: 1 });
  s += rect(-hw * 0.3, hl * 0.1, hw * 0.4, hl * 0.8, '#fff', { op: 0.18, rx: 2 });
  // grip
  s += rrect(-hw * 1.15, hl * 0.55, hw * 2.3, hl * 0.5, hw, hgrad('#1a2a40', '#27496d'));
  for (let i = 0; i < 6; i++) s += line(-hw * 1.1, hl * 0.6 + i * hl * 0.07, hw * 1.1, hl * 0.6 + i * hl * 0.07, '#0f2238', 1.2, { op: 0.6 });
  // head (claw hammer)
  const bw = len * 0.075, bh = len * 0.15, fw = len * 0.065, cl = len * 0.15, y0 = -hl * 0.1;
  s += path_(`M${r1(-bw)} ${r1(y0 - bh)}L${r1(bw + fw)} ${r1(y0 - bh)}L${r1(bw + fw)} ${r1(y0)}L${r1(-bw)} ${r1(y0)}Q${r1(-bw - cl * 0.6)} ${r1(y0 - bh * 0.1)} ${r1(-bw - cl)} ${r1(y0 + bh * 0.55)}Q${r1(-bw - cl * 0.7)} ${r1(y0 - bh * 0.55)} ${r1(-bw)} ${r1(y0 - bh)}Z`, lin('hmh', [[0, '#f4f6f8'], [0.5, '#aeb4be'], [1, '#6a717c']], [0, 0, 0, 1]), { stroke: '#4d535d', sw: 1.2 });
  s += rect(bw + fw * 0.2, y0 - bh, fw * 0.8, bh, '#8b929d', { op: 0.9 }) + rect(-bw + 4, y0 - bh + 4, bw * 2 + fw - 8, 5, '#fff', { op: 0.5, rx: 2 });
  return g(s, { tf: `translate(${r1(x)} ${r1(y)}) rotate(${rot})` });
}
function screwdriver(x, y, len, rot, handle = '#b5603c') {
  const hw = len * 0.045; const hl = len * 0.34;
  let s = path_(`M${r1(-hw * 0.18)} ${r1(hl)}H${r1(hw * 0.18)}V${r1(len * 0.93)}L${r1(hw * 0.5)} ${r1(len)}L${r1(-hw * 0.5)} ${r1(len)}L${r1(-hw * 0.18)} ${r1(len * 0.93)}Z`, steelGradH());
  s += rrect(-hw, 0, hw * 2, hl, hw * 0.9, hgrad(lighten(handle, 0.2), shade(handle, 0.2)), { stroke: shade(handle, 0.35), sw: 1 });
  for (let i = 0; i < 5; i++) s += rect(-hw, hl * 0.12 + i * hl * 0.16, hw * 2, hl * 0.06, shade(handle, 0.3), { op: 0.35 });
  s += rect(-hw * 0.7, hl * 0.82, hw * 1.4, hl * 0.14, '#2b2f36', { rx: 2 });
  s += rect(-hw * 0.5, 4, hw * 0.4, hl - 10, '#fff', { op: 0.25, rx: 2 });
  return g(s, { tf: `translate(${r1(x)} ${r1(y)}) rotate(${rot})` });
}
function toolbox(x, y, w, h, col = '#a8372d') {
  let s = shadowEll(x + w / 2, y + h + 4, w * 0.55, 10, 0.3, 6);
  // handle
  s += path_(`M${r1(x + w * 0.3)} ${r1(y)}v${r1(-h * 0.28)}q0 ${r1(-h * 0.1)} ${r1(h * 0.1)} ${r1(-h * 0.1)}h${r1(w * 0.4 - h * 0.2)}q${r1(h * 0.1)} 0 ${r1(h * 0.1)} ${r1(h * 0.1)}v${r1(h * 0.28)}`, 'none', { stroke: '#1a1d22', sw: h * 0.09, lc: 'round' });
  s += rrect(x, y, w, h * 0.42, 8, vgrad(lighten(col, 0.25), col), { stroke: shade(col, 0.4), sw: 1.5 });
  s += rrect(x, y + h * 0.38, w, h * 0.62, 8, vgrad(col, shade(col, 0.25)), { stroke: shade(col, 0.4), sw: 1.5 });
  s += rect(x + 6, y + h * 0.37, w - 12, h * 0.05, shade(col, 0.45));
  s += rrect(x + w * 0.1, y + h * 0.28, w * 0.1, h * 0.2, 3, C.brass) + rrect(x + w * 0.8, y + h * 0.28, w * 0.1, h * 0.2, 3, C.brass);
  s += rect(x + w * 0.1, y + h * 0.33, w * 0.1, 3, C.brassL) + rect(x + w * 0.8, y + h * 0.33, w * 0.1, 3, C.brassL);
  s += rect(x + 10, y + 8, w * 0.5, 5, '#fff', { op: 0.25, rx: 2 });
  // sticker plate
  s += rrect(x + w * 0.38, y + h * 0.52, w * 0.24, h * 0.22, 4, C.cream, { stroke: C.brassD, sw: 1 }) + path_(`M${r1(x + w * 0.45)} ${r1(y + h * 0.7)}l${r1(w * 0.05)} ${r1(-h * 0.14)}l${r1(w * 0.05)} ${r1(h * 0.14)}`, 'none', { stroke: C.navy2, sw: 2 });
  return s;
}
function paintRoller(x, y, sc, rot, col = '#c9a24b') {
  let s = '';
  s += path_(`M${r1(150 * sc)} ${r1(6 * sc)}H${r1(187 * sc)}V${r1(46 * sc)}`, 'none', { stroke: '#7d8590', sw: 6 * sc, lj: 'round', lc: 'round' });
  s += rrect(-90 * sc, -28 * sc, 250 * sc, 62 * sc, 14 * sc, vgrad(lighten(col, 0.3), shade(col, 0.15)), { stroke: shade(col, 0.35), sw: 1.5 });
  for (let i = 0; i < 12; i++) s += rect(-84 * sc + i * 20 * sc, -26 * sc, 3 * sc, 58 * sc, '#fff', { op: 0.08 });
  s += rect(-80 * sc, -20 * sc, 230 * sc, 9 * sc, '#fff', { op: 0.3, rx: 4 });
  s += rrect(-96 * sc, -26 * sc, 10 * sc, 58 * sc, 4 * sc, '#4a2c1a');
  s += rrect(176 * sc, 44 * sc, 22 * sc, 150 * sc, 8 * sc, hgrad('#1f3d5e', '#35618e'), { stroke: '#0f2238', sw: 1.5 });
  return g(s, { tf: `translate(${r1(x)} ${r1(y)}) rotate(${rot})` });
}
function paintTin(x, y, w, h, col, o = {}) {
  const ry = w * 0.12; let s = shadowEll(x + w / 2, y + h, w * 0.58, ry * 1.2, 0.3, 5);
  s += path_(`M${r1(x)} ${r1(y)}V${r1(y + h)}A${r1(w / 2)} ${r1(ry)} 0 0 0 ${r1(x + w)} ${r1(y + h)}V${r1(y)}Z`, hgrad(shade(C.concrete, 0.0), '#8a909a'));
  s += path_(`M${r1(x)} ${r1(y)}V${r1(y + h)}A${r1(w / 2)} ${r1(ry)} 0 0 0 ${r1(x + w)} ${r1(y + h)}V${r1(y)}Z`, lin('tin' + hkey(col), [[0, shade('#d8dce2', 0.1)], [0.3, '#f4f6f8'], [1, '#9aa0aa']], [0, 0, 1, 0]));
  // label band
  s += rect(x, y + h * 0.28, w, h * 0.46, lin('lab' + hkey(col), [[0, shade(col, 0.2)], [0.35, lighten(col, 0.15)], [1, shade(col, 0.3)]], [0, 0, 1, 0]));
  s += circle(x + w / 2, y + h * 0.5, w * 0.17, '#fff', { op: 0.9 }) + circle(x + w / 2, y + h * 0.5, w * 0.1, col);
  s += ellipse(x + w / 2, y, w / 2, ry, '#c9ced6') + ellipse(x + w / 2, y, w / 2 - 4, ry - 2, col) + ellipse(x + w / 2, y + 1, w / 2 - 9, ry - 4, lighten(col, 0.2));
  s += path_(`M${r1(x + w * 0.2)} ${r1(y + 2)}q${r1(w * 0.08)} ${r1(ry * 3.5)} ${r1(w * 0.14)} ${r1(ry * 1.2)}t${r1(w * 0.12)} ${r1(-ry * 0.4)}`, 'none', { stroke: col, sw: 4, lc: 'round', op: 0.95 });
  return s;
}
function trowel(x, y, len, rot, o = {}) {
  // plastering / tiling trowel: rectangular blade with raised wooden handle (local: blade centred at origin, long axis x)
  const bl = len, bh = len * 0.32; let s = '';
  s += shadowPoly([[-bl / 2 + 10, bh / 2 + 18], [bl / 2 + 10, bh / 2 + 18], [bl / 2 - 6, bh / 2 + 34], [-bl / 2 + 2, bh / 2 + 34]], 0.0, 4);
  // blade
  let bd = `M${r1(-bl / 2)} ${r1(-bh / 2)}H${r1(bl / 2 - 8)}Q${r1(bl / 2)} ${r1(-bh / 2)} ${r1(bl / 2)} ${r1(-bh / 2 + 8)}V${r1(bh / 2)}`;
  if (o.notched) { const n = 11, st = bl / n; for (let i = 0; i < n; i++) { const xr = bl / 2 - i * st; bd += `L${r1(xr)} ${r1(bh / 2 + 8)}L${r1(xr - st / 2)} ${r1(bh / 2 + 8)}L${r1(xr - st / 2)} ${r1(bh / 2)}L${r1(xr - st)} ${r1(bh / 2)}`; } bd += `L${r1(-bl / 2)} ${r1(bh / 2)}Z`; }
  else bd = `M${r1(-bl / 2)} ${r1(-bh / 2)}H${r1(bl / 2 - 8)}Q${r1(bl / 2)} ${r1(-bh / 2)} ${r1(bl / 2)} ${r1(-bh / 2 + 8)}V${r1(bh / 2 - 8)}Q${r1(bl / 2)} ${r1(bh / 2)} ${r1(bl / 2 - 8)} ${r1(bh / 2)}H${r1(-bl / 2 + 8)}Q${r1(-bl / 2)} ${r1(bh / 2)} ${r1(-bl / 2)} ${r1(bh / 2 - 8)}Z`;
  s += path_(bd, lin('trb', [[0, '#f4f6f8'], [0.45, '#b8bec7'], [1, '#7d848f']], [0, 0, 0, 1]), { stroke: '#5a616c', sw: 1.4 });
  s += rect(-bl / 2 + 8, -bh / 2 + 5, bl - 24, 5, '#fff', { op: 0.5, rx: 2.5 });
  // posts + handle
  for (const px of [-bl * 0.16, bl * 0.16]) s += rect(px - 3, -bh / 2 - 14, 6, 16, hgrad('#8b929d', '#c9ced6')) + circle(px, -bh / 2 + 2, 3.5, '#5a616c');
  s += rrect(-bl * 0.28, -bh / 2 - 38, bl * 0.56, 26, 12, hgrad(C.woodD, C.woodL), { stroke: C.woodD, sw: 1.2 });
  s += rrect(-bl * 0.24, -bh / 2 - 34, bl * 0.48, 7, 3.5, '#fff', { op: 0.22 });
  if (o.mortar) s += path_(`M${r1(-bl * 0.3)} ${r1(bh * 0.1)}q${r1(bl * 0.1)} ${r1(-bh * 0.5)} ${r1(bl * 0.3)} ${r1(-bh * 0.38)}q${r1(bl * 0.25)} ${r1(bh * 0.1)} ${r1(bl * 0.3)} ${r1(bh * 0.32)}q${r1(-bl * 0.3)} ${r1(bh * 0.14)} ${r1(-bl * 0.6)} ${r1(bh * 0.06)}z`, '#d8d1c0', { stroke: '#b5ad98', sw: 1 });
  return g(s, { tf: `translate(${r1(x)} ${r1(y)}) rotate(${rot})` });
}
// brass key (ornate bow, long shaft)
function brassKey(x, y, len, rot) {
  const R = len * 0.16; let s = '';
  const bg = lin('keyg', [[0, C.brassL], [0.5, C.brass], [1, C.brassD]], [0, 0, 1, 1]);
  const bgr = lin('keyg2', [[0, C.brassD], [0.5, C.brassL], [1, C.brassD]], [0, 0, 1, 0]);
  // shaft
  s += rect(-R * 0.18, R * 0.7, R * 0.36, len - R * 0.7, bgr, { stroke: C.brassD, sw: 1 });
  s += rect(-R * 0.55, R * 1.2, R * 1.1, R * 0.28, bg, { rx: 3, stroke: C.brassD, sw: 1 }) + rect(-R * 0.45, R * 1.6, R * 0.9, R * 0.2, bg, { rx: 3 });
  // bit
  s += path_(`M${r1(R * 0.18)} ${r1(len - R * 1.8)}h${r1(R * 0.8)}v${r1(R * 0.35)}h${r1(-R * 0.3)}v${r1(R * 0.35)}h${r1(R * 0.3)}v${r1(R * 0.4)}h${r1(-R * 0.3)}v${r1(R * 0.3)}h${r1(-R * 0.5)}z`, bg, { stroke: C.brassD, sw: 1 });
  // bow: trefoil ring
  for (const [dx, dy] of [[0, -R * 0.9], [-R * 0.85, -R * 0.1], [R * 0.85, -R * 0.1]]) s += circle(dx, dy + R * 0.6, R * 0.75, bg, { stroke: C.brassD, sw: 1.2 });
  s += circle(0, R * 0.55, R * 0.95, bg, { stroke: C.brassD, sw: 1.2 });
  for (const [dx, dy] of [[0, -R * 0.9], [-R * 0.85, -R * 0.1], [R * 0.85, -R * 0.1]]) s += circle(dx, dy + R * 0.6, R * 0.38, 'none', { stroke: C.brassD, sw: 2 }) + circle(dx, dy + R * 0.6, R * 0.2, shade(C.brassD, 0.6), { op: 0.8 });
  s += circle(0, R * 0.55, R * 0.5, 'none', { stroke: C.brassD, sw: 2 }) + circle(0, R * 0.55, R * 0.22, shade(C.brassD, 0.5), { op: 0.9 });
  s += path_(`M${r1(-R * 0.6)} ${r1(-R * 0.1)}Q0 ${r1(-R * 0.6)} ${r1(R * 0.6)} ${r1(-R * 0.1)}`, 'none', { stroke: '#fff', sw: 3, op: 0.35, lc: 'round' });
  return g(shadowEll(10, len * 0.5, R * 0.9, len * 0.5, 0.2, 8, 0) + s, { tf: `translate(${r1(x)} ${r1(y)}) rotate(${rot})` });
}
function shield(x, y, w, h, fill, o = {}) {
  return path_(`M${r1(x)} ${r1(y - h / 2)}C${r1(x + w * 0.2)} ${r1(y - h * 0.46)} ${r1(x + w * 0.42)} ${r1(y - h * 0.5)} ${r1(x + w / 2)} ${r1(y - h * 0.42)}V${r1(y + h * 0.05)}C${r1(x + w / 2)} ${r1(y + h * 0.3)} ${r1(x + w * 0.2)} ${r1(y + h * 0.43)} ${r1(x)} ${r1(y + h / 2)}C${r1(x - w * 0.2)} ${r1(y + h * 0.43)} ${r1(x - w / 2)} ${r1(y + h * 0.3)} ${r1(x - w / 2)} ${r1(y + h * 0.05)}V${r1(y - h * 0.42)}C${r1(x - w * 0.42)} ${r1(y - h * 0.5)} ${r1(x - w * 0.2)} ${r1(y - h * 0.46)} ${r1(x)} ${r1(y - h / 2)}Z`, fill, o);
}
function waterDrop(x, y, s, fill, o = {}) { return path_(`M${r1(x)} ${r1(y - s)}C${r1(x + s * 0.2)} ${r1(y - s * 0.55)} ${r1(x + s * 0.75)} ${r1(y - s * 0.1)} ${r1(x + s * 0.75)} ${r1(y + s * 0.3)}A${r1(s * 0.75)} ${r1(s * 0.75)} 0 0 1 ${r1(x - s * 0.75)} ${r1(y + s * 0.3)}C${r1(x - s * 0.75)} ${r1(y - s * 0.1)} ${r1(x - s * 0.2)} ${r1(y - s * 0.55)} ${r1(x)} ${r1(y - s)}Z`, fill, o); }
function wrenchBadge(x, y, r) {
  const wr = (c) => path_(wrenchPath(r * 0.3, r * 0.15, r * 0.02, r * 0.78, r * 0.1), c, { stroke: C.brassD, sw: 1 });
  const sdr = `<rect x="${r1(-r * 0.07)}" y="${r1(-r * 0.62)}" width="${r1(r * 0.14)}" height="${r1(r * 0.4)}" rx="${r1(r * 0.05)}" fill="${C.cream}"/><rect x="${r1(-r * 0.025)}" y="${r1(-r * 0.2)}" width="${r1(r * 0.05)}" height="${r1(r * 0.8)}" fill="${C.cream}"/>`;
  return circle(x + 4, y + 8, r, '#000', { op: 0.3, filter: blur(7) }) + circle(x, y, r, lin('badge', [[0, C.brassL], [1, C.brassD]], [0, 0, 1, 1])) + circle(x, y, r * 0.86, C.navy, { stroke: C.brassL, sw: 2 }) +
    g(sdr, { tf: `translate(${r1(x)} ${r1(y)}) rotate(-45)` }) +
    g(wr(C.brassL), { tf: `translate(${r1(x)} ${r1(y)}) rotate(45) translate(0 ${r1(-r * 0.46)})` });
}
// brick pattern (flat)
function brickPat(name, bw, bh, base, mortar, o = {}) {
  reseed(o.seed ?? 3); let inner = rect(0, 0, bw * 4, bh * 4, mortar);
  for (let j = 0; j < 4; j++) for (let i = -1; i < 4; i++) { const off = j % 2 ? bw / 2 : 0; const c = mix(base, o.alt || lighten(base, 0.15), rnd()); inner += rect(i * bw + off + 1, j * bh + 1, bw - 2, bh - 2, c, { rx: 1 }); }
  return pattern(name, bw * 4, bh * 4, inner);
}

// =============================================================================
// Front-elevation modern house (new vs old state share the same massing)
// local coordinate system: 520 wide x 360 tall, origin top-left
// =============================================================================
function facade(x, y, k, style = 'new', o = {}) {
  const old = style === 'old';
  const T_ = (inner) => g(inner, { tf: `translate(${r1(x)} ${r1(y)}) scale(${k})` });
  reseed(o.seed ?? 5);
  let s = '';
  const plaster = old ? '#cdbf9e' : '#f4efe6';
  const plaster2 = old ? '#b9a982' : '#e6dfcf';
  // ground shadow
  s += shadowEll(260, 358, 300, 14, old ? 0.25 : 0.3, 8);
  // boundary wall / garden strip
  // --- ground floor
  s += rect(0, 210, 520, 148, old ? vgrad('#cfc2a2', '#b5a784') : vgrad('#f7f3ea', '#e7dfcf'));
  // stone cladding (left)
  const stoneBase = old ? '#9b8b6c' : '#b9ad98';
  s += rect(0, 210, 160, 148, tilePatStone(old));
  // ground windows
  if (!old) { s += winEl(278, 240, 190, 90, { cols: 3, frame: '#1d2127', tint: '#9fc4d8', sillCol: '#fff' }); }
  else { s += rect(276, 238, 194, 94, '#4a3f32'); s += rect(280, 242, 186, 86, '#6c7a80'); s += rect(280, 242, 60, 86, '#7d8a8f'); for (let i = 1; i < 3; i++) s += rect(280 + i * 62 - 2, 242, 4, 86, '#4a3f32'); s += rect(270, 334, 206, 8, '#a89d86'); s += poly([[388, 242], [420, 242], [404, 300], [386, 276]], '#9aa7ab', { op: 0.7 }); s += pline([[388, 242], [398, 270], [392, 290], [406, 306]], '#2b2f36', 1.5); s += rect(280, 242, 186, 86, 'none', { stroke: '#2b2f36', sw: 1 }); }
  // entrance door
  if (!old) {
    s += rect(176, 238, 72, 120, '#1d2127', { rx: 2 }) + rect(180, 242, 64, 116, lin('door', [[0, '#7a4e2f'], [1, '#5a3722']], [0, 0, 1, 0]));
    for (let i = 0; i < 7; i++) s += rect(184 + i * 8, 244, 3.5, 112, '#a77450', { op: 0.35 });
    s += rect(181, 242, 14, 112, '#9fc4d8', { op: 0.9 }) + rect(232, 292, 4, 36, C.brass, { rx: 2 });
    s += rect(172, 230, 80, 8, '#1d2127', { rx: 2 }) + rect(180, 238, 64, 3, '#ffe9ad', { op: 0.95 });
    s += ellipse(212, 245, 70, 18, radial('porch', [[0, '#ffe3a8', 0.5], [1, '#ffe3a8', 0]]), { style: 'mix-blend-mode:screen' });
  } else {
    s += rect(176, 238, 72, 120, '#3c2f23', { rx: 1 }) + rect(182, 244, 60, 114, '#6b4a2e');
    for (let i = 0; i < 4; i++) s += rect(190 + i * 13, 250, 8, 100, '#59391f', { op: 0.7 });
    s += rect(182, 244, 60, 114, 'none', { stroke: '#3c2f23', sw: 2 }) + rect(232, 296, 4, 20, '#8a7a4a', { rx: 2 });
    s += path_('M182 244L242 244L182 262Z', '#d9cdb0', { op: 0.5 });
  }
  // steps
  s += rect(168, 350, 88, 8, old ? '#8f8777' : '#d9d2c2') + rect(172, 344, 80, 6, old ? '#9d9585' : '#e6e0d2');
  // --- slab between floors (cantilever)
  s += rect(-6, 202, 536, 14, old ? '#a69a7f' : '#fbf8f1') + rect(-6, 214, 536, 4, old ? '#6b6150' : '#cfc7b4');
  // --- first floor
  s += rect(18, 60, 484, 142, old ? vgrad('#cfc2a2', '#b8aa86') : vgrad('#f9f5ec', '#ebe4d4'));
  // wood slat panel
  if (!old) {
    s += rect(18, 60, 140, 142, '#6d4529');
    for (let i = 0; i < 17; i++) s += rect(20 + i * 8.1, 60, 5.4, 142, mix(C.woodL, C.wood, (i * 37 % 10) / 10));
    s += rect(18, 60, 140, 142, lin('slatsh', [[0, '#000', 0.12], [0.5, '#000', 0], [1, '#000', 0.2]], [0, 0, 1, 0]));
    s += rect(22, 186, 132, 3, '#ffe3b0', { op: 0.9 }) + rect(22, 184, 132, 7, '#ffe3b0', { op: 0.3, filter: blur(3) });
  } else {
    s += rect(18, 60, 140, 142, '#a4967a');
    for (let i = 0; i < 17; i++) s += rect(20 + i * 8.1, 60, 5.4, 142, mix('#8a6f50', '#6d5a40', (i * 37 % 10) / 10));
    for (let i = 0; i < 6; i++) s += rect(20 + (i * 53) % 130, 60 + (i * 31) % 100, 10, 40, '#4e3f2c', { op: 0.5 });
    s += path_('M18 60L158 60L158 90L90 110Z', '#c9bd9f', { op: 0.45 });
  }
  // large window first floor
  if (!old) {
    s += winEl(176, 80, 300, 100, { cols: 4, frame: '#1d2127', tint: '#a9d0e4', sillCol: '#fff', sill: false });
    // glass balcony railing
    s += rect(172, 156, 312, 26, '#cfe5ee', { op: 0.5, stroke: '#1d2127', sw: 2 }) + rect(170, 152, 316, 4, '#1d2127') + rect(170, 180, 316, 5, '#1d2127');
    for (let i = 0; i < 7; i++) s += rect(172 + i * 52, 156, 2, 26, '#1d2127');
  } else {
    s += rect(174, 78, 304, 104, '#3b3226');
    for (let i = 0; i < 4; i++) s += rect(178 + i * 75, 82, 71, 96, i === 2 ? '#8e9ba0' : '#6c7a80');
    s += poly([[330, 82], [398, 82], [366, 178], [330, 150]], '#a8b3b6', { op: 0.55 });
    s += pline([[330, 82], [344, 118], [334, 140], [352, 178]], '#2b2f36', 1.6); s += pline([[344, 118], [366, 124]], '#2b2f36', 1.2);
    // rusty railing
    s += rect(170, 152, 316, 4, '#6f3a24'); s += rect(170, 180, 316, 5, '#6f3a24');
    for (let i = 0; i < 26; i++) s += rect(174 + i * 12.2, 156, 2.6, 24, '#8a4a2e');
    s += rect(176, 160, 60, 4, '#a45c36', { op: 0.6 });
    // AC unit
    s += rect(60, 108, 56, 34, '#cfcab9', { stroke: '#8f897a', sw: 1 }) + rect(64, 118, 48, 3, '#8f897a') + rect(64, 126, 48, 3, '#8f897a') + path_('M88 142q-6 26 -2 46', 'none', { stroke: '#6b6354', sw: 2, op: 0.7 });
  }
  // roof slab
  s += rect(8, 48, 504, 14, old ? '#9c917a' : '#fbf8f1') + rect(8, 60, 504, 4, old ? '#5e5546' : '#cfc7b4');
  if (!old) s += rect(8, 62, 504, 2, '#ffe3b0', { op: 0.9 });
  // parapet + water tank
  s += rect(26, 30, 468, 20, old ? '#b5a888' : '#f1ebdd') + rect(26, 28, 468, 4, old ? '#8a7f68' : '#e0d8c6');
  if (!old) {
    s += rect(60, 16, 70, 14, '#27496d', { rx: 2 }) + rect(60, 16, 70, 4, '#35618e', { rx: 2 });
    for (let i = 0; i < 6; i++) s += rect(150 + i * 10, 14, 6, 16, '#cfc7b4', { op: 0 });
  } else {
    s += rect(70, 6, 52, 26, '#2b2f36', { rx: 3 }) + ellipse(96, 6, 26, 5, '#454b56') + rect(70, 24, 52, 4, '#1a1d22');
    s += pline([[300, 30], [306, 10], [312, 30]], '#6b6354', 2) + line(300, 18, 312, 18, '#6b6354', 1.5);
    s += path_('M26 32L494 32', 'none', { stroke: '#40392d', sw: 1 });
  }
  // old-only: stains, cracks, peeling, wires
  if (old) {
    // water-stain streaks
    for (const [sx, sy, sw, sh] of [[22, 202, 14, 80], [176, 202, 10, 60], [300, 202, 18, 70], [440, 182, 12, 50], [100, 60, 12, 60], [250, 64, 12, 18], [470, 64, 16, 90], [20, 210, 22, 120], [460, 210, 28, 120]])
      s += rect(sx, sy, sw, sh, lin('stn' + sx, [[0, '#5a4a30', 0.4], [1, '#5a4a30', 0]], [0, 0, 0, 1]), { rx: 4 });
    // cracks
    s += pline([[250, 62], [254, 78], [248, 92], [256, 108], [250, 126]], '#3d3426', 1.8) + pline([[500, 100], [488, 110], [492, 124], [480, 136]], '#3d3426', 1.5) + pline([[262, 214], [258, 232], [266, 246], [260, 262]], '#3d3426', 1.6) + pline([[18, 240], [34, 250], [30, 270], [46, 282]], '#3d3426', 1.6);
    // peeling plaster patches exposing brick
    const brk = brickPat('oldbrick', 14, 7, '#a65a3a', '#b8a888', { seed: 9 });
    s += poly([[420, 214], [470, 214], [476, 236], [458, 250], [430, 246], [418, 232]], brk) + poly([[420, 214], [470, 214], [476, 236], [458, 250], [430, 246], [418, 232]], 'none', { stroke: '#7d6f55', sw: 1.5 });
    s += poly([[30, 150], [62, 146], [70, 170], [50, 188], [28, 176]], brk) + poly([[30, 150], [62, 146], [70, 170], [50, 188], [28, 176]], 'none', { stroke: '#7d6f55', sw: 1.5 });
    // exposed wires
    s += path_('M0 120Q100 150 180 128T330 134T520 112', 'none', { stroke: '#1d2127', sw: 1.6 }) + path_('M0 128Q110 160 190 138T340 142T520 122', 'none', { stroke: '#1d2127', sw: 1.2 });
    s += rect(110, 126, 14, 20, '#d6cfbd', { stroke: '#8f897a', sw: 1 });
    // mould at base
    s += rect(0, 330, 520, 28, lin('mould', [[0, '#3a4a30', 0], [1, '#3a4a30', 0.4]], [0, 0, 0, 1]));
    // rusty gate/grill on ground window
    for (let i = 0; i < 10; i++) s += rect(284 + i * 19, 238, 3, 100, '#6f3a24', { op: 0.9 });
    s += rect(276, 270, 194, 3, '#6f3a24');
  } else {
    // new: planters, bushes, wall lights
    for (const [px, pw] of [[0, 150], [262, 60]]) { s += rect(px + 4, 340, pw - 8, 18, '#2b2f36', { rx: 2 }); }
    for (let i = 0; i < 9; i++) s += circle(10 + i * 16, 336 - (i % 3) * 3, 11, mix(C.leafD, C.leafL, (i % 4) / 4));
    s += circle(268, 332, 12, C.leaf) + circle(282, 328, 14, C.leafL) + circle(298, 332, 12, C.leaf);
    for (const lx of [260, 500]) s += rect(lx - 3, 232, 6, 12, '#1d2127') + ellipse(lx, 250, 18, 14, radial('wl' + lx, [[0, '#ffe3a8', 0.5], [1, '#ffe3a8', 0]]), { style: 'mix-blend-mode:screen' });
  }
  // stone cladding texture is drawn inside tilePatStone
  return T_(s);
}
function tilePatStone(old) {
  const base = old ? '#9b8b6c' : '#c7bba5';
  reseed(12); let inner = rect(0, 0, 80, 40, old ? '#6e6350' : '#9a8f7a');
  for (let j = 0; j < 4; j++) { let xx = j % 2 ? -14 : 0; while (xx < 80) { const w = 22 + rnd() * 16; inner += rect(xx + 1, j * 10 + 1, w - 2, 8, mix(base, old ? '#b0a283' : '#e2d9c6', rnd()), { rx: 1.5 }); xx += w; } }
  return pattern(old ? 'stoneO' : 'stoneN', 80, 40, inner);
}

// =============================================================================
// Isometric modern house (shared by several service scenes)
// =============================================================================
function isoHouse(ox, oy, s, o = {}) {
  const save = { ...ISO }; ISO.ox = ox; ISO.oy = oy; ISO.s = s;
  const wall = o.wall || '#f6f1e6', wood = o.wood || C.wood;
  let out = '';
  const A = { x: 0, y: 0, w: 9, d: 6, h: 3.2 };
  // ground floor
  out += isoBox(A.x, A.y, 0, A.w, A.d, A.h, { top: '#e9e2d2', left: wall, right: shade(wall, 0.2) });
  // terrace parapet (front-left on roof of A: x 0..3.4)
  out += isoT(A.h + 0.02, 0, 3.4, 0, 6, '#d9d1be');
  // upper floor box
  const B = { x: 3.4, y: 0, w: 5.6, d: 6, z: A.h, h: 3.1 };
  out += isoBox(B.x, B.y, B.z, B.w, B.d, B.h, { top: '#e3dccb', left: wall, right: shade(wall, 0.2) });
  // upper floor wood cladding band on left face (near x end)
  out += isoL(B.y + B.d, B.x, B.x + 1.3, B.z, B.z + B.h, wood);
  for (let i = 0; i < 9; i++) out += isoL(B.y + B.d, B.x + 0.1 + i * 0.14, B.x + 0.1 + i * 0.14 + 0.02, B.z, B.z + B.h, lighten(wood, 0.25), { op: 0.5 });
  // big upper window (left face) + (right face)
  const glass = lin('ihg', [[0, '#b5d6e8'], [1, '#6f9bb8']], [0, 0, 1, 1]);
  const glassR = lin('ihgr', [[0, '#7fa7c2'], [1, '#476b88']], [0, 0, 1, 1]);
  out += isoL(B.y + B.d, B.x + 1.7, B.x + B.w - 0.4, B.z + 0.5, B.z + 2.5, '#1d2127');
  out += isoL(B.y + B.d, B.x + 1.78, B.x + B.w - 0.48, B.z + 0.58, B.z + 2.42, glass);
  for (let i = 1; i < 4; i++) { const xx = B.x + 1.78 + (B.w - 2.26) * i / 4; out += isoL(B.y + B.d, xx - 0.03, xx + 0.03, B.z + 0.58, B.z + 2.42, '#1d2127'); }
  out += isoR(B.x + B.w, 1.0, 5.0, B.z + 0.5, B.z + 2.5, '#1d2127') + isoR(B.x + B.w, 1.08, 4.92, B.z + 0.58, B.z + 2.42, glassR);
  out += isoR(B.x + B.w, 3.0 - 0.03, 3.0 + 0.03, B.z + 0.58, B.z + 2.42, '#1d2127');
  // reflections
  out += isoPoly([[B.x + 2.2, B.y + B.d, B.z + 0.58], [B.x + 3.0, B.y + B.d, B.z + 0.58], [B.x + 3.9, B.y + B.d, B.z + 2.42], [B.x + 3.1, B.y + B.d, B.z + 2.42]], '#fff', { op: 0.25 });
  // roof slab (overhang)
  out += isoBox(B.x - 0.3, B.y - 0.3, B.z + B.h, B.w + 0.7, B.d + 0.6, 0.35, { top: '#cfc7b4', left: '#fbf8f1', right: '#dcd5c3' });
  out += isoBox(B.x + 0.6, B.y + 1.0, B.z + B.h + 0.35, 1.3, 1.2, 0.8, { top: '#3d6590', left: '#27496d', right: '#1c3856' });
  out += isoBox(B.x + 3.0, B.y + 3.4, B.z + B.h + 0.35, 1.8, 1.2, 0.15, { top: '#27496d', left: '#1c3856', right: '#15293f' });
  // ground floor details (left face y = 6)
  out += isoL(A.d, 3.6, 6.5, 0.3, 2.8, '#1d2127') + isoL(A.d, 3.68, 6.42, 0.38, 2.72, glass);
  out += isoL(A.d, 5.05 - 0.03, 5.05 + 0.03, 0.38, 2.72, '#1d2127');
  out += isoPoly([[3.9, A.d, 0.38], [4.5, A.d, 0.38], [5.3, A.d, 2.72], [4.7, A.d, 2.72]], '#fff', { op: 0.25 });
  // entrance door
  out += isoL(A.d, 7.2, 8.4, 0.0, 2.6, '#1d2127') + isoL(A.d, 7.28, 8.32, 0.0, 2.55, lin('idoor', [[0, '#8a5a38'], [1, '#5a3722']], [0, 0, 1, 0]));
  for (let i = 0; i < 4; i++) out += isoL(A.d, 7.4 + i * 0.22, 7.42 + i * 0.22, 0.05, 2.5, '#b98558', { op: 0.5 });
  out += isoL(A.d, 8.05, 8.12, 1.0, 1.5, C.brass);
  // canopy
  out += isoBox(6.9, A.d - 0.2, 2.65, 1.9, 1.0, 0.18, { top: '#cfc7b4', left: '#1d2127', right: '#2b2f36' });
  // right face windows (ground)
  out += isoR(A.x + A.w, 1.2, 4.8, 0.7, 2.5, '#1d2127') + isoR(A.x + A.w, 1.28, 4.72, 0.78, 2.42, glassR) + isoR(A.x + A.w, 3.0 - 0.03, 3.0 + 0.03, 0.78, 2.42, '#1d2127');
  // stone plinth on left face start
  out += isoL(A.d, 0, 3.4, 0, 3.2, '#bdb09a');
  for (let j = 0; j < 7; j++) for (let i = 0; i < 6; i++) out += isoL(A.d, i * 0.57 + (j % 2) * 0.28, i * 0.57 + 0.5 + (j % 2) * 0.28, j * 0.45 + 0.03, j * 0.45 + 0.4, mix('#cabda5', '#a79a82', ((i * 7 + j * 3) % 5) / 5), { op: 0.9 });
  out += isoL(A.d, 0, 3.4, 3.1, 3.2, '#fbf8f1');
  // terrace glass railing
  out += isoPoly([[0, A.d, A.h], [3.4, A.d, A.h], [3.4, A.d, A.h + 0.95], [0, A.d, A.h + 0.95]], '#cfe5ee', { op: 0.4, stroke: '#1d2127', sw: 1.2 });
  out += isoPoly([[0, 0, A.h], [0, A.d, A.h], [0, A.d, A.h + 0.95], [0, 0, A.h + 0.95]], '#cfe5ee', { op: 0.3, stroke: '#1d2127', sw: 1.2 });
  // plants on terrace
  out += isoBox(0.4, 4.6, A.h, 0.9, 0.6, 0.35, '#2b2f36');
  for (let i = 0; i < 3; i++) { const [px, py] = isoP(0.85, 4.9, A.h + 0.35); out += circle(px + (i - 1) * 7, py - 6 - (i % 2) * 4, 8 * s / 22, mix(C.leafD, C.leafL, i / 3)); }
  ISO.ox = save.ox; ISO.oy = save.oy; ISO.s = save.s;
  return out;
}

// =============================================================================
// 6. svc-new-home
// =============================================================================
function svcNewHome() {
  begin('snh');
  add(svcBg({ r: 350, cy: 450 }));
  ISO.ox = 566; ISO.oy = 325; ISO.s = 26;
  const PW = 14.5, PD = 11;
  // plot slab
  add(shadowPoly([isoP(0, 0, 0), isoP(PW, 0, 0), isoP(PW + 1, PD + 1, 0), isoP(-1, PD + 1, 0)].map((p) => [p[0] + 8, p[1] + 26]), 0.3, 12));
  add(isoBox(0, 0, -0.7, PW, PD, 0.7, { top: '#a9bf88', left: '#8a6a4a', right: '#6b4f36' }, { topFill: lin('lawn', [[0, '#b6c995'], [1, '#93b176']], [0, 0, 1, 1]) }));
  // lawn stripes
  for (let i = 0; i < 7; i++) add(isoT(0.01, 0, PW, 0.2 + i * 1.6, 0.2 + i * 1.6 + 0.8, '#fff', { op: 0.07 }));
  // driveway & path
  add(isoT(0.02, 8.3, 10.6, 6.5, PD, '#cfc3a8'));
  add(isoT(0.03, 2.5, 8.3, 8.8, 9.9, '#d6ccb4'));
  for (let i = 0; i < 6; i++) add(isoT(0.04, 8.45, 10.45, 6.7 + i * 0.7, 6.7 + i * 0.7 + 0.05, '#a89d82', { op: 0.7 }));
  for (let i = 0; i < 4; i++) add(isoT(0.04, 7.2 + i * 0.01, 8.4, 6.1 + i * 0.62, 6.1 + i * 0.62 + 0.45, '#e2d9c3'));
  // plot boundary outline (dashed brass), drawn on the ground
  const m = 0.45; const pts = [[m, m, 0.03], [PW - m, m, 0.03], [PW - m, PD - m, 0.03], [m, PD - m, 0.03]];
  const stake = (x, y) => {
    const [px, py] = isoP(x, y, 0.03);
    return ellipse(px, py + 1, 8, 3, '#000', { op: 0.25, filter: blur(2) }) + rect(px - 2.5, py - 46, 5, 46, lin('stk', [[0, '#d9b57e'], [1, '#a8814e']], [0, 0, 1, 0])) + poly([[px - 2.5, py - 46], [px + 2.5, py - 46], [px, py - 51]], '#d9b57e') + rect(px - 3, py - 40, 6, 12, '#e5602a') + path_(`M${r1(px + 2.5)} ${r1(py - 38)}q16 -4 22 4q-14 2 -22 10z`, '#e5602a');
  };
  const str = (a, b) => { const p = isoP(a[0], a[1], 1.45), q = isoP(b[0], b[1], 1.45); return line(p[0], p[1], q[0], q[1], '#f4efe6', 1.2, { op: 0.9 }); };
  add(poly(pts.map((p) => isoP(...p)), 'none', { stroke: C.brass, sw: 3, da: '12 8', lj: 'round', op: 0.95 }));
  add(stake(m, m), str([m, m], [PW - m, m]), str([m, m], [m, PD - m]), stake(PW - m, m), stake(m, PD - m));
  // house
  { const [hx, hy] = isoP(2.3, 1.6, 0); add(isoHouse(hx, hy, ISO.s)); }
  add(str([PW - m, m], [PW - m, PD - m]), str([m, PD - m], [PW - m, PD - m]), stake(PW - m, PD - m));
  // trees / landscaping
  for (const [x, y, sc] of [[12.8, 1.6, 1], [13.2, 8.6, 0.8], [1.2, 9.8, 0.8]]) { const [px, py] = isoP(x, y, 0); add(roundTree(px, py, 0.7 * sc, C.leaf)); }
  { const [px, py] = isoP(12.2, 5.2, 0); add(palmTree(px, py, 130, 0.9)); }
  for (const [x, y] of [[2.0, 7.4], [2.5, 7.9], [7.0, 7.2], [9.0, 7.0]]) { const [px, py] = isoP(x, y, 0); add(circle(px, py - 6, 10, mix(C.leafD, C.leafL, 0.4)), circle(px + 6, py - 10, 8, C.leafL)); }
  // surveyor tripod (bottom-left)
  { const tx = 300, ty = 770;
    add(shadowEll(tx, ty + 6, 60, 10, 0.3, 6));
    for (const [dx, dy] of [[-48, 4], [0, 14], [48, 4]]) add(line(tx, ty - 120, tx + dx, ty + dy, '#9c7a4e', 7, { lc: 'round' }), line(tx, ty - 120, tx + dx, ty + dy, '#c9a678', 2, { lc: 'round', op: 0.6 }));
    add(rect(tx - 20, ty - 138, 40, 20, '#3a3f48', { rx: 4 }), rrect(tx - 16, ty - 190, 32, 56, 8, lin('thd', [[0, '#e8b84a'], [1, '#b8862a']], [0, 0, 1, 0]), { stroke: '#7a5a1a', sw: 1.5 }), circle(tx, ty - 168, 9, '#1d2127'), circle(tx, ty - 168, 5, '#6fa0c0'), rect(tx - 24, ty - 186, 48, 8, '#3a3f48', { rx: 3 }), circle(tx + 13, ty - 150, 4, '#e5602a')); }
  // blueprint roll + sheet (bottom-right)
  { const bx = 960, by = 720;
    add(shadowPoly([[bx - 160, by + 60], [bx + 90, by + 40], [bx + 110, by + 100], [bx - 140, by + 120]], 0.3, 10));
    add(poly([[bx - 170, by + 20], [bx + 70, by], [bx + 90, by + 90], [bx - 150, by + 110]], vgrad('#2f5d8f', '#1d4672'), { stroke: '#102c4a', sw: 1.2 }));
    // plan lines
    add(poly([[bx - 120, by + 35], [bx + 30, by + 22], [bx + 42, by + 78], [bx - 108, by + 90]], 'none', { stroke: '#d9ecf8', sw: 2.2 }));
    add(poly([[bx - 108, by + 50], [bx - 40, by + 44], [bx - 34, by + 70], [bx - 100, by + 76]], 'none', { stroke: '#d9ecf8', sw: 1.4 }));
    add(line(bx - 40, by + 44, bx + 20, by + 38, '#d9ecf8', 1.4), line(bx - 70, by + 76, bx - 64, by + 90, '#d9ecf8', 1.4));
    for (let i = 0; i < 6; i++) add(line(bx - 150 + i * 6, by + 110 - i * 3 - 8, bx - 140 + i * 6, by + 96 - i * 3 - 8, '#d9ecf8', 0.8, { op: 0.4 }));
    // the roll
    add(rect(bx - 205, by - 16, 70, 130, hgrad('#e9f1f6', '#9fb8c8'), { rx: 6, tf: `rotate(-6 ${bx - 170} ${by + 50})` }));
    add(ellipse(bx - 205, by + 49, 14, 66, '#dbe7ee', { tf: `rotate(-6 ${bx - 205} ${by + 49})`, stroke: '#7d97a8', sw: 1.2 }));
    add(g(ellipse(bx - 205, by + 49, 8, 40, 'none', { stroke: '#8fa9ba', sw: 1.4 }) + ellipse(bx - 205, by + 49, 3, 18, 'none', { stroke: '#8fa9ba', sw: 1.2 }), { tf: `rotate(-6 ${bx - 205} ${by + 49})` }));
    add(rect(bx - 190, by + 6, 6, 98, C.brass, { tf: `rotate(-6 ${bx - 170} ${by + 50})`, op: 0.95 }));
  }
  finish('svc-new-home.svg', 'New home construction', 'Illustration of a newly built modern house on a surveyed plot with a dashed brass boundary, marker stakes, a surveyor tripod and a blueprint roll.');
}

// =============================================================================
// apartment block / townhouse (front elevation)
// =============================================================================
function aptBlock(x, y, w, floors, o = {}) {
  const fh = o.fh ?? 76; const col = o.col || '#eadfc6'; const acc = o.acc || C.navy2;
  const H = floors * fh + (o.ground ?? 70); const top = y - H;
  let s = '';
  s += shadowEll(x + w / 2, y + 2, w * 0.58, 8, 0.28, 6);
  // body
  s += rect(x, top, w, H, vgrad(lighten(col, 0.12), shade(col, 0.08)));
  // side shading
  s += rect(x, top, w * 0.06, H, '#000', { op: 0.06 }) + rect(x + w * 0.94, top, w * 0.06, H, '#000', { op: 0.12 });
  // roof parapet
  s += rect(x - 5, top - 14, w + 10, 14, lighten(col, 0.25)) + rect(x - 5, top - 3, w + 10, 3, shade(col, 0.2));
  s += rect(x - 5, top - 1, w + 10, 1.6, '#ffe3b0', { op: 0.9 });
  // rooftop tanks & mumty
  if (o.tanks !== false) {
    const tx = x + w * 0.15; s += rect(tx, top - 40, 36, 26, '#2b2f36', { rx: 4 }) + ellipse(tx + 18, top - 40, 18, 4, '#454b56') + rect(tx + 4, top - 14, 4, 6, '#5a616c') + rect(tx + 28, top - 14, 4, 6, '#5a616c');
    s += rect(x + w * 0.55, top - 34, 48, 20, shade(col, 0.1)) + rect(x + w * 0.55, top - 36, 48, 3, lighten(col, 0.3));
  }
  // ground floor
  const gy = y - (o.ground ?? 70);
  s += rect(x, gy, w, (o.ground ?? 70), vgrad(shade(acc, 0.0), shade(acc, 0.25)));
  // lobby
  const lw = Math.min(90, w * 0.3); const lx = x + w / 2 - lw / 2;
  s += rect(lx, gy + 12, lw, (o.ground ?? 70) - 12, '#12202f') + rect(lx + 4, gy + 16, lw - 8, (o.ground ?? 70) - 16, lin('lob' + x, [[0, '#ffe7b8'], [1, '#e1a96a']], [0, 0, 0, 1])) + rect(lx + lw / 2 - 1.2, gy + 16, 2.4, (o.ground ?? 70) - 16, '#12202f');
  s += rect(lx - 14, gy + 4, lw + 28, 8, C.brass) + rect(lx - 14, gy + 10, lw + 28, 3, '#0a1424', { op: 0.35 });
  s += ellipse(lx + lw / 2, gy + 40, lw * 0.9, 34, radial('lbg' + x, [[0, '#ffe3a8', 0.4], [1, '#ffe3a8', 0]]), { style: 'mix-blend-mode:screen' });
  // shop/garage side bays
  const bayW = (w - lw - 28) / 2 - 14;
  for (const bx of [x + 10, x + w - 10 - bayW]) { s += rect(bx, gy + 18, bayW, (o.ground ?? 70) - 18, lin('bay', [[0, '#9fc4d8'], [1, '#5f8aa4']], [0, 0, 1, 1])) + rect(bx + bayW / 2 - 1, gy + 18, 2, (o.ground ?? 70) - 18, '#1d2127') + poly([[bx, gy + 18 + 50], [bx + bayW * 0.4, gy + 18], [bx + bayW * 0.6, gy + 18], [bx + bayW * 0.2, gy + 18 + 50]], '#fff', { op: 0.18 }); }
  // floors
  for (let f = 0; f < floors; f++) {
    const fy = gy - (f + 1) * fh;
    s += rect(x - 2, fy + fh - 5, w + 4, 6, lighten(col, 0.3)) + rect(x - 2, fy + fh + 1, w + 4, 2, shade(col, 0.2), { op: 0.6 });
    const units = Math.max(2, Math.round(w / 110));
    const uw = w / units;
    for (let u = 0; u < units; u++) {
      const ux = x + u * uw;
      // balcony on alternating units
      if ((u + f) % 2 === 0 || units === 2) {
        s += rect(ux + uw * 0.1, fy + 10, uw * 0.8, fh - 20, '#12202f', { rx: 1 }) + rect(ux + uw * 0.12, fy + 12, uw * 0.76, fh - 24, lin('bw' + f, [[0, '#a9cbdf'], [1, '#6a94ae']], [0, 0, 1, 1]));
        s += rect(ux + uw * 0.5 - 1, fy + 12, 2, fh - 24, '#12202f') + poly([[ux + uw * 0.12, fy + fh - 12], [ux + uw * 0.35, fy + 12], [ux + uw * 0.5, fy + 12], [ux + uw * 0.27, fy + fh - 12]], '#fff', { op: 0.2 });
        s += rect(ux + uw * 0.04, fy + fh - 28, uw * 0.92, 24, '#cfe5ee', { op: 0.45, stroke: '#1d2127', sw: 1.2 }) + rect(ux + uw * 0.04, fy + fh - 30, uw * 0.92, 3, '#1d2127');
        // plant on balcony
        if ((u + f) % 3 === 0) s += circle(ux + uw * 0.2, fy + fh - 31, 7, C.leaf) + circle(ux + uw * 0.26, fy + fh - 36, 6, C.leafL);
      } else {
        s += rect(ux + uw * 0.22, fy + 14, uw * 0.56, fh - 34, '#12202f', { rx: 1 }) + rect(ux + uw * 0.25, fy + 17, uw * 0.5, fh - 40, lin('ww' + f, [[0, '#a9cbdf'], [1, '#6a94ae']], [0, 0, 1, 1]));
        s += rect(ux + uw * 0.5 - 1, fy + 17, 2, fh - 40, '#12202f') + rect(ux + uw * 0.2, fy + fh - 20, uw * 0.6, 5, C.white);
        if ((f + u) % 3 === 1) s += rect(ux + uw * 0.3, fy + fh - 17, uw * 0.4, 12, '#d6d2c4', { stroke: '#9a9686', sw: 1, rx: 1 });
      }
      // pilaster
      s += rect(ux - 2, fy, 4, fh, shade(col, 0.1), { op: 0.7 });
    }
  }
  // side feature band
  s += rect(x + w - 24, top, 14, H - (o.ground ?? 70), acc, { op: 0.9 });
  for (let f = 0; f < floors * 2; f++) s += rect(x + w - 24, top + 14 + f * fh / 2, 14, 3, C.brass, { op: 0.8 });
  return s;
}
function townhouse(x, y, w, h, col, door, o = {}) {
  let s = shadowEll(x + w / 2, y + 2, w * 0.6, 6, 0.25, 4);
  s += rect(x, y - h, w, h, vgrad(lighten(col, 0.1), shade(col, 0.1)));
  s += rect(x - 4, y - h - 10, w + 8, 10, lighten(col, 0.28)) + rect(x - 4, y - h - 2, w + 8, 2.4, '#ffe3b0', { op: 0.85 });
  // first floor window + balcony
  s += rect(x + w * 0.14, y - h + 18, w * 0.72, h * 0.3, '#12202f', { rx: 1 }) + rect(x + w * 0.17, y - h + 21, w * 0.66, h * 0.3 - 6, lin('th' + x, [[0, '#a9cbdf'], [1, '#6a94ae']], [0, 0, 1, 1]));
  s += rect(x + w * 0.5 - 1, y - h + 21, 2, h * 0.3 - 6, '#12202f') + rect(x + w * 0.1, y - h + 18 + h * 0.3, w * 0.8, 6, C.white);
  s += rect(x + w * 0.08, y - h + 18 + h * 0.3 - 12, w * 0.84, 14, 'none', { stroke: '#1d2127', sw: 1.4 });
  // ground: door & gate
  s += rect(x + w * 0.12, y - h * 0.4, w * 0.32, h * 0.4, door) + rect(x + w * 0.12, y - h * 0.4, w * 0.32, 3, shade(door, 0.4));
  for (let i = 1; i < 4; i++) s += rect(x + w * 0.12 + i * w * 0.08, y - h * 0.4, 1.4, h * 0.4, shade(door, 0.3), { op: 0.5 });
  s += rect(x + w * 0.38, y - h * 0.2, 3, 8, C.brass, { rx: 1.5 });
  s += rect(x + w * 0.54, y - h * 0.34, w * 0.34, h * 0.14, '#12202f', { rx: 1 }) + rect(x + w * 0.56, y - h * 0.32, w * 0.3, h * 0.1, lin('tw', [[0, '#a9cbdf'], [1, '#6a94ae']], [0, 0, 1, 1]));
  s += rect(x + w * 0.1, y - h * 0.4 - 6, w * 0.36, 6, '#1d2127');
  s += ellipse(x + w * 0.28, y - h * 0.4 - 12, 12, 8, radial('tl' + x, [[0, '#ffe3a8', 0.5], [1, '#ffe3a8', 0]]), { style: 'mix-blend-mode:screen' });
  return s;
}

// =============================================================================
// 7. svc-residential-building
// =============================================================================
function svcResidential() {
  begin('srb');
  add(svcBg({ mode: 'navy', r: 360, cy: 450, flip: true, ground: false }));
  // framed street scene card
  const cx0 = 110, cy0 = 150, cw = 980, ch = 600;
  const clip = clipDef('card', rrect(cx0, cy0, cw, ch, 28, '#000'));
  add(rrect(cx0 - 4, cy0 - 4, cw + 8, ch + 8, 32, 'none', { stroke: C.brass, sw: 3 }));
  add(shadowPoly([[cx0 + 10, cy0 + 24], [cx0 + cw + 10, cy0 + 24], [cx0 + cw + 10, cy0 + ch + 24], [cx0 + 10, cy0 + ch + 24]], 0.4, 16));
  let sc = '';
  const groundY = 668;
  sc += rect(cx0, cy0, cw, ch, lin('sky', [[0, '#bfd9e8'], [0.6, '#e8eee9'], [1, '#f8e8cf']], [0, 0, 0, 1]));
  sc += circle(930, 270, 120, radial('sun', [[0, '#fff3cf', 0.95], [1, '#fff3cf', 0]]));
  sc += circle(930, 270, 36, '#fff6dc');
  sc += cloud(300, 220, 1.2, 0.85) + cloud(640, 190, 0.9, 0.8) + cloud(820, 330, 0.8, 0.7);
  // far skyline silhouettes
  reseed(41);
  for (let i = 0; i < 18; i++) { const bx = cx0 + i * 56 + rr(-10, 10), bw = rr(36, 60), bh = rr(110, 250); sc += rect(bx, groundY - bh, bw, bh, '#8aa4b8', { op: 0.38 }); for (let j = 0; j < Math.floor(bh / 26); j++) sc += rect(bx + 6, groundY - bh + 8 + j * 26, bw - 12, 4, '#fff', { op: 0.18 }); }
  // far trees line
  for (let i = 0; i < 20; i++) sc += circle(cx0 + 20 + i * 50, groundY - 18, 28, '#7c9a78', { op: 0.65 });
  // buildings
  sc += aptBlock(380, groundY, 330, 4, { col: '#eadfc6', acc: '#1c3a5e' });
  sc += aptBlock(730, groundY, 260, 3, { col: '#d5dfe0', acc: '#27496d', tanks: false });
  // right wing: boundary wall + gate
  // left townhouses
  sc += townhouse(135, groundY, 112, 190, '#c5ac84', '#6a4a2e');
  sc += townhouse(250, groundY, 112, 190, '#27496d', '#d9cdb0');
  // trees and street
  sc += roundTree(375, groundY - 6, 1.2, C.leaf) + roundTree(715, groundY - 6, 1.1, C.leafD) + roundTree(1010, groundY - 4, 1.0, C.leaf);
  // road
  sc += rect(cx0, groundY, cw, 90, vgrad('#4a5058', '#2b2f36'));
  sc += rect(cx0, groundY, cw, 10, '#cfc7b4') + rect(cx0, groundY + 10, cw, 3, '#8a8474');
  for (let i = 0; i < 9; i++) sc += rect(cx0 + 20 + i * 112, groundY + 56, 62, 5, '#f4efe6', { op: 0.85, rx: 2 });
  sc += carSide(600, groundY + 40, 0.9, '#e8e3d8');
  sc += carSide(930, groundY + 36, 0.8, '#27496d');
  sc += lampPost(300, groundY, 190);
  sc += lampPost(1050, groundY, 190);
  // foreground hedge
  for (let i = 0; i < 12; i++) sc += circle(cx0 + 20 + i * 86, groundY + 6, 16, mix(C.leafD, C.leaf, (i % 3) / 3));
  add(g(sc, { clip }));
  // glass sheen on card
  add(rrect(cx0, cy0, cw, ch, 28, 'none', { stroke: '#fff', sw: 1, op: 0.3 }));
  // small badge: building icon (brass circle)
  add(circle(1030, 175, 46, '#000', { op: 0.25, filter: blur(7) }), circle(1030, 170, 46, lin('rb', [[0, C.brassL], [1, C.brassD]], [0, 0, 1, 1])), circle(1030, 170, 39, C.navy));
  add(rect(1012, 150, 20, 40, C.cream, { rx: 2 }), rect(1030, 162, 18, 28, C.brassL, { rx: 2 }));
  for (let i = 0; i < 4; i++) add(rect(1016, 155 + i * 9, 5, 4, C.navy), rect(1024, 155 + i * 9, 5, 4, C.navy));
  finish('svc-residential-building.svg', 'Residential buildings', 'A street scene with a four-storey apartment block, a second residential block and a row of townhouses with trees, parked cars and street lights.');
}

// =============================================================================
// drafting helpers
// =============================================================================
function doorSwing(x, y, w, dir, o = {}) { // door in a horizontal wall at (x,y) opening width w; dir: 1 swing down, -1 swing up; hinge left
  const col = o.col || '#1b2a3d';
  return line(x, y, x + w, y, '#fbfaf6', 7) + line(x, y, x, y + dir * w, col, 1.4) + path_(`M${r1(x + w)} ${r1(y)}A${r1(w)} ${r1(w)} 0 0 ${dir > 0 ? 1 : 0} ${r1(x)} ${r1(y + dir * w)}`, 'none', { stroke: col, sw: 0.9, da: '3 2' });
}
function doorSwingV(x, y, h, dir, o = {}) { // vertical wall
  const col = o.col || '#1b2a3d';
  return line(x, y, x, y + h, '#fbfaf6', 7) + line(x, y, x + dir * h, y, col, 1.4) + path_(`M${r1(x)} ${r1(y + h)}A${r1(h)} ${r1(h)} 0 0 ${dir > 0 ? 0 : 1} ${r1(x + dir * h)} ${r1(y)}`, 'none', { stroke: col, sw: 0.9, da: '3 2' });
}
function planWin(x, y, w, horizontal = true) {
  return horizontal ? rect(x, y - 4, w, 8, '#fbfaf6') + line(x, y - 4, x + w, y - 4, '#1b2a3d', 1) + line(x, y + 4, x + w, y + 4, '#1b2a3d', 1) + line(x, y, x + w, y, '#4a90b8', 1.4) :
    rect(x - 4, y, 8, w, '#fbfaf6') + line(x - 4, y, x - 4, y + w, '#1b2a3d', 1) + line(x + 4, y, x + 4, y + w, '#1b2a3d', 1) + line(x, y, x, y + w, '#4a90b8', 1.4);
}
function dimLine(x1, y1, x2, y2, col = C.brassD, label = true) {
  const dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy); const nx = -dy / L, ny = dx / L;
  let s = line(x1, y1, x2, y2, col, 1) + line(x1 + nx * 6, y1 + ny * 6, x1 - nx * 6, y1 - ny * 6, col, 1) + line(x2 + nx * 6, y2 + ny * 6, x2 - nx * 6, y2 - ny * 6, col, 1);
  s += line(x1 + nx * 3 - dx / L * 4, y1 + ny * 3 - dy / L * 4, x1 - nx * 3 + dx / L * 4, y1 - ny * 3 + dy / L * 4, col, 1.6) + line(x2 + nx * 3 - dx / L * 4, y2 + ny * 3 - dy / L * 4, x2 - nx * 3 + dx / L * 4, y2 - ny * 3 + dy / L * 4, col, 1.6);
  if (label) { const mx = (x1 + x2) / 2, my = (y1 + y2) / 2; s += rect(mx - 14, my - 3, 28, 6, '#fbfaf6') + rect(mx - 10, my - 1.2, 20, 2.4, col, { rx: 1.2, op: 0.8 }); }
  return s;
}
function bedSym(x, y, w, h, col = '#c9d8e3') { // top-down bed
  return rect(x, y, w, h, '#fff', { stroke: '#1b2a3d', sw: 1.2, rx: 2 }) + rect(x + 2, y + 2, w - 4, h * 0.22, col, { rx: 3, stroke: '#1b2a3d', sw: 0.8 }) + rect(x + 2, y + h * 0.35, w - 4, h * 0.63, col, { rx: 2, op: 0.55 }) + line(x + 2, y + h * 0.35, x + w - 2, y + h * 0.35, '#1b2a3d', 0.8);
}
function sofaSym(x, y, w, h) { return rrect(x, y, w, h, 5, '#d7c8a4', { stroke: '#1b2a3d', sw: 1.2 }) + rrect(x + 3, y + 3, w - 6, h * 0.28, 3, '#bfae85', { stroke: '#1b2a3d', sw: 0.8 }) + line(x + w / 3, y + h * 0.3, x + w / 3, y + h - 3, '#1b2a3d', 0.7) + line(x + (2 * w) / 3, y + h * 0.3, x + (2 * w) / 3, y + h - 3, '#1b2a3d', 0.7); }

// =============================================================================
// 8. svc-design-planning
// =============================================================================
function svcDesign() {
  begin('sdp');
  add(svcBg({ r: 350, cy: 450 }));
  // wooden board shadow
  add(rrect(180, 150, 840, 600, 22, '#000', { op: 0.3, filter: blur(16), tf: 'translate(12 22) rotate(-2 600 450)' }));
  // drafting board (navy-green mat)
  add(g(rrect(165, 130, 870, 640, 24, lin('board', [[0, '#315b88'], [1, '#17304f']], [0, 0, 1, 1]), { stroke: C.brass, sw: 3 }), { tf: 'rotate(-2 600 450)' }));
  // main paper
  const px = 230, py = 170, pw = 740, ph = 560;
  let paper = '';
  paper += rect(px, py, pw, ph, vgrad('#fffdf8', '#f1ebdc'), { stroke: '#d9cfb6', sw: 1.2 });
  // faint grid
  for (let i = 1; i < pw / 20; i++) paper += line(px + i * 20, py, px + i * 20, py + ph, '#a9c1d6', i % 5 ? 0.4 : 0.9, { op: i % 5 ? 0.35 : 0.5 });
  for (let j = 1; j < ph / 20; j++) paper += line(px, py + j * 20, px + pw, py + j * 20, '#a9c1d6', j % 5 ? 0.4 : 0.9, { op: j % 5 ? 0.35 : 0.5 });
  // title block
  paper += rect(px + pw - 220, py + ph - 70, 200, 52, 'none', { stroke: '#1b2a3d', sw: 1.4 }) + line(px + pw - 220, py + ph - 44, px + pw - 20, py + ph - 44, '#1b2a3d', 1) + line(px + pw - 120, py + ph - 44, px + pw - 120, py + ph - 18, '#1b2a3d', 1);
  paper += textLines(px + pw - 212, py + ph - 62, 120, 2, '#1b2a3d', 3, 9) + textLines(px + pw - 212, py + ph - 36, 80, 2, '#1b2a3d', 2.5, 8, { op: 0.6 }) + textLines(px + pw - 112, py + ph - 36, 80, 2, '#1b2a3d', 2.5, 8, { op: 0.6 });
  paper += circle(px + pw - 40, py + ph - 100, 14, 'none', { stroke: '#1b2a3d', sw: 1.2 }) + path_(`M${px + pw - 40} ${py + ph - 114}L${px + pw - 34} ${py + ph - 100}L${px + pw - 40} ${py + ph - 104}L${px + pw - 46} ${py + ph - 100}Z`, '#1b2a3d');
  // PLAN (origin)
  const ox = px + 70, oy = py + 80;
  let plan = '';
  // room fills
  const fill = (x, y, w, h, c) => rect(ox + x, oy + y, w, h, c);
  plan += fill(0, 0, 250, 170, '#efe3c4') + fill(250, 0, 150, 170, '#e7dcc3') + fill(400, 0, 120, 170, '#dfe9e6') + fill(0, 205, 180, 165, '#f4ead0') + fill(180, 205, 90, 165, '#d6e6ee') + fill(270, 205, 130, 165, '#eee2c4') + fill(400, 205, 120, 165, '#eee2c4') + fill(0, 170, 520, 35, '#f6f2e8');
  // hatch tile in bath & kitchen
  for (let i = 0; i < 9; i++) plan += line(ox + 180 + i * 10, oy + 205, ox + 180 + i * 10, oy + 370, '#fff', 0.8, { op: 0.6 });
  // furniture
  plan += sofaSym(ox + 24, oy + 100, 120, 40) + sofaSym(ox + 20, oy + 28, 40, 80).replace('', '');
  plan += rect(ox + 80, oy + 62, 54, 28, '#fff', { stroke: '#1b2a3d', sw: 1, rx: 2 }); // coffee table
  plan += rect(ox + 180, oy + 18, 50, 8, '#222', { rx: 1 }); // tv
  plan += rect(ox + 262, oy + 56, 78, 46, '#fff', { stroke: '#1b2a3d', sw: 1.2, rx: 3 }); // dining table
  for (let i = 0; i < 3; i++) plan += rect(ox + 270 + i * 24, oy + 40, 16, 12, '#d7c8a4', { stroke: '#1b2a3d', sw: 0.8, rx: 3 }) + rect(ox + 270 + i * 24, oy + 106, 16, 12, '#d7c8a4', { stroke: '#1b2a3d', sw: 0.8, rx: 3 });
  // kitchen counters L
  plan += rect(ox + 404, oy + 8, 108, 20, '#fff', { stroke: '#1b2a3d', sw: 1.2 }) + rect(ox + 492, oy + 8, 20, 100, '#fff', { stroke: '#1b2a3d', sw: 1.2 });
  for (let i = 0; i < 4; i++) plan += circle(ox + 424 + (i % 2) * 18, oy + 18 - (i > 1 ? 0 : 0) + 0, 0, 'none');
  plan += circle(ox + 450, oy + 18, 6, 'none', { stroke: '#1b2a3d', sw: 1 }) + circle(ox + 468, oy + 18, 6, 'none', { stroke: '#1b2a3d', sw: 1 }) + rect(ox + 496, oy + 60, 12, 24, '#cfe3ee', { stroke: '#1b2a3d', sw: 1, rx: 4 });
  plan += rect(ox + 410, oy + 60, 70, 36, '#fff', { stroke: '#1b2a3d', sw: 1.2, rx: 3 }) + circle(ox + 445, oy + 78, 8, 'none', { stroke: '#1b2a3d', sw: 1 }); // island
  // beds
  plan += bedSym(ox + 40, oy + 230, 84, 100, '#c9d8e3') + rect(ox + 12, oy + 236, 22, 22, '#fff', { stroke: '#1b2a3d', sw: 1 }) + rect(ox + 130, oy + 236, 22, 22, '#fff', { stroke: '#1b2a3d', sw: 1 });
  plan += bedSym(ox + 302, oy + 232, 66, 90, '#e4cdb2') + bedSym(ox + 426, oy + 232, 66, 90, '#cfe0cf');
  // wardrobes
  plan += rect(ox + 6, oy + 342, 100, 22, '#fff', { stroke: '#1b2a3d', sw: 1 }) + line(ox + 56, oy + 342, ox + 56, oy + 364, '#1b2a3d', 0.8);
  plan += rect(ox + 274, oy + 342, 80, 22, '#fff', { stroke: '#1b2a3d', sw: 1 }) + rect(ox + 404, oy + 342, 80, 22, '#fff', { stroke: '#1b2a3d', sw: 1 });
  // bath: tub, wc, basin
  plan += rrect(ox + 188, oy + 214, 74, 34, 8, '#fff', { stroke: '#1b2a3d', sw: 1.2 }) + rrect(ox + 194, oy + 220, 62, 22, 8, 'none', { stroke: '#1b2a3d', sw: 0.8 }) + ellipse(ox + 226, oy + 300, 12, 15, '#fff', { stroke: '#1b2a3d', sw: 1.2 }) + rect(ox + 216, oy + 282, 20, 8, '#fff', { stroke: '#1b2a3d', sw: 1.2, rx: 2 }) + rrect(ox + 190, oy + 330, 28, 22, 6, '#fff', { stroke: '#1b2a3d', sw: 1.2 }) + circle(ox + 204, oy + 341, 5, 'none', { stroke: '#1b2a3d', sw: 0.8 });
  // stairs
  for (let i = 0; i < 9; i++) plan += line(ox + 130 + i * 8, oy + 138, ox + 130 + i * 8, oy + 166, '#1b2a3d', 0.9);
  plan += rect(ox + 130, oy + 138, 72, 28, 'none', { stroke: '#1b2a3d', sw: 1.2 }) + path_(`M${ox + 134} ${oy + 152}L${ox + 198} ${oy + 152}`, 'none', { stroke: '#b5603c', sw: 1.2 }) + path_(`M${ox + 192} ${oy + 147}L${ox + 198} ${oy + 152}L${ox + 192} ${oy + 157}`, 'none', { stroke: '#b5603c', sw: 1.2 });
  // walls: outer thick, inner thinner
  const W1 = '#1b2a3d';
  plan += rect(ox - 4, oy - 4, 528, 378, 'none', { stroke: W1, sw: 8 });
  const iw = (x1, y1, x2, y2) => line(ox + x1, oy + y1, ox + x2, oy + y2, W1, 5);
  plan += iw(250, 0, 250, 170) + iw(400, 0, 400, 170) + iw(0, 170, 520, 170) + iw(0, 205, 520, 205) + iw(180, 205, 180, 370) + iw(270, 205, 270, 370) + iw(400, 205, 400, 370);
  // door openings and windows (draw over walls)
  plan += doorSwing(ox + 195, oy + 170, 36, -1) + doorSwing(ox + 78, oy + 205, 34, 1) + doorSwing(ox + 192, oy + 205, 30, 1).replace('', '') + doorSwing(ox + 296, oy + 205, 34, 1) + doorSwing(ox + 420, oy + 205, 34, 1);
  plan += doorSwingV(ox + 250, oy + 40, 34, 1) + doorSwing(ox + 300, oy - 0, 0, 1).replace('', '');
  plan += doorSwing(ox + 90, oy + 370, 40, -1);
  plan += planWin(ox + 30, oy, 80) + planWin(ox + 130, oy, 70) + planWin(ox + 430, oy, 60) + planWin(ox + 330, oy, 50) + planWin(ox + 520, oy + 40, 60, false) + planWin(ox, oy + 80, 60, false) + planWin(ox, oy + 240, 70, false) + planWin(ox + 300, oy + 370, 50) + planWin(ox + 430, oy + 370, 50) + planWin(ox + 520, oy + 240, 60, false);
  // dimension lines
  plan += dimLine(ox, oy - 26, ox + 520, oy - 26) + dimLine(ox - 28, oy, ox - 28, oy + 370);
  plan += dimLine(ox, oy - 14, ox + 250, oy - 14, C.brassD, false) + dimLine(ox + 250, oy - 14, ox + 520, oy - 14, C.brassD, false);
  // north arrow
  paper += g(plan, {});
  paper += g(circle(0, 0, 18, 'none', { stroke: '#1b2a3d', sw: 1.2 }) + path_('M0 -26L7 0L0 -6L-7 0Z', '#1b2a3d') + path_('M0 -26L7 0L0 -6Z', C.brass), { tf: `translate(${px + 54} ${py + 58})` });
  paper += textLines(px + 100, py + 30, 150, 2, '#1b2a3d', 4, 12, { op: 0.8 });
  add(g(paper, { tf: 'rotate(-2 600 450)' }));
  // blueprint peeking out (top-right)
  add(g(poly([[900, 120], [1070, 100], [1085, 250], [915, 270]], lin('bp', [[0, '#2f6aa3'], [1, '#1a4577']], [0, 0, 1, 1]), { stroke: '#102c4a', sw: 1.2 }) + poly([[925, 140], [1050, 124], [1062, 228], [937, 245]], 'none', { stroke: '#e6f2fa', sw: 1.6 }) + poly([[950, 160], [1030, 150], [1036, 200], [957, 208]], 'none', { stroke: '#e6f2fa', sw: 1.2 }), { op: 0 }));
  // --- tools on the board
  // scale ruler (triangular), along bottom
  { const rx = 250, ry = 760;
    add(g(rect(0, 0, 560, 38, lin('ruler', [[0, '#f8f2e2'], [1, '#e3d8bd']], [0, 0, 0, 1]), { rx: 4, stroke: '#a89a74', sw: 1.2 }) + rect(0, 28, 560, 10, C.brass, { rx: 3, op: 0.9 }), { tf: `translate(${rx} ${ry - 20}) rotate(-2 280 20)` }));
    let ticks = ''; for (let i = 0; i <= 56; i++) ticks += line(8 + i * 9.4, 0, 8 + i * 9.4, i % 10 === 0 ? 16 : i % 5 === 0 ? 11 : 7, '#2b2f36', i % 10 === 0 ? 1.4 : 1);
    for (let i = 0; i < 6; i++) ticks += rect(8 + i * 94 - 5, 19, 10, 3, '#2b2f36', { rx: 1.5, op: 0.8 });
    add(g(ticks, { tf: `translate(${rx} ${ry - 20}) rotate(-2 280 20)` })); }
  // set square (translucent)
  { add(g(poly([[0, 0], [200, 0], [0, 150]], 'rgba(255,170,90,0.45)', { stroke: '#c26a2a', sw: 2, lj: 'round' }) + poly([[34, 32], [128, 32], [34, 100]], 'rgba(255,255,255,0.45)', { stroke: '#c26a2a', sw: 1.4 }) + path_('M18 120L18 60M28 120L28 70', 'none', { stroke: '#c26a2a', sw: 0 }) + line(0, 0, 200, 0, '#fff', 2, { op: 0.6 }), { tf: 'translate(120 600) rotate(-14)' })); }
  // pencil
  { const L = 330;
    add(g(shadowEll(L / 2 + 6, 14, L / 2, 8, 0.25, 6) + rect(0, 0, L - 60, 22, hgrad('#27496d', '#183250'), { rx: 2 }) + rect(0, 0, L - 60, 6, '#fff', { op: 0.25 }) + rect(10, 0, 3, 22, C.brass) + rect(L - 150, 0, 40, 22, hgrad(C.brassL, C.brassD)) + path_(`M${L - 60} 0L${L} 11L${L - 60} 22Z`, '#e4c99a') + path_(`M${L - 28} 4.6L${L} 11L${L - 28} 17.4Z`, '#2b2f36') + path_(`M${L - 60} 0L${L - 40} 7L${L - 60} 11Z`, '#fff', { op: 0.25 }) + rect(L - 128, 0, 6, 22, C.brassD, { op: 0.6 }) + rect(L - 118, 0, 6, 22, C.brassD, { op: 0.6 }) + path_('M-10 3Q-14 11 -10 19H0V3Z', '#d96b5a') + rect(0, 3, 4, 16, '#b94f40'), { tf: 'translate(700 640) rotate(-28)' })); }
  // compass (divider)
  { add(g(shadowEll(0, 150, 60, 12, 0.25, 6) + path_('M-6 0L6 0L18 160L8 160Z', steelGrad(), { stroke: '#555c66', sw: 1 }) + path_('M-6 0L6 0L-18 160L-8 160Z', steelGradH(), { stroke: '#555c66', sw: 1 }) + path_('M-16 160L-18 176L-8 160Z', '#2b2f36') + path_('M18 160L20 190L8 160Z', '#2b2f36') + circle(0, 0, 11, brassGradH(), { stroke: C.brassD, sw: 1 }) + rect(-4, -34, 8, 28, hgrad('#27496d', '#183250'), { rx: 3 }) + circle(0, -36, 7, brassGradH()) + path_('M-14 70Q0 78 14 70', 'none', { stroke: C.brassD, sw: 2.2 }), { tf: 'translate(930 520) rotate(18)' })); }
  // eraser
  add(g(rrect(0, 0, 50, 24, 4, '#f4efe6', { stroke: '#cfc4aa', sw: 1 }) + rect(0, 0, 18, 24, '#27496d', { rx: 4 }) + rect(14, 0, 4, 24, '#27496d'), { tf: 'translate(640 748) rotate(8)' }));
  finish('svc-design-planning.svg', 'Design and planning', 'A drafting board with a detailed floor plan, dimension lines, pencil, set square, scale ruler and compass.');
}

// =============================================================================
// 9. svc-architectural-design
// =============================================================================
function elevationLines(x, y, k, col = '#1b2a3d') {
  const sw = 1.5 / k; let s = '';
  const L = (a, b, c, d, w, o) => line(a, b, c, d, col, w ?? sw, o);
  const R_ = (a, b, c, d, f = 'none', w, o) => rect(a, b, c, d, f, { stroke: col, sw: w ?? sw, ...o });
  // construction lines
  for (const yy of [30, 60, 202, 358]) s += line(-70, yy, 590, yy, C.brassD, 0.8 / k, { da: `${6 / k} ${4 / k}`, op: 0.9 });
  for (const xx of [18, 160, 502]) s += line(xx, 10, xx, 380, C.brassD, 0.8 / k, { da: `${6 / k} ${4 / k}`, op: 0.6 });
  s += R_(0, 210, 520, 148, '#f7f0e0') + R_(-6, 202, 536, 14, '#fff', sw * 1.2) + R_(18, 60, 484, 142, '#fbf6ea') + R_(8, 48, 504, 14, '#fff', sw * 1.2) + R_(26, 30, 468, 20, '#f7f0e0');
  // stone hatching left
  for (let i = 0; i < 12; i++) s += L(0, 220 + i * 11, 160, 220 + i * 11, 0.6 / k, { op: 0.6 });
  s += R_(0, 210, 160, 148, 'none', sw * 1.1);
  // slats
  for (let i = 0; i < 17; i++) s += L(20 + i * 8.1, 62, 20 + i * 8.1, 200, 0.7 / k, { op: 0.7 });
  s += R_(18, 60, 140, 142, 'none', sw * 1.1);
  // windows
  s += R_(176, 80, 300, 100, '#dbe8ef') + L(251, 80, 251, 180) + L(326, 80, 326, 180) + L(401, 80, 401, 180) + R_(172, 152, 316, 30, 'none') + L(172, 166, 488, 166, 0.7 / k);
  s += R_(278, 240, 190, 90, '#dbe8ef') + L(341, 240, 341, 330) + L(404, 240, 404, 330);
  s += R_(176, 238, 72, 120, '#e8d9bc') + L(212, 238, 212, 358, 0.8 / k);
  s += R_(60, 16, 70, 14, '#e5ecf2');
  // diagonals for glass
  for (const [a, b, c, d] of [[176, 80, 300, 100], [278, 240, 190, 90]]) { s += L(a + 14, b + d - 8, a + 52, b + 8, 0.7 / k, { op: 0.5 }); }
  // dimension chain
  s += dimLineS(-30, 30, -30, 358, k) + dimLineS(0, 384, 520, 384, k);
  return g(s, { tf: `translate(${r1(x)} ${r1(y)}) scale(${k})` });
}
function dimLineS(x1, y1, x2, y2, k) { return g(dimLine(x1, y1, x2, y2), {}).replace('stroke-width="1"', `stroke-width="${r1(1 / k)}"`); }
function swatch(x, y, w, h, kind, rot) {
  let s = shadowEll(w / 2 + 4, h + 4, w * 0.55, 6, 0.0, 4);
  let inner = rrect(0, 0, w, h, 8, '#fbf8f0', { stroke: '#cfc4aa', sw: 1.2 });
  const cid = clipDef('sw' + kind + Math.round(x), rrect(6, 6, w - 12, h - 26, 5, '#000'));
  let t = '';
  if (kind === 'wood') { t += rect(0, 0, w, h, '#9a6a42'); for (let i = 0; i < 14; i++) t += path_(`M0 ${6 + i * 9}Q${w / 2} ${2 + i * 9 + (i % 3) * 3} ${w} ${6 + i * 9}`, 'none', { stroke: i % 2 ? '#7a4e2f' : '#b98558', sw: 1.6, op: 0.7 }); }
  if (kind === 'marble') { t += rect(0, 0, w, h, '#f1eee6'); t += path_(`M10 0Q${w * 0.4} ${h * 0.3} ${w * 0.3} ${h * 0.6}T${w * 0.7} ${h}`, 'none', { stroke: '#8f8e8b', sw: 1.6, op: 0.6 }) + path_(`M${w * 0.6} 0Q${w * 0.8} ${h * 0.3} ${w * 0.55} ${h * 0.5}`, 'none', { stroke: '#a39f98', sw: 1.2, op: 0.5 }) + path_(`M10 0Q${w * 0.4} ${h * 0.3} ${w * 0.3} ${h * 0.6}`, 'none', { stroke: C.brass, sw: 0.8, op: 0.7 }); }
  if (kind === 'brick') { t += rect(0, 0, w, h, brickPat('swb', 18, 9, '#b0593a', '#d6c6a8', { seed: 4 })); }
  if (kind === 'brass') { t += rect(0, 0, w, h, lin('swbr', [[0, C.brassL], [0.5, C.brass], [1, C.brassD]], [0, 0, 1, 1])); for (let i = 0; i < 14; i++) t += line(0, i * 8, w, i * 8 - 12, '#fff', 0.8, { op: 0.25 }); }
  if (kind === 'stone') { t += rect(0, 0, w, h, '#a9a193'); reseed(8); for (let i = 0; i < 26; i++) t += circle(rr(0, w), rr(0, h), rr(1, 4), mix('#7f786b', '#d1c9b8', rnd()), { op: 0.7 }); }
  if (kind === 'teal') { t += rect(0, 0, w, h, C.teal); t += rect(0, 0, w, h, tilePat('swz', 14, '#2f6f73', '#1f4f55', { cols: 4, rows: 4, alt: '#5a9aa0', var: 0.8, seed: 2 })); }
  if (kind === 'plaster') { t += rect(0, 0, w, h, '#e6dac0'); reseed(5); for (let i = 0; i < 30; i++) t += ellipse(rr(0, w), rr(0, h), rr(3, 9), rr(1, 3), rnd() > 0.5 ? '#fff' : '#cdbf9e', { op: 0.35 }); }
  inner += g(t, { clip: cid, tf: 'translate(0 0)' });
  inner += rect(10, h - 16, w * 0.5, 3, '#2b2f36', { rx: 1.5, op: 0.7 }) + rect(10, h - 9, w * 0.3, 3, '#2b2f36', { rx: 1.5, op: 0.4 });
  inner += circle(w / 2, 8, 3.2, C.brass);
  return g(s + inner, { tf: `translate(${r1(x)} ${r1(y)}) rotate(${rot})` });
}
function svcArchitectural() {
  begin('sad');
  add(svcBg({ mode: 'navy', r: 340, cx: 700, cy: 430, flip: false }));
  // left: elevation drawing sheet
  { const sx = 90, sy = 190;
    add(g(rect(0, 0, 400, 520, '#000', { op: 0.35, filter: blur(14) }), { tf: `translate(${sx + 12} ${sy + 20}) rotate(-4)` }));
    let sheet = rect(0, 0, 400, 520, vgrad('#fffdf8', '#f1ead9'), { stroke: '#d9cfb6', sw: 1.2 });
    for (let i = 1; i < 20; i++) sheet += line(i * 20, 0, i * 20, 520, '#b6c9db', i % 5 ? 0.4 : 0.8, { op: 0.4 });
    for (let j = 1; j < 26; j++) sheet += line(0, j * 20, 400, j * 20, '#b6c9db', j % 5 ? 0.4 : 0.8, { op: 0.4 });
    sheet += elevationLines(52, 150, 0.62);
    sheet += textLines(24, 28, 160, 2, '#1b2a3d', 4, 12, { op: 0.8 }) + rect(24, 66, 40, 3, C.brass);
    sheet += rect(24, 440, 352, 60, 'none', { stroke: '#1b2a3d', sw: 1.2 }) + line(24, 470, 376, 470, '#1b2a3d', 1) + line(220, 440, 220, 500, '#1b2a3d', 1) + textLines(32, 450, 150, 2, '#1b2a3d', 3, 9, { op: 0.7 }) + textLines(230, 450, 120, 2, '#1b2a3d', 3, 9, { op: 0.7 }) + textLines(32, 478, 140, 2, '#1b2a3d', 2.5, 8, { op: 0.5 });
    add(g(sheet, { tf: `translate(${sx} ${sy}) rotate(-4)` })); }
  // right: iso model on a wooden base
  ISO.ox = 745; ISO.oy = 300; ISO.s = 25;
  { add(shadowPoly([isoP(-1, -1, 0), isoP(15, -1, 0), isoP(15, 13, 0), isoP(-1, 13, 0)].map((p) => [p[0] + 14, p[1] + 36]), 0.35, 14));
    // base plate (wood) with brass edge
    add(isoBox(-1.2, -1.2, -0.9, 15.4, 12.4, 0.9, { top: '#caa77a', left: '#8a5a38', right: '#6a4228' }, { topFill: lin('mbase', [[0, '#f0e3c6'], [1, '#e1d0aa']], [0, 0, 1, 1]) }));
    add(isoL(11.2, -1.2, 14.2, -0.9, -0.82, C.brass));
    add(isoGrid(-0.6, -0.6, 14.4, 11.2, 12, 10, '#bda980', 0.8, 0.4));
    // model lawn insert
    add(isoT(0.02, 0.4, 13.4, 0.4, 10.2, '#e9efdc', { op: 0.9 }));
    const [hx, hy] = isoP(2.4, 1.2, 0);
    add(isoHouse(hx, hy, ISO.s, { wall: '#fbf8f1', wood: '#c19a6b' }));
    // wireframe overlay lines (design process)
    const w = [[2.4, 1.2, 0], [11.4, 1.2, 0], [11.4, 7.2, 0], [2.4, 7.2, 0]];
    add(poly(w.map((p) => isoP(...p)), 'none', { stroke: '#3d6590', sw: 1.4, da: '5 4', op: 0.7 }));
    // model trees (white spheres on sticks)
    for (const [x, y] of [[0.9, 9.2], [13, 1.6], [12.7, 9.0], [0.9, 2.2]]) { const [px, py] = isoP(x, y, 0.02); add(shadowEll(px, py, 12, 4, 0.2, 2), rect(px - 1, py - 22, 2, 22, '#8a6a4a'), circle(px, py - 30, 12, radial('mt' + Math.round(px), [[0, '#d9e6c8'], [1, '#97b383']], [0.35, 0.3, 0.8]))); }
    // path
    add(isoT(0.03, 7.4, 9.0, 7.2, 10.2, '#d9ceb0'));
  }
  // swatch fan (bottom left-center)
  { const kinds = ['wood', 'marble', 'brick', 'brass', 'stone', 'teal'];
    kinds.forEach((kd, i) => add(swatch(430 + i * 32, 730 - Math.sin(i * 0.6) * 10, 110, 130, kd, -30 + i * 14)));
    add(circle(500, 800, 10, C.brass, { stroke: C.brassD, sw: 1.5 })); }
  finish('svc-architectural-design.svg', 'Architectural design', 'An isometric architectural model of a modern house on a wooden base beside a front-elevation drawing and a fan of material swatches.');
}

// =============================================================================
// run
// =============================================================================
const JOBS = {
  'interior-living-room': () => livingRoom(),
  'interior-bedroom': () => bedroom(),
  'interior-kitchen': () => kitchen(),
  'interior-bathroom': () => bathroom(),
  'interior-dining': () => dining(),
  'svc-new-home': () => svcNewHome(),
  'svc-residential-building': () => svcResidential(),
  'svc-design-planning': () => svcDesign(),
  'svc-architectural-design': () => svcArchitectural(),
  'svc-renovation': () => svcRenovation(),
  'svc-maintenance': () => svcMaintenance(),
  'svc-finishing': () => svcFinishing(),
  'svc-plumbing-electrical': () => svcPlumbElec(),
  'svc-painting-waterproofing': () => svcPaintWaterproof(),
  'svc-kitchen-bathroom': () => svcKitchenBath(),
  'svc-grey-structure': () => svcGreyStructure(),
  'svc-turnkey': () => svcTurnkey(),
};
const want = process.argv.slice(2);
for (const [name, fn] of Object.entries(JOBS)) {
  if (want.length && !want.some((w) => name.includes(w))) continue;
  fn();
}
