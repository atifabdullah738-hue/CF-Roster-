// svc-design-planning: oblique top view of a drafting desk: printed floor plan, scale rule, pencil, compass, set square, tracing-paper roll.
import { THREE, T, boxAt, cyl, rng, noiseArr, bindEnv, finish, cv, ctex, metalPro, ledgeStone, pavers, planeY } from '../lib/agent5-kit.mjs';
import { drawPlanSheet } from '../lib/agent5-plan.mjs';
import { setupEnvironment } from '../lib/env.mjs';

function between(parent, a, b, r0, r1, mat, seg = 10) { const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b), len = A.distanceTo(B), m = new THREE.Mesh(new THREE.CylinderGeometry(r1, r0, len, seg), mat); m.position.copy(A).add(B).multiplyScalar(0.5); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), B.clone().sub(A).normalize()); m.castShadow = m.receiveShadow = true; parent.add(m); return m; }

export default async function build({ renderer, w, h }) {
  const scene = new THREE.Scene(), R = rng(9);
  const SUN_EL = 36, SUN_AZ = -118;
  const E = setupEnvironment({ renderer, scene, sunElevation: SUN_EL, sunAzimuth: SUN_AZ, turbidity: 4, rayleigh: 1.1, sunIntensity: 2.6, sunColor: 0xfff0dc, envIntensity: 1.0, shadowExtent: 1.8, shadowCenter: [0, 0, 0], shadowMap: 4096 });
  bindEnv(E.env);
  E.light.shadow.radius = 9; E.light.shadow.blurSamples = 24; E.light.shadow.normalBias = 0.002; E.light.shadow.bias = -0.0002; E.light.shadow.camera.near = 0.5; E.light.shadow.camera.far = 30; E.light.position.copy(E.sun).multiplyScalar(6); E.light.shadow.camera.updateProjectionMatrix();
  scene.background = new THREE.Color(0x14110e);

  // ---------------- desk: oak planks
  const S = 2048, dc = cv(S), dx = dc.getContext('2d'), f = noiseArr(33, S, 5, 4), g = noiseArr(44, S, 6, 14), img = dx.createImageData(S, S), dd = img.data, pl = 8;
  for (let j = 0; j < S; j++) for (let i = 0; i < S; i++) { const p = Math.floor((j / S) * pl), pk = (((p * 2654435761) >>> 0) % 100) / 100 - 0.5, edge = ((j / S) * pl) % 1, grain = Math.sin((j * 0.6 + f[(j * S + i) % (S * S)] * 80 + p * 31) * 0.5) * 0.5 + 0.5, streak = g[((j * 3) % S) * S + ((i * 0.15 | 0) % S)];
    let v = 0.78 + pk * 0.16 + (grain - 0.5) * 0.12 + (streak - 0.5) * 0.28 + (f[j * S + i] - 0.5) * 0.12; if (edge < 0.008 || edge > 0.992) v *= 0.35; const k = (j * S + i) * 4; dd[k] = 235 * v; dd[k + 1] = 184 * v; dd[k + 2] = 128 * v; dd[k + 3] = 255; }
  dx.putImageData(img, 0, 0); const deskTex = ctex(dc, { repeat: true }); deskTex.repeat.set(2.5, 2);
  const desk = new THREE.MeshStandardMaterial({ map: deskTex, roughness: 0.52, bumpMap: deskTex, bumpScale: 0.6 }); desk.userData.tileM = 1;
  const dg = new THREE.PlaneGeometry(4.0, 2.6); dg.rotateX(-Math.PI / 2); const deskM = new THREE.Mesh(dg, desk); deskM.receiveShadow = true; scene.add(deskM);
  boxAt(-2.0, -0.04, -1.3, 2.0, 0.0, 1.3, T.solid(0x6b4a2c, { roughness: 0.6 }), scene);

  // ---------------- the plan sheet (A1, drawn on a 4096x2896 canvas)
  const plan = drawPlanSheet(cv(4096, 2896), { seed: 4 }); const planTex = ctex(plan); planTex.anisotropy = 16; planTex.generateMipmaps = true; planTex.minFilter = THREE.LinearMipmapLinearFilter;
  const SW = 0.841, SH = 0.594, sheetG = new THREE.Group(); sheetG.rotation.y = -0.05; scene.add(sheetG);
  const sheetMat = new THREE.MeshStandardMaterial({ map: planTex, roughness: 0.82, color: 0xffffff }), edgeMat = T.solid(0xf0ede4, { roughness: 0.9 });
  const sheet = new THREE.Mesh(new THREE.BoxGeometry(SW, 0.0006, SH), [edgeMat, edgeMat, sheetMat, edgeMat, edgeMat, edgeMat]); sheet.position.y = 0.0003; sheet.castShadow = sheet.receiveShadow = true; sheetG.add(sheet);
  // sheet curl at one corner (slight) via a second thin layer would be overkill; add a paper-clip-like weight instead
  // coordinates on sheet: u (x) -SW/2..SW/2, v (z) -SH/2..SH/2
  const onSheet = (x, z) => [x, z];
  void onSheet;

  // ---------------- scale rule (flat architect's scale with tick texture)
  const rc = cv(2048, 160), rx = rc.getContext('2d'); rx.fillStyle = '#efe9d8'; rx.fillRect(0, 0, 2048, 160); rx.fillStyle = '#16161a';
  for (let i = 0; i <= 150; i++) { const X = 20 + i * 13.5, len = i % 10 === 0 ? 70 : i % 5 === 0 ? 48 : 30; rx.fillRect(X, 0, 3, len); rx.fillRect(X, 160 - len, 3, len); }
  for (let i = 0; i < 15; i++) { rx.fillRect(20 + i * 135 + 20, 66, 38, 26); } rx.fillStyle = '#b53a2c'; rx.fillRect(0, 76, 2048, 4);
  const ruleTop = new THREE.MeshStandardMaterial({ map: ctex(rc), roughness: 0.4 }), ruleSide = T.solid(0xe9e3d0, { roughness: 0.5 });
  const rule = new THREE.Mesh(new THREE.BoxGeometry(0.30, 0.008, 0.030), [ruleSide, ruleSide, ruleTop, ruleSide, ruleSide, ruleSide]); rule.position.set(-0.12, 0.005, 0.255); rule.rotation.y = -0.03; rule.castShadow = rule.receiveShadow = true; scene.add(rule);
  const rule2 = new THREE.Mesh(new THREE.BoxGeometry(0.30, 0.003, 0.028), [T.metal(0xb8bcc0), T.metal(0xb8bcc0), T.metal(0xcfd3d6, { roughness: 0.25 }), T.metal(0xb8bcc0), T.metal(0xb8bcc0), T.metal(0xb8bcc0)]); rule2.position.set(0.32, 0.002, 0.30); rule2.rotation.y = 0.12; rule2.castShadow = true; scene.add(rule2);

  // ---------------- pencil (hex, yellow) with sharpened tip + eraser
  const pencil = new THREE.Group(); const bodyM = T.solid(0xe9b61f, { roughness: 0.4 }), woodM = T.solid(0xdcb98a, { roughness: 0.7 }), leadM = T.solid(0x2c2c30, { roughness: 0.35 });
  const pb = new THREE.Mesh(new THREE.CylinderGeometry(0.0038, 0.0038, 0.17, 6), bodyM); pb.rotation.z = Math.PI / 2; pb.castShadow = true; pencil.add(pb);
  const pc = new THREE.Mesh(new THREE.ConeGeometry(0.0038, 0.022, 6), woodM); pc.rotation.z = Math.PI / 2; pc.position.x = 0.096; pc.castShadow = true; pencil.add(pc);
  const pl2 = new THREE.Mesh(new THREE.ConeGeometry(0.0013, 0.008, 8), leadM); pl2.rotation.z = Math.PI / 2; pl2.position.x = 0.1105; pencil.add(pl2);
  const fer = new THREE.Mesh(new THREE.CylinderGeometry(0.0041, 0.0041, 0.012, 12), T.metal(0xc3c6c9, { roughness: 0.25 })); fer.rotation.z = Math.PI / 2; fer.position.x = -0.091; pencil.add(fer);
  const er = new THREE.Mesh(new THREE.CylinderGeometry(0.0037, 0.0037, 0.009, 12), T.solid(0xd9857f, { roughness: 0.8 })); er.rotation.z = Math.PI / 2; er.position.x = -0.1015; pencil.add(er);
  pencil.position.set(0.04, 0.0042, 0.17); pencil.rotation.set(0, 0.5, 0.0); scene.add(pencil);

  // ---------------- coloured pencils
  [[0x2f6fb5, 0.5, 0.52, 0.17, 0.2], [0xc23a2e, 0.52, 0.31, 0.07, 0.1], [0x2f9a56, 0.48, 0.30, 0.06, -0.3], [0xe3b122, 0.5, 0.30, 0.2, 0.3]].forEach(([col, px, pz, rz, ry], i) => {
    const gp = new THREE.Group(), m = T.solid(col, { roughness: 0.4 }); const b = new THREE.Mesh(new THREE.CylinderGeometry(0.0036, 0.0036, 0.16, 6), m); b.rotation.z = Math.PI / 2; b.castShadow = true; gp.add(b);
    const c = new THREE.Mesh(new THREE.ConeGeometry(0.0036, 0.02, 6), woodM); c.rotation.z = Math.PI / 2; c.position.x = 0.09; gp.add(c); const l = new THREE.Mesh(new THREE.ConeGeometry(0.0013, 0.007, 8), m); l.rotation.z = Math.PI / 2; l.position.x = 0.1015; gp.add(l);
    gp.position.set(0.56 - 0.0, 0.0038, 0.10 + i * 0.016); gp.rotation.y = -0.15 + i * 0.04; void px; void pz; void rz; void ry; scene.add(gp);
  });

  // ---------------- mechanical compass / divider standing on the plan
  const steel = metalPro(0xbfc3c7, { roughness: 0.22, k: 1.8 }), dark = metalPro(0x4a4d52, { roughness: 0.35, k: 1.4 });
  const cx = 0.17, cz = -0.06, hingeY = 0.13, sp = 0.052;
  const cg = new THREE.Group(); cg.rotation.y = 0.6; cg.position.set(cx, 0, cz); scene.add(cg);
  const tipA = [-sp, 0.0, 0], tipB = [sp, 0.0, 0.004], hinge = [0, hingeY, 0];
  between(cg, [tipA[0], 0.03, 0], [0, hingeY - 0.006, -0.003], 0.0028, 0.0034, steel); between(cg, [tipA[0], 0.0, 0], [tipA[0], 0.03, 0], 0.0006, 0.0028, dark, 8);
  between(cg, [tipB[0], 0.034, 0.004], [0, hingeY - 0.006, 0.003], 0.0042, 0.0034, steel); between(cg, [tipB[0], 0.0, 0.004], [tipB[0], 0.034, 0.004], 0.0011, 0.0042, T.solid(0x2c2c30, { roughness: 0.4 }), 8);
  const hg = new THREE.Mesh(new THREE.CylinderGeometry(0.0085, 0.0085, 0.022, 20), steel); hg.rotation.x = Math.PI / 2; hg.position.set(0, hingeY, 0); hg.castShadow = true; cg.add(hg);
  between(cg, [0, hingeY + 0.004, 0], [0, hingeY + 0.05, 0], 0.0028, 0.0028, steel); const kn = new THREE.Mesh(new THREE.CylinderGeometry(0.0095, 0.0095, 0.02, 24), dark); kn.position.set(0, hingeY + 0.062, 0); kn.castShadow = true; cg.add(kn);
  const thumb = new THREE.Mesh(new THREE.CylinderGeometry(0.0055, 0.0055, 0.03, 16), dark); thumb.rotation.z = Math.PI / 2; thumb.position.set(0, 0.075, 0); thumb.castShadow = true; cg.add(thumb);

  // ---------------- set square (translucent amber acrylic with inner cut-out and bevel)
  const sq = new THREE.Shape(); sq.moveTo(0, 0); sq.lineTo(0.2, 0); sq.lineTo(0, 0.2); sq.lineTo(0, 0);
  const hole = new THREE.Path(); hole.moveTo(0.032, 0.03); hole.lineTo(0.134, 0.03); hole.lineTo(0.032, 0.132); hole.lineTo(0.032, 0.03); sq.holes.push(hole);
  const sg = new THREE.ExtrudeGeometry(sq, { depth: 0.0028, bevelEnabled: true, bevelThickness: 0.0006, bevelSize: 0.0006, bevelSegments: 2 });
  const acr = new THREE.MeshPhysicalMaterial({ color: 0xe8b86c, transparent: true, opacity: 0.38, roughness: 0.12, metalness: 0, clearcoat: 1, side: THREE.DoubleSide, envMap: E.env, envMapIntensity: 1.2, depthWrite: false });
  const sm = new THREE.Mesh(sg, acr); sm.rotation.x = -Math.PI / 2; sm.position.set(0.18, 0.0012, 0.2); sm.rotation.z = 2.55; sm.castShadow = true; sm.renderOrder = 2; scene.add(sm);
  const sgEdge = new THREE.Mesh(sg, new THREE.MeshStandardMaterial({ color: 0xd9a24d, roughness: 0.3, transparent: true, opacity: 0.55, depthWrite: false })); sgEdge.rotation.copy(sm.rotation); sgEdge.position.copy(sm.position); sgEdge.position.y += 0.0004; sgEdge.scale.set(1, 1, 0.5); scene.add(sgEdge);

  // ---------------- tracing paper roll + unrolled sheet draped over the plan
  const rollG = new THREE.Group(); rollG.position.set(-0.52, 0.04, -0.12); scene.add(rollG);
  const rc2 = cv(256), rx2 = rc2.getContext('2d'); rx2.fillStyle = '#f2efe6'; rx2.fillRect(0, 0, 256, 256); for (let rr = 118; rr > 36; rr -= 3) { rx2.strokeStyle = `rgba(150,145,130,${0.35 + (rr % 9) / 40})`; rx2.lineWidth = 1.5; rx2.beginPath(); rx2.arc(128, 128, rr, 0, 7); rx2.stroke(); } rx2.fillStyle = '#b79c70'; rx2.beginPath(); rx2.arc(128, 128, 36, 0, 7); rx2.fill(); rx2.fillStyle = '#6a5438'; rx2.beginPath(); rx2.arc(128, 128, 26, 0, 7); rx2.fill();
  const capTex = ctex(rc2), paperM = new THREE.MeshStandardMaterial({ color: 0xf0ede4, roughness: 0.75 });
  const rollM = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.5, 40), [paperM, new THREE.MeshStandardMaterial({ map: capTex, roughness: 0.8 }), new THREE.MeshStandardMaterial({ map: capTex, roughness: 0.8 })]); rollM.rotation.x = Math.PI / 2; rollM.castShadow = rollM.receiveShadow = true; rollG.add(rollM);
  for (const z of [-0.14, 0.14]) { const band = new THREE.Mesh(new THREE.CylinderGeometry(0.0412, 0.0412, 0.012, 40), T.solid(0x3b4a63, { roughness: 0.7 })); band.rotation.x = Math.PI / 2; band.position.z = z; rollG.add(band); }
  rollG.rotation.y = 0.08;
  // unrolled sheet
  const tw = 0.42, th = 0.36, tg = new THREE.PlaneGeometry(tw, th, 40, 30); tg.rotateX(-Math.PI / 2); const pp = tg.attributes.position;
  for (let i = 0; i < pp.count; i++) { const px = pp.getX(i), pz = pp.getZ(i), u = (px + tw / 2) / tw; const curl = Math.max(0, 1 - u * 3.2); pp.setY(i, 0.0025 + curl * curl * 0.034 + Math.sin(px * 40 + pz * 25) * 0.0007 + Math.sin(pz * 70) * 0.0004); }
  tg.computeVertexNormals();
  const tc = cv(1024, 878), tx = tc.getContext('2d'); tx.clearRect(0, 0, 1024, 878); tx.lineWidth = 3; for (const [col, pts] of [['rgba(200,40,40,0.9)', [[120, 200], [420, 190], [440, 460], [160, 470], [120, 200]]], ['rgba(40,70,170,0.85)', [[520, 260], [900, 250], [910, 620], [530, 640], [520, 260]]]]) { tx.strokeStyle = col; tx.beginPath(); pts.forEach(([a, b], i) => (i ? tx.lineTo(a, b) : tx.moveTo(a, b))); tx.stroke(); } tx.strokeStyle = 'rgba(40,40,40,0.8)'; tx.lineWidth = 2; for (let i = 0; i < 9; i++) { tx.beginPath(); tx.moveTo(150 + i * 40, 560); tx.lineTo(150 + i * 40 + 22, 700); tx.stroke(); } tx.strokeStyle = 'rgba(190,40,40,0.9)'; tx.lineWidth = 5; tx.beginPath(); tx.arc(300, 330, 70, 0, 7); tx.stroke();
  const tm = new THREE.MeshStandardMaterial({ map: ctex(tc), color: 0xffffff, transparent: true, opacity: 0.75, roughness: 0.7, side: THREE.DoubleSide, depthWrite: false });
  const tmesh = new THREE.Mesh(tg, tm); tmesh.position.set(-0.28, 0.0, 0.0); tmesh.rotation.y = 0.05; tmesh.castShadow = false; tmesh.receiveShadow = true; tmesh.renderOrder = 1; scene.add(tmesh);
  const tsh = new THREE.Mesh(tg, new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.14, depthWrite: false })); tsh.position.copy(tmesh.position); tsh.position.y += 0.0004; tsh.rotation.copy(tmesh.rotation); tsh.renderOrder = 1; scene.add(tsh);

  // ---------------- pen mug, swatches, eraser
  const mug = new THREE.Group(); mug.position.set(0.55, 0, -0.2); scene.add(mug);
  const ceramic = new THREE.MeshPhysicalMaterial({ color: 0xe8e4da, roughness: 0.25, clearcoat: 0.7, side: THREE.DoubleSide, envMap: E.env, envMapIntensity: 1.0 });
  const mb = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.036, 0.09, 36, 1, true), ceramic); mb.position.y = 0.045; mb.castShadow = mb.receiveShadow = true; mug.add(mb);
  const mf = new THREE.Mesh(new THREE.CircleGeometry(0.036, 24), T.solid(0x2a2622)); mf.rotation.x = -Math.PI / 2; mf.position.y = 0.012; mug.add(mf); const mr = new THREE.Mesh(new THREE.TorusGeometry(0.04, 0.0025, 8, 36), ceramic); mr.rotation.x = Math.PI / 2; mr.position.y = 0.09; mug.add(mr);
  [[0x1d3b73, 0.2, 0.01, 0.0], [0xb7332a, -0.15, -0.012, 0.01], [0x2a7a4b, 0.1, 0.0, -0.02], [0x222222, -0.3, 0.014, -0.01], [0xd9a021, 0.25, -0.016, 0.014]].forEach(([c, lean, ox, oz]) => { const pen = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.17, 10), T.solid(c, { roughness: 0.35 })); pen.position.set(ox, 0.085 + 0.02, oz); pen.rotation.set(oz * 8 + 0.1, 0, lean * 0.8); pen.castShadow = true; mug.add(pen); });
  const sw = (mat, x, z, ry, y) => { const m = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.008, 0.07), [T.solid(0xdddddd), T.solid(0xdddddd), mat, T.solid(0xdddddd), T.solid(0xdddddd), T.solid(0xdddddd)]); m.position.set(x, y, z); m.rotation.y = ry; m.castShadow = m.receiveShadow = true; scene.add(m); };
  const wsw = T.wood({ color: 0x9c6a3d, tileM: 0.08, planks: 3, gap: false, seed: 3 }), ssw = ledgeStone({ colors: [0x9a8f7c, 0xb2a78f, 0x7f7565], tileM: 0.12, seed: 3, rowMin: 0.2, rowMax: 0.3, lenMin: 0.8, lenMax: 1.2 }), tsw = T.tiles({ color: 0xe1ddd2, grout: 0x8a867c, tileM: 0.07, n: 2, seed: 9, marble: true });
  sw(wsw, 0.53, 0.03, 0.2, 0.004); sw(ssw, 0.545, 0.02, -0.1, 0.012); sw(tsw, 0.56, 0.015, 0.35, 0.02);
  const er2 = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.012, 0.02), T.solid(0xf4f1ea, { roughness: 0.9 })); er2.position.set(0.3, 0.006, -0.28); er2.rotation.y = 0.4; er2.castShadow = true; scene.add(er2);
  const sl = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.0006, 0.02), T.solid(0x3b5f9c)); sl.position.set(0.3, 0.0125, -0.28); sl.rotation.y = 0.4; scene.add(sl);

  // ---------------- window gobo: casts the sash shadows of a window onto the desk (not visible to camera)
  const sunDir = E.sun.clone().normalize(), gobo = new THREE.Group(), gm = new THREE.MeshBasicMaterial({ colorWrite: false, depthWrite: false });
  gobo.position.copy(sunDir).multiplyScalar(2.6); gobo.lookAt(0, 0, 0);
  const bar = (x0, y0, x1, y1) => { const b = new THREE.Mesh(new THREE.BoxGeometry(Math.abs(x1 - x0), Math.abs(y1 - y0), 0.05), gm); b.position.set((x0 + x1) / 2, (y0 + y1) / 2, 0); b.castShadow = true; gobo.add(b); };
  const GW = 4.2, GH = 3.2; bar(-GW, -GH, -GW + 2.6, GH); bar(GW - 2.6, -GH, GW, GH); bar(-GW, -GH, GW, -GH + 1.6); bar(-GW, GH - 1.9, GW, GH);
  bar(-0.04 + 0.5, -GH, 0.04 + 0.5, GH); bar(-GW, -0.04 - 0.2, GW, 0.04 - 0.2);
  scene.add(gobo);

  // ---------------- camera
  const camera = new THREE.PerspectiveCamera(); camera.filmGauge = 36; camera.setFocalLength(78); camera.aspect = w / h; camera.near = 0.05; camera.far = 50;
  camera.position.set(-0.02, 1.42, 1.12); camera.lookAt(0.0, 0, 0.02); camera.updateProjectionMatrix();
  finish(scene, 1.4);
  return { scene, camera, exposure: 0.33, aoRadius: 0.06, aoStrength: 1.0, grade: { contrast: 1.2, saturation: 1.02, vignette: 0.55, grain: 0.012, warm: 0.03 } };
}
