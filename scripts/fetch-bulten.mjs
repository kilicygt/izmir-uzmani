// Builds today's "İzmir'de Bugün" bulletin from official sources only and writes src/data/bulten/YYYY-MM-DD.json.
// Sources: İzmir Büyükşehir Belediyesi news, ESHOT line announcements (open data), İZDENİZ announcements,
// Open-Meteo forecast and AFAD earthquakes. Every item keeps a link to its source.
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const OUT_DIR = path.join(ROOT, 'src/data/bulten');
const UA = 'Mozilla/5.0 (compatible; IzmirUzmaniBot/1.0; +https://izmiruzmani.com)';
const TZ = 'Europe/Istanbul';

const ymd = (d) => new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(d);
const today = ymd(new Date());
const daysAgo = (n) => ymd(new Date(Date.now() - n * 86_400_000));

async function get(url, as = 'text', tries = 4) {
  let lastErr;
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(45000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return as === 'json' ? await res.json() : await res.text();
    } catch (err) {
      lastErr = err;
      await new Promise((r) => setTimeout(r, 1500 * 2 ** i));
    }
  }
  throw new Error(`${url}: ${lastErr?.message}`);
}

const decode = (s) => s
  .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n))
  .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)))
  .replace(/&quot;/g, '"').replace(/&apos;|&#39;/g, "'").replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ');
const clean = (s) => decode(s.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
// "8 NO.LU HAT GEÇİCİ DURAK HİZMET DIŞI" → "8 No.lu hat geçici durak hizmet dışı"
const sentence = (s) => {
  const t = s.replace(/\s+/g, ' ').trim().toLocaleLowerCase('tr-TR').replace(/\bno\.lu\b/g, 'No.lu');
  return t.charAt(0).toLocaleUpperCase('tr-TR') + t.slice(1);
};

// Each source is optional: a failing source is logged and left empty, the rest of the bulletin still builds.
async function safe(name, fn, fallback) {
  try { return await fn(); } catch (err) { console.warn(`${name}: ${err.message}`); return fallback; }
}

// ── İzmir Büyükşehir Belediyesi news (title, date, spot) ─────────────────────
const izbb = await safe('izbb', async () => {
  const html = await get('https://www.izmir.bel.tr/tr/HaberArsivi/157');
  const items = [];
  for (const m of html.matchAll(/<div class="haberler-tab-box-description">([\s\S]*?)<a href="(\/tr\/Haberler\/[^"]+)"/g)) {
    const title = clean(m[1].match(/<h3>([\s\S]*?)<\/h3>/)?.[1] ?? '');
    const [d, mo, y] = (m[1].match(/<span>(\d{2})\.(\d{2})\.(\d{4})<\/span>/) ?? []).slice(1);
    const summary = clean(m[1].match(/<p>([\s\S]*?)<\/p>/)?.[1] ?? '');
    if (title && y) items.push({ title, date: `${y}-${mo}-${d}`, summary, url: `https://www.izmir.bel.tr${m[2]}` });
  }
  if (!items.length) throw new Error('no news parsed');
  // Today's and yesterday's news (morning bulletins would otherwise be nearly empty).
  return items.filter((n) => n.date >= daysAgo(1));
}, []);

// ── ESHOT line announcements (open data CSV) ─────────────────────────────────
const eshot = await safe('eshot', async () => {
  const csv = (await get('https://openfiles.izmir.bel.tr/211488/docs/eshot-otobus-hat-duyurulari.csv')).replace(/^﻿/, '');
  const [head, ...rows] = csv.split(/\r?\n/).filter(Boolean);
  const cols = head.split(';');
  const at = (r, k) => (r[cols.indexOf(k)] ?? '').trim();
  const now = new Date(new Date().toLocaleString('en-US', { timeZone: TZ }));
  const groups = new Map();
  for (const r of rows.map((l) => l.split(';'))) {
    const start = new Date(at(r, 'BASLAMA_TARIHI').replace(' ', 'T'));
    const end = new Date(at(r, 'BITIS_TARIHI').replace(' ', 'T'));
    if (!(start <= now && now <= end)) continue;
    const title = at(r, 'BASLIK');
    const g = groups.get(title) ?? { title: sentence(title), lines: [], start: at(r, 'BASLAMA_TARIHI').slice(0, 10), end: at(r, 'BITIS_TARIHI').slice(0, 10) };
    if (at(r, 'HAT_NO') && !g.lines.includes(at(r, 'HAT_NO'))) g.lines.push(at(r, 'HAT_NO'));
    groups.set(title, g);
  }
  return [...groups.values()]
    .map((g) => ({ ...g, isNew: g.start >= daysAgo(3) }))
    .sort((a, b) => (b.isNew - a.isNew) || b.start.localeCompare(a.start));
}, []);

// ── İZDENİZ announcements ────────────────────────────────────────────────────
const izdeniz = await safe('izdeniz', async () => {
  const json = await get('https://coreapi.izdeniz.com.tr/api/v1/announcements?version=1&isPublished=true&page=1&pageSize=10', 'json');
  return (json?.data?.data ?? [])
    .filter((a) => a.isActive !== false && a.title)
    .map((a) => ({ title: clean(a.title), date: ymd(new Date(a.publishedAt ?? a.createdAt)), url: `https://www.izdeniz.com.tr/tr/duyurular/${a.slug}` }))
    .filter((a) => a.date >= daysAgo(14));
}, []);

// ── Weather (Open-Meteo) ─────────────────────────────────────────────────────
const weather = await safe('weather', async () => {
  const j = await get('https://api.open-meteo.com/v1/forecast?latitude=38.42&longitude=27.14&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_max,windspeed_10m_max&timezone=Europe%2FIstanbul&forecast_days=1', 'json');
  const d = j.daily;
  return { code: d.weathercode[0], max: Math.round(d.temperature_2m_max[0]), min: Math.round(d.temperature_2m_min[0]), rain: d.precipitation_probability_max[0], wind: Math.round(d.windspeed_10m_max[0]) };
}, null);

// ── Earthquakes in İzmir province, last 24 hours (AFAD) ──────────────────────
const quakes = await safe('afad', async () => {
  const fmt = (d) => d.toISOString().slice(0, 19);
  const end = new Date(), start = new Date(end.getTime() - 86_400_000);
  const qs = new URLSearchParams({ start: fmt(start), end: fmt(end), minlat: '37.75', maxlat: '39.45', minlon: '25.9', maxlon: '28.5', minmag: '1', orderby: 'timedesc' });
  const list = await get(`https://servisnet.afad.gov.tr/apigateway/deprem/apiv2/event/filter?${qs}`, 'json');
  const izmir = list.filter((q) => q.province === 'İzmir');
  const big = [...izmir].sort((a, b) => Number(b.magnitude) - Number(a.magnitude))[0];
  return { count: izmir.length, max: big ? { mag: Number(big.magnitude), place: big.location } : null };
}, null);

// ── Today's events (already fetched daily from İzBB Kültürsanat into src/data/events.json) ──
const events = await safe('events', async () => {
  const data = JSON.parse(await readFile(path.join(ROOT, 'src/data/events.json'), 'utf8'));
  const out = [];
  for (const e of data.events) {
    const s = e.sessions.find((x) => ymd(new Date(x.start)) === today);
    if (s) out.push({ title: e.title, slug: e.slug, category: e.category.trim(), start: s.start, venue: s.venue, image: e.image, free: e.admission === 'free' || e.admission === 'free-ticket' });
  }
  return out.sort((a, b) => a.start.localeCompare(b.start));
}, []);

const bulletin = { date: today, generatedAt: new Date().toISOString(), weather, quakes, izbb, eshot, izdeniz, events };
await mkdir(OUT_DIR, { recursive: true });
await writeFile(path.join(OUT_DIR, `${today}.json`), JSON.stringify(bulletin, null, 2) + '\n');
console.log(`Bülten ${today}: ${izbb.length} haber, ${eshot.length} ESHOT duyurusu, ${izdeniz.length} İZDENİZ duyurusu, ${events.length} etkinlik`);
