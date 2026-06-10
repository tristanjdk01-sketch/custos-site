// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import vercel from '@astrojs/vercel';

export default defineConfig({
  site: 'https://custosza.com',
  output: 'static',
  adapter: vercel(),
  vite: {
    plugins: [tailwindcss()],
  },
});
