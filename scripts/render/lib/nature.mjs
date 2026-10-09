// Vegetation built from alpha-cut leaf cards (the real-time-engine technique) so foliage reads as leaves,
// not balls. Cards face outward from the crown centre so lighting looks volumetric. Units: metres.
import * as THREE from 'three';
import { rng } from './textures.mjs';

let leafTexCache = {};
function leafTexture(kind = 'broad') {
  if (leafTexCache[kind]) return leafTexCache[kind];
  const S = 512, c = document.createElement('canvas'); c.width = c.height = S; const x = c.getContext('2d'), r = rng(kind === 'broad' ? 5 : 9);
  x.clearRect(0, 0, S, S);
  const n = kind === 'broad' ? 230 : 340;
  for (let i = 0; i < n; i++) {
    const px = 20 + r() * (S - 40), py = 20 + r() * (S - 40), len = (kind === 'broad' ? 34 : 22) + r() * 26, wid = len * (0.4 + r() * 0.18), a = r() * Math.PI * 2;
    const L = 20 + r() * 26, Hh = 78 + r() * 30, Sat = 36 + r() * 30;
    x.save(); x.translate(px, py); x.rotate(a);
    x.fillStyle = `hsl(${Hh},${Sat}%,${L}%)`; x.beginPath(); x.ellipse(0, 0, len / 2, wid / 2, 0, 0, Math.PI * 2); x.fill();
    x.strokeStyle = `hsl(${Hh},${Sat}%,${L + 14}%)`; x.lineWidth = 1.2; x.beginPath(); x.moveTo(-len / 2, 0); x.lineTo(len / 2, 0); x.stroke(); x.restore();
  }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return (leafTexCache[kind] = new THREE.MeshStandardMaterial({ map: t, alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.75, metalness: 0 }));
}
const cardGeo = new THREE.PlaneGeometry(1, 1);

/** Scatter `count` leaf cards. place(i, rnd) -> { pos, out (outward dir), s (size), shade }. */
function cards(parent, count, place, { color = 0x4a7f35, kind = 'broad', jitter = 0.1 } = {}) {
  const mat = leafTexture(kind).clone(); mat.vertexColors = false;
  const im = new THREE.InstancedMesh(cardGeo, mat, count);
  const d = new THREE.Object3D(), col = new THREE.Color(), base = new THREE.Color(color), r = rng(count * 13 + 7), up = new THREE.Vector3(0, 0, 1), q = new THREE.Quaternion();
  for (let i = 0; i < count; i++) {
    const p = place(i, r);
    d.position.copy(p.pos);
    const n = p.out.clone().add(new THREE.Vector3(r() - 0.5, r() - 0.5, r() - 0.5).multiplyScalar(0.9)).normalize();
    q.setFromUnitVectors(up, n); d.quaternion.copy(q); d.rotateZ(r() * 6.28); d.scale.setScalar(p.s * (0.8 + r() * 0.5)); d.updateMatrix(); im.setMatrixAt(i, d.matrix);
    col.copy(base).offsetHSL((r() - 0.5) * 0.04, (r() - 0.5) * 0.1, (r() - 0.5) * jitter + p.shade); im.setColorAt(i, col);
  }
  im.castShadow = true; im.receiveShadow = true; parent?.add(im); return im;
}

