// Fetches today's on-duty pharmacies (nöbetçi eczaneler) from İzmir Büyükşehir Belediyesi open data
// and writes src/data/eczane.json. Duty shifts change at 08:00, so this runs shortly after.
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { normalizePharmacies } from '../src/lib/eczane-core.mjs';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const OUT = path.join(ROOT, 'src/data/eczane.json');
const URL_ = 'https://openapi.izmir.bel.tr/api/ibb/nobetcieczaneler';
const UA = 'Mozilla/5.0 (compatible; IzmirUzmaniBot/1.0; +https://izmiruzmani.com)';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function get(url, tries = 5) {
  let lastErr;
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(60000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      lastErr = err;
      await sleep(1500 * 2 ** i);
    }
  }
  throw new Error(`${url}: ${lastErr?.message}`);
}

const raw = await get(URL_);
if (!Array.isArray(raw) || raw.length === 0) throw new Error('Empty pharmacy list');
const { dutyStart, pharmacies } = normalizePharmacies(raw);
await mkdir(path.dirname(OUT), { recursive: true });
await writeFile(OUT, JSON.stringify({ fetchedAt: new Date().toISOString(), dutyStart, source: URL_, pharmacies }, null, 2) + '\n');
console.log(`${pharmacies.length} pharmacies, duty from ${dutyStart}`);
