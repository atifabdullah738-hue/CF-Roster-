import type { ImageMetadata } from 'astro';
import placeholder from '../assets/placeholder.svg';

// Priority for each slot name:  real photo (src/assets/art/<slot>.jpg|png|webp|avif)
//                             > 3D concept render (src/assets/render/<slot>.webp)
//                             > bundled SVG illustration (src/assets/art/<slot>.svg)
const mods = import.meta.glob<{ default: ImageMetadata }>('/src/assets/{art,render}/*.{svg,jpg,jpeg,png,webp,avif}', { eager: true });

export type ImageKind = 'photo' | 'render' | 'illustration';
const RASTER = /\.(jpe?g|png|webp|avif)$/i;
const registry = new Map<string, { img: ImageMetadata; kind: ImageKind; rank: number }>();

for (const [path, mod] of Object.entries(mods)) {
  const base = path.split('/').pop()!.replace(/\.[^.]+$/, '');
  const isRender = path.includes('/assets/render/');
  const kind: ImageKind = isRender ? 'render' : RASTER.test(path) ? 'photo' : 'illustration';
  const rank = kind === 'photo' ? 3 : kind === 'render' ? 2 : 1;
  const cur = registry.get(base);
  if (!cur || rank > cur.rank) registry.set(base, { img: mod.default, kind, rank });
}

export function art(name: string): ImageMetadata {
  const e = registry.get(name);
  if (!e) { console.warn(`[images] "${name}" not found in src/assets/{art,render}/ — using placeholder.`); return placeholder; }
  return e.img;
}
export const artKind = (name: string): ImageKind => registry.get(name)?.kind ?? 'illustration';
export const isRaster = (img: ImageMetadata) => RASTER.test(img.src.split('?')[0]) || img.format !== 'svg';
