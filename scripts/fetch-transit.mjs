import { mkdir, writeFile, readFile } from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const OUT = path.join(ROOT, 'src/data/ulasim');
const API = 'https://openapi.izmir.bel.tr/api';
const UA = 'Mozilla/5.0 (compatible; IzmirUzmaniBot/1.0; +https://izmiruzmani.com)';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function get(url, as = 'json', tries = 5) {
  let lastErr;
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(60000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return as === 'json' ? await res.json() : await res.text();
    } catch (err) {
      lastErr = err;
      await sleep(1500 * 2 ** i);
    }
  }
  throw new Error(`${url}: ${lastErr?.message}`);
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

const TR = { ç: 'c', ğ: 'g', ı: 'i', i: 'i', ö: 'o', ş: 's', ü: 'u', â: 'a', î: 'i', û: 'u' };
const slugify = (s) => s.toLocaleLowerCase('tr-TR').replace(/[çğıiöşüâîû]/g, (c) => TR[c])
  .normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const hm = (t) => (t ?? '').trim().slice(0, 5);
// Service runs past midnight; keep 00:xx–03:xx departures at the end of the day.
const dayOrder = (t) => (t < '04:00' ? `2${t}` : `1${t}`);
const sortTimes = (arr) => [...new Set(arr.filter(Boolean))].sort((a, b) => dayOrder(a).localeCompare(dayOrder(b)));

function parseCsv(text, sep = ';') {
  const rows = [];
  let row = [], field = '', quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"') quoted = true;
    else if (c === sep) { row.push(field); field = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(field); rows.push(row); row = []; field = '';
    } else field += c;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  const [head, ...data] = rows.filter((r) => r.some((f) => f.trim()));
  return data.map((r) => Object.fromEntries(head.map((h, i) => [h.trim(), (r[i] ?? '').trim()])));
}

