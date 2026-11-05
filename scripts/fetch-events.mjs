import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import sharp from 'sharp';

const API = 'https://kultursanatapi.izmir.bel.tr/api';
const SITE = 'https://kultursanat.izmir.bel.tr';
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const DATA_FILE = path.join(ROOT, 'src/data/events.json');
const IMG_DIR = path.join(ROOT, 'public/images/etkinlikler/otomatik');
const UA = 'Mozilla/5.0 (compatible; IzmirUzmaniBot/1.0; +https://izmiruzmani.com)';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchWithRetry(url, as = 'json', tries = 5) {
  let lastErr;
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': UA, Accept: as === 'json' ? 'application/json' : '*/*' }, signal: AbortSignal.timeout(30000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return as === 'json' ? await res.json() : Buffer.from(await res.arrayBuffer());
    } catch (err) {
      lastErr = err;
      await sleep(2000 * 2 ** i);
    }
  }
  throw new Error(`${url}: ${lastErr?.message}`);
}

// Same slug rule the municipality site uses for its own /event/:name/:id URLs.
const sourceSlug = (s) => (s ?? '').toString().normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()
  .replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');

const TR = { ç: 'c', ğ: 'g', ı: 'i', i: 'i', ö: 'o', ş: 's', ü: 'u', â: 'a', î: 'i', û: 'u' };
const slugify = (s) => s.toLocaleLowerCase('tr-TR').replace(/[çğıiöşüâîû]/g, (c) => TR[c])
  .normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 70).replace(/-$/, '');

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', rsquo: '’', lsquo: '‘', rdquo: '”', ldquo: '“', hellip: '…', ndash: '–', mdash: '—' };
function htmlToParagraphs(html) {
  if (!html) return [];
  return html
    .replace(/<\s*br\s*\/?>/gi, '\n')
    .replace(/<\/\s*(p|div|li|h\d)\s*>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n))
    .replace(/&([a-z]+);/gi, (m, n) => ENTITIES[n.toLowerCase()] ?? m)
    .split(/\r?\n/)
    .map((l) => l.replace(/[\t ]+/g, ' ').trim())
    .filter(Boolean);
}

const KNOWN_VENUES = [
  'Aziz Vukolos Kilisesi Kültür Merkezi', 'Ahmed Adnan Saygun Sanat Merkezi', 'Elhamra Sahnesi',
  'Bornova Küçük Park', 'Bostanlı', 'Kültürpark', 'Konak Metro Sanat Galerisi',
];
const norm = (s) => s.toLocaleLowerCase('tr-TR');
function findVenue(lines) {
  for (const l of lines) {
    const m = l.match(/(?:^|\s)(?:📍\s*)?(?:yer|mekân|mekan)\s*[:：]\s*(.+)$/i) || l.match(/^📍\s*(.+)$/u);
    if (m) return m[1].replace(/\s*(saat|tarih)\s*[:：].*$/i, '').trim();
  }
  const text = norm(lines.join(' '));
  return KNOWN_VENUES.find((v) => text.includes(norm(v))) ?? null;
}

// The API returns Turkey local time without an offset.
const withTz = (d) => (d ? `${d.slice(0, 19)}+03:00` : null);

async function saveImage(event) {
  if (!event.imageUrl) return null;
  const hash = createHash('sha1').update(event.imageUrl).digest('hex').slice(0, 8);
  const file = `${event.id.slice(0, 8)}-${hash}.webp`;
  const existing = await readdir(IMG_DIR).catch(() => []);
  if (!existing.includes(file)) {
    const buf = await fetchWithRetry(event.imageUrl, 'buffer', 3);
    await sharp(buf).rotate().resize({ width: 1200, withoutEnlargement: true }).webp({ quality: 80 }).toFile(path.join(IMG_DIR, file));
  }
  return file;
}

async function mapLimit(items, limit, fn) {
  const out = new Array(items.length);
  let next = 0;
  await Promise.all(Array.from({ length: limit }, async () => {
    while (next < items.length) {
      const i = next++;
      out[i] = await fn(items[i]);
    }
  }));
  return out;
}

const list = (await fetchWithRetry(`${API}/Event/List`)).data;
if (!Array.isArray(list) || list.length === 0) throw new Error('Event list is empty');

await mkdir(IMG_DIR, { recursive: true });

// The API only lists current events, so finished ones are kept from our own archive.
const previous = new Map(
  (JSON.parse(await readFile(DATA_FILE, 'utf8').catch(() => '{"events":[]}')).events ?? []).map((e) => [e.id, e]),
);

const mergeSessions = (a, b) => {
  const byStart = new Map([...a, ...b].map((s) => [s.start, s]));
  return [...byStart.values()].sort((x, y) => x.start.localeCompare(y.start)).slice(-60);
};

const fresh = (await mapLimit(list, 4, async (item) => {
  let detail = null;
  try {
    detail = (await fetchWithRetry(`${API}/event/detail?eventId=${item.id}`)).data;
  } catch (err) {
    console.warn(`detail failed, using list data: ${item.name} (${err.message})`);
  }

  const enabled = (detail?.sessions ?? []).filter((s) => !s.isDisabled);
  let sessions = enabled
    .map((s) => ({ start: withTz(s.eventDate), end: withTz(s.eventEndDate || s.eventDate), venue: s.venue?.name?.trim() || null }));
  if (sessions.length === 0 && item.nextSessionStartDate) {
    sessions = [{ start: withTz(item.nextSessionStartDate), end: withTz(item.nextSessionEndDate || item.nextSessionStartDate), venue: null }];
  }
  if (sessions.length === 0) return null;

  let image = null;
  try {
    image = await saveImage(item);
  } catch (err) {
    console.warn(`image failed: ${item.name} (${err.message})`);
  }

  const summary = htmlToParagraphs(item.shortDescription ?? detail?.shortDescription);
  const body = htmlToParagraphs(detail?.longDescription ?? item.longDescription);
  const title = item.name.replace(/\s+/g, ' ').trim();
  const textVenue = findVenue([...summary, ...body]);
  for (const s of sessions) s.venue ??= textVenue;

  const old = previous.get(item.id);
  // The municipality's own site treats session types 1 and 2 as free.
  // 0 = Ücretli, 1 = Ücretsiz Biletli, 2 = Ücretsiz Serbest Giriş, 3 = Sadece AASSM (box office)
  const types = enabled.map((s) => s.sessionType);
  const admission = types.length === 0 ? old?.admission ?? null
    : types.every((t) => t === 2) ? 'free'
    : types.every((t) => t === 1 || t === 2) ? 'free-ticket'
    : 'paid';
  return {
    id: item.id,
    // Keep the first URL an event got, so links and search results stay valid if the title changes.
    slug: old?.slug ?? `${slugify(title)}-${item.id.slice(0, 6)}`,
    title,
    category: item.categories?.[0]?.name ?? 'Etkinlik',
    organizer: item.company?.name ?? null,
    ageLimit: item.ageLimit || null,
    admission,
    image: image ? `/images/etkinlikler/otomatik/${image}` : old?.image ?? item.imageUrl ?? null,
    summary,
    body,
    sessions: mergeSessions(old?.sessions ?? [], sessions),
    sourceUrl: `${SITE}/event/${sourceSlug(item.name)}/${item.id}`,
    sourceName: 'İzmir Büyükşehir Belediyesi Kültürsanat',
  };
})).filter(Boolean);

if (fresh.length === 0) throw new Error('No events after processing');

const merged = new Map(previous);
for (const e of fresh) merged.set(e.id, e);
const events = [...merged.values()].sort((a, b) => a.sessions[0].start.localeCompare(b.sessions[0].start));

const keep = new Set(events.map((e) => e.image?.startsWith('/images/etkinlikler/otomatik/') && path.basename(e.image)).filter(Boolean));
for (const f of await readdir(IMG_DIR)) if (!keep.has(f)) await rm(path.join(IMG_DIR, f));

await writeFile(DATA_FILE, JSON.stringify({ fetchedAt: new Date().toISOString(), source: SITE, events }, null, 2) + '\n');
console.log(`Saved ${events.length} events (${fresh.length} from API, ${events.length - fresh.length} archived)`);
