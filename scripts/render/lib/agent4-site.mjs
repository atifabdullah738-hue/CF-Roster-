// agent4: construction-site clutter — brick stacks, cement bags, tools & plant, debris, dry vegetation, neighbours, poles.
import * as THREE from 'three';
import { Mesher, tintVar, lin, rng, makeNoise, fbm } from './agent4-geo.mjs';
import * as M from './agent4-mat.mjs';
import { boxAt, wallWithOpenings, windowUnit, waterTank, acUnit, T } from './arch.mjs';
export { THREE };

const BR = { L: 0.229, H: 0.0755, W: 0.114 };
const clayColor = (r, p = {}) => { const k = r(); return k < 0.1 ? tintVar(p.dark ?? 0x6c4338, r, 0.08, 0.1) : k < 0.28 ? tintVar(p.light ?? 0xb97a58, r, 0.08, 0.08) : tintVar(p.base ?? 0x9b5640, r, 0.1, 0.08); };

/** Cross-stacked brick pile (the usual site stack). Position = centre of the footprint on the ground. */
export function brickStack({ x, z, y = 0, ry = 0, layers = 14, la = [5, 8], lb = [4, 10], seed = 1, parent, missing = 0.0, pal = {}, mesher = null, scale = 1 }) {
  const r = rng(seed), m = mesher || new Mesher(), g = mesher ? null : new THREE.Group(), cs = Math.cos(ry), sn = Math.sin(ry), tr = (px, pz) => [x + px * cs + pz * sn, z - px * sn + pz * cs];
  const gap = 0.004, { L, H, W } = BR;
  for (let k = 0; k < layers; k++) {
    const A = k % 2 === 0, nx = A ? la[0] : lb[1], nz = A ? la[1] : lb[0], bl = A ? L : W, bd = A ? W : L; // along x / along z sizes
    const sx = (nx * (bl + gap)) / 2, sz = (nz * (bd + gap)) / 2, yy = y + k * (H + 0.0015) + H / 2;
    for (let i = 0; i < nx; i++) for (let j = 0; j < nz; j++) {
      if (k >= layers - 3 && r() < missing) continue; if (k === layers - 1 && r() < 0.15) continue;
      const px = -sx + (i + 0.5) * (bl + gap) + (r() - 0.5) * 0.004, pz = -sz + (j + 0.5) * (bd + gap) + (r() - 0.5) * 0.004, [wx, wz] = tr(px, pz);
      m.box(wx, yy + (r() - 0.5) * 0.002, wz, (A ? L : W) * scale, H * scale, (A ? W : L) * scale, { ry: ry + (r() - 0.5) * 0.03, rz: (r() - 0.5) * 0.01, tile: 0.34, uv: [r(), r()], color: clayColor(r, pal) });
    }
  }
  if (g) { m.mesh(M.clay(), g); parent?.add(g); } return g || m;
}
/** Loose heap of bricks (dumped), thrown over a low mound. */
export function brickPile({ x, z, y = 0, rad = 1.2, h = 0.7, count = 160, seed = 1, parent, mesher = null, broken = 0.15 }) {
  const r = rng(seed), m = mesher || new Mesher(), g = mesher ? null : new THREE.Group();
  for (let i = 0; i < count; i++) {
    const a = r() * 6.28, rr = Math.sqrt(r()) * rad, hh = h * Math.pow(Math.max(0, 1 - rr / rad), 0.9) + (r() * 0.08), px = x + Math.cos(a) * rr, pz = z + Math.sin(a) * rr, bro = r() < broken, len = bro ? BR.L * (0.3 + r() * 0.5) : BR.L;
    m.box(px, y + hh + BR.H * 0.5, pz, len, BR.H, BR.W, { rx: (r() - 0.5) * 1.1, ry: r() * 6.28, rz: (r() - 0.5) * 1.1, tile: 0.34, uv: [r(), r()], color: clayColor(r) });
  }
  if (g) { m.mesh(M.clay(), g); parent?.add(g); } return g || m;
}
/** scattered bats, half bricks, stones, wood bits within rect, avoiding exclusion fn */
export function debris({ x0, z0, x1, z1, y = 0.0, count = 120, seed = 1, parent, avoid = null, heightAt = null }) {
  const r = rng(seed), br = new Mesher(), wd = new Mesher(), st = new Mesher(), cm = new Mesher();
  for (let i = 0; i < count; i++) {
    const px = x0 + r() * (x1 - x0), pz = z0 + r() * (z1 - z0); if (avoid && avoid(px, pz)) continue; const yy = (heightAt ? heightAt(px, pz) : y), k = r();
    if (k < 0.45) { const len = BR.L * (0.25 + r() * 0.75); br.box(px, yy + BR.H * 0.4, pz, len, BR.H, BR.W * (0.6 + r() * 0.4), { ry: r() * 6.28, rz: (r() - 0.5) * 0.3, rx: (r() - 0.5) * 0.2, tile: 0.34, uv: [r(), r()], color: clayColor(r) }); }
    else if (k < 0.7) { const s = 0.04 + r() * 0.1; st.box(px, yy + s * 0.3, pz, s * 1.4, s * 0.8, s, { ry: r() * 6.28, rz: (r() - 0.5) * 0.5, tile: 0.5, uv: [r(), r()], color: tintVar(0x8e8678, r, 0.15, 0.05) }); }
    else if (k < 0.85) { const len = 0.2 + r() * 0.9, w = 0.04 + r() * 0.08; wd.box(px, yy + 0.02, pz, len, 0.035, w, { ry: r() * 6.28, rz: (r() - 0.5) * 0.15, tile: 2.5, uv: [r(), r()] }); }
    else { const s = 0.08 + r() * 0.2; cm.box(px, yy + s * 0.25, pz, s, s * 0.5, s * (0.6 + r() * 0.5), { ry: r() * 6.28, rz: (r() - 0.5) * 0.3, tile: 0.7, uv: [r(), r()] }); }
  }
  const g = new THREE.Group(); br.mesh(M.clay(), g); wd.mesh(M.timber({ color: 0xbfa77d, seed: 23, weather: 1, splatter: 0.5 }), g); st.mesh(M.solidMat(0xffffff, { roughness: 0.95, vertexColors: true }), g); cm.mesh(M.mortar(0x9d998f, 5), g); parent?.add(g); return g;
}

