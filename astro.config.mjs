import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Canonical / Open Graph URLs use SITE_URL (set it to your real address, e.g. https://asif-builders.pages.dev
// or https://www.yourdomain.pk). On Cloudflare Pages, CF_PAGES_URL is used as a fallback so previews still work.
const site = process.env.SITE_URL || process.env.CF_PAGES_URL || 'https://asifbuilders.example';

export default defineConfig({
  site,
  integrations: [sitemap({ filter: (page) => !page.endsWith('/404/') })],
  trailingSlash: 'ignore',
  build: { format: 'directory' },
  image: { service: { entrypoint: 'astro/assets/services/sharp' } },
});
