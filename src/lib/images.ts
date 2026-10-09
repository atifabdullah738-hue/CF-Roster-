import type { ImageMetadata } from 'astro';

const modules = import.meta.glob<{ default: ImageMetadata }>(
  '/src/assets/art/*.{svg,jpg,jpeg,png,webp,avif}',
  { eager: true },
);

const RASTER = /\.(jpe?g|png|webp|avif)$/i;
const registry = new Map<string, ImageMetadata>();

// Raster photos win over the bundled SVG illustration of the same base name,
// so owners can swap in real photos just by dropping a file in src/assets/art.
for (const [path, mod] of Object.entries(modules)) {
  const base = path.split('/').pop()!.replace(/\.[^.]+$/, '');
  if (!registry.has(base) || RASTER.test(path)) registry.set(base, mod.default);
}

export function art(name: string): ImageMetadata {
  const img = registry.get(name);
  if (!img) throw new Error(`Image "${name}" not found in src/assets/art/`);
  return img;
}

export const isRaster = (img: ImageMetadata) => RASTER.test(img.src.split('?')[0]) || img.format !== 'svg';
