// agent5 nature: denser, better-shaded vegetation made of alpha-to-coverage leaf cards (instanced), plus grass tufts & flowers.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { rng } from './textures.mjs';
import { cv, ctex, smooth } from './agent5-kit.mjs';

const UP = new THREE.Vector3(0, 0, 1);
const cardGeo = new THREE.PlaneGeometry(1, 1);
const _lm = new Map();

function leafMat(kind) {
  if (_lm.has(kind)) return _lm.get(kind);
  const S = 512, c = cv(S), x = c.getContext('2d'), r = rng(kind.length * 17 + kind.charCodeAt(0)); x.clearRect(0, 0, S, S);
  const leaflet = (px, py, len, wid, a, h, s, l) => {
    x.save(); x.translate(px, py); x.rotate(a);
    const g = x.createLinearGradient(0, 0, len, 0); g.addColorStop(0, `hsl(${h},${s}%,${l * 0.62}%)`); g.addColorStop(1, `hsl(${h + 6},${s - 4}%,${l * 1.12}%)`); x.fillStyle = g;
    x.beginPath(); x.moveTo(0, 0); x.quadraticCurveTo(len * 0.45, -wid, len, 0); x.quadraticCurveTo(len * 0.45, wid, 0, 0); x.fill();
    x.strokeStyle = `hsla(${h + 10},${s - 8}%,${l * 1.35}%,0.55)`; x.lineWidth = 1; x.beginPath(); x.moveTo(0, 0); x.lineTo(len * 0.92, 0); x.stroke(); x.restore();
  };
  if (kind === 'neem' || kind === 'fine') {
    const sprigs = kind === 'neem' ? 13 : 16;
    for (let s = 0; s < sprigs; s++) {
      const bx = 40 + r() * (S - 80), by = 40 + r() * (S - 80), a = r() * 6.28, L = 120 + r() * 80, h0 = 78 + r() * 34, sa = 24 + r() * 18, ll = 24 + r() * 18;
      x.strokeStyle = `hsl(${h0 - 10},30%,24%)`; x.lineWidth = 2.2; x.beginPath(); x.moveTo(bx, by); x.lineTo(bx + Math.cos(a) * L, by + Math.sin(a) * L); x.stroke();
      const n = kind === 'neem' ? 9 : 12;
      for (let i = 1; i <= n; i++) { const t = i / (n + 1), px = bx + Math.cos(a) * L * t, py = by + Math.sin(a) * L * t, len = (kind === 'neem' ? 56 : 36) * (1 - Math.abs(t - 0.45) * 0.6), wd = len * 0.27; for (const sd of [-1, 1]) leaflet(px, py, len, wd, a + sd * (0.9 + r() * 0.25), h0 + (r() - 0.5) * 10, sa, ll + r() * 6); }
      leaflet(bx + Math.cos(a) * L, by + Math.sin(a) * L, 40, 9, a, h0, sa, ll + 4);
    }
  } else if (kind === 'broad') {
    for (let i = 0; i < 70; i++) { const px = 20 + r() * (S - 40), py = 20 + r() * (S - 40), a = r() * 6.28, len = 52 + r() * 44, h0 = 76 + r() * 34, sa = 22 + r() * 20, ll = 24 + r() * 18; leaflet(px, py, len, len * 0.3, a, h0, sa, ll); }
  } else if (kind === 'bougain') {
    for (let i = 0; i < 80; i++) { const px = 20 + r() * (S - 40), py = 20 + r() * (S - 40), a = r() * 6.28, len = 30 + r() * 24; leaflet(px, py, len, len * 0.33, a, 90 + r() * 25, 40, 24 + r() * 10); }
    for (let i = 0; i < 260; i++) { const px = 16 + r() * (S - 32), py = 16 + r() * (S - 32), rr = 6 + r() * 7, hue = 318 + r() * 28, l = 38 + r() * 18; x.save(); x.translate(px, py); x.rotate(r() * 6.28); x.fillStyle = `hsl(${hue},${70 + r() * 20}%,${l}%)`; x.beginPath(); x.ellipse(0, 0, rr, rr * 0.7, 0, 0, 6.28); x.fill(); x.fillStyle = `hsla(${hue + 8},60%,${l + 14}%,0.55)`; x.beginPath(); x.ellipse(-rr * 0.2, -rr * 0.15, rr * 0.5, rr * 0.35, 0, 0, 6.28); x.fill(); x.restore(); }
  } else if (kind === 'flower') {
    for (let i = 0; i < 60; i++) { const px = 20 + r() * (S - 40), py = 20 + r() * (S - 40), a = r() * 6.28, len = 40 + r() * 30; leaflet(px, py, len, len * 0.28, a, 100 + r() * 20, 42, 24 + r() * 10); }
    for (let i = 0; i < 90; i++) { const px = 20 + r() * (S - 40), py = 20 + r() * (S - 40), rr = 8 + r() * 6; x.fillStyle = '#ffffff'; for (let p = 0; p < 5; p++) { x.save(); x.translate(px, py); x.rotate(p * 1.2566 + r() * 0.2); x.beginPath(); x.ellipse(rr * 0.55, 0, rr * 0.6, rr * 0.38, 0, 0, 6.28); x.fill(); x.restore(); } x.fillStyle = 'rgba(255,215,90,1)'; x.beginPath(); x.arc(px, py, rr * 0.28, 0, 6.28); x.fill(); }
  }
  const tx = ctex(c, { repeat: false }); const m = new THREE.MeshStandardMaterial({ map: tx, emissive: 0xffffff, emissiveMap: tx, emissiveIntensity: 0.2, alphaTest: 0.38, alphaToCoverage: true, side: THREE.DoubleSide, roughness: 0.72, metalness: 0, color: 0xffffff }); m.userData.tileM = 1;
  _lm.set(kind, m); return m;
}

