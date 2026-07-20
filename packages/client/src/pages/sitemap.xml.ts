import type { APIRoute } from 'astro';
import { SITE_URL } from '../data/profile';

// Static single-page portfolio: the homepage ('') is the only route under
// src/pages/. Add an entry here if a real page is ever introduced — each loc is
// resolved against SITE_URL so the domain stays defined in one place (data/profile.ts).
const ROUTES = [''];

// Prerendered at build time (output: 'static'), so this emits a plain
// dist/sitemap.xml alongside index.html — no server needed.
export const GET: APIRoute = () => {
  const urls = ROUTES.map(
    (path) => `  <url>\n    <loc>${new URL(path, SITE_URL).href}</loc>\n  </url>`,
  ).join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
