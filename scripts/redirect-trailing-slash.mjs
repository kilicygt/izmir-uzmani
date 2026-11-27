// Astro's Vercel adapter emits redirect routes as exact matches (^/old$), so the trailing-slash form
// that the site actually links to (/old/) would fall through to a 404. Widen each one to ^/old/?$.
import { readFileSync, writeFileSync } from 'node:fs';

const path = new URL('../.vercel/output/config.json', import.meta.url);
const config = JSON.parse(readFileSync(path, 'utf8'));
let changed = 0;
for (const route of config.routes ?? []) {
  const isRedirect = route.status >= 301 && route.status <= 308 && route.headers?.Location;
  if (isRedirect && route.src.endsWith('$') && !route.src.endsWith('/?$')) {
    route.src = route.src.replace(/\/?\$$/, '/?$');
    changed++;
  }
}
// Security headers for every response. The adapter writes the Build Output API config directly,
// so vercel.json "headers" would not apply; a leading continue route adds them to all routes.
const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-Frame-Options': 'SAMEORIGIN',
  'Permissions-Policy': 'camera=(), microphone=(), payment=(), geolocation=(self)',
};
config.routes = config.routes ?? [];
if (!config.routes.some((r) => r.headers?.['X-Content-Type-Options'])) {
  config.routes.unshift({ src: '/(.*)', headers: SECURITY_HEADERS, continue: true });
}

writeFileSync(path, JSON.stringify(config, null, 2));
console.log(`redirect-trailing-slash: widened ${changed} redirect route(s)`);