/** Scatter helper: list of {p:Vector3, n:Vector3, s, c:Color} -> one InstancedMesh. */
function cardMesh(items, kind, parent, { cast = true } = {}) {
  if (!items.length) return null;
  const im = new THREE.InstancedMesh(cardGeo, leafMat(kind), items.length), d = new THREE.Object3D(), q = new THREE.Quaternion(), rr = rng(items.length * 7 + 3);
  items.forEach((it, i) => { q.setFromUnitVectors(UP, it.n); d.position.copy(it.p); d.quaternion.copy(q); d.rotateZ(rr() * 6.28); d.scale.setScalar(it.s); d.updateMatrix(); im.setMatrixAt(i, d.matrix); im.setColorAt(i, it.c); });
  im.instanceMatrix.needsUpdate = true; if (im.instanceColor) im.instanceColor.needsUpdate = true;
  im.castShadow = cast; im.receiveShadow = true; im.frustumCulled = false; parent?.add(im); return im;
}
const rv3 = (r) => { const u = r() * 6.28, v = Math.acos(2 * r() - 1); return new THREE.Vector3(Math.sin(v) * Math.cos(u), Math.cos(v), Math.sin(v) * Math.sin(u)); };

let _bark;
function barkMat(color = 0x5a4636) {
  if (!_bark) { const c = cv(256, 256), x = c.getContext('2d'), r = rng(5); x.fillStyle = '#8a7a6a'; x.fillRect(0, 0, 256, 256); for (let i = 0; i < 160; i++) { const px = r() * 256, w = 1 + r() * 5; x.fillStyle = `rgba(${20 + r() * 30},${16 + r() * 20},${10 + r() * 16},${0.25 + r() * 0.5})`; x.fillRect(px, r() * 256, w, 40 + r() * 160); } for (let i = 0; i < 80; i++) { x.fillStyle = `rgba(190,175,150,${0.08 + r() * 0.14})`; x.fillRect(r() * 256, r() * 256, 1 + r() * 3, 20 + r() * 50); } const t = ctex(c, { repeat: true }); t.repeat.set(2, 3); _bark = t; }
  const m = new THREE.MeshStandardMaterial({ map: _bark, bumpMap: _bark, bumpScale: 2.0, roughness: 1, color }); return m;
}
function limb(g, pts, r0, r1, mat) {
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i], b = pts[i + 1], len = a.distanceTo(b), ra = r0 + (r1 - r0) * (i / (pts.length - 1)), rb = r0 + (r1 - r0) * ((i + 1) / (pts.length - 1));
    const m = new THREE.Mesh(new THREE.CylinderGeometry(rb, ra, len, 9, 1), mat); m.position.copy(a).add(b).multiplyScalar(0.5); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize()); m.castShadow = true; m.receiveShadow = true; g.add(m);
  }
}

/**
 * Broadleaf tree. kind: 'neem' (wide, rounded) | 'tall' (eucalyptus/ashoka-like, narrow & tall) | 'mango' (dense dome).
 */
