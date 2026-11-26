import { defineConfig } from 'astro/config';

// Projet GitHub Pages : https://blomig.github.io/patrimoine-sud-touraine/
// Quand un nom de domaine propre remplacera cette adresse, mettre `base` à '/'
// et `site` au nouveau domaine, puis adapter les URL du CMS (public/admin/config.yml).
export default defineConfig({
  site: 'https://blomig.github.io',
  base: '/patrimoine-sud-touraine',
  trailingSlash: 'always',
  build: {
    format: 'directory',
  },
  redirects: {
    '/documents/bournan-cartes-postales-bourg/': '/patrimoine-sud-touraine/documents/bournan-cartes-postales/',
    '/documents/bournan-carte-postale-forges-bonnefoy/': '/patrimoine-sud-touraine/documents/bournan-cartes-postales/',
    '/documents/bossee-carte-postale-hotel-du-commerce/': '/patrimoine-sud-touraine/documents/bossee-cartes-postales/',
  },
});
