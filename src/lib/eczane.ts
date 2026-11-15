import data from '../data/eczane.json';
import { ILCELER, ilceSlug } from './eczane-core.mjs';

export { ILCELER, ilceSlug };
export const eczane = data;

export const ilceList = Object.keys(ILCELER).sort((a, b) => a.localeCompare(b, 'tr'));
export const countIn = (ilce: string) => data.pharmacies.filter((p) => p.ilceler.includes(ilce)).length;

const start = () => new Date(`${(data.dutyStart ?? data.fetchedAt).slice(0, 19)}+03:00`);
const f = (d: Date, o: Intl.DateTimeFormatOptions) => d.toLocaleDateString('tr-TR', { timeZone: 'Europe/Istanbul', ...o });
export const dutyLabel = () => {
  const s = start(), e = new Date(s.getTime() + 86_400_000);
  const o: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', weekday: 'long' };
  return `${f(s, o)} 08:00 – ${f(e, o)} 08:00`;
};
export const dutyShort = () => f(start(), { day: 'numeric', month: 'long', year: 'numeric' });

// Nearest districts by centre point, for "yakındaki ilçeler" links.
export const nearbyIlce = (ilce: string, n = 5) => {
  const [a, b] = ILCELER[ilce as keyof typeof ILCELER];
  return ilceList.filter((x) => x !== ilce)
    .map((x) => ({ x, d: (ILCELER[x as keyof typeof ILCELER][0] - a) ** 2 + (ILCELER[x as keyof typeof ILCELER][1] - b) ** 2 }))
    .sort((p, q) => p.d - q.d).slice(0, n).map((p) => p.x);
};

export const pharmacyJsonLd = (list: typeof data.pharmacies, pageUrl: string, name: string) => ({
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name,
  url: pageUrl,
  itemListElement: list.map((p, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    item: {
      '@type': 'Pharmacy',
      name: p.name,
      address: { '@type': 'PostalAddress', streetAddress: p.address, addressLocality: p.ilceler[0] ?? 'İzmir', addressRegion: 'İzmir', addressCountry: 'TR' },
      ...(p.phone ? { telephone: p.phone.tel } : {}),
      ...(p.lat != null ? { geo: { '@type': 'GeoCoordinates', latitude: p.lat, longitude: p.lng } } : {}),
    },
  })),
});