// ------------------------------------------------------------------------------------------------ CEMENT BAGS
function bagGeometry(L = 0.56, Wd = 0.38, T0 = 0.125, r = Math.random, nu = 16, nv = 12) {
  const nz = makeNoise(Math.floor(r() * 1000)), pos = [], uv = [], idx = [], rowT = nu + 1;
  const hf = (u, v, up) => { const su = Math.pow(Math.sin(Math.PI * u), 0.55), sv = Math.pow(Math.sin(Math.PI * v), 0.5); let h = (T0 / 2) * su * sv * (up ? 1 : 0.8); h *= 1 + 0.12 * (nz(u * 5 + 3, v * 4) - 0.5) + 0.08 * Math.sin(u * 14 + v * 5) * (up ? 1 : 0.4); return h; };
  for (const up of [true, false]) for (let j = 0; j <= nv; j++) for (let i = 0; i <= nu; i++) { const u = i / nu, v = j / nv, x = (u - 0.5) * L, z = (v - 0.5) * Wd, y = (up ? 1 : -1) * hf(u, v, up); pos.push(x, y, z); uv.push(up ? v : 1 - v, up ? u : 1 - u); }
  const off = (nv + 1) * rowT;
  for (const up of [true, false]) for (let j = 0; j < nv; j++) for (let i = 0; i < nu; i++) { const a = (up ? 0 : off) + j * rowT + i, b = a + 1, c = a + rowT, d = c + 1; if (up) idx.push(a, c, b, b, c, d); else idx.push(a, b, c, b, d, c); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals(); return g;
}
export function cementStack({ x, z, y = 0, ry = 0, layers = 7, nx = 2, nz = 2, seed = 1, parent, scheme = 0, pallet = true, lean = 0 }) {
  const r = rng(seed), g = new THREE.Group(), mats = [0, 1, 2, 3].map((s) => M.cementBag(s)), L = 0.56, Wd = 0.38, TH = 0.112;
  if (pallet) { const pm = new Mesher(); const pw = nx * L + 0.1, pd = nz * Wd + 0.1; for (const dz of [-1, 0, 1]) pm.box(0, 0.06, dz * (pd / 2 - 0.05), pw, 0.1, 0.09, { tile: 2.5, uv: [r(), r()] }); for (let k = 0; k < 6; k++) pm.box(-pw / 2 + 0.04 + (k * (pw - 0.08)) / 5, 0.12, 0, 0.1, 0.025, pd, { tile: 2.5, uv: [r(), r()] }); pm.mesh(M.timber({ color: 0x9a8260, seed: 24, weather: 1 }), g); }
  const y0 = pallet ? 0.133 : 0;
  for (let k = 0; k < layers; k++) {
    const flip = k % 2; const cnt = nx * nz;
    for (let i = 0; i < cnt; i++) {
      const gx = i % nx, gz = Math.floor(i / nx), bx = (gx - (nx - 1) / 2) * L + (flip ? 0.06 : -0.03) + (r() - 0.5) * 0.02, bz = (gz - (nz - 1) / 2) * Wd + (flip ? -0.02 : 0.03) + (r() - 0.5) * 0.02;
      const geo = bagGeometry(L, Wd, TH, r), mesh = new THREE.Mesh(geo, mats[(scheme + (r() < 0.12 ? 1 : 0)) % 4]); mesh.position.set(bx, y0 + k * TH * 0.93 + TH * 0.5, bz); mesh.rotation.set((r() - 0.5) * 0.03, (flip ? 0.0 : 0.0) + (r() - 0.5) * 0.06, (r() - 0.5) * 0.03); if (r() < 0.5) mesh.rotation.y += Math.PI; mesh.castShadow = true; mesh.receiveShadow = true; g.add(mesh);
    }
  }
  g.position.set(x, y, z); g.rotation.y = ry; g.rotation.z = lean; parent?.add(g); return g;
}
/** open torn bag lying, spilling grey powder */
export function looseBag({ x, z, y = 0, ry = 0, parent, seed = 3, scheme = 1 }) { const r = rng(seed), g = new THREE.Group(), mesh = new THREE.Mesh(bagGeometry(0.56, 0.38, 0.06, r), M.cementBag(scheme)); mesh.position.y = 0.03; mesh.castShadow = true; g.add(mesh); const sp = new THREE.Mesh(new THREE.SphereGeometry(0.2, 18, 10), M.mortar(0x8f8f8a, 8)); sp.scale.set(1.2, 0.12, 0.9); sp.position.set(0.3, 0.02, 0.1); sp.receiveShadow = true; g.add(sp); g.position.set(x, y, z); g.rotation.y = ry; parent?.add(g); return g; }

// ------------------------------------------------------------------------------------------------ PLANT & PROPS
const lathe = (pts, seg = 28) => new THREE.LatheGeometry(pts.map((p) => new THREE.Vector2(p[0], p[1])), seg);
function mesh(geo, mat, parent, { cast = true, receive = true } = {}) { const m = new THREE.Mesh(geo, mat); m.castShadow = cast; m.receiveShadow = receive; parent?.add(m); return m; }

/** 200 L drum (steel / plastic) */
export function drum({ x, z, y = 0, color = 0x1f4f9e, plasticDrum = true, parent, seed = 1, h = 0.88, rad = 0.29, lid = true, tilt = 0, ry = 0 }) {
  const g = new THREE.Group(), r = rng(seed);
  const prof = [[0, 0], [rad * 0.9, 0], [rad, 0.02], [rad, 0.1], [rad * 0.96, 0.115], [rad, 0.13], [rad, h * 0.5 - 0.05], [rad * 0.96, h * 0.5 - 0.035], [rad, h * 0.5 - 0.02], [rad, h * 0.5 + 0.02], [rad * 0.96, h * 0.5 + 0.035], [rad, h * 0.5 + 0.05], [rad, h - 0.13], [rad * 0.96, h - 0.115], [rad, h - 0.1], [rad, h - 0.02], [rad * 0.92, h], [rad * 0.84, h], [rad * 0.8, h - 0.015], [rad * 0.7, h - 0.02], [0, h - 0.02]];
  const mat = plasticDrum ? M.solidMat(color, { roughness: 0.42 }) : M.paintedSteel(color, { seed: 4 + seed, wear: 0.6, splatter: 0.3 });
  mesh(lathe(prof, 36), mat, g);
  if (lid && plasticDrum) { mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.03, 14), M.solidMat(color, { roughness: 0.4 }), g).position.set(rad * 0.45, h - 0.005, 0); }
  g.position.set(x, y, z); g.rotation.set(tilt, ry, 0); parent?.add(g); return g;
}
/** Vertical black PE water tank on the ground. */
export function pe_tank({ x, z, y = 0, r = 0.62, h = 1.6, parent, color = 0x1d1f21 }) {
  const g = new THREE.Group(), pts = [[0, 0], [r * 0.97, 0], [r, 0.03]]; for (let k = 0; k < 6; k++) { const yy = 0.1 + k * (h - 0.35) / 6; pts.push([r, yy], [r * 1.025, yy + 0.04], [r, yy + 0.08]); } pts.push([r, h - 0.2], [r * 0.9, h - 0.08], [r * 0.7, h - 0.02], [r * 0.35, h + 0.04], [r * 0.28, h + 0.04]); pts.push([r * 0.28, h + 0.07], [0, h + 0.07]);
  mesh(lathe(pts, 48), M.solidMat(color, { roughness: 0.38 }), g); mesh(new THREE.CylinderGeometry(r * 0.2, r * 0.2, 0.05, 16), M.solidMat(0x2c2f33, { roughness: 0.45 }), g).position.y = h + 0.1;
  g.position.set(x, y, z); parent?.add(g); return g;
}
/** ghamela / tasla: shallow steel mortar pan, optionally mortar-filled */
export function ghamela({ x, z, y = 0, fill = 0.7, rad = 0.3, parent, seed = 1, ry = 0, stack = 1 }) {
  const g = new THREE.Group(), r = rng(seed), d = 0.11;
  const prof = [[0, 0], [rad * 0.55, 0], [rad * 0.8, 0.02], [rad * 0.96, d * 0.65], [rad, d], [rad * 1.02, d + 0.006], [rad * 1.02, d + 0.012], [rad * 0.98, d + 0.005], [rad * 0.93, d - 0.01], [rad * 0.76, 0.01], [rad * 0.5, 0.0], [0, 0.0]];
  for (let k = 0; k < stack; k++) { const m = mesh(lathe(prof.slice(0, 9).concat([[rad * 0.9, d - 0.012], [rad * 0.75, 0.014], [0, 0.011]]), 40), M.paintedSteel(0x232323, { seed: 5 + k + seed, wear: 0.9, splatter: 0.6 }), g); m.position.y = k * 0.04; m.material.side = THREE.DoubleSide; }
  if (fill > 0) { const mm = mesh(new THREE.SphereGeometry(rad * 0.93, 24, 12, 0, 6.283, 0, Math.PI / 2), M.mortar(0x9a968c, 11), g); mm.scale.set(1, 0.25 * fill + 0.06, 1); mm.position.y = d * 0.55 + 0.01; const p = mm.geometry.attributes.position, nz = makeNoise(seed + 5); for (let i = 0; i < p.count; i++) { const xx = p.getX(i), zz = p.getZ(i); p.setY(i, p.getY(i) + (nz(xx * 9, zz * 9) - 0.5) * 0.03); } mm.geometry.computeVertexNormals(); mm.material = M.mortar(0x948f85, 11); }
  g.position.set(x, y, z); g.rotation.y = ry; g.rotation.x = (r() - 0.5) * 0.02; parent?.add(g); return g;
}
/** pail (bucket) — plastic or steel; optional paint inside */
export function bucket({ x, z, y = 0, rad = 0.15, h = 0.28, color = 0xd9d4c8, parent, ry = 0, fillColor = null, fill = 0.7, lid = false, metal = false, drips = true, seed = 1 }) {
  const g = new THREE.Group(), r = rng(seed), rt = rad, rb = rad * 0.82, ring = metal ? 0.0 : 0.012;
  const prof = [[0, 0.004], [rb * 0.9, 0.004], [rb, 0.01], [rt * 0.99, h - 0.01], [rt * 1.04, h], [rt * 1.04, h + 0.012], [rt * 0.99, h + 0.006], [rt * 0.96, h - 0.012], [rb * 0.94, 0.02], [0, 0.02]];
  const mat = metal ? M.paintedSteel(color, { seed: 5 + seed, wear: 0.7, splatter: 0.7 }) : M.solidMat(color, { roughness: 0.5 }); void ring;
  const body = mesh(lathe(prof, 40), mat, g); body.material.side = THREE.DoubleSide;
  if (fillColor !== null) { const pm = M.solidMat(fillColor, { roughness: 0.35 }); mesh(new THREE.CylinderGeometry(rt * 0.95 - 0.004, rb * 0.95 + (rt - rb) * fill * 0.9, 0.004, 40), pm, g, { cast: false }).position.y = h * fill + 0.01; }
  if (drips && fillColor !== null) { for (let k = 0; k < 4; k++) { const a = r() * 6.28, dl = 0.05 + r() * 0.12; mesh(new THREE.BoxGeometry(0.012 + r() * 0.01, dl, 0.003), M.solidMat(fillColor, { roughness: 0.4 }), g).position.set(Math.cos(a) * rt * 1.0, h - dl / 2 - 0.01, Math.sin(a) * rt * 1.0); g.children[g.children.length - 1].rotation.y = -a + Math.PI / 2; } }
  // handle
  const hp = []; for (let k = 0; k <= 12; k++) { const a = Math.PI * (k / 12); hp.push([Math.cos(a) * (rt * 1.02), h * 0.88 + Math.sin(a) * 0.12, 0]); }
  const hm = new Mesher(); hm.path(hp, 0.0022, { sides: 4, color: lin(0x9a9a9a) }); hm.mesh(M.solidMat(0xffffff, { roughness: 0.4, metalness: 0.85, vertexColors: true }), g);
  if (lid) { const lm = mesh(new THREE.CylinderGeometry(rt * 1.05, rt * 1.05, 0.02, 40), mat, g); lm.position.set(0.22, 0.01, 0); lm.rotation.z = 0; lm.position.set(rad * 2.4, 0.01, 0); }
  g.position.set(x, y, z); g.rotation.y = ry; parent?.add(g); return g;
}
/** paint tin (metal 4 L / 1 gallon) with printed label colour band, no text. */
export function paintTin({ x, z, y = 0, rad = 0.1, h = 0.19, color = 0xe9e2cf, band = 0x2b6cb0, parent, ry = 0, open = false, lidOff = false, drips = 0.5, seed = 1 }) {
  const g = new THREE.Group(), r = rng(seed), c = document.createElement('canvas'); c.width = 256; c.height = 128; const cx = c.getContext('2d');
  const hex = (n) => '#' + n.toString(16).padStart(6, '0'); cx.fillStyle = '#cfd1d2'; cx.fillRect(0, 0, 256, 128); cx.fillStyle = hex(band); cx.fillRect(0, 22, 256, 84); cx.fillStyle = hex(color); cx.fillRect(0, 44, 256, 40); cx.fillStyle = '#ffffff'; cx.fillRect(14, 52, 70, 6); cx.fillRect(14, 64, 52, 5); cx.fillStyle = hex(band); cx.beginPath(); cx.arc(206, 64, 22, 0, 6.28); cx.fill(); cx.fillStyle = '#fff'; cx.beginPath(); cx.arc(206, 64, 12, 0, 6.28); cx.fill();
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; const body = new THREE.MeshStandardMaterial({ map: t, metalness: 0.7, roughness: 0.4 });
  const prof = [[0, 0], [rad * 0.96, 0], [rad, 0.006], [rad, h - 0.012], [rad * 1.03, h - 0.008], [rad * 1.03, h + 0.002], [rad * 0.96, h + 0.002]];
  mesh(lathe(prof, 40), body, g); const rim = M.steel(0xbfc2c4, { roughness: 0.35 }); mesh(new THREE.TorusGeometry(rad * 0.98, 0.006, 6, 40), rim, g).rotation.x = Math.PI / 2; g.children[g.children.length - 1].position.y = h + 0.002;
  const pm = M.solidMat(color, { roughness: 0.3 });
  if (open) { mesh(new THREE.CylinderGeometry(rad * 0.95, rad * 0.95, 0.004, 40), pm, g, { cast: false }).position.y = h - 0.022; for (let k = 0; k < 4; k++) { const a = r() * 6.28, dl = 0.03 + r() * 0.08; const d = mesh(new THREE.BoxGeometry(0.012, dl, 0.004), pm, g, { cast: false }); d.position.set(Math.cos(a) * rad * 1.03, h - dl / 2, Math.sin(a) * rad * 1.03); d.rotation.y = -a + Math.PI / 2; } }
  else mesh(new THREE.CylinderGeometry(rad * 0.97, rad * 0.97, 0.012, 40), M.steel(0xc8cacb, { roughness: 0.38 }), g).position.y = h;
  if (lidOff) { const l = mesh(new THREE.CylinderGeometry(rad * 1.04, rad * 1.04, 0.014, 40), M.steel(0xc8cacb, { roughness: 0.38 }), g); l.position.set(rad * 2.5, 0.007, rad * 0.4); const pdisc = mesh(new THREE.CylinderGeometry(rad * 0.8, rad * 0.8, 0.003, 30), pm, g, { cast: false }); pdisc.position.set(rad * 2.5, 0.0155, rad * 0.4); }
  if (drips > 0 && open) { const dm = mesh(new THREE.CylinderGeometry(rad * 1.06, rad * 1.06, 0.006, 40, 1, true), pm, g, { cast: false }); dm.position.y = h * 0.8; }
  g.position.set(x, y, z); g.rotation.y = ry; parent?.add(g); return g;
}
export function wheelbarrow({ x, z, y = 0, ry = 0, color = 0x2f5fa8, parent, seed = 1, load = 0.0 }) {
  const g = new THREE.Group(), r = rng(seed), m = new Mesher(), steelM = M.paintedSteel(color, { seed: 3 + seed, wear: 0.8, splatter: 0.8 }); steelM.side = THREE.DoubleSide;
  const V = (a, b, c) => new THREE.Vector3(a, b, c);
  // tub (x forward = +x): top rect 0.8 x 0.62 at y=0.62, bottom 0.42 x 0.3 at y=0.36
  const T1 = (sx, sz) => [sx * 0.4, 0.66, sz * 0.31], B1 = (sx, sz) => [sx * 0.19, 0.38, sz * 0.15];
  const Q = (a, b, c, d) => m.quad(V(...a), V(...b), V(...c), V(...d), { uv: [[0, 0], [1, 0], [1, 1], [0, 1]] });
  Q(B1(1, 1), B1(1, -1), T1(1, -1), T1(1, 1)); Q(B1(-1, -1), B1(-1, 1), T1(-1, 1), T1(-1, -1)); Q(B1(-1, 1), B1(1, 1), T1(1, 1), T1(-1, 1)); Q(B1(1, -1), B1(-1, -1), T1(-1, -1), T1(1, -1)); Q(B1(-1, -1), B1(1, -1), B1(1, 1), B1(-1, 1));
  m.mesh(steelM, g);
  const tm = new Mesher(), fr = lin(0x2a2a2a); const tube = (a, b, rr = 0.016) => tm.tube(a, b, rr, { sides: 8, color: fr });
  for (const s of [-1, 1]) { tube([-0.85, 0.72, s * 0.3], [-0.2, 0.42, s * 0.19], 0.019); tube([-0.2, 0.42, s * 0.19], [0.5, 0.36, s * 0.12]); tube([-0.5, 0.58, s * 0.26], [-0.46, 0.0, s * 0.3]); tube([-0.85, 0.72, s * 0.3], [-0.9, 0.72, s * 0.3], 0.03); }
  tube([0.55, 0.36, 0.0], [0.55, 0.2, 0.12]); tube([0.55, 0.36, 0.0], [0.55, 0.2, -0.12]); tube([0.55, 0.2, 0.12], [0.55, 0.2, -0.12], 0.012); tm.tube([-0.5, 0.0, 0.3], [-0.5, 0.0, -0.3], 0.02, { sides: 6, color: fr });
  tm.mesh(M.solidMat(0xffffff, { roughness: 0.6, metalness: 0.5, vertexColors: true }), g);
  const wheel = new THREE.Group(); mesh(new THREE.TorusGeometry(0.17, 0.052, 10, 28), M.solidMat(0x1a1a1a, { roughness: 0.9 }), wheel); mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.07, 18), M.steel(0x8a8a8a, { roughness: 0.5, rust: 0.4 }), wheel).rotation.x = Math.PI / 2; wheel.position.set(0.55, 0.22, 0); g.add(wheel);
  // grips
  for (const s of [-1, 1]) { const gr = mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.2, 10), M.solidMat(0x151515, { roughness: 0.9 }), g); gr.rotation.z = Math.PI / 2 - 0.4; gr.position.set(-0.93, 0.74, s * 0.3); }
  if (load > 0) { const lm = mesh(new THREE.SphereGeometry(0.34, 24, 10, 0, 6.283, 0, Math.PI / 2), M.mortar(0x939088, 12), g); lm.scale.set(1.05, 0.5 * load, 0.8); lm.position.set(0.0, 0.5, 0); }
  g.position.set(x, y, z); g.rotation.y = ry; parent?.add(g); return g;
}
export function mixer({ x, z, y = 0, ry = 0, color = 0xd0501f, parent, seed = 1, tilt = 0.7 }) {
  const g = new THREE.Group(), steelM = M.paintedSteel(color, { seed: 5 + seed, wear: 0.7, splatter: 0.9 }), dark = M.paintedSteel(0x2a2c2e, { seed: 2, wear: 0.4, splatter: 0.6 }); steelM.side = THREE.DoubleSide;
  const fm = new Mesher(), fc = lin(0x2c2f31), tube = (a, b, rr = 0.026) => fm.tube(a, b, rr, { sides: 8, color: fc });
  for (const s of [-1, 1]) { tube([-0.45, 0.35, s * 0.4], [0.5, 0.35, s * 0.4]); tube([-0.45, 0.35, s * 0.4], [-0.1, 1.2, s * 0.22]); tube([0.5, 0.35, s * 0.4], [0.15, 1.2, s * 0.22]); }
  tube([-0.45, 0.35, -0.4], [-0.45, 0.35, 0.4]); tube([0.5, 0.35, -0.4], [0.5, 0.35, 0.4]); fm.tube([0.0, 0.2, -0.55], [0.0, 0.2, 0.55], 0.02, { sides: 8, color: lin(0x777777) }); fm.mesh(M.solidMat(0xffffff, { roughness: 0.55, metalness: 0.6, vertexColors: true }), g);
  const pivot = new THREE.Group(); pivot.position.set(0, 1.2, 0); pivot.rotation.z = tilt; g.add(pivot);
  const R = 0.4, prof = [[0.0, -0.46], [0.16, -0.46], [0.25, -0.43], [0.36, -0.33], [R, -0.12], [R, 0.1], [0.36, 0.32], [0.26, 0.44], [0.2, 0.52], [0.205, 0.55], [0.18, 0.55], [0.176, 0.5], [0.22, 0.4], [0.32, 0.3], [0.34, 0.2], [0.34, -0.12], [0.31, -0.26], [0.22, -0.38], [0.0, -0.4]];
  const drumM = mesh(lathe(prof, 40), steelM, pivot); drumM.rotation.z = 0; drumM.position.y = 0;
  const ringM = mesh(new THREE.TorusGeometry(R * 0.998, 0.025, 8, 40), dark, pivot); ringM.rotation.x = Math.PI / 2; ringM.position.y = -0.0;
  const cem = mesh(new THREE.TorusGeometry(0.19, 0.03, 8, 30), M.mortar(0x8f8d86, 13), pivot); cem.rotation.x = Math.PI / 2; cem.position.y = 0.55;
  const mt = mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.3, 18), dark, g); mt.rotation.x = Math.PI / 2; mt.position.set(-0.2, 0.5, 0.0); mesh(new THREE.BoxGeometry(0.22, 0.22, 0.26), dark, g).position.set(-0.25, 0.5, 0);
  for (const s of [-1, 1]) { const wh = new THREE.Group(); mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.1, 24), M.solidMat(0x151515, { roughness: 0.9 }), wh).rotation.x = Math.PI / 2; mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.12, 14), M.steel(0x777777, { rust: 0.5 }), wh).rotation.x = Math.PI / 2; wh.position.set(0, 0.2, s * 0.58); g.add(wh); }
  const hw = mesh(new THREE.TorusGeometry(0.12, 0.012, 6, 20), dark, g); hw.position.set(0.5, 0.55, 0.45); hw.rotation.x = Math.PI / 2;
  g.position.set(x, y, z); g.rotation.y = ry; parent?.add(g); return g;
}
/** shovel; blade tip at origin pointing down, handle along +y tilted. */
export function shovel({ x, y = 0, z, ry = 0, lean = 0.28, parent, seed = 1, h = 1.1, planted = false }) {
  const g = new THREE.Group(), r = rng(seed), sh = new THREE.Shape(); sh.moveTo(0, 0); sh.bezierCurveTo(0.07, 0.03, 0.12, 0.1, 0.13, 0.26); sh.lineTo(-0.13, 0.26); sh.bezierCurveTo(-0.12, 0.1, -0.07, 0.03, 0, 0);
  const geo = new THREE.ExtrudeGeometry(sh, { depth: 0.003, bevelEnabled: false, curveSegments: 10 }); geo.translate(0, 0, -0.0015); const p = geo.attributes.position; for (let i = 0; i < p.count; i++) p.setZ(i, p.getZ(i) + Math.pow(p.getX(i) * 4, 2) * 0.012);
  geo.computeVertexNormals(); const blade = mesh(geo, M.paintedSteel(0x5a5d60, { seed: 6 + seed, wear: 1, splatter: 0.6 }), g); blade.rotation.x = -0.45;
  mesh(new THREE.CylinderGeometry(0.014, 0.016, h, 8), M.timber({ color: 0xb9955f, seed: 27, weather: 0.6 }), g).position.set(0, 0.26 + h / 2 - 0.02, 0.12); g.children[1].rotation.x = 0.02;
  g.position.set(x, y, z); g.rotation.set(0, ry, 0); const wrap = new THREE.Group(); wrap.add(g); wrap.rotation.x = -lean; wrap.position.set(0, 0, 0); const out = new THREE.Group(); out.add(wrap); out.position.set(x, y, z); out.rotation.y = ry; g.position.set(0, 0, 0); g.rotation.set(0, 0, 0); parent?.add(out); void planted; return out;
}
/** steel tamper / pickaxe etc. omitted. Planks stack */
export function plankStack({ x, z, y = 0, ry = 0, n = 8, len = 2.4, w = 0.24, t = 0.04, seed = 1, parent, layers = 4, gaps = true }) {
  const r = rng(seed), m = new Mesher(), g = new THREE.Group();
  for (let l = 0; l < layers; l++) for (let i = 0; i < n; i++) m.box((r() - 0.5) * 0.06, y + 0.1 + l * (t + 0.001) + t / 2 + (l === 0 ? 0 : 0), (i - (n - 1) / 2) * (w + 0.004) + (r() - 0.5) * 0.01, len * (0.96 + r() * 0.04), t, w, { tile: 2.5, uv: [r(), r()], ry: (r() - 0.5) * 0.01 });
  for (const s of [-0.8, 0.8]) m.box(s, y + 0.05, 0, 0.1, 0.1, n * (w + 0.004) + 0.05, { tile: 2.5, uv: [r(), r()] });
  m.mesh(M.timber({ color: 0xc4ab82, seed: 26, weather: 1, splatter: 0.3, knots: 6 }), g); g.position.set(x, 0, z); g.rotation.y = ry; parent?.add(g); return g;
}
/** coiled hose on the ground (green/black) */
export function hoseCoil({ x, z, y = 0, rad = 0.28, turns = 4, color = 0x2c6a38, parent, seed = 1 }) { const r = rng(seed), m = new Mesher(), pts = []; for (let i = 0; i <= turns * 28; i++) { const a = (i / 28) * Math.PI * 2, rr = rad * (1 - 0.08 * (i / 28)), yy = y + 0.017 + Math.floor(i / 56) * 0.0 * 0.034; pts.push([x + Math.cos(a) * rr * (1 + (r() - 0.5) * 0.004), yy, z + Math.sin(a) * rr]); } m.path(pts, 0.017, { sides: 8, tileV: 0.1 }); const g = new THREE.Group(); m.mesh(M.solidMat(color, { roughness: 0.5 }), g); parent?.add(g); return g; }
/** drape of thin plastic/tarp: a wavy sheet over (x0..x1,z0..z1) at height fn */
export function tarpSheet({ x0, z0, x1, z1, y = 0, heightFn = () => 0, color = 0x3a78b8, seed = 1, parent, res = 0.06, sag = 0.02 }) {
  const nx = Math.max(2, Math.round((x1 - x0) / res)), nz = Math.max(2, Math.round((z1 - z0) / res)), g = new THREE.PlaneGeometry(x1 - x0, z1 - z0, nx, nz); g.rotateX(-Math.PI / 2); g.translate((x0 + x1) / 2, 0, (z0 + z1) / 2);
  const n = makeNoise(seed), p = g.attributes.position; for (let i = 0; i < p.count; i++) { const wx = p.getX(i), wz = p.getZ(i); p.setY(i, y + heightFn(wx, wz) + 0.012 + (fbm(n, wx * 4, wz * 4, 3) - 0.5) * sag * 2); } g.computeVertexNormals();
  const uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, p.getX(i) / 1.5, p.getZ(i) / 1.5);
  return mesh(g, M.tarp(color, seed), parent);
}
export function sandbagsOrCrate() { return null; }