export function tree2(x, z, { h = 8, crown = 3, trunkR = 0.2, y = 0, tint = 0xffffff, seed = 1, lean = 0, kind = 'neem', density = 1, leaf = null, bark = 0x6a5844, limbs = null } = {}, parent) {
  const g = new THREE.Group(), r = rng(seed * 97 + 13), bm = barkMat(bark), items = [];
  const th = h * (kind === 'tall' ? 0.34 : 0.4), base = new THREE.Vector3(x, y, z);
  const trunkPts = [0, 0.33, 0.66, 1].map((t) => base.clone().add(new THREE.Vector3(lean * t * t + Math.sin(t * 3 + seed) * 0.06, th * t, Math.cos(t * 2.4 + seed) * 0.05)));
  limb(g, trunkPts, trunkR * 1.15, trunkR * 0.72, bm);
  const flare = new THREE.Mesh(new THREE.CylinderGeometry(trunkR * 1.2, trunkR * 1.9, 0.5, 10), bm); flare.position.set(x, y + 0.2, z); flare.castShadow = true; g.add(flare);
  const top = trunkPts[3].clone(), nl = limbs ?? (kind === 'tall' ? 6 : 6 + Math.floor(r() * 2)), tints = new THREE.Color(tint);
  const crownScale = kind === 'tall' ? [0.62, 1.55, 0.62] : kind === 'mango' ? [1.15, 0.9, 1.15] : [1.1, 0.78, 1.1];
  const lk = leaf || (kind === 'mango' ? 'broad' : 'neem');
  const clusters = [];
  for (let i = 0; i < nl; i++) {
    const a = (i / nl) * 6.28 + r() * 0.7, el = kind === 'tall' ? 0.95 + r() * 0.3 : 0.55 + r() * 0.5, Ld = crown * (kind === 'tall' ? 0.8 : 1.05) * (0.7 + r() * 0.5);
    const dir = new THREE.Vector3(Math.cos(a) * Math.cos(el), Math.sin(el), Math.sin(a) * Math.cos(el)).normalize();
    const p0 = top.clone().add(new THREE.Vector3(0, -th * 0.08 * r(), 0)), p1 = p0.clone().addScaledVector(dir, Ld * 0.4), p2 = p1.clone().addScaledVector(dir.clone().add(new THREE.Vector3(0, 0.25, 0)).normalize(), Ld * 0.35), p3 = p2.clone().addScaledVector(dir.clone().add(new THREE.Vector3(0, 0.35, 0)).normalize(), Ld * 0.3);
    limb(g, [p0, p1, p2, p3], trunkR * 0.5, trunkR * 0.13, bm);
    const rad = crown * (0.52 + r() * 0.2) * (kind === 'tall' ? 0.8 : 1);
    clusters.push({ c: p3.clone().add(new THREE.Vector3(0, rad * 0.22, 0)), rad }); clusters.push({ c: p2.clone().add(new THREE.Vector3(0, rad * 0.3, 0)), rad: rad * 0.8 });
  }
  clusters.push({ c: top.clone().add(new THREE.Vector3(lean * 0.3, crown * 0.75, 0)), rad: crown * 0.72 });
  const cs = (kind === 'neem' ? 0.42 : kind === 'mango' ? 0.5 : 0.4);
  const crownC = top.clone().add(new THREE.Vector3(0, crown * 0.5, 0));
  for (const cl of clusters) {
    const n = Math.round(cl.rad * cl.rad * 230 * density * (kind === 'tall' ? 0.7 : 1) + 100);
    for (let i = 0; i < n; i++) {
      const o = rv3(r), k = 0.5 + r() * 0.5, off = new THREE.Vector3(o.x * crownScale[0], o.y * crownScale[1], o.z * crownScale[2]).multiplyScalar(cl.rad * k), p = cl.c.clone().add(off);
      const nrm = o.clone().multiplyScalar(0.8).add(new THREE.Vector3((r() - 0.5) * 0.9, (r() - 0.5) * 0.9, (r() - 0.5) * 0.9)).normalize();
      const outwardWorld = p.clone().sub(crownC), hy = clampN(outwardWorld.y / (crown * 1.1)), depth = k;
      const lum = (0.5 + 0.5 * smooth(0.45, 1.0, depth)) * (0.78 + 0.34 * smooth(-0.8, 0.8, hy)) * (0.9 + r() * 0.2);
      const col = tints.clone().multiplyScalar(lum); col.offsetHSL((r() - 0.5) * 0.025, (r() - 0.5) * 0.1, 0);
      items.push({ p, n: nrm, s: cs * (0.8 + r() * 0.5) * (kind === 'mango' ? 1.1 : 1), c: col });
    }
  }
  cardMesh(items, lk, g);
  parent?.add(g); return g;
}
const clampN = (v) => Math.max(-1, Math.min(1, v));

