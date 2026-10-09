// agent5 plan: draws a crisp architectural floor plan (walls, doors, windows, furniture, dimensions, hatching) onto a canvas. No readable text.
import { rng } from './textures.mjs';

export function drawPlanSheet(canvas, { seed = 7 } = {}) {
  const W = canvas.width, H = canvas.height, x = canvas.getContext('2d'), r = rng(seed), S = 150, OX = 520, OY = 560;
  // paper
  x.fillStyle = '#f6f3ec'; x.fillRect(0, 0, W, H);
  const img = x.getImageData(0, 0, W, H), d = img.data; for (let i = 0; i < W * H; i++) { const n = (Math.random() - 0.5) * 5; d[i * 4] += n; d[i * 4 + 1] += n; d[i * 4 + 2] += n * 1.2; } x.putImageData(img, 0, 0);
  const INK = '#101012';
  // sheet border
  x.strokeStyle = INK; x.lineWidth = 7; x.strokeRect(70, 70, W - 140, H - 140); x.lineWidth = 2.5; x.strokeRect(84, 84, W - 168, H - 168);
  x.save(); x.translate(OX, OY); x.scale(S, S); x.lineCap = 'butt'; x.lineJoin = 'miter';
  const L = (a, b, c, e, w = 0.012, col = INK, dash = null) => { x.strokeStyle = col; x.lineWidth = w; x.setLineDash(dash || []); x.beginPath(); x.moveTo(a, b); x.lineTo(c, e); x.stroke(); x.setLineDash([]); };
  const rect = (a, b, c, e, fill, stroke, w = 0.012) => { if (fill) { x.fillStyle = fill; x.fillRect(a, b, c - a, e - b); } if (stroke) { x.strokeStyle = stroke; x.lineWidth = w; x.strokeRect(a, b, c - a, e - b); } };
  const hatch = (a, b, c, e, step = 0.18, ang = 1, col = 'rgba(20,20,20,0.55)', w = 0.008) => { x.save(); x.beginPath(); x.rect(a, b, c - a, e - b); x.clip(); x.strokeStyle = col; x.lineWidth = w; const span = (c - a) + (e - b); for (let t = -span; t < span; t += step) { x.beginPath(); x.moveTo(a + t, e); x.lineTo(a + t + (e - b) * ang, b); x.stroke(); } x.restore(); };
  const bars = (cx, cy, n = 3, scale = 1, col = INK, vertical = false) => { x.fillStyle = col; let off = -n * 0.22 * scale; for (let i = 0; i < n; i++) { const wd = (0.25 + r() * 0.5) * scale; if (vertical) x.fillRect(cx - 0.05 * scale, cy + off, 0.1 * scale, wd); else x.fillRect(cx + off, cy - 0.05 * scale, wd, 0.1 * scale); off += wd + 0.08 * scale; } };

  // ---- site: garden hatch, driveway, plot boundary
  rect(-2, -2.6, 18.2, 11.4, null, null);
  rect(-2, 3.2, 0, 9.1, 'rgba(150,196,120,0.38)'); hatch(-2, 3.2, 0, 9.1, 0.22, 1, 'rgba(60,110,40,0.5)', 0.007);
  rect(-2, 9.1, 18, 11.2, 'rgba(150,196,120,0.38)'); hatch(-2, 9.1, 18, 11.2, 0.22, 1, 'rgba(60,110,40,0.5)', 0.007);
  rect(16, -2.4, 18, 9.1, 'rgba(150,196,120,0.38)'); hatch(16, -2.4, 18, 9.1, 0.22, 1, 'rgba(60,110,40,0.5)', 0.007);
  rect(-2, -2.4, 4, 0, 'rgba(200,196,188,0.8)'); for (let i = -2; i < 4; i += 0.5) L(i, -2.4, i, 0, 0.005, 'rgba(30,30,30,0.5)'); for (let j = -2.4; j < 0; j += 0.25) L(-2, j, 4, j, 0.005, 'rgba(30,30,30,0.5)');
  rect(-2, 0, 4, 3.2, 'rgba(206,202,194,0.85)'); for (let i = -2; i < 4; i += 0.4) L(i, 0, i, 3.2, 0.005, 'rgba(30,30,30,0.5)'); for (let j = 0; j < 3.2; j += 0.4) L(-2, j, 4, j, 0.005, 'rgba(30,30,30,0.5)');
  const tree = (cx, cy, rr) => { x.fillStyle = 'rgba(120,170,90,0.5)'; x.beginPath(); x.arc(cx, cy, rr, 0, 7); x.fill(); x.strokeStyle = INK; x.lineWidth = 0.014; x.beginPath(); x.arc(cx, cy, rr, 0, 7); x.stroke(); for (let a = 0; a < 6.28; a += 0.785) L(cx, cy, cx + Math.cos(a) * rr * 0.7, cy + Math.sin(a) * rr * 0.7, 0.008); };
  tree(-1.2, 5, 0.7); tree(-1.1, 8.1, 0.6); tree(17.0, 1.2, 0.9); tree(17.1, 6.2, 0.7); tree(5, 10.3, 0.6); tree(12, 10.3, 0.7);
  L(-2, -2.6, 18.2, -2.6, 0.05, INK, [0.5, 0.12, 0.08, 0.12]); L(18.2, -2.6, 18.2, 11.4, 0.05, INK, [0.5, 0.12, 0.08, 0.12]); L(18.2, 11.4, -2, 11.4, 0.05, INK, [0.5, 0.12, 0.08, 0.12]); L(-2, 11.4, -2, -2.6, 0.05, INK, [0.5, 0.12, 0.08, 0.12]);
  L(-1.4, -2.0, 17.6, -2.0, 0.015, INK, [0.25, 0.1]); L(17.6, -2.0, 17.6, 10.8, 0.015, INK, [0.25, 0.1]); L(17.6, 10.8, -1.4, 10.8, 0.015, INK, [0.25, 0.1]); L(-1.4, 10.8, -1.4, -2.0, 0.015, INK, [0.25, 0.1]);
  // gate gap on the left boundary beside the porch
  x.fillStyle = '#f6f3ec'; x.fillRect(-2.08, -1.9, 0.16, 3.6);
  // ---- rooms tint
  const room = (a, b, c, e, col) => rect(a, b, c, e, col);
  room(4, 0, 6.4, 3.2, 'rgba(244,226,150,0.65)'); room(6.4, 0, 10.6, 3.2, 'rgba(250,214,150,0.7)'); room(10.6, 0, 12.4, 3.2, 'rgba(214,206,196,0.7)'); room(12.4, 0, 16, 3.2, 'rgba(222,222,226,0.8)');
  room(0, 3.2, 5.2, 9.1, 'rgba(238,200,160,0.7)'); room(5.2, 3.2, 9.4, 9.1, 'rgba(244,184,150,0.62)'); room(9.4, 3.2, 13, 9.1, 'rgba(170,200,238,0.6)'); room(13, 3.2, 16, 6, 'rgba(150,222,226,0.7)'); room(13, 6, 16, 9.1, 'rgba(188,208,242,0.6)');
  // tile grid in bath & kitchen
  for (let i = 13; i < 16; i += 0.3) L(i, 3.2, i, 6, 0.004, 'rgba(0,60,70,0.35)'); for (let j = 3.2; j < 6; j += 0.3) L(13, j, 16, j, 0.004, 'rgba(0,60,70,0.35)');
  for (let i = 6.4; i < 10.6; i += 0.6) L(i, 0, i, 3.2, 0.004, 'rgba(120,70,0,0.25)'); for (let j = 0; j < 3.2; j += 0.6) L(6.4, j, 10.6, j, 0.004, 'rgba(120,70,0,0.25)');
  // wood floor lines in bedrooms
  for (let j = 3.2; j < 9.1; j += 0.14) L(9.4, j, 13, j, 0.003, 'rgba(40,60,100,0.22)');
  // ---- furniture (thin lines)
  const fl = 'rgba(16,16,18,1)', fw = 0.011, F = (a, b, c, e, fill = 'rgba(255,255,255,0.55)') => rect(a, b, c, e, fill, fl, fw);
  // drawing room: L sofa + coffee table + TV unit
  F(0.5, 7.6, 4.4, 8.6); F(0.5, 5.6, 1.5, 7.6); F(0.6, 7.7, 2.3, 8.5, 'rgba(255,255,255,0.8)'); F(2.4, 7.7, 4.3, 8.5, 'rgba(255,255,255,0.8)'); F(1.7, 5.9, 3.5, 6.9, 'rgba(210,225,235,0.8)'); F(2.0, 3.5, 3.9, 4.0); F(0.2, 4.0, 0.7, 5.2, 'rgba(255,255,255,0.4)');
  // lounge/dining
  F(6.2, 5.2, 8.4, 6.5, 'rgba(250,240,225,0.9)'); for (let i = 0; i < 3; i++) { F(6.5 + i * 0.7, 4.7, 6.9 + i * 0.7, 5.15); F(6.5 + i * 0.7, 6.55, 6.9 + i * 0.7, 7.0); } F(5.8, 5.6, 6.15, 6.1); F(8.45, 5.6, 8.8, 6.1); F(5.5, 8.4, 9.1, 8.9, 'rgba(255,255,255,0.4)'); F(5.5, 3.5, 6.3, 3.9);
  // kitchen counters + hob + sink + fridge
  F(6.55, 0.2, 10.5, 0.8); F(9.9, 0.8, 10.5, 2.6); F(6.55, 0.8, 7.1, 1.5); rect(8.0, 0.3, 8.9, 0.7, 'rgba(210,225,235,0.9)', fl, fw); L(8.45, 0.3, 8.45, 0.7, 0.01); for (const [cx, cy] of [[7.7, 0.5], [9.2, 0.5], [10.2, 1.2], [10.2, 1.9]]) { x.strokeStyle = fl; x.lineWidth = 0.011; x.beginPath(); x.arc(cx, cy, 0.14, 0, 7); x.stroke(); }
  F(6.55, 2.4, 7.3, 3.05, 'rgba(255,255,255,0.8)');
  // bedroom 1: double bed + side tables + wardrobe
  F(10.2, 3.55, 12.1, 5.7, 'rgba(255,255,255,0.85)'); F(10.3, 3.65, 11.0, 4.25, 'rgba(235,240,250,0.9)'); F(11.3, 3.65, 12.0, 4.25, 'rgba(235,240,250,0.9)'); L(10.2, 4.8, 12.1, 4.8, 0.01); F(9.75, 3.55, 10.15, 3.95); F(12.15, 3.55, 12.55, 3.95); F(9.6, 8.2, 12.9, 8.95, 'rgba(255,255,255,0.5)'); L(9.6, 8.2, 12.9, 8.95, 0.006); L(9.6, 8.95, 12.9, 8.2, 0.006);
  // bedroom 2
  F(13.6, 6.5, 15.2, 8.5, 'rgba(255,255,255,0.85)'); F(13.7, 6.6, 14.3, 7.1, 'rgba(235,240,250,0.9)'); F(14.5, 6.6, 15.1, 7.1, 'rgba(235,240,250,0.9)'); F(15.35, 8.2, 15.9, 8.95, 'rgba(255,255,255,0.5)');
  // bath: WC, basin, shower
  x.strokeStyle = fl; x.lineWidth = 0.012; x.fillStyle = 'rgba(255,255,255,0.8)'; x.beginPath(); x.ellipse(14.7, 5.2, 0.22, 0.32, 0, 0, 7); x.fill(); x.stroke(); F(14.5, 5.55, 14.9, 5.9); F(13.2, 3.4, 13.9, 3.95); x.beginPath(); x.ellipse(13.55, 3.68, 0.2, 0.15, 0, 0, 7); x.stroke(); F(15.0, 3.4, 15.9, 4.3); L(15.0, 3.4, 15.9, 4.3, 0.007); L(15.0, 4.3, 15.9, 3.4, 0.007);
  // stair (12.4..16, 0..3.2): treads + arrow
  F(12.7, 0.25, 15.8, 2.95, 'rgba(255,255,255,0.4)'); for (let i = 0; i <= 14; i++) L(12.7 + i * (3.1 / 14), 0.25, 12.7 + i * (3.1 / 14), 2.95, 0.009); L(12.8, 1.6, 15.5, 1.6, 0.012); x.fillStyle = INK; x.beginPath(); x.moveTo(15.7, 1.6); x.lineTo(15.3, 1.45); x.lineTo(15.3, 1.75); x.fill();
  // store shelves
  for (let j = 0.4; j < 3; j += 0.55) L(10.8, j, 12.2, j, 0.01);
  // hall: mat + shoe rack
  F(4.4, 0.3, 4.9, 1.1, 'rgba(255,255,255,0.4)'); rect(4.5, 1.3, 6.1, 1.7, 'rgba(200,170,120,0.5)', fl, 0.008);

  // ---- walls (off-screen so openings can be cut out)
  const wc = document.createElement('canvas'); wc.width = W; wc.height = H; const w = wc.getContext('2d'); w.translate(OX, OY); w.scale(S, S); w.fillStyle = INK;
  const WALL = (x0, y0, x1, y1, t) => { if (Math.abs(y1 - y0) < 1e-6) w.fillRect(Math.min(x0, x1) - t / 2, y0 - t / 2, Math.abs(x1 - x0) + t, t); else w.fillRect(x0 - t / 2, Math.min(y0, y1) - t / 2, t, Math.abs(y1 - y0) + t); };
  const TE = 0.23, TI = 0.115;
  WALL(4, 0, 16, 0, TE); WALL(16, 0, 16, 9.1, TE); WALL(0, 9.1, 16, 9.1, TE); WALL(0, 3.2, 0, 9.1, TE);
  WALL(0, 3.2, 16, 3.2, TI); WALL(4, 0, 4, 3.2, TI); WALL(6.4, 0, 6.4, 3.2, TI); WALL(10.6, 0, 10.6, 3.2, TI); WALL(12.4, 0, 12.4, 3.2, TI);
  WALL(5.2, 3.2, 5.2, 9.1, TI); WALL(9.4, 3.2, 9.4, 9.1, TI); WALL(13, 3.2, 13, 9.1, TI); WALL(13, 6, 16, 6, TI);
  // columns at porch
  for (const [cx, cy] of [[0.25, 0.25], [3.75, 0.25], [0.25, 3.0]]) w.fillRect(cx - 0.17, cy - 0.17, 0.34, 0.34);
  // openings: [orientation 'h'|'v', fixed coord, a, b, kind, swing dir]
  const OP = [['v', 4, 1.0, 2.1, 'door', 1], ['h', 3.2, 4.4, 5.3, 'door', 1], ['h', 3.2, 1.0, 2.1, 'door', -1], ['h', 3.2, 8.0, 8.9, 'door', -1], ['v', 9.4, 5.0, 5.9, 'door', 1], ['v', 13, 3.8, 4.6, 'door', 1], ['v', 13, 7.0, 7.9, 'door', 1], ['h', 3.2, 13.2, 14.1, 'door', 1], ['h', 3.2, 6.7, 7.4, 'door', -1],
    ['h', 9.1, 1.2, 3.8, 'win'], ['h', 9.1, 6.4, 8.2, 'win'], ['h', 9.1, 10.4, 12.0, 'win'], ['h', 9.1, 13.9, 15.2, 'win'], ['v', 0, 4.8, 7.4, 'win'], ['v', 16, 1.0, 2.2, 'win'], ['v', 16, 7.2, 8.2, 'win'], ['h', 0, 7.4, 9.6, 'win'], ['h', 0, 13, 15, 'win'], ['h', 9.1, 4.0, 4.9, 'door', -1]];
  w.globalCompositeOperation = 'destination-out'; for (const [o, c, a, b, k] of OP) { const t = (o === 'h' ? (c === 3.2 ? TI : TE) : (c === 0 || c === 16 ? TE : TI)) + 0.04; if (o === 'h') w.fillRect(a, c - t / 2, b - a, t); else w.fillRect(c - t / 2, a, t, b - a); void k; }
  w.globalCompositeOperation = 'source-over';
  x.save(); x.setTransform(1, 0, 0, 1, 0, 0); x.drawImage(wc, 0, 0); x.restore();
  // door leaves + swings, window frames
  for (const [o, c, a, b, k, sd] of OP) {
    const len = b - a;
    if (k === 'door') {
      x.strokeStyle = INK; x.lineWidth = 0.014;
      if (o === 'h') { const hx = sd > 0 ? a : b, dir = sd > 0 ? 1 : -1, dy = (c === 9.1 ? -1 : (sd)); void dir; const oy = c === 3.2 ? (a < 5 && a > 4 ? -1 : (c === 3.2 && (a === 1.0 || a === 8.0 || a === 6.7) ? 1 : 1)) : -1; x.beginPath(); x.moveTo(hx, c); x.lineTo(hx, c + oy * len); x.stroke(); x.setLineDash([0.06, 0.05]); x.lineWidth = 0.008; x.beginPath(); x.arc(hx, c, len, oy > 0 ? 0.0 : -Math.PI / 2, oy > 0 ? Math.PI / 2 : 0.0); x.stroke(); x.setLineDash([]); void dy; }
      else { const hy = a, ox = sd > 0 ? 1 : -1; x.beginPath(); x.moveTo(c, hy); x.lineTo(c + ox * len, hy); x.stroke(); x.setLineDash([0.06, 0.05]); x.lineWidth = 0.008; x.beginPath(); x.arc(c, hy, len, ox > 0 ? 0 : Math.PI / 2, ox > 0 ? Math.PI / 2 : Math.PI); x.stroke(); x.setLineDash([]); }
    } else {
      x.strokeStyle = INK; x.lineWidth = 0.012; if (o === 'h') { for (const dy of [-0.09, 0, 0.09]) L(a, c + dy, b, c + dy, 0.01); L(a, c - 0.115, a, c + 0.115, 0.014); L(b, c - 0.115, b, c + 0.115, 0.014); } else { for (const dx of [-0.09, 0, 0.09]) L(c + dx, a, c + dx, b, 0.01); L(c - 0.115, a, c + 0.115, a, 0.014); L(c - 0.115, b, c + 0.115, b, 0.014); }
    }
  }
  // ---- dimension strings
  const tick = (px, py, ang = -0.785) => { x.save(); x.translate(px, py); x.rotate(ang); L(-0.14, 0, 0.14, 0, 0.018); x.restore(); };
  const dimH = (xs, y, ext) => { L(xs[0], y, xs[xs.length - 1], y, 0.01); for (let i = 0; i < xs.length; i++) { L(xs[i], y + (ext > 0 ? -0.12 : 0.12), xs[i], ext, 0.007); tick(xs[i], y); } for (let i = 0; i < xs.length - 1; i++) bars((xs[i] + xs[i + 1]) / 2, y - 0.24, 2 + (i % 2), 0.8); };
  const dimV = (ys, xx, ext) => { L(xx, ys[0], xx, ys[ys.length - 1], 0.01); for (let i = 0; i < ys.length; i++) { L(xx + (ext > 0 ? -0.12 : 0.12), ys[i], ext, ys[i], 0.007); tick(xx, ys[i]); } for (let i = 0; i < ys.length - 1; i++) bars(xx - 0.26, (ys[i] + ys[i + 1]) / 2, 2, 0.8, INK, true); };
  dimH([0, 4, 6.4, 10.6, 12.4, 16], -1.2, -0.3); dimH([0, 16], -1.75, -1.2); dimH([0, 5.2, 9.4, 13, 16], 10.0, 9.4); dimV([0, 3.2, 9.1], -1.1, -0.2); dimV([0, 9.1], 17.0, 16.3);
  // axis bubbles
  const bubble = (cx, cy) => { x.fillStyle = '#f6f3ec'; x.beginPath(); x.arc(cx, cy, 0.3, 0, 7); x.fill(); x.strokeStyle = INK; x.lineWidth = 0.02; x.stroke(); bars(cx, cy, 1, 0.5); };
  for (const xx of [0, 4, 10.6, 16]) { L(xx, -2.4, xx, -0.1, 0.008, INK, [0.3, 0.1, 0.05, 0.1]); bubble(xx, -2.7); } for (const yy of [0, 3.2, 9.1]) { L(-0.1, yy, -2.3, yy, 0.008, INK, [0.3, 0.1, 0.05, 0.1]); bubble(-2.6, yy); }
  // room tags (abstract), section cuts, north arrow
  for (const [cx, cy] of [[2.6, 6.6], [7.3, 4.2], [11.2, 7.3], [14.5, 4.6], [8.5, 1.7], [5.2, 2.3], [14.2, 8.7], [11.5, 2.2]]) { bars(cx, cy + 0.9 > 9 ? cy - 0.9 : cy + 0.9, 2, 0.9); }
  L(2, 3.0, 2, 9.4, 0.02, INK, [0.5, 0.12, 0.1, 0.12]); x.fillStyle = INK; x.beginPath(); x.moveTo(2, 9.9); x.lineTo(1.78, 9.45); x.lineTo(2.22, 9.45); x.fill(); x.beginPath(); x.moveTo(2, 2.5); x.lineTo(1.78, 2.95); x.lineTo(2.22, 2.95); x.fill();
  x.restore();
  // ---- north arrow, scale bar, title block (px space)
  x.strokeStyle = INK; x.fillStyle = INK; x.lineWidth = 6; x.beginPath(); x.arc(3560, 520, 120, 0, 7); x.stroke(); x.beginPath(); x.moveTo(3560, 380); x.lineTo(3520, 560); x.lineTo(3560, 520); x.lineTo(3600, 560); x.closePath(); x.fill(); x.fillRect(3545, 690, 30, 60);
  for (let i = 0; i < 10; i++) { x.fillStyle = i % 2 ? '#f6f3ec' : INK; x.fillRect(2720 + i * 75, 2310, 75, 26); x.strokeRect(2720 + i * 75, 2310, 75, 26); }
  x.lineWidth = 5; x.strokeRect(2600, 2420, 1300, 380); x.beginPath(); x.moveTo(2600, 2540); x.lineTo(3900, 2540); x.moveTo(2600, 2660); x.lineTo(3900, 2660); x.moveTo(3300, 2420); x.lineTo(3300, 2800); x.stroke();
  x.fillStyle = INK; for (let i = 0; i < 9; i++) { x.fillRect(2630 + r() * 40, 2450 + i * 40 % 340 * 0 + (i % 3) * 35, 80 + r() * 380, 12); } x.fillRect(3330, 2450, 360, 26); x.fillRect(3330, 2500, 220, 14); x.fillRect(3330, 2570, 420, 20); x.fillRect(3330, 2690, 300, 18); x.fillRect(3330, 2740, 180, 14);
  x.beginPath(); x.arc(2740, 2730, 38, 0, 7); x.stroke(); x.beginPath(); x.moveTo(2700, 2730); x.lineTo(2780, 2730); x.moveTo(2740, 2690); x.lineTo(2740, 2770); x.stroke();
  // faint fold creases + age marks
  x.fillStyle = 'rgba(0,0,0,0.035)'; x.fillRect(W / 2 - 3, 0, 6, H); x.fillStyle = 'rgba(255,255,255,0.5)'; x.fillRect(W / 2 + 3, 0, 3, H);
  return canvas;
}