// ------------------------------------------------------------------------------------------------ VEGETATION
/** dry grass / weed tufts (alpha cards) in a rect; heightFn gives ground y. */
export function dryGrass({ x0, z0, x1, z1, count = 400, seed = 1, parent, avoid = null, heightFn = () => 0, scale = [0.35, 0.9], tone = 0 }) {
  const r = rng(seed);
  const mat = M.memo(`tuft${tone}`, () => {
    const c = document.createElement('canvas'); c.width = 256; c.height = 256; const x = c.getContext('2d'), q = rng(5 + tone); x.lineCap = 'round';
    const pal = tone === 0 ? [[60, 38, 62], [52, 30, 58], [64, 18, 46], [78, 28, 40], [88, 24, 34]] : [[84, 32, 38], [90, 34, 34], [70, 30, 52], [60, 28, 60]];
    for (let i = 0; i < 150; i++) { const bx = 128 + (q() - 0.5) * 120, h = 70 + q() * 170, a = (q() - 0.5) * 1.1, p = pal[Math.floor(q() * pal.length)]; x.strokeStyle = `hsl(${p[0] + (q() - 0.5) * 10},${p[1] + q() * 10}%,${p[2] + (q() - 0.5) * 14}%)`; x.lineWidth = 0.9 + q() * 1.5; x.beginPath(); x.moveTo(bx, 256); x.quadraticCurveTo(bx + a * h * 0.25, 256 - h * 0.55, bx + a * h * 0.7, 256 - h); x.stroke(); }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; const m = new THREE.MeshStandardMaterial({ map: t, alphaTest: 0.3, side: THREE.DoubleSide, roughness: 1 }); return m;
  });
  const geo = new THREE.BufferGeometry(), P = [], N = [], U = [], I = []; for (let k = 0; k < 3; k++) { const a = (k / 3) * Math.PI, c = Math.cos(a) * 0.5, s = Math.sin(a) * 0.5, b = P.length / 3; P.push(-c, 0, -s, c, 0, s, c, 1, s, -c, 1, -s); for (let q = 0; q < 4; q++) N.push(0, 1, 0); U.push(0, 0, 1, 0, 1, 1, 0, 1); I.push(b, b + 1, b + 2, b, b + 2, b + 3); }
  geo.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); geo.setAttribute('normal', new THREE.Float32BufferAttribute(N, 3)); geo.setAttribute('uv', new THREE.Float32BufferAttribute(U, 2)); geo.setIndex(I);
  const im = new THREE.InstancedMesh(geo, mat, count), d = new THREE.Object3D(), c = new THREE.Color(); let n = 0;
  for (let i = 0; i < count; i++) { const px = x0 + r() * (x1 - x0), pz = z0 + r() * (z1 - z0); if (avoid && avoid(px, pz)) continue; const s = scale[0] + r() * (scale[1] - scale[0]); d.position.set(px, heightFn(px, pz) - 0.02, pz); d.rotation.set(0, r() * 6.28, 0); d.scale.set(s * (0.8 + r() * 0.5), s * (0.7 + r() * 0.6), s * (0.8 + r() * 0.5)); d.updateMatrix(); im.setMatrixAt(n, d.matrix); c.setRGB(0.85 + r() * 0.3, 0.85 + r() * 0.3, 0.8 + r() * 0.3); im.setColorAt(n, c); n++; }
  im.count = n; im.castShadow = false; im.receiveShadow = true; parent?.add(im); return im;
}

