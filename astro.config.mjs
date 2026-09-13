// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  // Your live domain. Used for the sitemap, RSS feed, and canonical URLs.
  site: 'https://dnathletic.com',
  integrations: [sitemap()],
});