/** Dense clipped hedge with dark core. */
export function hedge2(x0, z0, x1, z1, { h = 0.7, w = 0.5, y = 0, tint = 0xffffff, seed = 1, round = 0.18, leaf = 'broad', cardS = 0.2, dens = 1 } = {}, parent) {
  const len = Math.hypot(x1 - x0, z1 - z0), dx = (x1 - x0) / len, dz = (z1 - z0) / len, r = rng(seed * 7 + 1), g = new THREE.Group(), items = [], t0 = new THREE.Color(tint);
  const core = new THREE.Mesh(new THREE.BoxGeometry(len, h * 0.9, w * 0.7), new THREE.MeshStandardMaterial({ color: 0x1b2e14, roughness: 1 })); core.position.set((x0 + x1) / 2, y + h * 0.45, (z0 + z1) / 2); core.rotation.y = Math.atan2(-dz, dx); core.receiveShadow = true; g.add(core);
  const n = Math.round(len * (h * 2 + w) * 520 * dens * (0.2 / cardS) ** 2 * 0.25);
  for (let i = 0; i < n; i++) {
    const t = r() * len; let u = r(), px, py, nx, ny; // cross-section: perimeter parameter
    if (u < 0.5) { px = (r() - 0.5) * (w - round * 2); py = h; nx = 0; ny = 1; } else { const sd = u < 0.75 ? -1 : 1; px = sd * w / 2; py = r() * (h - round); nx = sd; ny = 0.15; }
    py += (r() - 0.5) * 0.05; px += (r() - 0.5) * 0.06;
    const nm = new THREE.Vector3(nx * dz * -1 + (r() - 0.5) * 0.6, ny + (r() - 0.5) * 0.6, nx * dx + (r() - 0.5) * 0.6).normalize();
    const p = new THREE.Vector3(x0 + dx * t - dz * px, y + py, z0 + dz * t + dx * px);
    const col = t0.clone().multiplyScalar(0.62 + 0.45 * (py / h) * (0.7 + 0.3 * r())); items.push({ p, n: nm, s: cardS * (0.8 + r() * 0.5), c: col });
  }
  cardMesh(items, leaf, g); parent?.add(g); return g;
}

/** Rounded shrub / flowering clump. */
export function bush2(x, y, z, rad = 0.6, { tint = 0xffffff, seed = 1, leaf = 'broad', squash = 0.8, cardS = 0.24, flat = false } = {}, parent) {
  const g = new THREE.Group(), r = rng(seed * 13 + 5), items = [], t0 = new THREE.Color(tint);
  const core = new THREE.Mesh(new THREE.SphereGeometry(rad * 0.7, 12, 8), new THREE.MeshStandardMaterial({ color: 0x1b2e14, roughness: 1 })); core.scale.y = squash; core.position.set(x, y + rad * squash * 0.9, z); g.add(core);
  const n = Math.round(rad * rad * 520 * (0.24 / cardS) ** 2 + 60);
  for (let i = 0; i < n; i++) { const o = rv3(r); if (flat && o.y < -0.1) o.y = -o.y; const k = 0.6 + r() * 0.4; const p = new THREE.Vector3(x + o.x * rad * k, y + rad * squash * 0.9 + o.y * rad * squash * k, z + o.z * rad * k); const nm = o.clone().add(new THREE.Vector3((r() - 0.5) * 0.7, (r() - 0.5) * 0.7, (r() - 0.5) * 0.7)).normalize(); items.push({ p, n: nm, s: cardS * (0.8 + r() * 0.5), c: t0.clone().multiplyScalar((0.55 + 0.5 * smooth(-0.6, 0.9, o.y)) * (0.88 + r() * 0.24)) }); }
  cardMesh(items, leaf, g); parent?.add(g); return g;
}

