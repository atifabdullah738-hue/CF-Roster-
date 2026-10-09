# 3D render toolkit (Asif Builders concept renders)

Original, computer-generated architectural renders (three.js, physically based materials, sun + sky lighting,
soft shadows, ambient occlusion, film grading) produced in headless Chromium (software WebGL, no GPU).
They are **concept renders, not photographs of real projects** and the website labels them as such.

```bash
node scripts/render.mjs <scene> <slot> [--w 3200 --h 2400] [--out DIR] [--png]
#   scene -> scripts/render/scenes/<scene>.mjs      slot -> output file name  src/assets/render/<slot>.webp
#   preview while iterating (small, to your own scratch dir, PNG so you can look at it with the Read tool):
node scripts/render.mjs my-scene my-slot --w 1280 --h 960 --out /tmp/claude-0/<you>/ --png
#   final (4:3 slots 3200x2400, hero 3840x2160) -> default out dir src/assets/render
node scripts/render.mjs my-scene my-slot --w 3200 --h 2400
```
A 1280x960 preview takes ~20 s, a 3200x2400 final 1–3 minutes. Other agents render at the same time: be patient, never
run more than one render at once yourself, and do iterate at low resolution.

## Scene file contract
`scripts/render/scenes/<name>.mjs`:
```js
import { THREE, T, boxAt, ... } from '../lib/arch.mjs';
import { setupEnvironment, archCamera } from '../lib/env.mjs';
import { hedge, bush, tree, palm } from '../lib/nature.mjs';
export default async function build({ renderer, w, h }) {
  const scene = new THREE.Scene();
  setupEnvironment({ renderer, scene, sunElevation, sunAzimuth, ... });
  /* ...model... */
  const camera = archCamera({ pos, target, focal, shift, w, h });
  return { scene, camera, exposure: 0.34, aoRadius: 0.8, grade: { contrast, saturation, vignette, grain, warm }, bloom: false };
}
```
Return options: `exposure` (tone-map exposure; ~0.3–0.45 daylight with sun 3.0/env 0.4), `ao:false`, `aoRadius`, `aoStrength`,
`bloom:true` (+`bloomStrength`, `bloomRadius`, `bloomThreshold` ~4–8; only for night/dusk glow), `grade:{contrast:1.12, saturation:1.06, vignette:0.28, grain:0.018, warm:0.03}`.

## Coordinates (metres)
+X right, +Y up, +Z towards the camera/street. A house front faces +Z with its front face at z = 0, depth goes to negative z.
Sun azimuth: 0° = from +Z (behind camera), 90° = from +X. Elevation in degrees (≤ 1° ≈ dusk/night sky).

## lib/textures.mjs (`T`) — materials (all world-scale; `tileM` = metres per texture tile)
`plaster(color,{tileM,seed})`, `concrete(color)`, `brick({color,mortar,tileM,rows,cols})`, `stone({color,tileM})`,
`wood({color,tileM,planks,gap})`, `tiles({color,grout,tileM,n,marble})`, `paving({color,n})`, `asphalt({wet})`, `grass({color})`,
`solid(color,{roughness,metalness})`, `metal(color)`, `glass({tint,env})`, `emissive(color,intensity)`. Pass a **different seed**
for each place you reuse a type so adjacent surfaces differ.

## lib/arch.mjs
`boxAt(x0,y0,z0,x1,y1,z1,mat,parent)` · `roundBox` · `cyl` · `ground(x0,z0,x1,z1,y,mat,parent)` ·
`wallWithOpenings(x0,x1,y0,y1,zBack,thickness,[{x,y,w,h}],mat,parent)` (real holes; front face at zBack+thickness) ·
`windowUnit({x,y,w,h,z,cols,rows,glow,curtain,frame,reveal})` (z = wall front face) · `doorUnit` · `slatGate` · `barGate` ·
`glassRailing` · `waterTank` · `solarPanels` · `acUnit` · `pillarLamp` · `planter` · `street({z0,z1,wet,parent})`.
Textures are mapped in world space, so adjacent boxes with the same material tile seamlessly.

## lib/env.mjs
`setupEnvironment({renderer,scene,sunElevation,sunAzimuth,turbidity,rayleigh,sunIntensity,sunColor,envIntensity,clouds,shadowExtent,shadowCenter})`
· `archCamera({pos,target,focal,shift,shiftX,w,h,keepLevel})` — `keepLevel` + `shift` keeps verticals parallel (architectural look; use it for exteriors).

## lib/nature.mjs
`hedge(x0,z0,x1,z1,{h,w,y,color,density,seed},parent)` · `bush(x,y,z,radius,parent,{color,seed})` · `tree(x,z,{h,crown,color,seed,lean},parent)` · `palm(x,z,{h,lean,seed},parent)`.

## NON-NEGOTIABLE quality rules
1. It must look like a professional **photoreal architectural visualisation** (think the best Lumion/Enscape/V-Ray stills of Pakistani
   houses). **No cartoon / toy / low-poly / flat-colour look.** Verify with the Read tool on your PNG preview and keep improving until you would
   believe it is a render from a real studio. Look hard for: clipped white walls, black shadows, floating objects, z-fighting, texture
   stretching, holes, empty dead areas, objects intersecting.
2. Real-world proportions: storey 3.0–3.4 m, door 2.1–2.4 m, windows 1.2–2.4 m wide, parapet 0.9–1.2 m, boundary wall 1.5–1.8 m,
   gate 1.8–2.2 m, kerb 0.15 m, car-porch 3 m wide. Build with depth (recesses, reveals, slab edges, sills, cornices, planters, downlights).
3. Surfaces are never perfectly clean: use different seeds, slightly different tints per volume, concrete/stone/wood/brick variety,
   visible joints, kerbs, drains, nameplates (BLANK — no readable text), plants, lights, AC units, water tanks.
4. Exposure: whites must not clip (aim for ~0.85–0.9 brightest walls); shadows must keep detail. Use sun + sky balance (sun 2.5–3.2, env 0.35–0.5, exposure
   0.3–0.45 for day). Dusk/night: low sun/negative elevation, `envIntensity` ~0.3–0.6, many warm emissive lights + a few PointLights, `bloom:true` with high threshold.
5. Camera like an architectural photographer: eye height 1.5–1.8 m, focal 24–35 mm, `keepLevel` + small `shift`, building fills 60–80 % of the frame,
   minimal empty road/sky, pleasing depth layers (foreground planting/kerb, house, trees behind, haze).
6. Pakistani context: flat roofs with parapets, rooftop water tanks, boundary walls and gates, pillar lamps, neem/eucalyptus/palm trees, kerbed streets,
   neighbouring houses of similar scale, AC condensers. No people, no brands, no readable text. No third-party watermarks. Everything is original.
7. Do NOT edit existing files in `scripts/render/lib/` or `harness.html` (other agents depend on them). Need something new? Add your own
   file `scripts/render/lib/<yourname>-*.mjs` or put helpers in your scene files. If you find a real bug in shared code, report it in your final message.
8. Only write: `scripts/render/scenes/<your scenes>`, `scripts/render/lib/<yourname>-*.mjs`, and the final outputs in `src/assets/render/`. No git commands.
