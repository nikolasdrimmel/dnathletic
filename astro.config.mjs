import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { unified } from '@astrojs/markdown-remark';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeNowrap from './src/plugins/rehype-nowrap.mjs';

// https://astro.build/config
export default defineConfig({
  // Your live domain. Used for the sitemap, RSS feed, and canonical URLs.
  site: 'https://dnathletic.com',
  integrations: [sitemap()],
  markdown: {
    // Astro 7 defaults to the Sätteri processor; LaTeX math needs the
    // remark/rehype (unified) pipeline.
    processor: unified({
      remarkPlugins: [remarkMath],
      // rehypeNowrap must run after KaTeX: it glues brackets/punctuation to the rendered formulas.
      rehypePlugins: [rehypeKatex, rehypeNowrap],
    }),
  },
});

