# Asif Builders — Website

A fast, accessible, fully responsive marketing website for **Asif Builders**, built with [Astro](https://astro.build) (static output, no runtime framework). It has 7 pages, 12 service sections, a filterable project gallery with a lightbox, and a validated inquiry form.

| Page | Route |
| --- | --- |
| Home | `/` |
| About Us (mission, vision, leadership) | `/about` |
| Services (12 services, each with an inquiry button) | `/services` |
| Projects Gallery (filters + lightbox) | `/projects` |
| Our Process | `/process` |
| Testimonials (placeholders) | `/testimonials` |
| Contact (numbers, form, location) | `/contact` |

---

## Run it locally

Requires **Node.js 22.12 or newer** (see `.nvmrc`).

```bash
npm install
npm run dev          # http://localhost:4321 — live reload
npm run build        # production build into ./dist
npm run preview      # serve the production build locally
npm run lint         # astro check (type + template diagnostics)
npm run check:links  # after a build: every link, anchor, image, tel: and WhatsApp link
npm run test:e2e     # after a build: browser tests (needs Chrome; set CHROME_PATH if not auto-detected)
npm test             # lint + build + link check + browser tests
```

`npm run test:e2e` drives a real browser against `dist/` at phone/tablet/desktop widths: console + network errors, images,
page titles/metadata, accessibility (axe-core), navigation, mobile menu, gallery filters + lightbox, the inquiry form
(validation, the honest "not sent" fallback, and success/failure handling against a **mocked** endpoint — it never contacts a real service)
and call/WhatsApp links.

## Deploy (free) — Cloudflare Pages

Step-by-step beginner instructions, correct settings, limits and costs: **[DEPLOY-CLOUDFLARE.md](DEPLOY-CLOUDFLARE.md)**.
Short version: framework **Astro**, build command **`npm run build`**, output directory **`dist`**, env vars `NODE_VERSION=22.12.0`
and `SITE_URL=https://<your-project>.pages.dev`. The site is 100 % static (no server code), so any static host also works.

## What you must configure (nothing below is invented)

| Item | Where | Status |
| --- | --- | --- |
| **Contact-form backend** | `PUBLIC_FORM_ENDPOINT` (+ `PUBLIC_FORM_ACCESS_KEY` for Web3Forms) — see `.env.example` and DEPLOY-CLOUDFLARE.md | **Not configured.** Without it the form validates input but does **not** claim delivery — it tells the visitor the inquiry has not been sent and offers a pre-filled WhatsApp message instead. To receive inquiries by email, create a free form at [Formspree](https://formspree.io) (or Web3Forms, Getform, Netlify Forms, your own API…) and put its URL in `PUBLIC_FORM_ENDPOINT`. The form POSTs JSON and treats any 2xx reply as success. |
| **CEO phone number** | `src/data/site.ts` → `leadership[0]` | Confirmed: `0300 4337882` (+92 300 4337882). Call and WhatsApp links are active. |
| **CEO name** | `src/data/site.ts` | Confirmed by the owner: **Muhammad Asif Waheed** (CEO). Used everywhere automatically. |
| **WhatsApp** | automatic | Links are generated only for confirmed, complete numbers (Muhammad Asif Waheed `0300 4337882` and Abdullah Asif `0322 9373709`). The floating WhatsApp button uses Abdullah Asif; change `whatsappPerson` in `src/data/site.ts` to switch. |
| **Business address** | `src/data/site.ts` → `address` | `null` → pages show a neutral "address coming soon" message. Fill in `{ lines: [...], city: '...' }` and it appears in the footer, contact page and search-engine data. |
| **Map** | `PUBLIC_MAP_EMBED_URL` | In Google Maps: Share → Embed a map → copy the `src="..."` URL. |
| **Email / hours / social links** | `src/data/site.ts` | Hidden until you provide them. |
| **Real project photos** | see below | Gallery images are **concept renders** (labelled as such), not real projects. |
| **Real testimonials** | `src/data/testimonials.ts` | Placeholders, clearly labelled. |

> Written copy on the About page (mission, vision, philosophy, values) and the Process / Services descriptions is general draft text. It contains **no** invented years of experience, project counts, awards or qualifications — please review and adjust it to match your business.

---

## Images — how they work and how to replace them

No photo libraries were reachable while building and photos must not be copied without permission, so every image slot ships with an **original, code-generated 3D concept render** (`src/assets/render/*.webp`, 3200×2400 px; hero 3840×2160), produced by a custom three.js pipeline in `scripts/render/` (see `scripts/render/README.md`; re-render with `node scripts/render.mjs <scene> <slot>`). The two blueprint drawings (`elevation-drawing`, `floor-plan`) remain SVG drawings in `src/assets/art/`.

**These are computer-generated visuals, not photographs of real Asif Builders projects**, and the gallery labels them **"Concept render"**. For a trustworthy business site, replace them with your own project photos as they become available.

Priority for each slot: **real photo** (`src/assets/art/<slot>.jpg|png|webp`) → **concept render** (`src/assets/render/<slot>.webp`) → placeholder. The earlier SVG illustrations are archived in `archive/illustrations/` (not part of the build). Importing a real photo automatically takes over the slot and removes the "Concept render" badge.

**Which photo goes where: see [PHOTO-GUIDE.md](PHOTO-GUIDE.md).**

**Fastest way to add real photos / 4K images** (resizes to max 3840 px WebP and installs it into the right slot):

```bash
npm run photo:list                                   # shows every slot name
npm run photo -- ~/Downloads/my-10-marla.jpg house-10marla-modern
npm run build
```

The "Concept render" badge and disclaimer disappear automatically for any slot that now holds a real photo. Large images are served responsively (480 → 3840 px) and the lightbox opens a 2560 px version.

> **Only use images you own or are licensed to use.** Renders found on other companies' websites (e.g. watermarked images from design studios or plan portals) must not be used — that is copyright infringement and would show another business's branding on yours. Good sources: your own project photos; renders produced by *your* architect / 3D visualiser (get written permission to publish); or properly licensed stock (check the licence).

**Manual alternatives**, either:
1. Drop the photo into `src/assets/art/` with the **same base name** as the illustration (e.g. `house-10marla-modern.jpg`). Photos automatically win over the concept render of the same name, and Astro creates optimised responsive WebP versions. **or**
2. Add a new entry in `src/data/projects.ts` and point `image` at your new file name.

Then set `illustrative: false` (removes the "Illustration" badge) and optionally `status: 'Completed' | 'Ongoing'` and `location`. Recommended: landscape photos, 1800 px wide or larger. Only use photos you own or have written permission/licence to use (your own projects, or properly licensed stock such as Unsplash/Pexels with their licence terms respected).

Hero image: `hero-home` · service images: `svc-*` · interiors: `interior-*`.

---

## Editing content

Everything lives in `src/data/` — no HTML editing needed:

- `site.ts` – company name, leaders, phone numbers, address, navigation
- `services.ts` – the 12 services (text, scope bullets, images)
- `projects.ts` – gallery items, categories, captions
- `process.ts` – the process steps
- `testimonials.ts` – testimonials (set `placeholder: false` for real ones)

Colours and fonts are CSS variables at the top of `src/styles/global.css`.

## Project structure

```
src/
  components/   Header, Footer, ProjectGallery (filters + lightbox), InquiryForm, cards …
  data/         all editable content
  layouts/      Layout.astro (SEO, JSON-LD, skip-link, scroll animations)
  lib/          phone/WhatsApp helpers, image registry
  pages/        index, about, services, projects, process, testimonials, contact, 404
  assets/render/ concept renders (replace with photos by dropping files into assets/art/)
  assets/art/   real photos (when you add them) + the two blueprint drawings
archive/        earlier SVG illustrations (kept, not built)
scripts/        art generators + link checker
```

## Accessibility & performance

Skip link, semantic landmarks, visible focus, keyboard-operable menu / filters / lightbox (←, →, Esc), labelled form fields with `aria-live` errors, reduced-motion support, native lazy loading, responsive optimised raster images, self-hosted fonts, zero third-party scripts.
