// Fetches İzmir's disaster assembly areas (afet ve acil durum toplanma alanları) from İzBB open data
// and writes src/data/toplanma.json. The list rarely changes, so this runs monthly.
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { ILCELER } from '../src/lib/eczane-core.mjs';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const OUT = path.join(ROOT, 'src/data/toplanma.json');
const CSV = 'https://openfiles.izmir.bel.tr/100104/docs/izbb-afet-ve-acil-durum-toplanma-alanlari.csv';
const UA = 'Mozilla/5.0 (compatible; IzmirUzmaniBot/1.0; +https://izmiruzmani.com)';

async function get(url, tries = 5) {
  let lastErr;
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(90000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.text();
    } catch (err) {
      lastErr = err;
      await new Promise((r) => setTimeout(r, 1500 * 2 ** i));
    }
  }
  throw new Error(`${url}: ${lastErr?.message}`);
}

// This dataset is typed with proper Turkish letters, so plain Turkish lower-casing is right here.
const title = (s) => s.replace(/\s+/g, ' ').trim().toLocaleLowerCase('tr-TR')
  .replace(/(^|[\s(/.-])(\p{L})/gu, (_, p, c) => p + c.toLocaleUpperCase('tr-TR'));

const fold = (x) => x.toLocaleUpperCase('tr-TR').replace(/İ/g, 'I');
const ilceByFold = Object.fromEntries(Object.keys(ILCELER).map((n) => [fold(n), n]));

const text = (await get(CSV)).replace(/^﻿/, '');
const [head, ...lines] = text.split(/\r?\n/).filter(Boolean);
const cols = head.split(';');
const at = (row, k) => (row[cols.indexOf(k)] ?? '').trim();

const areas = lines.map((l) => l.split(';')).map((r) => {
  const ilce = ilceByFold[fold(at(r, 'ILCE'))];
  const lat = parseFloat(at(r, 'ENLEM')), lng = parseFloat(at(r, 'BOYLAM'));
  if (!ilce || !Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  // "1 NO LU AFET VE ACİL DURUM TOPLANMA ALANI" → "1 No'lu Toplanma Alanı"
  const num = at(r, 'ADI').match(/^(\d+)\s*NO/i)?.[1];
  const name = num ? `${num} No’lu Toplanma Alanı` : title(at(r, 'ADI'));
  const street = [title(at(r, 'YOL')), at(r, 'KAPINO') ? `No: ${at(r, 'KAPINO')}` : ''].filter(Boolean).join(' ');
  return { i: ilce, m: title(at(r, 'MAHALLE')), n: name, s: street, la: +lat.toFixed(6), lo: +lng.toFixed(6) };
}).filter(Boolean)
  .sort((a, b) => a.i.localeCompare(b.i, 'tr') || a.m.localeCompare(b.m, 'tr') || a.n.localeCompare(b.n, 'tr', { numeric: true }));

if (areas.length < 1000) throw new Error(`Only ${areas.length} areas parsed; refusing to overwrite`);
await mkdir(path.dirname(OUT), { recursive: true });
await writeFile(OUT, JSON.stringify({ fetchedAt: new Date().toISOString(), source: CSV, areas }) + '\n');
console.log(`${areas.length} assembly areas in ${new Set(areas.map((a) => a.i)).size} districts`);
