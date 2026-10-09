import { defineConfig } from 'astro/config';

// Set SITE_URL at build time (e.g. SITE_URL=https://www.asifbuilders.pk npm run build)
// so canonical / Open Graph URLs are correct. See README.md.
export default defineConfig({
  site: process.env.SITE_URL || 'https://asifbuilders.example',
  trailingSlash: 'ignore',
  build: { format: 'directory' },
  image: { service: { entrypoint: 'astro/assets/services/sharp' } },
});