/** Draping bougainvillea strip: cards hanging from (x0..x1, yTop) down `drop`, on both sides of a wall at z. */
export function bougain(x0, x1, yTop, z, { drop = 0.7, thick = 0.35, seed = 1, tint = 0xffffff, dens = 1, cardS = 0.26, dir = 1 } = {}, parent) {
  const g = new THREE.Group(), r = rng(seed * 3 + 9), items = [], len = x1 - x0, n = Math.round(len * (drop + thick) * 130 * dens);
  for (let i = 0; i < n; i++) { const t = r(), xx = x0 + t * len, hang = Math.pow(r(), 1.7) * drop * (0.7 + 0.3 * Math.sin(t * 17 + seed)), p = new THREE.Vector3(xx, yTop + thick * 0.4 * r() - hang, z + dir * (r() - 0.3) * thick); const nm = new THREE.Vector3((r() - 0.5) * 0.8, 0.2 + r() * 0.6, dir * (0.6 + r() * 0.6)).normalize(); items.push({ p, n: nm, s: cardS * (0.8 + r() * 0.6), c: new THREE.Color(tint).multiplyScalar(0.7 + r() * 0.4) }); }
  cardMesh(items, 'bougain', g); parent?.add(g); return g;
}

// ------------------------------------------------------------------ grass tufts (many tiny crossed quads) so lawn edges & near-ground read as real grass
let _gt;
function grassMat() {
  if (_gt) return _gt;
  const c = cv(256), x = c.getContext('2d'), r = rng(8); x.clearRect(0, 0, 256, 256);
  for (let i = 0; i < 46; i++) {
    const bx = 20 + r() * 216, lean = (r() - 0.5) * 70, hgt = 130 + r() * 120, w = 5 + r() * 7, hh = 78 + r() * 26, l = 26 + r() * 18;
    const g = x.createLinearGradient(0, 256, 0, 256 - hgt); g.addColorStop(0, `hsl(${hh},42%,${l * 0.9}%)`); g.addColorStop(1, `hsl(${hh + 6},50%,${l * 1.7}%)`); x.fillStyle = g;
    x.beginPath(); x.moveTo(bx - w / 2, 256); x.quadraticCurveTo(bx + lean * 0.2, 256 - hgt * 0.55, bx + lean, 256 - hgt); x.quadraticCurveTo(bx + lean * 0.3 + w * 0.3, 256 - hgt * 0.5, bx + w / 2, 256); x.fill();
  }
  _gt = new THREE.MeshStandardMaterial({ map: ctex(c), alphaTest: 0.42, alphaToCoverage: true, side: THREE.DoubleSide, roughness: 0.9, color: 0xffffff }); _gt.userData.tileM = 1; return _gt;
}
let _gg;
function tuftGeo() { if (_gg) return _gg; const a = new THREE.PlaneGeometry(1, 1), b = new THREE.PlaneGeometry(1, 1); a.translate(0, 0.5, 0); b.translate(0, 0.5, 0); b.rotateY(Math.PI / 2); _gg = mergeGeometries([a, b]); return _gg; }
export function grassTufts({ x0, z0, x1, z1, y = 0, count = 4000, h = 0.14, w = 0.22, seed = 1, tint = 0xffffff, mask = null, hVar = 0.5 } = {}, parent) {
  const r = rng(seed * 5 + 1), items = [];
  for (let i = 0; i < count * 2 && items.length < count; i++) { const px = x0 + r() * (x1 - x0), pz = z0 + r() * (z1 - z0); if (mask && !mask(px, pz)) continue; items.push([px, pz, r(), r(), r()]); }
  const im = new THREE.InstancedMesh(tuftGeo(), grassMat(), items.length), d = new THREE.Object3D(), t0 = new THREE.Color(tint);
  items.forEach(([px, pz, a, b, c], i) => { const s = h * (1 - hVar / 2 + hVar * b); d.position.set(px, y, pz); d.rotation.set(0, a * 6.28, 0); d.scale.set(w * (0.7 + c * 0.6), s, w * (0.7 + c * 0.6)); d.updateMatrix(); im.setMatrixAt(i, d.matrix); im.setColorAt(i, t0.clone().multiplyScalar(0.7 + 0.5 * b)); });
  im.castShadow = false; im.receiveShadow = true; im.frustumCulled = false; parent?.add(im); return im;
}
/** Flower bed (white/pink flowers over green foliage) */
export function flowerBed(x0, z0, x1, z1, { y = 0.1, h = 0.38, seed = 1, tint = 0xffffff, count = 700 } = {}, parent) {
  const r = rng(seed * 11 + 2), items = [];
  for (let i = 0; i < count; i++) { const p = new THREE.Vector3(x0 + r() * (x1 - x0), y + r() * h, z0 + r() * (z1 - z0)); const nm = new THREE.Vector3((r() - 0.5), 0.5 + r() * 0.8, (r() - 0.5)).normalize(); items.push({ p, n: nm, s: 0.2 + r() * 0.12, c: new THREE.Color(tint).multiplyScalar(0.75 + r() * 0.4) }); }
  cardMesh(items, 'flower', parent); return null;
}