// ------------------------------------------------------------------------------------------------ UTILITY / CONTEXT
/** simple RCC/steel utility pole with cross arm and a few catenary wires toward targets */
export function utilityPole({ x, z, h = 9, parent, arm = 1.6, wires = [], seed = 1 }) {
  const g = new THREE.Group(), r = rng(seed), pm = M.concrete ? null : null; void pm; const col = M.solidMat(0x9a9890, { roughness: 0.95 });
  mesh(new THREE.CylinderGeometry(0.1, 0.17, h, 12), col, g).position.set(0, h / 2, 0); const am = M.steel(0x4a4c4c, { roughness: 0.5, rust: 0.3 });
  mesh(new THREE.BoxGeometry(arm, 0.08, 0.1), am, g).position.set(0, h - 0.4, 0); mesh(new THREE.BoxGeometry(arm * 0.8, 0.08, 0.1), am, g).position.set(0, h - 1.2, 0);
  const ins = M.solidMat(0x6f5a46, { roughness: 0.25 }); for (const yy of [h - 0.4, h - 1.2]) for (const sx of [-1, 0, 1]) mesh(new THREE.CylinderGeometry(0.03, 0.045, 0.14, 8), ins, g).position.set(sx * arm * 0.4, yy + 0.1, 0);
  g.position.set(x, 0, z); parent?.add(g); return g;
}
export function wire({ a, b, sag = 0.5, parent, rad = 0.008, color = 0x1a1a1a, n = 24 }) { const m = new Mesher(), pts = []; for (let i = 0; i <= n; i++) { const t = i / n; pts.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t - sag * 4 * t * (1 - t), a[2] + (b[2] - a[2]) * t]); } m.path(pts, rad, { sides: 4, color: lin(color) }); const g = new THREE.Group(); m.mesh(M.solidMat(0xffffff, { roughness: 0.6, vertexColors: true }), g, { cast: false }); parent?.add(g); return g; }