const titleCase = (s) => s.toLocaleLowerCase('tr-TR').replace(/(^|[\s(/.-])(\p{L})/gu, (m, p, l) => p + l.toLocaleUpperCase('tr-TR'));

async function bus() {
  const [hatlar, saatler] = await Promise.all([
    get('https://openfiles.izmir.bel.tr/211488/docs/eshot-otobus-hatlari.csv', 'text').then(parseCsv),
    get('https://openfiles.izmir.bel.tr/211488/docs/eshot-otobus-hareketsaatleri.csv', 'text').then(parseCsv),
  ]);
  const byLine = new Map();
  for (const r of saatler) {
    const s = byLine.get(r.HAT_NO) ?? { 1: { gidis: [], donus: [] }, 2: { gidis: [], donus: [] }, 3: { gidis: [], donus: [] } };
    const day = s[r.TARIFE_ID];
    if (!day) continue;
    day.gidis.push(hm(r.GIDIS_SAATI));
    day.donus.push(hm(r.DONUS_SAATI));
    byLine.set(r.HAT_NO, s);
  }
  const lines = hatlar
    .filter((h) => byLine.has(h.HAT_NO))
    .map((h) => {
      const s = byLine.get(h.HAT_NO);
      for (const d of Object.values(s)) { d.gidis = sortTimes(d.gidis); d.donus = sortTimes(d.donus); }
      return {
        no: h.HAT_NO,
        name: titleCase(h.HAT_ADI),
        route: titleCase(h.GUZERGAH_ACIKLAMA),
        note: h.ACIKLAMA || null,
        from: titleCase(h.HAT_BASLANGIC),
        to: titleCase(h.HAT_BITIS),
        schedule: s,
      };
    })
    .sort((a, b) => a.no.localeCompare(b.no, 'tr', { numeric: true }));
  if (lines.length < 100) throw new Error(`only ${lines.length} bus lines`);
  return { lines };
}

async function ferry() {
  const piers = (await get(`${API}/izdeniz/iskeleler`)).filter((p) => p.AktifMi);
  const out = await mapLimit(piers, 3, async (p) => {
    const days = {};
    for (let gun = 1; gun <= 7; gun++) {
      const data = await get(`${API}/izdeniz/iskelesefersaatleri/${p.IskeleId}/${gun}`);
      days[gun] = (data.seferler ?? [])
        .map((s) => ({
          time: hm(s.KalkisSaati),
          to: (s.VarisYerleri ?? []).map((v) => v.iskeleAdi).filter(Boolean),
          car: !!s.arabaliVapurSeferi,
          note: s.Aciklama?.trim() || null,
          cancelled: !!s.IptalMi,
        }))
        .sort((a, b) => dayOrder(a.time).localeCompare(dayOrder(b.time)));
    }
    return { id: p.IskeleId, name: p.Adi.trim(), slug: slugify(p.Adi), carFerry: !!p.ArabaliVapurIskelesiMi, lat: p.Enlem, lng: p.Boylam, days };
  });
  return { piers: out.filter((p) => Object.values(p.days).some((d) => d.length)) };
}

async function izban() {
  const stations = (await get(`${API}/izban/istasyonlar`)).sort((a, b) => a.IstasyonSirasi - b.IstasyonSirasi);
  // The API lists stations from Selçuk (south) to Aliağa (north); a neighbour query returns every train in that direction.
  const times = async (from, to) => (from && to ? sortTimes((await get(`${API}/izban/sefersaatleri/${from.IstasyonId}/${to.IstasyonId}`)).map((x) => hm(x.HareketSaati))) : []);
  const out = await mapLimit(stations, 3, async (s) => {
    const i = stations.indexOf(s);
    const [north, south] = [await times(s, stations[i + 1]), await times(s, stations[i - 1])];
    return { id: s.IstasyonId, name: s.IstasyonAdi.trim(), slug: slugify(s.IstasyonAdi), lat: +s.Enlem, lng: +s.Boylam, north, south };
  });
  const date = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Istanbul' }).format(new Date());
  return { date, northEnd: stations.at(-1).IstasyonAdi, southEnd: stations[0].IstasyonAdi, stations: out };
}

const freq = (rows) => {
  const by = { 1: [], 2: [], 3: [] };
  for (const r of rows) by[r.TarifeId]?.push({ from: hm(r.BaslangicSaati), to: hm(r.BitisSaati), every: r.Aralik });
  for (const k of Object.keys(by)) by[k].sort((a, b) => dayOrder(a.from).localeCompare(dayOrder(b.from)));
  return by;
};

async function metro() {
  const [stations, rows] = await Promise.all([get(`${API}/metro/istasyonlar`), get(`${API}/metro/sefersaatleri`)]);
  return {
    stations: stations.filter((s) => s.AktifMi).sort((a, b) => a.Sira - b.Sira).map((s) => s.Adi.trim()),
    frequencies: freq(rows),
  };
}

async function tram() {
  const hatlar = await get(`${API}/tramvay/hatlar`);
  const lines = await mapLimit(hatlar, 3, async (h) => ({
    id: h.HatId,
    name: h.Adi.replace(/\s+/g, ' ').trim(),
    direction: h.Aciklama.replace(/\s+/g, ' ').trim(),
    from: h.HatBaslangic?.trim() ?? null,
    to: h.HatBitis?.trim() ?? null,
    frequencies: freq(await get(`${API}/tramvay/seferler/${h.HatId}`)),
  }));
  return { lines };
}

await mkdir(OUT, { recursive: true });
const metaFile = path.join(OUT, 'meta.json');
const meta = JSON.parse(await readFile(metaFile, 'utf8').catch(() => '{}'));
const jobs = { otobus: bus, vapur: ferry, izban, metro, tramvay: tram };
const failed = [];

for (const [name, job] of Object.entries(jobs)) {
  try {
    const data = await job();
    await writeFile(path.join(OUT, `${name}.json`), JSON.stringify(data) + '\n');
    meta[name] = new Date().toISOString();
    console.log(`${name}: ok`);
  } catch (err) {
    failed.push(name);
    console.warn(`${name}: failed, keeping previous data (${err.message})`);
  }
}

await writeFile(metaFile, JSON.stringify(meta, null, 2) + '\n');
if (failed.length) {
  console.error(`Failed: ${failed.join(', ')}`);
  process.exitCode = 1;
}
