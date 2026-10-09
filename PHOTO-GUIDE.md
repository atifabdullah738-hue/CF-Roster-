# Photo shot list — replace the illustrations with real photographs

The site currently ships **temporary illustrations** in every image slot (no real photographs could be downloaded when it was built). Replace them with real photographs of real Pakistani homes and construction work.

## How to swap (≈ 2 minutes)

1. Put your photos in one folder and **name each file exactly like its slot** (table below), e.g. `house-10marla-modern.jpg`.
2. Run:
   ```bash
   npm run photo -- ~/path/to/my-photos     # imports every correctly named file (resized to ≤ 3840 px WebP)
   npm run photo:status                      # shows which slots still use illustrations
   npm run build
   ```
3. A slot with a real photo automatically loses its "Illustration" badge, and the gallery disclaimer disappears once every slot has one.
4. Update the captions / titles in `src/data/projects.ts` and `src/data/services.ts` to match your real photo (and add `location` / `status: 'Completed' | 'Ongoing'` for real projects).

## Photo rules

- **Landscape, 4:3** for everything except the hero (16:9). Longest side **3000 px or more** (4K ideal); sharp, level horizon, good daylight (early morning / golden hour looks best).
- Shoot **your own projects**. If you use anyone else's photo you need written permission or a licence that allows commercial web use (for stock: Unsplash / Pexels / Pixabay licence, or Wikimedia Commons CC licences — attribution required for CC-BY).
- **Never** use images from other companies' websites, plan portals or design studios (watermarks like GHARPLANS.PK or ARCODESK = their copyright and branding).
- Don't present stock photos as "our completed projects" — that misleads customers. Use only genuine project photos under *Projects*; stock is fine for generic service/construction-process images.
- No visible number plates, neighbours' faces, or private details.

## Slots

### Hero & house exteriors (priority 1)
| File name | What to photograph |
| --- | --- |
| `hero-home` | **16:9.** Your best finished modern house, golden hour, wide shot; leave calm sky/lawn on the left (headline sits there) |
| `house-5marla-modern` | 5 Marla double-storey, straight-on front elevation |
| `house-5marla-contemporary` | 5 Marla contemporary facade (stone/wood/glass details) |
| `house-10marla-modern` | 10 Marla modern house, 3/4 front angle |
| `house-10marla-stone` | 10 Marla with stone cladding / double-height entrance |
| `house-1kanal-modern` | 1 Kanal modern villa with lawn |
| `house-1kanal-classical` | 1 Kanal classical / luxury villa |
| `house-traditional-arches` | Traditional style: arches, jharoka, brick, jali |
| `house-fusion-luxury` | Luxury traditional-meets-modern facade |
| `house-night-facade` | Any finished house at dusk with lights on |
| `house-rooftop-terrace` | Rooftop terrace / roof design |
| `house-corner-plot` | Corner-plot house showing two facades |

### Construction progress (priority 1)
| File name | What to photograph |
| --- | --- |
| `progress-grey-structure` | Grey structure: columns, slabs, brickwork, scaffolding |
| `progress-finishing` | Plastering / painting / window fitting stage |
| `progress-completed` | Finished, handover-ready home |

### Interiors (priority 2)
`interior-living-room`, `interior-bedroom`, `interior-kitchen`, `interior-bathroom`, `interior-dining` — finished rooms from your projects, wide-angle, tidy and well lit.

### Service images (priority 2) — real work photos, one per service
| File name | What to photograph |
| --- | --- |
| `svc-new-home` | A new house just completed or at roof stage |
| `svc-residential-building` | Multi-unit / multi-floor residential building |
| `svc-design-planning` | Plans being reviewed on site or at your desk (hands/paper only) |
| `svc-architectural-design` | A facade close-up, or a printed elevation beside the finished house |
| `svc-renovation` | A renovation before/after pair, or renovation in progress |
| `svc-maintenance` | Repair work: cracks, seepage fix, fittings |
| `svc-finishing` | Tiling / plaster / ceiling work |
| `svc-plumbing-electrical` | Concealed pipes / conduits before closing walls, distribution board |
| `svc-painting-waterproofing` | Painting or roof waterproofing in progress |
| `svc-kitchen-bathroom` | Finished kitchen or bathroom |
| `svc-grey-structure` | Rebar, shuttering, brickwork or roof casting |
| `svc-turnkey` | A finished home, handover-ready |

### Technical drawings (priority 3 — may stay as drawings)
`elevation-drawing`, `floor-plan` — these are blueprint-style *drawings*, not cartoon houses. Replace them with a real elevation / floor plan from one of **your own** projects, or leave them.