/** background house (plastered concrete-frame house, 2-3 storeys). front faces +Z at z. Windows are merged for speed. */
export function neighbourHouse({ x, z, w = 10, d = 12, floors = 2, color = 0xe2d8c3, seed = 1, parent, trim = 0x8c8478, ry = 0, tank = true, balcony = true, storey = 3.1, accent = null, windowCols = 3, gate = true, stain = true }) {
  const r = rng(seed), g = new THREE.Group(), pl = M.detailize(T.plaster(color, { tileM: 3.2, seed: 40 + (seed % 5) }).clone(), { scale: 0.8, strength: 0.35, dustH: 1.0, dustColor: 0x9a8a70, dustAmt: 0.5, key: 'nb' + (seed % 3) }), tr = T.plaster(trim, { tileM: 3, seed: 55 + (seed % 3) });
  const ac = accent ? T.plaster(accent, { tileM: 3, seed: 60 + (seed % 3) }) : pl, H = floors * storey + 0.5;
  const fr = new Mesher(), gl = new Mesher(), dk = new Mesher(), rail = new Mesher(); const frameC = lin([0x4a3f35, 0x2b2b2b, 0x6a5a48, 0x3e3a36][seed % 4]);
  boxAt(0, 0, -d, w, 0.5, 0, tr, g);
  for (let f = 0; f < floors; f++) {
    const y0 = f === 0 ? 0.5 : f * storey + 0.5, y1 = (f + 1) * storey + 0.5, ops = [], nW = windowCols;
    for (let i = 0; i < nW; i++) { const ww = 1.1 + r() * 0.5, cx = ((i + 0.5) / nW) * w, hh = 1.3 + r() * 0.35; ops.push({ x: cx - ww / 2, y: y0 + 0.95, w: ww, h: hh }); }
    if (f === 0 && gate) ops[1] = { x: ops[1].x, y: 0.5, w: 1.1, h: 2.2 };
    wallWithOpenings(0, w, y0, y1, -0.23, 0.23, ops, f % 2 && accent ? ac : pl, g); boxAt(0, y0, -d, w, y1, -0.23, pl, g);
    for (const o of ops) {
      const zf = -0.1; gl.quad(new THREE.Vector3(o.x, o.y, zf), new THREE.Vector3(o.x + o.w, o.y, zf), new THREE.Vector3(o.x + o.w, o.y + o.h, zf), new THREE.Vector3(o.x, o.y + o.h, zf));
      dk.box(o.x + o.w / 2, o.y + o.h / 2, -0.4, o.w, o.h, 0.05, { color: lin([0x6a6258, 0x4a463f, 0x8c8272, 0x9a8f7a][Math.floor(r() * 4)]) });
      const ft = 0.05; fr.box(o.x + o.w / 2, o.y + ft / 2, zf, o.w, ft, 0.08, { color: frameC }); fr.box(o.x + o.w / 2, o.y + o.h - ft / 2, zf, o.w, ft, 0.08, { color: frameC }); fr.box(o.x + ft / 2, o.y + o.h / 2, zf, ft, o.h, 0.08, { color: frameC }); fr.box(o.x + o.w - ft / 2, o.y + o.h / 2, zf, ft, o.h, 0.08, { color: frameC }); fr.box(o.x + o.w / 2, o.y + o.h / 2, zf, 0.04, o.h, 0.08, { color: frameC });
      fr.box(o.x + o.w / 2, o.y - 0.03, 0.03, o.w + 0.12, 0.06, 0.2, { color: lin(trim) });
    }
    boxAt(-0.08, y1 - 0.01, -d - 0.08, w + 0.08, y1 + 0.18, 0.15, tr, g);
    if (balcony && f > 0 && r() < 0.85) { const bx = (0.12 + r() * 0.35) * w, bw = 2.2 + r() * 1.2; boxAt(bx, y0 - 0.02, 0, bx + bw, y0 + 0.14, 1.3, tr, g); for (let k = 0; k <= 12; k++) rail.box(bx + 0.05 + (k * (bw - 0.1)) / 12, y0 + 0.62, 1.25, 0.02, 0.95, 0.02, { color: frameC }); rail.box(bx + bw / 2, y0 + 1.1, 1.25, bw, 0.05, 0.06, { color: frameC }); }
  }
  boxAt(0, H - 0.2, -d, w, H, 0, pl, g); // roof slab
  boxAt(0, H, -d, w, H + 0.95, -d + 0.2, pl, g); boxAt(0, H, -0.2, w, H + 0.95, 0, pl, g); boxAt(0, H, -d, 0.2, H + 0.95, 0, pl, g); boxAt(w - 0.2, H, -d, w, H + 0.95, 0, pl, g); boxAt(-0.05, H + 0.95, -d - 0.05, w + 0.05, H + 1.02, 0.05, tr, g);
  boxAt(0.3, H, -d + 2, 2.9, H + 2.7, -d + 5, pl, g); boxAt(0.2, H + 2.7, -d + 1.9, 3.0, H + 2.8, -d + 5.1, tr, g);
  if (tank) { waterTank(w * 0.62, H, -d * 0.6, g, { r: 0.55, h: 1.1 }); if (r() < 0.7) waterTank(w * 0.8, H, -d * 0.5, g, { r: 0.55, h: 1.1 }); }
  if (r() < 0.6) acUnit(w * 0.3, 0.5 + storey + 1.1, 0.0, g);
  fr.mesh(M.solidMat(0xffffff, { roughness: 0.5, metalness: 0.5, vertexColors: true }), g); gl.mesh(M.memo('nbGlass', () => T.glass({ tint: 0x25323d, env: 1.6 })), g, { cast: false }); dk.mesh(M.solidMat(0xffffff, { roughness: 1, vertexColors: true }), g, { cast: false }); rail.mesh(M.solidMat(0xffffff, { roughness: 0.5, metalness: 0.6, vertexColors: true }), g);
  if (gate) { boxAt(-0.6, 0, 6.5, w + 0.6, 1.7, 6.75, pl, g); boxAt(w * 0.4 - 0.2, 0, 6.45, w * 0.4 + 0.2, 2.1, 6.8, tr, g); boxAt(w * 0.4 + 2.8, 0, 6.45, w * 0.4 + 3.2, 2.1, 6.8, tr, g); const gt = new Mesher(); for (let k = 0; k < 22; k++) gt.box(w * 0.4 + 0.3 + k * 0.11, 0.95, 6.62, 0.04, 1.8, 0.04, { color: lin(0x3a3a3a) }); gt.mesh(M.solidMat(0xffffff, { roughness: 0.5, metalness: 0.5, vertexColors: true }), g); }
  g.position.set(x, 0, z); g.rotation.y = ry; parent?.add(g); void stain; return g;
}