/** Clipped hedge between two points. */
export function hedge(x0, z0, x1, z1, { h = 0.8, w = 0.6, y = 0, color = 0x3f7a30, density = 55, seed = 1 } = {}, parent) {
  const len = Math.hypot(x1 - x0, z1 - z0), n = Math.max(60, Math.round(len * density * 3.2)), dx = (x1 - x0) / len, dz = (z1 - z0) / len, g = new THREE.Group(), r = rng(seed);
  cards(g, n, () => { const t = r() * len, hh = r() * h, side = (r() - 0.5) * w, o = new THREE.Vector3(-dz * Math.sign(side || 1), 0.3 + hh / h * 0.6, dx * Math.sign(side || 1)).normalize(); return { pos: new THREE.Vector3(x0 + dx * t - dz * side, y + 0.1 + hh, z0 + dz * t + dx * side), out: o, s: 0.34 + r() * 0.2, shade: (hh / h - 0.5) * 0.16 }; }, { color });
  parent?.add(g); return g;
}
/** Round bush. */
export function bush(x, y, z, rad = 0.6, parent, { color = 0x3f7a30, seed = 5 } = {}) {
  const g = new THREE.Group(), r = rng(seed);
  cards(g, Math.round(380 * rad * rad + 120), () => { const u = r() * Math.PI * 2, v = Math.acos(2 * r() - 1), k = 0.55 + r() * 0.45, o = new THREE.Vector3(Math.sin(v) * Math.cos(u), Math.cos(v) * 0.8, Math.sin(v) * Math.sin(u)); return { pos: new THREE.Vector3(x + o.x * rad * k, y + rad * 0.9 + o.y * rad * k * 0.85, z + o.z * rad * k), out: o, s: 0.3 + r() * 0.2, shade: o.y * 0.12 }; }, { color });
  parent?.add(g); return g;
}
/** Broadleaf tree (neem / eucalyptus style) with irregular lobed crown. */
export function tree(x, z, { h = 6, crown = 2.6, trunkR = 0.2, y = 0, color = 0x4a7f35, seed = 9, lean = 0 } = {}, parent) {
  const g = new THREE.Group(), r = rng(seed), bark = new THREE.MeshStandardMaterial({ color: 0x4d3b2d, roughness: 1 });
  const th = h * 0.58, trunk = new THREE.Mesh(new THREE.CylinderGeometry(trunkR * 0.65, trunkR * 1.2, th, 10), bark);
  trunk.position.set(x + lean * 0.5, y + th / 2, z); trunk.rotation.z = -lean / th; trunk.castShadow = true; g.add(trunk);
  const lobes = Array.from({ length: 5 + Math.floor(r() * 3) }, () => { const a = r() * 6.28, d = r() * crown * 0.6; return { x: Math.cos(a) * d, z: Math.sin(a) * d, y: (r() - 0.3) * crown * 0.5, rad: crown * (0.55 + r() * 0.35) }; });
  for (const l of lobes) { const br = new THREE.Mesh(new THREE.CylinderGeometry(trunkR * 0.18, trunkR * 0.42, Math.hypot(l.x, l.z, h * 0.15) + 0.5, 6), bark); br.position.set(x + l.x * 0.5 + lean, y + th + h * 0.04, z + l.z * 0.5); br.lookAt(x + l.x + lean, y + th + h * 0.2, z + l.z); br.rotateX(Math.PI / 2); br.castShadow = true; g.add(br); }
  const cy = y + th + crown * 0.5;
  for (const l of lobes) cards(g, Math.round(l.rad * l.rad * 130 + 200), () => { const u = r() * 6.28, v = Math.acos(2 * r() - 1), k = 0.55 + r() * 0.45, o = new THREE.Vector3(Math.sin(v) * Math.cos(u), Math.cos(v), Math.sin(v) * Math.sin(u)); return { pos: new THREE.Vector3(x + lean + l.x + o.x * l.rad * k, cy + l.y + o.y * l.rad * 0.8 * k, z + l.z + o.z * l.rad * k), out: o, s: 0.42 + r() * 0.3, shade: o.y * 0.14 - 0.04 }; }, { color });
  parent?.add(g); return g;
}

let frondMat;
function frondTexture() {
  if (frondMat) return frondMat;
  const c = document.createElement('canvas'); c.width = 512; c.height = 128; const x = c.getContext('2d'); x.clearRect(0, 0, 512, 128); x.lineCap = 'round';
  x.strokeStyle = '#5b7a34'; x.lineWidth = 3; x.beginPath(); x.moveTo(0, 64); x.lineTo(512, 64); x.stroke();
  for (let i = 8; i < 500; i += 6) { const len = 52 * Math.sin((i / 512) * Math.PI) ** 0.6 + 6; x.strokeStyle = `hsl(${92 + (i % 5) * 3},${44 + (i % 4) * 4}%,${22 + (i % 7) * 2.4}%)`; x.lineWidth = 2.4; for (const s of [-1, 1]) { x.beginPath(); x.moveTo(i, 64); x.lineTo(i + 14, 64 + s * len); x.stroke(); } }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  frondMat = new THREE.MeshStandardMaterial({ map: t, alphaTest: 0.35, side: THREE.DoubleSide, roughness: 0.8 }); return frondMat;
}
/** Date / royal palm. */
export function palm(x, z, { h = 7, y = 0, lean = 0.4, seed = 3, fronds = 16 } = {}, parent) {
  const g = new THREE.Group(), r = rng(seed), seg = 14, bark = new THREE.MeshStandardMaterial({ color: 0x6f5d49, roughness: 0.95 });
  let px = x, py = y;
  for (let i = 0; i < seg; i++) {
    const t = i / seg, hh = h / seg, rad = 0.16 - t * 0.05, nx = x + lean * (t + 1 / seg) ** 2 * h * 0.18;
    const c = new THREE.Mesh(new THREE.CylinderGeometry(rad - 0.012, rad + 0.012, hh * 1.04, 10), bark); c.position.set((px + nx) / 2, py + hh / 2, z); c.rotation.z = Math.atan2(px - nx, hh); c.castShadow = true; g.add(c);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(rad + 0.012, 0.02, 6, 12), bark); ring.rotation.x = Math.PI / 2; ring.position.set(nx, py + hh, z); g.add(ring); px = nx; py += hh;
  }
  const mat = frondTexture();
  for (let i = 0; i < fronds; i++) {
    const a = (i / fronds) * Math.PI * 2 + r() * 0.3, len = 2.8 + r() * 1.0, droop = 0.9 + r() * 0.9, up = 0.25 + r() * 0.5;
    const geo = new THREE.PlaneGeometry(len, 0.95, 18, 1), p = geo.attributes.position;
    for (let k = 0; k < p.count; k++) { const u = (p.getX(k) + len / 2) / len; p.setZ(k, -droop * u * u * 1.4 + up * u * (1 - u) * 2); p.setX(k, u * len); }
    geo.computeVertexNormals(); const m = new THREE.Mesh(geo, mat); m.position.set(px, py, z); m.rotation.set(-Math.PI / 2, 0, 0); m.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), a); m.castShadow = true; g.add(m);
  }
  parent?.add(g); return g;
}
